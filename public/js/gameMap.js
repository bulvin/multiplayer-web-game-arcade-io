export class GameMap {
    constructor({rows, cols, tiles}) {
        this.rows = rows;
        this.cols = cols;
        this.tileSize = 32;
        this.width = rows * this.tileSize;
        this.height = cols * this.tileSize;
      
        this.tiles = tiles;
    }
    drawTiles(context, canvas, camera, players) {
        context.save();

        const tileSize = this.tileSize * window.devicePixelRatio;
        const cameraX = camera.x;
        const cameraY = camera.y;
        const viewportWidth = canvas.width;
        const viewportHeight = canvas.height;

        const startX = Math.max(0, Math.floor(cameraX / tileSize));
        const startY = Math.max(0, Math.floor(cameraY / tileSize));
        const endX = Math.min(this.cols, Math.ceil((cameraX + viewportWidth) / tileSize));
        const endY = Math.min(this.rows, Math.ceil((cameraY + viewportHeight) / tileSize));

        for (let row = startY; row < endY; row++) {
            for (let col = startX; col < endX; col++) {
                const x = col * tileSize - cameraX;
                const y = row * tileSize - cameraY;
                const tile = this.tiles[row][col];
                const playerId = tile.playerId;
                if (tile.hasTail ) {
                    context.fillStyle = 'hsl(0, 100%, 50%)'; 
                }  else if (playerId !== 0) {
                    let player;
                    for (const id in players) {
                        const frontendPlayer = players[id];
                        if (id === playerId) {
                            player = frontendPlayer;
                            break;
                        }
                    }
                    if (player) {
                        context.fillStyle = player.color;
                    }
                } else if (playerId === 0) {
                    context.fillStyle = '#111'; 
                } 
               
              

                context.fillRect(x, y, tileSize, tileSize);
            }
        }
        context.restore();
    }

    drawGrid(context, canvas, camera) {
        
        context.beginPath();

        const tileSize = this.tileSize * window.devicePixelRatio;
        const cameraX = camera.x;
        const cameraY = camera.y;
        const viewportWidth = canvas.width;
        const viewportHeight = canvas.height;

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
                context.moveTo(x, mapStartY);
                context.lineTo(x, mapEndY);
            }
        }

        for (let i = startY; i < endY; i++) {
            const y = (i * tileSize) - cameraY;
            if (y >= mapStartY && y <= mapEndY) {
                context.moveTo(mapStartX, y);
                context.lineTo(mapEndX, y);
            }
        }

        context.lineWidth = 2;
        context.strokeStyle = '#191919';
        context.stroke();

        this.#drawBorderMap(context, camera);

       
    }

    #drawBorderMap(context, camera) {
    
        context.beginPath();

        const lineWidth = 10;
        const cameraX = camera.x;
        const cameraY = camera.y;

        context.moveTo(0 - cameraX, 0 - cameraY);
        context.lineTo(this.width - cameraX, 0 - cameraY);
        context.moveTo(this.width - cameraX, 0 - cameraY);
        context.lineTo(this.width - cameraX, this.height - cameraY);
        context.moveTo(this.width - cameraX, this.height - cameraY);
        context.lineTo(0 - cameraX, this.height - cameraY);
        context.moveTo(0 - cameraX, this.height - cameraY);
        context.lineTo(0 - cameraX, 0 - cameraY);

        context.lineWidth = lineWidth;
        context.strokeStyle = 'darkred';
        context.lineCap = 'round';
        context.setLineDash([]);
        context.stroke();

    }
   

}