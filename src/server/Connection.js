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
    constructor(ws, req, game){
        this.game = game;
        this.ws = ws;

        ws.on('message', (message) => {
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

        ws.on('close', ()=>{
            this.game.disablePlayer(this.index);
        });

        setInterval(()=>this.ping(), 15000);
    }

    ping(){
        this.ws.send(`{"action":"ping"}`);
    }

    /**
     * Notify the game of this connection.
     * The game will assign a role and an index.
     * @param name
     */
    join(name){
        let r = this.game.addListener(name, (message) => this.ws.send(message));
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