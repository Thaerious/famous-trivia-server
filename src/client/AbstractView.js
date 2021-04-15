"use strict"

class AbstractView{
    constructor(){
        this.DOM = {};

        this.DOM.gameBoard = document.querySelector("game-board");
        this.DOM.questionPage = document.querySelector("#text-question");
        this.DOM.questionText = document.querySelector("#text-contents");
        this.DOM.buttons = document.querySelector("#buttons");

        this.DOM.buzzer_button = document.querySelector("#buzz");
        this.DOM.accept_button = document.querySelector("#accept_answer");
        this.DOM.reject_button = document.querySelector("#reject_answer");
        this.DOM.start_timer_button = document.querySelector("#start_timer");
        this.DOM.time_out_button = document.querySelector("#time_out");
        this.DOM.continue_button = document.querySelector("#continue");
        this.DOM.back_button = document.querySelector("#back");

        this.DOM.playing_indicator = document.querySelector("#playing");
        this.DOM.clock = document.querySelector("#clock");

        this.DOM.menuIndicator = document.querySelector("#menu-indicator");
        this.DOM.menuArea = document.querySelector("#menu-area");
        this.DOM.menuLogout = document.querySelector("#menu-logout");

        this.assertDOM();
        // this.setupMenu();
    }

    assertDOM(){
        for (let key in this.DOM){
            console.assert(this.DOM[key] !== undefined, key);
        }
    }

    updateModel(update){
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
                this.DOM.gameBoard.show();
                this.fillJeopardyCategories(update);
                this.fillJeopardyCells(update);
                break;
            case 6:
                this.DOM.gameBoard.show();
                this.fillJeopardyCategories(update);
                this.fillJeopardyCells(update);
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
                this.DOM.gameBoard.show();
                this.fillJeopardyCategories(update);
                this.fillJeopardyCells(update);
                break;
            default:
                break;
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
                if (round.spent[c][r]) continue;
                this.DOM.gameBoard.setCell(r, c, round.values[c][r]);
            }
        }
    }

}

module.exports = AbstractView;