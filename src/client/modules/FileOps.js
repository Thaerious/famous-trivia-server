"use strict";
// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

const AbstractFiles = require("./AbstractFile.js");

class FileOps extends AbstractFiles{
    constructor(){
        super();
    }

    async create(){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.create({
                name : FileOps.filename,
                parents: ['appDataFolder'],
                fields: "id"
            }).then(res=>{
                resolve(res.result.id);
            }, function (error) {
                reject(error.message);
            });
        });
    }

    async delete(fileId){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.delete({
                fileId : fileId
            }).then(res=>{
                resolve(res.result);
            }, function (error) {
                reject(error.message);
            });
        });
    }

    async list(){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.list({
                // q: `name contains '.json'`,
                spaces: 'appDataFolder',
                fields: 'files/name,files/id,files/modifiedTime'
            }).then(res=>{
                resolve(res.result.files);
            }, function (error) {
                reject(error.message);
            });
        });
    }

    async get(fileId){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            }).then(res=>{
                resolve(res);
            }, function (error) {
                console.log(error);
                reject(error.message);
            });
        });
    }

    async setBody(fileId, body){
        return new Promise((resolve, reject)=> {
            gapi.client.request({
                path : "upload/drive/v3/files/" + fileId,
                method : "PATCH",
                params : {
                    uploadType : "media"
                },
                headers : {
                    "Content-Type" : "application/json"
                },
                body : body
            }).then(res=>{
                resolve(JSON.parse(res.body));
            }, function (error) {
                console.log(error);
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

FileOps.filename = "Game Name.json";

module.exports = FileOps;