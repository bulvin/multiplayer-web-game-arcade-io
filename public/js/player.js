import { InputHandler } from "./input.js";
import { UI } from "./ui.js";

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

        this.game.context.save();
        this.game.context.shadowColor = this.color;
        this.game.context.shadowBlur = 20;
        
       
        this.game.context.fillStyle = this.color;
        this.game.context.strokeStyle = "white";

        this.game.context.fillRect(this.x - this.game.camera.x, this.y - this.game.camera.y,this.game.map.tileSize * window.devicePixelRatio, this.game.map.tileSize * window.devicePixelRatio);
        this.game.context.strokeStyle = "white";
        this.game.context.lineWidth = 4;
        this.game.context.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.game.map.tileSize * window.devicePixelRatio, this.game.map.tileSize * window.devicePixelRatio);
        this.game.context.restore();

    }
}