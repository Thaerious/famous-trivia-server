"use strict"

class AbstractView extends EventTarget{
    constructor(){
        super();
        this.DOM = {};

        this.DOM.gameBoard = document.querySelector("game-board");
        this.DOM.questionPane = document.querySelector("#question-pane");
        // this.DOM.questionText = document.querySelector("#text-contents");

        this.DOM.playing_indicator = document.querySelector("#playing");
        this.DOM.clock = document.querySelector("#clock");

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

    }

    updateTimer(update){
        if (this.lastUpdate.model.players.length <= 0) return;
        let currentName = this.lastUpdate.model.players[0].name;
        let currentPanel = this.DOM.playerContainer.getPlayer(currentName);
        currentPanel.setTimer(update.progress);
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
                break;
            case 5:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.question);
                break;
            case 6:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.question);
                break;
            case 7:
                this.DOM.gameBoard.show();
                this.fillJeopardyCategories(update);
                this.fillJeopardyCells(update);
                break;
            case 8:
                this.DOM.gameBoard.show();
                this.fillJeopardyCategories(update);
                this.fillJeopardyCells(update);
                break;
            case 9:
                this.DOM.gameBoard.hide();
                this.DOM.questionPane.show();
                this.DOM.questionPane.setText(update.model.round.answer);
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
                if (round.spent[c][r]) continue;
                this.DOM.gameBoard.setCell(r, c, round.values[c][r]);
            }
        }
    }
}

module.exports = AbstractView;