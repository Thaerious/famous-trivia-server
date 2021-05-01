const NidgetElement = require("@Thaerious/nidget").NidgetElement;
require("./CheckBox.js");

class ValueUpdate extends CustomEvent {
    constructor(index, value) {
        super('value-update',
            {detail: {index: index, value: value}}
        );
    }
}

class MultipleChoicePresent extends NidgetElement {
    constructor() {
        super("multiple-choice-present-template");
        this.timeouts = [];
    }

    setTimeout(index, value){
        if (this.timeouts[index]) clearTimeout(this.timeouts[index]);
        this.timeouts[index] = setTimeout(()=>{
            const event = new ValueUpdate(index, value);
            this.dispatchEvent(event);
            this.timeouts[index] = undefined;
        }, 300);
    }

    async ready() {
        await super.ready();

        for (const element of this.querySelectorAll(".wager")){
            element.addEventListener("click", event=>element.content = "");
        }
``
        for (const element of this.querySelectorAll(".wager")){
            element.addEventListener("text-update", event => {
                if(element.content !== "0"){
                    const index = element.parentElement.getAttribute("data-index");
                    element.parentElement.querySelector("check-box").checked = true;
                    this.setTimeout(index, element.content)
                }
            });

            element.addEventListener("blur", event =>{
                if(element.content === ""){
                    element.content = '0';
                }
            });
        }
        //
        // for (let element of this.querySelectorAll("check-box")){
        //     element.addEventListener("value-update", event =>{
        //         if(event.detail.value === "false"){
        //             element.parentElement.querySelector(".wager").content = 0;
        //         }
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

    setAnswerText(index, text) {
        this.querySelector(`.inner[data-index="${index}"] .answer`).text = text;
    }

    setChecked(index, value) {
        this.querySelector(`.inner[data-index="${index}"] check-box`).checked = value;
    }
}

window.customElements.define('multiple-choice-present', MultipleChoicePresent);
module.exports = MultipleChoicePresent;