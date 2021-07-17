import GameModel from "./GameModel.js";

class MultipleChoiceModel {
    constructor(descriptionModel) {
        this.descriptionModel = descriptionModel;
        this.stateData = {
            style: GameModel.STYLE.MULTIPLE_CHOICE,
        };
    }

    /**
     * Set the state data for the specified question question.
     * @param col
     * @param row
     * @returns question text
     */
    setQuestionState() {
        Object.assign(this.stateData, {
            state: GameModel.STATES.QUESTION,
            question: this.descriptionModel.question
        });

        return this.stateData;
    }

    /**
     * Set the state showing the players the answers.
     * This hides the values (in/correct answers).
     * @param col
     * @param row
     * @returns question text
     */
    setAnswerState() {
        Object.assign(this.stateData, {
            'state': GameModel.STATES.ANSWER,
            'answers': this.descriptionModel.options
        });

        return this.stateData;
    }

    /**
     * Set the state revealing the correct answer to the player
     */
    setRevealState() {
        this.setAnswerState();
        Object.assign(this.stateData, {
            state: GameModel.STATES.REVEAL,
            'correct-answer': this.getAnswer()
        });
        return this.stateData;
    }

    getAnswer() {
        return parseInt(this.descriptionModel['correct-answer']);
    }

    /**
     * Retrieve an update with all information.
     */
   getUpdate() {
        return JSON.parse(JSON.stringify(this.stateData));
    }
}

export default MultipleChoiceModel;