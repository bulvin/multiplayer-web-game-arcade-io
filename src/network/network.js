import { v4 as uuidv4 } from 'uuid';
import { Room } from './room.js';
import  { formatMessage }  from './formatMessage.js';

export class Network {
    constructor(io, game){
        this.io = io;
        this.game = game;
        this.rooms = new Map();

        this.io.on('connection', socket => this.onConnection(socket));
    }

    onConnection(socket) {
        console.log(`Użytkownik połączył się o id ${socket.id}`);
        
        socket.on('join', nickname => {
            this.onJoin(socket, nickname);

            socket.on('playerInput', input => this.onKeydown(socket, input));
            socket.on('createRoom', data => this.createRoom(socket, data));
           
        
        });
        socket.on('joinRoom', data => this.joinRoom(socket, data));
        socket.on('disconnect', reason => this.disconnect(socket, reason));
    }   

    onJoin(socket, nickname) {
        if (!nickname || nickname === '' || nickname.length > 25 || /[^a-zA-Z0-9]/.test(nickname)) {
            socket.emit('errorJoin', "Nieprawidłowy nick. Prosze użyć liter/liczb.");
            return;
        }
        const id = uuidv4();
        socket.join('rooms');

        const room = new Room(id , 'test', 10);
        this.rooms.set(id, room);

        this.getRooms(socket);
    }  

    disconnect(socket){
        const player = this.game.deletePlayer(socket.id);
        if (player) {
            this.io.emit('disconnected', `Gracz ${player.nickname} opuścił rozgrywkę.`);
        }
    } 

    sendGameUpdate(timestamp) {
        const gameData = this.game.toJSON();
        this.io.emit('updateGame', gameData, timestamp);
    }

    onKeydown(socket, input) {
        const player = this.game.getPlayer(socket.id);  
        if (!player){
            return;
        } 
        player.setInput(input.keys);
    }
    createRoom(socket, data) {
        const { name, maxPlayers, playerName } = data;
        const id = uuidv4();
        console.log(data);
        if (parseInt(maxPlayers) >= 2 && parseInt(maxPlayers) <= 10 && (name !== '' && name !== null)) {

            const room = new Room(id , name, parseInt(maxPlayers));
            this.rooms.set(id, room);
            console.log(playerName);
        
            socket.join(room.id);
            socket.leave('rooms');
        
            room.addUser(playerName, socket);
            this.getRooms();
            this.updatePlayersInRoom(room.id);
            socket.emit('message', formatMessage('Admin', 'Witaj graczu!'));
        } else {
            socket.emit('errorCreateRoom', "Nie udało się utworzyć pokoju do gry.");
        }
    }

    getRooms() {
        
        const rooms = Array.from(this.rooms.values()).map(room => room.toJSON());
        this.io.in('rooms').emit('updateRooms', rooms);
    }
    updatePlayersInRoom(roomID) {
        const room = this.getRoomByID(roomID);
        if (room) {
            const players = room.getCurrentPlayers();
            this.io.to(roomID).emit('currentPlayers', {
                name: room.name, 
                players : players
            });
        }
    }
    joinRoom(socket, data) {
        const roomName = data.room;
        const room = this.getRoomByName(roomName);
      
        if (!room) {
            console.log('Nie znaleziono pokoju');
            return;
        }
        socket.join(room.id);
        room.addUser(data.player, socket);
        console.log(formatMessage('Admin', 'Witaj graczu!'));
        socket.emit('message', formatMessage('Admin', 'Witaj graczu!'));
        socket.to(room.id).emit('message', formatMessage('Admin', `${data.player} dołączył do gry`)); 
        this.updatePlayersInRoom(room.id);
    }
    getRoomByID(id) {
        return this.rooms.get(id);
    }
    getRoomByName(name) {
        for (const room of this.rooms.values()) {
            console.log(name);
            if (room.name === name) {
                return room;
            }
        }
        return null; 
    }
    getRooms() {
        console.log(this.rooms);
        const rooms = Array.from(this.rooms.values()).map(room => room.toJSON());
        this.io.in('rooms').emit('updateRooms', rooms);
    }
    updatePlayersInRoom(roomID) {
        const room = this.getRoomByID(roomID);
        if (room) {
            const players = room.getCurrentPlayers();
            this.io.to(roomID).emit('currentPlayers', {
                name: room.name, 
                players : players
            });
        }
    }

    leaveRoom(socket, roomID) {
        const room = this.rooms.get(roomID);
        if (room) {
            room.deleteUser(socket.id);
            socket.leave(roomID);
        }
    }

    
}