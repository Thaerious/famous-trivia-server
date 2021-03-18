(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    await fileOps.load();
    addMenuListeners();
    setupFileList();
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
},{"./modules/FileList.js":3,"./modules/FileOps.js":4,"./modules/FilePicker.js":5,"./modules/Model.js":6,"./modules/Parameters.js":7,"./modules/Picker.js":8}],2:[function(require,module,exports){
// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

class Authenticate {
    constructor(){
        Object.assign(this, require("./googleFields.js"));
    }

    loadClient() {
        return new Promise((resolve, reject) => {
            gapi.load('client:auth2', () => this.__initClient(resolve, reject));
        });
    }

    __initClient(resolve, reject) {
        gapi.client.init({
            apiKey: this.developerKey,
            clientId: this.clientId,
            discoveryDocs: this.discoveryDocs,
            scope: this.scope
        }).then(function (result) {
            resolve();
        }, function(error) {
            console.log("ERROR INIT");
            console.log(error);
            reject(error);
        });
    }

    isAuthorized(){
        var user = gapi.auth2.getAuthInstance().currentUser.get();
        return user.hasGrantedScopes(this.scope);
    }

    signIn(){
        gapi.auth2.getAuthInstance().signIn();
    }

    signOut(){
        gapi.auth2.getAuthInstance().signOut();
    }

}

module.exports = Authenticate;
},{"./googleFields.js":9}],3:[function(require,module,exports){

class FileList extends HTMLElement{

    constructor(props) {
        super(props);
        window.addEventListener("load", (event)=>this.load());
    }

    load(){
        this.querySelector(".close").addEventListener("click", ()=>{
            this.hide();
        });
    }

    clear(){
        for (let ele of this.querySelectorAll(".file-item")){
            this.querySelector("#inner-list").removeChild(ele);
        }
    }

    addItem(filename, id){
        let meta = document.createElement("div");
        meta.classList.add("file-item");
        meta.setAttribute("data-id", id);
        this.querySelector("#inner-list").appendChild(meta);

        let ele = document.createElement("span");
        ele.classList.add("file-name");
        ele.innerText = filename;
        meta.appendChild(ele);

        ele.addEventListener("click", ()=>this.cb(id));

        ele = document.createElement("span");
        ele.classList.add("delete");
        ele.innerText = "Delete";
        meta.appendChild(ele);

        ele.addEventListener("click", ()=>this.del(id));
    }

    show(){
        this.classList.remove("hidden");
    }

    hide(){
        this.classList.add("hidden");
    }

    set busy(value){
        if (value) this.querySelector("#file-list-busy").classList.remove("hidden");
        else this.querySelector("#file-list-busy").classList.add("hidden");
    }
}

window.customElements.define('file-list', FileList);
module.exports = FileList;
},{}],4:[function(require,module,exports){
"use strict";
// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

class FileOps {

    async load(){
        await this.loadClient();
        await this.loadDrive();
    }

    loadClient() {
        return new Promise((resolve, reject) => {
            gapi.load('client', () => resolve());
        });
    }

    loadDrive() {
        return new Promise((resolve, reject) => {
            gapi.client.load('drive', 'v3', resolve());
        });
    }

    async create(){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.create({
                name : FileOps.filename,
                parents: ['appDataFolder'],
                fields: "id"
            }).then(res=>{
                resolve(res.result.id);
            }, function (error) {
                reject(error);
            });
        });
    }

    async delete(fileId){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.delete({
                fileId : fileId
            }).then(res=>{
                resolve(res.result);
            }, function (error) {
                reject(error.message);
            });
        });
    }

    async list(){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.list({
                // q: `name contains '.json'`,
                spaces: 'appDataFolder',
                fields: 'files/name,files/id,files/modifiedTime'
            }).then(res=>{
                resolve(res.result.files);
            }, function (error) {
                reject(error);
            });
        });
    }

    async get(fileId){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            }).then(res=>{
                resolve(res);
            }, function (error) {
                console.log(error);
                reject(error.message);
            });
        });
    }

    async setBody(fileId, body){
        return new Promise((resolve, reject)=> {
            gapi.client.request({
                path : "upload/drive/v3/files/" + fileId,
                method : "PATCH",
                params : {
                    uploadType : "media"
                },
                headers : {
                    "Content-Type" : "application/json"
                },
                body : body
            }).then(res=>{
                resolve(JSON.parse(res.body));
            }, function (error) {
                console.log(error);
                reject(error.message);
            });
        });
    }

    async rename(fileId, filename){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.update({
                fileId: fileId,
                name: filename
            }).then(res=>{
                resolve(JSON.parse(res.body));
            }, function (error) {
                console.log(error);
                reject(error.message);
            });
        });
    }
}

FileOps.filename = "Game Name.json";

module.exports = FileOps;
},{}],5:[function(require,module,exports){
const Picker = require("./Picker.js");

class FilePicker extends Picker{
    // Create and render a Picker object for searching images.
    createPicker() {
        let view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
            .setIncludeFolders(true)
            .setParent('root')
            .setMimeTypes("json");
        ;

        if (this.pickerApiLoaded && this.oauthToken) {
            let picker = new google.picker.PickerBuilder()
                .enableFeature(google.picker.Feature.NAV_HIDDEN)
                .addView(view)
                .setAppId(this.appId)
                .setOAuthToken(this.oauthToken)
                .setDeveloperKey(this.developerKey)
                .setCallback(this.pickerCallback)
                // .addView(new google.picker.DocsUploadView())
                .build();
            picker.setVisible(true);
        }
    }

    // A simple callback implementation.
    // Override this method on use.
    pickerCallback(data) {
        if (data.action === google.picker.Action.PICKED) {
            var fileId = data.docs[0].id;
            window.location = `editor.html?action=load&fileId=${fileId}`;
        }
    }
}

module.exports = FilePicker;


},{"./Picker.js":8}],6:[function(require,module,exports){
class Model {
    init(name = "Game Name") {
        this.currentRound = 0;

        this.gameModel = {
            name: name,
            rounds: []
        };

        this.addCategoryRound();
        return this;
    }

    set name(string) {
        this.gameModel.name = string;
    }

    get name() {
        return this.gameModel.name;
    }

    set(gameModel) {
        this.currentRound = 0;
        this.gameModel = gameModel;
        return this;
    }

    get() {
        return this.gameModel;
    }

    getRound(index) {
        index = index ?? this.currentRound;
        return this.gameModel.rounds[index];
    }

    getColumn(index) {
        return this.getRound().column[index];
    }

    getCell(row, column) {
        return this.getColumn(column).cell[row];
    }

    removeRound() {
        if (this.roundCount === 1) return;
        this.gameModel.rounds.splice(this.currentRound, 1);
        if (this.currentRound >= this.roundCount) this.currentRound = this.roundCount - 1;
    }

    addMultipleChoiceRound(){
        let round = {
            type: Model.questionType.MULTIPLE_CHOICE,
            question : "",
            answers : [
                // value : {true, false}, text
            ]
        };

        this.gameModel.rounds.push(round);
        return round;
    }

    addCategoryRound() {
        let round = {
            type: Model.questionType.CATEGORY,
            column: []
        };

        for (let i = 0; i < 6; i++) {
            round.column[i] = {
                category: "",
                cell: []
            }

            for (let j = 0; j < 5; j++) {
                round.column[i].cell[j] = {
                    value: (j + 1) * 100,
                    type: "text",
                    q: "",
                    a: ""
                }
            }
        }

        this.gameModel.rounds.push(round);
        return round;
    }

    get roundCount() {
        return this.gameModel.rounds.length;
    }

    increaseValue() {
        let round = this.getRound();

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                round.column[i].cell[j].value *= 2;
            }
        }
    }

    decreaseValue() {
        let round = this.getRound();

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                round.column[i].cell[j].value /= 2;
            }
        }
    }
}

Model.questionType = {
    CATEGORY : "choice",
    MULTIPLE_CHOICE : "multiple_choice"
};

module.exports = Model;
},{}],7:[function(require,module,exports){
"use strict";
const AbstractFiles = require("./Authenticate.js");

class Parameters extends AbstractFiles{
    constructor() {
        super();
        this.param = {
            last_file : ""
        }
    }

    async create(dirToken){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.create({
                name : Parameters.filename,
                parents: ['appDataFolder'],
                fields: "id"
            }).then(res=>{
                console.log(res);
                this.fileId = res.result.id;
                resolve(JSON.parse(res.body));
            }, function (error) {
                reject(error.message);
            });
        });
    }

    async read(){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.get({
                fileId: this.fileId,
                alt: 'media'
            }).then(res=>{
                this.param = JSON.parse(res.body);
                resolve(res);
            }, function (error) {
                console.log(error);
                reject(error.message);
            });
        });
    }

    async write(){
        return new Promise((resolve, reject)=> {
            gapi.client.request({
                path : "upload/drive/v3/files/" + this.fileId,
                method : "PATCH",
                params : {
                    uploadType : "media"
                },
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify(this.param)
            }).then(res=>{
                resolve(JSON.parse(res.body));
            }, function (error) {
                console.log(error);
                reject(error.message);
            });
        });
    }

    async exists(){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.list({
                q: "name = 'settings.json'",
                spaces: 'appDataFolder'
            }).then(res=>{
                if (res.result.files.length > 0){
                    this.fileId = res.result.files[0].id;
                    resolve(true);
                }
                resolve(false);
            }, function (error) {
                reject(error.message);
            });
        });
    }
}

Parameters.filename = "settings.json";
module.exports = Parameters;
},{"./Authenticate.js":2}],8:[function(require,module,exports){
class Picker {
    constructor() {
        // The Browser API key obtained from the Google API Console.
        this.developerKey = 'AIzaSyABcdLmT6HH_7Go82q_IBGI3jm6UL4w4Q0';

        // The Client ID obtained from the Google API Console. Replace with your own Client ID.
        this.clientId = "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com"

        // Replace with your own project number from console.developers.google.com.
        this.appId = "158823134681";

        // Scope to use to access user's Drive items.
        this.scope = ['https://www.googleapis.com/auth/drive.file'];

        this.oauthToken = null;
    }

    // Use the Google API Loader script to load the google.picker script.
    loadPicker() {
        return new Promise((resolve, reject) => {
            if (this.oauthToken === null) {
                console.log("authorize");
                gapi.load('picker', {
                    'callback': () => {
                        gapi.load('auth2', {'callback': () => this.onAuthApiLoad(resolve, reject)});
                    }
                });
            } else {
                resolve();
            }
        });
    }

    onAuthApiLoad(resolve, reject) {
        const param = {
            'client_id': this.clientId,
            'scope': this.scope,
            'immediate': false
        }

        window.gapi.auth2.authorize(param, (authResult) => this.handleAuthResult(authResult, resolve, reject));
    }

    handleAuthResult(authResult, resolve, reject) {
        if (authResult && !authResult.error) {
            this.oauthToken = authResult.access_token;
            resolve();
        } else {
            reject(authResult);
        }
    }

    // Create and render a Picker object for searching images.
    dirPicker() {
        console.log("createPicker");
        if (this.oauthToken) {
            let view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
                .setIncludeFolders(true)
                .setSelectFolderEnabled(true)
            ;

            let picker = new google.picker.PickerBuilder()
                .enableFeature(google.picker.Feature.NAV_HIDDEN)
                .addView(view)
                .setAppId(this.appId)
                .setOAuthToken(this.oauthToken)
                .setDeveloperKey(this.developerKey)
                .setCallback(this.pickerCallback)
                .build();
            picker.setVisible(true);
        }
    }

    // Create and render a Picker object for searching images.
    filePicker() {
        let view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
            .setIncludeFolders(true)
            .setParent('root')
            .setMimeTypes("json");
        ;

        if (this.pickerApiLoaded && this.oauthToken) {
            let picker = new google.picker.PickerBuilder()
                .enableFeature(google.picker.Feature.NAV_HIDDEN)
                .addView(view)
                .setAppId(this.appId)
                .setOAuthToken(this.oauthToken)
                .setDeveloperKey(this.developerKey)
                .setCallback(this.pickerCallback)
                // .addView(new google.picker.DocsUploadView())
                .build();
            picker.setVisible(true);
        }
    }


    // Override this method on use.
    pickerCallback(data) {
    }
}

module.exports = Picker;


},{}],9:[function(require,module,exports){

module.exports = {
    // The Browser API key obtained from the Google API Console.
    developerKey : 'AIzaSyABcdLmT6HH_7Go82q_IBGI3jm6UL4w4Q0',

    // The Client ID obtained from the Google API Console. Replace with your own Client ID.
    clientId : "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com",

    // Replace with your own project number from console.developers.google.com.
    appId : "158823134681",

    // Array of API discovery doc URLs for APIs used by the quickstart
    discoveryDocs : ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],

    // Scope to use to access user's Drive items.
    scope: "https://www.googleapis.com/auth/drive.file"
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2hvbWUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvQXV0aGVudGljYXRlLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0ZpbGVMaXN0LmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0ZpbGVPcHMuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRmlsZVBpY2tlci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9Nb2RlbC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9QYXJhbWV0ZXJzLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL1BpY2tlci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9nb29nbGVGaWVsZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgUGlja2VyID0gcmVxdWlyZShcIi4vbW9kdWxlcy9QaWNrZXIuanNcIik7XHJcbmNvbnN0IEZpbGVQaWNrZXIgPSByZXF1aXJlKFwiLi9tb2R1bGVzL0ZpbGVQaWNrZXIuanNcIik7XHJcbmNvbnN0IE1vZGVsID0gcmVxdWlyZShcIi4vbW9kdWxlcy9Nb2RlbC5qc1wiKTtcclxuY29uc3QgRmlsZU9wcyA9IHJlcXVpcmUoXCIuL21vZHVsZXMvRmlsZU9wcy5qc1wiKTtcclxuY29uc3QgUGFyYW1ldGVycyA9IHJlcXVpcmUoXCIuL21vZHVsZXMvUGFyYW1ldGVycy5qc1wiKTtcclxucmVxdWlyZShcIi4vbW9kdWxlcy9GaWxlTGlzdC5qc1wiKTtcclxuXHJcbndpbmRvdy5GaWxlT3BzID0gRmlsZU9wcztcclxuXHJcbmxldCBmb2xkZXJJZCA9IG51bGw7XHJcbmxldCBmaWxlT3BzID0gbmV3IEZpbGVPcHMoKTtcclxud2luZG93LmZpbGVPcHMgPSBmaWxlT3BzO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGFzeW5jICgpPT57XHJcbiAgICBhd2FpdCBmaWxlT3BzLmxvYWQoKTtcclxuICAgIGFkZE1lbnVMaXN0ZW5lcnMoKTtcclxuICAgIHNldHVwRmlsZUxpc3QoKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBzZXR1cEZpbGVMaXN0KCl7XHJcbiAgICBsZXQgZmlsZUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZmlsZS1saXN0XCIpO1xyXG5cclxuICAgIGZpbGVMaXN0LmRlbCA9IGFzeW5jIChpZCkgPT4ge1xyXG4gICAgICAgIGZpbGVMaXN0LmJ1c3kgPSB0cnVlO1xyXG4gICAgICAgIGF3YWl0IGZpbGVPcHMuZGVsZXRlKGlkKTtcclxuICAgICAgICBwb3B1bGF0ZUZpbGVMaXN0KCk7XHJcbiAgICAgICAgZmlsZUxpc3QuYnVzeSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZmlsZUxpc3QuY2IgPSAoaWQpID0+IHdpbmRvdy5sb2NhdGlvbiA9IGBlZGl0b3IuaHRtbD9hY3Rpb249bG9hZCZmaWxlSWQ9JHtpZH1gO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRNZW51TGlzdGVuZXJzKCl7XHJcbiAgICBsZXQgYnVzeUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYnVzeS1ib3hcIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NyZWF0ZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImNsaWNrXCIpO1xyXG4gICAgICAgIGJ1c3lCb3guY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBsZXQgbW9kZWwgPSBuZXcgTW9kZWwoKS5pbml0KFwiR2FtZSBOYW1lXCIpO1xyXG4gICAgICAgIGxldCBmcCA9IGF3YWl0IGZpbGVPcHMuY3JlYXRlKCk7XHJcbiAgICAgICAgYXdhaXQgZmlsZU9wcy5zZXRCb2R5KGZwLCBKU09OLnN0cmluZ2lmeShtb2RlbC5nZXQoKSwgbnVsbCwgMikpO1xyXG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5vcmlnaW4gKyBcIi9lZGl0b3IuaHRtbD9hY3Rpb249bG9hZCZmaWxlSWQ9XCIgKyBmcDtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbG9hZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICBwb3B1bGF0ZUZpbGVMaXN0KCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcG9wdWxhdGVGaWxlTGlzdCgpe1xyXG4gICAgbGV0IGJ1c3lCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ1c3ktYm94XCIpO1xyXG4gICAgbGV0IGZpbGVMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImZpbGUtbGlzdFwiKTtcclxuXHJcbiAgICBmaWxlTGlzdC5zaG93KCk7XHJcbiAgICBmaWxlTGlzdC5idXN5ID0gdHJ1ZTtcclxuICAgIGZpbGVMaXN0LmNsZWFyKCk7XHJcblxyXG4gICAgbGV0IGxpc3QgPSBhd2FpdCBmaWxlT3BzLmxpc3QoKTtcclxuICAgIGZvciAobGV0IGl0ZW0gb2YgbGlzdCl7XHJcbiAgICAgICAgbGV0IGkgPSBpdGVtLm5hbWUuaW5kZXhPZihcIi5cIik7XHJcbiAgICAgICAgZmlsZUxpc3QuYWRkSXRlbShpdGVtLm5hbWUuc3Vic3RyKDAsIGkpLCBpdGVtLmlkKTtcclxuICAgIH1cclxuICAgIGZpbGVMaXN0LmJ1c3kgPSBmYWxzZTtcclxufVxyXG5cclxud2luZG93LnBvcHVsYXRlRmlsZUxpc3QgPSBwb3B1bGF0ZUZpbGVMaXN0OyIsIi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY2xhc3MgQXV0aGVudGljYXRlIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCByZXF1aXJlKFwiLi9nb29nbGVGaWVsZHMuanNcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5sb2FkKCdjbGllbnQ6YXV0aDInLCAoKSA9PiB0aGlzLl9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfX2luaXRDbGllbnQocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZ2FwaS5jbGllbnQuaW5pdCh7XHJcbiAgICAgICAgICAgIGFwaUtleTogdGhpcy5kZXZlbG9wZXJLZXksXHJcbiAgICAgICAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICBkaXNjb3ZlcnlEb2NzOiB0aGlzLmRpc2NvdmVyeURvY3MsXHJcbiAgICAgICAgICAgIHNjb3BlOiB0aGlzLnNjb3BlXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIElOSVRcIik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpc0F1dGhvcml6ZWQoKXtcclxuICAgICAgICB2YXIgdXNlciA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuY3VycmVudFVzZXIuZ2V0KCk7XHJcbiAgICAgICAgcmV0dXJuIHVzZXIuaGFzR3JhbnRlZFNjb3Blcyh0aGlzLnNjb3BlKTtcclxuICAgIH1cclxuXHJcbiAgICBzaWduSW4oKXtcclxuICAgICAgICBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLnNpZ25JbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpZ25PdXQoKXtcclxuICAgICAgICBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLnNpZ25PdXQoKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXV0aGVudGljYXRlOyIsIlxyXG5jbGFzcyBGaWxlTGlzdCBleHRlbmRzIEhUTUxFbGVtZW50e1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIocHJvcHMpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoZXZlbnQpPT50aGlzLmxvYWQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZCgpe1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIi5jbG9zZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKXtcclxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFwiLmZpbGUtaXRlbVwiKSl7XHJcbiAgICAgICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNpbm5lci1saXN0XCIpLnJlbW92ZUNoaWxkKGVsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZEl0ZW0oZmlsZW5hbWUsIGlkKXtcclxuICAgICAgICBsZXQgbWV0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgbWV0YS5jbGFzc0xpc3QuYWRkKFwiZmlsZS1pdGVtXCIpO1xyXG4gICAgICAgIG1ldGEuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBpZCk7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2lubmVyLWxpc3RcIikuYXBwZW5kQ2hpbGQobWV0YSk7XHJcblxyXG4gICAgICAgIGxldCBlbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICBlbGUuY2xhc3NMaXN0LmFkZChcImZpbGUtbmFtZVwiKTtcclxuICAgICAgICBlbGUuaW5uZXJUZXh0ID0gZmlsZW5hbWU7XHJcbiAgICAgICAgbWV0YS5hcHBlbmRDaGlsZChlbGUpO1xyXG5cclxuICAgICAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLmNiKGlkKSk7XHJcblxyXG4gICAgICAgIGVsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgIGVsZS5jbGFzc0xpc3QuYWRkKFwiZGVsZXRlXCIpO1xyXG4gICAgICAgIGVsZS5pbm5lclRleHQgPSBcIkRlbGV0ZVwiO1xyXG4gICAgICAgIG1ldGEuYXBwZW5kQ2hpbGQoZWxlKTtcclxuXHJcbiAgICAgICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5kZWwoaWQpKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCl7XHJcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGUoKXtcclxuICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGJ1c3kodmFsdWUpe1xyXG4gICAgICAgIGlmICh2YWx1ZSkgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2ZpbGUtbGlzdC1idXN5XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgZWxzZSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZmlsZS1saXN0LWJ1c3lcIikuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZmlsZS1saXN0JywgRmlsZUxpc3QpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVMaXN0OyIsIlwidXNlIHN0cmljdFwiO1xyXG4vLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZHJpdmUvYXBpL3YzL3F1aWNrc3RhcnQvanM/aGw9ZW5cclxuXHJcbmNsYXNzIEZpbGVPcHMge1xyXG5cclxuICAgIGFzeW5jIGxvYWQoKXtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvYWRDbGllbnQoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvYWREcml2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5sb2FkKCdjbGllbnQnLCAoKSA9PiByZXNvbHZlKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWREcml2ZSgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5sb2FkKCdkcml2ZScsICd2MycsIHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlKCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgbmFtZSA6IEZpbGVPcHMuZmlsZW5hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRzOiBbJ2FwcERhdGFGb2xkZXInXSxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogXCJpZFwiXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQuaWQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGRlbGV0ZShmaWxlSWQpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZGVsZXRlKHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZCA6IGZpbGVJZFxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0KTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGxpc3QoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmxpc3Qoe1xyXG4gICAgICAgICAgICAgICAgLy8gcTogYG5hbWUgY29udGFpbnMgJy5qc29uJ2AsXHJcbiAgICAgICAgICAgICAgICBzcGFjZXM6ICdhcHBEYXRhRm9sZGVyJyxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogJ2ZpbGVzL25hbWUsZmlsZXMvaWQsZmlsZXMvbW9kaWZpZWRUaW1lJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0LmZpbGVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXQoZmlsZUlkKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmdldCh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIGFsdDogJ21lZGlhJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc2V0Qm9keShmaWxlSWQsIGJvZHkpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XHJcbiAgICAgICAgICAgICAgICBwYXRoIDogXCJ1cGxvYWQvZHJpdmUvdjMvZmlsZXMvXCIgKyBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBtZXRob2QgOiBcIlBBVENIXCIsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkVHlwZSA6IFwibWVkaWFcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvblwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYm9keSA6IGJvZHlcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVuYW1lKGZpbGVJZCwgZmlsZW5hbWUpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogZmlsZW5hbWVcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkZpbGVPcHMuZmlsZW5hbWUgPSBcIkdhbWUgTmFtZS5qc29uXCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHM7IiwiY29uc3QgUGlja2VyID0gcmVxdWlyZShcIi4vUGlja2VyLmpzXCIpO1xyXG5cclxuY2xhc3MgRmlsZVBpY2tlciBleHRlbmRzIFBpY2tlcntcclxuICAgIC8vIENyZWF0ZSBhbmQgcmVuZGVyIGEgUGlja2VyIG9iamVjdCBmb3Igc2VhcmNoaW5nIGltYWdlcy5cclxuICAgIGNyZWF0ZVBpY2tlcigpIHtcclxuICAgICAgICBsZXQgdmlldyA9IG5ldyBnb29nbGUucGlja2VyLkRvY3NWaWV3KGdvb2dsZS5waWNrZXIuVmlld0lkLkZPTERFUlMpXHJcbiAgICAgICAgICAgIC5zZXRJbmNsdWRlRm9sZGVycyh0cnVlKVxyXG4gICAgICAgICAgICAuc2V0UGFyZW50KCdyb290JylcclxuICAgICAgICAgICAgLnNldE1pbWVUeXBlcyhcImpzb25cIik7XHJcbiAgICAgICAgO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5waWNrZXJBcGlMb2FkZWQgJiYgdGhpcy5vYXV0aFRva2VuKSB7XHJcbiAgICAgICAgICAgIGxldCBwaWNrZXIgPSBuZXcgZ29vZ2xlLnBpY2tlci5QaWNrZXJCdWlsZGVyKClcclxuICAgICAgICAgICAgICAgIC5lbmFibGVGZWF0dXJlKGdvb2dsZS5waWNrZXIuRmVhdHVyZS5OQVZfSElEREVOKVxyXG4gICAgICAgICAgICAgICAgLmFkZFZpZXcodmlldylcclxuICAgICAgICAgICAgICAgIC5zZXRBcHBJZCh0aGlzLmFwcElkKVxyXG4gICAgICAgICAgICAgICAgLnNldE9BdXRoVG9rZW4odGhpcy5vYXV0aFRva2VuKVxyXG4gICAgICAgICAgICAgICAgLnNldERldmVsb3BlcktleSh0aGlzLmRldmVsb3BlcktleSlcclxuICAgICAgICAgICAgICAgIC5zZXRDYWxsYmFjayh0aGlzLnBpY2tlckNhbGxiYWNrKVxyXG4gICAgICAgICAgICAgICAgLy8gLmFkZFZpZXcobmV3IGdvb2dsZS5waWNrZXIuRG9jc1VwbG9hZFZpZXcoKSlcclxuICAgICAgICAgICAgICAgIC5idWlsZCgpO1xyXG4gICAgICAgICAgICBwaWNrZXIuc2V0VmlzaWJsZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQSBzaW1wbGUgY2FsbGJhY2sgaW1wbGVtZW50YXRpb24uXHJcbiAgICAvLyBPdmVycmlkZSB0aGlzIG1ldGhvZCBvbiB1c2UuXHJcbiAgICBwaWNrZXJDYWxsYmFjayhkYXRhKSB7XHJcbiAgICAgICAgaWYgKGRhdGEuYWN0aW9uID09PSBnb29nbGUucGlja2VyLkFjdGlvbi5QSUNLRUQpIHtcclxuICAgICAgICAgICAgdmFyIGZpbGVJZCA9IGRhdGEuZG9jc1swXS5pZDtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYGVkaXRvci5odG1sP2FjdGlvbj1sb2FkJmZpbGVJZD0ke2ZpbGVJZH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWxlUGlja2VyO1xyXG5cclxuIiwiY2xhc3MgTW9kZWwge1xyXG4gICAgaW5pdChuYW1lID0gXCJHYW1lIE5hbWVcIikge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdW5kID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIHJvdW5kczogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZENhdGVnb3J5Um91bmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXQgbmFtZShzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5uYW1lID0gc3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHNldChnYW1lTW9kZWwpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCA9IDA7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3VuZChpbmRleCkge1xyXG4gICAgICAgIGluZGV4ID0gaW5kZXggPz8gdGhpcy5jdXJyZW50Um91bmQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLnJvdW5kc1tpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sdW1uKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um91bmQoKS5jb2x1bW5baW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENlbGwocm93LCBjb2x1bW4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb2x1bW4oY29sdW1uKS5jZWxsW3Jvd107XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlUm91bmQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucm91bmRDb3VudCA9PT0gMSkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5zcGxpY2UodGhpcy5jdXJyZW50Um91bmQsIDEpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3VuZCA+PSB0aGlzLnJvdW5kQ291bnQpIHRoaXMuY3VycmVudFJvdW5kID0gdGhpcy5yb3VuZENvdW50IC0gMTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRNdWx0aXBsZUNob2ljZVJvdW5kKCl7XHJcbiAgICAgICAgbGV0IHJvdW5kID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBNb2RlbC5xdWVzdGlvblR5cGUuTVVMVElQTEVfQ0hPSUNFLFxyXG4gICAgICAgICAgICBxdWVzdGlvbiA6IFwiXCIsXHJcbiAgICAgICAgICAgIGFuc3dlcnMgOiBbXHJcbiAgICAgICAgICAgICAgICAvLyB2YWx1ZSA6IHt0cnVlLCBmYWxzZX0sIHRleHRcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQ2F0ZWdvcnlSb3VuZCgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5DQVRFR09SWSxcclxuICAgICAgICAgICAgY29sdW1uOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXSA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgY2VsbDogW11cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAoaiArIDEpICogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHE6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYTogXCJcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMucHVzaChyb3VuZCk7XHJcbiAgICAgICAgcmV0dXJuIHJvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCByb3VuZENvdW50KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIGluY3JlYXNlVmFsdWUoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0gdGhpcy5nZXRSb3VuZCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0udmFsdWUgKj0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNyZWFzZVZhbHVlKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHRoaXMuZ2V0Um91bmQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdLnZhbHVlIC89IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbk1vZGVsLnF1ZXN0aW9uVHlwZSA9IHtcclxuICAgIENBVEVHT1JZIDogXCJjaG9pY2VcIixcclxuICAgIE1VTFRJUExFX0NIT0lDRSA6IFwibXVsdGlwbGVfY2hvaWNlXCJcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kZWw7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IEFic3RyYWN0RmlsZXMgPSByZXF1aXJlKFwiLi9BdXRoZW50aWNhdGUuanNcIik7XHJcblxyXG5jbGFzcyBQYXJhbWV0ZXJzIGV4dGVuZHMgQWJzdHJhY3RGaWxlc3tcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wYXJhbSA9IHtcclxuICAgICAgICAgICAgbGFzdF9maWxlIDogXCJcIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjcmVhdGUoZGlyVG9rZW4pe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgIG5hbWUgOiBQYXJhbWV0ZXJzLmZpbGVuYW1lLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50czogWydhcHBEYXRhRm9sZGVyJ10sXHJcbiAgICAgICAgICAgICAgICBmaWVsZHM6IFwiaWRcIlxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsZUlkID0gcmVzLnJlc3VsdC5pZDtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVhZCgpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZ2V0KHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogdGhpcy5maWxlSWQsXHJcbiAgICAgICAgICAgICAgICBhbHQ6ICdtZWRpYSdcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyYW0gPSBKU09OLnBhcnNlKHJlcy5ib2R5KTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHdyaXRlKCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5yZXF1ZXN0KHtcclxuICAgICAgICAgICAgICAgIHBhdGggOiBcInVwbG9hZC9kcml2ZS92My9maWxlcy9cIiArIHRoaXMuZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kIDogXCJQQVRDSFwiLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZFR5cGUgOiBcIm1lZGlhXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCIgOiBcImFwcGxpY2F0aW9uL2pzb25cIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJvZHkgOiBKU09OLnN0cmluZ2lmeSh0aGlzLnBhcmFtKVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBleGlzdHMoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmxpc3Qoe1xyXG4gICAgICAgICAgICAgICAgcTogXCJuYW1lID0gJ3NldHRpbmdzLmpzb24nXCIsXHJcbiAgICAgICAgICAgICAgICBzcGFjZXM6ICdhcHBEYXRhRm9sZGVyJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcy5yZXN1bHQuZmlsZXMubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlSWQgPSByZXMucmVzdWx0LmZpbGVzWzBdLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5QYXJhbWV0ZXJzLmZpbGVuYW1lID0gXCJzZXR0aW5ncy5qc29uXCI7XHJcbm1vZHVsZS5leHBvcnRzID0gUGFyYW1ldGVyczsiLCJjbGFzcyBQaWNrZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gVGhlIEJyb3dzZXIgQVBJIGtleSBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuXHJcbiAgICAgICAgdGhpcy5kZXZlbG9wZXJLZXkgPSAnQUl6YVN5QUJjZExtVDZISF83R284MnFfSUJHSTNqbTZVTDR3NFEwJztcclxuXHJcbiAgICAgICAgLy8gVGhlIENsaWVudCBJRCBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBDbGllbnQgSUQuXHJcbiAgICAgICAgdGhpcy5jbGllbnRJZCA9IFwiMTU4ODIzMTM0NjgxLTk4YmdrYW5nb2x0azYzNnVrZjhwb2ZlaXM3cGE3amJrLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXCJcclxuXHJcbiAgICAgICAgLy8gUmVwbGFjZSB3aXRoIHlvdXIgb3duIHByb2plY3QgbnVtYmVyIGZyb20gY29uc29sZS5kZXZlbG9wZXJzLmdvb2dsZS5jb20uXHJcbiAgICAgICAgdGhpcy5hcHBJZCA9IFwiMTU4ODIzMTM0NjgxXCI7XHJcblxyXG4gICAgICAgIC8vIFNjb3BlIHRvIHVzZSB0byBhY2Nlc3MgdXNlcidzIERyaXZlIGl0ZW1zLlxyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBbJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZHJpdmUuZmlsZSddO1xyXG5cclxuICAgICAgICB0aGlzLm9hdXRoVG9rZW4gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSB0aGUgR29vZ2xlIEFQSSBMb2FkZXIgc2NyaXB0IHRvIGxvYWQgdGhlIGdvb2dsZS5waWNrZXIgc2NyaXB0LlxyXG4gICAgbG9hZFBpY2tlcigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vYXV0aFRva2VuID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImF1dGhvcml6ZVwiKTtcclxuICAgICAgICAgICAgICAgIGdhcGkubG9hZCgncGlja2VyJywge1xyXG4gICAgICAgICAgICAgICAgICAgICdjYWxsYmFjayc6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FwaS5sb2FkKCdhdXRoMicsIHsnY2FsbGJhY2snOiAoKSA9PiB0aGlzLm9uQXV0aEFwaUxvYWQocmVzb2x2ZSwgcmVqZWN0KX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25BdXRoQXBpTG9hZChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBjb25zdCBwYXJhbSA9IHtcclxuICAgICAgICAgICAgJ2NsaWVudF9pZCc6IHRoaXMuY2xpZW50SWQsXHJcbiAgICAgICAgICAgICdzY29wZSc6IHRoaXMuc2NvcGUsXHJcbiAgICAgICAgICAgICdpbW1lZGlhdGUnOiBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2luZG93LmdhcGkuYXV0aDIuYXV0aG9yaXplKHBhcmFtLCAoYXV0aFJlc3VsdCkgPT4gdGhpcy5oYW5kbGVBdXRoUmVzdWx0KGF1dGhSZXN1bHQsIHJlc29sdmUsIHJlamVjdCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUF1dGhSZXN1bHQoYXV0aFJlc3VsdCwgcmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgaWYgKGF1dGhSZXN1bHQgJiYgIWF1dGhSZXN1bHQuZXJyb3IpIHtcclxuICAgICAgICAgICAgdGhpcy5vYXV0aFRva2VuID0gYXV0aFJlc3VsdC5hY2Nlc3NfdG9rZW47XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWplY3QoYXV0aFJlc3VsdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgcmVuZGVyIGEgUGlja2VyIG9iamVjdCBmb3Igc2VhcmNoaW5nIGltYWdlcy5cclxuICAgIGRpclBpY2tlcigpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0ZVBpY2tlclwiKTtcclxuICAgICAgICBpZiAodGhpcy5vYXV0aFRva2VuKSB7XHJcbiAgICAgICAgICAgIGxldCB2aWV3ID0gbmV3IGdvb2dsZS5waWNrZXIuRG9jc1ZpZXcoZ29vZ2xlLnBpY2tlci5WaWV3SWQuRk9MREVSUylcclxuICAgICAgICAgICAgICAgIC5zZXRJbmNsdWRlRm9sZGVycyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgLnNldFNlbGVjdEZvbGRlckVuYWJsZWQodHJ1ZSlcclxuICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tlciA9IG5ldyBnb29nbGUucGlja2VyLlBpY2tlckJ1aWxkZXIoKVxyXG4gICAgICAgICAgICAgICAgLmVuYWJsZUZlYXR1cmUoZ29vZ2xlLnBpY2tlci5GZWF0dXJlLk5BVl9ISURERU4pXHJcbiAgICAgICAgICAgICAgICAuYWRkVmlldyh2aWV3KVxyXG4gICAgICAgICAgICAgICAgLnNldEFwcElkKHRoaXMuYXBwSWQpXHJcbiAgICAgICAgICAgICAgICAuc2V0T0F1dGhUb2tlbih0aGlzLm9hdXRoVG9rZW4pXHJcbiAgICAgICAgICAgICAgICAuc2V0RGV2ZWxvcGVyS2V5KHRoaXMuZGV2ZWxvcGVyS2V5KVxyXG4gICAgICAgICAgICAgICAgLnNldENhbGxiYWNrKHRoaXMucGlja2VyQ2FsbGJhY2spXHJcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcclxuICAgICAgICAgICAgcGlja2VyLnNldFZpc2libGUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgcmVuZGVyIGEgUGlja2VyIG9iamVjdCBmb3Igc2VhcmNoaW5nIGltYWdlcy5cclxuICAgIGZpbGVQaWNrZXIoKSB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSBuZXcgZ29vZ2xlLnBpY2tlci5Eb2NzVmlldyhnb29nbGUucGlja2VyLlZpZXdJZC5GT0xERVJTKVxyXG4gICAgICAgICAgICAuc2V0SW5jbHVkZUZvbGRlcnModHJ1ZSlcclxuICAgICAgICAgICAgLnNldFBhcmVudCgncm9vdCcpXHJcbiAgICAgICAgICAgIC5zZXRNaW1lVHlwZXMoXCJqc29uXCIpO1xyXG4gICAgICAgIDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGlja2VyQXBpTG9hZGVkICYmIHRoaXMub2F1dGhUb2tlbikge1xyXG4gICAgICAgICAgICBsZXQgcGlja2VyID0gbmV3IGdvb2dsZS5waWNrZXIuUGlja2VyQnVpbGRlcigpXHJcbiAgICAgICAgICAgICAgICAuZW5hYmxlRmVhdHVyZShnb29nbGUucGlja2VyLkZlYXR1cmUuTkFWX0hJRERFTilcclxuICAgICAgICAgICAgICAgIC5hZGRWaWV3KHZpZXcpXHJcbiAgICAgICAgICAgICAgICAuc2V0QXBwSWQodGhpcy5hcHBJZClcclxuICAgICAgICAgICAgICAgIC5zZXRPQXV0aFRva2VuKHRoaXMub2F1dGhUb2tlbilcclxuICAgICAgICAgICAgICAgIC5zZXREZXZlbG9wZXJLZXkodGhpcy5kZXZlbG9wZXJLZXkpXHJcbiAgICAgICAgICAgICAgICAuc2V0Q2FsbGJhY2sodGhpcy5waWNrZXJDYWxsYmFjaylcclxuICAgICAgICAgICAgICAgIC8vIC5hZGRWaWV3KG5ldyBnb29nbGUucGlja2VyLkRvY3NVcGxvYWRWaWV3KCkpXHJcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcclxuICAgICAgICAgICAgcGlja2VyLnNldFZpc2libGUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBPdmVycmlkZSB0aGlzIG1ldGhvZCBvbiB1c2UuXHJcbiAgICBwaWNrZXJDYWxsYmFjayhkYXRhKSB7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGlja2VyO1xyXG5cclxuIiwiXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLy8gVGhlIEJyb3dzZXIgQVBJIGtleSBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuXHJcbiAgICBkZXZlbG9wZXJLZXkgOiAnQUl6YVN5QUJjZExtVDZISF83R284MnFfSUJHSTNqbTZVTDR3NFEwJyxcclxuXHJcbiAgICAvLyBUaGUgQ2xpZW50IElEIG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS4gUmVwbGFjZSB3aXRoIHlvdXIgb3duIENsaWVudCBJRC5cclxuICAgIGNsaWVudElkIDogXCIxNTg4MjMxMzQ2ODEtOThiZ2thbmdvbHRrNjM2dWtmOHBvZmVpczdwYTdqYmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIixcclxuXHJcbiAgICAvLyBSZXBsYWNlIHdpdGggeW91ciBvd24gcHJvamVjdCBudW1iZXIgZnJvbSBjb25zb2xlLmRldmVsb3BlcnMuZ29vZ2xlLmNvbS5cclxuICAgIGFwcElkIDogXCIxNTg4MjMxMzQ2ODFcIixcclxuXHJcbiAgICAvLyBBcnJheSBvZiBBUEkgZGlzY292ZXJ5IGRvYyBVUkxzIGZvciBBUElzIHVzZWQgYnkgdGhlIHF1aWNrc3RhcnRcclxuICAgIGRpc2NvdmVyeURvY3MgOiBbXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9kcml2ZS92My9yZXN0XCJdLFxyXG5cclxuICAgIC8vIFNjb3BlIHRvIHVzZSB0byBhY2Nlc3MgdXNlcidzIERyaXZlIGl0ZW1zLlxyXG4gICAgc2NvcGU6IFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5maWxlXCJcclxufSJdfQ==
