export class GameController {
    constructor(game, roomController, playersControllers) {
        this.game = game;
        this.roomController = roomController;
        this.playersControllers = playersControllers;
        this.tickRate = 1000 / 60; 
        this.loop = null;
        this.startLoop();
    }

    startLoop() {
        this.loop = setTimeout(this.gameLoop.bind(this), this.tickRate);
    }

    gameLoop() {
        if (!this.game.gameOver) {
            this.sendGameUpdate();
            this.startLoop();
        }
    }

    sendGameUpdate() {
      
        this.game.update();
        this.playersControllers.forEach(playerController => {
          
            const gameData = this.game.toJSON(playerController.player.user.id);
            playerController.sendUpdate(gameData);
        });
        this.game.map.updatedTiles = [];
    }

    stopLoop() {
        if (this.loop) {
            clearTimeout(this.loop);
            this.loop = null;
        }
    }
}