import GameManagerService from "./services/GameManagerService.js";
import parseURLParameters from './parseURLParameters.js';

window.addEventListener("load", async(event)=>{
    /* attempt to join game, if already joined, forward to the game page */
    const response = await GameManagerService.joinGame(window.parameters.hash);

    if (response === "success"){
        window.location = `contestant_portal.ejs`;
    }

    document.querySelector("#name").addEventListener("enter-pressed", event=>{
        let element = document.querySelector("#name");
        const tabindex = element.tabIndex;
        if (tabindex === -1) return;
        const next = document.querySelector(`[tabindex='${tabindex + 1}']`);
        if (next) next.focus();
        return;
    });

    document.querySelector("#join").addEventListener("click", e=>submit());
    document.querySelector("#join").addEventListener("keypress", e=>submit());
});

async function submit(){
    const name =  document.querySelector("#name").content;
    const response = await GameManagerService.setName(window.parameters.hash, name);
    console.log(response);
    if (response.result === "rejected"){
        document.querySelector("#alert").show(response.reason);
    }
}