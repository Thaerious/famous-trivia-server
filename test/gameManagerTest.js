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
    let gameManager = new GameManager('./assets/test.db');

    describe('#connect()', function () {
        it('has database', async function () {
            await gameManager.setup();
            await gameManager.connect();
        });
        it('missing database, creates it', async function () {
            await gameManager.connect('./assets/test.db');
            assert.equal(await fs.existsSync('./assets/test.db'), true);
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
            assert.equal(r, true);
        });
        it(`doesn't have game`, async function () {
            let r = await gameManager.hasGame({userId: "test-user-not"});
            assert.equal(r, false);
        });
    });

    describe(`#listGames()`, function () {
        it(`one game`, async function () {
            let r = await gameManager.listGames();
            assert.equal(r.length, 1);
        });
    });

    describe(`#getGame()`, function () {
        it(`get game`, async function () {
            let a = await gameManager.getGame({userId: "test-user"});
            let e = JSON.stringify(game);
            assert.equal(a, e);
        });
    });

    describe(`#getHash()`, function () {
        it(`has value`, async function () {
            let r = await gameManager.getHash({userId: "test-user"});
            assert.notEqual(r, undefined);
        });
        it(`does not have value`, async function () {
            let r = await gameManager.getHash({userId: "nota-user"});
            assert.equal(r, undefined);
        });
    });

    describe(`#getUser()`, function () {
        it(`has hash`, async function () {
            let r = await gameManager.getHash({userId: "test-user"});
            let userId = await gameManager.getUser(r);
            assert.equal(userId, "test-user");
        });
        it(`doesn't exist`, async function () {
            let userId = await gameManager.getUser("");
            assert.equal(userId, undefined);
        });
    });

    describe(`#getLive()`, function () {
        it(`has hash`, async function () {
            let r = await gameManager.getHash({userId: "test-user"});
            let game = await gameManager.getLive(r);
            assert.equal(game.constructor.name, "Game");
        });
        it(`is the same object when called twice`, async function () {
            let r = await gameManager.getHash({userId: "test-user"});
            let game1 = await gameManager.getLive(r);
            let game2 = await gameManager.getLive(r);
            assert.equal(game1, game2);
        });
    });

    describe(`#deleteGame()`, function () {
        it(`is deleted`, async function () {
            await gameManager.deleteGame({userId: "test-user"});
            let r = await gameManager.hasGame({userId: "test-user"});
            assert.equal(r, false);
        });
        it(`hashes deleted`, async function () {
            let r = await gameManager.getHash({userId: "test-user"});
            assert.equal(r, undefined);
        });
    });

    after(async function () {
        setTimeout(async () => {
            await gameManager.disconnect();
            // await fs.unlinkSync('./assets/test.db');
        }, 250);
    });
});

