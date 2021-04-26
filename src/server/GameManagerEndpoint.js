import verify from './verify.js';
import {Game} from './Game.js';
import GameModel from './GameModel.js';

class GameManagerEndpoint {
    constructor(gameManager) {
        this.gameManager = gameManager;
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
            console.log(req.body);
            await this[action](req, res);
        }
    }

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

    async ['join-game'] (req, res) {
        if (!req.session.has("name")){
            res.json({
                result: 'request_name'
            });
        } else {
            res.json({
                result: 'success',
                name : req.session.get("name")
            });
        }
    }

    async ['set-name'] (req, res) {
        let name = this.validateName(req.body['name']);
        if (name === null){
            res.json({
                result: 'rejected',
                reason : 'invalid name'
            });
        }
        else if (await this.gameManager.hasContestant(name, req.body['game-hash'])){
            res.json({
                result: 'rejected',
                reason : 'name is already in use'
            });
        }
        else {
            await this.gameManager.addContestant(name, req.body['game-hash']);
            await req.session.set("name", name);
            await req.session.set("game-hash", req.body['game-hash']);
            res.json({
                result: 'success',
                name : req.session.get("name")
            });
        }
    }

    validateName(source){
        if (!source.match(/^[ a-zA-Z_-]{0,15}$/)) return null;
        return source.toUpperCase();
    }
}

export default GameManagerEndpoint;