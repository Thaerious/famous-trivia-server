
export default class ErrorResponse{
    constructor(text) {
        this.text = text;
    }

    get object(){
        return {
            'result': 'error',
            'error': this.text
        }
    }
}