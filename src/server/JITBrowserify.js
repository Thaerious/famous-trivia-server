// noinspection SpellCheckingInspection

import fs from 'fs';
import browserify from 'browserify';
import constants from '../constants.js';
import Path from 'path';

class JITBrowserify {
    constructor(nidgetPreprocessor) {
        this.nidgetPreprocessor = nidgetPreprocessor;
    }

    get middleware() {
        return async (req, res, next) => {
            this.run(req, res, next);
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
    run(req, res, next) {
        let path = req.path.slice(5);
        let name = path.substr(0, path.length - 3);

        res.setHeader('Content-Type', 'text/javascript');
        let jsFilePath = './src/client/' + path;
        let htmlFilePath = './views/pages/' + name + '.ejs';
        
        this.browserify(jsFilePath, htmlFilePath)
            .on('error', err => {
                this.emit('end'); // end this stream
                reject(err);
            })
            .pipe(res);
    }

    /**
     * Browserify the file found at 'filepath'
     * @param filepath
     * @returns {Readable}
     */
    browserify(jsFilePath, htmlFilePath){
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
            const rs = this.browserify(jsFilePath, htmlFilePath);

            rs.on('error', err => {
                if (this?.emit) this.emit('end'); // end this stream
                reject(err);
            });
            rs.on('end', ()=>resolve());

            rs.pipe(outStream);
        });
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