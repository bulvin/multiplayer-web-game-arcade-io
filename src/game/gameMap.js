export class GameMap {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.width = cols * this.tileSize;
        this.height = rows * this.tileSize;
        this.tileSize = 32;
        this.tiles = []; 
        this.initTiles();
     
    }
    getTile(row, col) {
        return this.tiles[row][col];
      }
    setTile(x, y, playerId, color, isTail) {
        const tile = this.getTile(y, x);
        tile.playerId = playerId;
        tile.color = color;
        tile.hasTail = isTail;
      }
    initTiles() {

        let pointsScale = 3;
        let scoreAreaCol = this.cols / 2;
        let scoreAreaRow = this.rows / 2;
        let scoreAreaStart = this.tileSize / 2;
        let points = 10;

        let tile;
        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];

            for (let col = 0; col < this.cols; col++) {
                if ((col >= scoreAreaCol - scoreAreaStart && col <= scoreAreaCol + scoreAreaStart) &&
                    row >= scoreAreaRow - scoreAreaStart && row <= scoreAreaRow + scoreAreaStart) {
                    points = 10;
                    points *= pointsScale;
                }

                tile = new Tile(col, row, 0, points, 32, '#111', false);
                  
                this.tiles[row].push(tile);


            }

       
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

class Tile {
    constructor(x, y, playerId, score, size, color, hasTail) {
        this.x = x;
        this.y = y;
        this.playerId = playerId;
        this.score = score;
        this.size = size;
        this.color = color;
        this.hasTail = hasTail;
    }
}

