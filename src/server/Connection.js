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
    constructor(ws, req, game, sessionManager){
        this.game = game;
        this.ws = ws;
        this.sessionManager = sessionManager;

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
        let r = this.game.connect(name, (message) => this.ws.send(message));
        this.role = r.role;
        this.index = r.index;
        this.name = name;
    }

    parseMessage(json){
        let msg = JSON.parse(json);
        msg.playerIndex = this.index;

        switch (msg.action){
            case "request_model":
                this.game.notify(this.name);
            break;
            case "buzz":
                this.game.onAction(msg);
            break;
            case "logout":
                if (this.index >= 0) this.game.disablePlayer(this.index);
                this.sessionManager.deleteName(this.name);
                this.ws.close();
            break;
            case "load_questions":
                if (this.role !== "host") throw new ParseError("Non-Host attempting host op");
                this.game.onCommand(msg);
            break;
            case "select_question":
            case "accept_answer":
            case "reject_answer":
            case "start_timer":
            case "time_out":
            case "continue":
            case "back":
                if (this.role !== "host") throw new ParseError("Non-Host attempting host op");
                this.game.onAction(msg);
            break;
         }
    }
}

export default Connection;