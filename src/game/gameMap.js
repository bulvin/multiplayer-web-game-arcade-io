export class GameMap {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.tileSize = 32;
        this.width = cols * this.tileSize;
        this.height = rows * this.tileSize;
        this.tiles = [];
        this.initTiles();
    
    }
    getTile(row, col) {
        return this.tiles[row][col];
    }
    setTile(row, col, tile) {
        this.tiles[row][col] = tile;
    }
    getRow(y) {
        return Math.floor(y / this.tileSize);
    }
    
    getCol(x) {
        return Math.floor(x / this.tileSize);
    }
    initTiles() {

        let tileX = 0;
        let tileY = 0;
        let pointsScale = 3;
        let scoreAreaCol = this.cols / 2;
        let scoreAreaRow = this.rows / 2;
        let scoreAreaStart = this.tileSize / 2;
        let points = 10;

        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];

            for (let col = 0; col < this.cols; col++) {
                if ((col >= scoreAreaCol - scoreAreaStart && col <= scoreAreaCol + scoreAreaStart) &&
                    row >= scoreAreaRow - scoreAreaStart && row <= scoreAreaRow + scoreAreaStart) {
                    points = 10;
                    points *= pointsScale;
                }
                let tile = { x: tileX, y: tileY, playerId: 0, score: points, tileSize: this.tileSize, color: '#111', hasTail: false};
                this.tiles[row].push(tile);
                tileX += this.tileSize;

            }

            tileX = 0;
            tileY += this.tileSize;
        }
    }

    countTiles() {
        let count = 0;
        
        for (let row = 0; row < this.tiles.length; row++) {
          count += this.tiles[row].length;
        }
        
        return count;
    }

    toJSON() {
        const { ...gameMapData } = this;
        return gameMapData;
    }

}
