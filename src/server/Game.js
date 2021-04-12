import GameModel from "./GameModel.js";
import fs from 'fs';

class Timer {
    constructor(game) {
        this.game = game;
    }

    start(startTime = 10) {
        if (startTime === 0) return;
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
        if (this.currentTime > 0) {
            this.timeout = setTimeout(() => this.update(), 1000);
            this.onUpdate(this.currentTime);
        } else {
            this.onExpire();
        }
    }

    onUpdate() {
        this.game.broadcast({
            action: "update_timer",
            data: {time: this.currentTime}
        });
    }

    onExpire() {
        delete this.timeout;
        this.game.onInput({action: "expire"});
        this.game.broadcast({action: "stop_timer"});
    }

    clear() {
        if (this.timeout) clearTimeout(this.timeout);
    }
}

Timer.TIMES = {
    ANSWER: 30,
    BUZZ: 10,
    MULTIPLE_CHOICE: 60
}

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
        this[this.state](input);
        let update = this.getUpdate();
        update.data.input = input.action;
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
        this.model.nextRound();
        if (this.model.getRound().stateData.style === GameModel.STYLE.MULTIPLE_CHOICE) {
            this.model.getRound().setQuestionState();
            this.playersData = this.createPlayerData();
            this.state = 1;
        } else if (this.model.getRound().stateData.style === GameModel.STYLE.JEOPARDY) {
            this.model.getRound().setBoardState();
            this.state = 4;
        }
    }

    isQuestionDone() {
        if (this.model.getRound().hasUnspent()) {
            this.timer.start(Timer.TIMES.BUZZ);
            this.state = 7;
        } else {
            this.model.getRound().setRevealState();
            this.state = 9;
        }
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
                break;
            case "start":
                this.broadcast({action : "start_game"});
                this.startRound();
                break;
        }
    }

    [1](input) {
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                break;
            case "continue":
                this.state = 2;
                this.model.getRound().setAnswerState();
                this.timer.start(Timer.TIMES.MULTIPLE_CHOICE);
                this.roundData = {};
                break;
        }
    }

    [2](input) {
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                break;
            case "expire":
                this.state = 3;
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
                break;
            case "continue":
                this.startRound();
                break;
        }
    }

    [4](input) { // waiting for player to pick question
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                break;
            case "select":
                if (!this.model.getRound().isSpent(input.data.col, input.data.row)) {
                    this.model.getRound().setQuestionState(input.data.col, input.data.row);
                    this.state = 5;
                }
                break;
        }
    }

    [5](input) { // waiting for host to read question and click continue
        switch (input.action) {
            case "continue":
                this.timer.start(Timer.TIMES.ANSWER);
                this.state = 6;
                break;
        }
    }

    [6](input) { // timer not expired awaiting answer
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                break;
            case "reject":
                this.model.getRound().clearCurrent();
                this.isQuestionDone();
                break;
            case "expire":
                break;
            case "accept":
                this.model.getPlayer(this.model.getRound().getCurrent()).score += this.model.getRound().getValue();
                this.model.getRound().setRevealState();
                this.state = 9;
                break;

        }
    }

    [7](input) { // waiting for buzzer
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                break;
            case "buzz":
                if (this.model.getRound().hasPlayer(input.data.name)) {
                    this.model.getRound().setCurrent(input.data.name);
                    this.timer.start(Timer.TIMES.ANSWER);
                    this.state = 8;
                }
                break;
            case "expire":
                this.model.getRound().setRevealState();
                this.state = 9;
                break;
        }
    }

    [8](input) { // awaiting answer
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                break;
            case "reject":
                let player = this.model.getPlayer(this.model.getRound().getCurrent());
                player.score -= (this.model.getRound().getValue() / 2);
                this.isQuestionDone();
                break;
            case "expire":
                break;
            case "accept":
                this.model.getRound().getCurrent().score += this.model.getRound().getValue();
                this.model.getRound().setRevealState();
                this.state = 9;
                break;
        }
    }

    [9](input) { // awaiting answer
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                break;
            case "continue":
                if (this.model.getRound().hasUnspent()) {
                    this.model.nextActivePlayer();
                    this.model.getRound().setBoardState();
                    this.model.getRound().resetCurrentPlayers(this.model.players);
                    this.state = 4;
                } else {
                    this.startRound();
                }
                break;
        }
    }
}


export {
    Game
    ,
    Timer
};