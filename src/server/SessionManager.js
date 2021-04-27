// noinspection SqlNoDataSourceInspection,SqlDialectInspection

import crypto from "crypto";
import sqlite3 from "sqlite3";
import constants from "./constants.js";
import HasDB from './HasDB.js';

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
class SessionManager extends HasDB{
    constructor(path) {
        super(path);
        this.sessions = {};
    }

    /**
     * Read session information from the DB to the live server.
     * @returns {Promise<void>}
     */
    async load(){
        this.sessions = {};

        let sessionRows = await this.all("SELECT session FROM Sessions");
        for (let sessionRow of sessionRows){
            this.sessions[sessionRow.session] = new SessionInstance(this, sessionRow.session);
            await this.sessions[sessionRow.session].load();
        }
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

    async clearAll(){
        this.sessions = {};
        await this.run("DELETE FROM 'sessions'");
    }

    async applyTo(req, res){
        let cookies = new Cookies(req.headers.cookie);
        let sessionHash = "";
        let expires = new Date().getTime() + constants.SESSION_EXPIRE_HOURS * 60 * 60 * 1000;

        this.createSessionIf()

        if (!cookies.has(constants.SESSION_COOKIE_NAME)) {
            sessionHash = crypto.randomBytes(64).toString('hex');
            res.cookie(constants.SESSION_COOKIE_NAME, sessionHash, {maxAge : constants.SESSION_EXPIRE_HOURS * 60 * 60 * 1000});
        }
        else if (!this.sessions[cookies.get(constants.SESSION_COOKIE_NAME)]){
            sessionHash = crypto.randomBytes(64).toString('hex');
            res.cookie(constants.SESSION_COOKIE_NAME, sessionHash, {maxAge : constants.SESSION_EXPIRE_HOURS * 60 * 60 * 1000});
        }
        else {
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
     * Store a session hash in the database.
     * @param session
     * @param expires
     * @returns {Promise<void>}
     */
    async saveHash(session, expires) {
        let cmd = `REPLACE INTO sessions VALUES (?, ?)`;
        let values = [session, expires];
        await this.run(cmd, values);
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
        this.DB = sessionManager;
        this._hash = hash;
        this.values = {};
    }

    /**
     * Read saved parameters from the DB to the live server for this session.
     * @returns {Promise<void>}
     */
    async load(){
        let cmd = `SELECT name, value FROM parameters WHERE session = (?)`;
        let values = [this.hash];
        let valueRows = await this.DB.all(cmd, values);
        
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
        let cmd = `REPLACE INTO parameters VALUES (?, ?, ?)`;
        let values = [this.hash, key, value];
        console.log(cmd);
        console.log(values);
        await this.DB.run(cmd, values);
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