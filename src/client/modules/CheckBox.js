const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class ValueUpadate extends  CustomEvent{
    constructor(value) {
        super('value-update',
            {detail : {value : value}}
        );
    }
}

class CheckBox extends NidgetElement {
    async connectedCallback(){
        super.connectedCallback();
        this.addEventListener("click", ()=>{
            this.toggle();
        });
    }

    toggle(){
        if (this.checked === 'true') this.checked = 'false';
        else this.checked = 'true'
    }

    get checked(){
        if (!this.hasAttribute(CheckBox.CHECKED_ATTRIBUTE)){
            this.setAttribute(CheckBox.CHECKED_ATTRIBUTE, 'false');
        }
        return this.getAttribute(CheckBox.CHECKED_ATTRIBUTE);
    }

    set checked(value){
        this.setAttribute(CheckBox.CHECKED_ATTRIBUTE, value);
        this.dispatchEvent(new ValueUpadate(value));
    }
}

CheckBox.CHECKED_ATTRIBUTE = "checked";
window.customElements.define('check-box', CheckBox);
module.exports = CheckBox;