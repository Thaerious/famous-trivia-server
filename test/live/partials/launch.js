// noinspection DuplicatedCode

import assert from 'assert';
import login from './login.js';
import clipboardy from "clipboardy";
import connectContestant from "./connectContestant.mjs";
import puppeteer from "puppeteer";

async function launch(gameEnv) {

    describe(`login and launch game`, async () => {
        it(`login to google`, async () => {
            console.log(gameEnv.args.flags["url"]);
            console.log(gameEnv.args.flags["email"]);
            console.log(gameEnv.args.flags["password"]);
            gameEnv.host = await login(gameEnv.args.flags["url"], gameEnv.args.flags["email"], gameEnv.args.flags["password"]);
        });

        it(`wait for enabled launch button`, async () => {
            await gameEnv.host.page.waitForSelector("#button-container #launch:not(.disabled)");
        });

        it(`click the launch button`, async () => {
            await gameEnv.host.page.click("#button-container #launch");
        });

        it(`wait for the file list dialog to appear`, async () => {
            await gameEnv.host.page.waitForSelector("file-list", {visible: true});
        });

        it(`wait for the busy box to disappear`, async () => {
            await gameEnv.host.page.waitForSelector("#file-list-busy", {hidden: true});
        });

        it(`close the file list dialog`, async () => {
            await gameEnv.host.page.click("#file-list-close");
        });

        it(`wait for the file list dialog to disappear`, async () => {
            await gameEnv.host.page.waitForSelector("file-list", {hidden: true});
        });

        it(`click the launch button`, async () => {
            await gameEnv.host.page.click("#button-container #launch");
        });

        it(`wait for the file list dialog to appear`, async () => {
            await gameEnv.host.page.waitForSelector("file-list", {visible: true});
        });

        it(`wait for the busy box to disappear`, async () => {
            await gameEnv.host.page.waitForSelector("#file-list-busy", {hidden: true});
        });

        it(`the file list dialog has "Demonstration Game"`, async () => {
            const select = gameEnv.host.page.$("[data-name='Demonstration Game']");
            assert.notStrictEqual(select, null);
        });

        it(`click the "Demonstration Game"`, (done) => {
            gameEnv.host.browser.once("targetchanged", async (target) => {
                const pages = await gameEnv.host.browser.pages();
                gameEnv.host.page = await target.page();
                const indexOf = gameEnv.host.page.target().url().indexOf("launch_console.ejs");
                assert.notStrictEqual(indexOf, -1);
                done();
            });

            gameEnv.host.page.click("[data-name='Demonstration Game']");
        });
    });

    describe(`retrieve the contestant link`, async () => {
        it(`wait for the busy box to disappear`, async () => {
            await gameEnv.host.page.waitForSelector("#busy-box", {visible: true});
            await gameEnv.host.page.waitForSelector("#busy-box", {hidden: true});
        });

        it(`click the copy contestant link button`, async() => {
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

    describe(`game starts`, async () => {
        it(`host starts the game`, async () => {
            await gameEnv.host_portal.page.click("#start");
        });

        it(`host can see game board`, async () => {
            await gameEnv.host_portal.page.waitForSelector("#game-board", {visible: true});
        });

        it(`players can see game board`, async () => {
            await gameEnv.players[0].page.waitForSelector("#game-board", {visible: true});
            await gameEnv.players[1].page.waitForSelector("#game-board", {visible: true});
            await gameEnv.players[2].page.waitForSelector("#game-board", {visible: true});
            await gameEnv.players[3].page.waitForSelector("#game-board", {visible: true});
        });
    });
};

export default launch;

