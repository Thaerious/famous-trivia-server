import GameModel from "./GameModel.js";
import constants from "./constants.js";

class Timer {
    constructor(game) {
        this.game = game;
    }

    start(startTime = 10) {
        if (startTime === 0) return;
        this.startTime = startTime;

        if (this.timeout) {
            clearTimeout(this.timeout);
            delete this.timeout;
        }

        this.currentTime = startTime;
        this.timeout = setTimeout(() => this.update(), 1000);
        this.game.broadcast({
            action: "start_timer",
            data: {time: startTime}
        });
    }

    stop() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            delete this.timeout;
        }
    }

    update() {
        this.currentTime = this.currentTime - 1;
        if (this.currentTime >= 0) {
            this.timeout = setTimeout(() => this.update(), 1000);
            this.onUpdate(this.currentTime);
        } else {
            this.onExpire();
        }
    }

    onUpdate() {
        this.game.broadcast({
            action: "update_timer",
            data: {
                'start-time' : this.startTime,
                time: this.currentTime,
                progress : Math.trunc(this.currentTime / this.startTime * 100)
            }
        });
    }

    onExpire() {
        delete this.timeout;
        this.game.onInput({action: "expire"});
        // this.game.broadcast({action: "stop_timer"});
    }

    clear() {
        if (this.timeout) clearTimeout(this.timeout);
    }
}

Timer.TIMES = {};
Object.assign(Timer.TIMES, constants.TIMES);

class Game {
    constructor(model) {
        this.timer = new Timer(this);
        this.listeners = {};
        if (model) this.model = model;
        this.state = 0;
    }

    /**
     * Create JSON representation for saving.
     * Use fromJSON to restore the objects state.
     */
    toJSON() {
        let sanitized = Object.assign({}, this);
        delete sanitized.timer;
        delete sanitized.listeners;
        return sanitized;
    }

    static fromJSON(json) {
        if (typeof json === "string") {
            json = JSON.parse(json);
        }

        let game = new Game();
        Object.assign(game, json);
        game.model = GameModel.fromJSON(game.model);

        return game;
    }

    /**
     * @param input {action : string, data : {}}
     */
    onInput(input) {
        console.log(input);
        console.log("-----------------------------------");

        switch(input.action){
            case "next_round":
                this.model.nextRound();
                this.startRound();
            break;
            case "prev_round":
                this.model.prevRound();
                this.startRound();
                break;
            default:
                this[this.state](input);
            break;
        }
    }

    updateState(state){
        this.state = state;
        let update = this.getUpdate();
        this.broadcast(update);
    }

    addListener(name, cb) {
        this.listeners[name] = cb;
    }

    removeListener(name) {
        delete this.listeners[name];
    }

    broadcast(msg) {
        msg = msg ?? this.getUpdate();

        for (let name in this.listeners) {
            this.listeners[name](msg);
        }
    }

    notify(name, msg) {
        this.listeners[name](msg);
    }

    createPlayerData() {
        let data = {};
        for (let player of this.model.players) {
            data[player.name] = new Array(this.model.getRound().getAnswers().length);
            data[player.name].fill(0);
        }
        return data;
    }

    startRound() {
        if (this.model.getRound().stateData.style === GameModel.STYLE.MULTIPLE_CHOICE) {
            this.model.getRound().setQuestionState();
            this.playersData = this.createPlayerData();
            this.updateState(1);
        } else if (this.model.getRound().stateData.style === GameModel.STYLE.JEOPARDY) {
            this.model.getRound().setBoardState();
            this.updateState(4);
        } else if (this.model.getRound().stateData.style === GameModel.STYLE.END_OF_GAME) {
            this.updateState(10);
        }
    }

    isQuestionDone() {
        return this.model.getRound().countPlayers !== 0;
    }

    updateMCScores() {
        let values = this.model.getRound().getValues();
        for (let name in this.playersData) {
            for (let index = 0; index < this.playersData[name].length; index++) {
                if (values[index]) {
                    this.model.getPlayer(name).score += this.playersData[name][index];
                } else {
                    this.model.getPlayer(name).score -= this.playersData[name][index];
                }
            }
        }
    }

    /**
     * Return the sum of all multiple choice bets for the given name.
     * @param name
     */
    sumMCBet(name) {
        let r = 0;
        for (let index = 0; index < this.playersData[name].length; index++) {
            r = r + this.playersData[name][index];
        }
        return r;
    }

    getUpdate() {
        return {
            action: "update_model",
            data: {
                model: this.model.getUpdate(),
                state: this.state
            }
        }
    }

    [0](input) {
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            case "start":
                this.broadcast({action : "start_game"});
                this.model.nextRound();
                this.startRound();
                break;
        }
    }

    [1](input) {
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            case "continue":
                this.timer.start(Timer.TIMES.MULTIPLE_CHOICE);
                this.updateState(2);
                this.model.getRound().setAnswerState();
                break;
        }
    }

    [2](input) {
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            case "expire":
                this.updateState(3);
                this.model.getRound().setRevealState();
                this.updateMCScores();
                break;
            case "update":
                let name = input.data.name;
                let index = parseInt(input.data.index);
                let value = parseInt(input.data.value);

                if (value < 0) value = 0;
                if (this.sumMCBet(name) + value <= this.model.getPlayer(name).score) {
                    this.playersData[name][index] = value;
                }
                break;
        }
    }

    [3](input) {
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            case "continue":
                this.model.nextRound();
                this.startRound();
                break;
        }
    }

    [4](input) { // waiting for player to pick question
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            case "select":
                if (input.player !== "@HOST" && this.model.activePlayer.name !== input.player) return;
                if (!this.model.getRound().isSpent(input.data.col, input.data.row)) {
                    this.model.getRound().setQuestionState(input.data.col, input.data.row);
                    this.updateState(5);
                }
                break;
        }
    }

    [5](input) { // waiting for host to read question and click continue
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            case "continue":
                if (input.player !== "@HOST") return;
                this.model.getRound().setSpent();
                this.updateState(6);
                this.timer.start(Timer.TIMES.ANSWER);
                break;
            case "back":
                this.updateState(4);
                break;
        }
    }

    [6](input) { // timer not expired awaiting answer
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            case "reject":
                this.model.getRound().clearCurrentPlayer();
                this.timer.stop();

                if (this.isQuestionDone()){
                    this.timer.start(Timer.TIMES.BUZZ);
                    this.updateState(7);
                } else {
                    this.model.getRound().setRevealState();
                    this.updateState(9);
                }
                break;
            case "expire":
                break;
            case "accept":
                let currentPlayer = this.model.getRound().getCurrentPlayer();
                this.model.getPlayer(currentPlayer).score += this.model.getRound().getValue();
                this.model.getRound().setRevealState();
                this.timer.stop();
                this.updateState(9);
                break;
        }
    }

    [7](input) { // waiting for buzzer
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            case "buzz":
                console.log("BUZZ: " + input.data.name);
                console.log(this.model.getRound().hasPlayer(input.data.name));
                if (this.model.getRound().hasPlayer(input.data.name)) {
                    this.model.getRound().setCurrentPlayer(input.data.name);
                    this.timer.start(Timer.TIMES.ANSWER);
                    this.updateState(8);
                }
                break;
            case "expire":
                this.broadcast({action: "stop_timer"});
                this.model.getRound().setRevealState();
                this.updateState(9);
                break;
        }
    }

    [8](input) { // awaiting answer
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            case "reject":
                let currentPlayer = this.model.getRound().getCurrentPlayer();
                let player = this.model.getPlayer(currentPlayer);
                player.score -= (this.model.getRound().getValue() / 2);
                this.timer.stop();
                this.model.getRound().clearCurrentPlayer();

                if (this.isQuestionDone()){
                    this.timer.start(Timer.TIMES.BUZZ);
                    this.updateState(7);
                } else {
                    this.model.getRound().setRevealState();
                    this.updateState(9);
                }
                break;
            case "expire":
                break;
            case "accept":
                this.model.getPlayer(this.model.getRound().getCurrent()).score += this.model.getRound().getValue();
                this.model.getRound().setRevealState();
                this.timer.stop();
                this.updateState(9);
                break;
        }
    }

    [9](input) { // awaiting answer
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            case "continue":
                if (this.model.getRound().hasUnspent()) {
                    this.model.nextActivePlayer();
                    this.model.getRound().setBoardState();
                    this.model.getRound().resetSpentAndCurrentPlayers();
                    this.updateState(4);
                } else {
                    this.model.nextRound();
                    this.startRound();
                }
                break;
        }
    }

    [10](input) { // game over
        switch (input.action) {
            /* no accepted inputs */
        }
    }
}


export {
    Game, Timer
};