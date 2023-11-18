export class UI {
    constructor(player) {
        this.player = player;
        this.game = player.game;
        this.canvas = player.game.canvas;
        this.ctx = player.game.context;
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

    }

    draw() {
       
        this.ctx.save();

        if (this.game.gameOver) {
            this.gameOver();
        }
        else {
            this.updateTimer();
            this.drawScoreBoard();
            this.drawStats();
            this.drawAbilitiesUI();
              
            if (this.messages.length > 0) {
                this.drawDeadMessage(this.messages[0], this.messages[1]);
                if (!this.player.dead) {
                    this.messages = [];
                }
            }
        }
       
        this.ctx.restore();
    }

    updateTimer() {
    

        this.ctx.save();
        this.ctx.fillStyle = this.color;
        this.ctx.shadowColor = 'black';
        this.ctx.font = `${this.fontSize + 15}px ${this.fontFamily}`;

        const minutes = Math.floor(this.game.gameTimer / (60 * 1000));
        const seconds = Math.floor((this.game.gameTimer % (60 * 1000)) / 1000);

        this.formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const x = this.canvas.width / 2;
        const y = this.game.map.tileSize * 3;
        this.ctx.textAlign = 'center';
        const formattedTimerText = (this.formattedTimer !== '00:00' && parseInt(this.formattedTimer) >= 0) ? `Czas: ${this.formattedTimer}` : '';
        this.ctx.fillText(formattedTimerText, x, y);
        this.ctx.restore();
    }

 
   drawScoreBoard() {
    this.ctx.save();
    this.ctx.fillStyle = this.color;
    this.ctx.font = `${this.fontSize - 10}px ${this.fontFamily}`;
    this.ctx.textAlign = 'left';

    const sortedPlayers = Object.values(this.game.players).sort((a, b) => b.score - a.score).slice(0, 5);

    
    const scoreboardHeight = this.getScoreboardHeight(sortedPlayers);
    this.ctx.save();

    const borderWidth = 0.3;
    const borderColor = 'white';

    this.ctx.globalAlpha = 0.8;
    this.ctx.fillStyle = 'hsla(180, 0%, 10%, 0.5)';
    this.ctx.fillRect(this.scoreboardX, this.scoreboardY, this.scoreboardWidth, scoreboardHeight + 60);

    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = borderWidth;
    this.ctx.strokeRect(this.scoreboardX, this.scoreboardY, this.scoreboardWidth, scoreboardHeight + 60);

    this.ctx.restore();

    this.ctx.fillStyle = this.color;
    this.ctx.font = `${this.fontSize - 5}px ${this.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Tabela Wyników', this.scoreboardX + this.scoreboardWidth / 2, this.scoreboardY + this.fontSize + this.titleSpacing);

    const headerX = this.scoreboardX + 20;
    this.ctx.font = `${this.fontSize - 5}px ${this.fontFamily}`;
    const headerY = this.scoreboardY + this.fontSize + 2 * this.titleSpacing;

    this.ctx.fillText('Gracz', headerX + 50, headerY + 10);
    this.ctx.fillText('Punkty', headerX + 200, headerY + 10);
    this.ctx.fillText('Teren', headerX + 350, headerY + 10);

    for (let i = 0; i < sortedPlayers.length; i++) {
        const player = sortedPlayers[i];
        const y = this.scoreboardY + headerY + (i + 1) * (this.fontSize + this.verticalSpacing);

        this.ctx.fillText(player.nickname, headerX + 50, y);
        this.ctx.fillText(player.score, headerX + 200, y);
        this.ctx.fillText(`${player.territory}%`, headerX + 350, y);
    }

    this.ctx.restore();
}

    
    drawDeadMessage(mess, mess1) {
        this.ctx.save();
        this.ctx.fillStyle = this.color;
 
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.textAlign = 'center';
        const lineHeight = this.fontSize + 15;
        const textHeight = lineHeight * 4;
        this.rectY = (this.canvas.height - textHeight) * 0.5;
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, this.rectY, this.canvas.width, textHeight);
        this.ctx.restore();
        this.ctx.font = `${this.fontSize + 10}px ${this.fontFamily}`;
        this.ctx.fillText(mess, this.canvas.width * 0.5, this.rectY + this.fontSize + lineHeight);
        this.ctx.fillText(mess1, this.canvas.width * 0.5, this.rectY + this.fontSize + 2.6 * lineHeight);
        this.ctx.restore();
    }

    drawStats() {
        this.ctx.save();
        this.ctx.fillStyle = this.color;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = 'black';
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    
        const lineHeight = this.fontSize + 10;
        const x = this.canvas.width * 0.01;
        let y = this.canvas.height - lineHeight;
        
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Liczba zabójstw: ${this.player.kills}`, x, y);
        y -= lineHeight;
    
        this.ctx.fillText(`Liczba śmierci: ${this.player.deaths}`, x, y);
        y -= lineHeight;
    
        this.ctx.fillText(`Punkty: ${this.player.score}`, x, y);
        y -= lineHeight;
    
        this.ctx.fillText(`Zajęty teren: ${this.player.territory}%`, x, y);
        y -= lineHeight;
    
      
        this.ctx.fillText(`Pozycja w leaderboardzie: ${this.getLeaderboardPosition(this.player)}`, x, y);
    
        this.ctx.restore();
    }


    drawAbilitiesUI(){
        this.ctx.save();

        let x = this.canvas.width * 0.8;
        let y = this.canvas.height - 80;
        const borderWidth = 0.3;
        const borderColor = 'white';
        const countAbilities = 3;
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = borderWidth;
        this.ctx.fillStyle = 'hsla(180, 0%, 10%, 0.5)';
        this.ctx.font = `${this.fontSize - 10}px ${this.fontFamily}`;
        this.ctx.save();
       
         
        for (let i = 0; i < countAbilities; i++) {
            this.ctx.fillRect(x + i * this.game.map.tileSize * 2, y , this.game.map.tileSize * 2, this.game.map.tileSize * 2);
            this.ctx.strokeRect(x + i * this.game.map.tileSize * 2 , y, this.game.map.tileSize * 2, this.game.map.tileSize * 2);
        }
 
        this.ctx.restore();
        let textX = x + this.game.map.tileSize;
        const textY = y + this.game.map.tileSize;
      
        let index = 1;
        this.ctx.fillStyle = this.color;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Umiejętności', textX + this.game.map.tileSize * 2, textY - 30); 
        for (const key of Object.keys(this.player.abilities)) {
            const ability = this.player.abilities[key];
            if (ability) {
                this.ctx.fillText(ability.name, textX, textY);
            }
          
            this.font = `${this.fontSize - 15}px ${this.fontFamily}`;
            this.ctx.fillText(key, textX, textY - 15);
            textX = textX + this.game.map.tileSize + index * this.game.map.tileSize; 
            index++;
            
        }
        textX = x + this.game.map.tileSize * 8;
        this.ctx.fillText('Bonus', textX , textY - 30); 
        this.ctx.fillStyle = 'hsla(180, 0%, 10%, 0.5)';
        this.ctx.fillRect(x + this.game.map.tileSize * 7, y, this.game.map.tileSize * 2, this.game.map.tileSize * 2)
        this.ctx.strokeRect(x + this.game.map.tileSize * 7, y, this.game.map.tileSize * 2, this.game.map.tileSize * 2)
        this.ctx.fillStyle = this.color;
        if (this.player.bonus) {
            this.ctx.fillText(this.player.bonus.name, x + this.game.map.tileSize * 8, y + this.game.map.tileSize);
            this.ctx.fillText(`${Math.ceil(this.player.bonus.duration * 0.001) }`, x + this.game.map.tileSize * 8, y + this.game.map.tileSize * 1.5);
        }
     
   
        this.ctx.restore();
    }

    gameOver() {
        this.ctx.save();
        this.ctx.font = `${this.fontSize + 10}px ${this.fontFamily}`;
        this.ctx.fillStyle = this.color;
        const lineHeight = this.fontSize + 20;
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        this.ctx.fillStyle = 'hsla(180, 0%, 10%, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        this.ctx.textAlign = 'center';
        let message = 'Gra Skończona - Tabela Wyników';
        this.ctx.fillText(message, this.canvas.width * 0.5, this.canvas.height * 0.3 - lineHeight);

        const leaderBoard = Object.values(this.game.players).sort((a, b) => b.score - a.score);
        for (let i = 0; i < leaderBoard.length; i++) {
            const player = leaderBoard[i];
            let playerStats = `${i + 1}. ${player.nickname} - Kills: ${player.kills}, Deaths: ${player.deaths}, Score: ${player.score}, Territory: ${player.territory}%`;
            this.ctx.fillText(playerStats, this.canvas.width * 0.5, this.canvas.height * 0.3 + (i + 1) * lineHeight);
        }

        this.ctx.restore();
    }

    getScoreboardHeight(sortedPlayers) {
        const playerCount = sortedPlayers.length;
        return playerCount * 35 + 2 * this.titleSpacing + (playerCount - 1) * this.verticalSpacing;
    }
    getLeaderboard() {
       return Object.values(this.game.players).sort((a, b) => b.score - a.score);
    }
    getLeaderboardPosition(search) {
        const leaderboard = this.getLeaderboard();
        const playerIndex = leaderboard.findIndex(player => player === search);
        return playerIndex === -1 ? "Brak" : playerIndex + 1;
    }
   

    setMessages(messages) {
        this.messages = messages;
    }
 
}
