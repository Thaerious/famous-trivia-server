// gameTest.js

import assert from 'assert';
import fs from 'fs';
import GameModel from '../src/server/GameModel.js';
import {Game, Timer} from '../src/server/Game.js';

const file = fs.readFileSync('./test/data/test-data-00.json');
const data = JSON.parse(file);

Timer.TIMES = {
    ANSWER : 1,
    BUZZ : 1,
    MULTIPLE_CHOICE : 1
}

describe('Game', function () {
    let gameModel = new GameModel(data);
    let game = new Game(gameModel);

    describe('#constructor()', function () {
        it('constructor sanity test', function () {
            assert.notEqual(game, null);
        });
    });

    describe('add 3 players to game', function () {
        game.onInput({action : "join", data : {name : "robin"}});
        game.onInput({action : "join", data : {name : "alex"}});
        game.onInput({action : "join", data : {name : "pat"}});

        it('has 3 players', function () {
            let update = game.getUpdate().data;
            
            assert.equal(update.model.players.length, 3);
        });
    });

    describe('start the game', function(){
        it('changes state', function(){
            game.onInput({action : "start"});
            let update = game.getUpdate().data;
            assert.equal(update.state, 1);
        });
        it('loads correct (mc) round', function(){
            game.onInput({action : "start"});
            let update = game.getUpdate().data;
            assert.equal(update.model.round.style, GameModel.STYLE.MULTIPLE_CHOICE);
        });
        it('multiple choice starts in question state', function(){
            game.onInput({action : "start"});
            let update = game.getUpdate().data;
            assert.equal(update.model.round.state, GameModel.STATES.QUESTION);
        });
        it('has correct question from file', function(){
            game.onInput({action : "start"});
            let update = game.getUpdate().data;
            assert.equal(update.model.round.question, "MC-QUESTION");
        });
    });

    describe('host clicks continue', function(){
        it('changes state', function(){
            game.onInput({action : "continue"});
            let update = game.getUpdate().data;
            assert.equal(update.state, 2);
        });
    });

    describe('give players fake scores', function(){
        it('check', function(){
            game.model.getPlayer("robin").score = 500;
            game.model.getPlayer("alex").score = 0;
            game.model.getPlayer("pat").score = 200;
            let update = game.getUpdate().data;
            assert.equal(update.model.players[0].score, 500);
            assert.equal(update.model.players[1].score, 0);
            assert.equal(update.model.players[2].score, 200);
        });
    });

    describe('answer values (bets) submitted', function(){
        it('updates player data (unseen until next state)', function(){
            game.onInput({action : "update", data : {name: "robin", index: "0", value: "100"}}); // incorrect
            game.onInput({action : "update", data : {name: "robin", index: "2", value: "200"}}); // correct
            game.onInput({action : "update", data : {name: "alex", index: "0", value: "100"}}); // can't be has 0
            game.onInput({action : "update", data : {name: "pat", index: "0", value: "100"}}); // bet not ignored
            game.onInput({action : "update", data : {name: "pat", index: "1", value: "200"}}); // bet ignored, over amount
        });
        it('state doesn\'t change', function(){
            let update = game.getUpdate().data;
            assert.equal(update.state, 2);
        });
    });

    describe('timer expires', function(){
        it('state changes', function(done){
            game.addListener("test", msg =>{
                let update = game.getUpdate().data;
                assert.equal(update.state, 3);
                game.removeListener("test");
                done();
            });
        });
        it('player #1 gains some loses some', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.players[0].score, 600);
        });
        it('player #2 is unchanged', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.players[1].score, 0);
        });
        it('player #3 loses some', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.players[2].score, 100);
        });
        it('in reveal state', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.state, GameModel.STATES.REVEAL);
        });
    });

    describe('host presses continue', function(){
        it('state changes', function(){
            game.onInput({action : "continue"});
            let update = game.getUpdate().data;
            assert.equal(update.state, 4);
        });
        it('loads correct (jeop) round', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.style, GameModel.STYLE.JEOPARDY);
        });
        it('jeopardy starts in board state', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.state, GameModel.STATES.BOARD);
        });
        it('no options blanked', function(){
            let update = game.getUpdate().data;
            update.model.round.spent.forEach(c=>c.forEach(r=>assert.equal(r, false)));
        });
        it('current player is \'active player\'', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.current_player, "robin");
        });
        it('player list doesn\'t contain current player', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.players.indexOf("robin"), -1);
        });
    });

    describe('select question (first cat, $200)', function(){
        it('state changes', function(){
            game.onInput({action : "select", data : {col : 0, row : 1}});
            let update = game.getUpdate().data;
            assert.equal(update.state, 5);
        });
        it('loads correct (jeop) round', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.style, GameModel.STYLE.JEOPARDY);
        });
        it('jeopardy starts in question state', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.state, GameModel.STATES.QUESTION);
        });
        it('column set to 0', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.col, 0);
        });
        it('row set to 1', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.row, 1);
        });
        it('type is text', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.type, "text");
        });
        it('question is Q 1.2', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.question, "Q 1.2");
        });
        it('answer text not provided', function(){
            game.onInput({action : "accept"});
            let update = game.getUpdate().data;
            assert.equal(update.model.round.answer, undefined);
        });
    });

    describe('host presses continue', function(){
        it('state changes', function(){
            game.onInput({action : "continue"});
            let update = game.getUpdate().data;
            assert.equal(update.state, 6);
        });
        it('answer text not provided', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.answer, undefined);
        });
    });

    describe('host accepts answer before timer expires', function(){
        it('state changes', function(){
            game.onInput({action : "accept"});
            let update = game.getUpdate().data;
            assert.equal(update.state, 9);
        });
        it('score for current player increases by 200', function(){
            game.onInput({action : "accept"});
            let update = game.getUpdate().data;
            assert.equal(update.model.players[0].score, 800);
        });
        it('round state becomes reveal', function(){
            game.onInput({action : "accept"});
            let update = game.getUpdate().data;
            assert.equal(update.model.round.state, GameModel.STATES.REVEAL);
        });
        it('answer text provided', function(){
            game.onInput({action : "accept"});
            let update = game.getUpdate().data;
            assert.equal(update.model.round.answer, "A 1.2");
        });
    });

    describe('host presses continue', function(){
        it('state changes', function(){
            game.onInput({action : "continue"});
            let update = game.getUpdate().data;
            assert.equal(update.state, 4);
        });
        it('loads correct (jeop) round', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.style, GameModel.STYLE.JEOPARDY);
        });
        it('jeopardy starts in board state', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.state, GameModel.STATES.BOARD);
        });
        it('one option spent', function(){
            let update = game.getUpdate().data;
            update.model.round.spent[0][1] === true;
        });
        it('active player order updates', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.players[0].name, "alex");
            assert.equal(update.model.players[1].name, "pat");
            assert.equal(update.model.players[2].name, "robin");
        });
        it('current player is \'active player\'', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.current_player, "alex");
        });
        it('player list doesn\'t contain current player', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.players.indexOf("alex"), -1);
        });
    });

    describe('select previously selected question (first cat, $200)', function(){
        it('state does not change', function(){
            game.onInput({action : "select", data : {col : 0, row : 1}});
            let update = game.getUpdate().data;
            assert.equal(update.state, 4);
        });
        it('current player does not change', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.current_player, "alex");
        });
    });

    describe('select question (first cat, $400)', function(){
        it('state changes', function(){
            game.onInput({action : "select", data : {col : 0, row : 3}});
            let update = game.getUpdate().data;
            assert.equal(update.state, 5);
        });
        it('loads correct (jeop) round', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.style, GameModel.STYLE.JEOPARDY);
        });
        it('jeopardy starts in question state', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.state, GameModel.STATES.QUESTION);
        });
        it('column set to 0', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.col, 0);
        });
        it('row set to 3', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.row, 3);
        });
        it('type is text', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.type, "text");
        });
        it('question is Q 1.4', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.question, "Q 1.4");
        });
        it('answer text not provided', function(){
            game.onInput({action : "accept"});
            let update = game.getUpdate().data;
            assert.equal(update.model.round.answer, undefined);
        });
    });

    describe('timer expires', function(){
        it('state does not change', function(done){
            game.addListener("test", msg =>{
                if (msg.data.input === 'expire') {
                    assert.equal(msg.data.state, 6);
                    game.removeListener("test");
                    done();
                }
            });

            game.onInput({action : "continue"});
            let update = game.getUpdate().data;
            assert.equal(update.state, 6);
        });
    });

    describe('host rejects answer after timer expires', function(){
        it('state changes', function(){
            game.onInput({action : "reject"});
            let update = game.getUpdate().data;
            assert.equal(update.state, 7);
        });
        it('clear current player', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.current_player, '');
        });
    });

    describe('player buzzes in', function(){
        describe('player has already answered', function(){
            it('no state change', function(){
                game.onInput({action : "buzz", data:{name : "alex"}});
                let update = game.getUpdate().data;
                assert.equal(update.state, 7);
            });
        });
        describe('player has not already answered', function(){
            it('change state', function(){
                game.onInput({action : "buzz", data:{name : "pat"}});
                let update = game.getUpdate().data;
                assert.equal(update.state, 8);
            });
            it('change current player', function(){
                let update = game.getUpdate().data;
                assert.equal(update.model.round.current_player, "pat");
            });
            it('player is not longer in unanswered list', function(){
                let update = game.getUpdate().data;
                assert.equal(update.model.round.players.indexOf("pat"), -1);
            });
        });
    });
    describe('answer rejected (not active player)', function(){
        it('state changes', function(){
            game.onInput({action : "reject"});
            let update = game.getUpdate().data;
            assert.equal(update.state, 7);
        });
        it('score decreases', function(){
            let update = game.getUpdate().data;
            let score = update.model.players.find(p=>p.name === 'pat').score;
            assert.equal(score, -100);
        });
    });
    describe('timer expires no buzz in', function(){
        it('state changes', function(done){
            game.addListener("test", msg =>{
                if (msg.data.input === 'expire') {
                    assert.equal(msg.data.state, 9);
                    game.removeListener("test");
                    done();
                }
            });
        });
        it('round state set to reveal changes', function(){
            let update = game.getUpdate().data;
            assert.equal(update.model.round.state, 'reveal');
        });
    });
});