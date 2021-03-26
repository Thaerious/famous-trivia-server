import GameModel from "./GameModel.js";
import fs from 'fs';

class Timer {
    constructor(game) {
        this.game = game;
    }

    start(startTime = 10) {
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
        this.game.onAction({action: "clock_expired"});
        this.game.broadcast({action: "stop_timer"});
    }

    clear() {
        if (this.timeout) clearTimeout(this.timeout);
    }
}

class Game {
    constructor(model) {
        this.model = model;
        this.timer = new Timer(this);
        this.state = 0;
    }

    /**
     * @param input {action : string, data : {}}
     */
    onInput(input) {
        this[this.state](input);
    }

    broadcast(msg) {
    }

    notify(name, msg) {
    }

    createPlayerData() {
        let data = {};
        for (let player of this.model.players) {
            data[player.name] = {};
        }
        return data;
    }

    startRound() {
        this.round = this.model.nextRound()
        if (this.round.stateData.style === GameModel.STYLE.MULTIPLE_CHOICE) {
            this.state = 1;
            this.round.setQuestionState();
            this.playersData = this.createPlayerData();
        } else if (this.round.stateData.style === GameModel.STYLE.JEOPARDY) {
            this.state = 4;
            this.round.setBoardState();
        }
    }

    [0](input) {
        switch (input.action) {
            case "join":
                model.addPlayer(input.data.name);
                break;
            case "start":
                this.startRound();
                break;
        }
    }

    [1](input) {
        if (input.action === "continue") {
            this.state = 2;
            this.round.setAnswerState();
            this.timer.start(30);
            this.roundData = {}
        }
    }

    [2](input) {
        switch (input.action) {
            case "expire":
                this.state = 3;
                this.round.setResultState();
                // TODO update scores
                break;
            case "update":
                let name = input.data.name;
                let index = input.data.index;
                this.playerData[name][index].answer = input.data.answer;
                this.playerData[name][index].value = input.data.value;
                break;
        }
    }

    [3](input) {
        switch (input.action) {
            case "continue":
                this.startRound();
                break;
        }
    }

    [4](input) {
        switch (input.action) {
            case "select":
                this.round.setQuestionState(input.data.col, input.data.row);
                this.state = 5;
                break;
        }
    }

    [5](input) {
        switch (input.action) {
            case "select":
                this.timer.start(20);
                this.state = 6;
                break;
        }
    }

    [6](input) {
        switch (input.action) {
            case "reject":
                this.state = 7;
                break;
            case "expire":
                this.state = 8;
                break;
            case "accept":
                // TODO update score

                break;

        }
    }

    [8](input) {
        switch (input.action) {
            case "reject":
                this.state = 7;
                break;
            case "accept":
                // TODO update score
                this.state = 9;
                break;
        }
    }

    [9](input) {
        switch (input.action) {
            case "reject":
                this.state = 7;
                break;
            case "accept":
                this.state = 9;
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

export default Game;