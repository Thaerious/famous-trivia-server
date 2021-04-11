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
        this.checkRole();
    }

    async addPlayer(){
        let name = await this.req.session.get("name");
        this.game.addPlayer(name);
    }

    async connect(){
        let hash = await this.req.session.get("game-hash");
        this.game = await this.gm.getLive(hash);

        this.game.addListener(meg => {
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
                ws.send(JSON.stringify(msg));
                console.log(err);
            }
        });

        setInterval(()=>this.ping(), 15000);
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
        if (await this.req.session.get("role") === "host"){
            this.connect();
        }
        else if (await this.req.session.has("role") === "contestant"){
            await this.connect();
            await this.addPlayer();
        }
        else {
            this.ws.close();
        }
    }

    ping(){
        this.ws.send(`{"action":"ping"}`);
    }

    parseMessage(json){
        let msg = JSON.parse(json);
        msg.playerIndex = this.index;

        switch (msg.action){
            case "request_model":
                let update = this.getUpdate();
                update.action = "update_model";
                update.input = input.action;
                this.ws.send(update);
            break;
            case "buzz":
                this.game.onInput(msg);
            break;
            case "logout":
                if (this.index >= 0) this.game.disablePlayer(this.index);
                this.ws.close();
            break;
            case "load_questions":
                if (this.role !== "host") throw new ParseError("Non-Host attempting host op");
                this.game.onCommand(msg);
            break;
            case "select":
            case "accept":
            case "reject":
            case "continue":
                this.game.onAction(msg);
            break;
         }
    }
}

export default Connection;