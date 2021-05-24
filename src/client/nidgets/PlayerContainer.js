"use strict";

const NidgetElement = require("@Thaerious/nidget").NidgetElement;
import PlayerPanel from "./PlayerPanel.js";

class PlayerContainer extends NidgetElement {
    constructor(templateId = "player-container-template") {
        super(templateId);
        this.extraPlayersHidden = true;
    }

    async ready(){
        await super.ready();

        document.body.addEventListener("click", event => {
                if (this.extraPlayersHidden) return;
                this.querySelector(".outer").classList.add("hide-extra");
                this.querySelector("#expand-button .text").innerHTML = "&#9654;";
                this.extraPlayersHidden = true;
            }
        );

        this.querySelector("#expand-button").addEventListener("click", event => {
            if (this.extraPlayersHidden){
                this.querySelector(".outer").classList.remove("hide-extra");
                this.querySelector("#expand-button .text").innerHTML = "&#9664;";
                this.extraPlayersHidden = false;
                event.stopPropagation();
            }
        });
    }

    addPlayer(name, score = 0){
        let outer = this.querySelector(".outer");
        let expandButton = this.querySelector("#expand-button");

        let playerPanel = document.createElement("player-panel");
        playerPanel.name = name;
        playerPanel.score = score;

        this.addPlayerPanel(playerPanel);
        window.lastPanel = playerPanel;

        if (this.size > 6) expandButton.show();
        return playerPanel;
    }

    addInner(){
        const outer = this.querySelector(".outer");
        const nextIndex = this.querySelectorAll(".inner").length;

        const element = document.createElement("nidget-element");
        element.classList.add("inner");
        element.classList.add("extra");
        element.setAttribute("style", `--index: ${nextIndex}`);
        element.setAttribute("data-index", nextIndex);
        outer.append(element);
        return element;
    }

    getInner(index){
        while (this.querySelectorAll(".inner").length <= index){
            this.addInner();
        }
        let selector = `.inner[data-index='${index}']`
        const element = this.querySelector(`.inner[data-index='${index}']`);
        return element;
    }

    addPlayerPanel(element){
        const innerIndex = Math.trunc((this.size) / 6);
        const innerElement = this.getInner(innerIndex);
        element.setAttribute("style", `--index: ${this.size % 6}`);
        innerElement.append(element);
    }

    get size(){
        return this.querySelectorAll("player-panel").length;
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
        const components = [];
        if (!this.getPlayer(name)) return;

        components.push(this.getPlayer(name));
        this.getPlayer(name).detach();

        for (const element of this.querySelectorAll("player-panel")){
            components.push(element);
            element.detach();
        }

        for (let component of components){
            this.addPlayerPanel(component);
        }

        return components[0];
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