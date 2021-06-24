// noinspection DuplicatedCode
import launch from "./partials/launch.js";
import play_normal from "./partials/play_normal.js";
import globals from "./partials/prequel.js";


describe("play normal game", async ()=> {
    describe("launch", async () => await launch(globals));

    describe("play", async () => {
        await play_normal(globals)
    });
});


