import { Game } from "./game.js";


let game = null;

export function createGame(gameData) {
    if (!game) {
        game = new Game(gameData);
        for (const id in gameData.players) {
            const backendPlayer = gameData.players[id];
            game.addPLayer(backendPlayer, id);
        }
    }
    return game;
}

export function getGame() {
    return game;
}

export function deleteGame() {
    if(game) {
        game.stopAnimate();
        game = null;
    }
}