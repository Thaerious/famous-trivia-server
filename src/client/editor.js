const FileOps = require("./modules/FileOps.js");
const Menu = require("./modules/Menu.js");
const QuestionPane = require("./modules/QuestionPane.js");
const EditorPane = require("./modules/EditorPane.js");
const Model = require("./modules/Model");

require("@thaerious/nidget")
require("./modules/GameBoard.js");

let fileOps = new FileOps();
let model = null;
let questionPane = null;
let editorPane = null;

window.onload = async () => {
    window.menu = new Menu("#menu");
    parseURLParameters();

    try {
        await fileOps.loadClient();
        questionPane = new QuestionPane();
    } catch (err) {
        console.log(err);
    }

    if (window.parameters.action === "load") {
        let file = await fileOps.get(window.parameters.fileId);
        let model = JSON.parse(file.body);
        window.model = model = new Model(fileOps).set(model);
    }

    document.querySelector("#game-name").textContent = window.model.name;
    editorPane = new EditorPane(window.model);
    editorPane.onSave = saveModel;
    questionPane.onSave = saveModel;
    questionPane.onClose = () => editorPane.updateView();
    editorPane.updateName = renameModel;
    editorPane.updateView();

    document.querySelector("game-board").setQuestionPane(questionPane);
    document.querySelector("game-board").setEditorPane(editorPane);
}

function saveModel() {
    fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}

function renameModel() {
    let name = document.querySelector("#game-name").textContent;
    fileOps.rename(window.parameters.fileId, name + ".json");
    window.model.name = name;
    saveModel();
}

function parseURLParameters() {
    window.parameters = {};
    const parameters = window.location.search.substr(1).split("&");
    for (const parameter of parameters) {
        const split = parameter.split(/=/);
        window.parameters[split[0]] = split[1] ?? "";
    }
}