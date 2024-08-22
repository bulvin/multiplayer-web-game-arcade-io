export class Camera {
  constructor(game) {
    this.game = game;
    this.targetPlayer = game.me;
    this.x = 0;
    this.y = 0;
    this.viewportWidth = game.canvas.width;
    this.viewportHeight = game.canvas.height;
    this.margin = 120;
    this.lerpFactor = 0.5;
    this.updateMaxBounds();
  }

  setTargetPlayer(player) {
    this.targetPlayer = player;
  }

  setViewport(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.updateMaxBounds();
  }

  updateMaxBounds() {
    this.maxX = this.game.map.width - this.viewportWidth + this.margin;
    this.maxY = this.game.map.height - this.viewportHeight + this.margin;
  }

  update() {
    if (!this.targetPlayer) return;

    const targetX = this.targetPlayer.target.x * this.game.map.tileSize - this.viewportWidth * 0.5;
    const targetY = this.targetPlayer.target.y * this.game.map.tileSize - this.viewportHeight * 0.5;

    this.x += (targetX - this.x) * this.lerpFactor;
    this.y += (targetY - this.y) * this.lerpFactor;

    this.x = Math.max(-this.margin, Math.min(this.x, this.maxX));
    this.y = Math.max(-this.margin, Math.min(this.y, this.maxY));
  }
}






