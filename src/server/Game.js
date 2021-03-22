import GameModel from "./GameModel.js";
import fs from 'fs';

class Timer{
    constructor(game) {
        this.game = game;
    }

    start(startTime = 10){
        if (this.timeout){
            clearTimeout(this.timeout);
            delete this.timeout;
        }

        this.currentTime = startTime;
        this.timeout = setTimeout(()=>this.update(), 1000);
        this.game.broadcast({action: "start_timer", value: startTime});
    }

    stop(){
        if (this.timeout){
            clearTimeout(this.timeout);
            delete this.timeout;
        }
    }

    update(){
        this.currentTime = this.currentTime - 1;
        if(this.currentTime > 0){
            this.timeout = setTimeout(()=>this.update(), 1000);
            this.onUpdate(this.currentTime);
        } else {
            this.onExpire();
        }
    }

    onUpdate(){
        this.game.broadcast({action: "update_timer", value: this.currentTime});
    }

    onExpire(){
        delete this.timeout;
        this.game.onAction({action:"clock_expired"});
        this.game.broadcast({action: "stop_timer"});
    }

    clear(){
        if (this.timeout) clearTimeout(this.timeout);
    }
}

/**
 * Will load questions named "round_1.json" by default.
 */
class Game{
    constructor(questDir){
        this.listeners = {};
        this.gameModel = new GameModel();
        this.savefilename = "trivia.json";
        this.timer = new Timer(this);
        this.questDir = questDir;

        this.loadDefaultQuestions();
    }

    loadDefaultQuestions(){
        let filename = this.questDir + "/round_1.json";
        fs.exists(filename, () => this.loadQuestions("round_1.json"));
    }

    /**
     * Notify the host about the question directory contents.
     */
    notifyDirectory(){
        fs.readdir(this.questDir, (err, files) => {
            this.notify("host", {
                action: "dir",
                contents: files
            });
        });
    }

    onCommand(command){
        switch(command.action){
            case "load_questions":
                this.loadQuestions(command.filename);
            break;
        }
    }

    removePlayer(name){
        this.notify(name, {action:'disconnect'});
        if (this.listeners[name]){
            delete this.listeners[name];
        }
        this.gameModel.removePlayer(name);
        this.broadcast();
    }

    onAction(action){
        switch (this.gameModel.state){
            case "show_board":
                this.showBoardAction(action);
            break;
            case "show_question":
                this.showQuestionAction(action);
            break;
            case "answer_clock":
                this.answerClockAction(action);
                break;
            case "answer_limbo":
                this.answerLimboAction(action);
                break;
            case "buzz_clock":
                this.buzzClockAction(action);
            break;
            case "show_answer":
                this.showAnswerAction(action);
            break;
            default:
                console.log("unhandled state: " + this.gameModel.state);
            break;
        }

        // console.log(`new state ${this.gameModel.state}`);
        // console.log("---------------------------------------");
        this.broadcast();
    }

    showBoardAction(action){
        switch(action.action){
            case "select_question":
                this.showQuestion(action.col, action.row);
                this.gameModel.state = "show_question";
                console.log("-------------------------------");
                console.log(this.gameModel.getAnswer());
            break;
            default:
                console.log("unhandled action");
            break;
        }
    }

    showQuestionAction(action){
        switch(action.action){
            case "start_timer":
                this.timer.start();
                this.gameModel.state = "answer_clock";
            break;
            case "back":
                this.gameModel.clearBuzzers();
                this.gameModel.state = "show_board";
            break;
            default:
                console.log("unhandled action");
            break;
        }
    }

    answerClockAction(action){
        switch(action.action){
            case "accept_answer":
                this.gameModel.setScore(this.gameModel.getScore() + this.gameModel.getValue());
                this.gameModel.setValue("");
                this.gameModel.setAnswerState();
                this.gameModel.state = "show_answer";
                this.timer.stop();
                break;
            case "reject_answer":
                if (this.gameModel.current_player !== this.gameModel.active_player) {
                    this.gameModel.setScore(this.gameModel.getScore() - (this.gameModel.getValue() / 2));
                }

                this.gameModel.setBuzzer("disabled");
                this.gameModel.current_player = -1;
                if (this.gameModel.countEnabledBuzzers() > 0) {
                    this.timer.start();
                    this.gameModel.state = "buzz_clock";
                } else {
                    this.gameModel.setValue("");
                    this.gameModel.setAnswerState();
                    this.gameModel.state = "show_answer";
                    this.timer.stop();
                }
            break;
            case "clock_expired":
                this.gameModel.state = "answer_limbo";
                break;
            default:
                console.log("unhandled action");
            break;
        }
    }

    answerLimboAction(action){
        switch(action.action){
            case "accept_answer":
                this.gameModel.setScore(this.gameModel.getScore() + this.gameModel.getValue());
                this.gameModel.setValue("");
                this.gameModel.setAnswerState();
                this.gameModel.state = "show_answer";
                this.timer.stop();
                break;
            case "reject_answer":
            case "time_out":
                if (this.gameModel.current_player !== this.gameModel.active_player) {
                    this.gameModel.setScore(this.gameModel.getScore() - (this.gameModel.getValue() / 2));
                    this.gameModel.setValue("");
                }

                this.gameModel.currentPlayer().buzzer = "disabled";
                this.gameModel.current_player = -1;

                if (this.gameModel.countEnabledBuzzers() > 0) {
                    this.timer.start();
                    this.gameModel.state = "buzz_clock";
                } else {
                    this.gameModel.setValue("");
                    this.gameModel.setAnswerState();
                    this.gameModel.state = "show_answer";
                    this.timer.stop();
                }
                break;
            default:
                console.log("unhandled action");
                break;
        }
    }

    buzzClockAction(action){
        switch(action.action){
            case "buzz":
                if (this.buzzIn(action.playerIndex)){
                    console.log("Buzz In " + action.playerIndex);
                    this.timer.stop();
                    this.timer.start();
                    this.gameModel.current_player = action.playerIndex;
                    this.gameModel.state = "answer_clock";
                }
                break;
            case "clock_expired":
                this.timer.stop();
                this.gameModel.setValue("");
                this.gameModel.setAnswerState();
                this.gameModel.state = "show_answer";
                break;
            case "start_timer":
                this.timer.start();
                break;
            default:
                console.log("unhandled action");
                break;
        }
    }

    showAnswerAction(action){
        switch(action.action){
            case "continue":
                this.gameModel.clearBuzzers();
                this.gameModel.current_player = -1;
                this.gameModel.advanceActivePlayer();
                this.gameModel.state = "show_board";
                break;
            default:
                console.log("unhandled action");
            break;
        }
    }

    /**
     * return true if the player if permitted to buzz
     * @param index
     */
    buzzIn(index){
        return this.gameModel.players[index].buzzer === "enabled";
    }

    showQuestion(col, row){
        this.lastValue = this.gameModel.getValue(col, row);
        this.gameModel.current_player = this.gameModel.active_player;
        this.gameModel.setQuestionState(col, row);
    }

    /**
     * Use to connect a listener to the game associated with name.
     * If the name is already in use the previous index will be returned,
     * otherwise a new index will be returned.  The index corresponds to
     * which contestant the name is associated with.
     * @param name
     * @param listener
     * @returns {{role: (string), index: number}}
     */
    connect(name, listener){
        if (!name || name.trim() === ""){
            throw new Error(`Empty name not permitted`);
        }

        this.listeners[name] = listener;
        let role = (name === "host" ? "host" : "contestant");
        let index = this.gameModel.addPlayer(name, role);

        this.notify(name, {
            action : "update_role",
            role   : role,
            index  : index,
            name: name
        });
        this.broadcast();

        if (role === "host") this.notifyDirectory();

        console.log("Player Joined");
        console.log(`role ${role}`);
        console.log(`index ${index}`);
        console.log(`name ${name}`);
        console.log("----------------------");

        return {role: role, index: index, name: name};
    }

    broadcast(msg){
        if (!msg){
            msg = this.gameModel.getFullUpdate();
            msg.action = "update_model";
        }

        for (let hash of Object.keys(this.listeners)){
            this.notify(hash, msg);
        }
    }

    notify(name, msg){
        if (!msg){
            msg = this.gameModel.getFullUpdate();
            msg.action = "update_model";
        }

        this.listeners[name](JSON.stringify(msg));
    }

    loadQuestions(filename){
        console.log("Load Questions " + filename);
        this.gameModel.loadQuestions(this.questDir + "/" + filename);
        this.broadcast();
    }

    disablePlayer(index){
        this.gameModel.disablePlayer(index);
        this.broadcast();
    }

    setActivePlayer(index){
        let i = this.gameModel.setActivePlayer(index);
        this.broadcast();
        return i;
    }
}


export default Game;