// noinspection DuplicatedCode

import fs from "fs";
import GameModel from "../../src/server/game/model/GameModel.js";
import assert from "assert";
import {assertFields} from "./partials/game_partials.js";
import {GAME_MODEL_STYLE, GAME_MODEL_STATES} from "../../src/constants.js";

function loadModel() {
    const file = fs.readFileSync('test/data/test-data-04.json');
    const data = JSON.parse(file.toString());
    return new GameModel(data);
}

describe(`Jeopardy Model Unit Tests (jeopardyModelTest.js)`, ()=> {

    describe(`#checkTableBounds`, ()=> {
        const gameModel = loadModel();

        it(`col < 0 throws exception`, ()=> {
            assert.throws(()=>gameModel.getRound(0).checkTableBounds(-1, 0));
        });
        it(`row < 0 throws exception`, ()=> {
            assert.throws(()=>gameModel.getRound(0).checkTableBounds(0, -1));
        });
        it(`col >= 6 throws exception`, ()=> {
            assert.throws(()=>gameModel.getRound(0).checkTableBounds(6, 0));
        });
        it(`row >= 5 throws exception`, ()=> {
            assert.throws(()=>gameModel.getRound(0).checkTableBounds(0, 5));
        });
        it(`col & row within bounds doesn't throw exception`, ()=> {
            assert.doesNotThrow(()=>gameModel.getRound(0).checkTableBounds(3, 3));
        });
    });

    describe(`#setBoardState`, ()=> {
        const gameModel = loadModel();
        gameModel.addPlayer("Adam");
        gameModel.addPlayer("Eve");
        gameModel.addPlayer("Steve");

        it(`#setBoardState doesn't error`, ()=> {
            assert.doesNotThrow(()=>gameModel.getRound(0).setBoardState());
        });

        it(`#getCurrentPlayer is first player added`, ()=> {
            const expected = "Adam";
            const actual = gameModel.getRound(0).getCurrentPlayer();
            assert.strictEqual(actual, expected);
        });

        it(`#countUnspentPlayers is three`, ()=> {
            const expected = 3;
            const actual = gameModel.getRound(0).countUnspentPlayers();
            assert.strictEqual(actual, expected);
        });

        it(`check state data`, ()=> {
            const expected = {
                style: GAME_MODEL_STYLE.JEOPARDY,
                state: GAME_MODEL_STATES.BOARD
            };
            const actual = gameModel.getRound(0).getUpdate().round;
            assertFields(actual, expected);
        });
    });

    describe(`#setQuestionState`, ()=> {
        const gameModel = loadModel();
        gameModel.addPlayer("Adam");
        gameModel.addPlayer("Eve");
        gameModel.addPlayer("Steve");

        it(`#setQuestionState doesn't error`, ()=> {
            assert.doesNotThrow(()=>gameModel.getRound(0).setQuestionState(0, 0));
        });

        it(`#getCurrentPlayer is first player added`, ()=> {
            const expected = "Adam";
            const actual = gameModel.getRound(0).getCurrentPlayer();
            assert.strictEqual(actual, expected);
        });

        it(`#countUnspentPlayers is three`, ()=> {
            const expected = 3;
            const actual = gameModel.getRound(0).countUnspentPlayers();
            assert.strictEqual(actual, expected);
        });

        it(`check question`, ()=> {
            const expected = {
                question: "Q 1.1.1"
            };

            const actual = gameModel.getRound(0).getUpdate().round;
            assertFields(actual, expected);
        });

        it(`check state data col & row`, ()=> {
            const expected = {
                col: 0,
                row: 0
            };

            const actual = gameModel.getRound(0).getUpdate().round;
            assertFields(actual, expected);
        });

        it(`check state data`, ()=> {
            const expected = {
                style: GAME_MODEL_STYLE.JEOPARDY,
                state: GAME_MODEL_STATES.QUESTION
            };

            const actual = gameModel.getRound(0).getUpdate().round;
            assertFields(actual, expected);
        });
    });

    describe(`#setRevealState`, ()=> {
        const gameModel = loadModel();
        gameModel.addPlayer("Adam");
        gameModel.addPlayer("Eve");
        gameModel.addPlayer("Steve");

        it(`#setRevealState throws exception #setQuestionState is not called first`, ()=> {
            assert.throws(()=>gameModel.getRound(0).setRevealState());
        });

        it(`#setRevealState doesn't throw exception when #setQuestionState is called first`, ()=> {
            assert.doesNotThrow(()=>gameModel.getRound(0).setQuestionState(0, 0));
            assert.doesNotThrow(()=>gameModel.getRound(0).setRevealState());
        });

        it(`check answer`, ()=> {
            const expected = {
                answer: "A 1.1.1"
            };

            const actual = gameModel.getRound(0).getUpdate().round;
            assertFields(actual, expected);
        });

        it(`check state data`, ()=> {
            const expected = {
                style: GAME_MODEL_STYLE.JEOPARDY,
                state: GAME_MODEL_STATES.REVEAL
            };

            const actual = gameModel.getRound(0).getUpdate().round;
            assertFields(actual, expected);
        });

        it(`question 0x0 becomes spent`, ()=> {
            const expected = true;
            const actual = gameModel.getRound(0).isSpent(0, 0);
            assert.strictEqual(actual, expected);
        });

        it(`question 1x0 is not spent spent`, ()=> {
            const expected = false;
            const actual = gameModel.getRound(0).isSpent(1, 0);
            assert.strictEqual(actual, expected);
        });
    });

    describe(`#setPlayerSpent`, ()=> {
        const gameModel = loadModel();
        gameModel.addPlayer("Adam");
        gameModel.addPlayer("Eve");
        gameModel.addPlayer("Steve");

        gameModel.getRound(0).setBoardState();
        let r = gameModel.getRound(0);

        it(`returns false if not in question state`, ()=> {
            const expected = false;
            const actual = gameModel.getRound(0).setPlayerSpent();
            assert.strictEqual(actual, expected);
        });

        it(`returns true when player becomes spent`, ()=> {
            gameModel.getRound(0).setQuestionState(0, 0)
            const expected = true;
            const actual = gameModel.getRound(0).setPlayerSpent();
            assert.strictEqual(actual, expected);
        });

        it(`returns true when player is spent`, ()=> {
            const expected = true;
            const actual = gameModel.getRound(0).setPlayerSpent();
            assert.strictEqual(actual, expected);
        });

        it(`returns false when there is no current player (after #clearCurrentPlayer)`, ()=> {
            gameModel.getRound(0).clearCurrentPlayer();
            const expected = false;
            const actual = gameModel.getRound(0).setPlayerSpent();
            assert.strictEqual(actual, expected);
        });

        it(`returns false when there is no current player (after #clearCurrentPlayer)`, ()=> {
            gameModel.getRound(0).clearCurrentPlayer();
            const expected = false;
            const actual = gameModel.getRound(0).setPlayerSpent();
            assert.strictEqual(actual, expected);
        });
    });

    describe(`#setCurrentPlayer`, ()=> {
        const gameModel = loadModel();
        gameModel.addPlayer("Adam");
        gameModel.addPlayer("Eve");
        gameModel.addPlayer("Steve");

        gameModel.getRound(0).setBoardState();
        gameModel.getRound(0).setQuestionState(0, 0);

        it(`invalid names ignored`, ()=> {
            const expected = gameModel.getRound(0).getCurrentPlayer();
            gameModel.getRound(0).setCurrentPlayer("NOT A PLAYER");
            const actual = gameModel.getRound(0).getCurrentPlayer();
            assert.strictEqual(actual, expected);
        });

        it(`valid names not ignored`, ()=> {
            const expected = "Eve";
            gameModel.getRound(0).setCurrentPlayer("Eve");
            const actual = gameModel.getRound(0).getCurrentPlayer();
            assert.strictEqual(actual, expected);
        });
    });

    describe(`#getValue`, ()=> {
        const gameModel = loadModel();
        gameModel.addPlayer("Adam");
        gameModel.addPlayer("Eve");
        gameModel.addPlayer("Steve");

        gameModel.getRound(0).setBoardState();

        it(`check 0x0 = 100`, ()=> {
            const expected = 100;
            gameModel.getRound(0).setQuestionState(0, 0);
            const actual = gameModel.getRound(0).getValue();
            assert.strictEqual(actual, expected);
        });

        it(`check 2x1 = 200`, ()=> {
            const expected = 200;
            gameModel.getRound(0).setQuestionState(2, 1);
            const actual = gameModel.getRound(0).getValue();
            assert.strictEqual(actual, expected);
        });

        it(`check 1x4 = 500`, ()=> {
            const expected = 500;
            gameModel.getRound(0).setQuestionState(1, 4);
            const actual = gameModel.getRound(0).getValue();
            assert.strictEqual(actual, expected);
        });
    });

    describe(`#hasPlayer`, ()=> {
        const gameModel = loadModel();
        gameModel.addPlayer("Adam");
        gameModel.addPlayer("Eve");
        gameModel.addPlayer("Steve");

        gameModel.getRound(0).setBoardState();
        gameModel.getRound(0).setQuestionState(0, 0);

        it(`known unspent players return true`, ()=> {
            const expected = true;
            const actual = gameModel.getRound(0).hasPlayer("Steve");
            assert.strictEqual(actual, expected);
        });

        it(`unknown players return false`, ()=> {
            const expected = false;
            const actual = gameModel.getRound(0).hasPlayer("Bobbo");
            assert.strictEqual(actual, expected);
        });

        it(`known spent players return false`, ()=> {
            const expected = false;
            gameModel.getRound(0).setPlayerSpent();
            const actual = gameModel.getRound(0).hasPlayer("Adam");
            assert.strictEqual(actual, expected);
        });

        it(`check 1x4 = 500`, ()=> {
            const expected = 500;
            gameModel.getRound(0).setQuestionState(1, 4);
            const actual = gameModel.getRound(0).getValue();
            assert.strictEqual(actual, expected);
        });
    });
});