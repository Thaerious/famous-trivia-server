
export default class NameInUseResponse{
    constructor(name) {
        this.name = name;
    }

    get object(){
        return {
            result: 'rejected',
            reason: 'name is already in use',
            name: this.name
        }
    }
}