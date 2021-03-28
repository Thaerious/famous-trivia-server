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
            let update = game.getUpdate();
            assert.equal(update.players.length, 3);
        });
    });

    describe('start the game', function(){
        it('changes state', function(){
            game.onInput({action : "start"});
            let update = game.getUpdate();
            assert.equal(update.state, 1);
        });
        it('loads correct (mc) round', function(){
            game.onInput({action : "start"});
            let update = game.getUpdate();
            assert.equal(update.round.style, GameModel.STYLE.MULTIPLE_CHOICE);
        });
        it('multiple choice starts in question state', function(){
            game.onInput({action : "start"});
            let update = game.getUpdate();
            assert.equal(update.round.state, GameModel.STATES.QUESTION);
        });
        it('has correct question from file', function(){
            game.onInput({action : "start"});
            let update = game.getUpdate();
            assert.equal(update.round.question, "MC-QUESTION");
        });
    });

    describe('host clicks continue', function(){
        it('changes state', function(){
            game.onInput({action : "continue"});
            let update = game.getUpdate();
            assert.equal(update.state, 2);
        });
    });

    describe('give players fake scores', function(){
        it('check', function(){
            game.model.getPlayer("robin").score = 500;
            game.model.getPlayer("alex").score = 0;
            game.model.getPlayer("pat").score = 200;
            let update = game.getUpdate();
            assert.equal(update.players[0].score, 500);
            assert.equal(update.players[1].score, 0);
            assert.equal(update.players[2].score, 200);
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
            let update = game.getUpdate();
            assert.equal(update.state, 2);
        });
    });

    describe('timer expires', function(){
        it('state changes', function(done){
            game.addListener("test", msg =>{
                let update = game.getUpdate();
                assert.equal(update.state, 3);
                game.removeListener("test");
                done();
            });
        });
        it('player #1 gains some loses some', function(){
            let update = game.getUpdate();
            assert.equal(update.players[0].score, 600);
        });
        it('player #2 is unchanged', function(){
            let update = game.getUpdate();
            assert.equal(update.players[1].score, 0);
        });
        it('player #3 loses some', function(){
            let update = game.getUpdate();
            assert.equal(update.players[2].score, 100);
        });
        it('in reveal state', function(){
            let update = game.getUpdate();
            console.log(update);
            assert.equal(update.round.state, GameModel.STATES.REVEAL);
        });
    });
});