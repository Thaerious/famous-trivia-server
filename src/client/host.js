import Picker from "./modules/Picker.js";
import FilePicker from "./modules/FilePicker.js";
import GameDescriptionModel from "./modules/GameDescriptionModel.js";
import FileOps from "./modules/FileOps.js";
import Parameters from "./modules/Parameters.js";
import FileList from "./modules/FileList.js";
import GameManagerService from "./modules/GameManagerService.js";

let fileOps = new FileOps();
const gameManagerService = new GameManagerService();

// main called from signin-button.js after login complete
window.main = async function () {
    await hasGame();
    await fileOps.load();
    addMenuListeners();
    setupFileList();
    document.querySelectorAll(".button").forEach(e=>e.classList.remove("disabled"));
};

function onLoad(event) {
    let id = event.detail.id;
    window.location = `editor.ejs?action=load&fileId=${id}`;
}

async function hasGame() {
    let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    let response = await gameManagerService.hasGame(token);
    if (response.result === "success") {
        window.location = `launch_console.ejs`;
    }
}

async function onLaunch(event) {
    let id = event.detail.id; // google file identifier

    let file = await fileOps.get(id);
    let model = JSON.parse(file.body);
    let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;

    let response = await gameManagerService.launch(token, model);
    if (response.result === "success") {
        window.location = `launch_console.ejs`;
    } else {
        window.alert("Error launching game");
        console.log(response);
    }
}

function setupFileList() {
    let fileList = document.querySelector("file-list");

    fileList.addEventListener("delete-file", async (event) => {
        fileList.busy = true;
        try {
            await fileOps.delete(event.detail.id);
        } catch (err) {
            console.log(err);
        }
        await populateFileList();
        fileList.busy = false;
    });
}

function addMenuListeners() {
    let busyBox = document.querySelector(".busy-box");

    document.querySelector("#create").addEventListener("click", async (e) => {
        busyBox.classList.remove("hidden");
        let model = new GameDescriptionModel().init("Game Name");
        let fp = await fileOps.create();
        await fileOps.setBody(fp, JSON.stringify(model.get(), null, 2));
        window.location = "editor.ejs?action=load&fileId=" + fp;
    });

    document.querySelector("#upload").addEventListener("click", async (e) => {
        let anchor = document.querySelector("#upload-anchor");
        anchor.click();

        anchor.addEventListener("change", event => {
            const data = anchor.files[0];
            const reader = new FileReader();

            reader.onload = async e => {
                let name = JSON.parse(e.target.result).name;
                let fp = await fileOps.create(name + ".json");
                await fileOps.setBody(fp, e.target.result);
                window.location ="editor.ejs?action=load&fileId=" + fp;
            }
            reader.readAsText(data);
        }, {once: true});
    });

    document.querySelector("#load").addEventListener("click", async (e) => {
        await populateFileList();
        let fileList = document.querySelector("file-list");
        fileList.addEventListener("select-file", onLoad, {once: true});
    });

    document.querySelector("#launch").addEventListener("click", async (e) => {
        await populateFileList();
        let fileList = document.querySelector("file-list");
        fileList.addEventListener("select-file", onLaunch, {once: true});
    });
}

async function populateFileList() {
    let busyBox = document.querySelector(".busy-box");
    let fileList = document.querySelector("file-list");

    fileList.show();
    fileList.busy = true;
    fileList.clear();

    let list = await fileOps.list();
    for (let item of list) {
        let i = item.name.indexOf(".");
        fileList.addItem(item.name.substr(0, i), item.id);
    }
    fileList.busy = false;
}