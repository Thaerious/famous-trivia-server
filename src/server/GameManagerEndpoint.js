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
        }
    }

    async ['set-name'] (req, res) {
        // this.gameManager.hasContestant(req.body['name'], req.body['game-hash']);
        await this.gameManager.addContestant(req.body['name'], req.body['game-hash']);
    }
}

export default GameManagerEndpoint;