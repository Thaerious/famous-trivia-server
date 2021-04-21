const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class TriviaTimer extends NidgetElement{

    constructor() {
        super("trivia-timer-template");
        console.log("Trivia Timer");
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

    show(value){
        if (value) {
            this.querySelector("#current-tick").innerHTML = value;
            this.querySelector("#prev-tick").innerHTML = value - 1;
        }
        super.show();
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