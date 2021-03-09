const Picker = require("./modules/Picker.js");

window.onload = ()=> {
    document.querySelector("#create").addEventListener("click", (e) => {
        let picker = new Picker();
        picker.loadPicker();
    });
}
