import GameModel from "./GameModel.js";

class EndOfGame {
    getUpdate() {
        return {
            style: GameModel.STYLE.END_OF_GAME
        }
    }
}

export default EndOfGame;