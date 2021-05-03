import FileOps from "./modules/FileOps.js";
import Authenticate from "./modules/Authenticate.js";
import Menu from "./nidgets/MenuContainer.js";
import QuestionPane from "./nidgets/QuestionPane.js";
import EditorPane from "./modules/EditorPane.js";
import Model from "./modules/Model";
const Nidget = require("@thaerious/nidget")

let fileOps = new FileOps();
let model = null;
let questionPane = null;
let editorPane = null;

window.onload = async () => {
    setup();
}

async function setup(){
    let start = new Date();

    parseURLParameters();
    new Menu().init("#menu");

    try {
        await new Authenticate().loadClient();
        await fileOps.loadClient();
    } catch (err) {
        console.log(err);
    }

    let file = await fileOps.get(window.parameters.fileId);
    let model = new Model(fileOps).set(JSON.parse(file.body));
    window.model = model;

    document.querySelector("#game-name").textContent = model.name;
    editorPane = new EditorPane(model, fileOps, window.parameters.fileId);
    editorPane.onSave = saveModel;
    window.editorPane = editorPane;

    let end = new Date();
    let time = end - start;
    console.log("Load Time " + time + " ms");
}

/**
 * Save the model to the google app data folder.
 */
function saveModel() {
    fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}

/**
 * Change the name of the file in google's app data folder.
 */
function renameModel() {
    let name = document.querySelector("#game-name").textContent;
    fileOps.rename(window.parameters.fileId, name + ".json");
    window.model.name = name;
    saveModel();
}

/**
 * Extract value from the URL string, store in 'window.parameters'.
 */
function parseURLParameters() {
    window.parameters = {};
    const parameters = window.location.search.substr(1).split("&");
    for (const parameter of parameters) {
        const split = parameter.split(/=/);
        window.parameters[split[0]] = split[1] ?? "";
    }
}