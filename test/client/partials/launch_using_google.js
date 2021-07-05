// noinspection DuplicatedCode

import assert from 'assert';
import login from './login.js';
import clipboardy from "clipboardy";
import connectContestant from "./connectContestant.mjs";
import puppeteer from "puppeteer";

async function launch_using_google(gameEnv) {
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
            await gameEnv.host.page.click("#button-container #launch_using_google");
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
            await gameEnv.host.page.click("#button-container #launch_using_google");
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
};

export default launch_using_google;

