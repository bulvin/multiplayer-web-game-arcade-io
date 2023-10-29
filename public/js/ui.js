export class UI {
    constructor(player){
        this.player = player;
        this.game = player.game;
        this.canvas = this.game.canvas;
        this.fontSize = 28;
        this.fontFamily = 'Bangers';
        this.color = 'white';
        this.messages = [];
    }



        draw(){

        this.game.context.save();
        this.game.context.fillStyle = this.color;
        this.game.context.shadowBlur = 15;
        this.game.context.shadowColor = 'black';
        this.game.context.font = this.fontSize + 'px ' + this.fontFamily;


        const minutes = Math.floor(this.game.gameTimer / (60 * 1000));
        const seconds = Math.floor((this.game.gameTimer % (60 * 1000)) / 1000);
        
        const formattedTimer = `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.updateTimer(formattedTimer);
        if (this.messages.length > 0){
            this.drawDeadMessage(this.messages[0], this.messages[1]);
            if(!this.player.dead){
                this.messages = []
            }
        }



        if (this.game.gameOver){
            this.gameOver();
        }

        this.game.context.restore();
    }
    updateTimer(time) {
        this.game.context.save();
        this.game.context.fillStyle = this.color;
    
        this.game.context.shadowColor = 'black';
        this.game.context.font = this.fontSize + 15 + 'px ' + this.fontFamily;

        const x = this.canvas.width / 2;
        const y = this.game.map.tileSize * 3; 
        this.game.context.textAlign = 'center';
        if (time !== "00:00" && parseInt(time) >= 0) {
            this.game.context.fillText(`Czas: ${time}`, x, y);
        } else {
            this.game.context.fillText(`Czas: 0:00`, x, y);
        }
        this.game.context.restore();
    
       
    }
    gameOver(){

        this.game.context.save();
        this.game.context.font = this.fontSize + 10 + 'px ' + this.fontFamily;
        this.game.context.fillStyle = this.color;

        const lineHeight = this.fontSize + 10; 
        const textHeight = lineHeight * 4; 
        const rectY = (this.canvas.height - textHeight) * 0.5; 

        this.game.context.save();
        this.game.context.globalAlpha = 0.8;
        this.game.context.fillStyle = `hsl(180, 0%, 10%, 50%)`;
        this.game.context.fillRect(0, rectY, this.canvas.width, textHeight);
        this.game.context.restore();

        this.game.context.textAlign = 'center';
       
        let message = "Gra skończona";
        let messageUsers = '';
        for (const id in this.game.players) {
            const player = this.game.players[id];
             messageUsers += " " + player.nickname;
        }
       
        this.game.context.fillText(message, this.canvas.width * 0.5, rectY + this.fontSize + lineHeight);
        this.game.context.fillText(messageUsers, this.canvas.width * 0.5, rectY + this.fontSize + 2 * lineHeight);

        this.game.context.restore();
    }
    drawDeadMessage(mess, mess1){

        this.game.context.save();

        this.game.context.fillStyle = this.color;
        this.game.context.shadowBlur = 15;
        this.game.context.shadowColor = 'black';
        this.game.context.font = this.fontSize + 'px ' + this.fontFamily;

        this.game.context.textAlign = 'center';

        const lineHeight = this.fontSize + 15;
        const textHeight = lineHeight * 4;

        const rectY = (this.canvas.height - textHeight) * 0.5;

        this.game.context.save();
        this.game.context.globalAlpha = 0.5;
        this.game.context.fillStyle = 'black'
        this.game.context.fillRect(0, rectY, this.canvas.width, textHeight);
        this.game.context.restore();

        this.game.context.fillStyle = this.color;
        this.game.context.font = this.fontSize + 10 + 'px ' + this.fontFamily;


        this.game.context.fillText(mess, this.canvas.width * 0.5, rectY + this.fontSize + lineHeight);
        this.game.context.fillText(mess1, this.canvas.width * 0.5, rectY + this.fontSize + 2.7 * lineHeight);

        this.game.context.restore();

    }
    setMessages(messages){
        this.messages = messages;
    }

}