
export default class GetGameSuccessResponse{
    constructor(gameHash) {
        this.gameHash = gameHash;
    }

    get object(){
        return {
            'result': 'success',
            'game-hash': this.gameHash
        }
    }
}