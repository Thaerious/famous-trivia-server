import Express from 'express';
import http from 'http';
import helmet from 'helmet';
import cookieParser from "cookie-parser";
import UserAgent from 'express-useragent';
import CatchDesignPage from './catchDesignPage.js';
import BodyParser from 'body-parser';
import launcher from './launcher.js';
import GameManager from "./GameManager.js";

const port = 8000;
const app = Express();
const server = http.createServer(app);
const gameManager = new GameManager();

app.use(helmet()); // automatic security settings
app.use(UserAgent.express()); // use to determine what the connection is using (phone,browser etc)
app.use("/launch", BodyParser.json());
app.use("/launch", launcher(gameManager));

app.use("/host.html", CatchDesignPage);
app.use("/editor.html", CatchDesignPage);
app.use(Express.static('public'));

server.listen(port, () => {console.log(`HTTP listener started on port ${port}`)});