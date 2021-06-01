import fs from 'fs';

class EndOfGame {
    constructor(parent) {
        this.parent = parent;

        this.stateData = {
            style: GameModel.STYLE.END_OF_GAME,
            players: parent.players
        }
    }

    getUpdate() {
        return {
            style: GameModel.STYLE.END_OF_GAME,
            players: this.parent.players
        }
    }
}

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
        console.log("addPlayer", index);
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

    hasCurrentPlayer() {
        return this.currentPlayer !== '';
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

    get state() {
        return Object.assign({}, this.stateData);
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

class GameModel {
    constructor(model) {
        this.model = model;
        this._players = []; // name, score, enabled
        this.listeners = {};
        if (model) this.setupRounds();
    }

    addListener(event, cb){
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(cb);
    }

    dispatchEvent(event, ...argList){
        if (!this.listeners[event]) return;
        for (const list of this.listeners[event]){
            list(...argList);
        }
    }

    setupRounds(){
        this.rounds = [];
        this.roundIndex = -1;

        for(let roundModel of this.model.rounds){
            if (roundModel.type === "multiple_choice") {
                this.rounds.push(new MultipleChoiceModel(roundModel));
            } else if (roundModel.type === "choice") {
                this.rounds.push(new JeopardyModel(this, roundModel));
            }
        }

        this.rounds.push(new EndOfGame(this));
    }

    static fromJSON(json) {
        if (typeof json === "string") {
            json = JSON.parse(json);
        }

        let gameModel = new GameModel()
        Object.assign(gameModel, json);

        this.setupRounds();

        return gameModel;
    }

    /**
     * Return a new object that is intended to be sent to the client.
     * This object will be used to update the client view.
     * @returns {{players: []}}
     */
    getUpdate() {
        let result = {
            players: this._players
        }
        if (this.getRound()) {
            result.round = this.getRound().getUpdate()
        }
        return result;
    }

    /**
     * Get the current round or the round by index.
     * Setting the index value to a new index will create a new round instance.
     * Otherwise it will return the previous one.
     * @param index
     * @returns {*}
     */
    getRound(index) {
        index = index ?? this.roundIndex;
        return this.rounds[index];
    }

    /**
     * Set the currently active round by index.
     * @param value
     * @return current round object.
     */
    setRound(index) {
        if (index < 0 || index > this.model.rounds.length) return this.getRound();
        this.roundIndex = index;
        return this.getRound();
    }

    nextRound() {
        return this.setRound(this.roundIndex + 1);
    }

    prevRound() {
        return this.setRound(this.roundIndex - 1);
    }

    /**
     * Add a new player to the model
     * If the name already exists, make no change
     * @param name
     * @returns the added player
     */
    addPlayer(name) {
        if (this.hasPlayer(name)) {
            return this.getPlayer(name);
        }

        const player = {
            name: name,
            score: 0,
            enabled: true
        };

        this._players.push(player);
        this.dispatchEvent("player-added", this._players.length - 1, player);
        return player;
    }

    disablePlayer(name) {
        if (!this.hasPlayer(name)) return;
        this.getPlayer(name).enabled = false;
    }

    enablePlayer(name) {
        if (!this.hasPlayer(name)) return;
        this.getPlayer(name).enabled = true;
    }

    isEnabled(name) {
        if (!this.hasPlayer(name)) return;
        return this.getPlayer(name).enabled;
    }

    /**
     * Get a non-reflective list of players.
     * @returns {*[]}
     */
    get players() {
        return [...this._players];
    }

    /**
     * Retrieve the active player object.
     * @returns {null|*}
     */
    get activePlayer() {
        if (this._players.length === 0) return null;
        return this._players[0];
    }

    /**
     * Retrieve a player by name or null.
     * This is reflective, changes are kept.
     * @param name
     * @returns {null|*}
     */
    getPlayer(name) {
        for (let player of this._players) if (player.name === name) return player;
        return null;
    }

    hasPlayer(name) {
        return this.getPlayer(name) !== null;
    }

    /**
     * Set the current player choosing the question.
     * Setting active player out of range will set it to -1
     * Returns, JSON object to broadcast
     */
    setActivePlayer(name) {
        let player = this.getPlayer(name);
        let index = this._players.indexOf(player);
        if (index === -1) return false;
        let splice = this._players.splice(index, 1);
        this._players.unshift(splice[0]);
        return true;
    }

    removePlayer(name) {
        let player = this.getPlayer(name);
        let index = this._players.indexOf(player);
        if (index === -1) return null;
        let splice = this._players.splice(index, 1);
        return splice[0];
    }

    /**
     * Set the current player choosing the question.
     * Setting active player out of range will set it to -1
     * Returns, JSON object to broadcast
     */
    nextActivePlayer() {
        if (this._players.length === 0) return null;

        do {
            this._players.push(this._players.shift());
        } while (this._players[0].enabled === false);

        return this._players[0];
    }
}

GameModel.STATES = {
    NOT_SET: "notset",
    QUESTION: "question",
    ANSWER: "answer",
    REVEAL: "reveal",
    BOARD: "board"
}

GameModel.STYLE = {
    MULTIPLE_CHOICE: "mc",
    JEOPARDY: "j",
    END_OF_GAME: "end"
}

export default GameModel;
