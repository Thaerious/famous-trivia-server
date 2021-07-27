import GameModel from "../../../src/server/game/model/GameModel.js";
import fs from "fs";

function setupSituation(path) {
    const file = fs.readFileSync(path);
    const data = JSON.parse(file);
    const gameModel = new GameModel(data);


}