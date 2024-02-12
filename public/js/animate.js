import { gameManager } from "./gameManager.js";

export const canvas = document.getElementById("game-map");
const ctx = canvas.getContext('2d');
const devicePixelRatio = window.devicePixelRatio || 1;

export function animate() {
  

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in gameManager.games) {
    const game = gameManager.games[id];
    game.camera.update();
    game.draw();

  }
  requestAnimationFrame(animate);
}


window.addEventListener("load", function () {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;

});

export function lerp(start, end, lerpFactor) {
  return start + (end - start) * lerpFactor;
}

