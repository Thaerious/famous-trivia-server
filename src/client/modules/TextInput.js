const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class TextInput extends NidgetElement {
    constructor() {
        super("text-input-template");
    }

    async ready() {
        await super.ready();

        this.filter = this.getAttribute(TextInput.FILTER) ?? /./;
        const hint = this.getAttribute(TextInput.HINT_ATTRIBUTE);
        this.DOM['hint'].innerHTML = hint;

        this.content = "";

        this.DOM['content'].addEventListener("click", ()=>{
            this.DOM['hint'].innerHTML = "";
        });

        this.DOM['content'].addEventListener("blur", ()=>{
            if (this.DOM['content'].innerHTML.trim() === ""){
                this.DOM['hint'].innerHTML = hint;
            }
        });

        this.DOM['content'].addEventListener("keypress", (event)=>this.onKeypress(event));
        this.DOM['content'].addEventListener("input", (event)=>this.onInput(event));
    }

    get content(){
        const string = this.DOM['content'].innerHTML;
        return string.replaceAll("&nbsp;", " ");
    }

    set content(value){
        return this.DOM['content'].innerHTML = value;
    }

    setCaret(index) {
        let range = document.createRange()
        let sel = window.getSelection()

        range.setStart(this.DOM['content'].childNodes[0], index);
        range.collapse(true)

        sel.removeAllRanges()
        sel.addRange(range)
    }

    onInput(event){
        const check = this.content;
        if (!check.match("^" + this.filter + "$")){
            this.content = this.prevContent;
            this.setCaret(this.prevCaret);
            event.stopPropagation();
            event.preventDefault();
        }
    }

    onKeypress(event) {
        if (event.which === 13){
            event.stopPropagation();
            event.preventDefault();

            this.dispatchEvent(new CustomEvent("enter-pressed"));
        }

        this.prevContent = this.content;
        this.prevCaret = this.shadowRoot.getSelection().anchorOffset;
    }
}

TextInput.FILTER = "filter";
TextInput.HINT_ATTRIBUTE = "hint";
window.customElements.define('text-input', TextInput);
module.exports = TextInput;