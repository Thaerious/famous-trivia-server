const Picker = require("./modules/Picker.js");
const FilePicker = require("./modules/FilePicker.js");
const Model = require("./modules/Model.js");
const FileOps = require("./modules/FileOps.js");
const Parameters = require("./modules/Parameters.js");
require("./modules/FileList.js");

window.FileOps = FileOps;

let folderId = null;
let fileOps = new FileOps();
window.fileOps = fileOps;

window.addEventListener("load", async ()=>{

});

function setupFileList(){
    let fileList = document.querySelector("file-list");

    fileList.del = async (id) => {
        fileList.busy = true;
        await fileOps.delete(id);
        populateFileList();
        fileList.busy = false;
    }
    fileList.cb = (id) => window.location = `editor.html?action=load&fileId=${id}`;
}

function addMenuListeners(){
    let busyBox = document.querySelector(".busy-box");
    document.querySelector("#create").addEventListener("click", async (e) => {
        console.log("click");
        busyBox.classList.remove("hidden");
        let model = new Model().init("Game Name");
        let fp = await fileOps.create();
        await fileOps.setBody(fp, JSON.stringify(model.get(), null, 2));
        location.href = location.origin + "/editor.html?action=load&fileId=" + fp;
    });

    document.querySelector("#load").addEventListener("click", async (e) => {
        populateFileList();
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