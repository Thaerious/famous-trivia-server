/**
 * Process command line arguments into an object.
 * Any character following a single dash gets a true value.
 * Any word following two dashes gets a true values unless it
 * is followed by a non-dash word, then it gets that value.
 */
function parseArgs(){
    const parsedFlags = {};
    const parsedArgs = [];

    let last = null;
    for (const arg of process.argv){
        if (arg.startsWith("--")){
            parsedFlags[arg.substr(2)] = true;
            last = arg.substr(2);
        }
        else if (arg.startsWith("-")){
            for (let c of [...arg.substr(1)]){
                parsedFlags[c] = true;
            }
            last = null;
        }
        else if (last !== null){
            parsedFlags[last] = arg;
            last = null;
        }
        else {
            parsedArgs.push(arg);
        }
    }
    
    return {
        flags : parsedFlags,
        args : parsedArgs
    }
}


export default parseArgs;