import verify from './verify.js';
import {Game} from './Game.js';
import GameModel from './GameModel.js';

function launcher(gameManager) {
    return async (req, res, next) => {
        let model = req.body.model;
        let token = req.body.token;

        if (!model){
            res.json({
                result : "launcher error",
                text : "missing parameter: model"
            });
            res.end();
            return;
        }

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
            let game = new Game(new GameModel(model));
            gameManager.setGame(user, game)
            let hashes = await gameManager.getHashes(user);
            hashes.result = "success";
            res.json(hashes);
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
}

export default launcher;