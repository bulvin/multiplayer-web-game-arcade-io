import { gameManager } from "./gameManager.js";

export const canvas = document.getElementById("game-map");
const ctx = canvas.getContext('2d');
const devicePixelRatio = window.devicePixelRatio || 1;

let lastTime = 0;
function animate(currentTime = 0) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in gameManager.games) {
    const game = gameManager.games[id];
    
   
    for (const playerId in game.players) {
      const player = game.players[playerId];
      if (!player.dead) {
        player.move(deltaTime);
      }
    }
    game.camera.update();
    game.draw();

  }
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("load", function () {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;

});

export function lerp(start, end, lerpFactor) {
  return start + (end - start) * lerpFactor;
}

