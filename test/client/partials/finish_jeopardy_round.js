// noinspection DuplicatedCode
// noinspection DuplicatedCode

import assert from 'assert';
import login from './login.js';
import ParseArgs from "@thaerious/parseargs";
import clipboardy from "clipboardy";
import connectContestant from "./connectContestant.mjs";
import {QueryHandler} from 'query-selector-shadow-dom/plugins/puppeteer/index.js';

export default async function finish_jeopardy_round(gameEnv) {
    const PID = {
        ADAM : 0,
        BETH : 1,
        CHUCK : 2,
        DIANNE : 3
    }

    /**
     * Retrieve an array of unselected cells.
     */
    async function availableCells(page = gameEnv.host_portal.page){
        let r = [];
        await page.waitForSelector(`shadow/.column.question`);
        let cells = await page.$$(`shadow/.column.question`);
        for (let cell of cells){
            if (await cell.evaluate((node)=>node.innerText) !== ""){
                r.push(cell);
            }
        }
        return r;
    }

    /**
     * If a callback is not provided return a promise, otherwise execute the callback before returning.
     * @param cb
     * @returns {*}
     */
    async function clickContinue() {
        await gameEnv.host_portal.page.waitForSelector("#continue.shown", {visible: true});
        await gameEnv.host_portal.page.click(`#continue`);
    }

    async function wait(sec, cb = ()=>{}){
        return new Promise((resolve, reject)=>{
           setTimeout(()=>{resolve(cb())}, sec * 1000);
        });
    }

    async function clickAccept() {
        await gameEnv.host_portal.page.waitForSelector("#accept", {visible: true});
        await gameEnv.host_portal.page.click(`#accept`);
    }

    async function clickReject() {
        await gameEnv.host_portal.page.waitForSelector("#reject", {visible: true});
        await gameEnv.host_portal.page.click(`#reject`);
    }

    async function clickBuzz(pid) {
        await gameEnv.players[pid].page.waitForSelector("#buzz", {visible: true});
        await gameEnv.players[pid].page.click(`#buzz`);
    }

    async function chooseQuestion(row, col) {
        await gameEnv.host_portal.page.waitForSelector("#game-board", {visible: true});
        await gameEnv.host_portal.page.click(`shadow/[data-row='${row}'][data-col='${col}']`);
    }

    async function assertScore(player, value) {
        const selector = `shadow/player-container [data-name='${player.toUpperCase()}']`;
        await gameEnv.host_portal.page.waitForSelector(selector);
        const score = await gameEnv.host_portal.page.$eval(selector, el => el.getAttribute("data-score"));
        assert.strictEqual(parseInt(score), value);
    }

    /**
     * Beth, Chuck, Dianne, Adam
     * 150, 600, 400, 800
     * - - - o o o
     * - - o o o o
     * o - - o o o
     * o o o - o o
     * - o o o o o
     */

    describe(`Burn through the remaining questions`, async () => {
        it(`host starts the game`, async () => {
            await gameEnv.host_portal.page.click("#start");
        });

        it(`each question gets selected and answered correctly`, async () => {
            const page = gameEnv.host_portal.page;

            const cells = await availableCells();
            while(cells.length > 0){
                const i = Math.trunc(Math.random() * cells.length);
                let cell = cells.splice(i, 1)[0];

                const value = await cell.evaluate((node)=>node.innerText);
                const row = await cell.evaluate((node)=>node.getAttribute("data-row"));
                const col = await cell.evaluate((node)=>node.getAttribute("data-col"));

                console.log(`${row} ${col} ${value}`);

                await chooseQuestion(row, col);
                await clickContinue();
                await clickAccept();
                await clickContinue();
            }
        });
    });
};
