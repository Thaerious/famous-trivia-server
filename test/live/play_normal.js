// noinspection DuplicatedCode
import launch from "./partials/launch.js";
import play_mock_game from "./partials/play_mock_game.js";
import gameEnv from "./partials/prequel.js";

describe("play normal game", async ()=> {
    await describe("launch", async () => await launch(gameEnv));

    describe("play", async () => {
        await play_mock_game(gameEnv)
    });
});


