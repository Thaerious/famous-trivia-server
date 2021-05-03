import fs from "fs";
import browserify from "browserify";
import constants from "./constants.js";
import Path from "path";

class JITBrowserify {
    constructor(nidgetPreprocessor) {
        this.nidgetPreprocessor = nidgetPreprocessor;
    }

    get middleware() {
        return async (req, res, next) => {
            this.run(req, res, next);
        }
    }

    run(req, res, next) {
        let path = req.path.slice(5);
        let name = path.substr(0, path.length - 3);

        res.setHeader('Content-Type', 'text/javascript');
        let filepath = './src/client/' + path;

        let b = browserify(filepath, {debug: true});
        let dependencies = this.nidgetPreprocessor.getDependencies("./views/pages/" + name + ".ejs");

        for (let dep of dependencies) {
            let path = getScriptPath(constants.nidgets.SCRIPT_PATH, dep);
            b.add(path);
        }

        b.transform("babelify");
        b.bundle()
            .on('error', function (err) {
                console.log(err.message);
                this.emit('end'); // end this stream
            })
            .pipe(res);
    }
}

/**
 * Look for scipts in '-' or CamelCase.
 * @param nidget
 * @returns {string}
 */
function getScriptPath(root, name) {
    // look for .js file with exact name of html element (element-name.js).
    let baseCase = Path.join(root, name + ".js");
    if (fs.existsSync(baseCase)) {
        return baseCase;
    }

    // look for .js file with camelcase name of html element (ElementName.js).
    let split = name.split("-");
    for (let i = 0; i < split.length; i++) {
        split[i] = split[i].charAt(0).toUpperCase() + split[i].slice(1);
    }
    let camelCase = Path.join(root, (split.join('')) + ".js");
    if (fs.existsSync(camelCase)) {
        return camelCase;
    }

    throw new Error("Nidget Script File Not Found:" + root + ", " + name);
}

export default JITBrowserify;