import Express from 'express';
import http from 'http';
import helmet from 'helmet';
import cookieParser from "cookie-parser";
import UserAgent from 'express-useragent';

const port = 8000;
const app = Express();
const server = http.createServer(app);

app.use(helmet()); // automatic security settings
app.use(UserAgent.express()); // use to determine what the connection is using (phone,browser etc)

function catchDesignPage(req, res, next) {
    let csp = extractCSP(res);
    csp["default-src"] = "'self' *.google.com *.googleapis.com 'unsafe-inline'";
    csp["style-src"] = "'self' *.google.com 'unsafe-inline'";
    delete csp["script-src"];
    delete csp["script-src-attr"];
    res.set("Content-Security-Policy", concatCSP(res, csp));
    next();
}

/**
 * Extract Content Security Policy from header
 * @param res
 * @returns {{}}
 */
function extractCSP(res){
    let csp = res.get("Content-Security-Policy").split(";");
    let dict = {};

    for (let policy of  csp) {
        let kv = policy.split(/ /);
        dict[kv[0]] = kv[1] ?? "";
    }

    return dict;
}

/**
 * Prepare Content Security Policy for header.
 * @param res
 * @param csp
 * @returns {string}
 */

function concatCSP(res, csp){
    let policyString = "";
    for (let key in csp){
        policyString = policyString + key + " " + csp[key] + ";"
    }
    return policyString;
}

app.use("/home.html", catchDesignPage);
app.use("/editor.html", catchDesignPage);
app.use(Express.static('public'));

server.listen(port, () => {console.log(`HTTP listener started on port ${port}`)});

