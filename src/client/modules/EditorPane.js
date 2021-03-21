const Model = require("./Model.js");
const DOM = {/* see EditorPane.constructor */};

class MCAnswerCtrl {
    static run(model, saveCB) {
        MCAnswerCtrl.model  = model;
        MCAnswerCtrl.saveCB = saveCB;

        DOM.multipleChoicePane.show();

        for (let i = 0; i < 6; i++) {
            DOM.multipleChoicePane.setText(i, model.answers[i].text);
            DOM.multipleChoicePane.setChecked(i, model.answers[i].isTrue);
        }

        DOM.triangleRight.addEventListener("click", MCAnswerCtrl.cleanup);
        DOM.triangleLeft.addEventListener("click", MCAnswerCtrl.cleanup);
        DOM.multipleChoicePane.addEventListener("text-update", MCAnswerCtrl.textList);
        DOM.multipleChoicePane.addEventListener("value-update", MCAnswerCtrl.valueList);
        DOM.multipleChoicePane.addEventListener("button-question", MCAnswerCtrl.questList);
    }

    static textList(event) {
        let index = parseInt(event.detail.index);
        MCAnswerCtrl.model.answers[index].text = event.detail.text;
        MCAnswerCtrl.saveCB();
    }

    static valueList(event) {
        let index = parseInt(event.detail.index);
        MCAnswerCtrl.model.answers[index].isTrue = event.detail.value;
        MCAnswerCtrl.saveCB();
    }

    static questList(event) {
        MCAnswerCtrl.saveCB();
        MCAnswerCtrl.cleanup();
        MCQuestionCtrl.run(MCAnswerCtrl.model, MCAnswerCtrl.saveCB);
    }

    static cleanup() {
        DOM.multipleChoicePane.hide();
        DOM.multipleChoicePane.removeEventListener("text-update", MCAnswerCtrl.textList);
        DOM.multipleChoicePane.removeEventListener("value-update", MCAnswerCtrl.valueList);
        DOM.multipleChoicePane.removeEventListener("button-question", MCAnswerCtrl.questList);
        DOM.triangleRight.removeEventListener("click", MCAnswerCtrl.cleanup);
        DOM.triangleLeft.removeEventListener("click", MCAnswerCtrl.cleanup);
    }
}

class MCQuestionCtrl {
    static run(model, saveCB) {
        MCQuestionCtrl.model  = model;
        MCQuestionCtrl.saveCB = saveCB;

        DOM.questionPane.setText(model.question);
        DOM.questionPane.show();
        DOM.questionPane.boardButton = false;
        DOM.questionPane.highlight('question')

        DOM.triangleRight.addEventListener("click", MCQuestionCtrl.cleanup);
        DOM.triangleLeft.addEventListener("click", MCQuestionCtrl.cleanup);
        DOM.questionPane.addEventListener("text-update", MCQuestionCtrl.textList);
        DOM.questionPane.addEventListener("button-answer", MCQuestionCtrl.answerList);
    }

    static textList(event) {
        MCQuestionCtrl.model.question = event.detail.text;
        MCQuestionCtrl.saveCB();
    }

    static answerList() {
        MCQuestionCtrl.cleanup();
        MCAnswerCtrl.run(MCQuestionCtrl.model, MCQuestionCtrl.saveCB);
    }

    static cleanup() {
        DOM.questionPane.hide();
        DOM.questionPane.removeEventListener("text-update", MCQuestionCtrl.textList);
        DOM.questionPane.removeEventListener("button-answer", MCQuestionCtrl.answerList);
        DOM.triangleRight.removeEventListener("click", MCQuestionCtrl.cleanup);
        DOM.triangleLeft.removeEventListener("click", MCQuestionCtrl.cleanup);
    }
}

class QuestionPaneCtrl {
    /**
     * @param model - the question model object
     * @param field - which model field to read/write from {'a', 'q'}
     * @param saveCB - call this method to save the model
     */
    static run(field, model, saveCB, closeCB) {
        QuestionPaneCtrl.model   = model ?? QuestionPaneCtrl.model;
        QuestionPaneCtrl.field   = field ?? QuestionPaneCtrl.field;
        QuestionPaneCtrl.saveCB  = saveCB ?? QuestionPaneCtrl.saveCB;
        QuestionPaneCtrl.closeCB = closeCB ?? QuestionPaneCtrl.closeCB;

        DOM.questionPane.setText(QuestionPaneCtrl.model[QuestionPaneCtrl.field]);
        DOM.questionPane.boardButton = true;
        DOM.questionPane.show();
        DOM.gameBoard.hide();

        DOM.questionPane.addEventListener("text-update", QuestionPaneCtrl.textList);
        DOM.questionPane.addEventListener("button-board", QuestionPaneCtrl.boardList);
        DOM.questionPane.addEventListener(`button-${QuestionPaneCtrl.field}`, QuestionPaneCtrl.questionList);
        DOM.questionPane.highlight(QuestionPaneCtrl.field);
    }

    static textList(event) {
        QuestionPaneCtrl.model[QuestionPaneCtrl.field] = event.detail.text;
        QuestionPaneCtrl.saveCB();
    }

    static boardList(event) {
        QuestionPaneCtrl.cleanup();
        QuestionPaneCtrl.closeCB();
    }

    static answerList(event) {
        QuestionPaneCtrl.cleanup();
        QuestionPaneCtrl.run('answer');
    }

    static questionList(vent) {
        QuestionPaneCtrl.cleanup();
        QuestionPaneCtrl.run('question');
    }

    static cleanup() {
        DOM.questionPane.removeEventListener("text-update", QuestionPaneCtrl.textList);
        DOM.questionPane.removeEventListener("button-board", QuestionPaneCtrl.boardList);
        DOM.questionPane.removeEventListener("button-answer", QuestionPaneCtrl.answerList);
        DOM.questionPane.removeEventListener("button-question", QuestionPaneCtrl.questionList);
    }
}

class EditorPane {
    constructor(model) {
        this.model = model;

        DOM.multipleChoicePane = document.querySelector("#multiple-choice-pane");
        DOM.triangleRight = document.querySelector("#triangle-right");
        DOM.triangleLeft = document.querySelector("#triangle-left");
        DOM.roundLabel = document.querySelector("#round-number");
        DOM.gameName = document.querySelector("#game-name");
        DOM.gameBoard = document.querySelector("#game-board");
        DOM.questionPane = document.querySelector("#question-pane")

        document.querySelector("#menu-remove-round").addEventListener("click", () => {
            this.model.removeRound();
            this.updateTriangleView();
            this.onSave();
            this.updateView();
        });

        document.querySelector("#menu-home-screen").addEventListener("click", () => {
            location.href = "home.html";
        });

        document.querySelector("#menu-value-plus").addEventListener("click", () => {
            this.model.increaseValue();
            this.onSave();
            this.updateView();
        });

        document.querySelector("#menu-value-minus").addEventListener("click", () => {
            this.model.decreaseValue();
            this.onSave();
            this.updateView();
        });

        DOM.triangleRight.addEventListener("click", () => {
            this.model.incrementRound();
            this.updateView();
        });

        DOM.triangleLeft.addEventListener("click", () => {
            this.model.decrementRound();
            this.updateView();
        });

        DOM.gameName.addEventListener("keydown", (event) => {
            if (event.which === 13) {
                this.updateName();
                event.stopPropagation();
                event.preventDefault();
                document.querySelector("#game-board-container").focus();
                return false;
            }
        });

        document.querySelector("#menu-add-category").addEventListener("click", () => {
            this.model.addCategoryRound();
            this.updateView();
            this.onSave();
        });

        document.querySelector("#menu-add-multiple-choice").addEventListener("click", () => {
            this.model.addMultipleChoiceRound();
            this.updateView();
            this.onSave();
        });

        // game-board change category text
        DOM.gameBoard.addEventListener("header-update", event => {
            let col = event.detail.col;
            this.model.getColumn(col).category = event.detail.value;
            this.model.getColumn(col).fontSize = event.detail.fontSize;
            this.onSave();
        });

        // game-board select cell
        DOM.gameBoard.addEventListener("cell-select", event => {
            let row = event.detail.row;
            let col = event.detail.col;
            this.hideNavigation();

            QuestionPaneCtrl.run(
                'question',
                this.model.getCell(row, col),
                () => this.onSave(),
                () => this.updateView()
            );
        });

        this.updateView();
    }

    onSave() {
        // override me
    }

    updateName() {
        // override me
    }

    hideNavigation() {
        DOM.triangleLeft.classList.add("hidden");
        DOM.triangleRight.classList.add("hidden");
    }

    updateView(model) {
        model = model ?? this.model;
        this.updateTriangleView();

        DOM.questionPane.hide();
        DOM.gameBoard.hide();
        DOM.multipleChoicePane.hide();

        if (model.getRound().type === Model.questionType.CATEGORY) this.categoryView(model);
        if (model.getRound().type === Model.questionType.MULTIPLE_CHOICE) this.multipleChoiceView(model);
    }

    updateTriangleView() {
        DOM.triangleLeft.classList.remove("hidden");
        DOM.triangleRight.classList.remove("hidden");
        if (this.model.currentRound === 0) DOM.triangleLeft.classList.add("hidden");
        if (this.model.currentRound >= this.model.roundCount - 1) DOM.triangleRight.classList.add("hidden");
        DOM.roundLabel.textContent = "Round " + (this.model.currentRound + 1);
    }

    multipleChoiceView(model) {
        MCQuestionCtrl.run(
            this.model.getRound(),
            () => this.onSave()
        );
    }

    categoryView(model) {
        DOM.gameBoard.show();

        for (let col = 0; col < 6; col++) {
            let column = model.getColumn(col);

            DOM.gameBoard.getHeader(col).fitText.lock = "vh";
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