const FileOps = require("./modules/FileOps.js");
const Authenticate = require("./modules/Authenticate.js");
const Menu = require("./modules/Menu.js");
const QuestionPane = require("./modules/QuestionPane.js");
const EditorPane = require("./modules/EditorPane.js");
const Model = require("./modules/Model");

const Nidget = require("@thaerious/nidget")
require("./modules/GameBoard.js");
require("./modules/MultipleChoicePane.js");
require("./modules/CheckBox.js");

let fileOps = new FileOps();
let model = null;
let questionPane = null;
let editorPane = null;

window.onload = async () => {
    setTimeout(setup, 2000);
}

async function setup(){
    await Nidget.NidgetElement.loadTemplateSnippet("snippets/check-box.html", "check-box");
    await Nidget.NidgetElement.loadTemplateSnippet("snippets/multiple-choice-pane.html", "multiple-choice-pane");
    await Nidget.NidgetElement.loadTemplateSnippet("snippets/game-board.html", "game-board");
    await Nidget.NidgetElement.loadTemplateSnippet("snippets/question-pane.html", "question-pane");

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
    editorPane = new EditorPane(model);
    editorPane.onSave = saveModel;
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