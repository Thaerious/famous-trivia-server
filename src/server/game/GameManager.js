// noinspection SqlNoDataSourceInspection,SqlDialectInspection

import crypto from 'crypto';
import {Game} from './Game.js';
import HasDB from '../mechanics/HasDB.js';

class GameManager{
    constructor() {
        this.hosts = new Map(); // user -> hash
        this.liveGames= new Map(); // hash -> game
    }

    get size(){
        return this.liveGames.size;
    }

    clearAll(){
        this.hosts = new Map(); // user -> hash
        this.liveGames= new Map(); // hash -> game
    }

    /**
     * Associate a host with a game.
     * Generates a hash value to recall the game with.
     * @param user the user object returned from verify.js
     * @param game a game object from Game.js
     * @returns {boolean} true if a new game was created.
     */
    setGame(user, game) {
        let hash = crypto.randomBytes(20).toString('hex');
        this.liveGames.set(hash, Game.fromJSON(game));
        this.hosts.set(user.userId, hash);
    }

    /**
     * List all the users with an game in the db.
     * The user will match with a userid returned from verify.js.
     */
    listHosts() {
        return Array.from(this.hosts.keys());
    }

    /**
     * True if the game has been saved for the given host.
     * @param user the user object returned from verify.js
     */
    hasGame(user) {
        return this.hosts.has(user.userId);
    }

    /**
     * Retrieve the saved JSON of a game for a host.
     * @param user the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    getGame(user) {
        const hash = this.hosts.get(user.userId);
        return this.liveGames.get(hash);
    }

    /**
     * Remove a hosted game from the db.
     * @param user the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    deleteGame(user) {
        const hash = this.hosts.has(user.userId);
        this.liveGames.delete(hash);
        this.hosts.delete(user.userId);
    }

    /**
     * Retrieve the public hash for a game.
     * @param user the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    getHash(user) {
        return this.hosts.get(user.userId);
    }

    /**
     * Return the live game object.
     * This will retrieve it from the database if this is the first time getLive is called
     * for the given game.
     * @param hash The public hash for a game.
     * @return The live game object or undefined if no game found.
     */
    getLive(hash){
        return this.liveGames.get(hash);
    }

    hasLive(hash){
        return this.liveGames.has(hash);
    }
}

export default GameManager;