import sqlite3 from "sqlite3";

class HasDB {
    constructor(path) {
        this.path = path;
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

    async run(cmd, values) {
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

    async all(cmd, values) {
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

    async get(cmd, values) {
        return new Promise(async (resolve, reject) => {
            await this.connect();
            this.db.get(cmd, values, async (err, row) => {
                if (err) {
                    console.log(cmd);
                    reject(new Error(err));
                } else {
                    await this.disconnect();
                    resolve(row);
                }
            });
        });
    }
}

export default HasDB;