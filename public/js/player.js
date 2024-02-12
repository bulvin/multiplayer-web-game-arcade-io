import { lerp } from "./animate.js";
export class Player {

    constructor({ nickname, color, x, y}, game) {
        this.nickname = nickname;
        this.x = x;
        this.y = y;
        this.color = color;
        
        this.target = {
            x: x,
            y: y,
        };
        this.game = game;    
      
    }
    draw() {
        const tileX = this.x * this.game.map.tileSize - this.game.camera.x;
        const tileY = this.y * this.game.map.tileSize - this.game.camera.y;
        
        this.game.ctx.save();
      
        this.game.ctx.shadowColor = this.color;
        this.game.ctx.shadowBlur = 15;
        this.game.ctx.fillStyle = this.color;
        this.game.ctx.strokeStyle = "white";
        this.game.ctx.lineWidth = 4;
        this.game.ctx.fillRect(tileX, tileY, this.game.map.tileSize * window.devicePixelRatio, this.game.map.tileSize * window.devicePixelRatio);
        this.game.ctx.strokeRect(tileX, tileY, this.game.map.tileSize * window.devicePixelRatio, this.game.map.tileSize * window.devicePixelRatio);

    
        this.game.ctx.restore();

    }
    move() {
        this.x = lerp(this.x, this.target.x, 0.5);
        this.y = lerp(this.y, this.target.y, 0.5);
    }
    updatePosition(newX, newY) {
        this.target.x = newX;
        this.target.y = newY;

       
    }
}