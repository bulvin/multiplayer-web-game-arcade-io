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
        let circleColor;
        
        if (this.name === "PRĘDKOŚĆ") {
            circleColor = "#1E90FF"; 
        } else if (this.name === "SPOWOLNIENIE") {
            circleColor = "#FF4500"; 
        } else if (this.name === "ODPORNOŚĆ") {
            circleColor = "#32CD32"; 
        } else if (this.name === "WIDOCZNOŚĆ") {
            circleColor = "#FFFF00"; 
        } else if (this.name === "TELEPORT") {
            circleColor = "#800080"; 
        }
    
        const radius = this.game.map.tileSize / 2;
    
        this.game.ctx.save();
        this.game.ctx.fillStyle = circleColor;
        this.game.ctx.shadowColor = circleColor;
        this.game.ctx.shadowBlur = 15;
        this.game.ctx.beginPath();
        this.game.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.game.ctx.fill();
        this.game.ctx.restore();
    }
}