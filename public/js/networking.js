
import { gameManager } from "./gameManager.js";

const socket = io.connect(`ws://${window.location.host}`);

export function enterNickname(nickname) {
  socket.emit('joinGame', nickname);
}
export function sendPlayerInput(input) {
  const clientTime = Date.now();
  socket.emit('playerInput', { keys: input, timestamp: clientTime});
}

socket.on('playerJoined', (player) => {
  console.log('Gracz dołączył do gry: ', player);
});

socket.on('disconnected', (info) => {

  console.log(info);
})

socket.on('updateGame', (backendGame, timestamp) => {

  if (gameManager.games[backendGame.id]) {
    const frontendGame = gameManager.games[backendGame.id];

    if (frontendGame.players[socket.id]) {
      frontendGame.camera.setTargetPlayer(frontendGame.players[socket.id]);

    }
    frontendGame.update(backendGame, timestamp);

  } else {
    const gameData = {
      id: backendGame.id,
      map: backendGame.map,
      gameTimer: backendGame.gameTimer,
      abilities: backendGame.abilities,
      bonuses: backendGame.bonuses,
      players: backendGame.players,
    };

    const newGameView = gameManager.createGame(backendGame.id, gameData);

    const localPlayer = newGameView.getPlayer(socket.id);
    if (localPlayer) {
      newGameView.camera.setTargetPlayer(localPlayer);
    }
  }
});

    socket.on('deadMessage', (data) => {

            for (const i in gameManager.games) {
                const game = gameManager.games[i];
                    
                    game.players[data.player].ui.setMessages(data.messages);
                }
    });




