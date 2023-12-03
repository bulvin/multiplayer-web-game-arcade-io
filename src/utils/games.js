import { Game } from "../game/game.js";
import { GameMap } from "../game/gameMap.js";
import { Player } from "../game/player.js";

class Games {
    constructor() {
        this.games = new Map();
    }
    add(room) {


        const gameMap = new GameMap(80, 80);
        const game = new Game(room.id, gameMap);

        room.users.forEach(user => {
          
            const player = new Player(user, game);
            
            game.addPlayer(player);
        });
        game.room = room.id;
        this.games.set(room.id, game);
        
        return game;
    }
    get(id) {
        const existGame = this.games.get(id);
        if (existGame) {
            return existGame;
        }
        return null;
    }
    delete(id) {
        return this.games.delete(id);
    }
    getAll() {
        return Array.from(this.games.values());
    }
}
const games = new Games();
export default games;