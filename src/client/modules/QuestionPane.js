const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class QuestionPane extends NidgetElement{

    async ready(){
        await super.ready();

        this.querySelector("#show-board").addEventListener("click", ()=>{
            this.showBoard();
        });

        this.querySelector("#show-question").addEventListener("click", ()=>{
            this.showQuestion();
        });

        this.querySelector("#show-answer").addEventListener("click", ()=>{
            this.showAnswer();
        });

        this.addEventListener("click", ()=>this.textContents.focus());

        this.querySelector("#text-contents").addEventListener("blur", async ()=>{
            this.cell[this.status] = this.textContents.text.trim();
            await this.onUpdate();
        });
    }

    onUpdate(){}
    showBoard(){}
    showQuestion(){}
    showAnswer(){}

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
}

window.customElements.define('question-pane', QuestionPane);
module.exports = QuestionPane;



