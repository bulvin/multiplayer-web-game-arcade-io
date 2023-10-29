import { enterNickname } from "./networking.js";
import { gameManager } from "./gameManager.js";


export const canvas = document.getElementById("game-map");
const ctx = canvas.getContext('2d');
const devicePixelRatio = window.devicePixelRatio || 1;



function animate() {
  requestAnimationFrame(animate);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in gameManager.games) {
    const game = gameManager.games[id];

   game.camera.update();
    game.draw();

  }
  
}
animate();

let countNickname = 1;
window.addEventListener("load", function () {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;

  enterNickname(`Player${countNickname}`);
countNickname++;

});


function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  for (const id in gameManager.games) {
    const game = gameManager.games[id];

    game.camera.update();


  }
}

export function lerp(start, end, lerpFactor) {
  return start + (end - start) * lerpFactor;
}


window.addEventListener("resize", resize);

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
});

