export class GameController {
    constructor(game, roomController, playersControllers) {
        this.game = game;
        this.roomController = roomController;
        this.playersControllers = playersControllers;
        this.loop = setInterval(this.sendGameUpdate.bind(this), 15);
    }
    sendGameUpdate() {
        if (this.game.gameOver) { clearInterval(this.loop); return; }

        this.game.update();
        const gameData = this.game.toJSON();    
        this.playersControllers.forEach(playerController => {
            playerController.sendUpdate(gameData);
        });
    }



}