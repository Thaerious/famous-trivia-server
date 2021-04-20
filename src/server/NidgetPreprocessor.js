import fs from 'fs';
import {JSDOM} from 'jsdom';
import browserify from 'browserify';

class NidgetPreprocessor {
    constructor(filepath) {
        this.sourcePath = filepath;
        this.knownNidgets = {};
    }

    async setup(){
        let files = fs.readdirSync(this.sourcePath);

        for (let file of files){
            const nidgetName = file.substr(0, file.length - 4);
            this.knownNidgets[nidgetName] = {
                dependencies: new Set(),
                script: await this.getScript(getScriptName(nidgetName))
            }
        }

        for (let nidget in this.knownNidgets){
            this.seekDependencies(nidget, this.knownNidgets[nidget].dependencies);
        }

        // console.log(this.knownNidgets);
    }

    /**
     * Get all dependencies from a nidget ejs file.
     * @param filename
     */
    seekDependencies(parent, set){
        const filePath = this.sourcePath + "/" + parent + ".ejs";
        const fileString = fs.readFileSync(filePath);
        const htmlString = `<html><body>${fileString}</body></html>`;
        const dom = new JSDOM(htmlString);

        set.add(parent);

        for (let nidget in this.knownNidgets){
            if (set.has(nidget)) continue;

            const template = dom.window.document.querySelector(`template`);
            if (template.content.querySelector(nidget)){
                set.add(nidget);
                this.seekDependencies(nidget, set);
            }
        }
    }

    process(filePath) {
        const fileString = fs.readFileSync(filePath);
        const dom = new JSDOM(fileString);

        let includes = [];
        for (let nidget in this.knownNidgets){
            if (dom.window.document.querySelector(nidget)){
                includes.push(nidget);
            }
        }

        for (let include of includes){
            dom.window.document.head.innerHTML =
                dom.window.document.head.innerHTML +
                `\n<%- include('../nidgets/${include}.ejs'); %>\n`


            dom.window.document.body.innerHTML =
                dom.window.document.body.innerHTML +
                `<script>${this.knownNidgets[include].script}</script>`;
        }

        let returnValue = dom.window.document.documentElement.outerHTML;
        returnValue = returnValue.replaceAll("&lt;%=", "<%=");
        returnValue = returnValue.replaceAll("&lt;%-", "<%-");
        returnValue = returnValue.replaceAll("%&gt;", "%>");

        return returnValue;
    }

    async getScript(filepath){
        let b = browserify(filepath);
        b.transform("babelify");
        return await streamToString(b.bundle());
    }
}

function streamToString (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

function getScriptName(nidget){
    if (fs.existsSync(NidgetPreprocessor.settings.MODULE_SCRIPT_PATH + nidget + ".js")){
        return NidgetPreprocessor.settings.MODULE_SCRIPT_PATH + nidget + ".js";
    }

    let split = nidget.split("-");
    for (let i = 0; i < split.length; i++) {
        split[i] = split[i].charAt(0).toUpperCase() + split[i].slice(1);
    }

    if (fs.existsSync(NidgetPreprocessor.settings.MODULE_SCRIPT_PATH + (split.join('')) + ".js")){
        return NidgetPreprocessor.settings.MODULE_SCRIPT_PATH + (split.join('')) + ".js";
    }

    throw new Error("Nidget Script File Not Found:" + nidget);
}

NidgetPreprocessor.settings = {
    MODULE_SCRIPT_PATH : "./src/client/modules/"
};


export default NidgetPreprocessor;