# Famous-Trivia
Small multiplayer trivia server using the NodeJS Express server for the backend and custom html elements for the UI. 

[Click Here](https://frar.ca/triva/host.ejs) to access the live server.

### How to use locally:

* Clone the repository and run the following commands to set up the server.
```
 npm install        # install NodeJS dependencies
 node . -r          # render html and js files
```
* Now open a terminal run the following command if you just want to start the server for development.
```
npm run watch
```
Use the following commands if you want to manually build from src to test for production.
```
npm run build:prod or npm run build:dev followed by npm run serve
```
* Open the brower and navigate to http://localhost:3000 for the main screen and point all other devices to http://your_internal_ip:3000 and follow onscreen instructions.
