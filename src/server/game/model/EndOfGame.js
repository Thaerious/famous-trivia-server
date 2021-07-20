import GameModel from "./GameModel.js";

class EndOfGame {
    constructor(parent) {
        this.stateData = {
            style: GameModel.STYLE.END_OF_GAME
        }
    }

    getUpdate() {
        return {
            style: GameModel.STYLE.END_OF_GAME
        }
    }
}

export default EndOfGame;