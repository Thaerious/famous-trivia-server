// gameModelTest.js

import assert from 'assert';
import fs from 'fs';
import GameModel from '../src/server/GameModel.js';

const file = fs.readFileSync('./test/data/test-data-00.json');
const data = JSON.parse(file);

describe('GameModel', function () {
    describe('#constructor()', function () {
        it('constructor sanity test', function () {
            new GameModel(data);
        });
    });

    describe('#players', function(){
        const gameModel = new GameModel(data);
        gameModel.addPlayer('a');
        gameModel.addPlayer('b');
        gameModel.addPlayer('c');
        gameModel.addPlayer('d');
        it('has the length of player count', function () {
            assert.equal(gameModel.players.length, 4);
        });
    });
    describe('#round', function () {
        const gameModel = new GameModel(data);
        it('starts on round -1 (no round)', function () {
            assert.equal(gameModel.round, -1);
        });
        it('set round to #1', function () {
            gameModel.round = 1;
            assert.equal(gameModel.round, 1);
        });
        it("can't set round to < 0, defaults to first round", function () {
            gameModel.round = -1;
            assert.equal(gameModel.round, 0);
        });
        it("can't set round to > length, defaults to last round", function () {
            gameModel.round = 2;
            assert.equal(gameModel.round, 1);
        });
    });
    describe('#getRound', function () {
        const gameModel = new GameModel(data);
        it('get the current round', function () {
            gameModel.setRound(0);
            assert.equal(gameModel.getRound().constructor.name, "MultipleChoiceModel");
        });
        it('get the first round', function () {
            assert.equal(gameModel.setRound(0).constructor.name, "MultipleChoiceModel");
        });
        it('get the second round', function () {
            assert.equal(gameModel.setRound(1).constructor.name, "JeopardyModel");
        });
    });
    describe('#nextRound', function () {
        const gameModel = new GameModel(data);
        it('first call gets first round', function () {
            assert.equal(gameModel.nextRound().constructor.name, "MultipleChoiceModel");
        });
        it('second call gets second round', function () {
            assert.equal(gameModel.nextRound().constructor.name, "JeopardyModel");
        });
        it('gets next index if get round was called', function () {
            assert.equal(gameModel.setRound(0).constructor.name, "MultipleChoiceModel");
            assert.equal(gameModel.nextRound().constructor.name, "JeopardyModel");
        });
    });
    describe('#addPlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = null;
        let player2 = null;
        it('no players has no player count', function () {
            assert.equal(gameModel.playerCount(), 0);
        });
        it('no players has no active player', function () {
            assert.equal(gameModel.activePlayer, null);
        });
        it('adding first player sets active player', function () {
            player1 = gameModel.addPlayer("a");
            assert.equal(gameModel.activePlayer, player1);
        });
        it('adding second player doesn\'t set active player', function () {
            player2 = gameModel.addPlayer("b");
            assert.equal(gameModel.activePlayer, player1);
        });
        it('adding a duplicate name doesn\'t change the state.  returns previous player', function () {
            let player3 = gameModel.addPlayer("a");
            assert.equal(player3, player1);
            assert.equal(gameModel.playerCount(), 2);
        });
        it('new player object has default values', function () {
            assert.equal(player1.name, "a");
            assert.equal(player1.score, 0);
            assert.equal(player1.enabled, true);
        });
    });
    describe('#getPlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        it('returns player object if the names match', function () {
            assert.equal(gameModel.getPlayer("a"), player1);
        });
        it('returns null if there is no matching name', function () {
            assert.equal(gameModel.getPlayer("c"), null);
        });
    });
    describe('#hasPlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        it('returns true if there is a matching name', function () {
            assert.equal(gameModel.hasPlayer("a"), true);
        });
        it('returns false if there is not a matching name', function () {
            assert.equal(gameModel.hasPlayer("c"), false);
        });
    });
    describe('#setActivePlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('return true if player found', function () {
            assert.equal(gameModel.setActivePlayer('a'), true);
        });
        it('return true if player found', function () {
            assert.equal(gameModel.setActivePlayer('c'), true);
        });
        it('return false if player not found', function () {
            assert.equal(gameModel.setActivePlayer('d'), false);
        });
        it('named player will now be active player', function () {
            gameModel.setActivePlayer('b')
            assert.equal(gameModel.activePlayer, player2);
        });
        it('active player won\'t change if name unknown', function () {
            gameModel.setActivePlayer('d')
            assert.equal(gameModel.activePlayer, player2);
        });
    });
    describe('#nextActivePlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('return null if no players found', function () {
            assert.equal(new GameModel().nextActivePlayer(), null);
        });
        it('return new active player', function () {
            assert.equal(gameModel.nextActivePlayer(), player2);
        });
        it('active player field changes', function () {
            gameModel.nextActivePlayer();
            assert.equal(gameModel.activePlayer, player3);
        });
        it('disabled players do not become active', function () {
            gameModel.disablePlayer(player1.name);
            gameModel.nextActivePlayer();
            assert.equal(gameModel.activePlayer, player2);
        });
        it('enabled players become active', function () {
            gameModel.enablePlayer(player1.name);
            gameModel.nextActivePlayer();
            gameModel.nextActivePlayer();
            assert.equal(gameModel.activePlayer, player1);
        });
    });
    describe('#removePlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('returns a removed players object', function () {
            assert.equal(gameModel.removePlayer("a"), player1);
        });
        it('returns null if the player isn\'t found', function () {
            assert.equal(gameModel.removePlayer("a"), null);
        });
        it('active player field changes', function () {
            assert.equal(gameModel.activePlayer, player2);
        });
    });
    describe('#enablePlayer #disablePlayer #isEnabled', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('disabled => isEnabled : false', function () {
            gameModel.disablePlayer(player3.name);
            assert.equal(gameModel.isEnabled(player3.name), false);
        });
        it('enabled => isEnabled : true', function () {
            gameModel.enablePlayer(player3.name);
            assert.equal(gameModel.isEnabled(player3.name), true);
        });
        it('players are enabled by default', function () {
            assert.equal(gameModel.isEnabled(player2.name), true);
        });
    });
});

describe('MultipleChoiceModel', function () {

    describe('#constructor()', function () {
        it('constructor sanity test', function () {
            new GameModel(data).setRound(0);
        });
        it('constructor starts in question state', function () {
            let state = new GameModel(data).setRound(0).state.state;
            assert.equal(state, GameModel.STATES.QUESTION);
        });
        it('has state style set to multiple choice', function(){
            let state = new GameModel(data).setRound(0).state;
            assert.equal(state.style, GameModel.STYLE.MULTIPLE_CHOICE);
        });
    });

    describe('#setQuestionState()', function () {
        let mcModel = new GameModel(data).setRound(0);

        it('return value is non-reflective', function () {
            let state = mcModel.state;
            state.state = "X";
            assert.equal(mcModel.state.state, GameModel.STATES.QUESTION);
        });
        it('has the question in the data', function () {
            assert.equal(mcModel.state.question, "MC-QUESTION");
        });
        it('does not have the answers in the state data', function () {
            assert.equal(mcModel.state.answers, undefined);
        });
        it('does not have the values in the state data', function () {
            assert.equal(mcModel.state.values, undefined);
        });
        it('has state style set to multiple choice', function(){
            let state = new GameModel(data).setRound(0).state;
            assert.equal(state.style, GameModel.STYLE.MULTIPLE_CHOICE);
        });
    });

    describe('#setAnswerState()', function () {
        let mcModel = new GameModel(data).setRound(0);
        mcModel.setAnswerState();

        it('return value is non-reflective', function () {
            let state = mcModel.state;
            state.state = "X";
            assert.equal(mcModel.state.state, GameModel.STATES.ANSWER);
        });
        it('has the question in the data', function () {
            assert.equal(mcModel.state.question, "MC-QUESTION");
        });
        it('has the answers in the data', function () {
            assert.notEqual(mcModel.state.answers, undefined);
        });
        it('answers is an array', function () {
            assert.equal(mcModel.state.answers.constructor.name, 'Array');
        });
        it('contains values (from file)', function () {
            assert.equal(mcModel.state.answers[0], 'MC-ANSWER1');
            assert.equal(mcModel.state.answers[3], 'MC-ANSWER4');
        });
        it('does not have the values in the state data', function () {
            assert.equal(mcModel.state.values, undefined);
        });
        it('has state style set to multiple choice', function(){
            let state = new GameModel(data).setRound(0).state;
            assert.equal(state.style, GameModel.STYLE.MULTIPLE_CHOICE);
        });
    });

    describe('#setRevealState()', function () {
        let mcModel = new GameModel(data).setRound(0);
        mcModel.setRevealState();

        it('return value is non-reflective', function () {
            let state = mcModel.state;
            state.state = "X";
            assert.equal(mcModel.state.state, GameModel.STATES.REVEAL);
        });
        it('has the question in the data', function () {
            assert.equal(mcModel.state.question, "MC-QUESTION");
        });
        it('has the answers in the data', function () {
            assert.notEqual(mcModel.state.answers, undefined);
        });
        it('answers is an array', function () {
            assert.equal(mcModel.state.values.constructor.name, 'Array');
        });
        it('has the values in the data', function () {
            assert.notEqual(mcModel.state.values, undefined);
        });
        it('contains values (from file)', function () {
            assert.equal(mcModel.state.values[0], false);
            assert.equal(mcModel.state.values[2], true);
        });
        it('has state style set to multiple choice', function(){
            let state = new GameModel(data).setRound(0).state;
            assert.equal(state.style, GameModel.STYLE.MULTIPLE_CHOICE);
        });
    });

});

describe('JeopardyModel', function () {
    let gameModel = new GameModel(data);
    gameModel.addPlayer("a");
    gameModel.addPlayer("c");
    gameModel.addPlayer("b");

    describe('#constructor()', function () {
        it('constructor sanity test', function () {
            let round = gameModel.setRound(1);
            assert.notEqual(round, null);
        });
        it('constructor starts with current player', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.hasCurrent(), true);
        });
        it('has state style set to jeopardy', function(){
            let state = new GameModel(data).setRound(1).state;
            assert.equal(state.style, GameModel.STYLE.JEOPARDY);
        });
        it('starts in board state', function(){
            let state = new GameModel(data).setRound(1).state;
            assert.equal(state.state, GameModel.STATES.BOARD);
        });
    });

    describe('#countPlayers()', function () {
        it('starts with all players - 1', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.countPlayers, 2);
        });
    });

    describe('#hasPlayer()', function () {
        it('true if has player', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.hasPlayer('b'), true);
        });
        it('false if not has player', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.hasPlayer('d'), false);
        });
        it('false if null', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.hasPlayer(null), false);
        });
        it('false if undefined', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.hasPlayer(), false);
        });
    });

    describe('#removePlayer()', function () {
        it('has player, returns true', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.removePlayer('b'), true);
        });
        it('not has player, returns false', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.removePlayer('d'), false);
        });
        it('null, returns false', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.removePlayer(null), false);
        });
        it('undefined, returns false', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.removePlayer(), false);
        });
        it("new round will create new player list", function () {
            let round = gameModel.setRound(1);
            assert.equal(round.removePlayer('b'), true);
            round = gameModel.setRound(1);
            assert.equal(round.hasPlayer('b'), true);
        });
    });

    describe('current player functions', function () {
        it('starts with current player', function () {
            let round = gameModel.setRound(1);
            assert.equal(round.hasCurrent(), true);
        });
        it('set current => has current', function () {
            let round = gameModel.setRound(1);
            round.setCurrent('b')
            assert.equal(round.hasCurrent(), true);
            assert.equal(round.getCurrent(), 'b');
        });

        describe('#setCurrent', function () {
            it('returns true if new value set', function () {
                let round = gameModel.setRound(1);
                assert.equal(round.setCurrent('b'), true);
            });
            it("returns false if new value not set (can't unknown name)", function () {
                let round = gameModel.setRound(1);
                assert.equal(round.setCurrent('d'), false);
            });
            it("removes previous player if remove set (default)", function () {
                let round = gameModel.setRound(1);
                round.setCurrent('a');
                round.setCurrent('b');
                assert.equal(round.hasPlayer('a'), false);
            });
            it("setCurrent => hasCurrent", function () {
                let round = gameModel.setRound(1);
                round.setCurrent('a');
                assert.equal(round.hasCurrent(), true);
            });
            it("setCurrent(x) => getCurrent(x)", function () {
                let round = gameModel.setRound(1);
                round.setCurrent('a');
                assert.equal(round.getCurrent(), 'a');
            });
        });
        describe('#clearCurrent', function () {
            it('returns true if a change was made', function () {
                let round = gameModel.setRound(1);
                round.setCurrent('a');
                assert.equal(round.clearCurrent('a'), true);
            });
            it('returns false if a current was not set', function () {
                let round = gameModel.setRound(1);
                assert.equal(round.clearCurrent(), true);
                assert.equal(round.clearCurrent(), false);
            });
            it('removes player if remove set (default)', function () {
                let round = gameModel.setRound(1);
                round.setCurrent('a');
                round.clearCurrent();
                assert.equal(round.hasPlayer('a'), false);
            });
            it('removes player if remove set', function () {
                let round = gameModel.setRound(1);
                round.setCurrent('a');
                round.clearCurrent(true);
                assert.equal(round.hasPlayer('a'), false);
            });
            it('does not remove player if remove set to false', function () {
                let round = gameModel.setRound(1);
                round.setCurrent('a');
                round.clearCurrent(false);
                assert.equal(round.hasPlayer('b'), true);
            });
            it('clears current if remove set to false', function () {
                let round = gameModel.setRound(1);
                round.setCurrent('a');
                round.clearCurrent(false);
                assert.equal(round.getCurrent(), '');
                assert.equal(round.hasCurrent(), false);
            });
        });
    });

    describe('#setQuestionState()', function () {
        it('sets correct state data from file #1', function () {
            let round = gameModel.setRound(1);
            let state = round.setQuestionState(0, 0);
            assert.equal(state.state, GameModel.STATES.QUESTION);
            assert.equal(state.col, 0);
            assert.equal(state.row, 0);
            assert.equal(state.type, "text");
            assert.equal(state.question, "Q 1.1");
        });
        it('sets correct state data from file #2', function () {
            let round = gameModel.setRound(1);
            let state = round.setQuestionState(1, 0);
            assert.equal(state.state, GameModel.STATES.QUESTION);
            assert.equal(state.col, 1);
            assert.equal(state.row, 0);
            assert.equal(state.type, "text");
            assert.equal(state.question, "Q 2.1");
        });
        it('has state style set to jeopardy', function(){
            let state = new GameModel(data).setRound(1).state;
            assert.equal(state.style, GameModel.STYLE.JEOPARDY);
        });
    });

    describe('#setRevealState()', function () {
        it('sets correct state data from file', function () {
            let round = gameModel.setRound(1);
            let state = round.setRevealState(0, 0);
            assert.equal(state.state, GameModel.STATES.REVEAL);
            assert.equal(state.col, 0);
            assert.equal(state.row, 0);
            assert.equal(state.type, "text");
            assert.equal(state.question, "Q 1.1");
            assert.equal(state.answer, "A 1.1");
        });
        it("get's implied col:row from set question state", function () {
            let round = gameModel.setRound(1);
            round.setQuestionState(1, 0);
            let state = round.setRevealState();
            assert.equal(state.state, GameModel.STATES.REVEAL);
            assert.equal(state.col, 1);
            assert.equal(state.row, 0);
            assert.equal(state.type, "text");
            assert.equal(state.question, "Q 2.1");
            assert.equal(state.answer, "A 2.1");
        });
        it('has state style set to jeopardy', function(){
            let state = new GameModel(data).setRound(1).state;
            assert.equal(state.style, GameModel.STYLE.JEOPARDY);
        });
    });

    describe('#getState', function () {
        let round = gameModel.setRound(1);

        it("is board if no state has been set", function () {
            assert.equal(round.getState(), GameModel.STATES.BOARD);
        });
    });

    describe('getters', function () {
        let round = gameModel.setRound(1);
        let state = round.setRevealState(0, 0);

        it("value", function () {
            assert.equal(round.getValue(), 100);
        });
        it("question", function () {
            assert.equal(round.getQuestion(), "Q 1.1");
        });
        it("answer", function () {
            assert.equal(round.getQuestion(), "Q 1.1");
        });
        it("type", function () {
            assert.equal(round.getType(), "text");
        });
        it("state", function () {
            assert.equal(round.getState(), GameModel.STATES.REVEAL);
        });
    });

    describe('#isSpent()', function () {
        let round = gameModel.setRound(1);
        it("starts not spent", function () {
            assert.equal(round.isSpent(0, 0), false);
        });
        it("setSpent => isSpent", function () {
            round.setSpent(0, 0);
            assert.equal(round.isSpent(0, 0), true);
        });
    });

    describe('#setSpent()', function () {
        let round = gameModel.setRound(1);
        it("sets last question col/row when parameters omitted", function () {
            round.setQuestionState(3, 1);
            round.setSpent();
            assert.equal(round.isSpent(3, 1), true);
        });
    });

    describe ('#getUpdate()', function (){
        let round = gameModel.setRound(1);
        let update = round.getUpdate();

        it("has the same state as the model", function () {
            assert.equal(round.stateData.state, update.state)
        });

        it("has player data", function () {
            assert.equal(update.players[0], 'b');
            assert.equal(update.players[1], 'c');
        });

        it("has category data", function () {
            console.log(update);
            assert.notEqual(update.categories, undefined);
        });

        it("has specific category data", function () {
            assert.equal(update.categories[0].text, "CATEGORY\n1");
        });

        it("has category text size data", function () {
            assert.equal(update.categories[0]['font-size'], "16px");
        });

        it("has value data", function () {
            assert.notEqual(update.values, undefined);
        });

        it("check value data", function () {
            assert.equal(update.values[0][0], 100);
            assert.equal(update.values[3][0], 100);
            assert.equal(update.values[3][2], 300);
        });
    });


});


