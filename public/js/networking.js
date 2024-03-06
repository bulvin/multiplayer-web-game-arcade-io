import {  getGame } from "./gameManager.js";
import { displayElement, generateRooms, showError, updatePlayersInRoom } from "./index.js";
import { elements } from "./index.js";
import { createGame, deleteGame} from "./gameManager.js";

import io from 'socket.io-client';
import { throttle } from "throttle-debounce";

const socket = io(`${window.location.host}`, { transports: ["websocket"] });

const enterNickname = (nickname) => socket.emit("join", nickname);

const sendPlayerInput = (input) => throttle(socket.emit("playerInput", input), 20);

const createRoom = (name, maxPlayers) =>  socket.emit("createRoom", { name: name, maxPlayers: maxPlayers,});

const joinRoom = (room) => socket.emit("joinRoom", room);

const sendMessage = (message) => socket.emit('receiveMessage', message);

const startGame = (gameMode, gameTime) => socket.emit('startGame', { gameMode, gameTime });

const updateGameForm = (gameMode, gameTime) => socket.emit('gameFormUpdate', { gameMode, gameTime });




socket.on("joinedOrCreated", () => {
  displayElement(elements.lobby, "flex");
  displayElement(elements.rooms, "none");
});

socket.on("error", (errorMessage) => showError(errorMessage));


socket.on("updateGame", (backendGame) => {
  const frontendGame = getGame();

  if (frontendGame) {
    frontendGame.update(backendGame);
  }
  else {
    const gameData = {
      mode: backendGame.mode,
      map: backendGame.map,
      gameTimer: backendGame.gameTimer,
      abilities: backendGame.abilities,
      bonuses: backendGame.bonuses,
      me: backendGame.me,
      players: backendGame.players,
      leaderBoard: backendGame.leaderBoard,
    };
    
    const newGameView = createGame(gameData);
 
    displayElement(elements.lobby, "none")
    displayElement(elements.canvas, "block");
  }
 

});



socket.on("deadMessage", (data) => {
  const frontendGame = getGame();
  frontendGame.ui.setMessages(data.messages);
  
});

socket.on("updateRooms", (rooms) => {

  displayElement(elements.rooms, "grid");
  displayElement(elements.nicknameSection, "none");
  generateRooms(rooms);
});

socket.on("currentPlayers", (data) => updatePlayersInRoom(data));


socket.on("message", ({ playerName, text, type, createdAt }) => {
  const date = new Date(createdAt);

  const hours = date.getHours();
  const minutes = date.getMinutes();

  const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  const chatMessages = elements.chatMessages;
  let messageClass;
  if (type === 'error') {
    messageClass = 'message-error';
  } else if (type === 'info') {
    messageClass = 'message-info';
  } else {
    messageClass = 'message-normal';
  }
  const html = `<div class="message ${messageClass}">
    <p>
      <span class='message-playername'>
        ${playerName}
      </span>
      <span class='message-date'>
        ${time}
      </span>
    </p>
    <p>
    ${text}
    </p>
  </div>`;
  chatMessages.insertAdjacentHTML('afterBegin', html);
});



socket.on("updateGameForm", (gameData) => {

  const { gameMode, gameTime } = gameData;
  elements.gameModeSelect.value = gameMode;
  elements.gameTimerInput.value = gameTime;

});


socket.on("gameOver", (scoreboard) => {
  const frontendGame = getGame();
  frontendGame.gameOver = true;
  frontendGame.ui.setEndGameScreen(scoreboard);

})

socket.on("backToLobby", () => {
  displayElement(elements.lobby, "flex");
  displayElement(elements.canvas, "none");
  deleteGame();
});


 const leaveRoom = () => {
  socket.emit('leaveRoom');

  if (!getGame()) {
    displayElement(elements.rooms, "grid");
  }
}


export { enterNickname, sendPlayerInput, createRoom, joinRoom, sendMessage, startGame, updateGameForm, leaveRoom };