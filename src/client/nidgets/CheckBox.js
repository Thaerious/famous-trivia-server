const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class ValueUpdate extends  CustomEvent{
    constructor(value) {
        super('value-update',
            {detail : {value : value}}
        );
    }
}

class CheckBox extends NidgetElement {
    async connectedCallback(){
        await super.connectedCallback();
        this.addEventListener("click", ()=>{
            this.toggle();
        });
    }

    toggle(dispatch = true){
        if (this.checked === 'true') this.setChecked('false', dispatch);
        else this.setChecked('true', dispatch);
    }

    get checked(){
        if (!this.hasAttribute(CheckBox.CHECKED_ATTRIBUTE)){
            this.setAttribute(CheckBox.CHECKED_ATTRIBUTE, 'false');
        }
        return this.getAttribute(CheckBox.CHECKED_ATTRIBUTE);
    }

    set checked(value){
        if (value === this.checked) return;
        this.setAttribute(CheckBox.CHECKED_ATTRIBUTE, value);
        this.dispatchEvent(new ValueUpdate(value));
    }

    setChecked(value, dispatch = true){
        if (value === this.checked) return;
        this.setAttribute(CheckBox.CHECKED_ATTRIBUTE, value);
        if (dispatch) this.dispatchEvent(new ValueUpdate(value));
    }
}

CheckBox.CHECKED_ATTRIBUTE = "checked";
window.customElements.define('check-box', CheckBox);
module.exports = CheckBox;