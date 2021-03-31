

// <div class="button" id="host">Host Portal</div>
// <div class="button" id="contestant">Contestant Portal</div>
// <div class="button" id="terminate">Terminate Game</div>

window.addEventListener("load", ()=>{
    parseURLParameters();

    document.querySelector("#host").addEventListener("click", ()=>{

    });

    document.querySelector("#contestant").addEventListener("click", ()=>{

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
    /* Get the text field */
    var copyText = document.getElementById("myInput");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    document.execCommand("copy");

    /* Alert the copied text */
    alert("Copied the text: " + copyText.value);
}