import fs from 'fs';
import constants from './constants.js';

class JeopardyModel{
    constructor(model){
        this.model = model;
        this.state_data = {}
    }

    /**
     * Set the state data for the specified question question.
     * @param col
     * @param row
     * @returns question text
     */
    setQuestionState(col, row){
        this.state_data.assign({
            state    : GameModel.STATES.QUESTION,
            col      : col,
            row      : row,
            type     : this.getType(col, row),
            question : this.getQuestion(col, row)
        });

        return this.state_data.text;
    }

    getQuestion(col, row){
        col = col ?? this.state_data.col;
        row = row ?? this.state_data.row;
        return this.model[col].questions[row].q;
    }

    /**
     *
     * Set the game model state to "show answer".
     * The setQuestionState must be called first.
     * @param col
     * @param row
     * @returns game state update object
     */
    setAnswerState(){
        this.state_data.assign = {
            state  : GameModel.STATES.ANSWER,
            answer : this.getAnswer()
        };
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
        col = col ?? this.state_data.col;
        row = row ?? this.state_data.row;
        return this.model[col].questions[row].a;
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
        col = col ?? this.state_data.col;
        row = row ?? this.state_data.row;
        return this.questionSet[col].questions[row].value;
    }

    /**
     * Retrieve the question type
     * If row and column are omitted, use the row/col from the
     * most recent previous setQuestionState.
     * @param col
     * @param row
     * @returns game state update object
     */
    getQuestionType(col, row){
        col = col ?? this.state_data.col;
        row = row ?? this.state_data.row;
        return this.questionSet[col].questions[row].type;
    }

    getUpdate(){
        let sanitized = JSON.parse(JSON.stringify(this));
        sanitized.action = "update_model";
        delete sanitized.model;
        return sanitized;
    }
}

class MultipleChoiceModel{
    constructor(model){
        this.model = model;
    }

    /**
     * Set the state data for the specified question question.
     * @param col
     * @param row
     * @returns question text
     */
    setQuestionState(){
        this.state_data.assign({
            state    : GameModel.STATES.QUESTION,
            question : this.getQuestion()
        });

        return this.state_data.question;
    }

    getQuestion(){
        return this.model.question;
    }

    getAnswers(){
        let answers = [];
        for (let i in this.model.answers){
            answers[i] = this.model.answers[i].text;
        }
    }

    getValue(index){
        return this.model.answers[index].isTrue;
    }

    /**
     * Set the state data for the specified question question.
     * @param col
     * @param row
     * @returns question text
     */
    setAnswerState(){
        this.state_data.assign({
            state    : GameModel.STATES.ANSWER,
            answers : this.getAnswers()
        });

        return this.state_data.question;
    }
}

class GameModel{
    constructor(questionSet) {
        this.questionSet = questionSet;
        this._roundIndex = 0;
        this.players = []; // buzzer (enabled, disabled), name, role, score
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
        if (value >= this.questionSet.rounds.length) value = this.questionSet.rounds.length - 1;
        this._roundIndex = value;
    }

    /**
     * Get the current round or the round by index.
     * @param index
     * @returns {*}
     */
    getRound(index){
        index = index ?? this.round;
        const round = this.questionSet.rounds[index];

        if (round.type === "multiple_choice"){
            return new MultipleChoiceModel(round);
        }
        else if (round.type ==="choice"){
            return new JeopardyModel(round);
        }
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
            buzzer: "enabled",
            enabled: true
        };

        this.players.push(player);
        return player;
    }

    /**
     * Return a count of enabled players.
     * @returns {number}
     */
    playerCount(){
        return this.players.length;
    }

    /**
     * Retrieve the current player object
     * @returns {null|*}
     */
    get currentPlayer(){
        return this.current_player;
    }

    /**
     * Retrieve the active player object.
     * @returns {null|*}
     */
    get activePlayer(){
        if (this.players.length === 0) return null;
        return this.players[0];
    }

    getPlayer(name){
        for (let player of this.players) if (player.name === name) return player;
        return null;
    }

    hasPlayer(name){
        return this.getPlayer(name) !== null;
    }

    /**
     * Retrieve the number of players permitted to buzz in.
     * @returns {number}
     */
    countEnabledBuzzers(){
        let r = 0;
        for (let player of this.players){
            if (player.buzzer === "enabled") r = r + 1;
        }
        return r;
    }

    /**
     * Enable all buzzers.
     */
    enableAllBuzzers(){
        for (let i in this.players) this.players[i].buzzer = "enabled";
    }

    /**
     * Set the current player choosing the question.
     * Setting active player out of range will set it to -1
     * Returns, JSON object to broadcast
     */
    setActivePlayer(name){
        let player = this.getPlayer(name);
        let index = this.players.indexOf(player);
        if (index === -1) return false;
        let splice = this.players.splice(index, 1);
        this.players.unshift(splice[0]);
        return true;
    }

    removePlayer(name){
        let player = this.getPlayer(name);
        let index = this.players.indexOf(player);
        if (index === -1) return null;
        let splice = this.players.splice(index, 1);
        return splice[0];
    }

    /**
     * Set the current player choosing the question.
     * Setting active player out of range will set it to -1
     * Returns, JSON object to broadcast
     */
    nextActivePlayer(name){
        if (this.players.length === 0) return null;
        let player = this.players.shift();
        this.players.push(player);
        return this.players[0];
    }

// ------------------ //

    /**
     * Retrieve the game state of the game (without questions & answers).
     * Used to send a full update to clients.
     * @returns {{}}
     */
    getFullUpdate(){
        let sanitized = JSON.parse(JSON.stringify(this));
        sanitized.action = "update_model";
        delete sanitized.filepath;

        for (let category in sanitized.questionSet){
            for (let j in sanitized.questionSet[category].questions){
                let question = sanitized.questionSet[category].questions[j];
                delete question.a;
                delete question.q;
                delete question.type;
            }
        }

        sanitized.state = sanitized._state;
        delete sanitized._state;

        return sanitized;
    }
}

GameModel.STATES = {
    QUESTION : "question",
    ANSWER : "answer"
}

export default GameModel;
