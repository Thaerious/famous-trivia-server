"use strict"

class AbstractView extends EventTarget{
    constructor(){
        super();
        this.DOM = {};

        this.DOM.gameBoard = document.querySelector("game-board");
        this.DOM.questionPane = document.querySelector("#question-pane");
        // this.DOM.questionText = document.querySelector("#text-contents");

        this.DOM.playing_indicator = document.querySelector("#playing");
        this.DOM.timer = document.querySelector("trivia-timer");

        this.DOM.menuIndicator = document.querySelector("#menu-indicator");
        this.DOM.menuArea = document.querySelector("#menu-area");
        this.DOM.menuLogout = document.querySelector("#menu-logout");

        this.DOM.playerContainer = document.querySelector("#player-container-left");

        this.assertDOM();
        // this.setupMenu();
    }

    assertDOM(){
        for (let key in this.DOM){
            console.assert(this.DOM[key] !== undefined, key);
        }
    }

    startTimer(update){
        this.DOM.timer.show(update.time);
    }

    updateTimer(update){
        if (this.lastUpdate.model.players.length <= 0) return;
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
                break;
            case 2:
                break;
            case 3:
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
                this.DOM.timer.show();
                break;
            case 7:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.question);
                this.updateBuzzPlayers(update);
                break;
            case 8:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.question);
                this.DOM.timer.show();
                this.updateBuzzPlayers(update);
                break;
            case 9:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.answer);
                this.DOM.timer.hide();
                this.updateBuzzPlayers(update);
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
        }

        this.DOM.playerContainer.getPlayer(update.model.players[0].name).highlight = true;
        this.DOM.playerContainer.getPlayer(update.model.players[0].name).active = true;
    }

    /**
     * Update the player display for the jeopardy buzz availability.
     * @param update
     */
    updateBuzzPlayers(update){
        if (update.model.players.length <= 0) return;

        if (update.model.round.current_player) {
            this.DOM.playerContainer.moveToTop(update.model.round.current_player);
        }

        for (let player of update.model.players){
            if (update.model.round.current_player === player.name) {
                this.DOM.playerContainer.getPlayer(update.model.round.current_player).dim = false;
                this.DOM.playerContainer.getPlayer(update.model.round.current_player).highlight = true;
                this.DOM.playerContainer.getPlayer(update.model.round.current_player).active = true;
            }
            else {
                this.DOM.playerContainer.getPlayer(player.name).highlight = false;
                this.DOM.playerContainer.getPlayer(player.name).active = false;

                if (update.model.round.players.indexOf(player.name) === -1) {
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