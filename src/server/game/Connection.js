import constants from "../../config.js";

/**
 * All incoming messages to the server should take the form of
 * {
 *     action : [string]
 *     ...
 *     other data
 * }
 */

class ParseError extends Error{
    constructor(message) {
        super();
        this.message = message;
    }
}

/**
 * Create a new websocket connection to a running game.
 */
class Connection{
    constructor(ws, req, gameManager, gameManagerEndpoint){
        this.req = req;
        this.ws  = ws;
        this.gm  = gameManager;
        this.gme = gameManagerEndpoint;
    }

    /**
     * Perform the connection.
     * Check for host in session,
     * - If host, add listener.
     * - If not host,
     * Check for name in session.
     * - If no name, reject connection.
     * - If name, add player and listener
     */
    async connect(){
        await this.establishConnection();
        if (this.role === "host"){
            this.send(this.game.getUpdate());
        } else {
            this.game.joinPlayer(this.name);
        }
    }

    /**
     * Establish a connection between a client (either host or contestant) and
     * the game.  Either GameManagerEndpoint#join-game, or GameManagerEndpoint#connect-host
     * must be called prior to establishing this websocket connection.
     * @returns {Promise<void>}
     */
    async establishConnection(){
        let sessionHash = await this.req.session.hash;

        try {
            const gameHash = this.gme.getGameHash(sessionHash)
            this.game = await this.gm.getLive(gameHash);
            this.name = await this.gme.getName(sessionHash);
            this.role = await this.gme.getRole(sessionHash);
        } catch (err){
            console.error(err);
            const msg = {
                action : "error",
                text : err.toString()
            };
            this.ws.send(JSON.stringify(msg));
            this.ws.close();
            return;
        }

        this.game.addListener(this.name, msg => {
            this.ws.send(JSON.stringify(msg));
        });

        this.ws.on('message', (message) => {
            try {
                this.parseMessage(message);
            } catch (err) {
                let msg = {
                    action : "error",
                    text   : err.msg
                }
                this.ws.send(JSON.stringify(msg));
                console.log(err);
            }
        });

        this.send({
            action : "connection_established",
            data : {
                name : this.name,
                role : this.role
            }
        });
        setInterval(()=>this.ping(), 15000);
    }

    ping(){
        this.ws.send(`{"action":"ping"}`);
    }

    send(msg){
        this.ws.send(JSON.stringify(msg));
    }

    parseMessage(json){
        let msg = JSON.parse(json);
        msg.player = this.name;

        switch (msg.action){
            case "request_model":
                this.send(this.game.getUpdate());
            break;
            default:
                this.game.onInput(msg);
            break;
         }
    }
}

export default Connection;