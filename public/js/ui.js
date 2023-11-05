export class UI {
    constructor(player) {
        this.player = player;
        this.game = player.game;
        this.canvas = this.game.canvas;
        this.fontSize = 28;
        this.fontFamily = 'Bangers';
        this.color = 'white';
        this.messages = [];
        this.scoreboardX = 20;
        this.scoreboardY = 20;
        this.scoreboardWidth = 425;
        this.verticalSpacing = 10;
        this.titleSpacing = 20;

        this.formattedTimer = '';
        this.rectY = 0;
        this.playersArray = [];
    }

    draw() {
        const ctx = this.game.context;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'black';
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;

        this.updateTimer();
        this.drawScoreBoard()

        if (this.messages.length > 0) {
            this.drawDeadMessage(this.messages[0], this.messages[1]);
            if (!this.player.dead) {
                this.messages = [];
            }
        }

        if (this.game.gameOver) {
            this.gameOver();
        }

        ctx.restore();
    }

    updateTimer() {
        const ctx = this.game.context;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = 'black';
        ctx.font = `${this.fontSize + 15}px ${this.fontFamily}`;

        const minutes = Math.floor(this.game.gameTimer / (60 * 1000));
        const seconds = Math.floor((this.game.gameTimer % (60 * 1000)) / 1000);

        this.formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const x = this.canvas.width / 2;
        const y = this.game.map.tileSize * 3;
        ctx.textAlign = 'center';
        const formattedTimerText = (this.formattedTimer !== '00:00' && parseInt(this.formattedTimer) >= 0) ? `Czas: ${this.formattedTimer}` : 'Czas: 0:00';
        ctx.fillText(formattedTimerText, x, y);
        ctx.restore();
    }

    gameOver() {
        const ctx = this.game.context;

        ctx.save();
        ctx.font = `${this.fontSize + 10}px ${this.fontFamily}`;
        ctx.fillStyle = this.color;
        const lineHeight = this.fontSize + 10;
        const textHeight = lineHeight * 4;
        this.rectY = (this.canvas.height - textHeight) * 0.5;
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = 'hsla(180, 0%, 10%, 0.5)';
        ctx.fillRect(0, this.rectY, this.canvas.width, textHeight);
        ctx.restore();
        ctx.textAlign = 'center';
        let message = 'Gra skończona';
        let messageUsers = Object.values(this.game.players).map(player => ' ' + player.nickname).join('');
        ctx.fillText(message, this.canvas.width * 0.5, this.rectY + this.fontSize + lineHeight);
        ctx.fillText(messageUsers, this.canvas.width * 0.5, this.rectY + this.fontSize + 2 * lineHeight);
        ctx.restore();
    }
    drawScoreBoard() {
        const ctx = this.game.context;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = `${this.fontSize - 10}px ${this.fontFamily}`;
        ctx.textAlign = 'left';
    
       
        const sortedPlayers = Object.values(this.game.players).sort((a, b) => b.score - a.score);
    
   
        const scoreboardHeight = this.getScoreboardHeight(sortedPlayers.length);
        ctx.save();
    
       
        const borderWidth = 0.3; 
        const borderColor = 'white';
    
    
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = 'hsla(180, 0%, 10%, 0.5)';
        ctx.fillRect(this.scoreboardX, this.scoreboardY, this.scoreboardWidth, scoreboardHeight + 60);
    
      
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(this.scoreboardX, this.scoreboardY, this.scoreboardWidth, scoreboardHeight + 60);
    
        ctx.restore();
    
    
        ctx.fillStyle = this.color;
        ctx.font = `${this.fontSize - 5}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText('Tabela Wyników', this.scoreboardX + this.scoreboardWidth / 2, this.scoreboardY + this.fontSize + this.titleSpacing);
    
        const headerX = this.scoreboardX + 20;
        ctx.font = `${this.fontSize - 5}px ${this.fontFamily}`;
        const headerY = this.scoreboardY + this.fontSize + 2 * this.titleSpacing;
    
   
        ctx.fillText('Gracz', headerX + 50, headerY + 10);
        ctx.fillText('Punkty', headerX + 200, headerY + 10); 
        ctx.fillText('Teren', headerX + 350, headerY + 10); 
       
        for (let i = 0; i < sortedPlayers.length; i++) {
            const player = sortedPlayers[i];
            const y = this.scoreboardY + headerY + (i + 1) * (this.fontSize + this.verticalSpacing);
    
           
            ctx.fillText(player.nickname, headerX + 50, y);
            ctx.fillText(player.score, headerX + 200, y); 
            ctx.fillText(`${player.percentage}%`, headerX + 350, y); 
    
        
        }
    
        ctx.restore();
    }
    
    
    
    drawDeadMessage(mess, mess1) {
        const ctx = this.game.context;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'black';
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        const lineHeight = this.fontSize + 15;
        const textHeight = lineHeight * 4;
        this.rectY = (this.canvas.height - textHeight) * 0.5;
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, this.rectY, this.canvas.width, textHeight);
        ctx.restore();
        ctx.font = `${this.fontSize + 10}px ${this.fontFamily}`;
        ctx.fillText(mess, this.canvas.width * 0.5, this.rectY + this.fontSize + lineHeight);
        ctx.fillText(mess1, this.canvas.width * 0.5, this.rectY + this.fontSize + 2.7 * lineHeight);
        ctx.restore();
    }

   

    getScoreboardHeight() {
        const playerCount = Object.keys(this.game.players).length;
        return playerCount * 40 + 2 * this.titleSpacing + (playerCount - 1) * this.verticalSpacing;
    }

    setMessages(messages) {
        this.messages = messages;
    }
}
