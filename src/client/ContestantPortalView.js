import AbstractView from "./AbstractView.js";
import ViewEvent from "./ViewEvent.js";

class ContestantPortalView extends AbstractView {
    constructor() {
        super();
        this.DOM.buzzButton = document.querySelector("#buzz");
        this.DOM.selfPanel = document.querySelector("#self-panel");

        this.DOM.buzzButton.addEventListener("click", e => this.dispatchEvent(new ViewEvent("accept")));
        this.DOM.gameBoard.addEventListener("cell-select", e => this.dispatchEvent(new ViewEvent("select", e.detail)));

        this.DOM.selfPanel.hideClock();
    }

    setName(name) {
        this.name = name;
        this.DOM.selfPanel.name = "Score";
    }

    updateModel(update) {
        super.updateModel(update);
        // this.DOM.buzzButton.hide();
        this.DOM.timer.show();

        for (let player of update.model.players) {
            if (player.name === this.name) {
                this.DOM.selfPanel.score = player.score;
                break;
            }
        }

        switch (update.state) {
            case 7:
                let check = update.model.round.spentPlayers.indexOf(this.name);
                console.log(this.name);
                console.log(update.model.round.spentPlayers);
                console.log(check);
                if (update.model.round.spentPlayers.indexOf(this.name) === -1) {
                    console.log("HERE");
                    this.DOM.buzzButton.show();
                }
                break;
        }
    }
}

export default ContestantPortalView;