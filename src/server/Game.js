import GameModel from "./GameModel.js";
import fs from 'fs';

class Timer{
    constructor(game) {
        this.game = game;
    }

    start(startTime = 10){
        if (this.timeout){
            clearTimeout(this.timeout);
            delete this.timeout;
        }

        this.currentTime = startTime;
        this.timeout = setTimeout(()=>this.update(), 1000);
        this.game.broadcast({action: "start_timer", value: startTime});
    }

    stop(){
        if (this.timeout){
            clearTimeout(this.timeout);
            delete this.timeout;
        }
    }

    update(){
        this.currentTime = this.currentTime - 1;
        if(this.currentTime > 0){
            this.timeout = setTimeout(()=>this.update(), 1000);
            this.onUpdate(this.currentTime);
        } else {
            this.onExpire();
        }
    }

    onUpdate(){
        this.game.broadcast({action: "update_timer", value: this.currentTime});
    }

    onExpire(){
        delete this.timeout;
        this.game.onAction({action:"clock_expired"});
        this.game.broadcast({action: "stop_timer"});
    }

    clear(){
        if (this.timeout) clearTimeout(this.timeout);
    }
}

class Game {
    constructor(model) {
        this.model = model;
        this.timer = new Timer(this);
        this.state = new StartState(this);
    }

    onInput(input){
        this.state = this.state.transition(input);
    }

    broadcast(msg) {
    }

    notify(name, msg) {
    }
}

class StartState{
    constructor(game) {
        this.game = game;
    }

    onInput(input){

    }
}

export default Game;