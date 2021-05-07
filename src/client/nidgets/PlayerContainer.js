"use strict";

const NidgetElement = require("@Thaerious/nidget").NidgetElement;
import PlayerPanel from "./PlayerPanel.js";

class PlayerContainer extends NidgetElement {
    constructor(templateId = "player-container-template") {
        super(templateId);
        this.hiddenExpanded = true;
    }

    async ready(){
        await super.ready();
        this.querySelector("#expand-button").addEventListener("click", event=>{
            if (this.hiddenExpanded){
                this.querySelector(".outer").classList.remove("hide-extra");
                this.querySelector("#expand-button .text").innerHTML = "&#9664;";
                this.hiddenExpanded = false;
            } else {
                this.querySelector(".outer").classList.add("hide-extra");
                this.querySelector("#expand-button .text").innerHTML = "&#9654;";
                this.hiddenExpanded = true;
            }
        });
    }

    addPlayer(name, score = 0){
        let outer = this.querySelector(".outer");
        let expandButton = this.querySelector("#expand-button");

        let playerPanel = document.createElement("player-panel");
        let currentInner = this.querySelector(".inner:last-child");
        expandButton.hide();

        if (!currentInner || currentInner.childElementCount === 6){
            currentInner = document.createElement("nidget-element");
            currentInner.classList.add("inner");
            currentInner.classList.add("extra");
            currentInner.setAttribute("style", `--index: ${outer.childElementCount - 1}`);
            outer.append(currentInner);
        }

        if (outer.childElementCount > 1){
            expandButton.show();
        }

        playerPanel.setAttribute("style", `--index: ${currentInner.childElementCount}`);
        currentInner.append(playerPanel);
        playerPanel.name = name;
        playerPanel.score = score;
        return playerPanel;
    }

    topPlayer(){
        let currentInner = this.querySelector(".inner.first");
        return currentInner.querySelector("player-panel");
    }

    getPlayer(name){
        for (let panel of this.querySelectorAll("player-panel")){
            if (panel.name === name) return panel;
        }
        return null;
    }

    moveToTop(name){
        let currentInner = this.querySelector(".inner.first");
        let player = this.getPlayer(name);
        player.detach();

        // let otherPlayers = this.querySelectorAll("player-panel");
        // this.clear();

        // this.addPlayer(player.name, player.score);
        // for (let p of otherPlayers) this.addPlayer(p.name, p.score);

        return player;
    }

    clear(){
        for (let inner of this.querySelectorAll(".extra")){
            inner.detach();
        }

        this.querySelector(".inner").textContent = "";
    }
}

window.customElements.define('player-container', PlayerContainer);
module.exports = PlayerContainer;