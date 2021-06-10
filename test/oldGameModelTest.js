// oldGameModelTest.js
// noinspection JSUnresolvedFunction,DuplicatedCode

import assert from 'assert';
import fs from 'fs';
import GameModel from '../src/server/game/GameModel.js';

const file = fs.readFileSync('./test/data/test-data-01.json');
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
            assert.strictEqual(gameModel.players.length, 4);
        });
        it(`doesn't allow for duplicate names`, function () {
            gameModel.addPlayer('d');
            assert.strictEqual(gameModel.players.length, 4);
        });
    });
    describe('#round', function () {
        const gameModel = new GameModel(data);
        gameModel.addPlayer('a');
        gameModel.addPlayer('b');
        gameModel.addPlayer('c');
        gameModel.addPlayer('d');

        it('starts on round -1 (no round)', function () {
            assert.strictEqual(gameModel.roundIndex, -1);
        });
        it('set round to #1', function () {
            gameModel.setRound(1);
            assert.strictEqual(gameModel.roundIndex, 1);
        });
        it("can't set round to < 0, no change made", function () {
            const round_index_before = gameModel.roundIndex;
            gameModel.setRound(-1);
            assert.strictEqual(gameModel.roundIndex, round_index_before);
        });
        it("can't set round to > length, no change made", function () {
            const round_index_before = gameModel.roundIndex;
            gameModel.setRound(3);
            assert.strictEqual(gameModel.roundIndex, round_index_before);
        });
    });
    describe('#getRound / #setRound', function () {
        const gameModel = new GameModel(data);
        gameModel.addPlayer('a');
        gameModel.addPlayer('b');
        gameModel.addPlayer('c');
        gameModel.addPlayer('d');

        it('get the current round', function () {
            gameModel.setRound(0);
            assert.strictEqual(gameModel.getRound().constructor.name, "MultipleChoiceModel");
        });
        it('get the first round', function () {
            assert.strictEqual(gameModel.setRound(0).constructor.name, "MultipleChoiceModel");
        });
        it('get the second round', function () {
            assert.strictEqual(gameModel.setRound(1).constructor.name, "JeopardyModel");
        });
    });
    describe('#nextRound', function () {
        const gameModel = new GameModel(data);
        gameModel.addPlayer('a');
        gameModel.addPlayer('b');
        gameModel.addPlayer('c');
        gameModel.addPlayer('d');

        it('first call gets first round', function () {
            assert.strictEqual(gameModel.nextRound().constructor.name, "MultipleChoiceModel");
        });
        it('second call gets second round', function () {
            assert.strictEqual(gameModel.nextRound().constructor.name, "JeopardyModel");
        });
        it('gets next index if get round was called', function () {
            assert.strictEqual(gameModel.setRound(0).constructor.name, "MultipleChoiceModel");
            assert.strictEqual(gameModel.nextRound().constructor.name, "JeopardyModel");
        });
    });
    describe('#addPlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = null;
        let player2 = null;
        it('no players has no active player', function () {
            assert.strictEqual(gameModel.activePlayer, null);
        });
        it('adding first player sets active player', function () {
            player1 = gameModel.addPlayer("a");
            assert.strictEqual(gameModel.activePlayer, player1);
        });
        it('adding second player doesn\'t set active player', function () {
            player2 = gameModel.addPlayer("b");
            assert.strictEqual(gameModel.activePlayer, player1);
        });
        it('adding a duplicate name doesn\'t change the state.  returns previous player', function () {
            let player3 = gameModel.addPlayer("a");
            assert.strictEqual(player3, player1);
        });
        it('new player object has default values', function () {
            assert.strictEqual(player1.name, "a");
            assert.strictEqual(player1.score, 0);
            assert.strictEqual(player1.enabled, true);
        });
    });
    describe('#getPlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        it('returns player object if the names match', function () {
            assert.strictEqual(gameModel.getPlayer("a"), player1);
        });
        it('returns null if there is no matching name', function () {
            assert.strictEqual(gameModel.getPlayer("c"), null);
        });
    });
    describe('#hasPlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        it('returns true if there is a matching name', function () {
            assert.strictEqual(gameModel.hasPlayer("a"), true);
        });
        it('returns false if there is not a matching name', function () {
            assert.strictEqual(gameModel.hasPlayer("c"), false);
        });
    });
    describe('#setActivePlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('return true if player found', function () {
            assert.strictEqual(gameModel.setActivePlayer('a'), true);
        });
        it('return true if player found', function () {
            assert.strictEqual(gameModel.setActivePlayer('c'), true);
        });
        it('return false if player not found', function () {
            assert.strictEqual(gameModel.setActivePlayer('d'), false);
        });
        it('named player will now be active player', function () {
            gameModel.setActivePlayer('b')
            assert.strictEqual(gameModel.activePlayer, player2);
        });
        it('active player won\'t change if name unknown', function () {
            gameModel.setActivePlayer('d')
            assert.strictEqual(gameModel.activePlayer, player2);
        });
    });
    describe('#nextActivePlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('return null if no players found', function () {
            assert.strictEqual(new GameModel().nextActivePlayer(), null);
        });
        it('return new active player', function () {
            assert.strictEqual(gameModel.nextActivePlayer(), player2);
        });
        it('active player field changes', function () {
            gameModel.nextActivePlayer();
            assert.strictEqual(gameModel.activePlayer, player3);
        });
        it('disabled players do not become active', function () {
            gameModel.disablePlayer(player1.name);
            gameModel.nextActivePlayer();
            assert.strictEqual(gameModel.activePlayer, player2);
        });
        it('enabled players become active', function () {
            gameModel.enablePlayer(player1.name);
            gameModel.nextActivePlayer();
            gameModel.nextActivePlayer();
            assert.strictEqual(gameModel.activePlayer, player1);
        });
    });
    describe('#removePlayer', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");

        it('returns a removed players object', function () {
            assert.strictEqual(gameModel.removePlayer("a"), player1);
        });
        it('returns null if the player isn\'t found', function () {
            assert.strictEqual(gameModel.removePlayer("a"), null);
        });
        it('active player field changes', function () {
            assert.strictEqual(gameModel.activePlayer, player2);
        });
    });
    describe('#enablePlayer #disablePlayer #isEnabled', function () {
        const gameModel = new GameModel(data);
        let player1 = gameModel.addPlayer("a");
        let player2 = gameModel.addPlayer("b");
        let player3 = gameModel.addPlayer("c");
        it('disabled => isEnabled : false', function () {
            gameModel.disablePlayer(player3.name);
            assert.strictEqual(gameModel.isEnabled(player3.name), false);
        });
        it('enabled => isEnabled : true', function () {
            gameModel.enablePlayer(player3.name);
            assert.strictEqual(gameModel.isEnabled(player3.name), true);
        });
        it('players are enabled by default', function () {
            assert.strictEqual(gameModel.isEnabled(player2.name), true);
        });
    });
});

describe('MultipleChoiceModel', function () {

    describe('#constructor()', function () {
        it('constructor sanity test', function () {
            new GameModel(data).setRound(0);
        });
    });

    describe('#setAnswerState()', function () {
        let mcModel = new GameModel(data).setRound(0);
        mcModel.setAnswerState();

        it('has the question in the data', function () {
            assert.strictEqual(mcModel.stateData.question, "MC-QUESTION");
        });
        it('has the answers in the data', function () {
            assert.notEqual(mcModel.stateData.answers, undefined);
        });
        it('answers is an array', function () {
            assert.strictEqual(mcModel.stateData.answers.constructor.name, 'Array');
        });
        it('contains values (from file)', function () {
            assert.strictEqual(mcModel.stateData.answers[0], 'MC-ANSWER1');
            assert.strictEqual(mcModel.stateData.answers[3], 'MC-ANSWER4');
        });
        it('does not have the values in the state data', function () {
            assert.strictEqual(mcModel.stateData.values, undefined);
        });
        it('has state style set to multiple choice', function(){
            let stateData = new GameModel(data).setRound(0).stateData;
            assert.strictEqual(stateData.style, GameModel.STYLE.MULTIPLE_CHOICE);
        });
    });

    describe('#setRevealState()', function () {
        let mcModel = new GameModel(data).setRound(0);
        mcModel.setRevealState();

        // it('return value is non-reflective', function () {
        //     let state = mcModel.stateData;
        //     state.state = "X";
        //     assert.strictEqual(mcModel.stateData.state, GameModel.STATES.REVEAL);
        // });
        it('has the question in the data', function () {
            assert.strictEqual(mcModel.stateData.question, "MC-QUESTION");
        });
        it('has the answers in the data', function () {
            assert.notEqual(mcModel.stateData.answers, undefined);
        });
        it('answers is an array', function () {
            assert.strictEqual(mcModel.stateData.values.constructor.name, 'Array');
        });
        it('has the values in the data', function () {
            assert.notEqual(mcModel.stateData.values, undefined);
        });
        it('contains values (from file)', function () {
            assert.strictEqual(mcModel.stateData.values[0], "false");
            assert.strictEqual(mcModel.stateData.values[2], "true");
        });
        it('has state style set to multiple choice', function(){
            let stateData = new GameModel(data).setRound(0).stateData;
            assert.strictEqual(stateData.style, GameModel.STYLE.MULTIPLE_CHOICE);
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
        it('has state style set to jeopardy', function(){
            let state = new GameModel(data).setRound(1).stateData;
            assert.strictEqual(state.style, GameModel.STYLE.JEOPARDY);
        });
        it('starts in board state', function(){
            let state = new GameModel(data).setRound(1).stateData;
            assert.strictEqual(state.state, GameModel.STATES.BOARD);
        });
    });

    describe('#countUnspentPlayers()', function () {
        it('starts with all players - 1 (current removed)', function () {
            let round = gameModel.setRound(1);
            assert.strictEqual(round.countUnspentPlayers(), 2);
        });
    });

    describe('#hasPlayer()', function () {
        it('true if has player', function () {
            let round = gameModel.setRound(1);
            assert.strictEqual(round.hasPlayer('b'), true);
        });
        it(`false if name isn't joined`, function () {
            let round = gameModel.setRound(1);
            assert.strictEqual(round.hasPlayer('d'), false);
        });
        it('false if null', function () {
            let round = gameModel.setRound(1);
            assert.strictEqual(round.hasPlayer(null), false);
        });
        it('false if undefined', function () {
            let round = gameModel.setRound(1);
            assert.strictEqual(round.hasPlayer(), false);
        });
    });

    describe('#removePlayer()', function () {
        it('has player, returns true', function () {
            let round = gameModel.setRound(1);
            assert.strictEqual(round.setPlayerSpent('b'), true);
        });
        it('not has player, returns false', function () {
            let round = gameModel.setRound(1);
            assert.strictEqual(round.setPlayerSpent('d'), false);
        });
        it('null, returns false', function () {
            let round = gameModel.setRound(1);
            assert.strictEqual(round.setPlayerSpent(null), false);
        });
        it('undefined, returns false', function () {
            let round = gameModel.setRound(1);
            assert.strictEqual(round.setPlayerSpent(), false);
        });
    });

    describe('current player functions', function () {
        it('set current => has current', function () {
            let round = gameModel.setRound(1);
            round.setCurrentPlayer('b')
            assert.strictEqual(round.getCurrentPlayer(), 'b');
        });

        describe('#setCurrent', function () {
            // it('returns true if new value set', function () {
            //     let round = gameModel.setRound(1);
            //     assert.strictEqual(round.setCurrentPlayer('b'), true);
            // });
            it("returns false if new value not set (can't unknown name)", function () {
                let round = gameModel.setRound(1);
                assert.strictEqual(round.setCurrentPlayer('d'), false);
            });
            // it("setCurrent => hasCurrent", function () {
            //     let round = gameModel.setRound(1);
            //     assert.strictEqual(round.setCurrentPlayer('b'), true);
            // });
            // it("setCurrent(x) => getCurrent(x)", function () {
            //     let round = gameModel.setRound(1);
            //     assert.strictEqual(round.getCurrentPlayer(), 'a');
            // });
        });
        describe('#clearCurrent', function () {
            it('returns true if a change was made', function () {
                let round = gameModel.setRound(1);
                round.setCurrentPlayer('a');
                assert.strictEqual(round.clearCurrentPlayer('a'), true);
            });
            // it('returns false if a current was not set', function () {
            //     let round = gameModel.setRound(1);
            //     assert.strictEqual(round.clearCurrentPlayer(), true);
            //     assert.strictEqual(round.clearCurrentPlayer(), false);
            // });
            it('removes player if remove set (default)', function () {
                let round = gameModel.setRound(1);
                round.setCurrentPlayer('a');
                round.clearCurrentPlayer();
                assert.strictEqual(round.hasPlayer('a'), false);
            });
            it('removes player if remove set', function () {
                let round = gameModel.setRound(1);
                round.setCurrentPlayer('a');
                round.clearCurrentPlayer(true);
                assert.strictEqual(round.hasPlayer('a'), false);
            });
        });
    });

    describe('#setQuestionState()', function () {
        it('sets correct state data from file #1', function () {
            let round = gameModel.setRound(1);
            let state = round.setQuestionState(0, 0);
            assert.strictEqual(state.state, GameModel.STATES.QUESTION);
            assert.strictEqual(state.col, 0);
            assert.strictEqual(state.row, 0);
            assert.strictEqual(state.type, "text");
            assert.strictEqual(state.question, "Q 1.1");
        });
        it('sets correct state data from file #2', function () {
            let round = gameModel.setRound(1);
            let state = round.setQuestionState(1, 0);
            assert.strictEqual(state.state, GameModel.STATES.QUESTION);
            assert.strictEqual(state.col, 1);
            assert.strictEqual(state.row, 0);
            assert.strictEqual(state.type, "text");
            assert.strictEqual(state.question, "Q 2.1");
        });
        // it('has state style set to jeopardy', function(){
        //     let state = new GameModel(data).setRound(1).state;
        //     assert.strictEqual(state.style, GameModel.STYLE.JEOPARDY);
        // });
    });

    describe('#setRevealState()', function () {
        it('sets correct state data from file', function () {
            let round = gameModel.setRound(1);
            let state = round.setRevealState(0, 0);
            assert.strictEqual(state.state, GameModel.STATES.REVEAL);
            assert.strictEqual(state.col, 0);
            assert.strictEqual(state.row, 0);
            assert.strictEqual(state.type, "text");
            assert.strictEqual(state.question, "Q 1.1");
            assert.strictEqual(state.answer, "A 1.1");
        });
        it("get's implied col:row from set question state", function () {
            let round = gameModel.setRound(1);
            round.setQuestionState(1, 0);
            let state = round.setRevealState();
            assert.strictEqual(state.state, GameModel.STATES.REVEAL);
            assert.strictEqual(state.col, 1);
            assert.strictEqual(state.row, 0);
            assert.strictEqual(state.type, "text");
            assert.strictEqual(state.question, "Q 2.1");
            assert.strictEqual(state.answer, "A 2.1");
        });
        // it('has state style set to jeopardy', function(){
        //     let state = new GameModel(data).setRound(1).state;
        //     assert.strictEqual(state.style, GameModel.STYLE.JEOPARDY);
        // });
    });

    // describe('#getState', function () {
    //     let round = gameModel.setRound(1);
    //
    //     it("is board if no state has been set", function () {
    //         assert.strictEqual(round.getState(), GameModel.STATES.BOARD);
    //     });
    // });

    // describe('getters', function () {
    //     let round = gameModel.setRound(1);
    //     let state = round.setRevealState(0, 0);
    //
    //     it("value", function () {
    //         assert.strictEqual(round.getValue(), 100);
    //     });
    //     it("question", function () {
    //         assert.strictEqual(round.getQuestion(), "Q 1.1");
    //     });
    //     it("answer", function () {
    //         assert.strictEqual(round.getQuestion(), "Q 1.1");
    //     });
    //     it("type", function () {
    //         assert.strictEqual(round.getType(), "text");
    //     });
    //     it("state", function () {
    //         assert.strictEqual(round.getState(), GameModel.STATES.REVEAL);
    //     });
    // });

    describe('#isSpent()', function () {
        let round = gameModel.setRound(1);
        it("starts not spent", function () {
            assert.strictEqual(round.isSpent(0, 0), false);
        });
        it("setSpent => isSpent", function () {
            round.setSpent(0, 0);
            assert.strictEqual(round.isSpent(0, 0), true);
        });
    });

    describe('#setSpent()', function () {
        let round = gameModel.setRound(1);
        it("sets last question col/row when parameters omitted", function () {
            round.setQuestionState(3, 1);
            round.setSpent();
            assert.strictEqual(round.isSpent(3, 1), true);
        });
    });

    describe ('#getUpdate()', function (){
        let round = gameModel.setRound(1);
        let update = round.getUpdate();

        // it("has the same state as the model", function () {
        //     assert.strictEqual(round.stateData.state, update.state)
        // });

        it("has spent player data", function () {
            assert.strictEqual(update.spentPlayers[0], 'a');
        });

        it("has category data", function () {
            assert.notEqual(update.categories, undefined);
        });

        it("has specific category data", function () {
            assert.strictEqual(update.categories[0].text, "CATEGORY\n1");
        });

        it("has category text size data", function () {
            assert.strictEqual(update.categories[0]['font-size'], "16px");
        });

        it("has value data", function () {
            assert.notEqual(update.values, undefined);
        });

        it("check value data", function () {
            assert.strictEqual(update.values[0][0], 100);
            assert.strictEqual(update.values[3][0], 100);
            assert.strictEqual(update.values[3][2], 300);
        });
    });


});


