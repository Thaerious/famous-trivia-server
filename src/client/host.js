import Picker from "./modules/Picker.js";
import FilePicker from "./modules/FilePicker.js";
import Model from "./modules/Model.js";
import FileOps from "./modules/FileOps.js";
import Parameters from "./modules/Parameters.js";
import FileList from "./modules/FileList.js";
import renderButton from "./host/renderButton";

let folderId = null;
let fileOps = new FileOps();
window.fileOps = fileOps;

window.renderButton = renderButton;

// main called from renderButton.js
window.main = async function(){
    await checkForGame();
    await fileOps.load();
    addMenuListeners();
    setupFileList();
};

function onLoad(event) {
    console.log("Window onload");
    let id = event.detail.id;
    window.location = `editor.html?action=load&fileId=${id}`;
}

async function checkForGame() {
    let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;

    var xhttp = new XMLHttpRequest();

    xhttp.addEventListener("load", (event) => {
        let response = JSON.parse(xhttp.responseText);

        if (response['has-game'] === "true") {
            window.location = `launch_console.ejs?host=${response.host}&cont=${response.contestant}`;
        }
    });

    xhttp.open("POST", "game-manager-service");
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({
        token: token,
        action: "has-game"
    }));
}

async function onLaunch(event) {
    let id = event.detail.id; // google file identifier

    let file = await fileOps.get(id);
    let model = JSON.parse(file.body);
    let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;

    var xhttp = new XMLHttpRequest();
    xhttp.addEventListener("load", (event) => {
        let response = JSON.parse(xhttp.responseText);
        console.log(response);

        if (response.result === "success") {
            window.location = `launch_console.ejs?host=${response.host}&cont=${response.contestant}`;
        } else {
            window.alert("Error launching game");
            console.log(response);
        }
    });

    xhttp.open("POST", "launch");
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({
        model: model,
        token: token,
        action : "launch"
    }));
}

async function launchVerify() {
    let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;

    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'verify');
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onload = function () {
        console.log('response text');
        console.log(xhttp.responseText);
    };

    let json = JSON.stringify({token: token});
    xhttp.send(json);
}

function setupFileList() {
    let fileList = document.querySelector("file-list");

    fileList.addEventListener("delete-file", async (id) => {
        fileList.busy = true;
        await fileOps.delete(id);
        populateFileList();
        fileList.busy = false;
    });
}

function addMenuListeners() {
    let busyBox = document.querySelector(".busy-box");
    document.querySelector("#create").addEventListener("click", async (e) => {
        busyBox.classList.remove("hidden");
        let model = new Model().init("Game Name");
        let fp = await fileOps.create();
        await fileOps.setBody(fp, JSON.stringify(model.get(), null, 2));
        location.href = location.origin + "/editor.html?action=load&fileId=" + fp;
    });

    document.querySelector("#load").addEventListener("click", async (e) => {
        populateFileList();
        let fileList = document.querySelector("file-list");
        fileList.addEventListener("select-file", onLoad, {once: true});
    });

    document.querySelector("#launch").addEventListener("click", async (e) => {
        populateFileList();
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