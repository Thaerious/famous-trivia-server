(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Picker = require("./modules/Picker.js");
const FilePicker = require("./modules/FilePicker.js");

window.onload = ()=> {
    document.querySelector("#create").addEventListener("click", (e) => {
        let picker = new Picker();
        picker.loadPicker();
    });

    document.querySelector("#load").addEventListener("click", async (e) => {
        let picker = new FilePicker();
        await picker.loadPicker();
    });
}

},{"./modules/FilePicker.js":2,"./modules/Picker.js":3}],2:[function(require,module,exports){
const Picker = require("./Picker.js");

class FilePicker extends Picker{
    // Create and render a Picker object for searching images.
    createPicker() {
        let view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
            .setIncludeFolders(true)
            .setParent('root')
            .setMimeTypes("json");
        ;

        if (this.pickerApiLoaded && this.oauthToken) {
            let picker = new google.picker.PickerBuilder()
                .enableFeature(google.picker.Feature.NAV_HIDDEN)
                .addView(view)
                .setAppId(this.appId)
                .setOAuthToken(this.oauthToken)
                .setDeveloperKey(this.developerKey)
                .setCallback(this.pickerCallback)
                // .addView(new google.picker.DocsUploadView())
                .build();
            picker.setVisible(true);
        }
    }

    // A simple callback implementation.
    // Override this method on use.
    pickerCallback(data) {
        if (data.action === google.picker.Action.PICKED) {
            var fileId = data.docs[0].id;
            window.location = `editor.html?action=load&fileId=${fileId}`;
        }
    }
}

module.exports = FilePicker;


},{"./Picker.js":3}],3:[function(require,module,exports){
class Picker {
    constructor() {
        // The Browser API key obtained from the Google API Console.
        this.developerKey = 'AIzaSyABcdLmT6HH_7Go82q_IBGI3jm6UL4w4Q0';

        // The Client ID obtained from the Google API Console. Replace with your own Client ID.
        this.clientId = "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com"

        // Replace with your own project number from console.developers.google.com.
        this.appId = "158823134681";

        // Scope to use to access user's Drive items.
        this.scope = ['https://www.googleapis.com/auth/drive.file'];

        this.pickerApiLoaded = false;
        this.oauthToken = null;
    }

    // Use the Google API Loader script to load the google.picker script.
    loadPicker() {
        gapi.load('auth2', {'callback': ()=>this.onAuthApiLoad()});
        gapi.load('picker', {'callback': ()=>this.onPickerApiLoad()});
    }

    onAuthApiLoad() {
        const param = {
            'client_id': this.clientId,
            'scope': this.scope,
            'immediate': false
        }

        window.gapi.auth2.authorize(param, (authResult)=>this.handleAuthResult(authResult));
    }

    onPickerApiLoad() {
        this.pickerApiLoaded = true;
        this.createPicker();
    }

    handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
            this.oauthToken = authResult.access_token;
            this.createPicker();
        } else {
            console.log(authResult);
        }
    }

    // Create and render a Picker object for searching images.
    createPicker() {
        if (this.pickerApiLoaded && this.oauthToken) {
            let view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
                .setIncludeFolders(true)
                .setSelectFolderEnabled(true)
            ;

            let picker = new google.picker.PickerBuilder()
                .enableFeature(google.picker.Feature.NAV_HIDDEN)
                .addView(view)
                .setAppId(this.appId)
                .setOAuthToken(this.oauthToken)
                .setDeveloperKey(this.developerKey)
                .setCallback(this.pickerCallback)
                .build();
            picker.setVisible(true);
        }
    }

    // A simple callback implementation.
    // Override this method on use.
    pickerCallback(data) {
        if (data.action === google.picker.Action.PICKED) {
            var fileId = data.docs[0].id;
            window.location = `editor.html?action=new&dirId=${fileId}`;
        }
    }
}

module.exports = Picker;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2hvbWUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRmlsZVBpY2tlci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9QaWNrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgUGlja2VyID0gcmVxdWlyZShcIi4vbW9kdWxlcy9QaWNrZXIuanNcIik7XHJcbmNvbnN0IEZpbGVQaWNrZXIgPSByZXF1aXJlKFwiLi9tb2R1bGVzL0ZpbGVQaWNrZXIuanNcIik7XHJcblxyXG53aW5kb3cub25sb2FkID0gKCk9PiB7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NyZWF0ZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgICBsZXQgcGlja2VyID0gbmV3IFBpY2tlcigpO1xyXG4gICAgICAgIHBpY2tlci5sb2FkUGlja2VyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2xvYWRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgbGV0IHBpY2tlciA9IG5ldyBGaWxlUGlja2VyKCk7XHJcbiAgICAgICAgYXdhaXQgcGlja2VyLmxvYWRQaWNrZXIoKTtcclxuICAgIH0pO1xyXG59XHJcbiIsImNvbnN0IFBpY2tlciA9IHJlcXVpcmUoXCIuL1BpY2tlci5qc1wiKTtcclxuXHJcbmNsYXNzIEZpbGVQaWNrZXIgZXh0ZW5kcyBQaWNrZXJ7XHJcbiAgICAvLyBDcmVhdGUgYW5kIHJlbmRlciBhIFBpY2tlciBvYmplY3QgZm9yIHNlYXJjaGluZyBpbWFnZXMuXHJcbiAgICBjcmVhdGVQaWNrZXIoKSB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSBuZXcgZ29vZ2xlLnBpY2tlci5Eb2NzVmlldyhnb29nbGUucGlja2VyLlZpZXdJZC5GT0xERVJTKVxyXG4gICAgICAgICAgICAuc2V0SW5jbHVkZUZvbGRlcnModHJ1ZSlcclxuICAgICAgICAgICAgLnNldFBhcmVudCgncm9vdCcpXHJcbiAgICAgICAgICAgIC5zZXRNaW1lVHlwZXMoXCJqc29uXCIpO1xyXG4gICAgICAgIDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGlja2VyQXBpTG9hZGVkICYmIHRoaXMub2F1dGhUb2tlbikge1xyXG4gICAgICAgICAgICBsZXQgcGlja2VyID0gbmV3IGdvb2dsZS5waWNrZXIuUGlja2VyQnVpbGRlcigpXHJcbiAgICAgICAgICAgICAgICAuZW5hYmxlRmVhdHVyZShnb29nbGUucGlja2VyLkZlYXR1cmUuTkFWX0hJRERFTilcclxuICAgICAgICAgICAgICAgIC5hZGRWaWV3KHZpZXcpXHJcbiAgICAgICAgICAgICAgICAuc2V0QXBwSWQodGhpcy5hcHBJZClcclxuICAgICAgICAgICAgICAgIC5zZXRPQXV0aFRva2VuKHRoaXMub2F1dGhUb2tlbilcclxuICAgICAgICAgICAgICAgIC5zZXREZXZlbG9wZXJLZXkodGhpcy5kZXZlbG9wZXJLZXkpXHJcbiAgICAgICAgICAgICAgICAuc2V0Q2FsbGJhY2sodGhpcy5waWNrZXJDYWxsYmFjaylcclxuICAgICAgICAgICAgICAgIC8vIC5hZGRWaWV3KG5ldyBnb29nbGUucGlja2VyLkRvY3NVcGxvYWRWaWV3KCkpXHJcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcclxuICAgICAgICAgICAgcGlja2VyLnNldFZpc2libGUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEEgc2ltcGxlIGNhbGxiYWNrIGltcGxlbWVudGF0aW9uLlxyXG4gICAgLy8gT3ZlcnJpZGUgdGhpcyBtZXRob2Qgb24gdXNlLlxyXG4gICAgcGlja2VyQ2FsbGJhY2soZGF0YSkge1xyXG4gICAgICAgIGlmIChkYXRhLmFjdGlvbiA9PT0gZ29vZ2xlLnBpY2tlci5BY3Rpb24uUElDS0VEKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlSWQgPSBkYXRhLmRvY3NbMF0uaWQ7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGBlZGl0b3IuaHRtbD9hY3Rpb249bG9hZCZmaWxlSWQ9JHtmaWxlSWR9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsZVBpY2tlcjtcclxuXHJcbiIsImNsYXNzIFBpY2tlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBUaGUgQnJvd3NlciBBUEkga2V5IG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS5cclxuICAgICAgICB0aGlzLmRldmVsb3BlcktleSA9ICdBSXphU3lBQmNkTG1UNkhIXzdHbzgycV9JQkdJM2ptNlVMNHc0UTAnO1xyXG5cclxuICAgICAgICAvLyBUaGUgQ2xpZW50IElEIG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS4gUmVwbGFjZSB3aXRoIHlvdXIgb3duIENsaWVudCBJRC5cclxuICAgICAgICB0aGlzLmNsaWVudElkID0gXCIxNTg4MjMxMzQ2ODEtOThiZ2thbmdvbHRrNjM2dWtmOHBvZmVpczdwYTdqYmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIlxyXG5cclxuICAgICAgICAvLyBSZXBsYWNlIHdpdGggeW91ciBvd24gcHJvamVjdCBudW1iZXIgZnJvbSBjb25zb2xlLmRldmVsb3BlcnMuZ29vZ2xlLmNvbS5cclxuICAgICAgICB0aGlzLmFwcElkID0gXCIxNTg4MjMxMzQ2ODFcIjtcclxuXHJcbiAgICAgICAgLy8gU2NvcGUgdG8gdXNlIHRvIGFjY2VzcyB1c2VyJ3MgRHJpdmUgaXRlbXMuXHJcbiAgICAgICAgdGhpcy5zY29wZSA9IFsnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5maWxlJ107XHJcblxyXG4gICAgICAgIHRoaXMucGlja2VyQXBpTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5vYXV0aFRva2VuID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2UgdGhlIEdvb2dsZSBBUEkgTG9hZGVyIHNjcmlwdCB0byBsb2FkIHRoZSBnb29nbGUucGlja2VyIHNjcmlwdC5cclxuICAgIGxvYWRQaWNrZXIoKSB7XHJcbiAgICAgICAgZ2FwaS5sb2FkKCdhdXRoMicsIHsnY2FsbGJhY2snOiAoKT0+dGhpcy5vbkF1dGhBcGlMb2FkKCl9KTtcclxuICAgICAgICBnYXBpLmxvYWQoJ3BpY2tlcicsIHsnY2FsbGJhY2snOiAoKT0+dGhpcy5vblBpY2tlckFwaUxvYWQoKX0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQXV0aEFwaUxvYWQoKSB7XHJcbiAgICAgICAgY29uc3QgcGFyYW0gPSB7XHJcbiAgICAgICAgICAgICdjbGllbnRfaWQnOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICAnc2NvcGUnOiB0aGlzLnNjb3BlLFxyXG4gICAgICAgICAgICAnaW1tZWRpYXRlJzogZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5nYXBpLmF1dGgyLmF1dGhvcml6ZShwYXJhbSwgKGF1dGhSZXN1bHQpPT50aGlzLmhhbmRsZUF1dGhSZXN1bHQoYXV0aFJlc3VsdCkpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uUGlja2VyQXBpTG9hZCgpIHtcclxuICAgICAgICB0aGlzLnBpY2tlckFwaUxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVQaWNrZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVBdXRoUmVzdWx0KGF1dGhSZXN1bHQpIHtcclxuICAgICAgICBpZiAoYXV0aFJlc3VsdCAmJiAhYXV0aFJlc3VsdC5lcnJvcikge1xyXG4gICAgICAgICAgICB0aGlzLm9hdXRoVG9rZW4gPSBhdXRoUmVzdWx0LmFjY2Vzc190b2tlbjtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVQaWNrZXIoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhdXRoUmVzdWx0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuZCByZW5kZXIgYSBQaWNrZXIgb2JqZWN0IGZvciBzZWFyY2hpbmcgaW1hZ2VzLlxyXG4gICAgY3JlYXRlUGlja2VyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnBpY2tlckFwaUxvYWRlZCAmJiB0aGlzLm9hdXRoVG9rZW4pIHtcclxuICAgICAgICAgICAgbGV0IHZpZXcgPSBuZXcgZ29vZ2xlLnBpY2tlci5Eb2NzVmlldyhnb29nbGUucGlja2VyLlZpZXdJZC5GT0xERVJTKVxyXG4gICAgICAgICAgICAgICAgLnNldEluY2x1ZGVGb2xkZXJzKHRydWUpXHJcbiAgICAgICAgICAgICAgICAuc2V0U2VsZWN0Rm9sZGVyRW5hYmxlZCh0cnVlKVxyXG4gICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGlja2VyID0gbmV3IGdvb2dsZS5waWNrZXIuUGlja2VyQnVpbGRlcigpXHJcbiAgICAgICAgICAgICAgICAuZW5hYmxlRmVhdHVyZShnb29nbGUucGlja2VyLkZlYXR1cmUuTkFWX0hJRERFTilcclxuICAgICAgICAgICAgICAgIC5hZGRWaWV3KHZpZXcpXHJcbiAgICAgICAgICAgICAgICAuc2V0QXBwSWQodGhpcy5hcHBJZClcclxuICAgICAgICAgICAgICAgIC5zZXRPQXV0aFRva2VuKHRoaXMub2F1dGhUb2tlbilcclxuICAgICAgICAgICAgICAgIC5zZXREZXZlbG9wZXJLZXkodGhpcy5kZXZlbG9wZXJLZXkpXHJcbiAgICAgICAgICAgICAgICAuc2V0Q2FsbGJhY2sodGhpcy5waWNrZXJDYWxsYmFjaylcclxuICAgICAgICAgICAgICAgIC5idWlsZCgpO1xyXG4gICAgICAgICAgICBwaWNrZXIuc2V0VmlzaWJsZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQSBzaW1wbGUgY2FsbGJhY2sgaW1wbGVtZW50YXRpb24uXHJcbiAgICAvLyBPdmVycmlkZSB0aGlzIG1ldGhvZCBvbiB1c2UuXHJcbiAgICBwaWNrZXJDYWxsYmFjayhkYXRhKSB7XHJcbiAgICAgICAgaWYgKGRhdGEuYWN0aW9uID09PSBnb29nbGUucGlja2VyLkFjdGlvbi5QSUNLRUQpIHtcclxuICAgICAgICAgICAgdmFyIGZpbGVJZCA9IGRhdGEuZG9jc1swXS5pZDtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYGVkaXRvci5odG1sP2FjdGlvbj1uZXcmZGlySWQ9JHtmaWxlSWR9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGlja2VyO1xyXG5cclxuIl19
