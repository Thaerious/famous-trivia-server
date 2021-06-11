// noinspection SpellCheckingInspection

import fs from 'fs';
import browserify from 'browserify';
import constants from '../../constants.js';
import Path from 'path';
import config from "../../config.js";
import ejs from "ejs";

class JITBrowserify {
    constructor(nidgetPreprocessor) {
        this.nidgetPreprocessor = nidgetPreprocessor;
    }

    get middleware() {
        return async (req, res, next) => {
            try {
                await this.run(req, res, next);
            }catch(err){
                console.log(err.toString());
            }
        }
    }

    /**
     * Create a browserified .js file on demand.
     * The source path is determined from the path in the request header.
     *
     * @param req
     * @param res
     * @param next
     */
    async run(req, res, next) {
        let path = req.path.slice(5);
        let name = path.substr(0, path.length - 3);

        res.setHeader('Content-Type', 'text/javascript');
        let jsFilePath = './src/client/' + path;
        let htmlFilePath = './views/pages/' + name + '.ejs';

        await this.syncBrowserify(jsFilePath, htmlFilePath, res);
    }

    /**
     * Browserify the file found at 'jsFilePath'.
     * Add any dependencies found in 'htmlFilePath'.
     * @param filepath
     * @returns {Readable}
     */
    doBrowserify(jsFilePath, htmlFilePath){
        const b = browserify(jsFilePath, {debug: true});

        if (htmlFilePath){
            const dependencies = this.nidgetPreprocessor.getDependencies(htmlFilePath);
            for (let dep of dependencies) {
                let path = getScriptPath(constants.nidgets.SCRIPT_PATH, dep);
                b.add(path);
            }
        }

        b.transform('babelify');
        const rs = b.bundle();
        return rs;
    }

    async syncBrowserify(jsFilePath, htmlFilePath, outStream){
        return new Promise((resolve, reject) => {
            const rs = this.doBrowserify(jsFilePath, htmlFilePath);

            rs.on('error', err => {
                if (this?.emit) this.emit('end'); // end this stream
                reject(err);
            });
            rs.on('end', ()=>resolve());

            rs.pipe(outStream);
        });
    }

    /**
     * Create HTML and JS files from EJS and Browserify.
     * @param nidgetPreprocessor
     * @returns {Promise<void>}
     */
    static async render(nidgetPreprocessor){
        let files = fs.readdirSync(config.server.ejs_root);
        let jit = new JITBrowserify(nidgetPreprocessor);

        if (!fs.existsSync(config.server.jit_scripts)){
            fs.mkdirSync(config.server.jit_scripts);
        }

        if (!fs.existsSync(config.server.pre_ejs)){
            fs.mkdirSync(config.server.pre_ejs);
        }

        for (let filename of files) {
            let nidgetDependencies = nidgetPreprocessor.getTemplateDependencies(config.server.ejs_root + filename);
            await JITBrowserify.renderEJS(filename, nidgetDependencies);
            await JITBrowserify.renderJS(jit, filename, nidgetDependencies);
        }
    }

    static async renderEJS(filename, nidgetDependencies){
        ejs.renderFile(
            Path.join(config.server.ejs_root, filename),
            {
                filename: Path.basename(filename.slice(0, -4)),
                nidgets : nidgetDependencies
            },
            (err, str)=>{
                if (err) console.log(err);
                fs.writeFileSync(Path.join(config.server.pre_ejs, filename.slice(0, -4) + ".ejs"), str);
            }
        );
    }

    static async renderJS(jit, filename, nidgetPreprocessor){
        const name = filename.substr(0, filename.length - 4);
        const jsFilePath = config.server.client_path + name + ".js";
        const htmlFilePath = config.server.ejs_root + name + ".ejs";
        const outfile = Path.join(config.server.jit_scripts, name + ".js");

        const stream = fs.createWriteStream(outfile);
        stream.write("// generated by JITBrowserify on " + new Date().toLocaleString() + "\n");
        try {
            await jit.syncBrowserify(jsFilePath, htmlFilePath, stream);
        } catch (err){
            console.log(err.toString());
        }
    }
}

/**
 * Look for scipts in '-' or CamelCase.
 * @param nidget
 * @returns {string}
 */
function getScriptPath(root, name) {
    // look for .js file with exact name of html element (element-name.js).
    let baseCase = Path.join(root, name + '.js');
    if (fs.existsSync(baseCase)) {
        return baseCase;
    }

    // look for .js file with camelcase name of html element (ElementName.js).
    let split = name.split('-');
    for (let i = 0; i < split.length; i++) {
        split[i] = split[i].charAt(0).toUpperCase() + split[i].slice(1);
    }
    let camelCase = Path.join(root, (split.join('')) + '.js');
    if (fs.existsSync(camelCase)) {
        return camelCase;
    }

    throw new Error('Nidget Script File Not Found:' + root + ', ' + name);
}

export default JITBrowserify;