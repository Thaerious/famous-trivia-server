// gameTest.js

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

describe('Game', function () {
    let json = "";

    describe('toJSON <=> fromJSON', function () {
        it('Sanity Check', function () {
            let gameModel = new GameModel(data);
            let game = new Game(gameModel);
            json = JSON.stringify(game, null, 2);
            Game.fromJSON(json)
        });
    });

    describe('add 3 players to game', function () {
        it('adds 3 players', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "join", data: {name: "robin"}});
            game.onInput({action: "join", data: {name: "alex"}});
            game.onInput({action: "join", data: {name: "pat"}});
            json = JSON.stringify(game, null, 2);
        });

        it('has 3 players', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.players.length, 3);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('start the game', function () {
        it('changes state', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "start"});
            let update = game.getUpdate();
            assert.equal(update.state, 1);
            json = JSON.stringify(game, null, 2);
        });
        it('loads correct (mc) round', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "start"});
            let update = game.getUpdate();
            assert.equal(update.round.style, GameModel.STYLE.MULTIPLE_CHOICE);
            json = JSON.stringify(game, null, 2);
        });
        it('multiple choice starts in question state', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "start"});
            let update = game.getUpdate();
            assert.equal(update.round.state, GameModel.STATES.QUESTION);
            json = JSON.stringify(game, null, 2);
        });
        it('has correct question from file', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "start"});
            let update = game.getUpdate();
            assert.equal(update.round.question, "MC-QUESTION");
            json = JSON.stringify(game, null, 2);
        });
    });
//--
    describe('host clicks continue', function () {
        it('changes state', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "continue"});
            let update = game.getUpdate();
            assert.equal(update.state, 2);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('give players fake scores', function () {
        it('check', function () {
            let game = Game.fromJSON(json);
            game.model.getPlayer("robin").score = 500;
            game.model.getPlayer("alex").score = 0;
            game.model.getPlayer("pat").score = 200;
            let update = game.getUpdate();
            assert.equal(update.players[0].score, 500);
            assert.equal(update.players[1].score, 0);
            assert.equal(update.players[2].score, 200);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('answer values (bets) submitted', function () {
        it('updates player data (unseen until next state)', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "update", data: {name: "robin", index: "0", value: "100"}}); // incorrect
            game.onInput({action: "update", data: {name: "robin", index: "2", value: "200"}}); // correct
            game.onInput({action: "update", data: {name: "alex", index: "0", value: "100"}}); // can't be has 0
            game.onInput({action: "update", data: {name: "pat", index: "0", value: "100"}}); // bet not ignored
            game.onInput({action: "update", data: {name: "pat", index: "1", value: "200"}}); // bet ignored, over amount
            json = JSON.stringify(game, null, 2);
        });
        it('state doesn\'t change', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.state, 2);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('timer expires', function () {
        it('state changes', function(){
            let game = Game.fromJSON(json);
            game.onInput({action : "expire"});
            let update = game.getUpdate();
            assert.equal(update.state, 3);
            game.removeListener("test");
            json = JSON.stringify(game, null, 2);
        });
        it('player #1 gains some loses some', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.players[0].score, 600);
            json = JSON.stringify(game, null, 2);
        });
        it('player #2 is unchanged', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.players[1].score, 0);
            json = JSON.stringify(game, null, 2);
        });
        it('player #3 loses some', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.players[2].score, 100);
            json = JSON.stringify(game, null, 2);
        });
        it('in reveal state', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.state, GameModel.STATES.REVEAL);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('host presses continue', function () {
        it('state changes', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "continue"});
            let update = game.getUpdate();
            assert.equal(update.state, 4);
            json = JSON.stringify(game, null, 2);
        });
        it('loads correct (jeop) round', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.style, GameModel.STYLE.JEOPARDY);
            json = JSON.stringify(game, null, 2);
        });
        it('jeopardy starts in board state', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.state, GameModel.STATES.BOARD);
            json = JSON.stringify(game, null, 2);
        });
        it('no options blanked', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            update.round.spent.forEach(c => c.forEach(r => assert.equal(r, false)));
            json = JSON.stringify(game, null, 2);
        });
        it('current player is \'active player\'', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.current_player, "robin");
            json = JSON.stringify(game, null, 2);
        });
        it('player list doesn\'t contain current player', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.players.indexOf("robin"), -1);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('select question (first cat, $200)', function () {
        it('state changes', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "select", data: {col: 0, row: 1}});
            let update = game.getUpdate();
            assert.equal(update.state, 5);
            json = JSON.stringify(game, null, 2);
        });
        it('loads correct (jeop) round', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.style, GameModel.STYLE.JEOPARDY);
            json = JSON.stringify(game, null, 2);
        });
        it('jeopardy starts in question state', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.state, GameModel.STATES.QUESTION);
            json = JSON.stringify(game, null, 2);
        });
        it('column set to 0', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.col, 0);
            json = JSON.stringify(game, null, 2);
        });
        it('row set to 1', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.row, 1);
            json = JSON.stringify(game, null, 2);
        });
        it('type is text', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.type, "text");
            json = JSON.stringify(game, null, 2);
        });
        it('question is Q 1.2', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.question, "Q 1.2");
            json = JSON.stringify(game, null, 2);
        });
        it('answer text not provided', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "accept"});
            let update = game.getUpdate();
            assert.equal(update.round.answer, undefined);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('host presses continue', function () {
        it('state changes', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "continue"});
            let update = game.getUpdate();
            assert.equal(update.state, 6);
            json = JSON.stringify(game, null, 2);
        });
        it('answer text not provided', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.answer, undefined);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('host accepts answer before timer expires', function () {
        it('state changes', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "accept"});
            let update = game.getUpdate();
            assert.equal(update.state, 9);
            json = JSON.stringify(game, null, 2);
        });
        it('score for current player increases by 200', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "accept"});
            let update = game.getUpdate();
            assert.equal(update.players[0].score, 800);
            json = JSON.stringify(game, null, 2);
        });
        it('round state becomes reveal', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "accept"});
            let update = game.getUpdate();
            assert.equal(update.round.state, GameModel.STATES.REVEAL);
            json = JSON.stringify(game, null, 2);
        });
        it('answer text provided', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "accept"});
            let update = game.getUpdate();
            assert.equal(update.round.answer, "A 1.2");
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('host presses continue', function () {
        it('state changes', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "continue"});
            let update = game.getUpdate();
            assert.equal(update.state, 4);
            json = JSON.stringify(game, null, 2);
        });
        it('loads correct (jeop) round', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.style, GameModel.STYLE.JEOPARDY);
            json = JSON.stringify(game, null, 2);
        });
        it('jeopardy starts in board state', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.state, GameModel.STATES.BOARD);
            json = JSON.stringify(game, null, 2);
        });
        it('one option spent', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            update.round.spent[0][1] === true;
            json = JSON.stringify(game, null, 2);
        });
        it('active player order updates', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.players[0].name, "alex");
            assert.equal(update.players[1].name, "pat");
            assert.equal(update.players[2].name, "robin");
            json = JSON.stringify(game, null, 2);
        });
        it('current player is \'active player\'', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.current_player, "alex");
            json = JSON.stringify(game, null, 2);
        });
        it('player list doesn\'t contain current player', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.players.indexOf("alex"), -1);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('select previously selected question (first cat, $200)', function () {
        it('state does not change', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "select", data: {col: 0, row: 1}});
            let update = game.getUpdate();
            assert.equal(update.state, 4);
            json = JSON.stringify(game, null, 2);
        });
        it('current player does not change', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.current_player, "alex");
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('select question (first cat, $400)', function () {
        it('state changes', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "select", data: {col: 0, row: 3}});
            let update = game.getUpdate();
            assert.equal(update.state, 5);
            json = JSON.stringify(game, null, 2);
        });
        it('loads correct (jeop) round', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.style, GameModel.STYLE.JEOPARDY);
            json = JSON.stringify(game, null, 2);
        });
        it('jeopardy starts in question state', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.state, GameModel.STATES.QUESTION);
            json = JSON.stringify(game, null, 2);
        });
        it('column set to 0', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.col, 0);
            json = JSON.stringify(game, null, 2);
        });
        it('row set to 3', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.row, 3);
            json = JSON.stringify(game, null, 2);
        });
        it('type is text', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.type, "text");
            json = JSON.stringify(game, null, 2);
        });
        it('question is Q 1.4', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.question, "Q 1.4");
            json = JSON.stringify(game, null, 2);
        });
        it('answer text not provided', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "accept"});
            let update = game.getUpdate();
            assert.equal(update.round.answer, undefined);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('timer expires', function () {
        it('state does not change', function (done) {
            let game = Game.fromJSON(json);
            game.addListener("test", msg => {
                if (msg.input === 'expire') {
                    assert.equal(msg.state, 6);
                    game.removeListener("test");
                    done();
                }
            });

            game.onInput({action: "continue"});
            let update = game.getUpdate();
            assert.equal(update.state, 6);
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('host rejects answer after timer expires', function () {
        it('state changes', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "reject"});
            let update = game.getUpdate();
            assert.equal(update.state, 7);
            json = JSON.stringify(game, null, 2);
        });
        it('clear current player', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.current_player, '');
            json = JSON.stringify(game, null, 2);
        });
    });

    describe('player buzzes in', function () {
        describe('player has already answered', function () {
            it('no state change', function () {
                let game = Game.fromJSON(json);
                game.onInput({action: "buzz", data: {name: "alex"}});
                let update = game.getUpdate();
                assert.equal(update.state, 7);
                json = JSON.stringify(game, null, 2);
            });
        });
        describe('player has not already answered', function () {
            it('change state', function () {
                let game = Game.fromJSON(json);
                game.onInput({action: "buzz", data: {name: "pat"}});
                let update = game.getUpdate();
                assert.equal(update.state, 8);
                json = JSON.stringify(game, null, 2);
            });
            it('change current player', function () {
                let game = Game.fromJSON(json);
                let update = game.getUpdate();
                assert.equal(update.round.current_player, "pat");
                json = JSON.stringify(game, null, 2);
            });
            it('player is not longer in unanswered list', function () {
                let game = Game.fromJSON(json);
                let update = game.getUpdate();
                assert.equal(update.round.players.indexOf("pat"), -1);
                json = JSON.stringify(game, null, 2);
            });
        });
    });
    describe('answer rejected (not active player)', function () {
        it('state changes', function () {
            let game = Game.fromJSON(json);
            game.onInput({action: "reject"});
            let update = game.getUpdate();
            assert.equal(update.state, 7);
            json = JSON.stringify(game, null, 2);
        });
        it('score decreases', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            let score = update.players.find(p => p.name === 'pat').score;
            assert.equal(score, -100);
            json = JSON.stringify(game, null, 2);
        });
    });
    describe('timer expires no buzz in', function () {
        it('state changes', function (done) {
            let game = Game.fromJSON(json);
            game.addListener("test", msg => {
                if (msg.input === 'expire') {
                    assert.equal(msg.state, 9);
                    console.log(msg);
                    game.removeListener("test");
                    done();
                }
            });
            game.onInput({action: "expire"});
            json = JSON.stringify(game, null, 2);
        });
        it('round state set to reveal changes', function () {
            let game = Game.fromJSON(json);
            let update = game.getUpdate();
            assert.equal(update.round.state, 'reveal');
            json = JSON.stringify(game, null, 2);
        });
    });
});