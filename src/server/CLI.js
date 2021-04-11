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

    help(){
        console.log("exit, x : terminate server");
        console.log("list, l : list all lauched games");
    }

    command(command) {
        let split = command.split(/[ ]+/);

        switch (split[0].toLowerCase()) {
            case "x":
            case "exit":
                this.exit();
            break;
            case "help":
                this.help();
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
            default:
                console.log("Unknown command");
                break;
        }
    }

    sessionCommand(split){
        switch (split[1]) {
            case "list":
            case "l":
                let r = this.sessionManager.listHashes();
                console.log(r);
                for (let s of r) console.log(s);
                console.log("-----------------");
                console.log("size " + r.length);
        }
    }
}

export default CLI;