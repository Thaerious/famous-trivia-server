import Authenticate from './modules/Authenticate.js';
import parseURLParameters from './parseURLParameters.js';

window.addEventListener("load", ()=>{
    parseURLParameters();
    new Authenticate().loadClient();

    document.querySelector("#contestant_link").innerText = `${window.location.host}/contestant_join.ejs?hash=${window.parameters.hash}`;

    document.querySelector("#host").addEventListener("click", ()=>{
        window.open(`host_portal.ejs`, '_blank').focus();
    });

    document.querySelector("#contestant").addEventListener("click", ()=>{
        copyLink();
    });

    document.querySelector("#terminate").addEventListener("click", ()=>{
            let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;

            let xhttp = new XMLHttpRequest();

            xhttp.addEventListener("load", (event) => {
                window.location = `host.ejs`;
            });

            xhttp.open("POST", "game-manager-service");
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({
                token: token,
                action : "terminate"
            }));
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