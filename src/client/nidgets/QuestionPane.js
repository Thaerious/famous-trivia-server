const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class TextUpdate extends  CustomEvent{
    constructor(text) {
        super('text-update',
            {detail : {text : text}}
        );
    }
}

class BoardClick extends  CustomEvent{
    constructor() {
        super('button-board');
    }
}

class QuestionClick extends  CustomEvent{
    constructor() {
        super('button-question');
    }
}

class AnswerClick extends  CustomEvent{
    constructor() {
        super('button-answer');
    }
}

class QuestionPane extends NidgetElement{
    async ready(){
        await super.ready();

        this.querySelector("#show-board").addEventListener("click", ()=>{
            this.dispatchEvent(new BoardClick());
        });

        this.querySelector("#show-question").addEventListener("click", ()=>{
            this.dispatchEvent(new QuestionClick());
        });

        this.querySelector("#show-answer").addEventListener("click", ()=>{
            this.dispatchEvent(new AnswerClick());
        });

        this.addEventListener("click", ()=>this.querySelector(".text-contents").focus());

        this.querySelector("#text-contents").addEventListener("blur", async ()=>{
            let text = this.querySelector(".text-contents").text;
            this.dispatchEvent(new TextUpdate(text.trim()));
        });
    }

    clear(){
        this.querySelector(".text-contents").text = "";
    }

    setText(text){
        this.querySelector(".text-contents").text = text;
    }

    /**
     * @param button {'question', 'answer'}
     */
    highlight(button){
        for (let ele of this.querySelectorAll(`.selected`)) ele.classList.remove("selected");
        this.querySelector(`#show-${button}`).classList.add("selected");
    }

    set boardButton(value){
        if (value){
            this.querySelector("#show-board").show();
        }else{
            this.querySelector("#show-board").hide();
        }
    }
}

window.customElements.define('question-pane', QuestionPane);
module.exports = QuestionPane;



