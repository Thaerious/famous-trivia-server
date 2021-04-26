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

export default connectWebsocket;