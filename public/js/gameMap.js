export class GameMap {
    constructor({ rows, cols, tiles, tileSize }, game) {
        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize;
        this.width = rows * this.tileSize;
        this.height = cols * this.tileSize;
        this.game = game;

        this.tiles = tiles;
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
                const x = col * tileSize - cameraX;
                const y = row * tileSize - cameraY;
                const tile = this.tiles[row][col];

                this.game.context.fillStyle = tile.color;
                this.game.context.fillRect(x, y, tileSize, tileSize);
            }
        }
    }

    drawGrid() {
        
        this.game.context.beginPath();

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
                this.game.context.moveTo(x, mapStartY);
                this.game.context.lineTo(x, mapEndY);
            }
        }

        for (let i = startY; i < endY; i++) {
            const y = (i * tileSize) - cameraY;
            if (y >= mapStartY && y <= mapEndY) {
                this.game.context.moveTo(mapStartX, y);
                this.game.context.lineTo(mapEndX, y);
            }
        }

        this.game.context.lineWidth = 3;
        
        this.game.context.strokeStyle = '#191919';
        this.game.context.stroke();


        this.#drawBorderMap();
        

    }

    #drawBorderMap() {
     
        this.game.context.beginPath();

        const lineWidth = 20;
        const cameraX = this.game.camera.x;
        const cameraY = this.game.camera.y;

        this.game.context.moveTo(0 - cameraX, 0 - cameraY);
        this.game.context.lineTo(this.width - cameraX, 0 - cameraY);
        this.game.context.moveTo(this.width - cameraX, 0 - cameraY);
        this.game.context.lineTo(this.width - cameraX, this.height - cameraY);
        this.game.context.moveTo(this.width - cameraX, this.height - cameraY);
        this.game.context.lineTo(0 - cameraX, this.height - cameraY);
        this.game.context.moveTo(0 - cameraX, this.height - cameraY);
        this.game.context.lineTo(0 - cameraX, 0 - cameraY);

        this.game.context.lineWidth = lineWidth;
        this.game.context.strokeStyle = 'darkred';
        this.game.context.lineCap = 'round';

        this.game.context.stroke();
       

    }


}