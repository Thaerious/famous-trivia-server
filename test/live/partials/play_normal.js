// noinspection DuplicatedCode
// noinspection DuplicatedCode

import assert from 'assert';
import login from './login.js';
import ParseArgs from "@thaerious/parseargs";
import clipboardy from "clipboardy";
import connectContestant from "./connectContestant.mjs";
import {QueryHandler} from 'query-selector-shadow-dom/plugins/puppeteer/index.js';

async function play_normal(globals) {
    async function clickContinue(page){
        await globals.host_portal.page.waitForSelector("#continue", {visible : true});
        await globals.host_portal.page.click(`#continue`);
    }

    async function clickAccept(page){
        globals.host_portal.page.waitForSelector("#accept", {visible : true});
        globals.host_portal.page.click(`#accept`);
    }

    async function chooseQuestion(row, col){
        globals.host_portal.page.waitForSelector("#game-board", {visible : true});
        globals.host_portal.page.click(`shadow/[data-row='${row}'][data-col='${col}']`);
    }

    async function assertScore(player, value){
        const selector = `shadow/player-container [data-name='${player.toUpperCase()}']`;
        await globals.host_portal.page.waitForSelector(selector);
        const score = await globals.host_portal.page.$eval(selector, el => el.getAttribute("data-score"));
        assert.strictEqual(parseInt(score), value);
    }


    it(`wait for the board`, ()=>{
        globals.host_portal.page.waitForSelector("#game-board", {visible : true});
    });

    describe(`each player picks and get the answer correct`, async ()=>{
        it(`1st player`, async ()=> {
            await chooseQuestion(0, 0);
            await clickContinue();
            await clickAccept();
            await clickContinue();
            await assertScore("ADAM", 100);
        });
        it(`2nd player`, async ()=> {
            await chooseQuestion(1, 1);
            await clickContinue();
            await clickAccept();
            await clickContinue();
            await assertScore("BETH", 200);
        });
        it(`3rd player`, async ()=> {
            await chooseQuestion(2, 2);
            await clickContinue();
            await clickAccept();
            await clickContinue();
            await assertScore("CHUCK", 300);
        });
        it(`4th player`, async ()=> {
            await chooseQuestion(3, 3);
            await clickContinue();
            await clickAccept();
            await clickContinue();
            await assertScore("DIANNE", 400);
        });
    });
};

export default play_normal;

