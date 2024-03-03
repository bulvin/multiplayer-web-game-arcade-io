import globalEmitter from "../utils/eventEmitter.js";


export class RoomController {
    constructor(io, room) {
        this.io = io;
        this.room = room;
    }
    addUser(user) {
        this.room.users.push(user);
       
        this.sendCurrentUsers();
    }
    removeUser(id) {
        const index = this.room.users.findIndex(user => user.id === id);
        if (index !== -1){
            this.room.users.splice(index, 1)
            this.sendCurrentUsers();
          
        }
    }
    getUser(id) {
        const user = this.users.find(user => user.id === id);
        return user;
    }
    sendCurrentUsers() {
        const currentUsers = this.room.users.map(user => user.toJSON());
        this.io.in(this.room.id).emit('currentPlayers', {
            name: this.room.name,
            players: currentUsers
        });
        return currentUsers;
    }
    backToLobby(gameId) {
        this.io.to(this.room.id).emit('backToLobby');
        this.room.game = null;
        globalEmitter.emit('removeGame', gameId);
       
    }

    hasUserWithName(name) {
        return this.room.users.some(user => user.name === name);
    }

    getUniqueName(name) {
        let newName = name;
        let i = 1;
        while (this.hasUserWithName(newName)) {
            newName = `${name}(${i})`;
            i++;
        }
        return newName;
    }
    


}