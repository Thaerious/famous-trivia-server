import FileOps from "./modules/FileOps.js";
import Authenticate from "./modules/Authenticate.js";
import HostPortalView from "./HostPortalView.js";
import HostPortalController from "./HostPortalController";

let fileOps = new FileOps();
let model = null;
let questionPane = null;
let editorPane = null;

window.onload = async () => {
    let start = new Date();

    window.hostView = new HostPortalView();

    // new Menu().init("#menu")host_portal.js;

    try {
        await new Authenticate().loadClient();
        await fileOps.loadClient();
        await sendTokenToServer();
        let ws = await connectWebsocket();
        new HostPortalController(ws, window.hostView);

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
        socket.addEventListener('error', (event) => reject(event));
        socket.addEventListener('open', (event) => resolve(socket));
    });
}