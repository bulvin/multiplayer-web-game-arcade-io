import { Room } from "../models/room.js";
import { generateUuid } from "./generateUuid.js";
import { Result } from "./result.js";


class Rooms {
    constructor() {
        this.rooms = [];
    }
    add(name, maxPlayers){
        const existingRoom = this.rooms.find((room) => room.name === name);
        
        if (existingRoom) {
            return new Result(false, null, "Pokój o tej nazwie już istnieje!");
        }
        if (
            parseInt(maxPlayers) < 2 ||
            parseInt(maxPlayers) > 10
        ) {
            return new Result(false, null, "Wprowadzono nieprawidłową  liczbę graczy");
        }
        if (!name){
            return new Result(false, null, "Proszę podać nazwę pokoju.");
        }
            
          
        const id = generateUuid();
        const room = new Room(id, name.trim(), maxPlayers);
        this.rooms.push(room);
        

        return new Result(true, room, null);

    }
    get(id) {
        const existingRoom = this.rooms.find((room) => room.id === id);

        if (!existingRoom) {
            return new Result(false, null, "Nie znaleziono pokoju!");
        }
        return new Result(true, existingRoom, null);
    }
    getByName(name) {
        const existingRoom = this.rooms.find((room) => room.name === name);

        if (!existingRoom) {
            return new Result(false, null, "Nie znaleziono pokoju!");
        }
        return new Result(true, existingRoom, null);
    } 
    remove(id) {
        const index = this.rooms.findIndex((user) => user.id === id);
        if (index !== -1) return this.rooms.splice(index, 1);
    } 
    getAll() {
        return this.rooms.map(room => room.toJSON());
    }
}
const rooms = new Rooms();
export default rooms;