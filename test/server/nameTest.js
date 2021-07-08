// nameTest.js

import assert from 'assert';
import fs from 'fs';
import GameModel from '../../src/server/game/model/GameModel.js';
import {Game, Timer} from '../../src/server/game/Game.js';
import NameValidator from "../../src/server/game/NameValidator.js";

const file = fs.readFileSync('test/data/test-data-00.json');
const data = JSON.parse(file);

function newGame(){
    let gameModel = new GameModel(data);
    let game = new Game(gameModel);

    game.times = {
        ANSWER: 1,
        BUZZ: 1,
        MULTIPLE_CHOICE: 1
    }
    return game;
}

/**
* At least 2 characters, not more than 15
* Starts with a letter, followed by letters, numbers, dashes, or underscores
**/

describe(`Test player name validator parsing, acceptance, and rejection`, () => {
    describe('test the name validator (NameValidator.js)', ()=> {
        it(`valid name - all lower case characters no symbols`, ()=>{
            const name = "bob";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, true);
        });

        it(`valid name - all upper case characters no symbols`, ()=>{
            const name = "ROBERT";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, true);
        });

        it(`valid name - 2 characters`, ()=>{
            const name = "BO";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, true);
        });

        it(`valid name - leading char, has numbers`, ()=>{
            const name = "b0b";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, true);
        });

        it(`valid name - leading char, has numbers & dash`, ()=>{
            const name = "b-0b";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, true);
        });

        it(`valid name - leading char, has numbers & underscore`, ()=>{
            const name = "b_0b";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, true);
        });

        it(`valid name - 15 characters`, ()=>{
            const name = "abcdefjklmnopqr";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, true);
        });

        it(`preprocessor changes name to upper case`, ()=>{
            const name = "bob";
            const nv = new NameValidator();
            const pre = nv.preProcess(name);
            assert.strictEqual(pre, "BOB");
        });

        it(`valid name - leading space (preprocessor removes space)`, ()=>{
            const name = " bob";
            const nv = new NameValidator();
            const pre = nv.preProcess(name);
            const r = nv.validate(name);
            assert.strictEqual(r, true);
            assert.strictEqual(pre, "BOB");
        });

        it(`valid name - trailing space (preprocessor removes space)`, ()=>{
            const name = "bob ";
            const nv = new NameValidator();
            const pre = nv.preProcess(name);
            const r = nv.validate(name);
            assert.strictEqual(r, true);
            assert.strictEqual(pre, "BOB");
        });

        it(`valid name - leading & trailing spaces (preprocessor removes spaces)`, ()=>{
            const name = "  bob ";
            const nv = new NameValidator();
            const pre = nv.preProcess(name);
            const r = nv.validate(name);
            assert.strictEqual(r, true);
            assert.strictEqual(pre, "BOB");
        });

        it(`invalid name - leading number`, ()=>{
            const name = "3bob";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });

        it(`invalid name - leading space then number`, ()=>{
            const name = " 3bob";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });

        it(`invalid name - contains space`, ()=>{
            const name = "bo b";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - has symbol`, ()=>{
            const name = "bo&b";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - has symbols`, ()=>{
            const name = "b#o&b--)";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - too short`, ()=>{
            const name = "a";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - too long`, ()=>{
            const name = "abcdefghijklmnopqrs";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - empty string`, ()=>{
            const name = "a";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - null`, ()=>{
            const name = null;
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - undefined`, ()=>{
            const name = undefined;
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - not a string`, ()=>{
            const name = 3;
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - multiple dashes`, ()=>{
            const name = "b--b";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - multiple underscores`, ()=>{
            const name = "b__b";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
        it(`invalid name - multiple dashes and underscores`, ()=>{
            const name = "b_-a-_b";
            const nv = new NameValidator();
            const r = nv.validate(name);
            assert.strictEqual(r, false);
        });
    });

    describe('test GameManagerEndpoint nameInUse function', ()=> {

    });
});