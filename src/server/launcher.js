import crypto from 'crypto';

function link(req, res, next) {
    let gameModel = req.body;
    console.log(req);
    console.log(gameModel);

    let connectHashes = {
        contestant : crypto.randomBytes(20).toString('hex'),
        host : crypto.randomBytes(20).toString('hex')
    };

    res.json(JSON.stringify(connectHashes, null, 2));
    res.end();
}

function launcher(gameManager) {
    return (req, res, next) => {
        let gameModel = req.body;
        gameManager.newGame(gameModel)
        let info = gameManager.getInfo(gameModel.host);
        delete info.game;
        res.json(info);
        res.end();
    }
}

export default launcher;