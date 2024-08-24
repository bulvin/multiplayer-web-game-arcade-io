
export class GameController {
    constructor(game, roomController, playersControllers) {
        this.game = game;
        this.roomController = roomController;
        this.playersControllers = playersControllers;
        this.tickRate = 15;
        this.loop = null;
        this.executeTick();
    }
    executeTick() {
        this.loop = setTimeout(this.nextTick.bind(this), this.tickRate);
    }
    nextTick() {
        if (!this.game.gameOver) {
            this.sendGameUpdate();
            this.executeTick();
        } else {
            const scoreboard = this.game.getEndLeaderboard();
            this.playersControllers.forEach(playerController => {
                const socket = playerController.userController.socket;
                socket.emit('gameOver', scoreboard);
            });
            this.cancelTick();
            setTimeout(() => {
                this.roomController.backToLobby(this.game.id);
            
            }, 11 * 1000);
        }
    }
    sendGameUpdate() {     
        this.game.update();
        this.playersControllers.forEach(playerController => {
            playerController.sendUpdate(this.game);

        });
        this.game.map.updatedTiles = [];
    }
    cancelTick() {
        if (this.loop) {
            clearTimeout(this.loop);
            this.loop = null;
        }
    }

    addPlayer(playerController) {
        playerController.player.initBase();
    
        this.game.map.tiles.forEach((row) => {
            row.forEach((tile) => {
                this.game.map.updatedTiles.push(tile);
            });
        });
    
        this.playersControllers.push(playerController);
        this.game.addPlayer(playerController.player);
    }
    removePlayer(playerController) {
        this.playersControllers = this.playersControllers.filter(pc => pc !== playerController);
        this.game.deletePlayer(playerController.player.user.id);
    }
}