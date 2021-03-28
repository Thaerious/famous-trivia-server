import fs from 'fs';
import constants from './constants.js';

class JeopardyModel{
    constructor(model, players){
        this.model = model;
        this._players = [...players];
        this.currentPlayer = null;

        /** matrix of which questions have already been answered **/
        this.spent = [];
        for (let col of this.model.column){
            let cells = [];
            this.spent.push(cells);
            for (let cell of col.cell){
                cells.push(false);
            }
        }

        this.stateData = {
            style    : GameModel.STYLE.JEOPARDY,
            state    : GameModel.NOT_SET
        };
    }

    get state (){
        return Object.assign({}, this.stateData);
    }

    hasUnspent(){ // TODO TEST
        for (let col of this.spent){
            for (let row of col){
                if (!row) return true;
            }
        }
        return false;
    }

    isSpent(col, row){
        col = col ?? this.stateData.col;
        row = row ?? this.stateData.row;
        return this.spent[col][row];
    }

    setSpent(col, row){
        col = col ?? this.stateData.col;
        row = row ?? this.stateData.row;
        this.spent[col][row] = true;
    }

    get countPlayers(){
        return this._players.length;
    }

    hasPlayer(name){
        return this.getPlayer(name) !== null;
    }

    getPlayer(name){
        for (let player of this._players){
            if (player.name === name){
                return player;
            }
        }
        return null;
    }

    removePlayer(name){
        let i = 0;
        while(i <= this.countPlayers){
            if (this._players[i].name === name) break;
            i = i + 1;
            if (i >= this.countPlayers) return false;
        }
        this._players.splice(i, 1);
        return true;
    }

    hasCurrent(){
        return this.currentPlayer !== null;
    }

    getCurrent(){
        return this.currentPlayer;
    }

    /**
     * @param name if name exists, make name current, else do nothing.
     * @param remove Remove the current player from the list
     */
    setCurrent(name, remove = true){
        if (!this.hasPlayer(name)) return false;

        if (remove && this.currentPlayer){
            this.removePlayer(this.currentPlayer.name);
        }
        this.currentPlayer = this.getPlayer(name);
        return true;
    }

    clearCurrent(remove = true){
        if (this.currentPlayer === null) return false;
        if (remove){
            this.removePlayer(this.currentPlayer.name);
        }
        this.currentPlayer = null;
        return true;
    }

    /**
     * Set the state data for the specified question question.
     * @param col
     * @param row
     * @returns question text
     */
    setBoardState(col, row){
        this.stateData = {
            style    : GameModel.STYLE.JEOPARDY,
            state    : GameModel.STATES.BOARD
        };

        return this.stateData;
    }

    /**
     * Set the state data for the specified question question.
     * @param col
     * @param row
     * @returns question text
     */
    setQuestionState(col, row){
        this.stateData = {
            style    : GameModel.STYLE.JEOPARDY,
            state    : GameModel.STATES.QUESTION,
            col      : col,
            row      : row,
            type     : this.getType(col, row),
            question : this.getQuestion(col, row)
        };

        return this.stateData;
    }

    getQuestion(col, row){
        col = col ?? this.stateData.col;
        row = row ?? this.stateData.row;
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
    setRevealState(col, row){
        col = col ?? this.stateData.col;
        row = row ?? this.stateData.row;

        this.setQuestionState(col, row);
        Object.assign(this.stateData, {
            state  : GameModel.STATES.REVEAL,
            answer : this.getAnswer()
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
    getAnswer(col, row){
        col = col ?? this.stateData.col;
        row = row ?? this.stateData.row;
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
    getValue(col, row){
        col = col ?? this.stateData.col;
        row = row ?? this.stateData.row;
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
    getType(col, row){
        col = col ?? this.stateData.col;
        row = row ?? this.stateData.row;
        return this.model.column[col].cell[row].type;
    }

    getState(){
        return this.stateData.state;
    }

    getUpdate(){
        return JSON.parse(JSON.stringify(this.stateData));
    }
}

class MultipleChoiceModel{
    constructor(model){
        this.model = model;
        this.stateData = {
            style    : GameModel.STYLE.MULTIPLE_CHOICE,
        };
        this.setQuestionState("A");
    }

    get state (){
        return Object.assign({}, this.stateData);
    }

    /**
     * Set the state data for the specified question question.
     * @param col
     * @param row
     * @returns question text
     */
    setQuestionState(tag){
        console.warn(`------ setQuestionState ${tag} ----------`);
        Object.assign(this.stateData, {
            state    : GameModel.STATES.QUESTION,
            question : this.model.question
        });

        return this.state;
    }

    getAnswers(){
        let answers = [];
        for (let i in this.model.answers){
            answers[i] = this.model.answers[i].text;
        }
        return answers;
    }

    getValues(){
        let values = [];
        for (let i in this.model.answers){
            values[i] = this.model.answers[i].isTrue === 'true';
        }
        return values;
    }

    getValue(index){
        return this.model.answers[index].isTrue;
    }

    /**
     * Set the state showing the players the answers.
     * @param col
     * @param row
     * @returns question text
     */
    setAnswerState(){
        Object.assign(this.stateData, {
            state    : GameModel.STATES.ANSWER,
            answers : this.getAnswers()
        });

        return this.stateData;
    }

    /**
     * Set the state revealing the correct answer to the player
     */
    setRevealState(){
        this.setAnswerState();
        Object.assign(this.stateData, {
            state    : GameModel.STATES.REVEAL,
            values : this.getValues()
        });
        console.log("------ set reveal state ----------");
        console.log(this.stateData);
        return this.stateData;
    }

    getUpdate(){
        console.log(this.stateData);
        return JSON.parse(JSON.stringify(this.stateData));
    }
}

class GameModel{
    constructor(model) {
        this.model = model;
        this._roundIndex = -1;
        this._players = []; // name, score, enabled
        this._currentRound = null;
    }

    getUpdate(){
        let result = {
            players : this._players
        }
        if (this.getRound()){
            result.round = this.getRound().getUpdate()
        }
        return result;
    }
    
    save(filepath){
        fs.writeFileSync(filepath, JSON.stringify(this));
    }

    load(filepath){
        let json = fs.readFileSync(filepath);
        let obj = JSON.parse(json);
        for (let field in obj){
            this[field] = obj[field];
        }
    }

    get round(){
        return this._roundIndex;
    }

    set round(value){
        if (value < 0) value = 0;
        if (value >= this.model.rounds.length) value = this.model.rounds.length - 1;
        this._roundIndex = value;
    }

    /**
     * Get the current round or the round by index.
     * Setting the index value to a new index will create a new round instance.
     * Otherwise it will return the previous one.
     * @param index
     * @returns {*}
     */
    getRound(){
        return this._currentRound;
    }

    setRound(index){
        this.round = index;
        const roundModel = this.model.rounds[index];
        if (roundModel.type === "multiple_choice"){
            this._currentRound = new MultipleChoiceModel(roundModel);
        }
        else if (roundModel.type ==="choice"){
            this._currentRound = new JeopardyModel(roundModel, this._players);
        }

        return this._currentRound;
    }

    nextRound(){
        this.round = this.round + 1;
        this.setRound(this.round);
        return this.getRound();
    }

    /**
     * Add a new player to the model
     * If the name already exists, make no change
     * @param name
     * @returns {number} index of the player
     */
    addPlayer(name){
        if (this.hasPlayer(name)){
            return this.getPlayer(name);
        }

        const player = {
            name: name,
            score: 0,
            enabled: true
        };

        this._players.push(player);
        return player;
    }

    get players(){
        return [...this._players];
    }

    /**
     * Return a count of enabled players.
     * @returns {number}
     */
    playerCount(){
        return this._players.length;
    }

    /**
     * Retrieve the active player object.
     * @returns {null|*}
     */
    get activePlayer(){
        if (this._players.length === 0) return null;
        return this._players[0];
    }

    /**
     * Retrieve a player by name or null.
     * This is reflective, changes are kept.
     * @param name
     * @returns {null|*}
     */
    getPlayer(name){
        for (let player of this._players) if (player.name === name) return player;
        return null;
    }

    hasPlayer(name){
        return this.getPlayer(name) !== null;
    }

    /**
     * Set the current player choosing the question.
     * Setting active player out of range will set it to -1
     * Returns, JSON object to broadcast
     */
    setActivePlayer(name){
        let player = this.getPlayer(name);
        let index = this._players.indexOf(player);
        if (index === -1) return false;
        let splice = this._players.splice(index, 1);
        this._players.unshift(splice[0]);
        return true;
    }

    removePlayer(name){
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
    nextActivePlayer(){
        if (this._players.length === 0) return null;
        let player = this._players.shift();
        this._players.push(player);
        return this._players[0];
    }
}

GameModel.STATES = {
    NOT_SET : "notset",
    QUESTION : "question",
    ANSWER : "answer",
    REVEAL : "reveal",
    BOARD : "board"
}

GameModel.STYLE = {
    MULTIPLE_CHOICE : "mc",
    JEOPARDY : "j"
}

export default GameModel;
