// Maintains a list of active games.
// Generates new games.

import crypto from 'crypto';
import {Game} from './Game.js';

class GameManager{

    constructor() {
        this.games = {};
        this.hostHashes = {};
        this.contestantHashes = {};
    }

    /**
     * Create a new game if a game doesn't already exit.
     * @param userId
     * @param model
     * @returns {boolean} true if a new game was created.
     */
    newGame(userId, model) {
        if (this.games[userId] !== undefined) return false;
        this.games[userId] = new Game(model);
        this.hostHashes[userId] = crypto.randomBytes(20).toString('hex');
        this.contestantHashes[userId] = crypto.randomBytes(20).toString('hex');
        return true;
    }

    getGame(userId){
        return this.games[userId];
    }

    getHashes(userId){
        return {
            host_hash : this.hostHashes[userId],
            contestant_hash : this.contestantHashes[userId]
        }
    }
}

export default GameManager;