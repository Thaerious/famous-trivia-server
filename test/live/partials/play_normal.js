// noinspection DuplicatedCode
// noinspection DuplicatedCode

import assert from 'assert';
import login from './login.js';
import ParseArgs from "@thaerious/parseargs";
import clipboardy from "clipboardy";
import connectContestant from "./connectContestant.mjs";
import {QueryHandler} from 'query-selector-shadow-dom/plugins/puppeteer/index.js';

const PID = {
    ADAM : 0,
    BETH : 1,
    CHUCK : 2,
    DIANNE : 3
}

async function play_normal(gameEnv) {

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

    it(`wait for the board`, async () => {
        await gameEnv.host_portal.page.waitForSelector("#game-board", {visible: true});
    });

    describe(`each player picks and get the answer correct`, async () => {
        it(`1st player`, async () => {
            await chooseQuestion(0, 0);
            await clickContinue();
            await clickAccept();
            await clickContinue();
            await assertScore("ADAM", 100);
        });
        it(`2nd player`, async () => {
            await chooseQuestion(1, 1);
            await clickContinue();
            await clickAccept();
            await clickContinue();
            await assertScore("BETH", 200);
        });
        it(`3rd player`, async () => {
            await chooseQuestion(2, 2);
            await clickContinue();
            await clickAccept();
            await clickContinue();
            await assertScore("CHUCK", 300);
        });
        it(`4th player`, async () => {
            await chooseQuestion(3, 3);
            await clickContinue();
            await clickAccept();
            await clickContinue();
            await assertScore("DIANNE", 400);
        });
    });

    describe(`exercise the timer - accepting all answers after waiting`, async () => {
        it(`host waits 3 seconds before accepting Adam's answer`, async () => {
            await chooseQuestion(1, 0);
            await clickContinue();
            await wait(3);
            await clickAccept();
            await clickContinue();
            await assertScore("ADAM", 300);
        });

        it(`host waits 3 seconds before accepting Beth's answer`, async () => {
            await chooseQuestion(0, 1);
            await clickContinue();
            await wait(3);
            await clickAccept();
            await clickContinue();
            await assertScore("BETH", 300);
        });
    });

    /**
     * Check chooses,
     * Answer rejected, score stays at 300
     * Adam buzzes in,
     * Answer accepted, score goes from 300 -> 800
     */
    describe(`exercise the timer - rejecting answers after a wait`, async () => {
        it(`host chooses question`, async () => {
            await chooseQuestion(4, 0);
            await clickContinue();
        });

        it(`host rejects the answer`, async () => {
            setTimeout(async () => {
                await clickReject();
            }, 3000);
        });

        it(`check score`, async () => {
            await assertScore("CHUCK", 300);
        });

        it(`Adam buzzes in`, async () => {
            await clickBuzz(0);
        });

        it(`host accepts the answer`, async () => {
            setTimeout(async () => {
                await clickAccept();
            }, 3000);
        });

        it(`check score`, async () => {
            await clickContinue();
            await assertScore("ADAM", 800);
        });
    });

    /**
     * Dianne, Adam, Beth, Chuck
     * 400, 800, 300, 300
     * - - o o o o
     * - - o o o o
     * o o - o o o
     * o o o - o o
     * - o o o o o
     */

    describe(`Dianne selects, times out completely, no one else buzzes in`, async () => {
        it(`host chooses question`, async () => {
            await chooseQuestion(0, 2);
            await clickContinue();
        });

        it(`host rejects answer after 6 seconds (no answer)`, async () => {
            await wait(6);
            await clickReject();
        });

        it(`check score, doesn't change`, async () => {
            await clickContinue();
            await assertScore("ADAM", 800);
        });
    });

    /**
     * Adam, Beth, Chuck, Dianne
     * 800, 300, 300, 400
     * - - - o o o
     * - - o o o o
     * o o - o o o
     * o o o - o o
     * - o o o o o
     */

    describe(`Adam's answer rejected. Beth buzz-in, gets the answer wrong, Chuck buzz-in gets it right`, async () => {
        it(`host chooses question (col 1, value 300)`, async () => {
            await chooseQuestion(2, 1);
            await clickContinue();
        });

        it(`host rejects answer after 3 seconds`, async () => {
            await wait(3);
            await clickReject();
        });

        it(`adams score doesn't change`, async () => {
            await assertScore("ADAM", 800);
        });

        it(`beth buzzes in`, async () => {
            await clickBuzz(PID.BETH);
        });

        it(`host rejects answer after 3 seconds`, async () => {
            await wait(3);
            await clickReject();
        });

        it(`beth's score changes by half the value`, async () => {
            await assertScore("BETH", 150);
        });

        it(`check buzzes in`, async () => {
            await clickBuzz(PID.CHUCK);
        });

        it(`host accepts answer after 3 seconds`, async () => {
            await wait(3);
            await clickAccept();
        });

        it(`chuck's score increases by 300`, async () => {
            await assertScore("CHUCK", 600);
        });

        it(`host clicks continue`, async () => {
            await clickContinue();
        });

        it(`wait for the game board`, async () => {
            await gameEnv.host_portal.page.waitForSelector("#game-board", {visible: true});
        });
    });

};

export default play_normal;

