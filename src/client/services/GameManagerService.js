class GameManagerService {

    /**
     * @param data object to send, will get stringified by this method
     */
    async send(data) {
        return new Promise((resolve, reject) => {
            let xhttp = new XMLHttpRequest();

            xhttp.addEventListener("load", (event) => {
                console.log(xhttp.responseText);
                let response = JSON.parse(xhttp.responseText);
                if (response.error) reject(response);
                else resolve(response);
            });

            xhttp.open("POST", GameManagerService.URL);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify(data));
        });
    }

    /**
     * Stop a hosted game and clear players.
     * @param token Google API user token
     * @returns {Promise<unknown>}
     */
    async launch(token, model) {
        return await this.send({
            token: token,
            model: model,
            action: "launch"
        });
    }

    /**
     * Stop a hosted game and clear players.
     * @param token Google API user token
     * @returns {Promise<unknown>}
     */
    async terminate(token) {
        return await this.send({
            token: token,
            action: "terminate"
        });
    }

    /**
     * Determine if a game as been hosted.
     * @param token Google API user token
     * @returns {Promise<unknown>}
     */
    async checkForGame(token) {
        return await this.send({
            token: token,
            action: "has-game"
        });
    }

    async joinGame(hash, name) {
        let response = await this.send({
            'game-hash': hash,
            action: "join-game"
        });
        return response.result;
    }

    async setName(hash, name) {
        return await this.send({
            'game-hash': hash,
            name: name,
            action: "set-name"
        });
    }
}

GameManagerService.URL = "game-manager-service";
module.exports = GameManagerService;