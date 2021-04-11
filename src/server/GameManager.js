// Maintains a list of active games.
// Generates new games.

import crypto from 'crypto';
import {Game} from './Game.js';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import awaitAsyncGenerator from "@babel/runtime/helpers/esm/awaitAsyncGenerator";

const TABLE1 = 'CREATE TABLE games (userId varchar(64) primary key, hash varchar(32) unique, game text)';

class GameManager {
    constructor(path) {
        this.path = path;
        this.liveGames= {};
    }

    async setup(){
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.path)) resolve();
            this.db = new sqlite3.Database(this.path, async (err) => {
                if (err) reject(new Error(err));
                else {
                    this.db.exec(TABLE1, () => {
                        this.db.close();
                        resolve();
                    });
                }
            });
        });
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

    async all(cmd){
        return new Promise(async (resolve, reject) => {
            await this.connect();
            this.db.all(cmd, async (err, rows) => {
                if (err) reject(new Error(err));
                else {
                    await this.disconnect();
                    resolve(rows);
                }
            });
        });
    }

    async get(cmd){
        return new Promise(async (resolve, reject) => {
            await this.connect();
            this.db.get(cmd, async (err, row) => {
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
        await this.exec("DELETE FROM games");
    }

    /**
     * Create a new game if a game doesn't already exit.
     * Generates a hash value to reference the game.
     * @param userId
     * @param model
     * @returns {boolean} true if a new game was created.
     */
    async setGame(user, game) {
        let hash = crypto.randomBytes(20).toString('hex');
        let cmd = `REPLACE INTO games ('userId', 'hash', 'game') VALUES ('${user.userId}', '${hash}', '${JSON.stringify(game)}')`;
        await this.exec(cmd);
    }

    /**
     * List all the users with an game in the db.
     * @returns {Promise<unknown>}
     */
    async listGames() {
        let result = [];
        let rows = await this.all(`SELECT userId FROM games`);
        rows.forEach(r => result.push(r.userId));
        return result;
    }

    /**
     * True if the game has been saved.
     * @param user
     * @returns {Promise<unknown>}
     */
    async hasGame(user) {
        let rows = await this.all(`SELECT userId FROM games where userId = '${user.userId}'`);
        return rows.length >= 1;
    }

    /**
     * Retrieve the saved JSON of a game.
     * @param user
     * @returns {Promise<unknown>}
     */
    async getGame(user) {
        let r = await this.get(`SELECT game FROM games where userId = '${user.userId}'`);
        if (!r) return undefined;
        return r.game;
    }

    /**
     * Remove a game from the db.
     * @param user
     * @returns {Promise<unknown>}
     */
    async deleteGame(user) {
        await this.exec(`DELETE from games where userId = '${user.userId}'`);
    }

    /**
     * Retrieve the hash for a game.
     * @param user
     * @returns {Promise<unknown>}
     */
    async getHash(user) {
        let r = await this.get(`SELECT hash FROM games where userId = '${user.userId}'`);
        if (!r) return undefined;
        return r.hash;
    }

    /**
     * Retrieve the user id for a given hash.
     * Hash can be host or contestant.
     * @param user
     * @returns {Promise<unknown>}
     */
    async getUser(hash) {
        let r = await this.get(`SELECT userId FROM games where hash = '${hash}'`);
        if (!r) return undefined;
        return r.userId;
    }

    /**
     * Return the game object from a hash value.
     * This will retrieve it from the database if this is the first time getLive is called
     * for the given game.  The has can be either the user or contestant hash.
     * @param hash
     */
    async getLive(hash){
        if (!this.liveGames[hash]){
            let cmd = `SELECT game FROM games where hash = '${hash}'`;
            let r = await this.get(cmd);
            if (!r) return undefined;
            this.liveGames[hash] = Game.fromJSON(r.game);
        }

        return this.liveGames[hash];
    }
}

export default GameManager;