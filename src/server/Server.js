// noinspection JSCheckFunctionSignatures

import config from "../config.js";
import JITRender from "./mechanics/JITRender.js";
import ReportCoverage from "./mechanics/ReportCoverage.js";
import Connection from "./game/Connection.js";
import cors from "./mechanics/cors.js";

import Path from "path";
import Express from "express";
import http from "http";
import BodyParser from "body-parser";
import helmet from "helmet";
import UserAgent from "express-useragent";
import WebSocket from "ws";


import Logger from './Logger.js';
const logger = Logger.getLogger();

class Server {

    /**
     * @param sessionManager
     * @param gameManager
     * @param gameManagerEndpoint
     * @param nidgetPreprocessor
     * @param cors
     * @param jitFlag
     */
    constructor(sessionManager, gameManager, gameManagerEndpoint, nidgetPreprocessor, cors, jitFlag = false) {
        this.app = Express();
        this.index = http.createServer(this.app);

        this.setupExternals();
        this.setupSessionManagerEndpoint(sessionManager);
        this.setupGameManagerEndpoint(sessionManager, gameManagerEndpoint);
        this.setupReportCoverageEndpoint();
        this.setupPageRenderingEndpoints(cors);
        this.setupJIT(nidgetPreprocessor, jitFlag);
        this.setupWebsocket(sessionManager, gameManager, gameManagerEndpoint);
    }

    start(port) {
        /** Start the index **/
        this.index.listen(port, () => {
            console.log(`HTTP listener started on port ${port}`);
        });
    }

    stop(cb = () => {}) {
        console.log("Stopping server");
        this.index.close(cb);
    }

    setupExternals() {
        this.app.use(helmet());            // automatic security settings (outgoing response headers)
        this.app.use(UserAgent.express()); // used to determine what the connection is using (phone,browser etc)
    }

    setupSessionManagerEndpoint(sessionManager) {
        this.app.use('/*.ejs', sessionManager.middleware);
        this.app.use('/game-manager-service', sessionManager.middleware);
    }

    setupGameManagerEndpoint(sessionManager, gameManagerEndpoint) {
        this.app.use("/game-manager-service", BodyParser.json());
        this.app.use("/game-manager-service", gameManagerEndpoint.middleware);
    }

    setupReportCoverageEndpoint() {
        this.app.use("/report-coverage", BodyParser.json({limit: '50mb'}));
        this.app.use("/report-coverage", new ReportCoverage().middleware);
    }

    setupPageRenderingEndpoints() {
        this.app.use("*", (req, res)=>{
            Logger.channel("verbose").log(req);
        });
        
        this.app.get("", cors);
        this.app.get('/', (req, res) => {
            res.sendFile('index.html', {root: "./public/html/static/"});
        });
        this.app.use("/*.ejs", cors);
        this.app.get("/*.html", cors);
        this.app.use(Express.static(config.server.public_html));
    }

    setupJIT(nidgetPreprocessor, jitFlag) {
        if (jitFlag) {
            this.app.get(config.server.jit_path, new JITRender(nidgetPreprocessor).middleware);

            this.app.set('view engine', 'ejs');

            this.app.get('*.ejs', (req, res) => {
                nidgetPreprocessor.setup();
                let nidgetDependencies = nidgetPreprocessor.getTemplateDependencies(config.server.ejs_root + req.path);
                res.render(`pages/${req.path}`, {
                    filename: Path.basename(req.path.slice(0, -4)),
                    nidgets: nidgetDependencies
                });
            });
        } else {
            this.app.get(config.server.jit_path, Express.static(config.server.public_scripts));
            this.app.get("*.ejs", Express.static(config.server.pre_ejs,
                {
                    setHeaders: (res, path, stat) => res.setHeader('Content-Type', 'text/html')
                }
            ));
        }
    }

    setupWebsocket(sessionManager, gameManager, gameManagerEndpoint) {
        const wss = new WebSocket.Server({server: this.index, path: "/game-service.ws"});
        wss.on('connection', async (ws, req) => {
            await sessionManager.applyTo(req);

            try {
                console.log("ws.on.connection");
                await new Connection(ws, req, gameManager, gameManagerEndpoint).connect();
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
    }
}

export default Server;