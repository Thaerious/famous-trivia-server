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
            alert('The user selected: ' + fileId);
        }
    }
}

module.exports = Picker;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL29wdC9ub2RlLzE1LjYuMC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2hvbWUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvUGlja2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgUGlja2VyID0gcmVxdWlyZShcIi4vbW9kdWxlcy9QaWNrZXIuanNcIik7XHJcblxyXG53aW5kb3cub25sb2FkID0gKCk9PiB7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NyZWF0ZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgICBsZXQgcGlja2VyID0gbmV3IFBpY2tlcigpO1xyXG4gICAgICAgIHBpY2tlci5sb2FkUGlja2VyKCk7XHJcbiAgICB9KTtcclxufVxyXG4iLCJjbGFzcyBQaWNrZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gVGhlIEJyb3dzZXIgQVBJIGtleSBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuXHJcbiAgICAgICAgdGhpcy5kZXZlbG9wZXJLZXkgPSAnQUl6YVN5QUJjZExtVDZISF83R284MnFfSUJHSTNqbTZVTDR3NFEwJztcclxuXHJcbiAgICAgICAgLy8gVGhlIENsaWVudCBJRCBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBDbGllbnQgSUQuXHJcbiAgICAgICAgdGhpcy5jbGllbnRJZCA9IFwiMTU4ODIzMTM0NjgxLTk4YmdrYW5nb2x0azYzNnVrZjhwb2ZlaXM3cGE3amJrLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXCJcclxuXHJcbiAgICAgICAgLy8gUmVwbGFjZSB3aXRoIHlvdXIgb3duIHByb2plY3QgbnVtYmVyIGZyb20gY29uc29sZS5kZXZlbG9wZXJzLmdvb2dsZS5jb20uXHJcbiAgICAgICAgdGhpcy5hcHBJZCA9IFwiMTU4ODIzMTM0NjgxXCI7XHJcblxyXG4gICAgICAgIC8vIFNjb3BlIHRvIHVzZSB0byBhY2Nlc3MgdXNlcidzIERyaXZlIGl0ZW1zLlxyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBbJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZHJpdmUuZmlsZSddO1xyXG5cclxuICAgICAgICB0aGlzLnBpY2tlckFwaUxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub2F1dGhUb2tlbiA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXNlIHRoZSBHb29nbGUgQVBJIExvYWRlciBzY3JpcHQgdG8gbG9hZCB0aGUgZ29vZ2xlLnBpY2tlciBzY3JpcHQuXHJcbiAgICBsb2FkUGlja2VyKCkge1xyXG4gICAgICAgIGdhcGkubG9hZCgnYXV0aCcsIHsnY2FsbGJhY2snOiAoKT0+dGhpcy5vbkF1dGhBcGlMb2FkKCl9KTtcclxuICAgICAgICBnYXBpLmxvYWQoJ3BpY2tlcicsIHsnY2FsbGJhY2snOiAoKT0+dGhpcy5vblBpY2tlckFwaUxvYWQoKX0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQXV0aEFwaUxvYWQoKSB7XHJcbiAgICAgICAgY29uc3QgcGFyYW0gPSB7XHJcbiAgICAgICAgICAgICdjbGllbnRfaWQnOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICAnc2NvcGUnOiB0aGlzLnNjb3BlLFxyXG4gICAgICAgICAgICAnaW1tZWRpYXRlJzogZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5nYXBpLmF1dGguYXV0aG9yaXplKHBhcmFtLCAoYXV0aFJlc3VsdCk9PnRoaXMuaGFuZGxlQXV0aFJlc3VsdChhdXRoUmVzdWx0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25QaWNrZXJBcGlMb2FkKCkge1xyXG4gICAgICAgIHRoaXMucGlja2VyQXBpTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNyZWF0ZVBpY2tlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUF1dGhSZXN1bHQoYXV0aFJlc3VsdCkge1xyXG4gICAgICAgIGlmIChhdXRoUmVzdWx0ICYmICFhdXRoUmVzdWx0LmVycm9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2F1dGhUb2tlbiA9IGF1dGhSZXN1bHQuYWNjZXNzX3Rva2VuO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVBpY2tlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIHJlbmRlciBhIFBpY2tlciBvYmplY3QgZm9yIHNlYXJjaGluZyBpbWFnZXMuXHJcbiAgICBjcmVhdGVQaWNrZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGlja2VyQXBpTG9hZGVkICYmIHRoaXMub2F1dGhUb2tlbikge1xyXG4gICAgICAgICAgICBsZXQgdmlldyA9IG5ldyBnb29nbGUucGlja2VyLkRvY3NWaWV3KGdvb2dsZS5waWNrZXIuVmlld0lkLkZPTERFUlMpXHJcbiAgICAgICAgICAgICAgICAuc2V0SW5jbHVkZUZvbGRlcnModHJ1ZSlcclxuICAgICAgICAgICAgICAgIC5zZXRTZWxlY3RGb2xkZXJFbmFibGVkKHRydWUpXHJcbiAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrZXIgPSBuZXcgZ29vZ2xlLnBpY2tlci5QaWNrZXJCdWlsZGVyKClcclxuICAgICAgICAgICAgICAgIC5lbmFibGVGZWF0dXJlKGdvb2dsZS5waWNrZXIuRmVhdHVyZS5OQVZfSElEREVOKVxyXG4gICAgICAgICAgICAgICAgLmFkZFZpZXcodmlldylcclxuICAgICAgICAgICAgICAgIC5zZXRBcHBJZCh0aGlzLmFwcElkKVxyXG4gICAgICAgICAgICAgICAgLnNldE9BdXRoVG9rZW4odGhpcy5vYXV0aFRva2VuKVxyXG4gICAgICAgICAgICAgICAgLnNldERldmVsb3BlcktleSh0aGlzLmRldmVsb3BlcktleSlcclxuICAgICAgICAgICAgICAgIC5zZXRDYWxsYmFjayh0aGlzLnBpY2tlckNhbGxiYWNrKVxyXG4gICAgICAgICAgICAgICAgLmJ1aWxkKCk7XHJcbiAgICAgICAgICAgIHBpY2tlci5zZXRWaXNpYmxlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBBIHNpbXBsZSBjYWxsYmFjayBpbXBsZW1lbnRhdGlvbi5cclxuICAgIC8vIE92ZXJyaWRlIHRoaXMgbWV0aG9kIG9uIHVzZS5cclxuICAgIHBpY2tlckNhbGxiYWNrKGRhdGEpIHtcclxuICAgICAgICBpZiAoZGF0YS5hY3Rpb24gPT0gZ29vZ2xlLnBpY2tlci5BY3Rpb24uUElDS0VEKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlSWQgPSBkYXRhLmRvY3NbMF0uaWQ7XHJcbiAgICAgICAgICAgIGFsZXJ0KCdUaGUgdXNlciBzZWxlY3RlZDogJyArIGZpbGVJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBpY2tlcjtcclxuXHJcbiJdfQ==
