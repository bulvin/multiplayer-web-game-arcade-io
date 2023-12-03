export class Result {
    constructor(success=true, data, error="") {
        this.success = success;
        this.data = data;
        this.error = error;
    }
}