export class PlayerController {
    constructor(userController, player) {
        this.userController = userController;
        this.player = player;
        
        this.userController.socket.removeAllListeners('playerInput');
        this.userController.socket.on('playerInput', this.handleInput.bind(this));
    }
    handleInput(input) {
        if (input.length > 0) {
            const newInput = input.map(key => key.toLowerCase());
            this.player.setInput(newInput);
        }

    }
    sendUpdate(game) {
        const socket = this.userController.socket;
        const gameSerialized = game.toJSON(this.player.user.id);

        socket.emit('updateGame', gameSerialized);
        
        if (this.player.dead) {
            const messages = game.deadMessage(this.player.deadInterval, this.player.deadTimer);
            socket.emit('deadMessage', { messages: messages });
        }

    }


}