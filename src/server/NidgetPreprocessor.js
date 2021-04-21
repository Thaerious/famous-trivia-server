import fs from 'fs';
import {JSDOM} from 'jsdom';
import browserify from 'browserify';

class NidgetPreprocessor {
    constructor(modulePath) {
        this.modulePath = modulePath;
        this.knownNidgets = {};
    }

    setup(){
        let files = fs.readdirSync(this.modulePath);

        for (let file of files){
            const nidgetName = file.substr(0, file.length - 4);
            this.knownNidgets[nidgetName] = {
                dependencies: new Set()
            }
        }

        for (let nidget in this.knownNidgets){
            this.knownNidgets[nidget].dependencies.add(nidget);
            let filePath = this.modulePath + "/" + nidget + ".ejs";
            this.seekDependencies(filePath, this.knownNidgets[nidget].dependencies);
        }

        return this;
    }

    getDependencies(filePath){
        const fileString = fs.readFileSync(filePath);
        const dom = new JSDOM(fileString);

        let includes = new Set();
        for (let nidget in this.knownNidgets){
            if (dom.window.document.querySelector(nidget)){
                for(const dependent of this.knownNidgets[nidget].dependencies) {
                    includes.add(dependent);
                }
            }
        }
        return includes;
    }

    /**
     * Get all dependencies from a nidget ejs file.
     * Adds any dependencies in the data-include attribute of the template (comma or space delimited).
     * Then searches for any tag-names that match any .ejs files in views/nidgets.
     * @param filename
     */
    seekDependencies(filePath, set){
        const fileString = fs.readFileSync(filePath);
        const htmlString = `<html><body>${fileString}</body></html>`;
        const dom = new JSDOM(htmlString);

        for (let nidget in this.knownNidgets){
            if (set.has(nidget)) continue;

            const template = dom.window.document.querySelector(`template`);

            let includes = template.getAttribute("data-include") ?? "";
            let split = includes.split(/[ ,]+/g);
            for (let s of split) if (s.trim() != "") set.add(s.trim());

            if (template.content.querySelector(nidget)){
                set.add(nidget);
                let childFilePath = this.modulePath + "/" + nidget + ".ejs";
                this.seekDependencies(childFilePath, set);
            }
        }
    }
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