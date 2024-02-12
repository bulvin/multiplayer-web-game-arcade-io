import { gameManager } from "./gameManager.js";
import { generateRooms } from "./index.js";
import { updatePlayersinRoom } from "./index.js";

const socket = io.connect(`${window.location.host}`, { transports: ["websocket"] });

export function enterNickname(nickname) {
  socket.emit("join", nickname);
}

export function sendPlayerInput(input) {
  const clientTime = Date.now();
  socket.emit("playerInput", { keys: input, timestamp: clientTime });
}

export function createRoom(data, callback) {
  const { name, maxPlayers } = data;

  socket.emit("createRoom", {
    name: name,
    maxPlayers: maxPlayers,
  });

  socket.on("errorCreateRoom", (errorMessage) => {
    callback(errorMessage);
  });
}

export function joinRoom(room) {
 
  socket.emit("joinRoom", room);
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
let canvasDisplayed = false;
socket.on("updateGame", (backendGame, timestamp) => {
 
  if (!canvasDisplayed) {
    document.querySelector("#lobby").style.display = 'none';
    document.querySelector("#game-map").style.display = 'block';
    canvasDisplayed = true; 
  }

  if (gameManager.games[backendGame.id]) {
    const frontendGame = gameManager.games[backendGame.id];
   
    frontendGame.update(backendGame, timestamp);
    
  } else {
    const gameData = {
      id: backendGame.id,
      map: backendGame.map,
      gameTimer: backendGame.gameTimer,
      abilities: backendGame.abilities,
      bonuses: backendGame.bonuses,
      me: backendGame.me,
      players: backendGame.players,
      leaderBoard: backendGame.leaderBoard,
    };
    const newGameView = gameManager.createGame(backendGame.id, gameData);
  }
});


socket.on("deadMessage", (data) => {
  for (const i in gameManager.games) {
    const game = gameManager.games[i];

    game.ui.setMessages(data.messages); 
  }
});

socket.on("updateRooms", (rooms) => {
  generateRooms(rooms);
});

socket.on("currentPlayers", (data) => {
  
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
  chatMessages.insertAdjacentHTML('afterBegin', html);

});

export const sendMessage = (message) => {

 socket.emit('receiveMessage', message);
   
}
     
export const startGame = () => {
  socket.emit('startGame');
}


