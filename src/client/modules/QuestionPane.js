
class QuestionPane{

    /**
     * Call constructor after window has loaded
     * @param (function) savecb callback to save model
     */
    constructor(savecb) {
        this.textQuestion = document.querySelector("#text-question");
        this.navBoard = document.querySelector("#show-board");
        this.navQuestion = document.querySelector("#show-question");
        this.navAnswer = document.querySelector("#show-answer");

        document.querySelector("#show-board").addEventListener("click", ()=>{
            this.hideAll();
        });

        document.querySelector("#show-question").addEventListener("click", ()=>{
            this.showQuestion();
        });

        document.querySelector("#show-answer").addEventListener("click", ()=>{
            this.showAnswer();
        });

        this.textQuestion.querySelector(".text-contents").addEventListener("blur", async ()=>{
           this.cell[this.status] = this.textQuestion.querySelector(".text-contents").text;
           await savecb();
        });
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


