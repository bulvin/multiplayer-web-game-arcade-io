import { UserController } from "../controllers/userController.js";
import { RoomController } from "../controllers/roomController.js";
import { PlayerController } from "../controllers/playerController.js";
import { GameController } from "../controllers/gameController.js";
import { isValidNickname, isValidRoomName, isValidMaxPlayers  } from "../utils/valid.js";
import { User } from "../models/user.js";
import { Game } from "../game/game.js";
import { GameMap } from "../game/gameMap.js";
import { Player } from "../game/player.js"; 
import { Room } from "../models/room.js";
import { generateUuid } from "../utils/generateUuid.js";


export class Network {
  constructor(io) {
    this.io = io;
    this.userControllers = new Map();
    this.roomControllers = new Map();
    this.playerControllers = new Map();
    this.gameControllers = new Map();

    this.io.on("connection", (socket) => this.onConnection(socket));
    
  }

  onConnection(socket) {
    console.log(`Użytkownik połączył się o id ${socket.id}`);

    socket.on("join", (nickname) => {
      this.onJoin(socket, nickname);

        socket.on("joinRoom", (data) => {
          this.joinRoom(socket, data)
          this.registerGameEvents(socket);    
        });
        
        socket.on("createRoom", (data) => {
          this.createRoom(socket, data)
          this.registerGameEvents(socket);
        });
        
    });
   
    socket.on("disconnect", (reason) => this.disconnect(socket, reason));
  }
  
  registerGameEvents(socket) {
    socket.on("receiveMessage", (data) => this.sendMessage(socket, data));
    socket.on("startGame", () => {
      this.initGame(socket);
      
    });
    socket.on("playerInput", (input) => this.onKeydown(socket, input));
  }

  onJoin(socket, nickname) {
    const nicknameValidation = isValidNickname(nickname);
    if (!nicknameValidation.isValid) {
      socket.emit("errorJoin", nicknameValidation.error);
      return;
    }
  
    const user = new User(socket, nickname, "rooms");
    const userController = new UserController(socket, user);
    this.userControllers.set(socket.id, userController);
  
    userController.joinRoom("rooms");
  
    this.updateRooms();
  }

  disconnect(socket) {
    const userController = this.userControllers.get(socket.id);
    if (userController) {
    
      this.handleUserDisconnection(socket.id, userController);
    }
  }  

  handlePlayerDisconnection(socketId, roomController) {
    const playerController = this.playerControllers.get(socketId);
    if (playerController) {
      roomController.room.game.deletePlayer(socketId);
      this.playerControllers.delete(socketId);
    }
  }
  
  handleUserDisconnection(socketId, userController) {
    const roomController = this.roomControllers.get(userController.user.room);
    if (roomController) {
      userController.disconnect();
      roomController.removeUser(socketId);
      this.handlePlayerDisconnection(socketId, roomController);
    }
    this.userControllers.delete(socketId);
  }

  initGame(socket) {
    const roomID = this.getSocketRoom(socket);
    
    const roomController = this.roomControllers.get(roomID);

    const game = this.createGame(roomController.room);
  
    const playerControllers = [];
    for (const id in game.players) {
      const player = game.players[id];
      const userController = this.userControllers.get(player.user.id);
      const playerController = new PlayerController(userController, player);
      this.playerControllers.set(player.user.id, playerController);
      playerControllers.push(playerController);
    }
    game.init();
    const gameController = new GameController(game, roomController, playerControllers);
    this.gameControllers.set(game.id, gameController);
  }
  
  createGame(room) {
    const game = new Game(generateUuid(), new GameMap(80, 80));
  
    let color;
    room.users.forEach(user => {
      color = game.colors.getColor();
      const player = new Player(user, game, color);
  
      game.addPlayer(player);
    });
    game.room = room.id;
    room.game = game;
    return game;
  }

  onKeydown(socket, input) {
    const playerController = this.playerControllers.get(socket.id);
    if (!playerController) {
      return;
    }
    playerController.handleInput(input.keys);
  }
 
  createRoom(socket, {name, maxPlayers}) {
    const roomNameValidation = isValidRoomName(name, this.roomControllers.values());
    if (!roomNameValidation.isValid) {
      socket.emit("errorCreateRoom", roomNameValidation.error);
      return;
    }
  
    const maxPlayersValidation = isValidMaxPlayers(maxPlayers);
    if (!maxPlayersValidation.isValid) {
      socket.emit("errorCreateRoom", maxPlayersValidation.error);
      return;
    }
  
    const room = new Room(generateUuid(), name, parseInt(maxPlayers));
    const roomController = new RoomController(this.io, room);
    this.roomControllers.set(room.id, roomController);
  
    const userController = this.userControllers.get(socket.id);
    if (userController) {
      userController.leaveCurrRoom();
      userController.joinRoom(room.id);
      roomController.addUser(userController.user);
      
      this.updateRooms();
    }
  }

  updateRooms() {
    const roomsSerialized = Array.from(this.roomControllers.values())
          .map((roomController) => roomController.room.toJSON());
          
    this.io.in("rooms").emit("updateRooms", roomsSerialized);
  }

  joinRoom(socket, roomName) {
    
    let roomController;

    for (const controller of this.roomControllers.values()) {
      if (controller.room.name === roomName) {
        roomController = controller;
        break;
      }
    }
  
    if (!roomController) {
      socket.emit("errorJoinRoom", "Pokój nie istnieje.");
      return;
    }
    const room = roomController.room;
 
    const userController = this.userControllers.get(socket.id);
    
    if (userController) {
      userController.leaveCurrRoom();   
      userController.joinRoom(room.id);
      roomController.addUser(userController.user);
    }
  

  
  }

  sendMessage(socket, message) {

    const userController = this.userControllers.get(socket.id);
 
    userController.sendMessage(message);

  }

  
  getSocketRoom(socket) {
  
    const socketRooms = Array.from(socket.rooms.values()).filter(
        (r) => r !== socket.id && r !== 'lobby'
      );
    
    const gameRoom = socketRooms && socketRooms[0];
    
      return gameRoom;
  }


}
