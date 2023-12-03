import { enterNickname } from "./networking.js";
import { createRoom } from "./networking.js";
import { joinRoom } from "./networking.js";
import { sendMessage } from "./networking.js";
import { startGame } from "./networking.js";

const nickname = document.getElementById("nickname");
const sendNickBtn = document.getElementById("send-nickname");
const roomList = document.getElementById("roomList");
const roomsTable = document.querySelector("#rooms-table");
const canvas = document.getElementById("game-map");
const titleRooms = document.getElementById("rooms-title");
const content = document.getElementById("#centered-content");
const rooms = document.getElementById("rooms");
const start = document.querySelector(".start-btn");

const createRoomBtn = document.getElementById("create-room");

canvas.style.display = "none";
document.getElementById("rooms").style.display = "none";

export function generateRooms(rooms) {
  roomList.innerHTML = "";

  rooms.forEach((room) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = room.name;
    row.appendChild(nameCell);

    const playersCell = document.createElement("td");
    playersCell.textContent = `${room.currentPlayers}/${room.maxPlayers}`;
    row.appendChild(playersCell);

    const joinCell = document.createElement("td");
    const joinButton = document.createElement("button");
    joinButton.textContent = "Dołącz";
    joinButton.classList.add("join-button");

    joinButton.addEventListener("click", () => {
        joinRoom(room.name); 

        document.getElementById("lobby").style.display = "flex";
        document.getElementById("rooms").style.display = "none";
        

      });
    joinCell.appendChild(joinButton);
    row.appendChild(joinCell);

    roomList.appendChild(row);
  });
}

sendNickBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let nick = nickname.value;
    if (nick.length <= 25 && nick !== '' && /[^a-zA-Z0-9]/.test(nickname)) {
      
        enterNickname(nick);
        document.getElementById('nickname-section').style.display = 'none';
        rooms.style.display = 'block';
    } 
    
   

  createRoomBtn.addEventListener("click", (e) => {
    Swal.fire({
      title: "Stwórz pokój rozgrywki",
      html: `
                <input id="room-name" class="swal2-input" placeholder="Nazwa pokoju">
                <select id="max-players" class="swal2-select">
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                </select>
            `,
      showCancelButton: true,
      confirmButtonText: "Stwórz",
      cancelButtonText: "Anuluj",
    }).then((result) => {
      if (result.isConfirmed) {
        const roomName = document.getElementById("room-name").value;
        const maxPlayers = document.getElementById("max-players").value;
        createRoom(
          {
            name: roomName,
            maxPlayers: maxPlayers,
            playerName: nickname.value,
          },
          (error) => {
            if (error) {
              console.log(error);
              alert(error);
             
              return;
            } else {
              document.getElementById("lobby").style.display = "flex";
             
            }
            setCurrentRoom(roomName);
          }
        );
        document.getElementById("lobby").style.display = "flex";
        rooms.style.display = "none";
        roomList.style.display = "none";
      }
    });
  });
});

const chatForm = document.querySelector('.chat-form');
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
 
  
  const chatFormInput = chatForm.querySelector(".chat-message");
  const chatFormButton = chatForm.querySelector(".chat-submit-btn");

  chatFormButton.setAttribute("disabled", "disabled");

  const message = event.target.elements.message.value;
  
  sendMessage(message);
  chatFormButton.removeAttribute("disabled");
  chatFormInput.value = "";
  chatFormInput.focus();

   
});

start.addEventListener('click', (event) => {
  event.preventDefault();

  startGame();
  canvas.style.display = 'block';
  document.getElementById('lobby').style.display = 'none';
})

export function updatePlayersinRoom(data) {
    const listTemplate = document.getElementById('players-list');
    const roomName = document.getElementById('room-info');
    listTemplate.innerHTML = ''; 
    data.players.forEach(nickname => {
        const li = document.createElement('li');
        li.textContent = nickname;
        listTemplate.appendChild(li);
    });
    roomName.innerHTML = 'Pokój: ' + data.name; 
}
