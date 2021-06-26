// noinspection SqlNoDataSourceInspection,SqlDialectInspection

import crypto from 'crypto';
import {Game} from './Game.js';
import HasDB from '../mechanics/HasDB.js';
import ParseArgs from "@thaerious/parseargs";

class GameManager{
    constructor() {
        this.hosts = new Map(); // userId -> {hash, name}
        this.liveGames= new Map(); // hash -> game
        this.args = new ParseArgs().loadOptions().run();
    }

    get size(){
        return this.liveGames.size;
    }

    clearAll(){
        this.hosts = new Map(); // user -> hash
        this.liveGames= new Map(); // hash -> game
    }

    /**
     * Associate a host with a game.
     * Generates a hash value to recall the game with.
     * @param user the user object returned from verify.js
     * @param game a game object from Game.js
     * @returns {boolean} true if a new game was created.
     */
    setGame(user, gameDesc) {
        let hash = crypto.randomBytes(20).toString('hex');
        const liveGame = Game.fromJSON(gameDesc);
        this.liveGames.set(hash, liveGame);

        if (this.args.flags["ta"]){
            liveGame.times.ANSWER = parseInt(this.args.flags["ta"]);
        }
        if (this.args.flags["tb"]){
            liveGame.times.BUZZ = parseInt(this.args.flags["tb"]);
        }
        if (this.args.flags["tm"]){
            liveGame.times.MULTIPLE_CHOICE = parseInt(this.args.flags["tm"]);
        }

        this.hosts.set(user.userId, {hash:hash, name:user.userName});
    }

    /**
     * List all the users with an game in the db.
     * The user will match with a userid returned from verify.js.
     */
    listHostedGames() {
        let list = [];
        for (let id of this.hosts.keys()){
            const name = this.hosts.get(id).name;
            const hash = this.hosts.get(id).hash.substr(0, 8);
            list.push({id, name, hash});
        }
        return list;
    }

    /**
     * True if the game has been saved for the given host.
     * @param user the user object returned from verify.js
     */
    hasGame(user) {
        return this.hosts.has(user.userId);
    }

    /**
     * Retrieve the saved JSON of a game for a host.
     * @param user the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    getGame(user) {
        const hash = this.hosts.get(user.userId).hash;
        return this.liveGames.get(hash);
    }

    /**
     * Remove a hosted game from the db.
     * @param user the user object returned from verify.js
     * @returns {boolean}
     */
    deleteGame(user) {
        const hash = this.hosts.get(user.userId).hash;
        if (!this.hasGame(user)) return false;
        this.liveGames.delete(hash);
        this.hosts.delete(user.userId);
        return true;
    }

    /**
     * Retrieve the public hash for a game.
     * @param user the user object returned from verify.js
     * @returns {Promise<unknown>}
     */
    getHash(user) {
        return this.hosts.get(user.userId)?.hash;
    }

    /**
     * Return the live game object.
     * This will retrieve it from the database if this is the first time getLive is called
     * for the given game.
     * @param hash The public hash for a game.
     * @return The live game object or undefined if no game found.
     */
    getLive(hash){
        return this.liveGames.get(hash);
    }

    hasLive(hash){
        return this.liveGames.has(hash);
    }
}

export default GameManager;