// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

class AbstractFile {
    constructor(){
        Object.assign(this, require("./googleFields.js"));
    }

    loadClient() {
        return new Promise((resolve, reject)=> {
            gapi.load('client:auth2', ()=>this.__initClient(resolve, reject));
        });
    }

    __initClient(resolve, reject) {
        gapi.client.init({
            apiKey: this.developerKey,
            clientId: this.clientId,
            discoveryDocs: this.discoveryDocs,
            scope: this.scope
        }).then(function () {
            resolve();
        }, function(error) {
            console.log(error);
            reject(error);
        });
    }
}

module.exports = AbstractFile;