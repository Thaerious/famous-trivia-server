
class EditorPane{
    constructor(gameModel) {
        this.gameModel = gameModel;
        this.triangleRight = document.querySelector("#triangle-right");
        this.triangleLeft = document.querySelector("#triangle-left");

        this.updateTriangleView();

        document.querySelector("#menu-add-round").addEventListener("click", ()=>this.menuAdd());
        document.querySelector("#menu-remove-round").addEventListener("click", ()=>this.menuRemove());
        document.querySelector("#menu-home-screen").addEventListener("click", ()=>this.menuHome());
        this.triangleRight.addEventListener("click", ()=> this.nextRound());
        this.triangleLeft.addEventListener("click", ()=> this.prevRound());

        this.onSave = function(){}; // set this in main to save .json model
        this.updateView = function(){}; // set this in main to update view
    }

    updateTriangleView(){
        this.triangleLeft.classList.remove("hidden");
        this.triangleRight.classList.remove("hidden");
        if (this.gameModel.currentRound === 0) this.triangleLeft.classList.add("hidden");
        if (this.gameModel.currentRound >= this.gameModel.roundCount - 1) this.triangleRight.classList.add("hidden");
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

    menuAdd(){
        console.log("menu add");
        this.gameModel.addRound();
        this.updateTriangleView();
        this.onSave();
    }

    menuRemove(){

    }

    menuHome(){

    }
}

module.exports = EditorPane;