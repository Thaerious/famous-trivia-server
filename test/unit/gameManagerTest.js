// noinspection JSUnresolvedFunction

import assert from 'assert';
import GameManager from "../../src/server/game/GameManager.js";
import GameModel from "../../src/server/game/GameModel.js";
import {Game} from "../../src/server/game/Game.js";
import fs from "fs";

const file = fs.readFileSync('./test/data/test-data-00.json');
const data = JSON.parse(file);
let gameModel = new GameModel(data);
let game = new Game(gameModel);

describe('class GameManager', function () {
    let gameManager = new GameManager('./db/test.db');

    describe('#clearAll()', function () {
        it("doesn't throw error", function () {
             gameManager.clearAll();
        });
    });

    describe(`#setGame()`, function () {
        it("doesn't throw error", function () {
             gameManager.setGame({userId: "test-user"}, game);
        });
    });

    describe(`#hasGame()`, function () {
        it(`has game`, function () {
            let r =  gameManager.hasGame({userId: "test-user"});
            assert.strictEqual(r, true);
        });
        it(`doesn't have game`, function () {
            let r =  gameManager.hasGame({userId: "test-user-not"});
            assert.strictEqual(r, false);
        });
    });

    describe(`#listHostedGames()`, function () {
        it(`one game`, function () {
            let r =  gameManager.listHostedGames();
            assert.strictEqual(r.length, 1);
        });
    });

    describe(`#getHash()`, function () {
        it(`has value`, function () {
            let r =  gameManager.getHash({userId: "test-user"});
            assert.notStrictEqual(r, undefined);
        });
        it(`does not have value`, function () {
            let r =  gameManager.getHash({userId: "nota-user"});
            assert.strictEqual(r, undefined);
        });
    });

    describe(`#getLive()`, function () {
        it(`has hash`, function () {
            let r =  gameManager.getHash({userId: "test-user"});
            let game =  gameManager.getLive(r);
            assert.strictEqual(game.constructor.name, "Game");
        });
        it(`is the same object when called twice`, function () {
            let r =  gameManager.getHash({userId: "test-user"});
            let game1 =  gameManager.getLive(r);
            let game2 =  gameManager.getLive(r);
            assert.strictEqual(game1, game2);
        });
    });

    describe(`#deleteGame()`, function () {
        it(`is deleted`, function () {
            let deleted = gameManager.deleteGame({userId: "test-user"});
            let has =  gameManager.hasGame({userId: "test-user"});
            assert.strictEqual(deleted, true);
            assert.strictEqual(has, false);
        });
        it(`game hash deleted`, function () {
            let r =  gameManager.getHash({userId: "test-user"});
            assert.strictEqual(r, undefined);
        });
    });
});