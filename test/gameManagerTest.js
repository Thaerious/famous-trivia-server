// noinspection JSUnresolvedFunction

import assert from 'assert';
import GameManager from "../src/server/GameManager.js";
import GameModel from "../src/server/GameModel.js";
import {Game} from "../src/server/Game.js";
import fs from "fs";

const file = fs.readFileSync('./test/data/test-data-00.json');
const data = JSON.parse(file);
let gameModel = new GameModel(data);
let game = new Game(gameModel);

describe('class GameManager', async function () {
    let gameManager = new GameManager('./db/test.db');

    describe('#connect()', function () {
        it('has database', async function () {
            await gameManager.connect();
            await gameManager.disconnect();
        });
    });

    describe('#clearAll()', function () {
        it("doesn't throw error", async function () {
            await gameManager.clearAll();
        });
    });

    describe(`#setGame()`, function () {
        it("doesn't throw error", async function () {
            await gameManager.setGame({userId: "test-user"}, game);
        });
    });

    describe(`#hasGame()`, function () {
        it(`has game`, async function () {
            let r = await gameManager.hasGame({userId: "test-user"});
            assert.strictEqual(r, true);
        });
        it(`doesn't have game`, async function () {
            let r = await gameManager.hasGame({userId: "test-user-not"});
            assert.strictEqual(r, false);
        });
    });

    describe(`#listGames()`, function () {
        it(`one game`, async function () {
            let r = await gameManager.listGames();
            assert.strictEqual(r.length, 1);
        });
    });

    describe(`#getGame()`, function () {
        it(`get game`, async function () {
            let a = await gameManager.getGame({userId: "test-user"});
            let e = JSON.stringify(game);
            assert.strictEqual(a, e);
        });
    });

    describe(`#getHash()`, function () {
        it(`has value`, async function () {
            let r = await gameManager.getHash({userId: "test-user"});
            assert.notEqual(r, undefined);
        });
        it(`does not have value`, async function () {
            let r = await gameManager.getHash({userId: "nota-user"});
            assert.strictEqual(r, undefined);
        });
    });

    describe(`#getLive()`, function () {
        it(`has hash`, async function () {
            let r = await gameManager.getHash({userId: "test-user"});
            let game = await gameManager.getLive(r);
            assert.strictEqual(game.constructor.name, "Game");
        });
        it(`is the same object when called twice`, async function () {
            let r = await gameManager.getHash({userId: "test-user"});
            let game1 = await gameManager.getLive(r);
            let game2 = await gameManager.getLive(r);
            assert.strictEqual(game1, game2);
        });
    });

    describe(`#deleteGame()`, function () {
        it(`is deleted`, async function () {
            await gameManager.deleteGame({userId: "test-user"});
            let r = await gameManager.hasGame({userId: "test-user"});
            assert.strictEqual(r, false);
        });
        it(`game hash deleted`, async function () {
            let r = await gameManager.getHash({userId: "test-user"});
            assert.strictEqual(r, undefined);
        });
    });
});