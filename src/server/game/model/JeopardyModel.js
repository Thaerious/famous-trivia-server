import GameModel from "./GameModel";

class JeopardyModel {
    /**
     * @param parent the GameModel object that constructed this
     * @param model the JSON model of questions
     */
    constructor(parent, model) {
        this.parent = parent;
        this.model = model;
        this.spentPlayers = [];

        if (this.parent.players.length > 0) {
            this.spentPlayers = [this.parent.players[0].name];
            this.currentPlayer = this.parent.players[0].name;
        }

        /** matrix of which questions have already been answered **/
        this.spent = [];
        for (let col of this.model.column) {
            let cells = [];
            this.spent.push(cells);
            for (let cell of col.cell) {
                cells.push(false);
            }
        }

        this.stateData = {
            style: GameModel.STYLE.JEOPARDY,
            state: GameModel.STATES.BOARD,
            spent: this.spent
        };

        this.categories = [];
        this.values = [];

        for (let column of this.model.column) {
            this.categories.push({
                "text": column.category,
                "font-size": column.fontSize
            });
            let valueCol = [];
            this.values.push(valueCol);
            for (let cell of column.cell) {
                valueCol.push(cell.value);
            }
        }

        this.parent.addListener("player-added", (index, player)=>this.addPlayer(index, player));
    }

    addPlayer(index, player){
        if (index == 0){
            this.spentPlayers = [player.name];
            this.currentPlayer = player.name;
        }
    }

    isPlayerSpent(name) {
        return this.spentPlayers.indexOf(name) !== -1;
    }

    setPlayerSpent(name) {
        name = name ?? this.currentPlayer;
        if (!this.parent.hasPlayer(name)) return false;
        if (this.isPlayerSpent(name)) return false;
        this.spentPlayers.push(name);
        return true;
    }

    setCurrentPlayer(name) {
        if (!this.parent.hasPlayer(name)) return false;
        if (this.currentPlayer === name) return false;
        this.currentPlayer = name;
        return true;
    }

    clearCurrentPlayer() {
        if (this.currentPlayer === '') return false;
        this.currentPlayer = '';
        return true;
    }

    resetSpentAndCurrentPlayers() {
        if (this.parent.players.length > 0) {
            this.spentPlayers = [this.parent.players[0].name];
            this.currentPlayer = this.parent.players[0].name;
        }
    }

    /** return true if name is unspent and is a name*/
    hasPlayer(name) {
        if (!this.parent.hasPlayer(name)) return false;
        return this.isPlayerSpent(name) === false;
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    /**
     * return the number of unspent players.
     * @returns {*}
     */
    countUnspentPlayers() {
        return this.parent.players.length - this.spentPlayers.length;
    }

    hasUnspent() { // TODO TEST
        for (let col of this.spent) {
            for (let row of col) {
                if (!row) return true;
            }
        }
        return false;
    }

    isSpent(col, row) {
        [col, row] = this.checkTableBounds(col, row);
        return this.spent[col][row];
    }

    setSpent(col, row) {
        [col, row] = this.checkTableBounds(col, row);
        this.spent[col][row] = true;
    }

    /**
     * Set the state data for the specified question question.
     * @param col
     * @param row
     * @returns question text
     */
    setBoardState(col, row) {
        [col, row] = this.checkTableBounds(col, row);

        this.stateData = {
            style: GameModel.STYLE.JEOPARDY,
            state: GameModel.STATES.BOARD,
            spent: this.spent
        };

        return this.stateData;
    }

    /**
     * Set the state data for the specified question question.
     * @param col
     * @param row
     * @returns question text
     */
    setQuestionState(col, row) {
        [col, row] = this.checkTableBounds(col, row);

        this.stateData = {
            style: GameModel.STYLE.JEOPARDY,
            state: GameModel.STATES.QUESTION,
            col: col,
            row: row,
            type: this.getType(col, row),
            question: this.getQuestion(col, row),
            spent: this.spent
        };

        return this.stateData;
    }

    getQuestion(col, row) {
        [col, row] = this.checkTableBounds(col, row);
        return this.model.column[col].cell[row].q;
    }

    /**
     *
     * Set the game model state to "show answer".
     * The setQuestionState must be called first.
     * @param col
     * @param row
     * @returns game state update object
     */
    setRevealState(col, row) {
        [col, row] = this.checkTableBounds(col, row);

        this.setQuestionState(col, row);
        Object.assign(this.stateData, {
            state: GameModel.STATES.REVEAL,
            answer: this.getAnswer()
        });
        return this.stateData;
    }

    /**
     * Retrieve the answer for the current question.
     * If row and column are omitted, use the row/col from the
     * most recent previous getQuestion.
     * @param col
     * @param row
     * @returns game state update object
     */
    getAnswer(col, row) {
        [col, row] = this.checkTableBounds(col, row);
        return this.model.column[col].cell[row].a;
    }

    /**
     * Retrieve the point value for the specified question.
     * If row and column are omitted, use the row/col from the
     * most recent previous getQuestion.
     * @param col
     * @param row
     * @returns {*}
     */
    getValue(col, row) {
        [col, row] = this.checkTableBounds(col, row);
        return this.model.column[col].cell[row].value;
    }

    /**
     * Retrieve the question type
     * If row and column are omitted, use the row/col from the
     * most recent previous setQuestionState.
     * @param col
     * @param row
     * @returns game state update object
     */
    getType(col, row) {
        [col, row] = this.checkTableBounds(col, row);
        return this.model.column[col].cell[row].type;
    }

    getUpdate() {
        let r = Object.assign({}, this.stateData);
        r.spentPlayers = [];
        if (this.spentPlayers) {
            for (let p of this.spentPlayers) {
                r.spentPlayers.unshift(p);
            }
        }
        r.current_player = this.currentPlayer;
        r.categories = this.categories;
        r.values = this.values;
        return r;
    }

    checkTableBounds(col, row){
        col = col ?? this.stateData.col;
        row = row ?? this.stateData.row;

        if (col < 0 || col > 5) throw new Error(`Column out of range: ${col}`);
        if (row < 0 || row > 4) throw new Error(`Row out of range: ${row}`);
        return [col, row];
    }
}

export default JeopardyModel;