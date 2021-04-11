import verify from './verify.js';
import {Game} from './Game.js';
import GameModel from './GameModel.js';

function connectHost(gameManager) {
    return async (req, res, next) => {
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
            let hash = await gameManager.getHash(user);
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
}

export default connectHost;