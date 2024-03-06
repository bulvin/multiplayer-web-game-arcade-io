export class Camera {
  constructor(game) {
    this.game = game;
    this.targetPlayer = game.me;
    this.x = 0;
    this.y = 0;
    this.viewportWidth = game.canvas.width;
    this.viewportHeight = game.canvas.height;
    this.margin = 120;
    this.maxX = game.map.width - this.viewportWidth + this.margin;
    this.maxY = game.map.height - this.viewportHeight + this.margin;
  }

  setTargetPlayer(player) {
    this.targetPlayer = player;
  }

  setViewport(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.maxX = this.game.map.width - this.viewportWidth + this.margin;
    this.maxY = this.game.map.height - this.viewportHeight + this.margin;
  }

  update() {
    if (this.targetPlayer) {

      const targetX = this.targetPlayer.target.x * this.game.map.tileSize - this.viewportWidth * 0.5;
      const targetY = this.targetPlayer.target.y * this.game.map.tileSize - this.viewportHeight * 0.5;

      this.maxX = this.game.map.width - this.viewportWidth + this.margin;
      this.maxY = this.game.map.height - this.viewportHeight + this.margin;

      this.x = this.game.lerp(this.x, Math.max(-this.margin, Math.min(targetX, this.maxX)), 0.5);
      this.y = this.game.lerp(this.y, Math.max(-this.margin, Math.min(targetY, this.maxY)), 0.5);
    }
  }
}






