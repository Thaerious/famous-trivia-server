import verify from './verify.js';
import {Game} from './Game.js';
import GameModel from './GameModel.js';

class GameManagerEndpoint {
    constructor(gameManager, sessionManager) {
        this.gameManager = gameManager;
        this.sessionManager = sessionManager;
    }

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

            console.log("GAME MANAGER ENDPOINT>" + action);
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
     * Attempt to have a contestant join a game.
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async ['join-game'](req, res) {
        let hash = req.body['game-hash'];

        if (req.session.has("game-hash")) {
            if (req.session.get("game-hash") === hash) {
                res.json({
                    result: 'success'
                });
            } else {
                res.json({
                    result: 'rejected',
                    reason: 'Contestant already in another game'
                });
            }
        } else {
            res.json({
                result: 'request_name'
            });
        }
    }

    async ['set-name'](req, res) {
        if (!verifyParameter(req, req, "name")) return;
        if (!verifyParameter(req, req, "game-hash")) return;

        let name = this.validateName(req.body['name']);

        if (name === null) {
            res.json({
                result: 'rejected',
                reason: 'invalid name'
            });
            return;
        } else if (await this.nameInUse(name, req.body['game-hash'])) {
            res.json({
                result: 'rejected',
                reason: 'name is already in use'
            });
        } else {
            await req.session.set("name", name);
            await req.session.set("game-hash", req.body['game-hash']);
            res.json({
                result: 'success'
            });
        }
    }

    async nameInUse(name, gameHash){
        let sessions = await this.sessionManager.reverseLookup("game-hash", gameHash);
        for (const session of sessions){
            if (await this.sessionManager.getSession(session).get("name") === name){
                return true;
            }
        }
        return false;
    }

    /**
     * Requires a model (json with game description) and a token (Google auth token),
     * responds with result : success, hash : game-hash.  The game hash is passed to
     * players so they can connect.
     * @returns {Promise<void>}
     */
    async ['launch'](req, res) {
        let model = req.body.model;
        let token = req.body.token;

        if (!model) {
            res.json({error: "missing field: model"});
            res.end();
            return;
        }

        if (!token) {
            res.json({error: "missing field: token"});
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
            res.json({error: err.toString()});
            res.end();
        }
    }

    /**
     * Requires a token (Google auth token), responds with result : success.
     * Clears the game from the DB, and all associated player parameters.
     * @returns {Promise<void>}
     */
    async ['terminate'](req, res){
        if (!verifyParameter(req, req, "token")) return;

        try {
            let user = await verify(req.body['token']);
            const gameHash = await this.gameManager.getHash(user);
            await this.gameManager.deleteGame(user);

            let sessionHashes = this.sessionManager.reverseLookup("game-hash", gameHash);
            console.log(sessionHashes);
            for (const sessionHash of sessionHashes){
                await this.sessionManager.getSession(sessionHash).clear("game-hash");
            }

            res.json({result: "success"});
            res.end();
        } catch (err) {
            console.trace();
            console.log(err);
            res.json({error: err.toString()});
            res.end();
        }
    }

    validateName(source) {
        if (!source.match(/^[ a-zA-Z_-]{0,15}$/)) return null;
        return source.toUpperCase();
    }
}

function verifyParameter(req, res, parameter){
    let value = req.body[parameter];

    if (!value) {
        res.json({error: `missing parameter: ${parameter}`});
        res.end();
        return false;
    }
    return true;
}

export default GameManagerEndpoint;