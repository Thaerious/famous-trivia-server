import sqlite3 from "sqlite3";
import {Mutex} from 'async-mutex';

class HasDB {
    constructor(path) {
        this.path = path;
        this.mutex = new Mutex();
    }

    /**
     * Open the db.
     * @param path
     * @returns {Promise<unknown>}
     */
    async connect(path) {
        path = path ?? this.path;
        return new Promise((resolve, reject) => {
            console.log("CONNECT DB");
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
            console.log("DISCONNECT DB");
            this.db.close((err) => {
                if (err) reject(new Error(err));
                else resolve();
            });
        });
    }

    async run(cmd, values) {
        return new Promise(async (resolve, reject) => {
            await this.connect();
            this.db.run(cmd, values, async err => {
                if (err) {
                    console.log("SQL ERROR");
                    console.log(cmd);
                    reject(new Error(err));
                } else {
                    try {
                        await this.disconnect();
                        resolve();
                    } catch (err) {
                        console.log("SQL ERROR");
                        console.log(cmd);
                        reject(err);
                    }
                }
            });
        });
    }

    async all(cmd, values) {
        return new Promise(async (resolve, reject) => {
            await this.connect();
            this.db.all(cmd, values, async (err, rows) => {
                if (err) {
                    console.log("SQL ERROR");
                    console.log(cmd);
                    reject(new Error(err));
                } else {
                    try {
                        await this.disconnect();
                        resolve(rows);
                    } catch (err) {
                        console.log("SQL ERROR");
                        console.log(cmd);
                        reject(err);
                    }
                }
            });
        });
    }

    async get(cmd, values) {
        return new Promise(async (resolve, reject) => {
            await this.connect();
            this.db.get(cmd, values, async (err, row) => {
                if (err) {
                    console.log("SQL ERROR");
                    console.log(cmd);
                    reject(new Error(err));
                } else {
                    try {
                        await this.disconnect();
                        resolve(row);
                    } catch (err) {
                        console.log("SQL ERROR");
                        console.log(cmd);
                        reject(err);
                    }
                }
            });
        });
    }
}

export default HasDB;