// noinspection SqlNoDataSourceInspection,SqlDialectInspection

import crypto from 'crypto';
import {Game} from './Game.js';
import HasDB from './HasDB.js';

class GameManager extends HasDB{
    constructor(path) {
        super(path);
        this.liveGames= {};
    }

    /**
     * Remove all entries from the db.
     * @returns {Promise<unknown>}
     */
    async clearAll() {
        await this.run("DELETE FROM games");
    }

    /**
     * Associate a host with a game.
     * Generates a hash value to recall the game with.
     * @param user the user object returned from verify.js
     * @param game a game object from Game.js
     * @returns {boolean} true if a new game was created.
     */
    async setGame(user, game) {
        let hash = crypto.randomBytes(20).toString('hex');
        let cmd = `REPLACE INTO games ('userId', 'hash', 'game') VALUES (?, ?, ?)`;
        let values = [user.userId, hash, JSON.stringify(game)];
        await this.run(cmd, values);
    }

    /**
     * List all the users with an game in the db.
     * The user will match with a userid returned from verify.js.
     * @returns {Promise<unknown>}
     */
    async listGames() {
        let result = [];
        let rows = await this.all(`SELECT userId FROM games`);
        rows.forEach(r => result.push(r.userId));
        return result;
    }

    /**
     * True if the game has been saved for the given host.
     * @param user the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    async hasGame(user) {
        let cmd = `SELECT userId FROM games where userId = (?)`;
        let values = [user.userId];
        let rows = await this.all(cmd, values);
        return rows.length >= 1;
    }

    /**
     * Retrieve the saved JSON of a game for a host.
     * @param user the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    async getGame(user) {
        let cmd = `SELECT game FROM games where userId = (?)`;
        let values = [user.userId];
        let r = await this.get(cmd, values);
        if (!r) return undefined;
        return r.game;
    }

    /**
     * Remove a hosted game from the db.
     * @param user the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    async deleteGame(user) {
        let cmd = `DELETE from games where userId = (?)`;
        let values = [user.userId];
        await this.run(cmd, values);
    }

    /**
     * Retrieve the public hash for a game.
     * @param user the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    async getHash(user) {
        let cmd = `SELECT hash FROM games where userId = (?)`;
        let values = [user.userId];
        let r = await this.get(cmd, values);
        if (!r) return undefined;
        return r.hash;
    }

    /**
     * Return the live game object.
     * This will retrieve it from the database if this is the first time getLive is called
     * for the given game.
     * @param hash The public hash for a game.
     */
    async getLive(hash){
        if (!this.liveGames[hash]){
            let cmd = `SELECT game FROM games where hash = (?)`;
            let values = [hash];
            let r = await this.get(cmd, values);
            if (!r) return undefined;
            this.liveGames[hash] = Game.fromJSON(r.game);
        }

        return this.liveGames[hash];
    }
}

export default GameManager;