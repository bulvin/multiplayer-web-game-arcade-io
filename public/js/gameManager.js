import { Game } from "./game.js";


class GameManager {
    constructor() {
        this.games = {};
    }

    createGame(id, gameData){
        
        const newGame = new Game(gameData);
        for (const id in gameData.players){
            const backendPlayer = gameData.players[id];
            newGame.addPLayer(backendPlayer, id);
        
        }
        this.games[id] = newGame;
        return newGame;
    }
    getGame(id){
        return this.games[id];
    }
    deleteGame(id){
        delete this.games[id];
    }
}
const gameManager = new GameManager();

export { gameManager };