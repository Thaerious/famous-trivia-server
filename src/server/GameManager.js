// noinspection SqlNoDataSourceInspection

import crypto from 'crypto';
import {Game} from './Game.js';
import sqlite3 from 'sqlite3';

class GameManager {
    constructor(path) {
        this.path = path;
        this.liveGames= {};
    }

    /**
     * Open the db.
     * @param path
     * @returns {Promise<unknown>}
     */
    async connect(path) {
        path = path ?? this.path;
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(path, (err) => {
                if (err) reject(new Error(err));
                else resolve(this.db);
            });
        });
    }

    /**
     * Close the db
     * @returns {Promise<unknown>}
     */
    async disconnect() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(new Error(err));
                else resolve();
            });
        });
    }

    async exec(cmd){
        return new Promise(async (resolve, reject) => {
            await this.connect();
            this.db.exec(cmd, async err => {
                if (err) reject(new Error(err));
                else {
                    await this.disconnect();
                    resolve();
                }
            });
        });
    }

    async run(cmd, values){
        return new Promise(async (resolve, reject) => {
            await this.connect();
            this.db.run(cmd, values, async err => {
                if (err) reject(new Error(err));
                else {
                    await this.disconnect();
                    resolve();
                }
            });
        });
    }

    async all(cmd, values){
        return new Promise(async (resolve, reject) => {
            await this.connect();
            this.db.all(cmd, values, async (err, rows) => {
                if (err) reject(new Error(err));
                else {
                    await this.disconnect();
                    resolve(rows);
                }
            });
        });
    }

    async get(cmd, values){
        return new Promise(async (resolve, reject) => {
            await this.connect();
            this.db.get(cmd, values, async (err, row) => {
                if (err){
                    console.log(cmd);
                    reject(new Error(err));
                }
                else {
                    await this.disconnect();
                    resolve(row);
                }
            });
        });
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

    /**
     * Associate a contestant with a game.
     * @param name
     * @param hash
     * @returns {Promise<boolean>} True if the name was added.
     */
    async addContestant(name, hash){
        let statement = "INSERT INTO contestants (contestant_name, game_hash) VALUES (?, ?)";
        let values = [name, hash];
        await this.run(statement, values);
    }

    /**
     * Determine if a game has the contestant name.
     * @param name The name in question.
     * @param hash The public hash for the game.
     * @returns {Promise<boolean>}
     */
    async hasContestant(name, hash){
        let cmd = "SELECT * FROM contestants where contestant_name = (?) and game_hash = (?)";
        let values = [name, hash];
        let rows = await this.all(cmd, values);
        return rows.length >= 1;
    }

    /**
     * Remove a name from the game.
     * This does not remove the player from the game it's self, only the db record of the
     * player name.
     * @param name The name in question.
     * @param hash The public hash for the game.
     * @returns {Promise<boolean>}
     */
    async removeContestant(name, hash){
        let cmd = "DELETE FROM contestants where contestant_name = (?) and game_hash = (?)";
        let values = [name, hash];
        let rows = await this.run(cmd, values);
    }

}

export default GameManager;