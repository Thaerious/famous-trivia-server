"use strict"

class AbstractView extends EventTarget{
    constructor() {
        super();
        this.DOM = {};

        this.DOM.gameBoard = document.querySelector("game-board");
        this.DOM.questionPane = document.querySelector("#question-pane");
        this.DOM.multipleChoice = document.querySelector("#multiple-choice-present");

        this.DOM.playing_indicator = document.querySelector("#playing");
        this.DOM.timer = document.querySelector("trivia-timer");

        this.DOM.menuIndicator = document.querySelector("#menu-indicator");
        this.DOM.menuArea = document.querySelector("#menu-area");
        this.DOM.menuLogout = document.querySelector("#menu-logout");

        this.DOM.playerContainer = document.querySelector("#player-container-left");
    }

    startTimer(update){
        this.DOM.timer.show(update.time);
    }

    updateTimer(update){
        if (this.lastUpdate.model.players.length <= 0) return;
        this.DOM.timer.show();
        this.DOM.timer.set(update.time);

        if (this.lastUpdate.state === 6 || this.lastUpdate.state === 8) {
            let currentName = this.lastUpdate.model.players[0].name;
            let currentPanel = this.DOM.playerContainer.topPlayer();
            currentPanel.setTimer(update.progress);
        }
    }

    stopTimer(update){

    }

    updateModel(update){
        this.fillPlayers(update);
        this.lastUpdate = update;

        switch (update.state){
            case 0:
                break;
            case 1:
                this.DOM.multipleChoice.hide();
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.question);
                break;
            case 2:
                break;
            case 3:
                this.DOM.questionPane.hide();
                this.DOM.multipleChoice.show();
                this.DOM.multipleChoice.setMode("show");

                for (let i = 0; i < 6; i++) {
                    this.DOM.multipleChoice.setAnswerText(i, update.model.round.answers[i]);
                    this.DOM.multipleChoice.setChecked(i, update.model.round.values[i]);
                }

                break;
            case 4:
                this.DOM.gameBoard.show();
                this.fillJeopardyCategories(update);
                this.fillJeopardyCells(update);
                this.DOM.timer.hide();
                break;
            case 5:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.question);
                this.DOM.timer.hide();
                break;
            case 6:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.question);
                break;
            case 7:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.question);
                break;
            case 8:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.question);
                break;
            case 9:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.answer);
                this.DOM.timer.hide();
                break;
            case 10:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText("GAME OVER");
                this.DOM.timer.hide();
                break;
            default:
                break;
        }
    }

    fillPlayers(update){
        this.DOM.playerContainer.clear();
        if (update.model.players.length <= 0) return;

        for (let player of update.model.players){
            this.DOM.playerContainer.addPlayer(player.name, player.score);

            if (update.model.round && update.model.round.style === 'j') { // TODO remove magic string
                if (update.model.round.current_player === player.name) {
                    this.DOM.playerContainer.getPlayer(player.name).highlight = true;
                    this.DOM.playerContainer.getPlayer(player.name).active = true;
                } else if (update.model.round.spentPlayers.indexOf(player.name) !== -1) {
                    this.DOM.playerContainer.getPlayer(player.name).dim = true;
                }
            }
        }
    }

    fillJeopardyCategories(update){
        for (let i = 0; i < 6; i++){
            let category = update.model.round.categories[i];
            this.DOM.gameBoard.setHeader(i, category["text"], category["font-size"], true)
        }
    }

    fillJeopardyCells(update){
        let round = update.model.round;
        for (let c = 0; c < 6; c++){
            for (let r = 0; r < 5; r++){
                if (round.spent[c][r]){
                    this.DOM.gameBoard.setCell(r, c, "");
                } else {
                    this.DOM.gameBoard.setCell(r, c, round.values[c][r]);
                }
            }
        }
    }
}

module.exports = AbstractView;