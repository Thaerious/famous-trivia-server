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

class Connection{
    constructor(ws, req, gameManager){
        this.req = req;
        this.ws = ws;
        this.gm = gameManager;
    }

    async connect(){
        await this.checkRole();
    }

    /**
     * Check for host in session,
     * If host, add listener.
     * If not host,
     * Check for name in session.
     * If no name, reject connection.
     * If name, add player and listener
     */
    async checkRole(){
        // The host has the session name set by 'connect-host' in game manager endpoint.
        if (await this.req.session.get("role") === "host"){
            this.name = constants.names.HOST;
            await this.establishConnection(this.name);
            if (this.game) {
                this.send(this.game.getUpdate());
            }
        }
        // The player has their session name set by 'join-game' in game manager endpoint
        else if (await this.req.session.has("name") === true){
            this.name = await this.req.session.get("name");
            await this.establishConnection(this.name);
            await this.addPlayer();
        }
        else {
            this.ws.close();
        }
    }

    async establishConnection(name){
        let hash = await this.req.session.get("game-hash");
        this.game = await this.gm.getLive(hash);
        if (!this.game){
            const msg = {
                action : "error",
                text : "Game not found"
            };
            this.ws.send(JSON.stringify(msg));
            this.ws.close();
            return;
        }

        this.game.addListener(name, msg => {
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
                name : name
            }
        });
        setInterval(()=>this.ping(), 15000);
    }

    async addPlayer(){
        let name = await this.req.session.get("name");
        if (!this.game){
            const msg = {
                action : "error",
                text : "Game not found"
            };
            this.ws.send(JSON.stringify(msg));
            this.ws.close();
            return;
        }

        this.game.onInput({
            action : "join",
            data : {
                name : name
            }
        });
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