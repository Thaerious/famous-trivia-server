# Famous-Trivia
Small multiplayer trivia server using the NodeJS Express server for the backend and custom
html elements for the UI.  The trivia questions are stored on Google using the Google Drive
API.  This trivia app allows a host to control players in conjunction with an external 
voice-chat app.

[Click Here](https://frar.ca/trivia/host.ejs) to access the live server.

### Prerequisites
* Install NodeJS and NPM.
* Visit https://console.cloud.google.com/apis/dashboard and create an API key for the following api.
* * Google Drive API
* * Google Picker API
* * People API

### How to use locally:

* Clone the repository and run the following commands to set up & run the server.
```
 npm install        # install NodeJS dependencies
 node . -r          # render html and js files
 node .             # start the server listening on port 8000
```

* Add http://localhost:8000 to authorized Javascript origins for the OAuth2 client ID.
* Copy browser key, client id, and app id to /src/config.js

Open the browser and navigate to http://localhost:8000/host.ejs for the main screen.
You will need to authorize using Google login which shows up in a pop-up screen.

For more information, see [DOCUMENTATION](https://thaerious.github.io/famous-trivia/).