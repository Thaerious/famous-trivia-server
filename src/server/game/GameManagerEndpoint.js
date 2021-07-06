// noinspection DuplicatedCode,JSUnresolvedFunction

import verify from '../mechanics/verify.js';
import {Game} from './Game.js';
import GameModel from './GameModel.js';
import NameValidator from "./NameValidator.js";
import NameInUseResponse from "./responses/NameInUseResponse.js";
import InvalidNameResponse from "./responses/InvalidNameResponse.js";
import SuccessResponse from "./responses/SuccessResponse.js";
import SuccessGameHashResponse from "./responses/SuccessGameHashResponse.js";
import ErrorResponse from "./responses/ErrorResponse.js";
import NotInGameResponse from "./responses/NotInGameResponse.js";
import RejectedResponse from "./responses/RejectedResponse.js";

/**
 * API for all non-websocket client-server interaction.
 */
class GameManagerEndpoint {
    /**
     * Create a new GameManagerEndpoint.
     *
     * The validator is an object to validate names, has #preProcess and #validate
     * The verify accepts a token:string and returns {userId:string, userName:string}
     * @param {GameManager} gameManager
     * @param {NameValidator} validator (name validator)
     * @param {function} verify
     */
    constructor(gameManager, validator, verify) {
        this.gameManager = gameManager;
        this.validator = validator;
        this.verify = verify;

        this.table = {}; // gameHash : session-hash, name, role
        // {'game-hash' : {
        //   'session-hash' : {
        //      name : name,
        //      role : role
        //   }
        // }
    }

    /**
     * Retrieve a new middleware callback for the endpoint.
     * @returns {(function(*=, *=, *): Promise<void>)|*}
     */
    get middleware() {
        return async (req, res, next) => {
            if (!req.body) {
                next(new Error("Missing body from endpoint request"));
                return;
            }

            const action = req.body.action;

            if (!action) {
                next(new Error("Missing action from endpoint request"));
                return;
            }

            if (!this[action]) {
                next(new Error("Unknown game-manager-endpoint action: " + action));
                return;
            }

            let response = await this[action](req.body, req.session.hash);
            res.toJSON(response.object);
            res.end();
        }
    }

    /**
     * <b>Launch a new game from a game description model.</b>
     * The 'body' requires a model field and a token field (Google auth token),
     * The token will be tested against the 'verify' function passed into the constructor.
     * The model will be used to instantiate the GameModel object which is returned by
     * subsequent calls to the api, using the returned game hash as a key.
     *
     * @param {Object} body {token, model}
     * @returns {Promise<SuccessGameHashResponse|ErrorResponse>}
     */
    async ['launch'](body) {
        if (!verifyParameter(body, "token")){
            return new ErrorResponse(`missing parameter: token`);
        }

        if (!verifyParameter(body, "model")){
            return new ErrorResponse(`missing parameter: model`);
        }

        let token = body.token;
        let model = body.model;

        try {
            let user = await this.verify(token);
            let game = new Game(new GameModel(model));

            if (await this.gameManager.hasGame(user)){
                return new ErrorResponse("game already launched for token");
            }

            await this.gameManager.setGame(user, game)
            let gameHash = await this.gameManager.getGameHash(user);
            this.table[gameHash] = {};
            return new SuccessGameHashResponse(gameHash);
        } catch (err) {
            return new ErrorResponse(err.toString());
        }
    }

    /**
     * <b>Retrieve the game-hash for a launched game.</b>
     * The 'body' requires a token field (Google auth token).
     * The token will be tested against the 'verify' function passed into the constructor.
     * If a game has not been launched the a rejected response will be sent.
     * Will send an error response if the token is rejected.
     * @param body {token}
     * @returns {Promise<RejectedResponse|SuccessGameHashResponse|ErrorResponse>}
     */
    async ['get-hosted-game-hash'](body) {
        if (!verifyParameter(body, "token")){
            return new ErrorResponse(`missing parameter: token`);
        }

        let token = body.token;

        try {
            let user = await this.verify(token);

            if (await this.gameManager.hasGame(user)) {
                let gameHash = await this.gameManager.getGameHash(user);
                return new SuccessGameHashResponse(gameHash);
            } else {
                return new RejectedResponse();
            }
        } catch (err) {
            return new ErrorResponse(err.toString());
        }
    }

    /**
     * <b>Join a contestant to a launched game.</b>
     * The 'body' requires a name and a game-hash field.
     * The name will be tested against the Validator class-object passed into the
     * constructor.  Invalid names & already used names will receive a rejected response.
     * Unknown game hashes will receive an error response.
     * Sessions already in a game will return a rejected; use 'get-game-hash' to determine
     * if the user has joined before calling 'join-game'.
     * @param body {name, game-hash}
     * @param sessionHash
     * @returns {Promise<SuccessResponse|ErrorResponse|RejectedResponse>}
     */
    async ['join-game'](body, sessionHash) {
        if (!verifyParameter(body, "name")){
            return new ErrorResponse(`missing parameter: name`);
        }

        if (!verifyParameter(body, "game-hash")){
            return new ErrorResponse(`missing parameter: game-hash`);
        }

        const name = body['name'];
        const processed = this.validator.preProcess(name);
        const gameHash = body['game-hash'];

        if (!this.table[gameHash]){
            return new ErrorResponse(`unknown game`);
        }

        if (this.knownSessions()[sessionHash]){
            return new RejectedResponse("player already in game");
        }

        if (!this.validator.validate(name)) {
            return new InvalidNameResponse(name);
        } else if (await this.nameInUse(processed, body['game-hash'])) {
            return new NameInUseResponse(processed);
        } else {
            this.table[gameHash][sessionHash] = {name : processed, role : "contestant"};
            return new SuccessResponse();
        }
    }

    /**
     * <b>Retrieve a game-hash using a contestant session-hash as the key.</b>
     * No 'body' is read for this method.
     * Unknown session hashes will emit a rejected response.
     * Known session hashes will emit a success response with the 'game-hash' field.
     * @param sessionHash
     * @returns {Promise<SuccessResponse|RejectedResponse>}
     */
    async ['get-game-hash'](body, sessionHash) {
        const tableEntry = this.knownSessions()[sessionHash];

        if (!tableEntry) return new RejectedResponse("no game associated with session hash");
        return new SuccessGameHashResponse(tableEntry['game-hash']);
    }

    /**
     * <b>Associate a session with a game as host.</b>
     * The 'body' requires a token field (Google auth token),
     * The token will be tested against the 'verify' function passed into the constructor.
     * If a game has not been launched an error will be emitted.
     * On success emits a success with a game-hash.
     * @param body
     * @param sessionHash
     * @returns {Promise<SuccessResponse|ErrorResponse>}
     */
    async ['connect-host'](body, sessionHash) {
        if (!verifyParameter(body, "token")){
            return new ErrorResponse(`missing parameter: token`);
        }

        const token = body.token;

        try {
            const user = await this.verify(token);

            if (!await this.gameManager.hasGame(user)){
                return new ErrorResponse("game not launched for token");
            }

            const gameHash = await this.gameManager.getGameHash(user);

            this.table[gameHash]['host'] = sessionHash;
            return new SuccessGameHashResponse(gameHash);
        } catch (err) {
            return new ErrorResponse(err.toString());
        }
    }

    async nameInUse(name, gameHash) {
        for (const sessionHash in this.table[gameHash]){
            if (this.table[gameHash][sessionHash].name === name) return true;
        }
        return false;
    }

    /**
     * Requires a token (Google auth token), responds with result : success.
     * Clears the game from the DB, and all associated player parameters.
     */
    async ['terminate'](body, sessionHash) {
        if (!verifyParameter(body, "token")){
            return new ErrorResponse(`missing parameter: token`);
        }

        try {
            let user = await this.verify(body['token']);
            const gameHash = await this.gameManager.getGameHash(user);
            await this.gameManager.deleteGame(user);
            delete this.table[gameHash];
            return new SuccessResponse();
        } catch (err) {
            return new ErrorResponse(err.toString());
        }
    }

    /**
     * Return a table of sessionHash => {game-hash, name, role}
     */
    knownSessions(){
        const table = {};
        for (const gameHash in this.table){
            for (const sessionHash in this.table[gameHash]){
                const entry = this.table[gameHash][sessionHash];
                table[sessionHash] = {'game-hash' : gameHash, 'name': entry.name, 'role': entry.role};
            }
        }
        return table;
    }

    /**
     * <b>Determine if the session hash is registered as the host of the game.</b>
     * @param gameHash
     * @param sessionHash
     * @returns {boolean}
     */
    isHostSession(gameHash, sessionHash){
        if (!this.table[gameHash]) return false;
        return this.table[gameHash].host === sessionHash;
    }

    /**
     * <b>Determine if the session hash is registered as a contestant of the game.</b>
     * @param gameHash
     * @param sessionHash
     * @returns {boolean}
     */
    isContestantSession(gameHash, sessionHash){
        if (!this.table[gameHash]) return false;
        return this.table[gameHash][sessionHash] !== undefined;
    }
}

function verifyParameter(body, parameter) {
    let value = body[parameter];
    if (!value) return false;
    return true;
}

export default GameManagerEndpoint;