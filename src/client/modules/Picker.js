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

