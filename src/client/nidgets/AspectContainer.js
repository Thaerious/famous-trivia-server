import NidgetElement from "./NidgetElement";

class AspectContainer extends NidgetElement {

    constructor() {
        super("aspect-container-template");
    }

    async ready() {
        await super.ready();
        console.log("READY");
        window.addEventListener("resize", e => this.reportWindowSize());
        this.copyChildElements();
        this.reportWindowSize();
    }

    copyChildElements() {
        for (let i = 0; i < this.childElementCount; i++){
            const node = this.children[i];
            this.shadowRoot.append(node.cloneNode(true))
        };
        this.innerHTML = "";
    }

    reportWindowSize() {
        const pageContainer = document.querySelector("#page-container");
        const ratio = window.innerWidth / window.innerHeight;

        let aspectW = getComputedStyle(this).getPropertyValue('--aspect-width');
        let aspectH = getComputedStyle(this).getPropertyValue('--aspect-height');
        aspectW = parseInt(aspectW);
        aspectH = parseInt(aspectH);
        if (isNaN(aspectW)) aspectW = 16;
        if (isNaN(aspectH)) aspectH = 9;
        const target = aspectW / aspectH;

        if (ratio >= target) {
            this.classList.add("vert-dominant");
            this.classList.remove("horz-dominant");
        } else {
            this.classList.remove("vert-dominant");
            this.classList.add("horz-dominant");
        }
    }
}

window.customElements.define('aspect-container', AspectContainer);