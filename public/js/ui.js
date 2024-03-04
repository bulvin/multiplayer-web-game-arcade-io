export class UI {
    constructor(game) {
        this.game = game;
        this.fontSize = 24;
        this.fontFamily = 'Helvetica sans-serif';
        this.color = 'white';
        this.messages = [];
        this.scoreboardX = 20;
        this.scoreboardY = 20;
        this.scoreboardWidth = this.game.canvas.width * 0.2;
        this.verticalSpacing = this.fontSize * 0.5;

        this.titleSpacing = this.fontSize * 0.8;

        this.formattedTimer = '';
        this.rectY = 0;
        this.leaderBoard = [];

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
        const leaderBoard = this.game.leaderBoard;
    
        this.verticalSpacing = this.fontSize * 0.2;
        this.titleSpacing = this.fontSize * 0.8;
    
        const playerHeight = this.fontSize + this.verticalSpacing - 5;
        const scoreboardHeight = 2 * this.titleSpacing + playerHeight * leaderBoard.length;
        const borderWidth = 0.3;
        const borderColor = 'white';
    
        const adjustedScoreboardHeight = scoreboardHeight - (leaderBoard.length * 0.5 * this.verticalSpacing);
    
        this.setFillAndStroke('hsla(180, 0%, 10%, 0.5)', borderColor, borderWidth);
        this.drawRect(this.scoreboardX, this.scoreboardY, this.scoreboardWidth, adjustedScoreboardHeight + 10);
    
        this.setFillAndFont(this.color, `${this.fontSize - 10}px ${this.fontFamily}`);
    
        const headerX = this.scoreboardX + this.scoreboardWidth * 0.05;
        const headerY = this.scoreboardY + 15;
    
        this.drawHeaders(headerX, headerY, leaderBoard);
    }
    
    drawHeaders(headerX, headerY, leaderBoard) {
        const columnWidth = this.scoreboardWidth / 4;
    
        const positionX = headerX;
        const nameX = positionX + columnWidth;
        const scoreX = nameX + columnWidth; 
        const territoryX = scoreX + columnWidth;
    
        this.drawText('#', positionX, headerY + 5, 'center');
        this.drawText(this.game.mode === 'team' ? 'Drużyna' : 'Gracz', nameX, headerY + 5, 'center');
        this.drawText('Punkty', scoreX, headerY + 5 , 'center');
        this.drawText('Teren', territoryX, headerY + 5, 'center');
    
        for (let i = 0; i < leaderBoard.length; i++) {
            const entity = leaderBoard[i];
            const y = this.scoreboardY + headerY + (i + 1) * (this.fontSize + this.verticalSpacing);
    
            this.drawText(i + 1, positionX, y - 20, 'center');
    
            const displayName = entity.name.length > 15 ? entity.name.substring(0, 15) + '...' : entity.name;
            this.drawText(displayName, nameX, y - 20, 'center');
    
            this.drawText(entity.score, scoreX, y - 20, 'center');
            this.drawText(`${entity.territoryPercentage}%`, territoryX, y - 20, 'center');
        }
    }
    
    drawDeadMessage(mess, mess1) {
        const lineHeight = this.fontSize + 15;
        const textHeight = lineHeight * 4;
        this.rectY = this.game.canvas.height * 0.5 - textHeight * 0.5;
 
        this.setFillAndFont(this.color, `${this.fontSize - 5}px ${this.fontFamily}`);
       
        this.setFill('hsla(0, 0%, 0%, 0.5)');
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
  
        this.drawText(`Wyeliminowałeś: ${this.game.me.kills}`, x, y, 'left');
        y -= lineHeight;
        this.drawText(`Odpadłeś: ${this.game.me.deaths}`, x, y, 'left');
        y -= lineHeight;
        this.drawText(`Punkty: ${this.game.me.score}`, x, y, 'left');
        y -= lineHeight;
        this.drawText(`Zajęty teren: ${this.game.me.territory}%`, x, y, 'left');
    }
    
    drawAbilitiesUI() {
        let x = this.game.canvas.width * 0.45;
        let y = this.game.canvas.height * 0.9;
        const borderWidth = 0.3;
        const borderColor = 'white';
        const countAbilities = 3;
        const keys = ['E', 'R', 'T']; 

       
       this.setFillAndFont('white', `bold ${this.fontSize - 10}px ${this.fontFamily}`);
       this.drawText('Umiejętności', x + 50, y - 5); 
    
        for (let i = 0; i < countAbilities; i++) {
            const ability = this.game.me.abilities?.[keys[i].toLowerCase()];
            const rectWidth = this.game.map.tileSize * 2;
    
            this.setFillAndStroke('hsla(180, 0%, 10%, 0.5)', borderColor, borderWidth);
            this.drawRect(x + i * rectWidth, y, rectWidth, this.game.map.tileSize * 2);
    
            this.setFillAndFont('white', `${this.fontSize - 10}px ${this.fontFamily}`);
            this.drawText(keys[i], x + i * rectWidth + 10, y + this.game.map.tileSize * 2 - 10); 
    
            if (ability) {
                const abilityY = y + this.game.map.tileSize - 5; 
                const abilityX = x + i * rectWidth + rectWidth / 2;
                this.drawIconAbility(ability.name, abilityX, abilityY);
    
                if (this.game.me.activeAbility && ability.name === this.game.me.activeAbility.name && this.game.me.activeAbility.duration >= 0) {
                    this.setFillAndFont('red', `bold ${this.fontSize - 10}px ${this.fontFamily}`);
                    const durationText = `${Math.ceil(this.game.me.activeAbility.duration * 0.001)}s`;
                    const durationX = x + i * rectWidth + rectWidth - 10; 
                    const durationY = y + this.game.map.tileSize * 2 - 10;
                    this.drawText(durationText, durationX, durationY, 'right');
                }
            }
        }
     
        const bonusX = x + countAbilities * 70; 
        const bonusY = y;
        const bonusWidth = this.game.map.tileSize * 2;
        const bonusHeight = this.game.map.tileSize * 2;
    
        this.setFillAndStroke('hsla(180, 0%, 10%, 0.5)', borderColor, borderWidth);
        this.drawRect(bonusX, bonusY, bonusWidth, bonusHeight);
    
        const bonusTitleX = bonusX + bonusWidth / 2;
        const bonusTitleY = bonusY - 10; 
    
        this.setFillAndFont('white', `bold ${this.fontSize - 10}px ${this.fontFamily}`);
        this.drawText('Bonus', bonusTitleX, bonusTitleY, 'center');
    
        const bonusName = this.game.me.activeBonus?.name ?? ''; 
        const bonusTextX = bonusX + bonusWidth / 2;
        const bonusTextY = bonusY + bonusHeight / 2;
    
        this.setFillAndFont('white', `${this.fontSize - 10}px ${this.fontFamily}`);
        if (bonusName) {
            this.drawIconBonus(bonusName, bonusTextX, bonusTextY);
        }
    
        if (this.game.me.activeBonus && this.game.me.activeBonus.duration >= 0.1) {
            this.setFillAndFont('red', `bold ${this.fontSize - 10}px ${this.fontFamily}`);
            const durationText = `${Math.ceil(this.game.me.activeBonus.duration * 0.001)}s`;
            const durationX = bonusX + bonusWidth;
            const durationY = bonusY + bonusHeight - 5;
            this.drawText(durationText, durationX, durationY, 'right');
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
        this.game.ctx.fillStyle = 'hsla(180, 0%, 10%, 0.8)';
        this.game.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.ctx.restore();
        this.game.ctx.textAlign = 'center';
        let message = 'Gra Skończona - Tabela Wyników';
        this.game.ctx.fillText(message, this.game.canvas.width * 0.5, this.game.canvas.height * 0.3 - lineHeight);

        for (let i = 0; i < this.leaderBoard.length; i++) {
            const player = this.leaderBoard[i];
            let playerStats = `${i + 1}. ${player.name}`;
            if (this.game.mode === 'team') {
                playerStats += ` - Team: ${player.team}`;
            }
        
            playerStats += ` - Wyeliminował: ${player.kills}, Odpadł: ${player.deaths}, Punkty: ${player.score}, Teren: ${player.territory}%`;
            this.game.ctx.fillText(playerStats, this.game.canvas.width * 0.5, this.game.canvas.height * 0.3 + (i + 1) * lineHeight);
        }

        this.game.ctx.restore();
    }
    setEndGameScreen(scoreboard) {
        this.leaderBoard = scoreboard;
    }

    getScoreboardHeight(sortedPlayers) {
        const playerCount = sortedPlayers.length;
        return playerCount * 35 + 2 * this.titleSpacing + (playerCount - 1) * this.verticalSpacing;
    }
   
    setMessages(messages) {
        this.messages = messages;
    }

    drawIconBonus(bonus, x, y) {
        let name = bonus;
        const tileSizeHalf = this.game.map.tileSize / 2;
        let strokeColor = '#ffffff';
        if (name === "SCORE_X2") {
            name = "x2";
        } else if (name === "SCORE_X4") {
            name = "x4"
        } else if (name === "SCORE_X8") {
            name = "x8";
        } else if (name === "KILL_X2") {
            name = "x2"
            strokeColor = 'hsl(0, 100%, 50%)';
        }
        
        this.game.ctx.save();
        this.game.ctx.lineWidth = 5;
        this.game.ctx.strokeStyle = strokeColor;
        this.game.ctx.beginPath();
        this.game.ctx.arc(x, y, tileSizeHalf, 0, 2 * Math.PI , false);
        this.game.ctx.stroke();
    
        this.game.ctx.font = '16px Helvetica';
        this.game.ctx.fillStyle = 'white';
        this.game.ctx.textAlign = 'center';
        this.game.ctx.fillText(name, x, y + 5);
        this.game.ctx.restore();
    }

    drawIconAbility(ability, x, y) {
        let circleColor;
        const radius = this.game.map.tileSize / 2;

        if (ability === "PRĘDKOŚĆ") {
            circleColor = "#1E90FF"; // blue
        } else if (ability === "SPOWOLNIENIE") {
            circleColor = "#FF4500";  // orange
        } else if (ability === "ODPORNOŚĆ") {
            circleColor = "#32CD32"; // lime
        } else if (ability === "WIDOCZNOŚĆ") {
            circleColor = "#FFFF00"; // yellow
        } else if (ability === "TELEPORT") {
            circleColor = "#800080"; // purpl
        }
        this.game.ctx.fillStyle = circleColor;
        this.game.ctx.beginPath();
        this.game.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.game.ctx.fill();
        this.game.ctx.closePath();

    }
 
}
