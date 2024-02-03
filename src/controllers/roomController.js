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
        const currentUsers = this.room.users.map(user => user.name);
        this.io.in(this.room.id).emit('currentPlayers', {
            name: this.room.name,
            players: currentUsers
        });
        return currentUsers;
    }
    

}