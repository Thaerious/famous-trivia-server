// noinspection JSCheckFunctionSignatures

import Express from 'express';
import http from 'http';
import helmet from 'helmet';
import UserAgent from 'express-useragent';                // Request source machine details
import cors from './cors.js';
import BodyParser from 'body-parser';                     // Extract JSON from non-rendering endpoints
import connectHost from './connectHost.js';
import GameManagerEndpoint from './GameManagerEndpoint.js';
import GameManager from "./GameManager.js";
import CLI from './CLI.js';
import WebSocket from 'ws';
import SessionManager from "./SessionManager.js";
import ejs from 'ejs';
import Path from 'path';
import Connection from "./Connection.js";
import NidgetPreprocessor from "./NidgetPreprocessor.js";
import JITBrowserify from "./JITBrowserify.js";

import fs from 'fs';

const port = 8000;
const app = Express();
const server = http.createServer(app);
const gameManager = await new GameManager("assets/trivia.db");
const sessionManager = new SessionManager("assets/trivia.db");
await sessionManager.load();
const nidgetPreprocessor = new NidgetPreprocessor("views/nidgets").setup();

app.use(helmet());            // automatic security settings (outgoing response headers)
app.use(UserAgent.express()); // used to determine what the connection is using (phone,browser etc)

/** Apply session manager **/
app.use('/host_portal.ejs', sessionManager.middleware);
app.use('/contestant_portal.ejs', sessionManager.middleware);
app.use('/game-manager-service', sessionManager.middleware);
/** -------------------------------------------------- **/

/** non-rendering end-points **/
    // called from host.js, launch_console.js
    app.use("/game-manager-service", BodyParser.json());
    app.use("/game-manager-service", new GameManagerEndpoint(gameManager, sessionManager).middleware);

    // verifies the host and marks the cookie with {role : "host"}
    app.use('/connect-host', sessionManager.middleware);
    app.use("/connect-host", BodyParser.json());
    app.use("/connect-host", connectHost(gameManager));
/** -------------------------------------------------- **/

/** page rendering end-points **/
    app.use("/*.ejs", cors);
    app.get("/*.html", cors);
    app.use(Express.static('public'));
/** -------------------------------------------------- **/

/** template engine setup
 * http://expressjs.com/en/guide/using-template-engines.html
 * https://ejs.co/
 * https://github.com/mde/ejs/wiki/Using-EJS-with-Express
*/
    app.set('view engine', 'ejs');

    app.get('*.ejs', (req, res) => {
        let nidgetDependencies = nidgetPreprocessor.getDependencies("./views/pages/" + req.path);
        res.render(`pages/${req.path}`, {
            filename: Path.basename(req.path.slice(0, -4)),
            nidgets : nidgetDependencies
        });
    });
/** -------------------------------------------------- **/

/** Browserify Just-In-Time Transpiler **/
if (process.argv.indexOf("--jit") !== -1) {
    app.get('/jit/*.js', new JITBrowserify(nidgetPreprocessor).middleware);
} else {
    await preBrowserify();
    app.get('/jit/*.js', Express.static('public/scripts/'));
}
/** -------------------------------------------------- **/

/** Game Web Socket **/
const wss = new WebSocket.Server({server: server, path: "/game-service.ws"});
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

/** Start the server **/
server.listen(port, () => {
    console.log(`HTTP listener started on port ${port}`);
});

if (process.argv.indexOf("-i") !== -1) {
    new CLI(gameManager, sessionManager);
}
/** -------------------------------------------------- **/

async function preBrowserify(){
    let files = fs.readdirSync("views/pages");
    let jit = new JITBrowserify(nidgetPreprocessor);
    if (!fs.existsSync("./public/scripts/jit/")){
        fs.mkdirSync("./public/scripts/jit/");
    }

    for (let file of files){
        let name = file.substr(0, file.length - 4);
        const jsFilePath = "./src/client/" + name + ".js";
        const htmlFilePath = "./views/pages/" + name + ".ejs";
        const outfile = Path.join("./public/scripts/jit/", name + ".js");

        const stream = fs.createWriteStream(outfile);
        stream.write("// generated by JITBrowserify on " + new Date().toLocaleString() + "\n");
        await jit.syncBrowserify(jsFilePath, htmlFilePath, stream);
    }
}