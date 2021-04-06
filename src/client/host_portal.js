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
        connectToServer();
    } catch (err) {
        console.log(err);
    }

    let end = new Date();
    let time = end - start;
    console.log("Load Time " + time + " ms");
}

function connectToServer(){
    let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    var xhttp = new XMLHttpRequest();

    xhttp.addEventListener("load", (event) => {
        console.log(xhttp.responseText);
    });

    xhttp.open("POST", "connect-host");
    xhttp.setRequestHeader("Content-type", "application/json");

    const msg = JSON.stringify({
        token: token
    });

    console.log(token);
    console.log(msg);
    xhttp.send(msg);
}