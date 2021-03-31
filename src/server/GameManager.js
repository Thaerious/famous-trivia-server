// Maintains a list of active games.
// Generates new games.

import crypto from 'crypto';
import {Game} from './Game.js';

class GameManager{

    constructor() {
        this.games = {};
    }

    newGame(model) {
        if (this.games[model.host] !== undefined) return false;

        let game = new Game(model);
        this.games[model.host] = {
            game: game,
            contestant_hash: crypto.randomBytes(20).toString('hex'),
            host_hash: crypto.randomBytes(20).toString('hex')
        };

        return true;
    }

    getInfo(hostID){
        return this.games[hostID];
    }
}

export default GameManager;