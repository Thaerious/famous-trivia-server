import GameManager from "../src/server/GameManager.js";

let path = "assets/test.db";
let gm = new GameManager(path);
await gm.setup();

