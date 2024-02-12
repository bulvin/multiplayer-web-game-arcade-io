export class GameMap {
    constructor(game, tiles) {
        this.rows = 80;
        this.cols = 80;
        this.tileSize = 32;
        this.width = this.rows * this.tileSize;
        this.height = this.cols * this.tileSize;
        this.game = game;

        this.tiles = Array(this.rows * this.cols).fill({ color: '#111' });
        this.update(tiles);
    }
    update(tiles) {
        for (let tile of tiles) {
            let index = tile.y * this.cols + tile.x;
            this.tiles[index] = tile;
        }
    }
    drawTiles() {
        
        const tileSize = this.tileSize * window.devicePixelRatio;
        const cameraX = this.game.camera.x;
        const cameraY = this.game.camera.y;
        const viewportWidth = this.game.canvas.width;
        const viewportHeight = this.game.canvas.height;

        const startX = Math.max(0, Math.floor(cameraX / tileSize));
        const startY = Math.max(0, Math.floor(cameraY / tileSize));
        const endX = Math.min(this.cols, Math.ceil((cameraX + viewportWidth) / tileSize));
        const endY = Math.min(this.rows, Math.ceil((cameraY + viewportHeight) / tileSize));

        for (let row = startY; row < endY; row++) {
            for (let col = startX; col < endX; col++) {
                let index = row * this.cols + col;
                let tile = this.tiles[index];
               
               
                const x = col * tileSize - cameraX;
                const y = row * tileSize - cameraY;

                this.game.ctx.fillStyle = tile.color;
                this.game.ctx.fillRect(x, y, tileSize, tileSize);
            }
        }


    }
  

    drawGrid() {
        this.game.ctx.save();
        this.game.ctx.beginPath();

        const tileSize = this.tileSize * window.devicePixelRatio;
        const cameraX = this.game.camera.x;
        const cameraY = this.game.camera.y;
        const viewportWidth = this.game.canvas.width;
        const viewportHeight = this.game.canvas.height;

        const startX = Math.max(0, Math.floor(cameraX / tileSize));
        const startY = Math.max(0, Math.floor(cameraY / tileSize));
        const endX = Math.min(this.cols, Math.ceil((cameraX + viewportWidth) / tileSize));
        const endY = Math.min(this.rows, Math.ceil((cameraY + viewportHeight) / tileSize));

        const mapStartX = startX * tileSize - cameraX;
        const mapStartY = startY * tileSize - cameraY;
        const mapEndX = endX * tileSize - cameraX;
        const mapEndY = endY * tileSize - cameraY;

        for (let i = startX; i < endX; i++) {
            const x = (i * tileSize) - cameraX;
            if (x >= mapStartX && x <= mapEndX) {
                this.game.ctx.moveTo(x, mapStartY);
                this.game.ctx.lineTo(x, mapEndY);
            }
        }

        for (let i = startY; i < endY; i++) {
            const y = (i * tileSize) - cameraY;
            if (y >= mapStartY && y <= mapEndY) {
                this.game.ctx.moveTo(mapStartX, y);
                this.game.ctx.lineTo(mapEndX, y);
            }
        }

        this.game.ctx.lineWidth = 3;

        this.game.ctx.strokeStyle = '#191919';
        this.game.ctx.stroke();


        this.#drawBorderMap();
        this.game.ctx.restore();

    }

    #drawBorderMap() {


        this.game.ctx.beginPath();

        const lineWidth = 20;
        const cameraX = this.game.camera.x;
        const cameraY = this.game.camera.y;

        this.game.ctx.moveTo(0 - cameraX, 0 - cameraY);
        this.game.ctx.lineTo(this.width - cameraX, 0 - cameraY);
        this.game.ctx.moveTo(this.width - cameraX, 0 - cameraY);
        this.game.ctx.lineTo(this.width - cameraX, this.height - cameraY);
        this.game.ctx.moveTo(this.width - cameraX, this.height - cameraY);
        this.game.ctx.lineTo(0 - cameraX, this.height - cameraY);
        this.game.ctx.moveTo(0 - cameraX, this.height - cameraY);
        this.game.ctx.lineTo(0 - cameraX, 0 - cameraY);

        this.game.ctx.lineWidth = lineWidth;
        this.game.ctx.strokeStyle = 'darkred';
        this.game.ctx.lineCap = 'round';

        this.game.ctx.stroke();



    }


}