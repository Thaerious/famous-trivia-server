const Model = require("./Model.js");

// showQuestion(cell){
//     if (cell) this.cell = cell;
//     cell = cell ?? this.cell;
//
//     this.navAnswer.classList.remove("selected");
//     this.navQuestion.classList.add("selected");
//
//     this.status = "q";
//
//     this.navBoard.classList.remove("hidden");
//     this.navQuestion.classList.remove("hidden");
//     this.navAnswer.classList.remove("hidden");
//
//     this.textQuestion.classList.remove("hidden");
//     this.textQuestion.querySelector(".text-contents").text = cell.q;
// }
//
// showAnswer(cell){
//     if (cell) this.cell = cell;
//     cell = cell ?? this.cell;
//
//     this.navAnswer.classList.add("selected");
//     this.navQuestion.classList.remove("selected");
//
//     this.status = "a";
//
//     this.navBoard.classList.remove("hidden");
//     this.navQuestion.classList.remove("hidden");
//     this.navAnswer.classList.remove("hidden");
//
//     this.textQuestion.classList.remove("hidden");
//     this.textQuestion.querySelector(".text-contents").text = cell.a;
// }

class EditQuestionPane{
    /**
     * @param gameBoard
     * @param questionPane
     * @param model - the question model object
     * @param field - which model field to read/write from {'a', 'q'}
     * @param saveCB - call this method to save the model
     */
    constructor(gameBoard, questionPane, model, field, saveCB, closeCB) {
        this.questionPane = questionPane;

        questionPane.setText(model[field]);

        this.textList = (event)=>{
            model[field] = event.detail.text;
            saveCB();
        }

        this.boardList = (event)=>{
            questionPane.hide();
            this.cleanup();
            gameBoard.show();
            closeCB();
        }

        this.answerList = (event)=>{
            this.cleanup();
            new EditQuestionPane(gameBoard, questionPane, model, 'a', saveCB, closeCB);
        }

        this.questionList = (event)=>{
            this.cleanup();
            new EditQuestionPane(gameBoard, questionPane, model, 'q', saveCB, closeCB);
        }

        questionPane.addEventListener("text-update", this.textList);
        questionPane.addEventListener("button-board", this.boardList);

        if (field === 'a'){
            questionPane.addEventListener("button-question", this.questionList);
            questionPane.highlight('answer');
        }
        else if (field === 'q'){
            questionPane.addEventListener("button-answer", this.answerList);
            questionPane.highlight('question');
        }
    }

    cleanup(){
        this.questionPane.removeEventListener("text-update", this.textList);
        this.questionPane.removeEventListener("button-board", this.boardList);
        this.questionPane.removeEventListener("button-answer", this.answerList);
        this.questionPane.removeEventListener("question-answer", this.questionList);
    }

    onSave(){}
    onClose(){}
}

class EditorPane{
    constructor(model) {
        this.model = model;
        this.triangleRight = document.querySelector("#triangle-right");
        this.triangleLeft  = document.querySelector("#triangle-left");
        this.roundLabel    = document.querySelector("#round-number");
        this.gameName      = document.querySelector("#game-name");

        this.multipleChoicePane = document.getElementById("multiple-choice-pane");
        this.gameBoard          = document.getElementById("game-board");
        this.questionPane       = document.getElementById("question-pane");

        document.querySelector("#menu-add-category").addEventListener("click", ()=>{
            this.model.addCategoryRound();
            this.updateTriangleView();
            this.onSave();
        });

        document.querySelector("#menu-add-multiple-choice").addEventListener("click", ()=>{
            this.model.addMultipleChoiceRound();
            this.updateTriangleView();
            this.onSave();
        });

        document.querySelector("#menu-remove-round").addEventListener("click", ()=>this.menuRemove());
        document.querySelector("#menu-home-screen").addEventListener("click", ()=>this.menuHome());
        document.querySelector("#menu-value-plus").addEventListener("click", ()=>this.menuPlus());
        document.querySelector("#menu-value-minus").addEventListener("click", ()=>this.menuMinus());

        this.triangleRight.addEventListener("click", ()=> this.nextRound());
        this.triangleLeft.addEventListener("click", ()=> this.prevRound());
        this.gameName.addEventListener("keydown", (event)=>this.inputName(event));

        // game-board change category text
        this.gameBoard.addEventListener("header-update", event =>{
            let col = event.detail.col;
            this.model.getColumn(col).category = event.detail.value;
            this.model.getColumn(col).fontSize = event.detail.fontSize;
            this.onSave();
        });

        // game-board select cell
        this.gameBoard.addEventListener("cell-select", event =>{
            let row = event.detail.row;
            let col = event.detail.col;
            this.gameBoard.hide();
            this.questionPane.show();
            this.hideNavigation();
            new EditQuestionPane(this.gameBoard, this.questionPane, this.model.getCell(row, col), 'q', ()=>this.onSave(), ()=>this.updateView());
        });

        this.linkPanes();
        this.updateView();
    }

    onSave(){}
    updateName(){}

    linkPanes(){
        let multipleChoice = document.getElementById("multiple-choice-pane");
        let gameBoard = document.getElementById("game-board");
        let questionPane = document.getElementById("question-pane");
    }

    inputName(event){
        if (event.which === 13){
            this.updateName();
            event.stopPropagation();
            event.preventDefault();
            document.querySelector("#game-board-container").focus();
            return false;
        }
    }

    hideNavigation(){
        this.triangleLeft.classList.add("hidden");
        this.triangleRight.classList.add("hidden");
    }

    updateView(model) {
        model = model ?? this.model;
        this.updateTriangleView();

        document.getElementById("game-board").hide();
        document.getElementById("multiple-choice-pane").hide();

        if (model.getRound().type === Model.questionType.CATEGORY) this.categoryView(model);
        if (model.getRound().type === Model.questionType.MULTIPLE_CHOICE) this.multipleChoiceView(model);
    }

    updateTriangleView(){
        console.log("update triangle view");
        this.triangleLeft.classList.remove("hidden");
        this.triangleRight.classList.remove("hidden");
        if (this.model.currentRound === 0) this.triangleLeft.classList.add("hidden");
        if (this.model.currentRound >= this.model.roundCount - 1) this.triangleRight.classList.add("hidden");
        this.roundLabel.textContent = "Round " + (this.model.currentRound + 1);
    }

    multipleChoiceView(){
        let pane = document.getElementById("multiple-choice-pane");
        pane.show();
    }

    categoryView(model){
        let gameBoard = document.getElementById("game-board");
        gameBoard.show();

        for (let col = 0; col < 6; col++) {
            let column = model.getColumn(col);

            gameBoard.getHeader(col).fitText.lock = "vh";
            gameBoard.setHeader(col, column.category, column.fontSize);

            for (let row = 0; row < 5; row++) {
                gameBoard.setCell(row, col, column.cell[row].value);
                if (column.cell[row].q === "") gameBoard.setComplete(row, col, "false");
                else if (column.cell[row].a === "") gameBoard.setComplete(row, col, "partial");
                else gameBoard.setComplete(row, col, "true");
            }
        }
    }

    nextRound(){
        this.model.currentRound++;
        this.updateView();
    }

    prevRound(){
        this.model.currentRound--;
        this.updateView();
    }

    menuPlus(){
        this.model.increaseValue();
        this.onSave();
        this.updateView();
    }

    menuMinus(){
        this.model.decreaseValue();
        this.onSave();
        this.updateView();
    }

    menuRemove(){
        this.model.removeRound();
        this.updateTriangleView();
        this.onSave();
        this.updateView();
    }

    menuHome(){
        location.href = "home.html";
    }
}

module.exports = EditorPane;