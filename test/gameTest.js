// gameTest.js
// noinspection DuplicatedCode

import assert from 'assert';
import fs from 'fs';
import GameModel from '../src/server/GameModel.js';
import {Game, Timer} from '../src/server/Game.js';

const file = fs.readFileSync('./test/data/test-data-00.json');
const data = JSON.parse(file);

Timer.TIMES = {
    ANSWER: 1,
    BUZZ: 1,
    MULTIPLE_CHOICE: 1
}

describe(`Game`, () => {
    let gameModel = new GameModel(data);
    let game = new Game(gameModel);

    describe('#constructor()', function () {
        it('constructor sanity test', function () {
            assert.notStrictEqual(game, null);
        });
    });

    describe('Add 3 players to game', function () {
        game.onInput({action: "join", data: {name: "Adam"}});
        game.onInput({action: "join", data: {name: "Beth"}});
        game.onInput({action: "join", data: {name: "Charles"}});

        it('has 3 players', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.players.length, 3);
        });
    });

    describe('Start the game', function () {
        game.onInput({action: "start"});
        let update = game.getUpdate().data;

        it('The game starts in state 4 - jeopardy select question', function () {
            assert.strictEqual(update.state, 4);
        });

        describe('Update object', function () {
            it('Loads correct (jeopardy) round', function () {
                let update = game.getUpdate().data;
                assert.strictEqual(update.model.round.style, GameModel.STYLE.JEOPARDY);
            });
            it('No questions are blanked', function () {
                let update = game.getUpdate().data;
                update.model.round.spent.forEach(c => c.forEach(r => assert.strictEqual(r, false)));
            });
            it(`The first player 'Adam' is the current player for the round`, function () {
                let update = game.getUpdate().data;
                assert.strictEqual(update.model.round.current_player, "Adam");
            });
            it(`Spent list contains current player`, function () {
                let update = game.getUpdate().data;
                assert.notStrictEqual(update.model.round.spentPlayers.indexOf("Adam"), -1);
            });
        });
    });

    describe('Host selects question (first cat, $200)', function () {
        it('Host gets the answer when a question is selected', done => {
            game.addListener("@HOST", msg => {
                if (msg.action === 'provide_answer') {
                    assert.strictEqual(msg.data.answer, "A 1.2");
                    game.removeListener("@HOST");
                    done();
                }
            });

            game.onInput({action: "select", data: {col: 0, row: 1}, player: "@HOST"});
        });

        it('State changes to 5 - Waiting for host to press continue', () => {
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 5);
        });

        it('loads correct (jeop) round', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.style, GameModel.STYLE.JEOPARDY);
        });
        it('column set to 0', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.col, 0);
        });
        it('row set to 1', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.row, 1);
        });
        it('type is text', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.type, "text");
        });
        it('question is Q 1.2', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.question, "Q 1.2");
        });
        it('answer text not provided', function () {
            game.onInput({action: "accept"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.answer, undefined);
        });
    });

    describe('Host presses continue to start answer timer (1)', function () {
        it('state changes', function () {
            game.onInput({action: "continue", player: "@HOST"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 6);
        });
        it('answer text not provided', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.answer, undefined);
        });
    });

    describe('Host accepts answer before timer expires', function () {
        it('state changes to 9 - waiting for host to press continue', function () {
            game.onInput({action: "accept"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 9);
        });
        it('Score for current player (index 0) increases by 200', function () {
            game.onInput({action: "accept"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.players[0].score, 200);
        });
        it('Answer text provided in update', function () {
            game.onInput({action: "accept"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.answer, "A 1.2");
        });
    });

    describe('Host presses continue to advance to next player (1)', function () {
        it('state changes to 4 - jeopardy select question', function () {
            game.onInput({action: "continue", player: "@HOST"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 4);
        });
        it('loads correct (jeop) round', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.style, GameModel.STYLE.JEOPARDY);
        });
        it('one option spent', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.spent[0][1], true);
        });
        it('active player order updates', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.players[0].name, "Beth");
            assert.strictEqual(update.model.players[1].name, "Charles");
            assert.strictEqual(update.model.players[2].name, "Adam");
        });
        it('current player is \'active player\'', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.current_player, "Beth");
        });
        it('spent list contains current player', function () {
            let update = game.getUpdate().data;
            assert.notStrictEqual(update.model.round.spentPlayers.indexOf("Beth"), -1);
        });
    });

    describe('Select previously selected question (first cat, $200)', function () {
        it('state does not change', function () {
            game.onInput({action: "select", data: {col: 0, row: 1}});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 4);
        });
        it('current player does not change', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.current_player, "Beth");
        });
    });

    describe('Host selects question (first cat, $400)', function () {
        it('state changes', function () {
            game.onInput({action: "select", data: {col: 0, row: 3}, player: "@HOST"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 5);
        });
        it('loads correct (jeop) round', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.style, GameModel.STYLE.JEOPARDY);
        });
        it('column set to 0', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.col, 0);
        });
        it('row set to 3', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.row, 3);
        });
        it('type is text', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.type, "text");
        });
        it('question is Q 1.4', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.question, "Q 1.4");
        });
        it('answer text not provided', function () {
            game.onInput({action: "accept"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.answer, undefined);
        });
    });

    describe('Host clicks continue (goes to state 6) then timer expires', function () {
        it('state does not change (stays in 6)', function (done) {
            this.timeout(5000);
            game.addListener("test", msg => {
                if (msg.action === 'update_model') {
                    assert.strictEqual(msg.data.state, 6);
                    game.removeListener("test");
                    done();
                }
            });

            game.onInput({action: "continue", player: "@HOST"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 6);
        });
    });

    describe('host rejects answer after timer expires', function () {
        it('state changes', function () {
            game.onInput({action: "reject"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 7);
        });
        it('clear current player (waiting for a player to buzz in)', function () {
            let update = game.getUpdate().data;
            assert.strictEqual(update.model.round.current_player, '');
        });
    });

    describe(`Player (Beth) buzzes in (shouldn't be able to)`, function () {
        describe('player has already answered', function () {
            it('no state change', function () {
                game.onInput({action: "buzz", player: "Beth"});
                let update = game.getUpdate().data;
                assert.strictEqual(update.state, 7);
            });
        });
        describe('player has not already answered', function () {
            it('change state', function () {
                game.onInput({action: "buzz", player: "Charles"});
                let update = game.getUpdate().data;
                assert.strictEqual(update.state, 8);
            });
            it('change current player', function () {
                let update = game.getUpdate().data;
                assert.strictEqual(update.model.round.current_player, "Charles");
            });
            it('player is in spent list', function () {
                let update = game.getUpdate().data;
                assert.strictEqual(update.model.round.spentPlayers.indexOf("Charles"), -1);
            });
        });
    });

    describe('answer rejected (not active player)', function () {
        it('state changes', function () {
            game.onInput({action: "reject"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 7);
        });
        it(`score decreases because it's not the original player`, function () {
            let update = game.getUpdate().data;
            let score = update.model.players.find(p => p.name === 'Charles').score;
            assert.strictEqual(score, -200);
        });
    });

    describe('timer expires no buzz in', function () {
        it('state changes', function (done) {
            this.timeout(5000);
            game.addListener("test", msg => {
                if (msg.action === 'update_model') {
                    assert.strictEqual(msg.data.state, 9);
                    game.removeListener("test");
                    done();
                }
            });
        });
    });

    describe('host continues', function () {
        it('state changes', () => {
            game.onInput({action: "continue", player: "@HOST"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 4);
        });
    });

    describe('Wrong player selects question (not allowed)', function () {
        it(`state doesn't change`, function () {
            game.onInput({action: "select", data: {col: 0, row: 4}, player: "Adam"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 4);
        });
    });

    describe('Player selects question (Charlie), question already picked (not allowed)', function () {
        it(`state doesn't change`, function () {
            game.onInput({action: "select", data: {col: 0, row: 3}, player: "Charlie"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 4);
        });
    });

    describe('Player selects question (Charlie), host goes back', function () {
        it(`state changes`, function () {
            let u = game.getUpdate().data;
            game.onInput({action: "select", data: {col: 0, row: 4}, player: "Charles"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 5);
        });
        it(`host selects back`, function () {
            game.onInput({action: "back", player: "@HOST"});
            let update = game.getUpdate().data;
            assert.strictEqual(update.state, 4);
        });
    });
});