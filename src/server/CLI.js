import readline from 'readline';
import constants from "./constants.js";

class CLI {
    constructor(gameManager, sessionManager) {
        this.gameManager = gameManager;
        this.sessionManager = sessionManager;

        let rl = readline.createInterface(process.stdin, process.stdout);
        rl.setPrompt('SERVER> ');
        rl.prompt();

        rl.on('line', function(line) {
            try {
                this.command(line);
            }catch(err){
                console.log("CLI error");
                console.log(err);
            }
            rl.prompt();
        }.bind(this));

        rl.on('close', function() {
            process.exit(0);
        });
    }

    exit(){
        console.log("Goodbye!");
        process.exit(0);
    }

    command(command) {
        let split = command.split(/[ ]+/);

        switch (split[0].toLowerCase()) {
            case "x":
            case "exit":
                this.exit();
            break;
            case "l":
            case "list":
                this.gameManager.list();
                break;
            case "ap":
            case "addplayer":
                game.gameModel.addPlayer(split[1]);
                game.broadcast();
                break;
            case "session":
            case "s":
                this.sessionCommand(split);
                break
            case "":
                break;
            case "help":
            case "?":
            default:
                console.log("exit, x : terminate server");
                console.log("list, l : list all lauched games");
                console.log("session, s : sessions submenu");
                break;
        }
    }

    sessionCommand(split){
        switch (split[1]) {
            case "reload":
            case "r":
                this.sessionManager.load();
                break;
            case "clear":
            case "c":
                this.sessionManager.clearAll();
                break;
            case "list":
            case "l":
                let r = this.sessionManager.listHashes();
                console.log(r);
                for (let s of r) console.log(s);
                console.log("-----------------");
                console.log("size " + r.length);
                break;
            case "help":
            case "?":
            default:
                console.log("clear, c : clear all sessions");
                console.log("list, l : list all sessions");
                break;
        }
    }
}

export default CLI;