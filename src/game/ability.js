export class Ability {
    constructor(name, duration, x, y){
        this.position = {
            x : x,
            y : y
        };
        this.name = name;
        this.duration = duration;
        
    }
}