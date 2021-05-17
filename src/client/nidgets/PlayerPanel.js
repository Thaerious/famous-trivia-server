"use strict";

const NidgetElement = require("@Thaerious/nidget").NidgetElement;
import "./PlayerPanel.js";

class PlayerPanel extends NidgetElement {
    constructor(templateId = "player-panel-template") {
        super(templateId);
    }

    async ready(){
        await super.ready();
    }

    set name(value){
        this.querySelector("#name").innerHTML = value;
    }

    set score(value){
        this.querySelector("#score").innerHTML = value;
    }

    get name(){
        return this.querySelector("#name").innerHTML;
    }

    get score(){
        return this.querySelector("#score").innerHTML;
    }

    set dim(value){
        if (value) this.querySelector(".outer").classList.add("dim");
        else this.querySelector(".outer").classList.remove("dim");
    }

    set highlight(value){
        if (value) this.querySelector(".outer").classList.add("highlight");
        else this.querySelector(".outer").classList.remove("highlight");
    }

    set active(value){
        if (value) this.querySelector("#buzz-light").classList.add("active");
        else this.querySelector("#buzz-light").classList.remove("active");
    }

    hideClock(){
        this.DOM.clock.classList.add("hidden");
    }

    buzz(){
        this.querySelector("#buzz-light").classList.add("sweep-right");
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