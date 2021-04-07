import FileOps from "./modules/FileOps.js";
import Authenticate from "./modules/Authenticate.js";
import Menu from "./modules/Menu.js";
import QuestionPane from "./modules/QuestionPane.js";
import EditorPane from "./modules/EditorPane.js";
import Model from "./modules/Model";
const Nidget = require("@thaerious/nidget")

import "./modules/GameBoard.js";
import "./modules/MultipleChoicePane.js";
import "./modules/CheckBox.js";
import HostController from "./HostController";

let fileOps = new FileOps();
let model = null;
let questionPane = null;
let editorPane = null;

window.onload = async () => {
    let start = new Date();

    // new Menu().init("#menu");

    try {
        await new Authenticate().loadClient();
        await fileOps.loadClient();
        await sendTokenToServer();
        let ws = await connectWebsocket();
        new HostController(ws);
    } catch (err) {
        console.log(err);
    }

    let end = new Date();
    let time = end - start;
    console.log("Load Time " + time + " ms");
}

function sendTokenToServer(){
    return new Promise((resolve, reject)=> {
        let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
        var xhttp = new XMLHttpRequest();

        xhttp.addEventListener("load", (event) => {
            let response = JSON.parse(xhttp.responseText);
            if (response.result === "success") resolve();
            else reject(new Error("token rejected"));
        });

        xhttp.open("POST", "connect-host");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({token: token}));
    });
}

function connectWebsocket(){
    let url = window.origin;
    if (url.startsWith("http:")){
        url = "ws" + url.substr(4) + "/game-service.ws";
    } else {
        url = "wss" + url.substr(5) + "/game-service.ws";
    }

    return new Promise((resolve, reject)=>{
        let socket = new WebSocket(url);
        this.socket.addEventListener('error', (event) => reject(event));
        this.socket.addEventListener('open', (event) => resolve(event));
    });
}