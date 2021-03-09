import Express from 'express';
import http from 'http';
import helmet from 'helmet';
import BodyParser from 'body-parser'
import cookieParser from "cookie-parser";
import UserAgent from 'express-useragent';

import {urlGoogle, getGoogleAccountFromCode} from './google-util.js';

const port = 8000;
const app = Express();
const server = http.createServer(app);

app.use(helmet());
app.use(BodyParser.urlencoded({extended : false}));
// app.use(cookieParser());
app.use(UserAgent.express());

app.use("/pages/*.html", function (req, res, next) {
    res.set("Content-Security-Policy", "connect-src 'self' accounts.google.com");
    next();
});

app.use(Express.static('public'));

app.get("/google-url", function (req, res, next) {
    res.send(urlGoogle());
});

app.get("/google-cb", async function (req, res, next) {
    let googleConsent = await getGoogleAccountFromCode(req.query.code);
    res.redirect('/pages/join-success.html');
    res.end();
});

server.listen(port, () => {console.log(`HTTP listener started on port ${port}`)});

