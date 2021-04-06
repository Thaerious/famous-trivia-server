import Express from 'express';
import http from 'http';
import helmet from 'helmet';
import UserAgent from 'express-useragent';
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
import path from 'path';

const port = 8000;
const app = Express();
const server = http.createServer(app);
const gameManager = await new GameManager("assets/trivia.db").connect();;
const sessionManager = new SessionManager("assets/sessions.db");

new CLI(gameManager);
app.use(helmet()); // automatic security settings
app.use(UserAgent.express()); // used to determine what the connection is using (phone,browser etc)

app.use('/contestant_join.html', sessionManager.middleware);
app.use('/host_portal.ejs', sessionManager.middleware);

// app.post('/login-action', function (req, res) {
//     let name = req.body["name"].trim();
//     let msg = checkName(name);
//
//     if (!msg) {
//         let hash = sessionManager.addSession(name);
//         res.setHeader('Content-Type', 'application/json');
//         res.cookie(sessionCookieName, hash);
//         res.json(`{"action":"success"}`);
//         res.end();
//     }else{
//         res.status(401);
//         res.setHeader('Content-Type', 'application/json');
//         res.json(msg);
//         res.end();
//     }
// });

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
/** ------------------------- **/

/* template engine setup */
/* http://expressjs.com/en/guide/using-template-engines.html */
/* https://ejs.co/ */
/* https://github.com/mde/ejs/wiki/Using-EJS-with-Express */

app.set('view engine', 'ejs');

app.get('*.ejs', (req, res) => {
    res.render(`pages/${req.path}`, {
        filename : path.basename(req.path.slice(0, -4))
    });
});

const wss = new WebSocket.Server({ server:server, path:"/game-service.ws"});
wss.on('connection', (ws, req) =>{
    let cookies = new Cookies(req.headers.cookie);

    if (!cookies.has(sessionCookieName)){
        ws.close();
    } else {
        let hash = cookies.get(sessionCookieName);
        let name = sessionManager.getName(hash);

        try {
            new Connection(ws, req, game, sessionManager).join(name);
        } catch (err) {
            console.log("ERROR: " + err.message);
            let msg = {
                action : "error",
                text   : err.message
            }
            ws.send(JSON.stringify(msg));
        }
    }
});

app.use(Express.static('public'));

server.listen(port, () => {console.log(`HTTP listener started on port ${port}`)});

class Cookies{
    constructor(string) {
        this.cookies = {};
        let rawCookies = string.split('; ');
        rawCookies.forEach(raw=>{
            let keyValue = raw.split("=");
            this.cookies[keyValue[0]] = keyValue[1];
        });
    }

    get(key){
        return this.cookies[key];
    }

    has(key){
        return this.cookies[key] !== undefined;
    }
}

function checkName(name){
    let msg = {action : "error"}

    if (!name || name.trim().length === 0){
        msg.text = "Empty name not permitted";
        return JSON.stringify(msg);
    }

    if (sessionManager.hasName(name)){
        msg.text = "Name already in use";
        return JSON.stringify(msg);
    }

    if (name.length > 16){
        msg.text = "Name must be 16 character or less";
        return JSON.stringify(msg);
    }

    if (name.length < 2){
        msg.text = "Name must be 2 character or more";
        return JSON.stringify(msg);
    }

    return undefined;
}