// noinspection DuplicatedCode
import launch_using_google from "./partials/launch_using_google.js";
import play_mock_game from "./partials/play_mock_game.js";
import gameEnv from "./partials/prequel.js";

describe("log into google and play a normal game", async ()=> {
    await describe("launch_using_google", async () => await launch_using_google(gameEnv));

    describe("play", async () => {
        await play_mock_game(gameEnv)
    });
});


