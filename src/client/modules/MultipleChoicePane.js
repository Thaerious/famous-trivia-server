const NidgetElement = require("@Thaerious/nidget").NidgetElement;
require("./CheckBox.js");

class MultipleChoicePane extends NidgetElement {

    setModel(model){
        this.model = model;
    }

    async connectedCallback(){
        await super.connectedCallback();
        for (let element of this.querySelectorAll(".answer > nidget-text")){
            element.fitText.lock = "vh";
            // element.addEventListener("input", txtListener);
            element.addEventListener("keypress", (event)=>this.txtListener(event));
        }
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

            model[index] = {
                correct : "",
                text : this.querySelector(`nidget-text[data-index="${index}"]`).text
            }

            return false;
        }
        event.target.fitText.notify(1, 1);
        return true;
    }
}

window.customElements.define('multiple-choice-pane', MultipleChoicePane);
module.exports = MultipleChoicePane;