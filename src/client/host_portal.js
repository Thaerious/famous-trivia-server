// noinspection SpellCheckingInspection

import FileOps from "./modules/FileOps.js";
import Authenticate from "./modules/Authenticate.js";
import HostPortalView from "./modules/HostPortalView.js";
import PortalController from "./modules/PortalController";
import connectWebsocket from "./modules/connectWebsocket.js";
import GameManagerService from "./modules/GameManagerService";
import constants from "../constants.js";
import setupSizeListener from "./modules/SetupSizeListener";

let gameManagerService = new GameManagerService();
let fileOps = new FileOps();
let model = null;
let questionPane = null;
let editorPane = null;

window.onload = async () => {
    let start = new Date();
    const hostView = new HostPortalView();

    setupSizeListener();

    try {
        await new Authenticate().loadClient();
        await fileOps.loadClient();
        await sendTokenToServer();
        let ws = await connectWebsocket();
        new PortalController(ws, hostView);

        document.querySelector("menu-container").addEventListener("add-players", ()=>{
            ws.send(JSON.stringify({action : "join", data : {name : "Adam"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Bert"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Carol"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Dave"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Edith"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Fran"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Garth"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Herbert"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Ira"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Jill"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Keith"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Lisa"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Matt"}}));
        });

        document.querySelector("menu-container").addEventListener("next", ()=>{
            ws.send(JSON.stringify({action : "next_round"}));
        });

        document.querySelector("menu-container").addEventListener("prev", ()=>{
            ws.send(JSON.stringify({action : "prev_round"}));
        });

        document.querySelector("menu-container").addEventListener("terminate", ()=>{
            let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
            gameManagerService.terminate(token);
            window.location = constants.locations.HOST;
        });

        window.addPlayers = function(){
            ws.send(JSON.stringify({action : "join", data : {name : "Adam"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Bert"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Carol"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Dave"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Edith"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Fran"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Garth"}}));
            ws.send(JSON.stringify({action : "join", data : {name : "Herbert"}}));
        }

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
        let xhttp = new XMLHttpRequest();

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