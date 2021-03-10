import Express from 'express';
import http from 'http';
import helmet from 'helmet';
import cookieParser from "cookie-parser";
import UserAgent from 'express-useragent';

// import {urlGoogle, getGoogleAccountFromCode} from './google-util.js';

const port = 8000;
const app = Express();
const server = http.createServer(app);

app.use(helmet()); // automatic security settings
app.use(UserAgent.express()); // use to determine what the connection is using (phone,browser etc)

app.use("*.html", function (req, res, next) {
    let csp = extractCSP(res);
    csp["default-src"] = "'self' *.google.com *.googleapis.com 'unsafe-inline'";
    csp["style-src"] = "'self' *.google.com 'unsafe-inline'";
    delete csp["script-src"];
    delete csp["script-src-attr"];
    console.log(csp);
    res.set("Content-Security-Policy", concatCSP(res, csp));
    next();
});

function extractCSP(res){
    let csp = res.get("Content-Security-Policy").split(";");
    let dict = {};

    for (let policy of  csp) {
        let kv = policy.split(/ /);
        dict[kv[0]] = kv[1] ?? "";
    }

    return dict;
}

function concatCSP(res, csp){
    let policyString = "";
    for (let key in csp){
        policyString = policyString + key + " " + csp[key] + ";"
    }
    return policyString;
}

app.use(Express.static('public'));

app.get("/google-url", function (req, res, next) {
    // res.send(urlGoogle());
});

app.get("/google-cb", async function (req, res, next) {
    let googleConsent = await getGoogleAccountFromCode(req.query.code);
    res.redirect('/pages/join-success.html');
    res.end();
});

server.listen(port, () => {console.log(`HTTP listener started on port ${port}`)});

