import crypto from "crypto";
import sqlite3 from "sqlite3";
import fs from 'fs';

const sessionCookieName = "trivia-session";
const TABLE1 = 'CREATE TABLE sessions(session varchar(64) primary key, expires int)';
const TABLE2 = 'CREATE TABLE parameters(session varchar(64) primary key, name varchar(64), value varchar(256))';

class SessionManager {
    constructor(path) {
        this.path = path;
    }

    /**
     * Open the db.
     * @param path
     * @returns {Promise<unknown>}
     */
    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.path, (err) => {
                if (err) reject(new Error(err));
                else resolve();
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

    async exec(cmd) {
        return new Promise((resolve, reject) => {
            this.db.exec(cmd, (err) => {
                if (err) reject(new Error(err));
                else resolve();
            });
        });
    }

    /**
     * Adds session cookies to browsers that don't have one.
     * Attaches the SessionInstance to the request.
     * @returns {function(...[*]=)}
     */
    get middleware() {
        return async (req, res, next) => {
            let cookies = new Cookies(req.headers.cookie);
            let sessionCookieValue = "";

            let expires = new Date().getTime() + 24 * 60 * 60 * 1000;

            if (!cookies.has(sessionCookieName)) {
                sessionCookieValue = crypto.randomBytes(64).toString('hex');
                res.cookie(sessionCookieName, sessionCookieValue);
            } else {
                sessionCookieValue = cookies.get(sessionCookieName);
            }

            await this.saveHash(sessionCookieValue, expires);
            if (!req.session) req.session = new SessionInstance(this.db, sessionCookieValue);

            next();
        }
    }

    async saveHash(session, expires) {
        let hostHash = crypto.randomBytes(20).toString('hex');
        let contHash = crypto.randomBytes(20).toString('hex');

        await this.connect();
        await this.exec(`REPLACE INTO sessions VALUES ('${session}', '${expires}')`);
        await this.disconnect();
    }
}

class SessionInstance {

    constructor(db, hash) {
        this.db = db;
        this._hash = hash;
    }

    get(key) {

    }

    get hash() {
        return this._hash;
    }

    set(key, value) {

    }
}

class Cookies {
    constructor(string) {
        string = string ?? "";
        this.cookies = {};
        let rawCookies = string.split('; ');
        rawCookies.forEach(raw => {
            let keyValue = raw.split("=");
            this.cookies[keyValue[0]] = keyValue[1];
        });
    }

    get(key) {
        return this.cookies[key];
    }

    has(key) {
        return this.cookies[key] !== undefined;
    }
}

export default SessionManager;