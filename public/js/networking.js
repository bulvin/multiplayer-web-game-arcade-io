import { gameManager } from "./gameManager.js";
import { generateRooms } from "./index.js";
import { updatePlayersinRoom } from "./index.js";

const socket = io(`ws://${window.location.host}`);

export function enterNickname(nickname) {
  socket.emit("join", nickname);
}

export function sendPlayerInput(input) {
  const clientTime = Date.now();
  socket.emit("playerInput", { keys: input, timestamp: clientTime });
}

export function createRoom(data, callback) {
  const { name, maxPlayers, playerName } = data;

  socket.emit("createRoom", {
    name: name,
    maxPlayers: maxPlayers,
    playerName: playerName,
  });

  socket.on("errorCreateRoom", (errorMessage) => {
    callback(errorMessage);
  });
}

export function joinRoom(room, player) {
  const data = {
    room: room,
    player: player,
  };
  console.log(data);
  socket.emit("joinRoom", data);
}

socket.on("errorJoin", (errorMessage) => {
  alert(errorMessage);
});

socket.on("playerJoined", (player) => {
  console.log("Gracz dołączył do gry: ", player);
});

socket.on("disconnected", (info) => {
  console.log(info);
});

socket.on("updateGame", (backendGame, timestamp) => {
  if (gameManager.games[backendGame.id]) {
    const frontendGame = gameManager.games[backendGame.id];
    if (frontendGame.players[socket.id]) {
      const localPlayer = frontendGame.players[socket.id];
      frontendGame.camera.setTargetPlayer(localPlayer);
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

socket.on("deadMessage", (data) => {
  for (const i in gameManager.games) {
    const game = gameManager.games[i];

    game.players[socket.id].ui.setMessages(data.messages);
  }
});

socket.on("updateRooms", (rooms) => {
  generateRooms(rooms);
});

socket.on("currentPlayers", (data) => {
  console.log(data);
  updatePlayersinRoom(data);
});

socket.on("message", ({ playerName, text, createdAt }) => {
  const date = new Date(createdAt);
  
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  const chatMessages = document.querySelector(".chat-messages");
  const html = `<div class="message">
    <p>
      <span class='message-playername'>
        ${playerName}
      </span>
      <span class='message-date'>
        ${formattedTime}
      </span>
    </p>
    <p>
    ${text}
    </p>
  </div>`;
  chatMessages.insertAdjacentHTML('beforeend', html);
});
