// noinspection DuplicatedCode

import assert from 'assert';
import login from './login.js';
import clipboardy from "clipboardy";
import connectContestant from "./connectContestant.mjs";
import puppeteer from "puppeteer";
import globals from "./prequel.js";

async function launch(globals) {

    describe(`login and launch game`, async () => {
        it(`login to google`, async () => {
            console.log(globals.args.flags["url"]);
            console.log(globals.args.flags["email"]);
            console.log(globals.args.flags["password"]);
            globals.host = await login(globals.args.flags["url"], globals.args.flags["email"], globals.args.flags["password"]);
        });

        it(`wait for enabled launch button`, async () => {
            await globals.host.page.waitForSelector("#button-container #launch:not(.disabled)");
        });

        it(`click the launch button`, async () => {
            await globals.host.page.click("#button-container #launch");
        });

        it(`wait for the file list dialog to appear`, async () => {
            await globals.host.page.waitForSelector("file-list", {visible: true});
        });

        it(`wait for the busy box to disappear`, async () => {
            await globals.host.page.waitForSelector("#file-list-busy", {hidden: true});
        });

        it(`close the file list dialog`, async () => {
            await globals.host.page.click("#file-list-close");
        });

        it(`wait for the file list dialog to disappear`, async () => {
            await globals.host.page.waitForSelector("file-list", {hidden: true});
        });

        it(`click the launch button`, async () => {
            await globals.host.page.click("#button-container #launch");
        });

        it(`wait for the file list dialog to appear`, async () => {
            await globals.host.page.waitForSelector("file-list", {visible: true});
        });

        it(`wait for the busy box to disappear`, async () => {
            await globals.host.page.waitForSelector("#file-list-busy", {hidden: true});
        });

        it(`the file list dialog has "Demonstration Game"`, async () => {
            const select = globals.host.page.$("[data-name='Demonstration Game']");
            assert.notStrictEqual(select, null);
        });

        it(`click the "Demonstration Game"`, (done) => {
            globals.host.browser.once("targetchanged", async (target) => {
                const pages = await globals.host.browser.pages();
                globals.host.page = await target.page();
                const indexOf = globals.host.page.target().url().indexOf("launch_console.ejs");
                assert.notStrictEqual(indexOf, -1);
                done();
            });

            globals.host.page.click("[data-name='Demonstration Game']");
        });
    });

    describe(`retrieve the contestant link`, async () => {
        it(`wait for the busy box to disappear`, async () => {
            await globals.host.page.waitForSelector("#busy-box", {visible: true});
            await globals.host.page.waitForSelector("#busy-box", {hidden: true});
        });

        it(`click the copy contestant link button`, async() => {
            await globals.host.browser.defaultBrowserContext().overridePermissions('http://localhost:8000/launch_console.ejs', ['clipboard-read', 'clipboard-write']);
            await globals.host.page.waitForSelector("#busy-box", {hidden: true}); // don't know why this in needed again
            await globals.host.page.waitForSelector("#contestant", {visible: true});
            await globals.host.page.click("#contestant");
        });

        it(`retrieve the link`, async () => {
            await globals.host.page.evaluate(async () => {
                await navigator.clipboard.readText();
            });
            let link = clipboardy.readSync();
            const indexOf = link.indexOf("contestant_join.ejs?hash=");
            assert.notStrictEqual(indexOf, -1);
            globals.contestant_link = link;
        });
    });

    describe(`launch the host portal`, async () => {
        it(`click the host portal button`, (done) => {
            globals.host.browser.once("targetcreated", async (target) => {
                const pages = await globals.host.browser.pages();
                globals.host_portal.page = await target.page();
                const indexOf = globals.host_portal.page.target().url().indexOf("host_portal.ejs");
                assert.notStrictEqual(indexOf, -1);
                done();
            });

            globals.host.page.click("#button-container #host");
        });

        it(`host portal has start button`, async () => {
            const start_button = globals.host_portal.page.$("#start");
            assert.notStrictEqual(start_button, null);
        });
    });

    describe(`connect 4 contestants`, async () => {
        it(`first contestant connects`, async () => {
            globals.players[0] = await connectContestant(globals.contestant_link, "Adam");
            await globals.host_portal.page.waitForSelector("shadow/player-container [data-name]");
        });

        it(`host has correct first player`, async () => {
            const element = await globals.host_portal.page.$("shadow/player-container [data-name]");
            const name = await globals.host_portal.page.$eval("shadow/player-container [data-name]", el => el.getAttribute("data-name"));
            assert.strictEqual(name, "ADAM");
        });

        it(`first player has correct first player`, async () => {
            const element = await globals.players[0].page.$("shadow/player-container [data-name]");
            const name = await globals.players[0].page.$eval("shadow/player-container [data-name]", el => el.getAttribute("data-name"));
            assert.strictEqual(name, "ADAM");
        });

        it(`second contestant connects`, async () => {
            globals.players[1] = await connectContestant(globals.contestant_link, "Beth");
        });

        it(`third contestant connects`, async () => {
            globals.players[2] = await connectContestant(globals.contestant_link, "Chuck");
        });

        it(`fourth contestant connects`, async () => {
            globals.players[3] = await connectContestant(globals.contestant_link, "Dianne");
        });
    });

    describe(`game starts`, async () => {
        it(`host starts the game`, async () => {
            await globals.host_portal.page.click("#start");
        });

        it(`host can see game board`, async () => {
            await globals.host_portal.page.waitForSelector("#game-board", {visible: true});
        });

        it(`players can see game board`, async () => {
            await globals.players[0].page.waitForSelector("#game-board", {visible: true});
            await globals.players[1].page.waitForSelector("#game-board", {visible: true});
            await globals.players[2].page.waitForSelector("#game-board", {visible: true});
            await globals.players[3].page.waitForSelector("#game-board", {visible: true});
        });
    });
};

export default launch;

