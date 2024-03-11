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
        const animationOffset = Math.sin(performance.now() / 500) * (this.game.map.tileSize / 4);
        const x = this.position.x - this.game.camera.x + this.game.map.tileSize / 2;
        const y = this.position.y - this.game.camera.y + this.game.map.tileSize / 2 + animationOffset;
        let circleColor = '#ffffff';
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
            circleColor = 'hsl(0, 100%, 50%)';
            strokeColor = 'hsl(0, 100%, 50%)'; // blood color
        }
    
        const radius = this.game.map.tileSize / 2;
    
        this.game.ctx.save();
        this.game.ctx.fillStyle = circleColor;
        this.game.ctx.strokeStyle = strokeColor;
        this.game.ctx.lineWidth = 4;   
        this.game.ctx.beginPath();
        this.game.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.game.ctx.stroke();

        this.game.ctx.font = '16px Helvetica';
        this.game.ctx.fillStyle = 'white';
        this.game.ctx.textAlign = 'center';
        this.game.ctx.fillText(name, x, y + 5);
        this.game.ctx.restore();
    }
}