// noinspection DuplicatedCode
import launch_using_google from "./partials/launch_using_google.js";
import play_mock_game from "./partials/play_mock_game.js";
import gameEnv from "./partials/prequel.js";
import start_consoles from "./partials/start_consoles.js";

describe("log into google and play a normal game", async ()=> {
    await describe("launch using google", async () => await launch_using_google(gameEnv));

    await describe("start consoles", async () => await start_consoles(gameEnv));

    await describe("play mock game", async () => await play_mock_game(gameEnv));
});


