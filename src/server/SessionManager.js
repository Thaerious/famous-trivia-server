import crypto from "crypto";
import sqlite3 from "sqlite3";
import fs from 'fs';

const sessionCookieName = "trivia-session";
const TABLE1 = 'CREATE TABLE sessions(session varchar(64) primary key, expires int)';
const TABLE2 = 'CREATE TABLE parameters(session varchar(64), name varchar(64), value varchar(256))';

/**
 * The Session Manager will add a cookie to all pages that use it.
 * This cookie will be recoded in the sessions db.
 * A "SessionInstance" will be attached to the request on "req.session";
 * this can be used to add and remove values from the session db associated with this
 * session.
 *
 * Having a session variable does not automatically mean the user is verified.
 * Other endpoints will take care of that.
 */
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

    async get(cmd){
        return new Promise((resolve, reject) => {
            this.db.exec(cmd, (err, row) => {
                if (err) {
                    console.log(cmd);
                    reject(new Error(err));
                }
                else{
                    resolve(row);
                }
            });
        });
    }

    async all(cmd){
        return new Promise((resolve, reject) => {
            this.db.all(cmd, (err, rows) => {
                if (err) {
                    console.log(cmd);
                    reject(new Error(err));
                }
                else{
                    console.log(rows);
                    resolve(rows);
                }
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
            this.applyTo(req);
            next();
        }
    }

    async applyTo(req){
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
        if (!req.session){
            req.session = new SessionInstance(this, sessionCookieValue);
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
    constructor(sessionManager, hash) {
        this.sm = sessionManager;
        this._hash = hash;
    }

    async listKeys(){
        const cmd = `SELECT name FROM parameters where session = '${this.hash}'`;

        await this.sm.connect();
        let rows = await this.sm.all(cmd);
        await this.sm.disconnect();

        let r = [];
        for (let row of rows){
            r.push(row.name);
        }
        return row;
    }

    async has(key){
        return await this.get(key) !== undefined;
    }

    async get(key) {
        const cmd = `SELECT value FROM parameters where session = '${this.hash}' AND name = '${key}'`;

        await this.sm.connect();
        let row = await this.sm.get(cmd);
        await this.sm.disconnect();
        if (row) return row.value;
        return undefined;
    }

    async set(key, value) {
        const cmd = `REPLACE INTO parameters VALUES ('${this.hash}', '${key}', '${value}') `;
        await this.sm.connect();
        await this.sm.exec(cmd);
        await this.sm.disconnect();
    }

    get hash() {
        return this._hash;
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