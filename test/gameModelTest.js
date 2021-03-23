// gameModelTest.js

import assert from 'assert';
import fs from 'fs';
import GameModel from '../src/server/GameModel.js';

const file = fs.readFileSync('./test/data/test-data-00.json');
const data = JSON.parse(file);

console.log(data);

describe('GameModel', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});