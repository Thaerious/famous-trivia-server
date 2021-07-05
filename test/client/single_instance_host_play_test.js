// noinspection DuplicatedCode,JSUnresolvedVariable

import launch from "./partials/launch_single_instance_host.js";
import gameEnv from "./partials/prequel.js";
import start_consoles from "./partials/start_consoles.js";
import play_mock_game from "./partials/play_mock_game.js";
import finish_jeopardy_round from "./partials/finish_jeopardy_round.js";

await describe("launch", async () => await launch(gameEnv));

await describe("start consoles", async () => await start_consoles(gameEnv));

await describe("play mock game", async () => await play_mock_game(gameEnv));

// describe("go to next round, then return this round", async () => {
//     it(`host starts the game`, async () => {
//         await gameEnv.host_portal.page.click("#start");
//     });
//     it("click on the menu", async () => {
//         await gameEnv.host_portal.page.waitForSelector("#menu-container");
//         await gameEnv.host_portal.page.click("#menu-container");
//     });
//     it("click next round", async () => {
//         await gameEnv.host_portal.page.waitForSelector("shadow/#menu-next");
//         await gameEnv.host_portal.page.click("shadow/#menu-next");
//     });
//     it("click prev round", async () => {
//         await gameEnv.host_portal.page.waitForSelector("shadow/#menu-prev");
//         await gameEnv.host_portal.page.click("shadow/#menu-prev");
//     });
// });

// describe("finish jeopardy", async ()=>await finish_jeopardy_round(gameEnv));

// describe("terminate instances", ()=>{
//     it("shut down contestants", ()=>{
//         gameEnv.players[0].browser.close();
//         gameEnv.players[1].browser.close();
//         gameEnv.players[2].browser.close();
//         gameEnv.players[3].browser.close();
//         gameEnv.host.browser.close();
//         gameEnv.server.stop(()=>process.exit());
//     });
// });

