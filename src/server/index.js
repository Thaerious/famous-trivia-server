// noinspection JSCheckFunctionSignatures

import Express from 'express';
import http from 'http';
import helmet from 'helmet';
import UserAgent from 'express-useragent';                // Request source machine details
import cors from './mechanics/cors.js';
import BodyParser from 'body-parser';                     // Extract JSON from non-rendering endpoints
import GameManagerEndpoint from './game/GameManagerEndpoint.js';
import GameManager from "./game/GameManager.js";
import CLI from './CLI.js';
import WebSocket from 'ws';
import SessionManager from "./mechanics/SessionManager.js";
import ejs from 'ejs';
import Path from 'path';
import Connection from "./game/Connection.js";
import NidgetPreprocessor from "./mechanics/NidgetPreprocessor.js";
import JITBrowserify from "./mechanics/JITBrowserify.js";
import config from "../config.js";
import ReportCoverage from "./mechanics/ReportCoverage.js";
import ParseArgs from "@thaerious/parseargs";
import clean from "../clean.js";
import setupDB from "./game/setupDB.js";

await setupDB(config.server.db.dir, config.server.db.name, config.server.db.script_full_path);

const port = config.server.port;
const app = Express();
const index = http.createServer(app);
const gameManager = await new GameManager();
const sessionManager = new SessionManager(Path.join(config.server.db.dir, config.server.db.name));
await sessionManager.load();
const nidgetPreprocessor = new NidgetPreprocessor(config.server.ejs_nidgets, config.server.nidget_scripts).setup();

app.use(helmet());            // automatic security settings (outgoing response headers)
app.use(UserAgent.express()); // used to determine what the connection is using (phone,browser etc)

const flags = new ParseArgs().loadOptions().run().flags;

if (process.env.NODE_ENV === 'test') console.log("Test Mode");

if (flags['help']){
    console.log("index.js [opts]");
    console.log("\n");
    console.log("Options:");
    console.log("-b,\t--browserify\tGenerate .js & .html files on startup");
    console.log("-r,\t--render\tGenerate .js & .html files then exit");
    console.log("-j,\t--jit\t\tGenerate .js & .html files on demand");
    console.log("-i,\t\t\tStartup in interactive mode");
    console.log("\t--clean\t\tRemove all generated files, do not run index.");
    console.log("--ta,\t\t\tTime to answer");
    console.log("--tb,\t\t\tTime to buzz in");
    console.log("--tm,\t\t\tTime for multi-choice round");
    process.exit();
}

if (flags['clean']){
    clean();
    process.exit();
}

if (flags['render']){
    await JITBrowserify.render(nidgetPreprocessor);
    process.exit();
}

/** Apply session manager **/
app.use('/*.ejs', sessionManager.middleware);
app.use('/game-manager-service', sessionManager.middleware);
/** -------------------------------------------------- **/

/** non-rendering end-points **/
    // called from host.js, launch_console.js
    app.use("/game-manager-service", BodyParser.json());
    app.use("/game-manager-service", new GameManagerEndpoint(gameManager, sessionManager).middleware);

    app.use("/report-coverage", BodyParser.json({limit: '50mb'}));
    app.use("/report-coverage", new ReportCoverage().middleware);
/** -------------------------------------------------- **/

/** page rendering end-points **/
    app.use("/*.ejs", cors);
    app.get("/*.html", cors);
    app.use(Express.static(config.server.public_html));
/** -------------------------------------------------- **/

/** template engine setup
 * http://expressjs.com/en/guide/using-template-engines.html
 * https://ejs.co/
 * https://github.com/mde/ejs/wiki/Using-EJS-with-Express
*/

/** Browserify & EJS Just-In-Time Transpiler **/
if (flags['jit']) {
    app.get(config.server.jit_path, new JITBrowserify(nidgetPreprocessor).middleware);

    app.set('view engine', 'ejs');

    app.get('*.ejs', (req, res) => {
        let nidgetDependencies = nidgetPreprocessor.getTemplateDependencies(config.server.ejs_root + req.path);
        res.render(`pages/${req.path}`, {
            filename: Path.basename(req.path.slice(0, -4)),
            nidgets : nidgetDependencies
        });
    });
} else {
    app.get(config.server.jit_path, Express.static(config.server.public_scripts));
    app.get("*.ejs", Express.static(config.server.pre_ejs,
        {
            setHeaders : (res, path, stat) => res.setHeader('Content-Type', 'text/html')
        }
    ));
}

if (flags['browserify']){
    await JITBrowserify.render(nidgetPreprocessor);
}
/** -------------------------------------------------- **/

/** Game Web Socket **/
const wss = new WebSocket.Server({server: index, path: "/game-service.ws"});
wss.on('connection', async (ws, req) => {
    await sessionManager.applyTo(req);

    try {
        new Connection(ws, req, gameManager);
    } catch (err) {
        console.log(err);
        console.log("ERROR: " + err.message);
        let msg = {
            action: "error",
            text: err.message
        }
        ws.send(JSON.stringify(msg));
    }
});
/** -------------------------------------------------- **/

/** Start the index **/
index.listen(port, () => {
    console.log(`HTTP listener started on port ${port}`);
});

if (flags['i']) {
    new CLI(gameManager, sessionManager);
}
/** -------------------------------------------------- **/

