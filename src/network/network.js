import { UserController } from "../controllers/userController.js";
import { RoomController } from "../controllers/roomController.js";
import { PlayerController } from "../controllers/playerController.js";
import { GameController } from "../controllers/gameController.js";
import { isValidNickname, isValidRoomName, isValidMaxPlayers, isValidToStartGame, isValidJoinRoom } from "../utils/valid.js";
import { User } from "./user.js";
import { Game } from "../game/game.js";
import { GameMap } from "../game/gameMap.js";
import { Player } from "../game/player.js";
import { Room } from "./room.js";
import { Team } from "../game/team.js";
import { generateUuid } from "../utils/generateUuid.js";
import globalEmitter from "../utils/eventEmitter.js";
import { formatMessage } from "../utils/formatMessage.js";



export class Network {
  constructor(io) { 
    this.io = io;
    this.userControllers = new Map();
    this.roomControllers = new Map();
    this.playerControllers = new Map();
    this.gameControllers = new Map();

    this.io.on("connection", (socket) => this.onConnection(socket));
    globalEmitter.on("removeGame", (gameId) => this.removeGame(gameId));

  }
  onConnection(socket) {
    console.log(`Użytkownik połączył się o id ${socket.id}`);
    socket.on("join", (nickname) => {
      const joined = this.onJoin(socket, nickname);

      if (joined) {
        this.updateRooms();

        socket.on("joinRoom", (data) => {
          const joinedRoom = this.joinRoom(socket, data);
          if (joinedRoom) {
            this.updateRooms();
            this.registerGameEvents(socket);
          }
        })
        socket.on("createRoom", (data) => {
          const created = this.createRoom(socket, data)
          if (created) {
            this.updateRooms();
            this.registerGameEvents(socket);
          }
        });
      }
    });
    socket.on("disconnect", (reason) => this.disconnect(socket, reason));
  }

  registerGameEvents(socket) {
    socket.emit("joinedOrCreated");
    socket.on("receiveMessage", (data) => this.sendMessage(socket, data));
    socket.on("startGame", (gameData) => this.onStartGame(socket, gameData));
    socket.on("gameFormUpdate", (gameData) => this.onUpdateGameForm(socket, gameData));
    socket.on("leaveRoom", () => this.leaveRoom(socket));

  }

  onJoin(socket, nickname) {
    const nicknameValidation = isValidNickname(nickname);
    if (!nicknameValidation.isValid) {
      socket.emit("error", nicknameValidation.error);
      return false;
    }

    const user = new User(socket.id, nickname, "rooms");
    const userController = new UserController(socket, user);
    this.userControllers.set(socket.id, userController);

    userController.joinRoom("rooms");
    return true;

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
      const gameController = this.gameControllers.get(roomController.room.game.id);
      if (gameController) {
        gameController.removePlayer(playerController);
      }
      this.playerControllers.delete(socketId);
    }

  }

  handleUserDisconnection(socketId, userController) {
    const roomController = this.roomControllers.get(userController.user.room);
    if (roomController) {
      userController.disconnect();
      roomController.removeUser(socketId);
      this.handlePlayerDisconnection(socketId, roomController);

      if (roomController.room.users.length === 0) {
        this.removeRoom(roomController.room.id);
      }
    }
    this.updateRooms();
    this.userControllers.delete(socketId);

  }

  onStartGame(socket, gameData) {
    const room = this.getSocketRoom(socket);
    const roomController = this.roomControllers.get(room);
    const startGameValidation = isValidToStartGame(gameData, roomController.room);

    if (startGameValidation.isValid) {
      this.initGame(socket, gameData);

    } else {
      this.io.to(room).emit("message", formatMessage("SERWER", startGameValidation.error, "error"));
    }

  }

  initGame(socket, gameData) {
    const roomID = this.getSocketRoom(socket);

    const roomController = this.roomControllers.get(roomID);

    const { gameMode, gameTime } = gameData;

    const game = this.createGame(roomController.room, gameMode, gameTime);

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

  createGame(room, gameMode, gameTime) {
    const gameTimer = Number(gameTime * 1000 * 60);
    const game = new Game(generateUuid(), new GameMap(80, 80), gameMode, gameTimer);

    let spawnTile;
    let teamIndex = 0;
    if (gameMode === 'team') {
      const teamNames = ['A', 'B'];
      game.teams = teamNames.map(name => {
        const { playerColor, tailColor } = game.colors.getColors();
        return new Team(name, playerColor, tailColor);
      });
    }
    room.users.forEach(user => {
      let color;
      spawnTile = game.map.spawn();

      let team = null;
      if (gameMode === 'team') {
        team = game.teams[teamIndex];
        color = { playerColor: team.color, tailColor: team.tailColor };
        teamIndex = (teamIndex + 1) % game.teams.length;
      } else {
        color = game.colors.getColors();
      }
      const player = new Player(user, game, color, spawnTile, team);

      game.addPlayer(player);
    });

    game.room = room.id;
    room.game = game;
    return game;
  }


  createRoom(socket, { name, maxPlayers }) {
    const roomNameValidation = isValidRoomName(name, this.roomControllers.values());
    if (!roomNameValidation.isValid) {
      socket.emit("error", roomNameValidation.error);
      return false;
    }

    const maxPlayersValidation = isValidMaxPlayers(maxPlayers);
    if (!maxPlayersValidation.isValid) {
      socket.emit("error", maxPlayersValidation.error);
      return false;
    }

    const room = new Room(generateUuid(), name, parseInt(maxPlayers));
    const roomController = new RoomController(this.io, room);
    this.roomControllers.set(room.id, roomController);

    const userController = this.userControllers.get(socket.id);

    userController.leaveCurrRoom();
    userController.joinRoom(room.id);
    roomController.addUser(userController.user);

    return true;
  }

  updateRooms() {
    const rooms = Array.from(this.roomControllers.values())
      .map((roomController) => roomController.room.toJSON());

    this.io.in("rooms").emit("updateRooms", rooms);
  }

  joinRoom(socket, roomName) {

    let roomController;
    for (const controller of this.roomControllers.values()) {
      if (controller.room.name === roomName) {
        roomController = controller;
        break;
      }
    }
    const room = roomController.room;

    const joinRoomValidation = isValidJoinRoom(room);

    if (!joinRoomValidation.isValid) {
      socket.emit("error", joinRoomValidation.error);
      return false;
    }

    const userController = this.userControllers.get(socket.id);

    if (userController) {
      userController.leaveCurrRoom();
      let playerName = userController.user.name;
    
      userController.user.name = roomController.getUniqueName(playerName);
      userController.joinRoom(room.id);
      roomController.addUser(userController.user);
      const gameController = this.gameControllers.get(room.game?.id);
      if (gameController) {
        this.addPlayerToStartedGame(socket, gameController, userController);
      }
      return true;
    }

    return false;
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

  addPlayerToStartedGame(socket, gameController, userController) {
    let team = null;
    const players = gameController.game.players;
    if (gameController.game.mode === 'team') {
      const teams = gameController.game.teams;

      team = teams.reduce((minTeam, currentTeam) => {
        const minTeamCount = Object.values(players).filter(player => player.team === minTeam).length;
        const currentTeamCount = Object.values(players).filter(player => player.team === currentTeam).length;
        return minTeamCount < currentTeamCount ? minTeam : currentTeam;
      });
    }
    const color = team ? { playerColor: team.color, tailColor: team.tailColor } : gameController.game.colors.getColors();
    const spawnTile = gameController.game.map.spawn();
    const player = new Player(
      userController.user,
      gameController.game,
      color,
      spawnTile,
      team
    );

    const playerController = new PlayerController(userController, player);
    this.playerControllers.set(socket.id, playerController);
    gameController.addPlayer(playerController);
  }

  removeGame(gameId) {
    const gameController = this.gameControllers.get(gameId);
    if (gameController) {
      gameController.playersControllers.forEach(playerController => {
        this.playerControllers.delete(playerController.player.user.id);
      });
      this.gameControllers.delete(gameId);
    }

  }
  removeRoom(roomId) {
    const roomController = this.roomControllers.get(roomId);
    if (roomController) {
      const duringGame = roomController.room.game;
      if (duringGame) {
        this.removeGame(duringGame.id);
      }

      this.roomControllers.delete(roomId);
    }
  }

  leaveRoom(socket) {
    const userController = this.userControllers.get(socket.id);
    const roomController = this.roomControllers.get(userController.user.room);
    if (roomController && !roomController.room.game) {
      roomController.removeUser(socket.id);
      userController.leaveCurrRoom();
      userController.joinRoom("rooms");
      if (roomController.room.users.length === 0) {
        this.removeRoom(roomController.room.id);
      }

    }
    this.updateRooms();
  }

  onUpdateGameForm(socket, gameData) {
    const userController = this.userControllers.get(socket.id);
    const roomController = this.roomControllers.get(userController.user.room );
    if (userController) {
      userController.updateGameForm(gameData, roomController.room);
    }

  }


}
