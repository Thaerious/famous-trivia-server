const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class ModalAlert extends NidgetElement {

    constructor() {
        super("modal-alert-template");
    }

    async ready() {
        await super.ready();
        this.DOM['ok'].addEventListener("click", (event)=>this.hide());
    }

    show(message){
        super.show();
        this.DOM['content'].innerHTML = message;
    }

}

window.customElements.define('modal-alert', ModalAlert);
module.exports = ModalAlert;