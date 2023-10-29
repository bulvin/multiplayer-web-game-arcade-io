import { lerp } from "./animate.js";
export class Camera {
  constructor(game) {
    this.game = game;
    this.targetPlayer = null;
    this.x = 0;
    this.y = 0;
    this.viewportWidth = game.canvas.width;
    this.viewportHeight = game.canvas.height;
    this.maxX = game.map.width - this.viewportWidth;
    this.maxY = game.map.height - this.viewportHeight;

  }

  setTargetPlayer(player) {
    this.targetPlayer = player;
  }

  update() {
    if (this.targetPlayer) {
      const centerX = this.targetPlayer.target.x - this.viewportWidth / 2;
      const centerY = this.targetPlayer.target.y - this.viewportHeight / 2;

      this.maxX = this.game.map.width - this.viewportWidth;
      this.maxY = this.game.map.height - this.viewportHeight;

      this.x = lerp(this.x, Math.max(0, Math.min(centerX, this.maxX)), 0.5)
      this.y = lerp(this.y, Math.max(0, Math.min(centerY, this.maxY)), 0.5)

    }
  }
}






