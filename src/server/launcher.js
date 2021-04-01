import {OAuth2Client} from "google-auth-library";

function launcher(gameManager) {
    return async (req, res, next) => {
        let model = req.body.model;
        let token = req.body.token;

        try {
            let userId = await verify(token);
            gameManager.newGame(userId, model)
            let hashes = gameManager.getHashes(userId);
            hashes.result = "success";
            res.json(hashes);
            res.end();
        } catch (err) {
            res.json({
                result : "error",
                text : err.toString()
            });
        }
    }
}

async function verify(token){
    const client = new OAuth2Client(token);
    let s = 0;
    for (let i = 0; i < token.length; i++){
        s = ((s * 10) + token.charCodeAt(i)) % 10000000;
    }

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com"
    });

    const payload = ticket.getPayload();
    const userId = payload['sub'];
    return userId;
}

export default launcher;