# Famous-Trivia
This is my Covid project to enable remote trivia among friends.  It started as just
an HTML page that would be presented over video conferencing.  Trying to judge who put
up there hand first proved difficult.  So the second iteration introduced a buzzer
for players to indicate they wanted to answer.  The questions were edited manually in a
.json file, and the index only handled one instance at a time.  This is the third iteration
; it allows for online editing of questions, as well as a persistent index that can handle
multiple games at one time.

This is a mall multiplayer trivia index using the NodeJS Express index for the backend and custom
html elements for the UI.  The trivia questions are stored on Google using the Google Drive
API.  This trivia app allows a host to control players in conjunction with an external 
voice-chat app.

[Click Here](https://frar.ca/trivia/host.ejs) to access the live index.

For more information, see the [DOCUMENTATION](https://thaerious.github.io/famous-trivia/).

### Prerequisites
* Install NodeJS and NPM.
* Visit https://console.cloud.google.com/apis/dashboard and create an API key for the following api.
* * Google Drive API
* * Google Picker API
* * People API