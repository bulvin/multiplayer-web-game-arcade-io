export class Bonus {
    constructor(game, name, x, y){
        this.game = game;
        this.position = {
            x : x,
            y : y,
        }
        this.name = name;
    }

    draw() {
        const tileSizeHalf = this.game.map.tileSize / 2;
        const x = this.position.x  - this.game.camera.x ;
        const y = this.position.y - this.game.camera.y + Math.sin(performance.now() / 300) * (tileSizeHalf / 4);
    
        let strokeColor = '#ffffff';

        let name = this.name;
        if (name === "SCORE_X2") {
            name = "x2";
        } else if (name === "SCORE_X4") {
            name = "x4"
        } else if (name === "SCORE_X8") {
            name = "x8";
        } else if (name === "KILL_X2") {
            name = "x2"
            strokeColor = 'hsl(0, 100%, 50%)';
        }
    
        this.game.ctx.save();
        this.game.ctx.lineWidth = 10;
        this.game.ctx.strokeStyle = strokeColor;
        this.game.ctx.beginPath();
        this.game.ctx.arc(x, y, tileSizeHalf, 0, 2 * Math.PI , false);
        this.game.ctx.stroke();
    
        this.game.ctx.font = '16px Helvetica';
        this.game.ctx.fillStyle = 'white';
        this.game.ctx.textAlign = 'center';
        this.game.ctx.fillText(name, x, y + 5);
        this.game.ctx.restore();
    }
}