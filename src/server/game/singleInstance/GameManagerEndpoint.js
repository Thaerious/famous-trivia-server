// noinspection DuplicatedCode

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

            if (!req.body.action) {
                next(new Error("Missing action from endpoint request"));
                return;
            }

            if (!this[req.body.action]) {
                next(new Error("Unknown game-manager-endpoint action: " + req.body.action));
                return;
            }

            await this[req.body.action](req, res);
        }
    }

    /**
     * Determine if a host has started a game.
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async ['has-game'](req, res) {
        try {
            res.json({
                result: 'success',
                hash: this.gameManager.getHash(),
            });
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
     * Have a contestant join a game
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async ['join-game'](req, res) {
        if (!verifyParameter(req, res, "name")) return;

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
            await req.session.set("game-hash", this.gameManager.getHash());
            res.json({
                result: 'success'
            });
        }
    }

    /**
     * Connect the host to the game
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async ['connect-host'](req, res) {

        try {
            let hash = await this.gameManager.getHash();
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
     *
     * Ignored in the single instance, always successful.
     *
     * @returns {Promise<void>}
     */
    async ['launch'](req, res) {
        try {
            let hash = await this.gameManager.getHash();
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
            const gameHash = await this.gameManager.getHash();
            this.gameManager.clearAll();

            let sessionHashes = this.sessionManager.reverseLookup("game-hash", gameHash);
            for (const sessionHash of sessionHashes) {
                await this.sessionManager.getSession(sessionHash).clear("game-hash");
            }

            res.json({result: "success"});
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

    validateName(source) {
        if (!source.match(/^[ a-zA-Z_-]{0,15}$/)) return null;
        return source.toUpperCase();
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