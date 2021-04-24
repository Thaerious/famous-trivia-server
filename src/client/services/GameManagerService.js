class GameManagerService {

    /**
     * @param data object to send, will get stringified by this method
     */
    async send(data) {
        return new Promise((resolve, reject) => {
            let xhttp = new XMLHttpRequest();

            xhttp.addEventListener("load", (event) => {
                let response = JSON.parse(xhttp.responseText);
                if (response.error) reject(response);
                else resolve(response);
            });

            xhttp.open("POST", GameManagerService.URL);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify(data));
        });
    }

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
            name : name,
            action: "set-name"
        });
    }

}

GameManagerService
    .URL = "game-manager-service";
module
    .exports = new GameManagerService();