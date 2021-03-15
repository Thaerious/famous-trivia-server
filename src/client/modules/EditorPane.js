
class EditorPane{
    constructor(gameModel) {
        this.gameModel = gameModel;
        this.triangleRight = document.querySelector("#triangle-right");
        this.triangleLeft = document.querySelector("#triangle-left");
        this.roundLabel = document.querySelector("#round-number");
        this.gameName = document.querySelector("#game-name");

        this.updateTriangleView();

        document.querySelector("#menu-add-round").addEventListener("click", ()=>this.menuAdd());
        document.querySelector("#menu-remove-round").addEventListener("click", ()=>this.menuRemove());
        document.querySelector("#menu-home-screen").addEventListener("click", ()=>this.menuHome());
        document.querySelector("#menu-value-plus").addEventListener("click", ()=>this.menuPlus());
        document.querySelector("#menu-value-minus").addEventListener("click", ()=>this.menuMinus());
        this.triangleRight.addEventListener("click", ()=> this.nextRound());
        this.triangleLeft.addEventListener("click", ()=> this.prevRound());
        // this.gameName.addEventListener("blur", ()=> this.updateName());
        this.gameName.addEventListener("keydown", (event)=>this.inputName(event));

        this.onSave = function(){}; // set this in main to save .json model
        this.updateName = function(){}; // called to change the file name
    }

    inputName(event){
        window.e = event;
        if (event.which === 13){
            this.updateName();
            e.stopPropagation();
            e.preventDefault();
            document.querySelector("#game-board-container").focus();
            return false;
        }
    }

    hideAll(){
        this.triangleLeft.classList.add("hidden");
        this.triangleRight.classList.add("hidden");
    }

    updateTriangleView(){
        this.triangleLeft.classList.remove("hidden");
        this.triangleRight.classList.remove("hidden");
        if (this.gameModel.currentRound === 0) this.triangleLeft.classList.add("hidden");
        if (this.gameModel.currentRound >= this.gameModel.roundCount - 1) this.triangleRight.classList.add("hidden");
        this.roundLabel.textContent = "Round " + (this.gameModel.currentRound + 1);
    }

    updateView(model) {
        model = model ?? this.gameModel;
        this.updateTriangleView();

        let gameBoard = document.getElementById("game-board");
        if (!gameBoard) throw new Error("Game board not found");
        model = model ?? window.model;

        let round = model.getRound();

        for (let col = 0; col < 6; col++) {
            let column = model.getColumn(col);

            gameBoard.getHeader(col).initFitText("vh");
            gameBoard.setHeader(col, column.category, column.fontsize);
            gameBoard.getHeader(col).fitText.delayResize(1, 1);

            for (let row = 0; row < 5; row++) {
                gameBoard.setCell(row, col, column.cell[row].value);
                if (column.cell[row].q === "") gameBoard.setComplete(row, col, "false");
                else if (column.cell[row].a === "") gameBoard.setComplete(row, col, "partial");
                else gameBoard.setComplete(row, col, "true");
            }
        }
    }

    nextRound(){
        this.gameModel.currentRound++;
        this.updateTriangleView();
        this.updateView();
    }

    prevRound(){
        this.gameModel.currentRound--;
        this.updateTriangleView();
        this.updateView();
    }

    menuPlus(){
        this.gameModel.increaseValue();
        this.onSave();
        this.updateView();
    }

    menuMinus(){
        this.gameModel.decreaseValue();
        this.onSave();
        this.updateView();
    }

    menuAdd(){
        this.gameModel.addRound();
        this.updateTriangleView();
        this.onSave();
    }

    menuRemove(){
        this.gameModel.removeRound();
        this.updateTriangleView();
        this.onSave();
        this.updateView();
    }

    menuHome(){
        location.href = "home.html";
    }
}

module.exports = EditorPane;