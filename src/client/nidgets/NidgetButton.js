const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class NidgetButton extends  NidgetElement{
    constructor() {
        super("nidget-button-template");
    }

    async ready(){
       await super.ready();
       this.DOM.text.innerHTML = this.innerHTML;
       this.innerHTML = "";
    }
}

window.customElements.define('nidget-button', NidgetButton);
module.exports = NidgetButton;