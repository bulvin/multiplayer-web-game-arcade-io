import { InputHandler } from "./input.js";
import { UI } from "./ui.js";
import { lerp } from "./animate.js";
export class Player {

    constructor({ nickname, color, x, y, dead }, game) {
        this.nickname = nickname;
        this.x = x;
        this.y = y;
        this.color = color;
        this.dead = dead;
        this.input = [];
        this.abilities = {};
        
        this.target = {
            x: x,
            y: y,
        };
        this.game = game;
        this.ui = new UI(this); 
        this.inputHandler = new InputHandler(this);
      
      
    }
    draw() {
        const tileX = this.x * this.game.map.tileSize - this.game.camera.x;
        const tileY = this.y * this.game.map.tileSize - this.game.camera.y;
        
        this.game.context.save();
      
        this.game.context.shadowColor = this.color;
        this.game.context.shadowBlur = 15;
        this.game.context.fillStyle = this.color;
        this.game.context.strokeStyle = "white";
        this.game.context.lineWidth = 4;
        this.game.context.fillRect(tileX, tileY, this.game.map.tileSize * window.devicePixelRatio, this.game.map.tileSize * window.devicePixelRatio);
        this.game.context.strokeRect(tileX, tileY, this.game.map.tileSize * window.devicePixelRatio, this.game.map.tileSize * window.devicePixelRatio);

    
        this.game.context.restore();

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