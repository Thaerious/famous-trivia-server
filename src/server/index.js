// noinspection JSCheckFunctionSignatures

import cors from './mechanics/cors.js';
import GameManager from "./game/GameManager.js";
import CLI from './CLI.js';
import SessionManager from "./mechanics/SessionManager.js";
import Path from 'path';
import NidgetPreprocessor from "./mechanics/NidgetPreprocessor.js";
import JITRender from "./mechanics/JITRender.js";
import config from "../config.js";
import ParseArgs from "@thaerious/parseargs";
import clean from "../clean.js";
import setupDB from "./game/setupDB.js";
import Server from "./Server.js";
import GameManagerEndpoint from "./game/GameManagerEndpoint.js";
import NameValidator from "./game/NameValidator.js";
import verify from "./mechanics/verify.js";

await setupDB(config.server.db.dir, config.server.db.name, config.server.db.script_full_path);

const gameManager = await new GameManager();
const sessionManager = new SessionManager(Path.join(config.server.db.dir, config.server.db.name));
await sessionManager.load();
const gameManagerEndpoint = new GameManagerEndpoint(gameManager, new NameValidator(), verify);
const nidgetPreprocessor = new NidgetPreprocessor(config.server.ejs_nidgets, config.server.nidget_scripts).setup();

const flags = new ParseArgs().loadOptions().run().flags;

if (process.env.NODE_ENV === 'test') console.log("Test Mode");

if (flags['help']){
    console.log("index.js [opts]");
    console.log("\n");
    console.log("Options:");
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
    await JITRender.render(nidgetPreprocessor);
    process.exit();
}

if (flags['i']) {
    new CLI(gameManager, sessionManager);
}

gameManager.timeAnswer = flags['ta'];
gameManager.timeBuzz = flags['tb'];
gameManager.timeMultipleChoice = flags['tm'];

const server = new Server(sessionManager, gameManager, gameManagerEndpoint, nidgetPreprocessor, cors, flags['jit']);
server.start(config.server.port);
