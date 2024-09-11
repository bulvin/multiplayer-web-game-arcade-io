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
        
        // Pre-calculate grid lines
        this.gridPath = new Path2D();
        this._precalculateGridPath();
    }

    update(tiles) {
        for (let tile of tiles) {
            let index = tile.y * this.cols + tile.x;
            this.tiles[index] = tile;
        }
    }

    drawTiles() {
        const ctx = this.game.ctx;
        const cameraX = this.game.camera.x;
        const cameraY = this.game.camera.y;
        const viewportWidth = this.game.canvas.width;
        const viewportHeight = this.game.canvas.height;

        const startX = Math.max(0, Math.floor(cameraX / this.tileSize));
        const startY = Math.max(0, Math.floor(cameraY / this.tileSize));
        const endX = Math.min(this.cols, Math.ceil((cameraX + viewportWidth) / this.tileSize));
        const endY = Math.min(this.rows, Math.ceil((cameraY + viewportHeight) / this.tileSize));

        ctx.save();
        ctx.translate(-cameraX, -cameraY);

        for (let row = startY; row < endY; row++) {
            for (let col = startX; col < endX; col++) {
                let index = row * this.cols + col;
                let tile = this.tiles[index];

                ctx.fillStyle = tile.color;
                ctx.fillRect(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
            }
        }

        ctx.restore();
    }

    drawGrid() {
        const ctx = this.game.ctx;
        ctx.save();
        ctx.translate(-this.game.camera.x, -this.game.camera.y);
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#191919';
        ctx.stroke(this.gridPath);

        this._drawBorderMap();
        ctx.restore();
    }

    _precalculateGridPath() {
        for (let i = 0; i <= this.cols; i++) {
            const x = i * this.tileSize;
            this.gridPath.moveTo(x, 0);
            this.gridPath.lineTo(x, this.height);
        }

        for (let i = 0; i <= this.rows; i++) {
            const y = i * this.tileSize;
            this.gridPath.moveTo(0, y);
            this.gridPath.lineTo(this.width, y);
        }
    }

    _drawBorderMap() {
        const ctx = this.game.ctx;
        ctx.beginPath();
    
        const lineWidth = 15;
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = 'darkred';
        ctx.lineCap = 'round';
    
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();
    }
}