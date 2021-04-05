import verify from './verify.js';
import {Game} from './Game.js';
import GameModel from './GameModel.js';

/**
 * Game manager REST endpoint.
 * Accepts POST JSON.
 * Returns JSON object {'has-game' : 'true' | 'false'}
 *
 * @param gameManager
 * @returns {function(...[*]=)}
 */
function gameManagerService(gameManager) {
    return async (req, res, next) => {
        let token = req.body.token;

        try {
            let user = await verify(token);
            if (user) await parseMessage(gameManager, req.body, res, user);
            res.end();
        } catch (err) {
            console.log(err);
            res.json({
                result : "game manager service error",
                text : err.toString()
            });
        }
    }
}

async function parseMessage(gameManager, message, res, user){
    console.log(message);
    switch(message.action){
        case "has-game":
        case "launch":
            if (gameManager.hasGame(user)){
                let hashes = await gameManager.getHashes(user);
                hashes['has-game'] = "true";
                res.json(hashes);
            } else {
                res.json({'has-game' : 'false'});
            }
        break;
        case "terminate":
            gameManager.deleteGame(user);
            res.json({});
        break;
    }
}

export default gameManagerService;