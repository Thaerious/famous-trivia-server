import fs from "fs";
import config from "./config.js";


/**
 * Remove all JIT script files.
 * Remove all EJS rendered files.
 * Remove all directories listed in config.clean_dir
 */
function clean(){
    if (fs.existsSync(config.server.jit_scripts)){
        fs.rmdirSync(config.server.jit_scripts, { recursive: true});
    }

    if (fs.existsSync(config.server.pre_ejs)){
        fs.rmdirSync(config.server.pre_ejs, { recursive: true});
    }

    for (let dir of config.clean_dir){
        if (fs.existsSync(dir)){
            fs.rmdirSync(dir, { recursive: true});
        }
    }
}

export default clean;