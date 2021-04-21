import fs from "fs";
import browserify from "browserify";

class JITBrowserify {
    constructor(nidgetPreprocessor) {
        this.nidgetPreprocessor = nidgetPreprocessor;
    }

    get middleware() {
        return async (req, res, next) => {
            this.run(req, res, next);
        }
    }

    run(req, res, next){
        let path = req.path.slice(5);
        let name = path.substr(0, path.length - 3);

        res.setHeader('Content-Type', 'text/javascript');
        let filepath = './src/client/'+ path;
        let b = browserify(filepath, {debug : true});

        let dependencies = this.nidgetPreprocessor.getDependencies("./views/pages/"+ name + ".ejs");

        for (let dep of dependencies) {
            let path = getScriptPath("./src/client/modules/", dep);
            b.add(path);
        }

        b.transform("babelify");
        b.bundle().pipe(res);
    }
}

/**
 * Look for scipts in '-' or CamelCase.
 * @param nidget
 * @returns {string}
 */
function getScriptPath(root, name){
    if (fs.existsSync(root + name + ".js")){
        return root + name + ".js";
    }

    let split = name.split("-");
    for (let i = 0; i < split.length; i++) {
        split[i] = split[i].charAt(0).toUpperCase() + split[i].slice(1);
    }

    if (fs.existsSync(root + (split.join('')) + ".js")){
        return root + (split.join('')) + ".js";
    }

    throw new Error("Nidget Script File Not Found:" + root + ", " + name);
}

export default JITBrowserify;