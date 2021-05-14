import GameDescriptionModel from "./GameDescriptionModel.js";
const DOM = {/* see EditorPane.constructor */};

/**
 * Multiple Choice Answer State Controller
 */
class MCAnswerCtrl {
    static run(model, saveCB) {
        MCAnswerCtrl.model  = model;
        MCAnswerCtrl.saveCB = saveCB;

        DOM.menuDecreaseValue.hide();
        DOM.menuIncreaseValue.hide();
        DOM.multipleChoicePane.show();
        DOM.questionPane.hide();

        for (let i = 0; i < 6; i++) {
            DOM.multipleChoicePane.setText(i, model.answers[i]);
            DOM.multipleChoicePane.setChecked(i, model.values[i]);
        }

        DOM.multipleChoicePane.setBonus(model.bonus);

        DOM.triangleRight.addEventListener("click", MCAnswerCtrl.cleanup);
        DOM.triangleLeft.addEventListener("click", MCAnswerCtrl.cleanup);
        DOM.multipleChoicePane.addEventListener("answer-update", MCAnswerCtrl.textList);
        DOM.multipleChoicePane.addEventListener("value-update", MCAnswerCtrl.valueList);
        DOM.multipleChoicePane.addEventListener("bonus-update", MCAnswerCtrl.bonusList);
        DOM.buttonShowQuestion.addEventListener("click", MCAnswerCtrl.questList);

        DOM.buttonShowQuestion.show();
        DOM.buttonShowAnswer.show();
        DOM.buttonShowBoard.hide();

        DOM.buttonShowQuestion.enable();
        DOM.buttonShowAnswer.disable();
    }

    static textList(event) {
        console.log(event);
        let index = parseInt(event.detail.index);
        MCAnswerCtrl.model.answers[index] = event.detail.text;
        MCAnswerCtrl.saveCB();
    }

    static valueList(event) {
        let index = parseInt(event.detail.index);
        MCAnswerCtrl.model.values[index]= event.detail.value;
        MCAnswerCtrl.saveCB();
    }

    static bonusList(event){
        console.log(event);
        MCAnswerCtrl.model.bonus = event.detail.value;
        MCAnswerCtrl.saveCB();
    }

    static questList(event) {
        MCAnswerCtrl.saveCB();
        MCAnswerCtrl.cleanup();
        MCQuestionCtrl.run(MCAnswerCtrl.model, MCAnswerCtrl.saveCB);
        window.parameters.subtype = "question";
        pushParameters();
    }

    static cleanup() {
        DOM.multipleChoicePane.hide();
        DOM.multipleChoicePane.removeEventListener("answer-update", MCAnswerCtrl.textList);
        DOM.multipleChoicePane.removeEventListener("value-update", MCAnswerCtrl.valueList);
        DOM.multipleChoicePane.removeEventListener("bonus-update", MCAnswerCtrl.bonusList);
        DOM.buttonShowQuestion.removeEventListener("click", MCAnswerCtrl.questList);
        DOM.triangleRight.removeEventListener("click", MCAnswerCtrl.cleanup);
        DOM.triangleLeft.removeEventListener("click", MCAnswerCtrl.cleanup);
    }
}

/**
 * Multiple Choice Question State Controller
 */
class MCQuestionCtrl {
    static run(model, saveCB) {
        MCQuestionCtrl.model  = model;
        MCQuestionCtrl.saveCB = saveCB;

        DOM.menuDecreaseValue.hide();
        DOM.menuIncreaseValue.hide();

        DOM.questionPane.setText(model.question);
        DOM.gameBoard.hide();
        DOM.questionPane.show();

        DOM.triangleRight.addEventListener("click", MCQuestionCtrl.cleanup);
        DOM.triangleLeft.addEventListener("click", MCQuestionCtrl.cleanup);
        DOM.questionPane.addEventListener("text-update", MCQuestionCtrl.textList);
        DOM.buttonShowAnswer.addEventListener("click", MCQuestionCtrl.answerList);

        DOM.buttonShowAnswer.show();
        DOM.buttonShowQuestion.show();
        DOM.buttonShowAnswer.enable();
        DOM.buttonShowQuestion.disable();
        DOM.buttonShowBoard.hide();
    }

    static textList(event) {
        MCQuestionCtrl.model.question = event.detail.text;
        MCQuestionCtrl.saveCB();
    }

    static answerList() {
        MCQuestionCtrl.cleanup();
        MCAnswerCtrl.run(MCQuestionCtrl.model, MCQuestionCtrl.saveCB);
        window.parameters.subtype = "answer";
        pushParameters();
    }

    static cleanup() {
        DOM.questionPane.removeEventListener("text-update", MCQuestionCtrl.textList);
        DOM.buttonShowAnswer.removeEventListener("click", MCQuestionCtrl.answerList);
        DOM.triangleRight.removeEventListener("click", MCQuestionCtrl.cleanup);
        DOM.triangleLeft.removeEventListener("click", MCQuestionCtrl.cleanup);
        pushParameters();
    }
}

/**
 * Jeopardy Question & Answer State Controller
 */
class QuestionPaneCtrl {
    /**
     * @param model - the question model object
     * @param field - which model field to read/write from {'answer', 'question'}
     * @param saveCB - call this method to save the model
     */
    static run(field, model, saveCB, closeCB) {
        QuestionPaneCtrl.model   = model ?? QuestionPaneCtrl.model;
        QuestionPaneCtrl.field   = field ?? QuestionPaneCtrl.field;
        QuestionPaneCtrl.saveCB  = saveCB ?? QuestionPaneCtrl.saveCB;
        QuestionPaneCtrl.closeCB = closeCB ?? QuestionPaneCtrl.closeCB;

        DOM.menuDecreaseValue.show();
        DOM.menuIncreaseValue.show();

        DOM.questionPane.setText(QuestionPaneCtrl.model[QuestionPaneCtrl.field.substr(0, 1)]);
        DOM.questionPane.show();
        DOM.gameBoard.hide();

        DOM.questionPane.addEventListener("text-update", QuestionPaneCtrl.textList);
        DOM.buttonShowBoard.addEventListener("click", QuestionPaneCtrl.boardList);
        DOM.buttonShowQuestion.addEventListener(`click`, QuestionPaneCtrl.questionList);
        DOM.buttonShowAnswer.addEventListener(`click`, QuestionPaneCtrl.answerList);

        DOM.buttonShowBoard.show();
        DOM.buttonShowQuestion.show();
        DOM.buttonShowAnswer.show();

        if (field === 'answer'){
            DOM.buttonShowAnswer.disable();
            DOM.buttonShowQuestion.enable();
        } else {
            DOM.buttonShowAnswer.enable();
            DOM.buttonShowQuestion.disable();
        }
    }

    static textList(event) {
        QuestionPaneCtrl.model[QuestionPaneCtrl.field.substr(0, 1)] = event.detail.text;
        QuestionPaneCtrl.saveCB();
    }

    static boardList(event) {
        QuestionPaneCtrl.cleanup();
        QuestionPaneCtrl.closeCB();

        delete window.parameters.subtype;
        delete window.parameters.row;
        delete window.parameters.col;
        pushParameters();
    }

    static answerList(event) {
        QuestionPaneCtrl.cleanup();
        QuestionPaneCtrl.run('answer');

        window.parameters.subtype = "answer";
        pushParameters();
    }

    static questionList(vent) {
        QuestionPaneCtrl.cleanup();
        QuestionPaneCtrl.run('question');

        window.parameters.subtype = "question";
        pushParameters();
    }

    static cleanup() {
        DOM.questionPane.removeEventListener("text-update", QuestionPaneCtrl.textList);
        DOM.buttonShowBoard.removeEventListener("click", QuestionPaneCtrl.boardList);
        DOM.buttonShowAnswer.removeEventListener("click", QuestionPaneCtrl.answerList);
        DOM.buttonShowQuestion.removeEventListener("click", QuestionPaneCtrl.questionList);

        DOM.buttonShowBoard.hide();
        DOM.buttonShowAnswer.hide();
        DOM.buttonShowQuestion.hide();
    }
}

class EditorPane {
    constructor(model, fileOps, fileId) {
        this.model = model;
        this.fileOps = fileOps;
        this.fileId = fileId;
        this.DOM = DOM;

        DOM.multipleChoicePane = document.querySelector("#multiple-choice-compose");
        DOM.triangleRight = document.querySelector("#triangle-right");
        DOM.triangleLeft = document.querySelector("#triangle-left");
        DOM.roundLabel = document.querySelector("#round-number > .text");
        DOM.gameName = document.querySelector("#game-name");
        DOM.gameBoard = document.querySelector("#game-board");
        DOM.questionPane = document.querySelector("#question-pane");
        DOM.menu = document.querySelector("#menu");
        DOM.menuIncreaseValue = DOM.menu.querySelector("#menu-increase-value");
        DOM.menuDecreaseValue = DOM.menu.querySelector("#menu-decrease-value");
        DOM.buttonShowQuestion = document.querySelector("#show-question");
        DOM.buttonShowAnswer = document.querySelector("#show-answer");
        DOM.buttonShowBoard = document.querySelector("#show-board");

        DOM.buttonShowBoard.hide();
        DOM.buttonShowAnswer.hide();
        DOM.buttonShowQuestion.hide();

        DOM.menu.addEventListener("menu-download", ()=>{
            const json = JSON.stringify(this.model.gameModel, null, 2);
            const blob = new Blob([json], {type: "application/json"});
            const url = window.URL.createObjectURL(blob);
            const anchor = document.querySelector("#download-anchor");
            anchor.href = url;
            anchor.download = this.model.name;
            anchor.click();
        });

        DOM.menu.addEventListener("menu-move-right", ()=>{
            if (this.model.currentRound >= this.model.roundCount - 1) return;
            this.model.setRoundIndex(this.model.currentRound, this.model.currentRound + 1);
            this.model.incrementRound();
            this.updateView();
            this.onSave();
        });

        DOM.menu.addEventListener("menu-move-left", ()=>{
            if (this.model.currentRound <= 0) return;
            this.model.setRoundIndex(this.model.currentRound, this.model.currentRound - 1);
            this.model.decrementRound();
            this.updateView();
            this.onSave();
        });

        DOM.menu.addEventListener("menu-remove-round", ()=>{
            this.model.removeRound();
            this.updateTriangleView();
            this.onSave();
            this.updateView();
        });

        DOM.menu.addEventListener("menu-home-screen", ()=>{
            location.href = "host.ejs";
        });

        DOM.menu.addEventListener("menu-increase-value", ()=>{
            this.model.increaseValue();
            this.onSave();
            this.updateView();
        });

        DOM.menu.addEventListener("menu-decrease-value", ()=>{
            this.model.decreaseValue();
            this.onSave();
            this.updateView();
        });

        DOM.menu.addEventListener("menu-add-jeopardy", ()=>{
            this.model.addCategoryRound();
            this.updateView();
            this.onSave();
        });

        DOM.menu.addEventListener("menu-add-mc", ()=>{
            this.model.addMultipleChoiceRound();
            this.updateView();
            this.onSave();
        });

        DOM.triangleRight.addEventListener("click", () => {
            this.model.incrementRound();
            this.updateView();
        });

        DOM.triangleLeft.addEventListener("click", () => {
            this.model.decrementRound();
            this.updateView();
        });

        DOM.gameName.addEventListener("keypress", async (event) => {
            if (event.which === 13) {
                event.stopPropagation();
                event.preventDefault();
                document.body.focus();
                await this.rename(DOM.gameName.innerText);
                return false;
            }
        });

        DOM.gameName.addEventListener("blur", async (event) => {
            await this.rename(DOM.gameName.innerText);
        });

        // game-board change category text
        DOM.gameBoard.addEventListener("header-update", event => {
            let col = event.detail.col;
            this.model.getColumn(col).category = event.detail.value;
            this.onSave();
        });

        // game-board select cell
        DOM.gameBoard.addEventListener("cell-select", event => {
            let row = event.detail.row;
            let col = event.detail.col;
            this.hideNavigation();

            window.parameters.subtype = "question";
            window.parameters.row = row;
            window.parameters.col = col;
            pushParameters();

            QuestionPaneCtrl.run(
                'question',
                this.model.getCell(row, col),
                () => this.onSave(),
                () => this.updateView()
            );
        });

        if (window.parameters.round){
            this.model.setRound(window.parameters.round);
        } else {
            window.parameters.round = 0;
            pushParameters();
        }

        if (!window.parameters.type){
            this.updateView();
        }

        if (window.parameters.type === "jeopardy"){
            if (window.parameters.subtype === 'question'){
                const row = window.parameters.row;
                const col = window.parameters.col;
                QuestionPaneCtrl.run(
                    'question',
                    this.model.getCell(row, col),
                    () => this.onSave(),
                    () => this.updateView()
                );
            }
            else if (window.parameters.subtype === 'answer'){
                const row = window.parameters.row;
                const col = window.parameters.col;
                QuestionPaneCtrl.run(
                    'answer',
                    this.model.getCell(row, col),
                    () => this.onSave(),
                    () => this.updateView()
                );
            } else {
                this.updateView();
            }
        }
        else {
            if (window.parameters.subtype === 'answer'){
                MCAnswerCtrl.run(this.model.getRound(), () => this.onSave());
            }
            else if (window.parameters.subtype === 'question'){
                MCQuestionCtrl.run(this.model.getRound(), () => this.onSave());
            }
        }

        // if (window.parameters.mcstate){
        //     console.log(window.parameters.mcstate);
        //     if (window.parameters.mcstate === 'answer'){
        //         MCAnswerCtrl.run(this.model.getRound(), () => this.onSave());
        //     } else if (window.parameters.mcstate === 'question'){
        //         MCQuestionCtrl.run(this.model.getRound(), () => this.onSave());
        //     }
        // }
    }

    async rename(newName){
        this.model.name = newName;
        await this.fileOps.rename(this.fileId, newName + ".json");
        await this.onSave();
    }

    async onSave() {
        await this.fileOps.setBody(this.fileId, JSON.stringify(this.model.get(), null, 2));
    }

    hideNavigation() {
        DOM.triangleLeft.classList.add("hidden");
        DOM.triangleRight.classList.add("hidden");
    }

    updateView(model) {
        model = model ?? this.model;
        this.updateTriangleView();

        window.parameters.round = model.currentRound;
        pushParameters();

        DOM.questionPane.hide();
        DOM.gameBoard.hide();
        DOM.multipleChoicePane.hide();

        if (model.getRound().type === GameDescriptionModel.questionType.CATEGORY) this.jeopardyView(model);
        if (model.getRound().type === GameDescriptionModel.questionType.MULTIPLE_CHOICE) this.multipleChoiceView(model);
    }

    updateTriangleView() {
        DOM.triangleLeft.classList.remove("hidden");
        DOM.triangleRight.classList.remove("hidden");
        if (this.model.currentRound === 0) DOM.triangleLeft.classList.add("hidden");
        if (this.model.currentRound >= this.model.roundCount - 1) DOM.triangleRight.classList.add("hidden");
        DOM.roundLabel.textContent = "Round " + (this.model.currentRound + 1);
    }

    multipleChoiceView(model) {
        window.parameters.type = "mc";
        window.parameters.subtype = "question";
        pushParameters();

        MCQuestionCtrl.run(this.model.getRound(), () => this.onSave());
    }

    jeopardyView(model) {
        DOM.menuDecreaseValue.show();
        DOM.menuIncreaseValue.show();
        DOM.gameBoard.show();

        DOM.buttonShowAnswer.hide();
        DOM.buttonShowQuestion.hide();
        DOM.buttonShowBoard.hide();

        window.parameters.type = "jeopardy";
        delete window.parameters.subtype;
        pushParameters();

        for (let col = 0; col < 6; col++) {
            let column = model.getColumn(col);
            DOM.gameBoard.setHeader(col, column.category, column.fontSize);

            for (let row = 0; row < 5; row++) {
                DOM.gameBoard.setCell(row, col, column.cell[row].value);
                if (column.cell[row].q === "") DOM.gameBoard.setComplete(row, col, "false");
                else if (column.cell[row].a === "") DOM.gameBoard.setComplete(row, col, "partial");
                else DOM.gameBoard.setComplete(row, col, "true");
            }
        }
    }
}

module.exports = EditorPane;