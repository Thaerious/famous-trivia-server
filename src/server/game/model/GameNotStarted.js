import GameModel from "./GameModel.js";

class GameNotStarted {
    getUpdate() {
        return {
            style: GameModel.STYLE.NOT_STARTED
        }
    }
}

export default GameNotStarted;