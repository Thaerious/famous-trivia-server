import AbstractView from "./AbstractView.js";
import ViewEvent from "./ViewEvent.js";

class ContestantPortalView extends AbstractView {
    constructor() {
        super();
        this.DOM.buzzButton = document.querySelector("#buzz");
        this.DOM.selfPanel = document.querySelector("#self-panel");

        this.DOM.buzzButton.addEventListener("click", e => this.dispatchEvent(new ViewEvent("buzz")));
        this.DOM.gameBoard.addEventListener("cell-select", e => this.dispatchEvent(new ViewEvent("select", e.detail)));

        this.DOM.selfPanel.hideClock();
    }

    setName(name) {
        this.name = name;
        this.DOM.selfPanel.name = "Score";
    }

    updateModel(update) {
        super.updateModel(update);
        this.DOM.buzzButton.hide();

        for (let player of update.model.players) {
            if (player.name === this.name) {
                this.DOM.selfPanel.score = player.score;
                break;
            }
        }

        switch (update.state) {
            case 2:
                this.DOM.multipleChoice.setMode("data-enter");
                for (let i = 0; i < 6; i++) {
                    this.DOM.multipleChoice.setAnswerText(i, update.model.round.answers[i]);
                }
                break;
            case 3:
                this.DOM.multipleChoice.setMode("data-enter");
                break;
            case 7:
                let check = update.model.round.spentPlayers.indexOf(this.name);
                if (update.model.round.spentPlayers.indexOf(this.name) === -1) {
                    this.DOM.buzzButton.show();
                }
                break;
        }
    }
}

export default ContestantPortalView;