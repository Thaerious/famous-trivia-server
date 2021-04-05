// Maintains a list of active games.
// Generates new games.

import crypto from 'crypto';
import {Game} from './Game.js';
import sqlite3 from 'sqlite3';
import fs from 'fs';

const TABLE1 = '        \
CREATE TABLE games      \
(                       \
    userId varchar(64) primary key, \
    game   text         \
)';

const TABLE2 = '        \
CREATE TABLE users      \
(                       \
    userId varchar(64) primary key, \
    name   varchar(64)  \
)';

const TABLE3 = '            \
CREATE TABLE hashes         \
(                           \
    userId     varchar(64) primary key, \
    host       varchar(32), \
    contestant varchar(32)  \
)';

class GameManager {
    constructor(path) {
        this.path = path;
        this.liveGames= {};
    }

    async setup(){
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.path)) {
                this.db = new sqlite3.Database(this.path, async (err) => {
                    if (err) reject(new Error(err));
                    else {
                        this.db.run(TABLE1);
                        this.db.run(TABLE2);
                        this.db.run(TABLE3);
                        await this.disconnect();
                        resolve();
                    }
                });
            }
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
                else resolve(this);
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

    /**
     * Remove all entries from the db.
     * @returns {Promise<unknown>}
     */
    clearAll() {
        return new Promise(async (resolve, reject) => {
            this.db.run("DELETE FROM games", () => {
                this.db.run("DELETE FROM hashes", () => resolve());
            });
        });
    }

    /**
     * Create a new game if a game doesn't already exit.
     * @param userId
     * @param model
     * @returns {boolean} true if a new game was created.
     */
    setGame(user, game) {
        let hostHash = crypto.randomBytes(20).toString('hex');
        let contHash = crypto.randomBytes(20).toString('hex');

        let cmd = [
            `REPLACE INTO games VALUES ('${user.userId}', '${JSON.stringify(game)}')`,
            `REPLACE INTO hashes (userId, host, contestant) VALUES ('${user.userId}', '${hostHash}', '${contHash}')`
        ]

        return new Promise(async (resolve, reject) => {
            this.db
                .exec(cmd[0])
                .exec(cmd[1], () => resolve(true));
        });
    }

    /**
     * List all the users with an game in the db.
     * @returns {Promise<unknown>}
     */
    listGames() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT userId FROM games`, (err, row) => {
                if (err) reject(err);
                else {
                    let result = [];
                    row.forEach(r => result.push(r.userId));
                    resolve(result);
                }
            });
        });
    }

    /**
     * True if the game has been saved.
     * @param user
     * @returns {Promise<unknown>}
     */
    hasGame(user) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT userId FROM games where userId = '${user.userId}'`, (err, row) => {
                if (err) reject(err);
                else resolve(row !== undefined);
            });
        });
    }

    /**
     * Retrieve the saved JSON of a game.
     * @param user
     * @returns {Promise<unknown>}
     */
    getGame(user) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT game FROM games where userId = '${user.userId}'`, (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.game : undefined);
            });
        });
    }

    /**
     * Remove a game from the db.
     * @param user
     * @returns {Promise<unknown>}
     */
    deleteGame(user) {
        let cmd = [
            `DELETE from games where userId = '${user.userId}'`,
            `DELETE from hashes where userId = '${user.userId}'`
        ];

        return new Promise(async (resolve, reject) => {
            this.db
                .exec(cmd[0])
                .exec(cmd[1], () => resolve(true));
        });
    }

    /**
     * Retrieve the hashes for a game.
     * @param user
     * @returns {Promise<unknown>}
     */
    getHashes(user) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT host, contestant  FROM hashes where userId = '${user.userId}'`, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    /**
     * Retrieve the user id for a given hash.
     * Hash can be host or contestant.
     * @param user
     * @returns {Promise<unknown>}
     */
    getUser(hash) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT userId  FROM hashes where host = '${hash}' OR contestant = '${hash}'`, (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.userId : undefined);
            });
        });
    }

    /**
     * Return the game object.
     * This will retrieve it from the database if this is the first time getLive is called
     * for the given game.  The has can be either the user or contestant hash.
     * @param hash
     */
    async getLive(hash){
        let userId = await this.getUser(hash);

        if (!this.liveGames[userId]){
            let json = await this.getGame({userId: userId});
            if (!json) return undefined;
            this.liveGames[userId] = Game.fromJSON(json);
        }

        return this.liveGames[userId];
    }
}

export default GameManager;