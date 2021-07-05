
export default class InvalidNameResponse{
    constructor(name) {
        this.name = name;
    }

    get object(){
        return {
            result: 'rejected',
            reason: 'invalid name',
            name: this.name
        }
    }
}