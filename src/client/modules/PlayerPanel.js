"use strict";

const NidgetElement = require("@Thaerious/nidget").NidgetElement;
import "./PlayerPanel.js";

class PlayerPanel extends NidgetElement {
    constructor() {
        super();
    }

    async ready(){
        await super.ready();
    }

    set name(value){
        this.querySelector("#name").text = value;
    }

    set score(value){
        this.querySelector("#score").text = value;
    }

    get name(){
        return this.querySelector("#name").text;
    }

    get score(){
        return this.querySelector("#score").text;
    }

    buzz(){
        this.querySelector("#buzz-light").classList.add("sweep-right");
        this.querySelector("#name").classList.add("active");
        this.querySelector("#score").classList.add("active");
    }

    clear(){
        this.querySelector("#buzz-light").classList.remove("sweep-right");
        this.querySelector("#name").classList.remove("active");
        this.querySelector("#score").classList.remove("active");
        this.querySelectorAll(".clock-tick").forEach(e => e.classList.remove("spent"));
    }

    setTimer(percent){
        if (percent <= 80) this.querySelector(".clock-tick[data-index='4']").classList.add("spent");
        if (percent <= 60) this.querySelector(".clock-tick[data-index='3']").classList.add("spent");
        if (percent <= 40) this.querySelector(".clock-tick[data-index='2']").classList.add("spent");
        if (percent <= 20) this.querySelector(".clock-tick[data-index='1']").classList.add("spent");
        if (percent <= 0)  this.querySelector(".clock-tick[data-index='0']").classList.add("spent");
    }
}

window.customElements.define('player-panel', PlayerPanel);
module.exports = PlayerPanel;