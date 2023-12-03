import { User } from "../models/user.js";
import { Result } from "./result.js";

class Users {
    constructor() {
        this.users = new Map();
    }
    add({socket, nickname}) {
     
        if (!nickname ||
            nickname.trim() === "" ||
            nickname.length > 25 ||
            /[^a-zA-Z0-9]/.test(nickname))
        {
            return new Result(false, null, "Nieprawidłowy nick. Prosze użyć liter/liczb.");
        }
        const user = new User(socket, nickname, "rooms");
        this.users.set(socket.id, user);
       
        return new Result(true, user, null)
    }
    get(id) {
        const user = this.users.get(id);
        if (!user) {
            return new Result(false, null, "Nie znaleziono gracza.");
        }
        return new Result(true, user, null);
    }
    remove(id) {
      return  this.users.delete(id);

    }
    getByRoom(room) {
       return Array.from(this.users.values()).filter(user => user.room === room);
    }
}

const users = new Users();
export default users