export class Network {
    constructor(io, game){
        this.io = io;
        this.game = game;
        this.io.on('connection', this.onConnection.bind(this));
     
    }

    onConnection(socket) {
        console.log(`Użytkownik połączył się o id ${socket.id}`);
        
        socket.on('joinGame', (nickname) => {
            this.onJoin(socket, nickname);
            
        })

        socket.on('disconnect', (reason) => {
            this.disconnect(socket);
            console.log(reason);
        })

        socket.on('playerInput', (input) => {
           
            this.onKeydown(socket, input)

        });
    }   
    onJoin(socket, nickname) {
        const player = this.game.addPlayer(socket, nickname);

        if (player) {
          
            socket.broadcast.emit('playerJoined', player.toJSON());
        }
        else{
            socket.emit('playerJoined', "Gracz nie dołączył do gry.");
        }
    }  
    disconnect(socket){
        const player = this.game.deletePlayer(socket.id);

        if (player) {

            this.io.emit('disconnected', player,`Gracz ${player.nickname} opuścił rozgrywkę.`);
        }
    } 
    sendGameUpdate(timestamp) {
        const gameData = this.game.toJSON();

        this.io.emit('updateGame', gameData, timestamp);
    }
    onKeydown(socket, input) {
        const serverTime = Date.now();
        const networkDelay = (serverTime - input.timestamp);
        const player = this.game.getPlayer(socket.id);  
        if (!player || networkDelay > 120){
            return;
        } 
        player.setInput(input.keys);
    }

      


}