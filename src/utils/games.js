import { Game } from "../game/game.js";
import { GameMap } from "../game/gameMap.js";
import { Player } from "../game/player.js";
import { generateUuid } from "./generateUuid.js";

class Games {
    constructor() {
        this.games = new Map();
    }
    add(room) {

        const game = new Game(generateUuid(), new GameMap(80, 80));
       
        let color;
        room.users.forEach(user => {
            color =  game.colors.getColor();
            const player = new Player(user, game, color);
            
            game.addPlayer(player);
        });
        game.room = room.id;
        room.game = game;
        this.games.set(game.id, game);
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