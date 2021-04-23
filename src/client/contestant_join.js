

window.addEventListener("load", (event)=>{
    console.log("Contestest Join Loading");

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

function submit(){
    console.log("submit");
}