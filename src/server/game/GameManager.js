// noinspection SqlNoDataSourceInspection,SqlDialectInspection

import crypto from 'crypto';
import {Game} from './Game.js';
import HasDB from '../mechanics/HasDB.js';
import ParseArgs from "@thaerious/parseargs";
import config from "../../config.js";

/**
 * The game manager keeps a record of all launched games.
 *
 *
 */
class GameManager{
    constructor() {
        this.hosts = new Map(); // userId -> {hash, name}
        this.liveGames= new Map(); // hash -> game
    }

    get size(){
        return this.liveGames.size;
    }

    clearAll(){
        this.hosts = new Map(); // user -> hash
        this.liveGames= new Map(); // hash -> game
    }

    set timeAnswer(value){
        this.ta = value;
    }

    set timeBuzz(value){
        this.tb = value;
    }

    set timeMultipleChoice(value){
        this.tm = value;
    }

    /**
     * Associate a host with a game.
     * Generates a hash value to recall the game with.
     * @param hostToken the user object returned from verify.js
     * @param game a game object from Game.js
     * @returns {boolean} true if a new game was created.
     */
    setGame(hostToken, liveGame) {
        if (!hostToken?.userId) throw new Error("userId missing from user object");
        if (!hostToken?.userName) throw new Error("userId missing from user object");

        let hash = crypto.randomBytes(20).toString('hex');
        this.liveGames.set(hash, liveGame);

        liveGame.times.ANSWER = this.ta ?? config.TIMES.ANSWER;
        liveGame.times.BUZZ = this.tb ?? config.TIMES.BUZZ;
        liveGame.times.MULTIPLE_CHOICE = this.tm ?? config.TIMES.MULTIPLE_CHOICE;
        this.hosts.set(hostToken.userId, {hash:hash, name:hostToken.userName});
    }

    /**
     * True if the game has been saved for the given host.
     * @param hostToken the user object returned from verify.js
     */
    hasGame(hostToken) {
        return this.hosts.has(hostToken.userId);
    }

    /**
     * Retrieve a game based on the host.
     * @param hostToken the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    getGame(hostToken) {
        const hash = this.hosts.get(hostToken.userId).hash;
        return this.liveGames.get(hash);
    }

    /**
     * Remove a hosted game from the db.
     * @param hostToken the user object returned from verify.js
     * @returns {boolean}
     */
    deleteGame(hostToken) {
        const hash = this.hosts.get(hostToken.userId).hash;
        if (!this.hasGame(hostToken)) return false;
        this.liveGames.delete(hash);
        this.hosts.delete(hostToken.userId);
        return true;
    }

    /**
     * Retrieve the public hash for a game.
     * @param hostToken the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    getGameHash(hostToken) {
        return this.hosts.get(hostToken.userId)?.hash;
    }

    /**
     * Return the live game object.
     * This will retrieve it from the database if this is the first time getLive is called
     * for the given game.
     * @param gameHash The public hash for a game.
     * @return The live game object or undefined if no game found.
     */
    getLive(gameHash){
        return this.liveGames.get(gameHash);
    }

    hasLive(gameHash){
        return this.liveGames.has(gameHash);
    }
}

export default GameManager;