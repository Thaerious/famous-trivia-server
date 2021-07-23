import fs from 'fs';
import SCHEMA_CONSTANTS from "../../../json_schema/schema_constants.js";
import JeopardyModel from "./JeopardyModel.js";
import MultipleChoiceModel from "./MultipleChoiceModel.js";
import EndOfGame from "./EndOfGame.js";
import GameNotStarted from "./GameNotStarted.js";

class GameModel {
    constructor(gameDescription) {
        if (typeof gameDescription === "string") gameDescription = JSON.parse(gameDescription);
        this.gameDescription = gameDescription;
        this._players = []; // name, score, enabled
        this.listeners = {};
        if (gameDescription) this.setupRounds();
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

        for(let roundModel of this.gameDescription.rounds){
            if (roundModel.type ===  SCHEMA_CONSTANTS.MULTIPLE_CHOICE) {
                this.rounds.push(new MultipleChoiceModel(roundModel));
            } else if (roundModel.type ===  SCHEMA_CONSTANTS.CATEGORY) {
                this.rounds.push(new JeopardyModel(this, roundModel));
            }
        }

        this.rounds.push(new EndOfGame(this));
    }

    toJSON(){
        let sanitized = Object.assign({}, this);
        delete sanitized.listeners;
        delete sanitized.rounds;
        return sanitized;
    }

    static fromJSON(json) {
        if (typeof json === "string") {
            json = JSON.parse(json);
        }

        let gameModel = new GameModel()
        Object.assign(gameModel, json);
        gameModel.setupRounds();

        return gameModel;
    }

    /**
     * Return a new object that is intended to be sent to the client.
     * This object will be used to update the client view.
     * @returns {{round: *}}
     */
    getUpdate() {
        const update = this.getRound().getUpdate();
        if (!update.players) Object.assign(update, {players : this.players});
        return update;
    }

    /**
     * Get the current round or the round by index.
     * @param index
     * @returns {*}
     */
    getRound(index) {
        index = index ?? this.roundIndex;
        if (index < 0) return new GameNotStarted();
        return this.rounds[index];
    }

    /**
     * Set the currently active round by index.
     * @param value
     * @return current round object.
     */
    setRound(index) {
        if (index < 0 || index > this.gameDescription.rounds.length) return this.getRound();
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
     * Each player is an object with:
     * { name, score, enabled}
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

export default GameModel;
