"use strict";

/** View-Controller for the HTML game board element              **/
/** This is model agnostic, see EditorPane.js for model methods **/

const FileOps = require("./FileOps.js");
let fileOps = new FileOps();

function headerChangeListener(event) {
    event.target.fitText.notify(1, 1);
    let col = parseInt(event.target.parentElement.getAttribute("data-col"));
    window.model.getColumn(col).category = event.target.text;
}

async function headerFocusListener(event) {
    let col = parseInt(event.target.parentElement.getAttribute("data-col"));
    event.target.text = window.model.getColumn(col).category;
    window.model.getColumn(col).fontsize = event.target.style["font-size"];
    await fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}

class GameBoard extends HTMLElement {
    constructor(questionPane) {
        super();
        window.addEventListener("load", async ()=>{
            try {
                await fileOps.loadClient();
            } catch (err) {
                console.log(err);
            }

            this.addListeners();
        });
    }

    setQuestionPane(pane){
        this.questionPane = pane;
    }

    setEditorPane(pane){
        this.editorPane = pane;
    }

    addListeners() {
        let gameBoard = document.getElementById("game-board");
        for (let col = 0; col < 6; col++) {
            gameBoard.getHeader(col).addEventListener("input", headerChangeListener);
            gameBoard.getHeader(col).addEventListener("blur", headerFocusListener);

            for (let row = 0; row < 5; row++) {
                gameBoard.getCell(row, col).addEventListener("click", () => {
                    this.questionPane.showQuestion(window.model.getCell(row, col));
                    this.editorPane.hideAll();
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
    setHeader(index, value, fontSize){
        let element = this.getHeader(index);
        element.text = value;
        if (fontSize) element.style["font-size"] = fontSize;
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