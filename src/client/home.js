const Picker = require("./modules/Picker.js");
const FilePicker = require("./modules/FilePicker.js");
const Model = require("./modules/Model.js");
const FileOps = require("./modules/FileOps.js");
const Parameters = require("./modules/Parameters.js");
require("./modules/FileList.js");

let folderId = null;
let fileOps = new FileOps();

window.onload = async ()=> {
    let busyBox = document.querySelector(".busy-box");
    await fileOps.loadClient();
    let fileList = document.querySelector("file-list");

    fileList.del = async (id) => {
        fileList.busy = true;
        await fileOps.delete(id);
        populateFileList();
        fileList.busy = false;
    }
    fileList.cb = (id) => window.location = `editor.html?action=load&fileId=${id}`;

    document.querySelector("#create").addEventListener("click", async (e) => {
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