export class User {
    constructor(socket, name, room){
        this.socket = socket;
        this.id = socket.id;
        this.name = name;
        this.room = room
    }


}