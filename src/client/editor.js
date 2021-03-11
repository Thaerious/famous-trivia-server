const FileOps = require("./modules/FileOps.js");
const Menu = require("./modules/Menu.js");
const QuestionPane = require("./modules/QuestionPane.js");
const EditorPane = require("./modules/EditorPane.js");

require("@thaerious/nidget")
require("./modules/GameBoard.js");

let fileOps = new FileOps();
let model = null;
let questionPane = null;

window.onload = async ()=> {
    window.menu = new Menu("#menu");
    parseURLParameters();

    try {
        await fileOps.loadClient();
        questionPane = new QuestionPane(()=>{
            fileOps.setBody(
                window.parameters.fileId, JSON.stringify(window.model.get(), null, 2)
            )
        });
    } catch (err) {
        console.log(err);
    }

    if (window.parameters.action === "new"){
        window.model = model = await new Model(fileOps).init();
        updateView(window.model);
        addListeners();

        try {
            let fp = await fileOps.create(window.parameters.dirId, "Game Name");
            await fileOps.setBody(fp.id, JSON.stringify(window.model.get(), null, 2));
            location.href = location.origin + "/editor.html?action=load&fileId=" + fp.id;
        } catch (err) {
            console.log(err);
        }
    }

    if (window.parameters.action === "load"){
        let file = await fileOps.get(window.parameters.fileId);
        let model = JSON.parse(file.body);
        window.model = model = new Model(fileOps).set(model);
        updateView(window.model);
        addListeners();
    }

    let editorPane = new EditorPane(window.model);
    editorPane.onSave = saveModel;
    editorPane.updateView = updateView;
}

function saveModel(){
    console.log(window.model.get());
    fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}

function parseURLParameters(){
    window.parameters = {};
    const parameters = window.location.search.substr(1).split("&");
    for (const parameter of parameters){
        const split = parameter.split(/=/);
        window.parameters[split[0]] = split[1] ?? "";
    }
}

function addListeners(){
    let gameBoard = document.getElementById("game-board");
    for (let col = 0; col < 6; col++){
        gameBoard.getHeader(col).addEventListener("input", headerChangeListener);
        gameBoard.getHeader(col).addEventListener("blur", headerFocusListener);

        for (let row = 0; row < 5; row++){
            gameBoard.getCell(row, col).addEventListener("click", ()=>{
                questionPane.showQuestion(window.model.getCell(row, col));
            });
        }
    }
}

function headerChangeListener(event){
    event.target.fitText.notify(1, 1);
    let col = parseInt(event.target.parentElement.getAttribute("data-col"));
    window.model.getColumn(col).category = event.target.text;
}

async function headerFocusListener(event){
    let col = parseInt(event.target.parentElement.getAttribute("data-col"));
    event.target.text = window.model.getColumn(col).category;
    window.model.getColumn(col).fontsize = event.target.style["font-size"];
    await fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}

function updateView(model){
    let gameBoard = document.getElementById("game-board");
    if (!gameBoard) throw new Error("Game board not found");
    model = model ?? window.model;

    let round = model.getRound();

    for (let col = 0; col < 6; col++){
        let column = model.getColumn(col);

        gameBoard.getHeader(col).initFitText("vh");
        gameBoard.setHeader(col, column.category);
        gameBoard.getHeader(col).fitText.delayResize(1, 1);

        for (let row = 0; row < 5; row++){
            gameBoard.setCell(row, col, column.cell[row].value);
        }
    }
}

class Model{
    init(){
        this.currentRound = 0;

        this.gameModel = {
            rounds : []
        };

        this.addRound();
        return this;
    }

    set(gameModel){
        this.currentRound = 0;
        this.gameModel = gameModel;
        return this;
    }

    get(){
        return this.gameModel;
    }
    
    getRound(index){
        index = index ?? this.currentRound;
        return this.gameModel.rounds[index];
    }

    getColumn(index){
        return this.getRound().column[index];
    }

    getCell(column, row){
        return this.getColumn(column).cell[row];
    }

    addRound(){
        let round = {
            type : "choice",
            column : []
        };

        for (let i = 0; i < 6; i++){
            round.column[i] = {
                category : "",
                cell : []
            }

            for (let j = 0; j < 5; j++){
                round.column[i].cell[j] = {
                    value : (j + 1) * 100,
                    type : "text",
                    q : "",
                    a : ""
                }
            }
        }

        this.gameModel.rounds.push(round);
        return round;
    }

    get roundCount(){
        return this.gameModel.rounds.length;
    }
}

