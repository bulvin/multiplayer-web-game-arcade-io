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
        this.game.ctx.shadowBlur = 25;
        this.game.ctx.fillStyle = this.color;
        this.game.ctx.strokeStyle = "white";
        this.game.ctx.lineWidth = 4;
        this.game.ctx.fillRect(tileX, tileY, this.game.map.tileSize, this.game.map.tileSize);
        this.game.ctx.strokeRect(tileX, tileY, this.game.map.tileSize, this.game.map.tileSize);

    
        this.game.ctx.restore();

    }
 
    update(backendPlayer) {
        this.updatePosition(backendPlayer.x, backendPlayer.y);
        this.score = backendPlayer.score
        this.kills = backendPlayer.kills
        this.deaths = backendPlayer.deaths
        this.territory = backendPlayer.territory
        this.dead = backendPlayer.dead
        this.activeAbility = backendPlayer.activeAbility;
        this.abilities = backendPlayer.abilities
        this.activeBonus = backendPlayer.activeBonus;
        this.game.map.tileSize = backendPlayer.tileSize;
        this.game.map.width = backendPlayer.tileSize * this.game.map.cols;
        this.game.map.height = backendPlayer.tileSize * this.game.map.rows;
    }
    updatePosition(targetX, targetY) {
        this.target.x = targetX;
        this.target.y = targetY;
    }

    move() {
        this.x = this.game.lerp(this.x, this.target.x, 0.5);
        this.y = this.game.lerp(this.y, this.target.y, 0.5);
    }
}