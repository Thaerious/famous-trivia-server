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

    setupMenu(){
        this.menuIndicator.addEventListener("click", (event)=>{
            this.menuArea.hidden = !this.menuArea.hidden;
        });
        this.menuLogout.addEventListener("click", (event)=>{
            this.logout();
        });
    }

    updatePlayers(update){
        if (!update.players) return;
        for (let i = 0; i < 10; i++) {
            this.getContestant(i).lit = "";
            if (update.players[i]){
                let player = update.players[i];
                this.getContestant(i).show();
                if (player.name) this.getContestant(i).name = player.name;
                if (player.score) this.getContestant(i).score = player.score;
                if (player.buzzer === "disabled") this.getContestant(i).lit = "red";
                this.getContestant(i).disabled = !player.enabled;
            } else {
                this.getContestant(i).hide();
            }
        }

        if (update.current_player >= 0) this.getContestant(update.current_player).lit = "yellow";
    }

    updateQuestions(update){
        if (!update.questionSet) return;
        for(let i in update.questionSet){
            this.gameBoard.setHeader(i, update.questionSet[i].category);
            for(let j in update.questionSet[i].questions){
                this.gameBoard.setCell(j, i, update.questionSet[i].questions[j].value);
            }
        }
    }

    highlightContestant(index = -1){
        for (let element of document.querySelectorAll(`[data-highlight="true"]`)){
            element.highlight = false;
        }

        if (index < 0 || index > 9) return;
        document.querySelector(`#contestant-${index}`).highlight = true;
    }

    /**
     * look for non-model updates, such as showing a question or answer
     **/
    showQuestion(update){
        if (update.state_data.type === "text"){
            this.questionText.innerHTML = update.state_data.text;
            this.questionPage.show();
            this.buttons.show();
            this.gameBoard.hide();
        }
    }

    /**
     * look for non-model updates, such as showing a question or answer
     **/
    showAnswer(update){
        this.questionText.innerHTML = update.state_data.text;
        this.questionPage.show();
        this.gameBoard.hide();
    }

    getContestant(index){
        if (index < 0 || index > 11) return;
        return document.querySelector(`#contestant-${index}`);
    }

    logout(){
        let msg = {
            action : "logout"
        };
        this.socket.send(JSON.stringify(msg));
        document.location = "pages/join.html";
    }
}

module.exports = AbstractView;