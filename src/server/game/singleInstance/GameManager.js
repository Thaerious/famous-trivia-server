// noinspection SqlNoDataSourceInspection,SqlDialectInspection

import crypto from 'crypto';
import {Game} from '../Game.js';
import GameModel from "../GameModel.js";

class GameManager{

   load(gameDescriptionModel) {
       this.gameDescriptionModel = gameDescriptionModel;
       const gameModel = new GameModel(gameDescriptionModel);
       this.game = new Game(gameModel);
       this.hash = crypto.randomBytes(20).toString('hex');
   }

    get size(){
        return 1;
    }

    clearAll(){
        const gameModel = new GameModel(this.gameDescriptionModel);
        this.game = new Game(gameModel);
    }

    set timeAnswer(value){
        this.game.times.ANSWER = parseInt(value);
    }

    set timeBuzz(value){
        this.game.times.BUZZ = parseInt(value);
    }

    set timeMultipleChoice(value){
        this.game.times.MULTIPLE_CHOICE = parseInt(value);
    }

    /**
     * Associate a host with a game.
     * Generates a hash value to recall the game with.
     * @param user the user object returned from verify.js
     * @param game a game object from Game.js
     * @returns {boolean} true if a new game was created.
     */
    setGame(user, liveGame) {
        /* ignored */
    }

    /**
     * List all the users with an game in the db.
     * The user will match with a userid returned from verify.js.
     */
    listHostedGames() {
        throw new Error("not implemented");
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
        throw new Error("not implemented");
    }

    /**
     * Retrieve the public hash for a game.
     * @param user the user object returned from verify.js
     * @returns {Promise<string>}
     */
    getHash(user) {
        return this.hash;
    }

    /**
     * Return the live game object.
     * This will retrieve it from the database if this is the first time getLive is called
     * for the given game.
     * @param hash The public hash for a game.
     * @return The live game object or undefined if no game found.
     */
    getLive(hash){
        return this.game;
    }

    hasLive(hash){
        return true;
    }
}

export default GameManager;