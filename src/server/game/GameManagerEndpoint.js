// noinspection DuplicatedCode

import verify from '../mechanics/verify.js';
import {Game} from './Game.js';
import GameModel from './GameModel.js';
import NameValidator from "./NameValidator.js";
import NameInUseResponse from "./responses/NameInUseResponse.js";
import InvalidNameResponse from "./responses/InvalidNameResponse.js";
import SuccessResponse from "./responses/SuccessResponse.js";
import GetGameSuccessResponse from "./responses/GetGameSuccessResponse.js";
import ErrorResponse from "./responses/ErrorResponse.js";
import NotInGameResponse from "./responses/NotInGameResponse.js";
import RejectedResponse from "./responses/RejectedResponse.js";

/**
 * API for all non-websocket client-server interaction.
 */
class GameManagerEndpoint {
    /**
     * Create a new GameManagerEndpoint.
     * @param {GameManager} gameManager
     * @param {SessionManager} sessionManager
     * @param {Validator} validator a verification function that accepts
     */
    constructor(gameManager, sessionManager, validator) {
        this.gameManager = gameManager;
        this.sessionManager = sessionManager;
        this.validator = validator;
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

            await this[action](req, res);
        }
    }

    /**
     * Retrieve the game hash for the host.
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async ['get-hosted-game-hash'](req, res) {
        let token = req.body.token;
        try {
            let user = await verify(token);

            if (await this.gameManager.hasGame(user)) {
                let hash = await this.gameManager.getHash(user);
                res.json(new GetGameSuccessResponse(hash).object);
            } else {
                res.json(new RejectedResponse().object);
            }
            res.end();
        } catch (err) {
            console.error(err);
            res.json(new ErrorResponse(err.toString()).object);
        }
    }

    /**
     * Retrieve a game that a contestant has joined.
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async ['get-game-hash'](req, res) {
        if (req.session.has("game-hash")) {
            const gameHash = req.session.get("game-hash");
            if (!await this.gameManager.hasLive(gameHash)){
                res.json(new NotInGameResponse(1).object);
            } else {
                res.json(new GetGameSuccessResponse(gameHash).object);
            }
        } else {
            res.json(new NotInGameResponse(2).object);
        }
    }

    /**
     * Attempt to have a contestant join a game.
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async ['join-game'](req, res) {
        if (!verifyParameter(req, res, "name")) return;
        if (!verifyParameter(req, res, "game-hash")) return;

        const name = req.body['name'];
        const processed = this.validator.preProcess(name);

        if (!this.validator.validate(name)) {
            res.json(new InvalidNameResponse(name).object);
        } else if (await this.nameInUse(processed, req.body['game-hash'])) {
            res.json(new NameInUseResponse(processed).object);
        } else {
            await req.session.set("name", processed);
            await req.session.set("game-hash", req.body['game-hash']);
            res.json(new SuccessResponse().object);
        }
    }

    async ['connect-host'](req, res) {
        let token = req.body.token;

        if (!token){
            res.json(new ErrorResponse("missing parameter: token").object);
            res.end();
            return;
        }

        try {
            let user = await verify(token);
            let hash = await this.gameManager.getHash(user);
            await req.session.set("role", "host");
            await req.session.set("game-hash", hash);
            res.json(new SuccessResponse().object);
            res.end();
        } catch (err) {
            console.error(err);
            res.json(new ErrorResponse(err.toString()).object);
            res.end();
        }
    }

    async nameInUse(name, gameHash) {
        let sessions = await this.sessionManager.reverseLookup("game-hash", gameHash);
        for (const session of sessions) {
            if (await this.sessionManager.getSession(session).get("name") === name) {
                return true;
            }
        }
        return false;
    }

    /**
     * <b>Launch a new game from a game description model.</b>
     * Requires a model (json with game description) and a token (Google auth token),
     * responds with result : success, hash : game-hash.  The game hash is passed to
     * players so they can connect.
     * @returns {Promise<void>}
     */
    async ['launch'](req, res) {
        let model = req.body.model;
        let token = req.body.token;

        if (!model) {
            res.json(new ErrorResponse("missing field: model").object);
            res.end();
            return;
        }

        if (!token) {
            res.json(new ErrorResponse("missing field: token").object);
            res.end();
            return;
        }

        try {
            let user = await verify(token);
            let game = new Game(new GameModel(model));
            await this.gameManager.setGame(user, game)
            let hash = await this.gameManager.getHash(user);
            res.json(new GetGameSuccessResponse(hash).object);
            res.end();
        } catch (err) {
            console.error(err);
            res.json(new ErrorResponse(err.toString()).object);
            res.end();
        }
    }

    /**
     * Requires a token (Google auth token), responds with result : success.
     * Clears the game from the DB, and all associated player parameters.
     * @returns {Promise<void>}
     */
    async ['terminate'](req, res) {
        if (!verifyParameter(req, res, "token")) return;

        try {
            let user = await verify(req.body['token']);
            const gameHash = await this.gameManager.getHash(user);
            await this.gameManager.deleteGame(user);

            let sessionHashes = this.sessionManager.reverseLookup("game-hash", gameHash);
            for (const sessionHash of sessionHashes) {
                await this.sessionManager.getSession(sessionHash).clear("game-hash");
            }

            res.json({result: "success"});
            res.end();
        } catch (err) {
            res.json(new ErrorResponse(err.toString()).object);
            res.end();
        }
    }
}

function verifyParameter(req, res, parameter) {
    let value = req.body[parameter];

    if (!value) {
        res.json(new ErrorResponse(`missing parameter: ${parameter}`).object);
        res.end();
        return false;
    }
    return true;
}

export default GameManagerEndpoint;