import crypto from "crypto";
import sqlite3 from "sqlite3";
import constants from "./constants.js";

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
        this.sessions = {};
    }

    /**
     * Read session information from the DB to the live server.
     * @returns {Promise<void>}
     */
    async load(){
        await this.connect();
        this.sessions = {};

        let sessionRows = await this.all("SELECT session FROM Sessions");
        for (let sessionRow of sessionRows){
            this.sessions[sessionRow.session] = new SessionInstance(this, sessionRow.session);
            await this.sessions[sessionRow.session].load();
        }
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
            await this.applyTo(req, res);
            next();
        }
    }

    async applyTo(req, res){
        let cookies = new Cookies(req.headers.cookie);
        let sessionHash = "";
        let expires = new Date().getTime() + constants.SESSION_EXPIRE_HOURS * 60 * 60 * 1000;

        if (!cookies.has(constants.SESSION_COOKIE_NAME)) {
            sessionHash = crypto.randomBytes(64).toString('hex');
            res.cookie(constants.SESSION_COOKIE_NAME, sessionHash, {maxAge : constants.SESSION_EXPIRE_HOURS * 60 * 60 * 1000});
        } else {
            sessionHash = cookies.get(constants.SESSION_COOKIE_NAME);
        }

        if (!this.sessions[sessionHash]) {
            await this.saveHash(sessionHash, expires);
        }

        if (!req.session){
            req.session = this.getSession(sessionHash);
        }
    }

    getSession(sessionHash){
        if (!this.sessions[sessionHash]) {
            this.sessions[sessionHash] = new SessionInstance(this, sessionHash);
        }

        return this.sessions[sessionHash];
    }

    /**
     * Store a session has in the database
     * @param session
     * @param expires
     * @returns {Promise<void>}
     */
    async saveHash(session, expires) {
        let hostHash = crypto.randomBytes(20).toString('hex');
        let contHash = crypto.randomBytes(20).toString('hex');

        await this.connect();
        await this.exec(`REPLACE INTO sessions VALUES ('${session}', '${expires}')`);
        await this.disconnect();
    }

    listHashes(){
        let r = [];
        for (let key of Object.keys(this.sessions)){
            r.push(key.substring(0, 6));
        }
        return r;
    }
}

class SessionInstance {
    constructor(sessionManager, hash) {
        this.sm = sessionManager;
        this._hash = hash;
        this.values = {};
    }

    /**
     * Read saved parameters from the DB to the live server for this session.
     * @returns {Promise<void>}
     */
    async load(){
        let valueRows = await this.sm.all(`SELECT name, value FROM parameters WHERE session = '${this.hash}'`);
        for (let valueRow of valueRows){
            this.values[valueRow.name] = valueRow.value;
        }
    }

    listKeys(){
        return Object.keys(this.values);
    }

    has(key){
        return this.values[key] !== undefined;
    }

    get(key) {
        return this.values[key];
    }

    async set(key, value) {
        this.values[key] = value;
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