export class PlayerController {
    constructor(userController, player) {
        this.userController = userController;
        this.player = player;
    }
    handleInput(input) {
        
       this.player.setInput(input);
      
        
    }
    sendUpdate(game) {
         const socket = this.userController.socket;
         socket.emit('updateGame', game);
    }
  
  
}