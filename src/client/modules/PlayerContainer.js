"use strict";

import e from "express";

/** View-Controller for the HTML game board element
    This is the classical "Jeopardy" type board
    This is model agnostic, see EditorPane.js for model methods
    generates the following events:
        cell-select (row, col): when a user clicks a cell
        header-update (value, col, fontsize) : when the header text changes (and blurs)
 **/

const NidgetElement = require("@Thaerious/nidget").NidgetElement;
import PlayerPanel from "./PlayerPanel.js";

class CellSelectEvent extends CustomEvent{
    constructor(row, col) {
        super('cell-select',
              {detail : {row : row, col : col }}
        );
    }
}

class HeaderUpdateEvent extends  CustomEvent{
    constructor(col, value, fontSize) {
        super('header-update',
            {detail : {value : value, col : col, fontSize : fontSize}}
        );
    }
}

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