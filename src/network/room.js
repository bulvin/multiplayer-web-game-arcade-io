export class Room {
    constructor(id, name, maxPlayers) {
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.users = {};
        this.game = null;
    }
    addUser(user, socket) {
        this.users[socket.id] = user;
    }
    getUser(socket) {
         return this.users[socket.id];
    }
    deleteUser(socket) {
        delete this.users[socket.id];
    }
    getCurrentPlayers() {
        return Array.from(Object.values(this.users));
    }
  
    toJSON() {
        return {
            name: this.name,
            currentPlayers: Object.keys(this.users).length,
            maxPlayers: this.maxPlayers
        }
    }
}