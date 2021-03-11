const Picker = require("./modules/Picker.js");
const FilePicker = require("./modules/FilePicker.js");

window.onload = ()=> {
    document.querySelector("#create").addEventListener("click", (e) => {
        let picker = new Picker();
        picker.loadPicker();
    });

    document.querySelector("#load").addEventListener("click", async (e) => {
        let picker = new FilePicker();
        await picker.loadPicker();
    });
}
