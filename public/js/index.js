import { enterNickname } from "./networking.js";
import { createRoom } from "./networking.js";
import { joinRoom } from "./networking.js";
import { sendMessage } from "./networking.js";
import { startGame } from "./networking.js";
import { leaveRoom } from "./networking.js";
import { updateGameForm } from "./networking.js";

import '../css/style.css';


export const elements = {
  nickname: document.getElementById("nickname"),
  sendNickBtn: document.getElementById("send-nickname"),
  roomList: document.getElementById("roomList"),
  canvas: document.getElementById("game-map"),
  rooms: document.getElementById("rooms"),
  start: document.querySelector(".start-btn"),
  createRoomBtn: document.getElementById("create-room"),
  gameModeSelect: document.getElementById("type-game"),
  gameTimerInput: document.getElementById('game-timer'),
  leaveRoomButton: document.getElementById('leave-room-button'),
  lobby: document.getElementById("lobby"),
  nicknameSection: document.getElementById('nickname-section'),
  chatForm: document.querySelector('.chat-form'),
  listTemplate: document.getElementById('players-list'),
  roomInfo: document.getElementById('room-info'),
  chatFormInput: document.getElementById('message'),
  chatFormButton: document.querySelector('.chat-submit-btn'),
  chatMessages: document.querySelector('.chat-messages'),
  gameForm: document.querySelector('.game-form'),

};

export function displayElement(element, displayStyle) {
  element.style.display = displayStyle;
}


function createTableCell(content) {
  const cell = document.createElement("td");
  cell.textContent = content;
  return cell;
}

function createJoinButton(roomName) {
  const joinButton = document.createElement("button");
  joinButton.textContent = "Dołącz";
  joinButton.classList.add("join-button");
  joinButton.addEventListener("click", () => {
    joinRoom(roomName);
  });
  return joinButton;
}

export function generateRooms(rooms) {
  elements.roomList.innerHTML = "";
  rooms.forEach((room) => {
    const row = document.createElement("tr");
    row.appendChild(createTableCell(room.name));
    row.appendChild(createTableCell(`${room.currentPlayers}/${room.maxPlayers}`));
    const joinCell = createTableCell("");
    joinCell.appendChild(createJoinButton(room.name));
    row.appendChild(joinCell);
    elements.roomList.appendChild(row);
  });
}


elements.sendNickBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let nick = elements.nickname.value;
  enterNickname(nick);

});


elements.createRoomBtn.addEventListener("click", (e) => {
  e.preventDefault();

  Swal.fire({
    title: "Stwórz pokój rozgrywki",
    html: getFormCreateRoomHTML(),
    showCancelButton: true,
    confirmButtonText: "Stwórz",
    cancelButtonText: "Anuluj",
  }).then((result) => {
    if (result.isConfirmed) {
      const roomName = document.getElementById("room-name").value;
      const maxPlayers = document.getElementById("max-players").value;
      createRoom(roomName, maxPlayers);
    }
  });
});


function getFormCreateRoomHTML() {
  return `
      <input id="room-name" class="swal2-input" placeholder="Nazwa pokoju">
      <select id="max-players" class="swal2-select">
        <option value="">Liczba graczy</option>
        ${Array.from({ length: 7 }, (_, i) => `<option value="${i + 2}">${i + 2}</option>`).join('')}
      </select>
    `;
}





  document.body.addEventListener('submit', (event) => {
    if (event.target.matches('.chat-form')) {
      event.preventDefault();

      const chatFormInput = document.querySelector('.form-input.chat-message');

      const message = chatFormInput.value;

      if (message.trim() === "" || !message) return;
      sendMessage(message);

      chatFormInput.value = "";
      chatFormInput.focus();
    }
  });


  elements.gameForm.addEventListener('change', (event) => {
    event.preventDefault();
    const gameMode = elements.gameModeSelect.value;
    const gameTimer = Number(elements.gameTimerInput.value);
   
    updateGameForm(gameMode, gameTimer);
    
  })

  elements.start.addEventListener("click", (event) => {
    event.preventDefault();
  
    const gameMode = elements.gameModeSelect.value;
    const gameTimer = Number(elements.gameTimerInput.value);
    startGame(gameMode, gameTimer);
  })

elements.leaveRoomButton.addEventListener('click', () => {
  leaveRoom()
  displayElement(elements.lobby, "none");
  displayElement(elements.rooms, "grid");

});

export function updatePlayersInRoom(data) {
  const listTemplate = elements.listTemplate;
  const roomName = elements.roomInfo;
  listTemplate.innerHTML = '';
  data.players.forEach(nickname => {
    const li = document.createElement('li');
    li.textContent = nickname;
    listTemplate.appendChild(li);
  });
  roomName.textContent = 'Pokój: ' + data.name;
}


export function showError(error) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: error,
  });
}