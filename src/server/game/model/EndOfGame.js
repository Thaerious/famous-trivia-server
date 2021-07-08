import GameModel from "./GameModel";

class EndOfGame {
    constructor(parent) {
        this.parent = parent;

        this.stateData = {
            style: GameModel.STYLE.END_OF_GAME,
            players: parent.players
        }
    }

    getUpdate() {
        return {
            style: GameModel.STYLE.END_OF_GAME,
            players: this.parent.players
        }
    }
}

export default EndOfGame;