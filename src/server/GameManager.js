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
    constructor() {
        this.games = {};
        this.users = {};
        this.hostHashes = {};
        this.contestantHashes = {};
    }

    async connect(path) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(path)) {
                this.db = new sqlite3.Database(path, (err) => {
                    if (err) reject(new Error(err));
                    else {
                        this.db.run(TABLE1);
                        this.db.run(TABLE2);
                        this.db.run(TABLE3);
                        resolve();
                    }
                });
            }

            this.db = new sqlite3.Database(path, (err) => {
                if (err) reject(new Error(err));
                else resolve();
            });
        });
    }

    async disconnect() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(new Error(err));
                else resolve();
            });
        });
    }

    clearAll() {
        return new Promise((resolve, reject) => {
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

    listGames() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT userId
                         FROM games`, (err, row) => {
                if (err) reject(err);
                else {
                    let result = [];
                    row.forEach(r => result.push(r.userId));
                    resolve(result);
                }
            });
        });
    }

    hasGame(user) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT userId FROM games where userId = '${user.userId}'`, (err, row) => {
                if (err) reject(err);
                else resolve(row !== undefined);
            });
        });
    }

    getGame(user) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT game FROM games where userId = '${user.userId}'`, (err, row) => {
                if (err) reject(err);
                else resolve(row.game);
            });
        });
    }

    deleteGame(user) {
        return new Promise((resolve, reject) => {
            this.db.exec(`DELETE from games where userId = '${user.userId}';`, (err, row) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    getHashes(user) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT host, contestant  FROM hashes where userId = '${user.userId}'`, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
}

export default GameManager;