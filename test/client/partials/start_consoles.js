/**
 * Start the host and contestant consoles.
 */

import clipboardy from "clipboardy";
import assert from "assert";
import connectContestant from "./connectContestant.mjs";

export default async function(gameEnv){
    describe(`start the host and contestant consoles.`, async () => {
        describe(`retrieve the contestant link`, async () => {
            it(`wait for the busy box to disappear`, async () => {
                await gameEnv.host.page.waitForSelector("#busy-box", {visible: true});
                await gameEnv.host.page.waitForSelector("#busy-box", {hidden: true});
            });

            it(`click the copy contestant link button`, async () => {
                await gameEnv.host.browser.defaultBrowserContext().overridePermissions('http://localhost:8000/launch_console.ejs', ['clipboard-read', 'clipboard-write']);
                await gameEnv.host.page.waitForSelector("#busy-box", {hidden: true}); // don't know why this in needed again
                await gameEnv.host.page.waitForSelector("#contestant", {visible: true});
                await gameEnv.host.page.click("#contestant");
            });

            it(`retrieve the link`, async () => {
                await gameEnv.host.page.evaluate(async () => {
                    await navigator.clipboard.readText();
                });
                let link = clipboardy.readSync();
                const indexOf = link.indexOf("contestant_join.ejs?hash=");
                assert.notStrictEqual(indexOf, -1);
                gameEnv.contestant_link = link;
            });
        });

        describe(`launch the host portal`, async () => {
            it(`click the host portal button`, (done) => {
                gameEnv.host.browser.once("targetcreated", async (target) => {
                    const pages = await gameEnv.host.browser.pages();
                    gameEnv.host_portal.page = await target.page();
                    const indexOf = gameEnv.host_portal.page.target().url().indexOf("host_portal.ejs");
                    assert.notStrictEqual(indexOf, -1);
                    done();
                });

                gameEnv.host.page.click("#button-container #host");
            });

            it(`host portal has start button`, async () => {
                const start_button = gameEnv.host_portal.page.$("#start");
                assert.notStrictEqual(start_button, null);
            });
        });

        describe(`connect 4 contestants`, async () => {
            it(`first contestant connects`, async () => {
                gameEnv.players[0] = await connectContestant(gameEnv.contestant_link, "Adam");
                await gameEnv.host_portal.page.waitForSelector("shadow/player-container [data-name]");
            });

            it(`host has correct first player`, async () => {
                const element = await gameEnv.host_portal.page.$("shadow/player-container [data-name]");
                const name = await gameEnv.host_portal.page.$eval("shadow/player-container [data-name]", el => el.getAttribute("data-name"));
                assert.strictEqual(name, "ADAM");
            });

            it(`first player has correct first player`, async () => {
                const element = await gameEnv.players[0].page.$("shadow/player-container [data-name]");
                const name = await gameEnv.players[0].page.$eval("shadow/player-container [data-name]", el => el.getAttribute("data-name"));
                assert.strictEqual(name, "ADAM");
            });

            it(`second contestant connects`, async () => {
                gameEnv.players[1] = await connectContestant(gameEnv.contestant_link, "Beth");
            });

            it(`third contestant connects`, async () => {
                gameEnv.players[2] = await connectContestant(gameEnv.contestant_link, "Chuck");
            });

            it(`fourth contestant connects`, async () => {
                gameEnv.players[3] = await connectContestant(gameEnv.contestant_link, "Dianne");
            });
        });
    });
}