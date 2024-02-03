export class Ability {
    constructor(game, name, duration, x, y){
        this.game = game;
        this.position = {
            x : x,
            y : y
        };
        this.name = name;
        this.duration = duration;
        
    }
    draw() {
        const x = this.position.x - this.game.camera.x + this.game.map.tileSize / 2;
        const y = this.position.y  - this.game.camera.y + this.game.map.tileSize / 2 + Math.sin(performance.now() / 1000) * (this.game.map.tileSize / 4);
    
        const circleColor = "white";
        const radius = this.game.map.tileSize / 2;
    
        this.game.context.save();
        this.game.context.fillStyle = circleColor;
        this.game.context.shadowColor = circleColor;
        this.game.context.shadowBlur = 15;
        this.game.context.beginPath();
        this.game.context.arc(x, y, radius, 0, 2 * Math.PI);
        this.game.context.fill();
        this.game.context.restore();
    }
}