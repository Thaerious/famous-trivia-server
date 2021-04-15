"use strict";

/** View-Controller for the HTML game board element
    This is the classical "Jeopardy" type board
    This is model agnostic, see EditorPane.js for model methods
    generates the following events:
        cell-select (row, col): when a user clicks a cell
        header-update (value, col, fontsize) : when the header text changes (and blurs)
 **/

const NidgetElement = require("@Thaerious/nidget").NidgetElement;

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

class GameBoard extends NidgetElement {
    constructor() {
        super();
    }

    async ready(){
        await super.ready();
        for (let col = 0; col < 6; col++) {
            this.getHeader(col).addEventListener("input", (event)=>event.target.fitText.notify(1, 1));

            this.getHeader(col).addEventListener("blur", (event)=>{
                let fontSize = event.target.style["font-size"];
                this.dispatchEvent(new HeaderUpdateEvent(col, event.target.text, fontSize));
            });

            for (let row = 0; row < 5; row++) {
                this.getCell(row, col).addEventListener("click", () => {
                    this.dispatchEvent(new CellSelectEvent(row, col));
                });
            }
        }
    }

    /**
     * Set the value of a category
     * @param index
     * @param value
     * @param value
     */
    setHeader(index, value, fontSize, lock = false){
        let element = this.getHeader(index);
        element.text = value;
        console.log(fontSize);
        if (fontSize) element.style["font-size"] = fontSize;
        if (lock){
            element.setAttribute("contentEditable", "false");
        }
    }

    /**
     * Retrieve the header html element
     * @param index
     * @param value
     */
    getHeader(index){
        if (typeof index !== "number" || index < 0 || index > 6) throw new Error("Invalid index: " + index);
        let selector = `[data-row='h'][data-col='${index}'] > .value`;
        return this.querySelector(selector);
    }

    /**
     * Set the value of a non-category cell.
     * @param row
     * @param col
     * @param value
     */
    setCell(row, col, value = ""){
        this.getCell(row, col).textContent = value;
    }

    getCell(row, col){
        let selector = `[data-row="${row}"][data-col="${col}"] > .value`;
        return this.querySelector(selector);
    }

    setComplete(row, col, value){
        if (typeof row !== "number" || row < 0 || row > 6) throw new Error("Invalid row: " + row);
        if (typeof col !== "number" || col < 0 || col > 5) throw new Error("Invalid col: " + col);
        this.getCell(row, col).setAttribute("data-complete", value);
    }
}

window.customElements.define('game-board', GameBoard);
module.exports = GameBoard;