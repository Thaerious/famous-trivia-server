import Authenticate from './modules/Authenticate.js';
import GameManagerService from "./services/GameManagerService.js"

const gameManagerService = new GameManagerService();

window.addEventListener("load", async ()=>{
    await new Authenticate().loadClient();
    let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;

    let result = await gameManagerService.checkForGame(token);
    let url = `${window.location.host}/contestant_join.ejs?hash=${result['hash']}`;
    document.querySelector("#contestant_link").innerText = url;

    document.querySelector("#host").addEventListener("click", ()=>{
        window.open(`host_portal.ejs`, '_blank').focus();
    });

    document.querySelector("#contestant").addEventListener("click", ()=>{
        copyLink();
    });

    document.querySelector("#terminate").addEventListener("click", async ()=>{
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
            await gameManagerService.terminate(token);
            window.location = "/host.ejs";
    });
});

function copyLink() {
    let range = document.createRange();
    range.selectNode(document.getElementById("contestant_link"));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    window.range = range;
    document.execCommand("copy");
    document.querySelector("#message").classList.remove("flash");
    setTimeout(()=>document.querySelector("#message").classList.add("flash"), 0);
}