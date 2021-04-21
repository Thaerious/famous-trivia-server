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

    async connect(name){
        let hash = await this.req.session.get("game-hash");
        this.game = await this.gm.getLive(hash);

        this.game.addListener(name, msg => {
            this.ws.send(JSON.stringify(msg));
        });

        console.log("Client Connection Established");

        this.ws.on('message', (message) => {
            console.log("Message from client:");
            console.log(message);
            console.log("-----------------------------------");
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

        this.send({action : "connection_established"});
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
            this.connect("@HOST");
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

    send(msg){
        this.ws.send(JSON.stringify(msg));
    }

    parseMessage(json){
        let msg = JSON.parse(json);
        msg.playerIndex = this.index;

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