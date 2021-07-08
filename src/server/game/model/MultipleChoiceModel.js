import GameModel from "./GameModel";

class MultipleChoiceModel {
    constructor(model) {
        this.model = model;
        this.stateData = {
            style: GameModel.STYLE.MULTIPLE_CHOICE,
        };
        this.setQuestionState();
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
            question: this.model.question
        });

        return this.state;
    }

    getAnswers() {
        return [...this.model.answers];
    }

    getValues() {
        return [...this.model.values];
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
            state: GameModel.STATES.ANSWER,
            answers: this.getAnswers(),
            bonus: this.model.bonus
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
            values: this.getValues(),
            bonus: this.model.bonus
        });
        return this.stateData;
    }

    getUpdate() {
        return JSON.parse(JSON.stringify(this.stateData));
    }
}

export default MultipleChoiceModel;