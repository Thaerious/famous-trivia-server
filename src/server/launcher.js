
function launcher(req, res, next) {
    let gameModel = req.body;
    console.log(req);
    console.log(gameModel);

    let connectHashes = {
        contestant : "ABBC9FE",
        host : "FFFD98B"
    };

    console.log(connectHashes);
    res.json(JSON.stringify(connectHashes, null, 2));
    res.end();
}

export default launcher;