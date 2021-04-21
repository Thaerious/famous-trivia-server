// noinspection JSCheckFunctionSignatures

import Express from 'express';
import http from 'http';
import helmet from 'helmet';
import UserAgent from 'express-useragent';                    // Request source machine details
import cors from './cors.js';
import BodyParser from 'body-parser';
import launcher from './launcher.js';
import connectHost from './connectHost.js';
import gameManagerService from './gameManagerService.js';
import GameManager from "./GameManager.js";
import CLI from './CLI.js';
import WebSocket from 'ws';
import SessionManager from "./SessionManager.js";
import ejs from 'ejs';
import Path from 'path';
import Connection from "./Connection.js";
import NidgetPreprocessor from "./NidgetPreprocessor.js";
import JITBrowserify from "./JITBrowserify.js";

const port = 8000;
const app = Express();
const server = http.createServer(app);
const gameManager = await new GameManager("assets/trivia.db");
gameManager.connect();
const sessionManager = new SessionManager("assets/trivia.db");
await sessionManager.load();
const nidgetPreprocessor = new NidgetPreprocessor("views/nidgets").setup();

new CLI(gameManager, sessionManager);
app.use(helmet()); // automatic security settings
app.use(UserAgent.express()); // used to determine what the connection is using (phone,browser etc)
app.use('/host_portal.ejs', sessionManager.middleware);

/** non-rendering end-points **/
// launch a new game, called from host.js
app.use("/launch", BodyParser.json());
app.use("/launch", launcher(gameManager));

// called from host.js, launch_console.js
app.use("/game-manager-service", BodyParser.json());
app.use("/game-manager-service", gameManagerService(gameManager));

// verifies the host and marks the cookie with {role : "host"}
app.use('/connect-host', sessionManager.middleware);
app.use("/connect-host", BodyParser.json());
app.use("/connect-host", connectHost(gameManager));
/** ------------------------- **/

/** page rendering end-points **/
app.use("/*.ejs", cors);
app.get("/*.html", cors);
app.use(Express.static('public'));
/** ------------------------- **/

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
/** ------------------------- **/

/** Browserify Just-In-Time Transpiler **/
    app.get('/jit/*.js', new JITBrowserify(nidgetPreprocessor).middleware);
/** ------------------------- **/

server.listen(port, () => {
    console.log(`HTTP listener started on port ${port}`)
});