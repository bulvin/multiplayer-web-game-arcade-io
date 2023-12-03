import { formatMessage } from "../utils/formatMessage.js";

export  class UserController {
    constructor(socket, user) {
        this.socket = socket;
        this.user = user;
    }
    joinRoom(room) {
        this.socket.join(room);
        this.user.room = room
        if (room !== "rooms") {
            this.socket.emit("message", formatMessage("Admin", "Witaj graczu!"));
            this.socket.to(room).emit(
                "message",
                formatMessage("Admin", `${this.user.name} dołączył do gry`)
              );
        }
       
    }
    
    leaveCurrRoom() {
       this.socket.leave(this.user.room);
       if (this.user.room !== "rooms") {
           this.socket.to(this.user.room).emit("message", formatMessage('Admin', `Gracz ${this.user.name} opuścił grę.`));
       }
    

    }
    sendMessage(message) {
     
        this.socket.emit("message", formatMessage(this.user.name, message));
        this.socket.to(this.user.room).emit("message", formatMessage(this.user.name, message));
    }
   
    disconnect() {
        this.socket.to(this.user.room).emit("message", formatMessage('Admin', `Gracz ${this.user.name} rozłączył się.`));
    
    }
  
   


}