import AbstractView from "./AbstractView.js";
import ViewEvent from "./ViewEvent.js";

class ContestantPortalView extends AbstractView {
    constructor() {
        super();
        this.DOM.buzzButton = document.querySelector("#buzz");
        this.DOM.selfPanel = document.querySelector("#self-panel");

        this.DOM.buzzButton.addEventListener("click", e => this.dispatchEvent(new ViewEvent("buzz")));
        this.DOM.gameBoard.addEventListener("cell-select", e => this.dispatchEvent(new ViewEvent("select", e.detail)));
        this.DOM.multipleChoice.addEventListener("value-update", e => this.dispatchEvent(new ViewEvent("update", e.detail)));

        this.DOM.selfPanel.hideClock();
    }

    setName(name) {
        this.name = name;
        this.DOM.selfPanel.name = "Score";
        document.title = name;
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
                this.DOM.multipleChoice.querySelector(".inner.total").show();
                this.DOM.multipleChoice.querySelector(".inner.total > .amount").text = update.bets[this.name].total;

                if (update.bets[this.name].bonus !== 0) {
                    this.DOM.multipleChoice.querySelector(".inner.bonus > .amount").text = update.model.round.bonus;
                }
                else {
                    this.DOM.multipleChoice.querySelector(".inner.bonus > .amount").text = 0;
                }
                console.log(update.bets[this.name].answers);
                for (let i = 0; i < 6; i++) {
                    let wagerElement = this.DOM.multipleChoice.querySelector(`[data-index="${i}"] .wager`);
                    let value = update.bets[this.name].answers[i].amount;

                    if (value !== ""){
                        wagerElement.content = parseInt(value);
                    }
                    else {
                        wagerElement.content = "";
                    }
                }
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