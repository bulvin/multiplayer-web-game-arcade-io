export class UI {
    constructor(game) {
        this.game = game;
        this.fontSize = 28;
        this.fontFamily = 'Bangers';
        this.color = 'white';
        this.messages = [];
        this.scoreboardX = 20;
        this.scoreboardY = 20;
        this.scoreboardWidth = this.game.canvas.width * 0.2;
        this.verticalSpacing = 1;
        this.titleSpacing = 0;
        this.formattedTimer = '';
        this.rectY = 0;

    }

    draw() {


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
                if(!this.game.me.dead) {
                    this.messages = [];
                }
              
                
            }
        }
       
    }

    updateTimer() {
        this.game.ctx.fillStyle = this.color;
      
        this.game.ctx.font = `${this.fontSize + 15}px ${this.fontFamily}`;
    
        const minutes = Math.floor(this.game.gameTimer / (60 * 1000));
        const seconds = Math.floor((this.game.gameTimer % (60 * 1000)) / 1000);
    
        this.formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
        const x = this.game.canvas.width * 0.5;
        const y = this.game.map.tileSize * 3;
        const formattedTimerText = (this.formattedTimer !== '00:00' && parseInt(this.formattedTimer) >= 0) ? `Czas: ${this.formattedTimer}` : '';
        this.drawText(formattedTimerText, x, y, 'center');
    }
    
    drawScoreBoard() {
        const sortedPlayers = this.game.leaderBoard;
    
        const playerHeight = this.fontSize + this.verticalSpacing - 5;
        const scoreboardHeight = 2 * this.titleSpacing + playerHeight * sortedPlayers.length;
        const borderWidth = 0.3;
        const borderColor = 'white';
    
        this.setFillAndStroke('hsla(180, 0%, 10%, 0.5)', borderColor, borderWidth); 
        this.drawRect(this.scoreboardX, this.scoreboardY, this.scoreboardWidth, scoreboardHeight + 60);
    
        this.setFillAndFont(this.color, `${this.fontSize - 10}px ${this.fontFamily}`);
    
        const headerX = this.scoreboardX + this.scoreboardWidth * 0.05; 
        const headerY = this.scoreboardY + this.fontSize + 2 * this.titleSpacing;
    
        this.drawHeaders(headerX, headerY, sortedPlayers);
    }
    
    drawHeaders(headerX, headerY, sortedPlayers) {
        const positionX = headerX;
        const nameX = headerX + this.scoreboardWidth * 0.2;
        const scoreX = headerX + this.scoreboardWidth * 0.45; 
        const territoryX = headerX + this.scoreboardWidth * 0.7; 
    
        this.drawText('#', positionX, headerY + 10, 'left');
        this.drawText('Gracz', nameX, headerY + 10, 'left');
        this.drawText('Punkty', scoreX, headerY + 10, 'left');
        this.drawText('Teren', territoryX, headerY + 10, 'left');
    
        for (let i = 0; i < sortedPlayers.length; i++) {
            const player = sortedPlayers[i];
            const y = this.scoreboardY + headerY + (i + 0.5) * (this.fontSize + this.verticalSpacing);
    
            this.drawText(i + 1, positionX, y, 'left'); 
            this.drawText(player.name, nameX, y, 'left');
            this.drawText(player.score, scoreX, y, 'left');
            this.drawText(`${player.territoryPercentage}%`, territoryX, y, 'left');
        }
    }
    
    drawDeadMessage(mess, mess1) {
        const lineHeight = this.fontSize + 15;
        const textHeight = lineHeight * 4;
        this.rectY = this.game.canvas.height * 0.5 - textHeight * 0.5;
 
        this.setFillAndFont(this.color, `${this.fontSize - 5}px ${this.fontFamily}`);
       
        this.setFill('black');
        this.drawRect(0, this.rectY, this.game.canvas.width, textHeight);
    
        this.setFillAndFont(this.color, `${this.fontSize + 10}px ${this.fontFamily}`);
        this.drawText(mess, this.game.canvas.width * 0.5, this.rectY + this.fontSize + lineHeight, 'center');
        this.drawText(mess1, this.game.canvas.width * 0.5, this.rectY + this.fontSize + 2.6 * lineHeight, 'center');
    
    }
    
    drawStats() {
        const lineHeight = this.fontSize + 10;
        const x = this.game.canvas.width * 0.01;
        let y = this.game.canvas.height - lineHeight;
    
        this.setFillAndFont(this.color, `${this.fontSize}px ${this.fontFamily}`);
  
        this.drawText(`Liczba zabójstw: ${this.game.me.kills}`, x, y, 'left');
        y -= lineHeight;
        this.drawText(`Liczba śmierci: ${this.game.me.deaths}`, x, y, 'left');
        y -= lineHeight;
        this.drawText(`Punkty: ${this.game.me.score}`, x, y, 'left');
        y -= lineHeight;
        this.drawText(`Zajęty teren: ${this.game.me.territory}%`, x, y, 'left');
        y -= lineHeight;
        this.drawText(`Pozycja w leaderboardzie: ${this.getLeaderboardPosition(this.player)}`, x, y, 'left');
    }
    
    drawAbilitiesUI() {
        let x = this.game.canvas.width * 0.8;
        let y = this.game.canvas.height * 0.9;
        const borderWidth = 0.3;
        const borderColor = 'white';
        const countAbilities = 3;
    
        this.setFillAndStroke('hsla(180, 0%, 10%, 0.5)', borderColor, borderWidth);
        this.setFillAndFont(this.color, `${this.fontSize - 10}px ${this.fontFamily}`);
    
        for (let i = 0; i < countAbilities; i++) {
            this.drawRect(x + i * this.game.map.tileSize * 2, y, this.game.map.tileSize * 2, this.game.map.tileSize * 2);
        }
    
        let textX = x + this.game.map.tileSize;
        const textY = y + this.game.map.tileSize;
    
        this.drawText('Umiejętności', textX + this.game.map.tileSize * 2, textY - 30, 'center');
        this.drawAbilities(textX, textY);
    }
    
    drawAbilities(textX, textY) {
        let index = 1;
        if (this.game.me.abilities) {
            for (const key of Object.keys(this.game.me.abilities)) {
                const ability = this.game.me.abilities[key];
                const abilityX = textX + (index - 1) * this.game.map.tileSize * 2;
                const abilityY = textY - this.game.map.tileSize * 0.5;
    
                this.setFillAndFont(this.color, `${this.fontSize - 10}px ${this.fontFamily}`);
                this.drawText(ability.name, abilityX, abilityY, 'center');
    
                if (ability.duration > 0) {
                    this.setFillAndFont('red', `${this.fontSize - 10}px ${this.fontFamily}`);
                    this.drawText(Math.ceil(ability.duration * 0.001), abilityX, abilityY + this.game.map.tileSize * 0.5, 'center');
                }
    
                index++;
            }
        }
    }
    
    setFillAndStroke(fill, stroke, lineWidth) {
        this.game.ctx.fillStyle = fill;
        this.game.ctx.strokeStyle = stroke;
        this.game.ctx.lineWidth = lineWidth;
    }
    
    setFillAndFont(fill, font) {
        this.game.ctx.fillStyle = fill;
        this.game.ctx.font = font;
    }
    
    setFill(fill) {
        this.game.ctx.fillStyle = fill;
    }
    
    setFont(font) {
        this.game.ctx.font = font;
    }
    
    drawRect(x, y, width, height) {
        this.game.ctx.fillRect(x, y, width, height);
        this.game.ctx.strokeRect(x, y, width, height);
    }
    drawText(text, x, y, align) {
        this.game.ctx.textAlign = align;
        this.game.ctx.fillText(text, x, y);
    }
    gameOver() {
        this.game.ctx.save();
        this.game.ctx.font = `${this.fontSize + 10}px ${this.fontFamily}`;
        this.game.ctx.fillStyle = this.color;
        const lineHeight = this.fontSize + 20;
        this.game.ctx.save();
        this.game.ctx.globalAlpha = 0.8;
        this.game.ctx.fillStyle = 'hsla(180, 0%, 10%, 0.5)';
        this.game.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.ctx.restore();
        this.game.ctx.textAlign = 'center';
        let message = 'Gra Skończona - Tabela Wyników';
        this.game.ctx.fillText(message, this.game.canvas.width * 0.5, this.game.canvas.height * 0.3 - lineHeight);

        const leaderBoard = Object.values(this.game.players).sort((a, b) => b.score - a.score);
        for (let i = 0; i < leaderBoard.length; i++) {
            const player = leaderBoard[i];
            let playerStats = `${i + 1}. ${player.nickname} - Kills: ${player.kills}, Deaths: ${player.deaths}, Score: ${player.score}, Territory: ${player.territory}%`;
            this.game.ctx.fillText(playerStats, this.game.canvas.width * 0.5, this.game.canvas.height * 0.3 + (i + 1) * lineHeight);
        }

        this.game.ctx.restore();
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
