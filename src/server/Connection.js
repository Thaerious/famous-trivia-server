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
        this.game.onInput({
            action : "join",
            data : {
                name : name
            }
        });
    }

    async connect(name){
        let hash = await this.req.session.get("game-hash");
        this.game = await this.gm.getLive(hash);

        this.game.addListener(name, msg => {
            this.ws.send(JSON.stringify(msg));
        });

        console.log("Client Connection Established");

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
            console.log(`Host connected`);
            this.name = "@HOST";
            await this.connect(this.name);
        }
        else if (await this.req.session.has("name") === true){
            this.name = await this.req.session.get("name");
            console.log(`Contestant ${this.name} connected`);
            await this.connect(this.name);
            await this.addPlayer();
        }
        else {
            console.log(`Connection terminated`);
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