const NidgetElement = require("@Thaerious/nidget").NidgetElement;
require("./CheckBox.js");

class ValueUpdate extends CustomEvent {
    constructor(index, value) {
        super('value-update',
            {detail: {index: index, value: value}}
        );
    }
}

class QuestionClick extends CustomEvent {
    constructor() {
        super('button-question');
    }
}

class MultipleChoicePresent extends NidgetElement {
    constructor() {
        super("multiple-choice-present-template");
    }

    async ready() {
        await super.ready();
        // for (let element of this.querySelectorAll(".answer > nidget-text")){
        //     element.fitText.lock = "vh";
        //     element.addEventListener("keypress", (event)=>this.txtListener(event));
        //     element.addEventListener("blur", (event)=>{
        //         let index = event.target.getAttribute("data-index");
        //         let text = this.querySelector(`nidget-text[data-index="${index}"]`).text;
        //         this.dispatchEvent(new TextUpdate(index, text))
        //     });
        // }
        //
        // for (let element of this.querySelectorAll("check-box")){
        //     element.addEventListener("value-update", (event)=>{
        //         let index = window.getComputedStyle(event.target).getPropertyValue("--index");
        //         let value = event.detail.value;
        //         this.dispatchEvent(new ValueUpdate(index, value));
        //     });
        // }
        //
        // this.querySelector("#show-question").addEventListener("click", ()=>{
        //     this.dispatchEvent(new QuestionClick());
        // });
    }

    setMode(mode) {
        switch (mode) {
            case "show":
                this.classList.add("show-mode");
                break;
            case "data-enter":
            default:
                this.classList.remove("show-mode");
                break;
        }
    }

    txtListener(event) {
        if (event.which === 13) {
            event.stopPropagation();
            event.preventDefault();

            let index = window.getComputedStyle(event.target).getPropertyValue("--index");
            index = parseInt(index);
            if (index >= 5) {
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

    setAnswerText(index, text) {
        this.querySelector(`.inner[data-index="${index}"] .answer`).text = text;
    }

    setChecked(index, value) {
        this.querySelector(`.inner[data-index="${index}"] check-box`).checked = value;
    }
}

window.customElements.define('multiple-choice-present', MultipleChoicePresent);
module.exports = MultipleChoicePresent;