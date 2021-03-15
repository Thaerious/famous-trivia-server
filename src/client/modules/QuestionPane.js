
class QuestionPane{

    /**
     * Call constructor after window has loaded
     * @param (function) savecb callback to save model
     */
    constructor() {
        this.textQuestion = document.querySelector("#text-question");
        this.textContents = this.textQuestion.querySelector(".text-contents");
        this.navBoard = document.querySelector("#show-board");
        this.navQuestion = document.querySelector("#show-question");
        this.navAnswer = document.querySelector("#show-answer");

        document.querySelector("#show-board").addEventListener("click", ()=>{
            this.hideAll();
            this.onClose();
        });

        document.querySelector("#show-question").addEventListener("click", ()=>{
            this.showQuestion();
        });

        document.querySelector("#show-answer").addEventListener("click", ()=>{
            this.showAnswer();
        });

        this.textQuestion.addEventListener("click", ()=>this.textContents.focus());

        this.textContents.addEventListener("blur", async ()=>{
           this.cell[this.status] = this.textContents.text.trim();
           await this.onSave();
        });

        this.onSave = function(){}; // set this in main to save .json model
        this.onClose = function(){}; // called when this panel is hidden.
    }

    hideAll(){
        this.navBoard.classList.add("hidden");
        this.navQuestion.classList.add("hidden");
        this.navAnswer.classList.add("hidden");
        this.textQuestion.classList.add("hidden");
    }

    showQuestion(cell){
        if (cell) this.cell = cell;
        cell = cell ?? this.cell;

        this.navAnswer.classList.remove("selected");
        this.navQuestion.classList.add("selected");

        this.status = "q";

        this.navBoard.classList.remove("hidden");
        this.navQuestion.classList.remove("hidden");
        this.navAnswer.classList.remove("hidden");

        this.textQuestion.classList.remove("hidden");
        this.textQuestion.querySelector(".text-contents").text = cell.q;
    }

    showAnswer(cell){
        if (cell) this.cell = cell;
        cell = cell ?? this.cell;

        this.navAnswer.classList.add("selected");
        this.navQuestion.classList.remove("selected");

        this.status = "a";

        this.navBoard.classList.remove("hidden");
        this.navQuestion.classList.remove("hidden");
        this.navAnswer.classList.remove("hidden");

        this.textQuestion.classList.remove("hidden");
        this.textQuestion.querySelector(".text-contents").text = cell.a;
    }
}

module.exports = QuestionPane;


