// gameModelTest.js

import assert from 'assert';
import fs from 'fs';
import GameModel from '../src/server/GameModel.js';

const file = fs.readFileSync('./test/data/test-data-00.json');
const data = JSON.parse(file);

console.log(data);

describe('GameModel', function() {
    describe('#constructor()', function() {
        it('constructor sanity test', function() {
            new GameModel(data);
        });
    });
    describe('round', function() {
        const gameModel = new GameModel(data);
        it('starts on round #0', function() {
            assert.equal(gameModel.round, 0);
        });
        it('set round to #1', function() {
            gameModel.round = 1;
            assert.equal(gameModel.round, 1);
        });
        it("can't set round to < 0, defaults to first round", function() {
            gameModel.round = -1;
            assert.equal(gameModel.round, 0);
        });
        it("can't set round to > length, defaults to last round", function() {
            gameModel.round = 2;
            assert.equal(gameModel.round, 1);
        });
    });
    describe('getRound', function() {
        const gameModel = new GameModel(data);
        it('get the current round', function() {
            assert.equal(gameModel.getRound().constructor.name, "MultipleChoiceModel");
        });
        it('get the first round', function() {
            assert.equal(gameModel.getRound(0).constructor.name, "MultipleChoiceModel");
        });
        it('get the second round', function() {
            assert.equal(gameModel.getRound(1).constructor.name, "JeopardyModel");
        });
    });
    describe('addPlayer', function() {
        const gameModel = new GameModel(data);
        let player1 = null;
        let player2 = null;
        it('no players has no player count', function() {
            assert.equal(gameModel.playerCount(), 0);
        });
        it('no players has no active player', function() {
            assert.equal(gameModel.activePlayer, null);
        });
        it('adding first player sets active player', function() {
            player1 = gameModel.addPlayer("a");
            assert.equal(gameModel.activePlayer, player1);
        });
        it('adding second player doesn\'t set active player', function() {
            player2 = gameModel.addPlayer("b");
            assert.equal(gameModel.activePlayer, player1);
        });
        it('adding a duplicate name doesn\'t change the state.  returns previous player', function() {
            let player3 = gameModel.addPlayer("a");
            assert.equal(player3, player1);
            assert.equal(gameModel.playerCount(), 2);
        });
        it('new player object has default values', function() {
            assert.equal(player1.name, "a");
            assert.equal(player1.score, 0);
            assert.equal(player1.buzzer, "enabled");
            assert.equal(player1.enabled, true);
        });
    });
    describe('getPlayer', function() {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        it('returns player object if the names match', function() {
            assert.equal(gameModel.getPlayer("a"), player1);
        });
        it('returns null if there is no matching name', function() {
            assert.equal(gameModel.getPlayer("c"), null);
        });
    });
    describe('hasPlayer', function() {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        it('returns true if there is a matching name', function() {
            assert.equal(gameModel.hasPlayer("a"), true);
        });
        it('returns false if there is not a matching name', function() {
            assert.equal(gameModel.hasPlayer("c"), false);
        });
    });
    describe('countEnabledBuzzers', function() {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('returns 0 if there are no enabled buzzers', function() {
            player1.buzzer = "disabled";
            player2.buzzer = "disabled";
            player3.buzzer = "disabled";
            assert.equal(gameModel.countEnabledBuzzers(), 0);
        });
        it('returns 2 if there are 2 enabled buzzers', function() {
            player1.buzzer = "enabled";
            player2.buzzer = "enabled";
            assert.equal(gameModel.countEnabledBuzzers(), 2);
        });
    });

    describe('enableAllBuzzers', function() {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('count 3 buzzers after enable all buzzers', function() {
            player1.buzzer = "disabled";
            player3.buzzer = "disabled";
            gameModel.enableAllBuzzers();
            assert.equal(gameModel.countEnabledBuzzers(), 3);
        });
    });
    describe('setActivePlayer', function() {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('return true if player found', function() {
            assert.equal(gameModel.setActivePlayer('a'), true);
        });
        it('return true if player found', function() {
            assert.equal(gameModel.setActivePlayer('c'), true);
        });
        it('return false if player not found', function() {
            assert.equal(gameModel.setActivePlayer('d'), false);
        });
        it('named player will now be active player', function() {
            gameModel.setActivePlayer('b')
            assert.equal(gameModel.activePlayer, player2);
        });
        it('active player won\'t change if name unknown', function() {
            gameModel.setActivePlayer('d')
            assert.equal(gameModel.activePlayer, player2);
        });
    });
    describe('nextActivePlayer', function() {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('return null if no players found', function() {
            assert.equal(new GameModel().nextActivePlayer(), null);
        });
        it('return new active player', function() {
            assert.equal(gameModel.nextActivePlayer(), player2);
        });
        it('active player field changes', function() {
            gameModel.nextActivePlayer()
            assert.equal(gameModel.activePlayer, player3);
        });
    });
    describe('removePlayer', function() {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('returns a removed players object', function() {
            assert.equal(gameModel.removePlayer("a"), player1);
        });
        it('returns null if the player isn\'t found', function() {
            assert.equal(gameModel.removePlayer("a"), null);
        });
        it('active player field changes', function() {
            assert.equal(gameModel.activePlayer, player2);
        });
    });
});