import GameModel from "./GameModel.js";
import constants from "../../config.js";
import crypto from "crypto";

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
                'start-time': this.startTime,
                time: this.currentTime,
                progress: Math.trunc(this.currentTime / this.startTime * 100)
            }
        });
    }

    onExpire() {
        delete this.timeout;
        this.game.onInput({action: "expire"});
    }
}

/**
 * Gets the initial timer values from constants.times
 */
class Game {
    /**
     *
     * @param model GameDescriptionModel
     */
    constructor(model) {
        this.timer = new Timer(this);
        this.listeners = {};
        this.state = 0;
        if (model) {
            this.model = model;
            this.updateState(0);
        }
        
        this.times = {};
        Object.assign(this.times, constants.TIMES);
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

    /**
     * Create a new Game object from json string or object.
     * @param json A string or object.
     * @returns {Game}
     */
    static fromJSON(json) {
        if (typeof json === "string") {
            json = JSON.parse(json);
        }

        let game = new Game();
        Object.assign(game, json);
        game.model = GameModel.fromJSON(game.model);
        game.lastUpdate = game.getUpdate();

        return game;
    }

    /**
     * @param input {action : string, data : {}}
     */
    onInput(input) {
        // console.log(`(${this.state}) - ${JSON.stringify(input)}`);
        // console.log("-----------------------------------");

        switch (input.action) {
            case "next_round":
                if (input.player !== constants.names.HOST) return;
                this.model.nextRound();
                this.startRound();
                break;
            case "prev_round":
                if (input.player !== constants.names.HOST) return;
                this.model.prevRound();
                this.startRound();
                break;
            case "join":
                this.model.addPlayer(input.data.name);
                this.broadcast();
                break;
            default:
                this[this.state](input);
                break;
        }
    }

    updateState(state, extraData = {}) {
        if (state) this.state = state;

        const update = {
            action: "update_model",
            'id-hash': crypto.randomBytes(8).toString('hex'),
            'time-stamp': new Date(),
            data: {
                model: this.model.getUpdate(),
                state: this.state,
                ...extraData
            }
        }

        this.lastUpdate = update;
        this.broadcast(update);
    }

    /**
     * Get the previous update, with new model data.
     * @returns {*}
     */
    getUpdate() {
        const update = {...this.lastUpdate};
        update.data.model = this.model.getUpdate();
        return this.lastUpdate;
    }

    addListener(name, cb) {
        this.listeners[name] = cb;
    }

    removeListener(name) {
        delete this.listeners[name];
    }

    broadcast(msg) {
        msg = msg ?? this.lastUpdate;

        for (let name in this.listeners) {
            this.listeners[name](msg);
        }
    }

    notify(name, msg) {
        if (this.listeners[name]) {
            this.listeners[name](msg);
        }
    }

    createMCBetsData() {
        let data = {};
        for (let player of this.model.players) {
            data[player.name] = {
                bonus: 0,
                answers: []
            };

            for (let i = 0; i < 6; i++) {
                data[player.name].answers[i] = {
                    checked: false,
                    amount: 0
                }
            }
            ;
        }
        return data;
    }

    startRound() {
        if (this.model.getRound().stateData.style === GameModel.STYLE.MULTIPLE_CHOICE) {
            this.model.getRound().setQuestionState();
            this.mcBetsData = this.createMCBetsData();
            this.updateState(1);
        } else if (this.model.getRound().stateData.style === GameModel.STYLE.JEOPARDY) {
            this.model.getRound().setBoardState();
            this.updateState(4);
        } else if (this.model.getRound().stateData.style === GameModel.STYLE.END_OF_GAME) {
            this.updateState(10);
        }
    }

    /**
     * Calculate the player scores based upon the MC answers
     * Blank values are considered to be false.
     * >= 0 are considered to be true.
     */
    updateMCScores() {
        let values = this.model.getRound().getValues();

        for (let name in this.mcBetsData) {
            // the sum of bets must be <= the players available score
            if (this.sumMCBet(name) > this.model.getPlayer(name).score) {
                continue;
            }

            let bonusFlag = true;

            for (let i = 0; i < 6; i++) {
                let answer = this.mcBetsData[name].answers[i];
                let bet = parseInt(answer.amount);

                if (answer.checked === true && values[i] === true) {
                    this.model.getPlayer(name).score += bet;
                    answer.result = "correct";
                } else if (answer.checked === true && values[i] === false) {
                    this.model.getPlayer(name).score -= bet;
                    bonusFlag = false;
                    answer.result = "incorrect";
                    answer.amount = -1 * answer.amount;
                } else if (answer.checked === false && values[i] === true) {
                    bonusFlag = false;
                    answer.result = "incorrect";
                } else if (answer.checked === false && values[i] === false) {
                    answer.result = "correct";
                } else {
                    throw new Error("index " + i + " failed");
                }
            }

            if (bonusFlag) {
                let bonus = parseInt(this.model.getUpdate().round.bonus);
                this.model.getPlayer(name).score += bonus;
                this.mcBetsData[name].bonus = bonus;
            }
        }
    }

    /**
     * Return the sum of all multiple choice bets for the given name.
     * @param name
     */
    sumMCBet(name) {
        let r = 0;
        for (let index = 0; index < this.mcBetsData[name].answers.length; index++) {
            r = r + parseInt(this.mcBetsData[name].answers[index].amount);
        }
        return r;
    }

    [0](input) {
        switch (input.action) {
            case "start":
                this.broadcast({action: "start_game"});
                this.model.setRound(0);
                this.startRound();
                break;
        }
    }

    [1](input) {
        switch (input.action) {
            case "continue":
                this.model.getRound().setAnswerState();
                this.updateState(2);
                this.timer.start(this.times.MULTIPLE_CHOICE);
                break;
        }
    }

    [2](input) {
        switch (input.action) {
            case "continue":
            case "expire":
                this.model.getRound().setRevealState();
                this.updateMCScores();
                this.updateState(3, {bets: this.mcBetsData});
                break;
            case "update":
                let name = input.player;
                let index = parseInt(input.data.index);

                if (typeof input.data.checked === "string") input.data.checked = (input.data.checked === "true");
                if (typeof input.data.value === "string") input.data.value = parseInt(input.data.value);

                this.mcBetsData[name].answers[index] = {
                    checked: input.data.checked,
                    amount: input.data.value
                }
                break;
        }
    }

    [3](input) {
        switch (input.action) {
            case "continue":
                this.model.nextRound();
                this.startRound();
                break;
        }
    }

    [4](input) { // waiting for player to pick question
        switch (input.action) {
            case "select":
                let allow = false;
                if (Game.settings.ALLOW_PLAYER_PICK && (this.model.activePlayer.name === input.player)) allow = true;
                if (input.player === constants.names.HOST) allow = true;
                if (!allow) return;

                if (!this.model.getRound().isSpent(input.data.col, input.data.row)) {
                    this.model.getRound().setQuestionState(input.data.col, input.data.row);
                    this.updateState(5);
                    this.notify(constants.names.HOST, {
                        action: "provide_answer",
                        'id-hash': crypto.randomBytes(8).toString('hex'),
                        'time-stamp': new Date(),
                        data: {
                            answer: this.model.getRound().getAnswer()
                        }
                    });
                    break;
                }
        }
    }

    [5](input) { // waiting for host to read question and click continue
        switch (input.action) {
            case "continue":
                if (input.player !== constants.names.HOST) return;
                this.model.getRound().setSpent();
                this.updateState(6);
                this.timer.start(this.times.ANSWER);
                break;
            case "back":
                this.updateState(4);
                break;
        }
    }

    [6](input) { // timer not expired awaiting answer
        switch (input.action) {
            case "reject":
                this.model.getRound().setPlayerSpent();
                this.model.getRound().clearCurrentPlayer();
                this.timer.stop();
                if (this.model.getRound().countUnspentPlayers() > 0) {
                    this.timer.start(this.times.BUZZ);
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
                if (!currentPlayer) return;
                this.model.getPlayer(currentPlayer).score += this.model.getRound().getValue();
                this.model.getRound().setRevealState();
                this.timer.stop();
                this.updateState(9);
                break;
        }
    }

    [7](input) { // waiting for buzzer
        switch (input.action) {
            case "buzz":
                if (this.model.getRound().hasPlayer(input.player)) {
                    this.model.getRound().setCurrentPlayer(input.player);
                    this.timer.start(this.times.ANSWER);
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

    [8](input) { // awaiting answer to jeopardy question
        switch (input.action) {
            case "reject":
                let currentPlayer = this.model.getRound().getCurrentPlayer();
                let player = this.model.getPlayer(currentPlayer);
                player.score -= (this.model.getRound().getValue() / 2);
                this.timer.stop();

                this.model.getRound().setPlayerSpent();
                this.model.getRound().clearCurrentPlayer();

                if (this.model.getRound().countUnspentPlayers() > 0) {
                    this.timer.start(this.times.BUZZ);
                    this.updateState(7);
                } else {
                    this.model.getRound().setRevealState();
                    this.updateState(9);
                }
                break;
            case "expire":
                break;
            case "accept":
                this.model.getPlayer(this.model.getRound().getCurrentPlayer()).score += this.model.getRound().getValue();
                this.model.getRound().setRevealState();
                this.timer.stop();
                this.updateState(9);
                break;
        }
    }

    [9](input) { // awaiting answer
        switch (input.action) {
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

Game.settings = {
    ALLOW_PLAYER_PICK: false
}

export {
    Game, Timer
};