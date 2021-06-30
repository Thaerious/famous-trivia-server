import fs from "fs";
import Path from "path";
import GameManager from "../../../src/server/game/singleInstance/GameManager.js";
import SessionManager from "../../../src/server/mechanics/SessionManager.js";
import config from "../../../src/config.js";
import GameManagerEndpoint from "../../../src/server/game/singleInstance/GameManagerEndpoint.js";
import NidgetPreprocessor from "../../../src/server/mechanics/NidgetPreprocessor.js";
import cors from "../../../src/server/mechanics/cors.js";
import Server from "../../../src/server/Server.js";
import puppeteer from "puppeteer";

async function launch(gameEnv) {
    describe("Launch server and browse to host page", async()=> {
        it(`start singular host server`, async () => {
            const gameDescriptionModel = await fs.readFileSync("test/data/demonstration-game.json");
            const gameManager = await new GameManager();
            const sessionManager = new SessionManager(Path.join(config.server.db.dir, config.server.db.name));
            await sessionManager.load();
            const gameManagerEndpoint = new GameManagerEndpoint(gameManager, sessionManager);
            const nidgetPreprocessor = new NidgetPreprocessor(config.server.ejs_nidgets, config.server.nidget_scripts).setup();

            gameManager.load(gameDescriptionModel.toString());
            gameManager.timeAnswer = 5;
            gameManager.timeBuzz = 5;
            gameManager.timeMultipleChoice = 15;

            gameEnv.server = new Server(sessionManager, gameManager, gameManagerEndpoint, nidgetPreprocessor, cors, false);
            gameEnv.server.start(8000);
        });

        it(`browse to host page`, async () => {
            gameEnv.host.browser = await puppeteer.launch({headless: false});
            const pages = await gameEnv.host.browser.pages();
            gameEnv.host.page = pages[0];
            await gameEnv.host.page.goto("http://localhost:8000/launch_console.ejs");
        });
    });
};

export default launch;
