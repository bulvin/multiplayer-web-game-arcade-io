export class Bonus {
    constructor(game, name, duration, x, y){
        this.game = game;
        this.position = {
            x : x,
            y : y,
        }
        this.name = name;
        this.duration = duration;
    }

    draw() {
        const tileSizeHalf = this.game.map.tileSize / 2;
        const x = this.position.x  - this.game.camera.x ;
        const y = this.position.y - this.game.camera.y + Math.sin(performance.now() / 100) * (tileSizeHalf / 2);
    
        const strokeColor = '#ffffff';
    
        this.game.context.save();
        this.game.context.lineWidth = 10;
        this.game.context.strokeStyle = strokeColor;
        this.game.context.beginPath();
        this.game.context.arc(x, y, tileSizeHalf, 0, 2 * Math.PI , false);
        this.game.context.stroke();
    
        this.game.context.font = '16px Bangers';
        this.game.context.fillStyle = 'white';
        this.game.context.textAlign = 'center';
        this.game.context.fillText(this.name, x, y + 5);
        this.game.context.restore();
    }
}