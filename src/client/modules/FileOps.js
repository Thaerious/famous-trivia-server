// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

class FileOps {
    constructor(){
        // The Browser API key obtained from the Google API Console.
        this.developerKey = 'AIzaSyABcdLmT6HH_7Go82q_IBGI3jm6UL4w4Q0';

        // The Client ID obtained from the Google API Console. Replace with your own Client ID.
        this.clientId = "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com"

        // Replace with your own project number from console.developers.google.com.
        this.appId = "158823134681";

        // Array of API discovery doc URLs for APIs used by the quickstart
        this.discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

        // Scope to use to access user's Drive items.
        this.scope = 'https://www.googleapis.com/auth/drive.file';

        this.fileApiLoaded = false;
        this.oauthToken = null;
    }

    loadClient() {
        return new Promise((resolve, reject)=> {
            gapi.load('client:auth2', ()=>this.initClient(resolve, reject));
        });
    }

    initClient(resolve, reject) {
        gapi.client.init({
            apiKey: this.developerKey,
            clientId: this.clientId,
            discoveryDocs: this.discoveryDocs,
            scope: this.scope
        }).then(function () {
            resolve();
        }, function(error) {
            reject(error);
        });
    }

    async create(dirToken, filename){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.create({
                name: filename,
                parents: [dirToken]
            }).then(res=>{
                resolve(JSON.parse(res.body));
            }, function (error) {
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

module.exports = FileOps;