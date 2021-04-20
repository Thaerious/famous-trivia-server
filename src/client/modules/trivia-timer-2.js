const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class TriviaTimer extends NidgetElement{

    constructor() {
        super("trivia-timer-template");
    }

    start(value){
        if (value) this.set(value);
        this.timeout = setTimeout(()=>this.step(), 500);
        this.running = true;
    }

    stop(){
        if (this.timeout){
            this.running = false;
            clearTimeout();
        }
    }

    step(){
        if (this.value > 0 && this.running) {
            this.tick();
            this.timeout = setTimeout(()=>this.step(), 1000);
        }
    }

    set(value){
        this.value = value;
        this.querySelector("#prev-tick").innerHTML = value;
        this.querySelector(".outer").classList.remove("cycle");

        setTimeout(
            ()=>this.querySelector(".outer").classList.add("cycle"),
            10
        );

        setTimeout(
            ()=>this.querySelector("#current-tick").innerHTML = value,
            500
        );
    }

    tick(nextValue){
        nextValue = nextValue ?? --this.value;
        this.querySelector("#prev-tick").innerHTML = nextValue;
        this.querySelector(".outer").classList.remove("cycle");

        setTimeout(
            ()=>this.querySelector(".outer").classList.add("cycle"),
            500
        );

        setTimeout(
            ()=>this.querySelector("#current-tick").innerHTML = nextValue,
            900
        );
    }
}

window.customElements.define('trivia-timer', TriviaTimer);
module.exports = TriviaTimer;