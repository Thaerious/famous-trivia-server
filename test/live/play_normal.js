// noinspection DuplicatedCode
import launch from "./partials/launch.js";
import play_normal from "./partials/play_normal.js";
import gameEnv from "./partials/prequel.js";

describe("play normal game", async ()=> {
    await describe("launch", async () => await launch(gameEnv));

    describe("play", async () => {
        await play_normal(gameEnv)
    });
});


