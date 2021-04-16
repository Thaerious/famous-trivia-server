"use strict";

const NidgetElement = require("@Thaerious/nidget").NidgetElement;
import PlayerPanel from "./PlayerPanel.js";

class PlayerContainer extends NidgetElement {
    constructor() {
        super();
    }

    async ready(){
        await super.ready();
    }

    addPlayer(name, score = 0){
        let element = document.createElement("player-panel");
        element.name = name;
        element.score = score;
        this.append(element);
    }
}

window.customElements.define('player-container', PlayerContainer);
module.exports = PlayerContainer;