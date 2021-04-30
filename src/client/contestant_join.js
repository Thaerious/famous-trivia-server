import GameManagerService from "./services/GameManagerService.js";
import parseURLParameters from './parseURLParameters.js';

let gameManagerService = new GameManagerService();

window.addEventListener("load", async(event)=>{
    /* attempt to join game, if already joined, forward to the game page */
    const gameHashResp = await gameManagerService.getGameHash();
    if (gameHashResp.result === "success"){
        window.location = `contestant_portal.ejs`;
    }

    document.querySelector("#name").addEventListener("enter-pressed", event=>{
        let element = document.querySelector("#name");
        const tabindex = element.tabIndex;
        if (tabindex === -1) return;
        const next = document.querySelector(`[tabindex='${tabindex + 1}']`);
        if (next) next.focus();
    });

    document.querySelector("#join").addEventListener("click", e=>submit());
    document.querySelector("#join").addEventListener("keypress", e=>submit());
});

async function submit(){
    const name =  document.querySelector("#name").content;
    const response = await gameManagerService.setName(window.parameters.hash, name);

    if (response.result === "rejected"){
        document.querySelector("#alert").show(response.reason);
    }
    else if (response.result === "success"){
        window.location = `contestant_portal.ejs`;
    }
}