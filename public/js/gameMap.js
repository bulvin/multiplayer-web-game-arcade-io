export class GameMap {
    constructor(game, map) {
        this.game = game;
        this.rows = 80;
        this.cols = 80;
        this.tileSize = 32;
        this.width = this.rows * this.tileSize;
        this.height = this.cols * this.tileSize;
      

        this.tiles = Array(this.rows * this.cols).fill({ color: '#111' });
        this.update(map);
    }
    update(tiles) {
        for (let tile of tiles) {
            let index = tile.y * this.cols + tile.x;
            this.tiles[index] = tile;
        }

    }
    drawTiles() {
        
        const cameraX = this.game.camera.x;
        const cameraY = this.game.camera.y;
        const viewportWidth = this.game.canvas.width;
        const viewportHeight = this.game.canvas.height;

        const startX = Math.max(0, Math.floor(cameraX / this.tileSize));
        const startY = Math.max(0, Math.floor(cameraY / this.tileSize));
        const endX = Math.min(this.cols, Math.ceil((cameraX + viewportWidth) / this.tileSize));
        const endY = Math.min(this.rows, Math.ceil((cameraY + viewportHeight) / this.tileSize));

        for (let row = startY; row < endY; row++) {
            for (let col = startX; col < endX; col++) {
                let index = row * this.cols + col;
                let tile = this.tiles[index];

                const x = col * this.tileSize - cameraX;
                const y = row * this.tileSize - cameraY;
                this.game.ctx.fillStyle = tile.color;
                this.game.ctx.fillRect(x, y, this.tileSize , this.tileSize);

            }
        }


    }


    drawGrid() {
        this.game.ctx.save();
        this.game.ctx.beginPath();

        const cameraX = this.game.camera.x;
        const cameraY = this.game.camera.y;
        const viewportWidth = this.game.canvas.width;
        const viewportHeight = this.game.canvas.height;

        const startX = Math.max(0, Math.floor(cameraX / this.tileSize));
        const startY = Math.max(0, Math.floor(cameraY / this.tileSize));
        const endX = Math.min(this.cols, Math.ceil((cameraX + viewportWidth) / this.tileSize));
        const endY = Math.min(this.rows, Math.ceil((cameraY + viewportHeight) / this.tileSize));

        const mapStartX = startX * this.tileSize - cameraX ;
        const mapStartY = startY * this.tileSize - cameraY ;
        const mapEndX = endX * this.tileSize - cameraX;
        const mapEndY = endY * this.tileSize  - cameraY;

        for (let i = startX; i < endX; i++) {
            const x = i * this.tileSize - cameraX;

            if (x >= mapStartX && x <= mapEndX) {
                this.game.ctx.moveTo(x, mapStartY);
                this.game.ctx.lineTo(x, mapEndY);
            }
        }

        for (let i = startY; i < endY; i++) {
            const y = i * this.tileSize - cameraY;
            if (y >= mapStartY && y <= mapEndY) {
                this.game.ctx.moveTo(mapStartX, y);
                this.game.ctx.lineTo(mapEndX, y);
            }
        }

        this.game.ctx.lineWidth = 2;

        this.game.ctx.strokeStyle = '#191919';
        this.game.ctx.stroke();


        this._drawBorderMap();
        this.game.ctx.restore();

    }
  

    _drawBorderMap() {
        this.game.ctx.beginPath();
    
        const lineWidth = 15;
        const startX = 0 - this.game.camera.x;
        const startY = 0 - this.game.camera.y;
        const endX = this.cols * this.tileSize - this.game.camera.x
        const endY = this.rows * this.tileSize - this.game.camera.y
    
        this.game.ctx.moveTo(startX, startY);
        this.game.ctx.lineTo(endX, startY);
        this.game.ctx.lineTo(endX, endY);
        this.game.ctx.lineTo(startX, endY);
        this.game.ctx.closePath();
    
        this.game.ctx.lineWidth = lineWidth;
        this.game.ctx.strokeStyle = 'darkred';
        this.game.ctx.lineCap = 'round';
    
        this.game.ctx.stroke();
    }

    }
