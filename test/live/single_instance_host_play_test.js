// noinspection DuplicatedCode
import launch from "./partials/launch_single_instance_host.js";
import gameEnv from "./partials/prequel.js";
import start_consoles from "./partials/start_consoles.js";
import play_mock_game from "./partials/play_mock_game.js";
import finish_jeopardy_round from "./partials/finish_jeopardy_round.js";

describe("launch", async ()=>await launch(gameEnv));
describe("start", async ()=>await start_consoles(gameEnv));
describe("play", async ()=>await finish_jeopardy_round(gameEnv));