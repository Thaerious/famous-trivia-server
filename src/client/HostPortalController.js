
class HostPortalController {
    constructor(ws, view) {
        this.ws = ws;
        this.view = view;

        this.ws.addEventListener('message', (event) => this.process(JSON.parse(event.data)));
        this.ws.addEventListener('close', (event) => this.onClose(event));

        this.view.addEventListener('click', (event)=>this.send(event.detail));
        this.view.addEventListener('cell-select', (event)=>this.send(event.detail));

        window.buzz = function(name){
            this.send({action : "buzz", data : {name : name}});
        }.bind(this);
    }

    onUpdate(){

    }

    /**
     * Incoming messages get processed here.
     * @param message
     */
    process(message){
        if (message.action !== "ping" && message.action !== "update_timer") console.log(message);
        switch (message.action) {
            case "connection_established":
                this.send({action : "request_model"});
                break;
            case "update_model":
                this.view.updateModel(message.data);
                break;
            case "start_timer":
                this.view.startTimer(message.data);
                break;
            case "update_timer":
                this.view.updateTimer(message.data);
                break;
            case "stop_timer":
                this.view.stopTimer(message.data);
                break;
        }
    }

    onClose(event){

    }

    send(msg){
        console.log(`send: ${JSON.stringify(msg)}`);
        this.ws.send(JSON.stringify(msg));
    }
}

export default HostPortalController;