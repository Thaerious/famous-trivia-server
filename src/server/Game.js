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
        this.game.broadcast({action: "start_timer", value: startTime});
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
        this.game.broadcast({action: "update_timer", value: this.currentTime});
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
    ANSWER : 30,
    BUZZ : 10,
    MULTIPLE_CHOICE : 60
}

class Game {
    constructor(model) {
        this.model = model;
        this.timer = new Timer(this);
        this.state = 0;
        this.listeners = {};
    }

    /**
     * @param input {action : string, data : {}}
     */
    onInput(input) {
        this[this.state](input);
    }

    addListener(name, cb){
        this.listeners[name] = cb;
    }

    removeListener(name){
        delete this.listeners[name];
    }

    broadcast(msg) {
        for (let name in this.listeners) this.listeners[name](msg);
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
        this.round = this.model.nextRound()
        if (this.round.stateData.style === GameModel.STYLE.MULTIPLE_CHOICE) {
            this.round.setQuestionState();
            this.playersData = this.createPlayerData();
            this.state = 1;
        } else if (this.round.stateData.style === GameModel.STYLE.JEOPARDY) {
            this.round.setBoardState();
            this.state = 4;
        }
    }

    isQuestionDone() {
        if (this.round.hasUnspent()) {
            this.timer.start(Timer.times.BUZZ);
            this.state = 7;
        } else {
            this.round.setRevealState();
            this.state = 9;
        }
    }

    updateMCScores(){
        let values = this.round.getValues();
        for (let name in this.playersData){
            for (let index = 0; index < this.playersData[name].length; index++){
                if (values[index]){
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
    sumMCBet(name){
        let r = 0;
        for (let index = 0; index < this.playersData[name].length; index++) {
            r = r + this.playersData[name][index];
        }
        return r;
    }

    getUpdate(){
        let update = this.model.getUpdate();
        update.state = this.state;
        update.action = "update_model";
        return update;
    }

    [0](input) {
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                break;
            case "start":
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
                this.round.setAnswerState();
                this.timer.start(Timer.TIMES.MULTIPLE_CHOICE);
                this.roundData = {}
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
                this.round.setRevealState();
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
                this.round.setQuestionState(input.data.col, input.data.row);
                this.state = 5;
                break;
        }
    }

    [5](input) { // waiting for host to read question and click continue
        switch (input.action) {
            case "join":
                this.model.addPlayer(input.data.name);
                break;
            case "select":
                this.timer.start(Timer.times.ANSWER);
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
                this.isQuestionDone();
                break;
            case "expire":
                break;
            case "accept":
                this.round.getCurrent().score += this.round.getValue();
                this.round.setRevealState();
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
                this.timer.start(Timer.times.ANSWER);
                this.state = 8;
                break;
            case "expire":
                this.round.setRevealState();
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
                this.round.getCurrent().score -= (this.round.getValue() / 2);
                this.isQuestionDone();
                break;
            case "expire":
                break;
            case "accept":
                this.round.getCurrent().score += this.round.getValue();
                this.round.setRevealState();
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
                if (this.round.hasUnspent()){
                    this.model.nextActivePlayer();
                    this.setBoardState();
                    this.state = 4;
                } else {
                    this.startRound();
                }
                break;
        }
    }
}

class StartState {
    constructor(game) {
        this.game = game;
    }

    onInput(input) {

    }
}

export {Game, Timer};