const NidgetElement = require("@Thaerious/nidget").NidgetElement;
require("./CheckBox.js");

class AnswerUpdate extends CustomEvent{
    constructor(index, text) {
        super('answer-update',
            {detail : {index : index, text : text}}
        );
    }
}

class ValueUpdate extends  CustomEvent{
    constructor(index, value) {
        super('value-update',
            {detail : {index : index, value : value}}
        );
    }
}

class QuestionClick extends  CustomEvent{
    constructor() {
        super('button-question');
    }
}

class MultipleChoiceCompose extends NidgetElement {

    constructor() {
        super("multiple-choice-compose-template");
    }


    setModel(model){
        this.model = model;
    }

    async ready(){
        await super.ready();
        for (const element of this.querySelectorAll(".answer")){
            element.addEventListener("blur", (event)=>{
                let index = element.parentElement.getAttribute("data-index");
                this.dispatchEvent(new AnswerUpdate(index, element.content))
            });
        }

        for (const element of this.querySelectorAll("check-box")){
            element.addEventListener("value-update", (event)=>{
                let index = window.getComputedStyle(event.target).getPropertyValue("--index");
                let value = event.detail.value;
                this.dispatchEvent(new ValueUpdate(index, value));
            });
        }
    }

    // txtListener(event) {
    //     if (event.which === 13){
    //         event.stopPropagation();
    //         event.preventDefault();
    //
    //         let index = window.getComputedStyle(event.target).getPropertyValue("--index");
    //         index = parseInt(index);
    //         if (index >= 5){
    //             event.target.blur();
    //         } else {
    //             let selector = `nidget-text[data-index="${index + 1}"]`;
    //             this.querySelector(selector).focus();
    //         }
    //
    //         return false;
    //     }
    //     event.target.fitText.notify(1, 1);
    //     return true;
    // }

    /**
     * @param button {'question', 'answer'}
     */
    highlight(button){
        for (let ele of this.querySelectorAll(`.selected`)) ele.classList.remove("selected");
        this.querySelector(`#show-${button}`).classList.add("selected");
    }

    setText(index, text){
        this.querySelector(`.inner[data-index="${index}"] text-input`).content = text;
    }

    setChecked(index, value){
        this.querySelector(`.inner[data-index="${index}"] check-box`).checked = value;
    }
}

window.customElements.define('multiple-choice-compose', MultipleChoiceCompose);
module.exports = MultipleChoiceCompose;