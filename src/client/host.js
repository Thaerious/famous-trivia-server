import Picker from "./modules/Picker.js";
import FilePicker from "./modules/FilePicker.js";
import Model from "./modules/Model.js";
import FileOps from "./modules/FileOps.js";
import Parameters from "./modules/Parameters.js";
import FileList from "./modules/FileList.js";

let folderId = null;
let fileOps = new FileOps();
window.fileOps = fileOps;

window.addEventListener("load", async ()=>{
    await fileOps.load();
    addMenuListeners();
    setupFileList();
});

function onLoad(event){
    let id = event.detail.id;
    window.location = `editor.html?action=load&fileId=${id}`;
}

async function onLaunch(event){
    let id = event.detail.id;

    let file = await fileOps.get(id);

    console.log(file.body);

    var xhttp = new XMLHttpRequest();
    xhttp.addEventListener("load", (event)=>{
        console.log(event)
        console.log(JSON.parse(xhttp.responseText));
    });
    xhttp.open("POST", "launch");
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(file.body);
}

function setupFileList(){
    let fileList = document.querySelector("file-list");

    fileList.addEventListener("delete-file", async (id) => {
        fileList.busy = true;
        await fileOps.delete(id);
        populateFileList();
        fileList.busy = false;
    });
}

function addMenuListeners(){
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
        fileList.addEventListener("select-file", onLoad, {once : true});
    });

    document.querySelector("#launch").addEventListener("click", async (e) => {
        populateFileList();
        let fileList = document.querySelector("file-list");
        fileList.addEventListener("select-file", onLaunch, {once : true});
    });
}

async function populateFileList(){
    let busyBox = document.querySelector(".busy-box");
    let fileList = document.querySelector("file-list");

    fileList.show();
    fileList.busy = true;
    fileList.clear();

    let list = await fileOps.list();
    for (let item of list){
        let i = item.name.indexOf(".");
        fileList.addItem(item.name.substr(0, i), item.id);
    }
    fileList.busy = false;
}

window.populateFileList = populateFileList;