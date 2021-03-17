// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

class Authenticate {
    constructor(){
        Object.assign(this, require("./googleFields.js"));
    }

    loadClient() {
        return new Promise((resolve, reject) => {
            gapi.load('client', () => this.__initClient(resolve, reject));
        });
        // if (gapi.auth2){
        //     return new Promise((resolve, reject) => {
        //         gapi.load('client', () => this.__initClient(resolve, reject));
        //     });
        // } else {
        //     return new Promise((resolve, reject) => {
        //         gapi.load('client:auth2', () => this.__initClient(resolve, reject));
        //     });
        // }
    }

    __initClient(resolve, reject) {
        console.log("initializing auth 2");
        gapi.client.init({
            apiKey: this.developerKey,
            clientId: this.clientId,
            discoveryDocs: this.discoveryDocs,
            scope: this.scope
        }).then(function (result) {
            console.log("RESOLVE INIT");
            console.log(result);
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