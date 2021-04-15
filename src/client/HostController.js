
class HostController{

    constructor(ws, view) {
        this.ws = ws;
        this.view = view;

        this.ws.addEventListener('message', (event) => this.process(JSON.parse(event.data)));
        this.ws.addEventListener('close', (event) => this.onClose(event));

        window.start = function(){
            this.send({action : "start"});
        }.bind(this);
    }

    onUpdate(){

    }

    process(message){
        if (message.action !== "ping") console.log(message);
        switch (message.action) {
            case "connection_established":
                this.send({action : "request_model"});
                break;
            case "update_model":
                this.view.updateModel(message.data);
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

export default HostController;