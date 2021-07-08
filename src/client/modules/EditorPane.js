import emptyCategory from "../../json_schema/empty_categorical.js";
import emptyMC from "../../json_schema/empty_mulitple_choice.js";
import SCHEMA_CONSTANTS from "../../json_schema/schema_constants.js";

const DOM = {/* see EditorPane.constructor */};

/**
 * Multiple Choice Answer State Controller
 */
class MCAnswerCtrl {
    static run(model, saveCB) {
        MCAnswerCtrl.model = model;
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
        let index = parseInt(event.detail.index);
        MCAnswerCtrl.model.answers[index] = event.detail.text;
        MCAnswerCtrl.saveCB();
    }

    static valueList(event) {
        let index = parseInt(event.detail.index);
        MCAnswerCtrl.model.values[index] = event.detail.value;
        MCAnswerCtrl.saveCB();
    }

    static bonusList(event) {
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
        window.parameters.type = "mc";
        window.parameters.subtype = "question";
        pushParameters();

        MCQuestionCtrl.model = model;
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
class JeopardyCtrl {

    /**
     * @param model - the question model object
     * @param field - which model field to read/write from {'answer', 'question'}
     * @param saveCB - call this method to save the model
     * @param closeCB - call this method when controller is terminated.
     */
    static run(field, model, saveCB, closeCB) {
        JeopardyCtrl.model = model ?? JeopardyCtrl.model;
        JeopardyCtrl.field = field ?? JeopardyCtrl.field;
        JeopardyCtrl.saveCB = saveCB ?? JeopardyCtrl.saveCB;
        JeopardyCtrl.closeCB = closeCB ?? JeopardyCtrl.closeCB;

        DOM.menuDecreaseValue.show();
        DOM.menuIncreaseValue.show();

        DOM.questionPane.setText(JeopardyCtrl.model[JeopardyCtrl.field.substr(0, 1)]);
        DOM.questionPane.show();
        DOM.gameBoard.hide();

        DOM.questionPane.addEventListener("text-update", JeopardyCtrl.textList);
        DOM.buttonShowBoard.addEventListener("click", JeopardyCtrl.boardList);
        DOM.buttonShowQuestion.addEventListener(`click`, JeopardyCtrl.questionList);
        DOM.buttonShowAnswer.addEventListener(`click`, JeopardyCtrl.answerList);

        DOM.buttonShowBoard.show();
        DOM.buttonShowQuestion.show();
        DOM.buttonShowAnswer.show();

        if (field === 'answer') {
            DOM.buttonShowAnswer.disable();
            DOM.buttonShowQuestion.enable();
        } else {
            DOM.buttonShowAnswer.enable();
            DOM.buttonShowQuestion.disable();
        }
    }

    static textList(event) {
        JeopardyCtrl.model[JeopardyCtrl.field.substr(0, 1)] = event.detail.text;
        JeopardyCtrl.saveCB();
    }

    static boardList(event) {
        JeopardyCtrl.cleanup();
        JeopardyCtrl.closeCB();

        delete window.parameters.subtype;
        delete window.parameters.row;
        delete window.parameters.col;
        pushParameters();
    }

    static answerList(event) {
        JeopardyCtrl.cleanup();
        JeopardyCtrl.run('answer');

        window.parameters.subtype = "answer";
        pushParameters();
    }

    static questionList(vent) {
        JeopardyCtrl.cleanup();
        JeopardyCtrl.run('question');

        window.parameters.subtype = "question";
        pushParameters();
    }

    static cleanup() {
        DOM.questionPane.removeEventListener("text-update", JeopardyCtrl.textList);
        DOM.buttonShowBoard.removeEventListener("click", JeopardyCtrl.boardList);
        DOM.buttonShowAnswer.removeEventListener("click", JeopardyCtrl.answerList);
        DOM.buttonShowQuestion.removeEventListener("click", JeopardyCtrl.questionList);

        DOM.buttonShowBoard.hide();
        DOM.buttonShowAnswer.hide();
        DOM.buttonShowQuestion.hide();
    }
}

class JeopardyBoardCtrl {

    static run(model) {
        DOM.questionPane.hide();
        DOM.gameBoard.hide();
        DOM.multipleChoicePane.hide();

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

class EditorPane {
    constructor(gameDescriptionHelper, fileOps, fileId) {
        this.gameDescriptionHelper = gameDescriptionHelper;
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

        DOM.menu.addEventListener("menu-download", () => {
            const json = JSON.stringify(this.gameDescriptionHelper.get, null, 2);
            const blob = new Blob([json], {type: "application/json"});
            const url = window.URL.createObjectURL(blob);
            const anchor = document.querySelector("#download-anchor");
            anchor.href = url;
            anchor.download = this.gameDescriptionHelper.name;
            anchor.click();
        });

        DOM.menu.addEventListener("menu-move-right", () => {
            if (this.gameDescriptionHelper.currentRound >= this.gameDescriptionHelper.roundCount - 1) return;
            this.gameDescriptionHelper.setRoundIndex(this.gameDescriptionHelper.currentRound, this.gameDescriptionHelper.currentRound + 1);
            this.gameDescriptionHelper.incrementRound();
            this.updateView();
            this.onSave();
        });

        DOM.menu.addEventListener("menu-move-left", () => {
            if (this.gameDescriptionHelper.currentRound <= 0) return;
            this.gameDescriptionHelper.setRoundIndex(this.gameDescriptionHelper.currentRound, this.gameDescriptionHelper.currentRound - 1);
            this.gameDescriptionHelper.decrementRound();
            this.updateView();
            this.onSave();
        });

        DOM.menu.addEventListener("menu-remove-round", () => {
            this.gameDescriptionHelper.removeRound();
            this.updateTriangleView();
            this.onSave();
            this.updateView();
        });

        DOM.menu.addEventListener("menu-home-screen", () => {
            location.href = "host.ejs";
        });

        DOM.menu.addEventListener("menu-increase-value", () => {
            this.gameDescriptionHelper.increaseValue();
            this.onSave();
            this.updateView();
        });

        DOM.menu.addEventListener("menu-decrease-value", () => {
            this.gameDescriptionHelper.decreaseValue();
            this.onSave();
            this.updateView();
        });

        DOM.menu.addEventListener("menu-add-jeopardy", () => {
            this.gameDescriptionHelper.addRound(emptyCategory);
            this.updateView();
            this.onSave();
        });

        DOM.menu.addEventListener("menu-add-mc", () => {
            this.gameDescriptionHelper.addRound(emptyMC);
            this.updateView();
            this.onSave();
        });

        DOM.triangleRight.addEventListener("click", () => {
            this.gameDescriptionHelper.incrementRound();
            this.updateView();
        });

        DOM.triangleLeft.addEventListener("click", () => {
            this.gameDescriptionHelper.decrementRound();
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
            this.gameDescriptionHelper.getColumn(col).category = event.detail.value;
            this.gameDescriptionHelper.getColumn(col).fontSize = event.detail.fontSize;
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

            JeopardyCtrl.run(
                'question',
                this.gameDescriptionHelper.getCell(row, col),
                () => this.onSave(),
                () => this.updateView()
            );
        });

        this.loadURLState();
    }

    loadURLState(){

        if (window.parameters.round) {
            this.gameDescriptionHelper.setRound(window.parameters.round);
        } else {
            window.parameters.round = 0;
            pushParameters();
        }

        if (!window.parameters.type) {
            this.updateView();
        }

        if (window.parameters.type === "jeopardy") {
            if (window.parameters.subtype === 'question') {
                const row = window.parameters.row;
                const col = window.parameters.col;
                JeopardyCtrl.run(
                    'question',
                    this.gameDescriptionHelper.getCell(row, col),
                    () => this.onSave(),
                    () => this.updateView()
                );
            } else if (window.parameters.subtype === 'answer') {
                const row = window.parameters.row;
                const col = window.parameters.col;
                JeopardyCtrl.run(
                    'answer',
                    this.gameDescriptionHelper.getCell(row, col),
                    () => this.onSave(),
                    () => this.updateView()
                );
            } else {
                this.updateView();
            }
        } else {
            if (window.parameters.subtype === 'answer') {
                MCAnswerCtrl.run(this.gameDescriptionHelper.getRound(), () => this.onSave());
            } else if (window.parameters.subtype === 'question') {
                MCQuestionCtrl.run(this.gameDescriptionHelper.getRound(), () => this.onSave());
            }
        }
    }

    async rename(newName) {
        this.gameDescriptionHelper.name = newName;
        await this.fileOps.rename(this.fileId, newName + ".json");
        await this.onSave();
    }

    async onSave() {
        await this.fileOps.setBody(this.fileId, JSON.stringify(this.gameDescriptionHelper.get(), null, 2));
    }

    hideNavigation() {
        DOM.triangleLeft.classList.add("hidden");
        DOM.triangleRight.classList.add("hidden");
    }

    updateView(model) {
        model = model ?? this.gameDescriptionHelper;
        this.updateTriangleView();

        window.parameters.round = model.currentRound;

        if (model.getRound().type ===  SCHEMA_CONSTANTS.CATEGORY){
            JeopardyBoardCtrl.run(model);
        }
        if (model.getRound().type ===  SCHEMA_CONSTANTS.MULTIPLE_CHOICE){
            MCQuestionCtrl.run(this.gameDescriptionHelper.getRound(), () => this.onSave());
        }
    }

    updateTriangleView() {
        DOM.triangleLeft.classList.remove("hidden");
        DOM.triangleRight.classList.remove("hidden");
        if (this.gameDescriptionHelper.currentRound === 0) DOM.triangleLeft.classList.add("hidden");
        if (this.gameDescriptionHelper.currentRound >= this.gameDescriptionHelper.roundCount - 1) DOM.triangleRight.classList.add("hidden");
        DOM.roundLabel.textContent = "Round " + (this.gameDescriptionHelper.currentRound + 1);
    }
}

module.exports = EditorPane;