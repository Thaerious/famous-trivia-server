const NidgetElement = require("@thaerious/nidget").NidgetElement;

class NidgetButton extends  NidgetElement{
    constructor() {
        super("nidget-button-template");
    }

    async ready(){
       await super.ready();
       this.DOM.text.innerHTML = this.innerHTML;
       this.innerHTML = "";
    }

    disable(){
        this.classList.add("disabled");
    }

    enable(){
        this.classList.remove("disabled");
    }
}

window.customElements.define('nidget-button', NidgetButton);
module.exports = NidgetButton;