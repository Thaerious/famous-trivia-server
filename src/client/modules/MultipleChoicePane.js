const NidgetElement = require("@Thaerious/nidget").NidgetElement;
require("./CheckBox.js");

class TextUpdate extends  CustomEvent{
    constructor(index, text) {
        super('text-update',
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

class MultipleChoicePane extends NidgetElement {

    setModel(model){
        this.model = model;
    }

    async ready(){
        await super.connectedCallback();
        for (let element of this.querySelectorAll(".answer > nidget-text")){
            element.fitText.lock = "vh";
            element.addEventListener("keypress", (event)=>this.txtListener(event));
            element.addEventListener("blur", (event)=>{
                let index = event.target.getAttribute("data-index");
                let text = this.querySelector(`nidget-text[data-index="${index}"]`).text;
                this.dispatchEvent(new TextUpdate(index, text))
            });
        }

        for (let element of this.querySelectorAll("check-box")){
            element.addEventListener("value-update", (event)=>{
                let index = window.getComputedStyle(event.target).getPropertyValue("--index");
                let value = event.detail.value;
                this.dispatchEvent(new ValueUpdate(index, value));
            });
        }

        this.querySelector("#show-question").addEventListener("click", ()=>{
            this.dispatchEvent(new QuestionClick());
        });
    }

    txtListener(event) {
        if (event.which === 13){
            event.stopPropagation();
            event.preventDefault();

            let index = window.getComputedStyle(event.target).getPropertyValue("--index");
            index = parseInt(index);
            if (index >= 5){
                event.target.blur();
            } else {
                let selector = `nidget-text[data-index="${index + 1}"]`;
                this.querySelector(selector).focus();
            }

            return false;
        }
        event.target.fitText.notify(1, 1);
        return true;
    }

    /**
     * @param button {'question', 'answer'}
     */
    highlight(button){
        for (let ele of this.querySelectorAll(`.selected`)) ele.classList.remove("selected");
        this.querySelector(`#show-${button}`).classList.add("selected");
    }

    setText(index, text){
        this.querySelector(`nidget-text[data-index="${index}"]`).text = text;
    }

    setChecked(index, value){
        this.querySelector(`check-box[data-index="${index}"]`).checked = value;
    }
}

window.customElements.define('multiple-choice-pane', MultipleChoicePane);
module.exports = MultipleChoicePane;