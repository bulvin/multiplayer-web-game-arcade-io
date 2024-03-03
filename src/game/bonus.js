export class Bonus {
    constructor(x, y, name,duration){
        this.position = {
            x : x,
            y : y,
        }
        this.name = name;
        this.duration = duration;
    }
    toJSON() {
        return {
            x: this.position.x,
            y: this.position.y,
            name: this.name,
        }
    }
}