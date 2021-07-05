// noinspection DuplicatedCode

import verify from '../mechanics/verify.js';
import {Game} from './Game.js';
import GameModel from './GameModel.js';
import NameValidator from "./NameValidator.js";
import NameInUseResponse from "./responses/NameInUseResponse.js";
import InvalidNameResponse from "./responses/InvalidNameResponse.js";
import SuccessResponse from "./responses/SuccessResponse";

/**
 * API for all non-websocket client-server interaction.
 */
class GameManagerEndpoint {

    /**
     * Create a new GameManagerEndpoint.
     * @param {GameManager} gameManager
     * @param {SessionManager} sessionManager
     */
    constructor(gameManager, sessionManager) {
        this.gameManager = gameManager;
        this.sessionManager = sessionManager;
        this.validator = new NameValidator();
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
     * Determine if a host has started a game.
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async ['has-game'](req, res) {
        let token = req.body.token;
        try {
            let user = await verify(token);
            if (await this.gameManager.hasGame(user)) {
                let hash = await this.gameManager.getHash(user);
                res.json({
                    result: 'success',
                    hash: hash,
                });
            } else {
                res.json({
                    result: 'failure'
                });
            }
            res.end();
        } catch (err) {
            console.log(err);
            res.json({
                error: err.toString()
            });
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
                res.json({
                    result: 'rejected',
                    reason: 'Contestant is not in a game.',
                    eid : 1
                });
            } else {
                res.json({
                    'result': 'success',
                    'game-hash': gameHash
                });
            }
        } else {
            res.json({
                result: 'rejected',
                reason: 'Contestant is not in a game.',
                eid : 2
            });
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

        if (!this.validator.validate(name)) {
            res.json(new InvalidNameResponse(name).object);
        } else if (await this.nameInUse(name, req.body['game-hash'])) {
            const processed = this.validator.preProcess(name);
            res.json(new NameInUseResponse(processed).object);
        } else {
            const processed = this.validator.preProcess(name);
            await req.session.set("name", processed);
            await req.session.set("game-hash", req.body['game-hash']);
            res.json(new SuccessResponse().object);
        }
    }

    async ['connect-host'](req, res) {
        let token = req.body.token;

        if (!token){
            res.json({
                result : "launcher error",
                text : "missing parameter: token"
            });
            res.end();
            return;
        }

        try {
            let user = await verify(token);
            let hash = await this.gameManager.getHash(user);
            await req.session.set("role", "host");
            await req.session.set("game-hash", hash);

            res.json({
                result : "success"
            });
            res.end();
        } catch (err) {
            console.log(err);
            res.json({
                result : "launcher error",
                text : err.toString()
            });
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
            res.json({
                result : "error",
                reason: "missing field: model"
            });
            res.end();
            return;
        }

        if (!token) {
            res.json({
                result : "error",
                reason: "missing field: token"
            });
            res.end();
            return;
        }

        try {
            let user = await verify(token);
            let game = new Game(new GameModel(model));
            await this.gameManager.setGame(user, game)
            let hash = await this.gameManager.getHash(user);
            res.json({
                result: "success",
                hash: hash
            });
            res.end();
        } catch (err) {
            console.log(err);
            res.json({
                result : "error",
                reason: err.toString()
            });
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
            console.trace();
            console.log(err);
            res.json({
                result : "error",
                reason: err.toString()
            });
            res.end();
        }
    }
}

function verifyParameter(req, res, parameter) {
    let value = req.body[parameter];

    if (!value) {
        res.json({
            result : "error",
            reason: `missing parameter: ${parameter}`
        });
        res.end();
        return false;
    }
    return true;
}

export default GameManagerEndpoint;