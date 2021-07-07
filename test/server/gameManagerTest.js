// noinspection JSUnresolvedFunction

import assert from 'assert';
import GameManager from "../../src/server/game/GameManager.js";
import GameModel from "../../src/server/game/GameModel.js";
import {Game} from "../../src/server/game/Game.js";
import fs from "fs";

const file = fs.readFileSync('./test/data/test-data-00.json');
const data = JSON.parse(file);
const gameModel = new GameModel(data);

const hostInfo1 = {userId: "test-user-1", userName: "name-1"};
const hostInfo2 = {userId: "test-user-2", userName: "name-2"};

describe('class GameManager (GM)', function () {
    describe(`#setGame()`, function () {
        it("size of 1 after setting first game", function () {
            const gm = new GameManager();
            gm.setGame(hostInfo1, new Game(gameModel));
            assert.strictEqual(gm.size, 1);
        });
        it("size of 2 after setting second game", function () {
            const gm = new GameManager();
            gm.setGame(hostInfo1, new Game(gameModel));
            gm.setGame(hostInfo2, new Game(gameModel));
            assert.strictEqual(gm.size, 2);
        });
        it("same host twice throws error", function () {
            const gm = new GameManager();
            gm.setGame(hostInfo1, new Game(gameModel));
            assert.throws(()=>gm.setGame(hostInfo1, new Game(gameModel)));
        });
        it("missing user id from hostInfo throws error", function () {
            const gm = new GameManager();
             const hostInfo = {userName: "name-1"};
            assert.throws(()=>gm.setGame(hostInfo, new Game(gameModel)));
        });
        it("missing user name from hostInfo throws error", function () {
            const gm = new GameManager();
            const hostInfo = {userId: "test-user-1"};
            assert.throws(()=>gm.setGame(hostInfo, new Game(gameModel)));
        });
    });

    describe(`#hasGame()`, function () {
        it(`has game`, function () {
            const gm = new GameManager();
            gm.setGame(hostInfo1, new Game(gameModel));
            assert.strictEqual(gm.hasGame(hostInfo1), true);
        });
        it(`doesn't have game`, function () {
            const gm = new GameManager();
            assert.strictEqual(gm.hasGame(hostInfo1), false);
        });
    });

    describe(`#getLive()`, function () {
        it(`get live retrieves game that set with set game`, function () {
            const gm = new GameManager();
            const game = new Game(gameModel);
            const gameHash = gm.setGame(hostInfo1, game);
            assert.strictEqual(gm.getLive(gameHash), game);
        });
        it(`is the same object when called twice`, function () {
            const gm = new GameManager();
            const game = new Game(gameModel);
            const gameHash = gm.setGame(hostInfo1, game);
            const game1 = gm.getLive(gameHash);
            const game2 = gm.getLive(gameHash);
            assert.strictEqual(game1, game2);
        });
    });

    describe(`#getGameHash()`, function () {
        it(`gets hash returned by setGame`, function () {
            const gm = new GameManager();
            const gameHash = gm.setGame(hostInfo1, new Game(gameModel));
            assert.strictEqual(gm.getGameHash(hostInfo1), gameHash);
        });
        it(`returns undefined if host game not set`, function () {
            const gm = new GameManager();
            assert.strictEqual(gm.getGameHash(hostInfo1), undefined);
        });
    });

    describe(`#getGame()`, function () {
        it(`gets game that was set by setGame`, function () {
            const gm = new GameManager();
            const game = new Game(gameModel);
            const gameHash = gm.setGame(hostInfo1, game);
            assert.strictEqual(gm.getGame(hostInfo1), game);
        });
        it(`throws error for unknown hostInfo, use hasGame to determine existence`, function () {
            const gm = new GameManager();
            assert.throws(()=>gm.getGame(hostInfo1));
        });
    });

    describe(`#deleteGame()`, function () {
        it(`is deleted`, function () {
            const gm = new GameManager();
            gm.setGame(hostInfo1, new Game(gameModel));
            assert.strictEqual(gm.deleteGame(hostInfo1), true);
            assert.strictEqual(gm.hasGame(hostInfo1), false);
        });
        it(`returns false for unknown game`, function () {
            const gm = new GameManager();
            assert.strictEqual(gm.deleteGame(hostInfo1), false);
        });
    });

    describe(`set times`, function () {
        it(`#timeAnswer`, function () {
            const gm = new GameManager();
            gm.timeAnswer = 99;
            const game = new Game(gameModel);
            gm.setGame(hostInfo1, game);
            assert.strictEqual(game.times.ANSWER, 99);
        });
        it(`#timeBuzz`, function () {
            const gm = new GameManager();
            gm.timeBuzz = 99;
            const game = new Game(gameModel);
            gm.setGame(hostInfo1, game);
            assert.strictEqual(game.times.BUZZ, 99);
        });
        it(`#timeMultipleChoice`, function () {
            const gm = new GameManager();
            gm.timeMultipleChoice = 99;
            const game = new Game(gameModel);
            gm.setGame(hostInfo1, game);
            assert.strictEqual(game.times.MULTIPLE_CHOICE, 99);
        });
    });
});