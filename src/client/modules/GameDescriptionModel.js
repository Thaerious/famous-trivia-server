/**
 * Game Description Model
 *
 * The model represents a set of game questions.
 * This is not a game in action, thus has no player information.
 * For a the game instance model, see GameModel.
 */

class GameDescriptionModel {
    init(name = "Game Name") {
        this.currentRound = 0;

        this.gameModel = {
            name: name,
            rounds: []
        };

        this.addCategoryRound();
        return this;
    }

    set name(string) {
        this.gameModel.name = string;
    }

    get name() {
        return this.gameModel.name;
    }

    set(gameModel) {
        this.currentRound = 0;
        this.gameModel = gameModel;
        return this;
    }

    get() {
        return this.gameModel;
    }

    toJSON(){
        return JSON.stringify(this.get, null, 2);
    }

    getRound(index) {
        index = index ?? this.currentRound;
        return this.gameModel.rounds[index];
    }

    setRoundIndex(from, to){
        let r = this.gameModel.rounds;
        if (r.length <= 1) return;
        [r[from], r[to]] = [r[to], r[from]];
    }

    getColumn(index) {
        return this.getRound().column[index];
    }

    getCell(row, column) {
        return this.getColumn(column).cell[row];
    }

    removeRound() {
        if (this.roundCount === 1) return;
        this.gameModel.rounds.splice(this.currentRound, 1);
        if (this.currentRound >= this.roundCount) this.currentRound = this.roundCount - 1;
    }

    addMultipleChoiceRound(){
        let round = {
            type: GameDescriptionModel.questionType.MULTIPLE_CHOICE,
            question : "",
            answers : ["", "", "", "", "", ""],
            values : ["false", "false", "false", "false", "false", "false"],
            bonus : 0
        };

        this.gameModel.rounds.push(round);
        return round;
    }

    addCategoryRound() {
        let round = {
            type: GameDescriptionModel.questionType.CATEGORY,
            column: []
        };

        for (let i = 0; i < 6; i++) {
            round.column[i] = {
                category: "",
                cell: []
            }

            for (let j = 0; j < 5; j++) {
                round.column[i].cell[j] = {
                    value: (j + 1) * 100,
                    type: "text",
                    q: "",
                    a: ""
                }
            }
        }

        this.gameModel.rounds.push(round);
        return round;
    }

    get roundCount() {
        return this.gameModel.rounds.length;
    }

    setRound(value){
        this.currentRound = value;
        if (this.currentRound < 0) this.currentRound = 0
        if (this.currentRound >= this.roundCount) this.currentRound = this.roundCount - 1;
    }

    incrementRound(){
        this.currentRound++;
        if (this.currentRound >= this.roundCount) this.currentRound = this.roundCount - 1;
    }

    decrementRound(){
        this.currentRound--;
        if (this.currentRound < 0) this.currentRound = 0
    }

    increaseValue() {
        let round = this.getRound();

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                round.column[i].cell[j].value *= 2;
            }
        }
    }

    decreaseValue() {
        let round = this.getRound();

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                round.column[i].cell[j].value /= 2;
            }
        }
    }
}

GameDescriptionModel.questionType = {
    CATEGORY : "categorical",
    MULTIPLE_CHOICE : "multiple_choice"
};

export default GameDescriptionModel;