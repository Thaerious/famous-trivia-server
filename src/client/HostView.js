import AbstractView from "./AbstractView.js"

class HostView extends AbstractView{

    constructor() {
        super();
        this.DOM.continueButton =  document.querySelector("game-board");
    }


    updateModel(update) {
        super.updateModel(update);
        switch (update.state) {
            case 0:
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            case 6:
                break;
            case 7:
                break;
            case 8:
                break;
            case 9:
                break;
            default:
                break;
        }
    }
}

export default HostView;