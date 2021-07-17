import fs from "fs";
import assert from 'assert';
import GameModel from "../../src/server/game/model/GameModel.js";
import {Game} from "../../src/server/game/Game.js";

function newGame(path = 'test/data/test-data-02.json'){
    const file = fs.readFileSync(path);
    const data = JSON.parse(file);

    let gameModel = new GameModel(data);
    let game = new Game(gameModel);

    game.times = {
        ANSWER: 0,
        BUZZ: 0,
        MULTIPLE_CHOICE: 0
    }
    return game;
}

function getPlayerByName(update, name){
    for (let p of update.data.model.players){
        if (p.name === name) return p;
    }
    return undefined;
}

function playerJoinsGame(game, name) {
    it(`${name} joins game`, ()=> {
        game.joinPlayer(name);
    });

    it(`Game update->data->model->players contains ${name}`, ()=> {
        assert.notStrictEqual(getPlayerByName(game.getUpdate(), name), undefined);
    });
}

function assertState(game, state) {
    it(`update->data->state is ${state}`, ()=> {
        assert.strictEqual(game.getUpdate().data.state, state);
    });
}

function playerUpdateIndex(game, player, index) {
    describe('player update index', function () {
        it(`${player} updates answer to ${index}`, () => {
            game.onInput({player: player, action: "update_index", data: {index: index}});
        });
    });
}

function playerUpdateBet(game, player, bet) {
    describe('player update bet', function () {
        it(`${player} updates answer to ${bet}`, () => {
            game.onInput({player: player, action: "update_bet", data: {bet: bet}});
        });
    });
}

function hackPlayerScore(game, name, score) {
    describe('hack player score', function () {
        it(`Set score for ${name} to ${score}`, () => {
            game.onInput({player: "@HOST", action: "set_score", data: {name: name, score: score}});
        });

        it(`Verify score`, () => {
            assert.strictEqual(getPlayerByName(game.getUpdate(), name).score, score);
        });
    });
}

function verifyScores(game, scores) {
    describe("verify scores", ()=> {
        for (let name in scores) {
            it(`score for ${name} is ${scores[name]}`, ()=> {
                const player = getPlayerByName(game.getUpdate(), name);
                const actual = player.score;
                assert.strictEqual(actual, scores[name]);
            });
        }
    });
}

function situationSetup(path) {
    const game = newGame(path);

    describe('situation setup', function () {
        playerJoinsGame(game, "Adam");
        playerJoinsGame(game, "Barkley");
        playerJoinsGame(game, "Chuck");
        playerJoinsGame(game, "Davidson");
        assertState(game, 0);

        it(`Host starts game`, ()=> {game.onInput({action: "start"});});
        assertState(game, 1);

        it(`Game type is multiple choice`, ()=> {
            const type = game.getUpdate().data.model.round.style
            assert.strictEqual(type, GameModel.STYLE.MULTIPLE_CHOICE);
        });

        it(`Question matches the data file`, ()=> {
            const question = game.getUpdate().data.model.round.question
            assert.strictEqual(question, "MCQ");
        });

        it(`Answer options are not visible`, ()=> {
            const answers = game.getUpdate().data.model.round.answers
            assert.strictEqual(answers, undefined);
        });

        it(`Correct answer is not visible`, ()=> {
            const correct = game.getUpdate().data.model.round['correct-answer'];
            assert.strictEqual(correct, undefined);
        });
    });

    return game;
}

function waitForAnswers(game) {
    describe("Transition from showing question to waiting for answers", ()=> {
        it(`Host continues`, ()=> {game.onInput({action: "continue"});});
        assertState(game, 2);

        it(`Question matches the data file`, ()=> {
            const question = game.getUpdate().data.model.round.question
            assert.strictEqual(question, "MCQ");
        });

        it(`Answer options are visible`, ()=> {
            const answers = game.getUpdate().data.model.round.answers
            assert.notStrictEqual(answers, undefined);
        });

        it(`Correct answer is not visible`, ()=> {
            const question = game.getUpdate().data.model.round['correct-answer'];
            assert.strictEqual(question, undefined);
        });

        it(`Verify answers match`, ()=> {
            const answers = game.getUpdate().data.model.round.answers
            assert.strictEqual(answers[0], "MCA1");
            assert.strictEqual(answers[1], "MCA2");
            assert.strictEqual(answers[2], "MCA3");
            assert.strictEqual(answers[3], "MCA4");
            assert.strictEqual(answers[4], "MCA5");
        });
    });
}

function revealAnswer(game, correct_answer = 2) {
    describe("Transition from waiting for answers to revealing correct answer", ()=> {
        it(`Host continues`, ()=> {game.onInput({action: "expire"});});
        assertState(game, 3);

        it(`Question matches the data file`, ()=> {
            const question = game.getUpdate().data.model.round.question
            assert.strictEqual(question, "MCQ");
        });

        it(`Answer options are visible`, ()=> {
            const answers = game.getUpdate().data.model.round.answers
            assert.notStrictEqual(answers, undefined);
        });

        it(`Correct answer is visible`, ()=> {
            const correct = game.getUpdate().data.model.round['correct-answer'];
            assert.notStrictEqual(correct, undefined);
        });

        it(`Verify answers match`, ()=> {
            const answers = game.getUpdate().data.model.round.answers
            assert.strictEqual(answers[0], "MCA1");
            assert.strictEqual(answers[1], "MCA2");
            assert.strictEqual(answers[2], "MCA3");
            assert.strictEqual(answers[3], "MCA4");
            assert.strictEqual(answers[4], "MCA5");
        });

        it(`Verify correct answer`, ()=> {
            const correct = game.getUpdate().data.model.round['correct-answer'];
            assert.strictEqual(correct, correct_answer);
        });
    });
}

describe(`Test multiple-choice only game`, () => {

    describe("All players pass in 1 index and 1 bet, 1 player correct", ()=> {
        const game = situationSetup();

        hackPlayerScore(game, "Adam", 100);
        hackPlayerScore(game, "Barkley", 100);
        hackPlayerScore(game, "Chuck", 100);
        hackPlayerScore(game, "Davidson", 100);
        waitForAnswers(game);
        playerUpdateIndex(game, "Adam", 0);
        playerUpdateIndex(game, "Barkley", 1);
        playerUpdateIndex(game, "Chuck", 2);
        playerUpdateIndex(game, "Davidson", 3);
        playerUpdateBet(game, "Adam", 100);
        playerUpdateBet(game, "Barkley", 100);
        playerUpdateBet(game, "Chuck", 100);
        playerUpdateBet(game, "Davidson", 100);
        revealAnswer(game);
        verifyScores(game, {
           "Adam"     : 0,
           "Barkley"  : 0,
           "Chuck"    : 200,
           "Davidson" : 0
        });
    });

    describe("All players pass in 1 index and 1 bet, 3 players correct", ()=> {
        const game = situationSetup();

        hackPlayerScore(game, "Adam", 200);
        hackPlayerScore(game, "Barkley", 100);
        hackPlayerScore(game, "Chuck", 100);
        hackPlayerScore(game, "Davidson", 100);
        waitForAnswers(game);
        playerUpdateIndex(game, "Adam", 2);
        playerUpdateIndex(game, "Barkley", 2);
        playerUpdateIndex(game, "Chuck", 2);
        playerUpdateIndex(game, "Davidson", 3);
        playerUpdateBet(game, "Adam", 100);
        playerUpdateBet(game, "Barkley", 100);
        playerUpdateBet(game, "Chuck", 100);
        playerUpdateBet(game, "Davidson", 100);
        revealAnswer(game);
        verifyScores(game, {
            "Adam"     : 300,
            "Barkley"  : 200,
            "Chuck"    : 200,
            "Davidson" : 0
        });
    });

    describe("All players pass in multiple inputs, 2 players correct", ()=> {
        const game = situationSetup();

        hackPlayerScore(game, "Adam", 200);
        hackPlayerScore(game, "Barkley", 100);
        hackPlayerScore(game, "Chuck", 100);
        hackPlayerScore(game, "Davidson", 100);
        waitForAnswers(game);

        playerUpdateIndex(game, "Adam", 3);
        playerUpdateIndex(game, "Barkley", 3);
        playerUpdateIndex(game, "Adam", 2);
        playerUpdateIndex(game, "Barkley", 2);
        playerUpdateBet(game, "Adam", 100);
        playerUpdateBet(game, "Barkley", 100);
        playerUpdateBet(game, "Chuck", 100);
        playerUpdateBet(game, "Davidson", 100);
        playerUpdateIndex(game, "Chuck", 2);
        playerUpdateIndex(game, "Davidson", 3);
        playerUpdateIndex(game, "Adam", 1);

        revealAnswer(game);
        verifyScores(game, {
            "Adam"     : 100,
            "Barkley"  : 200,
            "Chuck"    : 200,
            "Davidson" : 0
        });
    });

    describe("All players pass in 1 index and 1 bet, 0 players correct", ()=> {
        const game = situationSetup();

        hackPlayerScore(game, "Adam", 200);
        hackPlayerScore(game, "Barkley", 100);
        hackPlayerScore(game, "Chuck", 300);
        hackPlayerScore(game, "Davidson", 100);
        waitForAnswers(game);
        playerUpdateIndex(game, "Adam", 0);
        playerUpdateIndex(game, "Barkley", 1);
        playerUpdateIndex(game, "Chuck", 3);
        playerUpdateIndex(game, "Davidson", 3);
        playerUpdateBet(game, "Adam", 100);
        playerUpdateBet(game, "Barkley", 0);
        playerUpdateBet(game, "Chuck", 100);
        playerUpdateBet(game, "Davidson", 100);
        revealAnswer(game);
        verifyScores(game, {
            "Adam"     : 100,
            "Barkley"  : 100,
            "Chuck"    : 200,
            "Davidson" : 0
        });
    });

    describe("Players over-bet, only takes what players have when wrong", ()=> {
        const game = situationSetup();

        hackPlayerScore(game, "Adam", 200);
        hackPlayerScore(game, "Barkley", 100);
        hackPlayerScore(game, "Chuck", 300);
        hackPlayerScore(game, "Davidson", 100);
        waitForAnswers(game);
        playerUpdateIndex(game, "Adam", 0);
        playerUpdateIndex(game, "Barkley", 1);
        playerUpdateIndex(game, "Chuck", 3);
        playerUpdateIndex(game, "Davidson", 3);
        playerUpdateBet(game, "Adam", 300);
        playerUpdateBet(game, "Barkley", 200);
        playerUpdateBet(game, "Chuck", 500);
        playerUpdateBet(game, "Davidson", 1000);
        revealAnswer(game);
        verifyScores(game, {
            "Adam"     : 0,
            "Barkley"  : 0,
            "Chuck"    : 0,
            "Davidson" : 0
        });
    });

    describe("Players over-bet, only takes what players have when correct", ()=> {
        const game = situationSetup();

        hackPlayerScore(game, "Adam", 200);
        hackPlayerScore(game, "Barkley", 100);
        hackPlayerScore(game, "Chuck", 300);
        hackPlayerScore(game, "Davidson", 100);
        waitForAnswers(game);
        playerUpdateIndex(game, "Adam", 2);
        playerUpdateIndex(game, "Barkley", 2);
        playerUpdateIndex(game, "Chuck", 2);
        playerUpdateIndex(game, "Davidson", 2);
        playerUpdateBet(game, "Adam", 300);
        playerUpdateBet(game, "Barkley", 200);
        playerUpdateBet(game, "Chuck", 500);
        playerUpdateBet(game, "Davidson", 1000);
        revealAnswer(game);
        verifyScores(game, {
            "Adam"     : 400,
            "Barkley"  : 200,
            "Chuck"    : 600,
            "Davidson" : 200
        });
    });

    describe("Some players provide no input (default is index 0)", ()=> {
        const game = situationSetup();

        hackPlayerScore(game, "Adam", 200);
        hackPlayerScore(game, "Barkley", 100);
        hackPlayerScore(game, "Chuck", 300);
        hackPlayerScore(game, "Davidson", 100);
        waitForAnswers(game);
        playerUpdateIndex(game, "Adam", 2);
        playerUpdateIndex(game, "Davidson", 2);
        playerUpdateBet(game, "Adam", 200);
        playerUpdateBet(game, "Davidson", 100);
        revealAnswer(game);
        verifyScores(game, {
            "Adam"     : 400,
            "Barkley"  : 100,
            "Chuck"    : 300,
            "Davidson" : 200
        });
    });

    describe("Some players provide no index (default is index 0) default to correct", ()=> {
        const game = situationSetup('test/data/test-data-03.json');

        hackPlayerScore(game, "Adam", 200);
        hackPlayerScore(game, "Barkley", 200);
        hackPlayerScore(game, "Chuck", 200);
        hackPlayerScore(game, "Davidson", 100);
        waitForAnswers(game);
        playerUpdateIndex(game, "Adam", 2);
        playerUpdateIndex(game, "Davidson", 2);
        playerUpdateBet(game, "Adam", 200);
        playerUpdateBet(game, "Barkley", 200);
        playerUpdateBet(game, "Chuck", 200);
        playerUpdateBet(game, "Davidson", 100);
        revealAnswer(game, 0);
        verifyScores(game, {
            "Adam"     : 0,
            "Barkley"  : 400,
            "Chuck"    : 400,
            "Davidson" : 0
        });
    });
});

// describe("POST", ()=>{
//     it("", ()=> {
//         console.log(JSON.stringify(game.getUpdate().data.model, null, 2));
//     });
// });