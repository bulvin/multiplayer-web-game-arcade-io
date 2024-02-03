import { UserController } from "../controllers/userController.js";
import users from "../utils/users.js";
import rooms from "../utils/rooms.js";
import { RoomController } from "../controllers/roomController.js";
import games from "../utils/games.js";
import { PlayerController } from "../controllers/playerController.js";
import { GameController } from "../controllers/gameController.js";

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
      
        });
        socket.on("createRoom", (data) => this.createRoom(socket, data));
        socket.on("receiveMessage", (data) => this.sendMessage(socket, data));
        socket.on("startGame", () => {
          this.initGame(socket);
        });
        socket.on("playerInput", (input) => this.onKeydown(socket, input));
    });
   
    socket.on("disconnect", (reason) => this.disconnect(socket, reason));
  }

  onJoin(socket, nickname) {
    const result = users.add({socket, nickname});

    if (result.error) {
      socket.emit("errorJoin", result.error);
      return;
    } 
    const userController = new UserController(socket, result.data);
    this.userControllers.set(socket.id, userController);
                
    userController.joinRoom("rooms");
  
    this.updateRooms();
  }

  disconnect(socket) {
    const isDeleted = users.remove(socket.id);

    if (isDeleted) {
      const userController = this.userControllers.get(socket.id);
      const roomController = this.roomControllers.get(userController.user.room);
      const playerController = this.playerControllers.get(socket.id);
     
      userController.disconnect();
      if (roomController) {
        roomController.removeUser(socket.id);

        if (playerController) {
          roomController.room.game.deletePlayer(socket.id);
          this.playerControllers.delete(socket.id);
        }
      }
  
      this.userControllers.delete(socket.id);
  
  }
}

  initGame(socket) {
    const roomID = this.getSocketRoom(socket);
    const room = rooms.get(roomID);
  
    const game = games.add(room.data);
   
    const roomController = this.roomControllers.get(roomID);
   
   
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

  onKeydown(socket, input) {
    const playerController = this.playerControllers.get(socket.id);
    if (!playerController) {
      return;
    }
    playerController.handleInput(input.keys);
  }
  sendGameUpdate(socket) {
    const playerController = this.playerControllers.get(socket.id);
    if (playerController) {
      playerController.sendGameState();
    }
  }
  createRoom(socket, {name, maxPlayers}) {
    const result = rooms.add(name, maxPlayers);
  
    if (result.error) {
      socket.emit("errorCreateRoom", result.error);
      return;
    }
      const room = result.data;
      
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
    const roomsSerialized = rooms.getAll();
    this.io.in("rooms").emit("updateRooms", roomsSerialized);
  }

  joinRoom(socket, roomName) {
    
    const result = rooms.getByName(roomName);
  
    if (result.error) {
      socket.emit("errorJoinRoom", result.error)
      return;
    }
    const room = result.data;
 
    const userController = this.userControllers.get(socket.id);
    const roomController = this.roomControllers.get(room.id);
    userController.leaveCurrRoom();   
    userController.joinRoom(room.id);
    roomController.addUser(userController.user);

  
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
