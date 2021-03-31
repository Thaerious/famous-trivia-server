

// <div class="button" id="host">Host Portal</div>
// <div class="button" id="contestant">Contestant Portal</div>
// <div class="button" id="terminate">Terminate Game</div>

window.addEventListener("load", ()=>{
    parseURLParameters();

    document.querySelector("#contestant_link").innerText = `${window.location.host}/contestant_portal.html?hash=${window.parameters.cont}`;

    document.querySelector("#host").addEventListener("click", ()=>{
        window.open(`host_portal.html?hash=${window.parameters.host}`, '_blank').focus();
    });

    document.querySelector("#contestant").addEventListener("click", ()=>{
        copyLink();
    });

    document.querySelector("#terminate").addEventListener("click", ()=>{

    });
});

/**
 * Extract value from the URL string, store in 'window.parameters'.
 */
function parseURLParameters() {
    window.parameters = {};
    const parameters = window.location.search.substr(1).split("&");
    for (const parameter of parameters) {
        const split = parameter.split(/=/);
        window.parameters[split[0]] = split[1] ?? "";
    }
}

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