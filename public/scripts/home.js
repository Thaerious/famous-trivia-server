(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Picker = require("./modules/Picker.js");

window.onload = ()=> {
    document.querySelector("#create").addEventListener("click", (e) => {
        let picker = new Picker();
        picker.loadPicker();
    });
}

},{"./modules/Picker.js":2}],2:[function(require,module,exports){
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
        gapi.load('auth', {'callback': ()=>this.onAuthApiLoad()});
        gapi.load('picker', {'callback': ()=>this.onPickerApiLoad()});

        console.log(this.pickerApiLoaded);
        console.log(this.oauthToken);
    }

    onAuthApiLoad() {
        const param = {
            'client_id': this.clientId,
            'scope': this.scope,
            'immediate': false
        }

        window.gapi.auth.authorize(param, (authResult)=>this.handleAuthResult(authResult));
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
        if (data.action == google.picker.Action.PICKED) {
            var fileId = data.docs[0].id;
            window.location = `editor.html?action=new&fileId=${fileId}`;
        }
    }
}

module.exports = Picker;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2hvbWUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvUGlja2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IFBpY2tlciA9IHJlcXVpcmUoXCIuL21vZHVsZXMvUGlja2VyLmpzXCIpO1xyXG5cclxud2luZG93Lm9ubG9hZCA9ICgpPT4ge1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjcmVhdGVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XHJcbiAgICAgICAgbGV0IHBpY2tlciA9IG5ldyBQaWNrZXIoKTtcclxuICAgICAgICBwaWNrZXIubG9hZFBpY2tlcigpO1xyXG4gICAgfSk7XHJcbn1cclxuIiwiY2xhc3MgUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIFRoZSBCcm93c2VyIEFQSSBrZXkgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLlxyXG4gICAgICAgIHRoaXMuZGV2ZWxvcGVyS2V5ID0gJ0FJemFTeUFCY2RMbVQ2SEhfN0dvODJxX0lCR0kzam02VUw0dzRRMCc7XHJcblxyXG4gICAgICAgIC8vIFRoZSBDbGllbnQgSUQgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLiBSZXBsYWNlIHdpdGggeW91ciBvd24gQ2xpZW50IElELlxyXG4gICAgICAgIHRoaXMuY2xpZW50SWQgPSBcIjE1ODgyMzEzNDY4MS05OGJna2FuZ29sdGs2MzZ1a2Y4cG9mZWlzN3BhN2piay5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwiXHJcblxyXG4gICAgICAgIC8vIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBwcm9qZWN0IG51bWJlciBmcm9tIGNvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tLlxyXG4gICAgICAgIHRoaXMuYXBwSWQgPSBcIjE1ODgyMzEzNDY4MVwiO1xyXG5cclxuICAgICAgICAvLyBTY29wZSB0byB1c2UgdG8gYWNjZXNzIHVzZXIncyBEcml2ZSBpdGVtcy5cclxuICAgICAgICB0aGlzLnNjb3BlID0gWydodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLmZpbGUnXTtcclxuXHJcbiAgICAgICAgdGhpcy5waWNrZXJBcGlMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm9hdXRoVG9rZW4gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSB0aGUgR29vZ2xlIEFQSSBMb2FkZXIgc2NyaXB0IHRvIGxvYWQgdGhlIGdvb2dsZS5waWNrZXIgc2NyaXB0LlxyXG4gICAgbG9hZFBpY2tlcigpIHtcclxuICAgICAgICBnYXBpLmxvYWQoJ2F1dGgnLCB7J2NhbGxiYWNrJzogKCk9PnRoaXMub25BdXRoQXBpTG9hZCgpfSk7XHJcbiAgICAgICAgZ2FwaS5sb2FkKCdwaWNrZXInLCB7J2NhbGxiYWNrJzogKCk9PnRoaXMub25QaWNrZXJBcGlMb2FkKCl9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5waWNrZXJBcGlMb2FkZWQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMub2F1dGhUb2tlbik7XHJcbiAgICB9XHJcblxyXG4gICAgb25BdXRoQXBpTG9hZCgpIHtcclxuICAgICAgICBjb25zdCBwYXJhbSA9IHtcclxuICAgICAgICAgICAgJ2NsaWVudF9pZCc6IHRoaXMuY2xpZW50SWQsXHJcbiAgICAgICAgICAgICdzY29wZSc6IHRoaXMuc2NvcGUsXHJcbiAgICAgICAgICAgICdpbW1lZGlhdGUnOiBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2luZG93LmdhcGkuYXV0aC5hdXRob3JpemUocGFyYW0sIChhdXRoUmVzdWx0KT0+dGhpcy5oYW5kbGVBdXRoUmVzdWx0KGF1dGhSZXN1bHQpKTtcclxuICAgIH1cclxuXHJcbiAgICBvblBpY2tlckFwaUxvYWQoKSB7XHJcbiAgICAgICAgdGhpcy5waWNrZXJBcGlMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlUGlja2VyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQXV0aFJlc3VsdChhdXRoUmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKGF1dGhSZXN1bHQgJiYgIWF1dGhSZXN1bHQuZXJyb3IpIHtcclxuICAgICAgICAgICAgdGhpcy5vYXV0aFRva2VuID0gYXV0aFJlc3VsdC5hY2Nlc3NfdG9rZW47XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUGlja2VyKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYXV0aFJlc3VsdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgcmVuZGVyIGEgUGlja2VyIG9iamVjdCBmb3Igc2VhcmNoaW5nIGltYWdlcy5cclxuICAgIGNyZWF0ZVBpY2tlcigpIHtcclxuICAgICAgICBpZiAodGhpcy5waWNrZXJBcGlMb2FkZWQgJiYgdGhpcy5vYXV0aFRva2VuKSB7XHJcbiAgICAgICAgICAgIGxldCB2aWV3ID0gbmV3IGdvb2dsZS5waWNrZXIuRG9jc1ZpZXcoZ29vZ2xlLnBpY2tlci5WaWV3SWQuRk9MREVSUylcclxuICAgICAgICAgICAgICAgIC5zZXRJbmNsdWRlRm9sZGVycyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgLnNldFNlbGVjdEZvbGRlckVuYWJsZWQodHJ1ZSlcclxuICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tlciA9IG5ldyBnb29nbGUucGlja2VyLlBpY2tlckJ1aWxkZXIoKVxyXG4gICAgICAgICAgICAgICAgLmVuYWJsZUZlYXR1cmUoZ29vZ2xlLnBpY2tlci5GZWF0dXJlLk5BVl9ISURERU4pXHJcbiAgICAgICAgICAgICAgICAuYWRkVmlldyh2aWV3KVxyXG4gICAgICAgICAgICAgICAgLnNldEFwcElkKHRoaXMuYXBwSWQpXHJcbiAgICAgICAgICAgICAgICAuc2V0T0F1dGhUb2tlbih0aGlzLm9hdXRoVG9rZW4pXHJcbiAgICAgICAgICAgICAgICAuc2V0RGV2ZWxvcGVyS2V5KHRoaXMuZGV2ZWxvcGVyS2V5KVxyXG4gICAgICAgICAgICAgICAgLnNldENhbGxiYWNrKHRoaXMucGlja2VyQ2FsbGJhY2spXHJcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcclxuICAgICAgICAgICAgcGlja2VyLnNldFZpc2libGUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEEgc2ltcGxlIGNhbGxiYWNrIGltcGxlbWVudGF0aW9uLlxyXG4gICAgLy8gT3ZlcnJpZGUgdGhpcyBtZXRob2Qgb24gdXNlLlxyXG4gICAgcGlja2VyQ2FsbGJhY2soZGF0YSkge1xyXG4gICAgICAgIGlmIChkYXRhLmFjdGlvbiA9PSBnb29nbGUucGlja2VyLkFjdGlvbi5QSUNLRUQpIHtcclxuICAgICAgICAgICAgdmFyIGZpbGVJZCA9IGRhdGEuZG9jc1swXS5pZDtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYGVkaXRvci5odG1sP2FjdGlvbj1uZXcmZmlsZUlkPSR7ZmlsZUlkfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBpY2tlcjtcclxuXHJcbiJdfQ==
