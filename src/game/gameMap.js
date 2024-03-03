export class GameMap {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.width = cols * this.tileSize;
        this.height = rows * this.tileSize;
        this.tileSize = 32;
        this.tiles = [];
        this.initTiles();
        this.updatedTiles = [];
        this.occupiedSpawns = [];

    }
    getTile(row, col) {
        return this.tiles[row][col];
    }
    setTile(updatedTile) {

        const tile = this.getTile(updatedTile.y, updatedTile.x);
        tile.hasTail = updatedTile.hasTail;
        tile.playerId = updatedTile.playerId;
        tile.tailOwner = updatedTile.tailOwner;
        tile.color = updatedTile.color;
        if (updatedTile.oldColor !== undefined) {
            tile.oldColor = updatedTile.oldColor;
        }
       
        this.updatedTiles.push(tile);


    }
    initTiles() {

        let pointsScale = 2;
        let scoreAreaCol = this.cols / 2;
        let scoreAreaRow = this.rows / 2;
        let scoreAreaStart = this.tileSize / 2;
        let points = 1;

        let tile;
        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];

            for (let col = 0; col < this.cols; col++) {
                if ((col >= scoreAreaCol - scoreAreaStart && col <= scoreAreaCol + scoreAreaStart) &&
                    row >= scoreAreaRow - scoreAreaStart && row <= scoreAreaRow + scoreAreaStart) {
                    points = 1;
                    points *= pointsScale;
                }

                tile = new Tile(col, row, 0, points, 32, '#111', false);

                this.tiles[row].push(tile);

            }


        }
    }

    spawn() {
      
       const spawnTile = this.generateSpawnTile();
    
        return spawnTile;
    }
    
    generateSpawnTile() {
        const spawnBorder = Math.floor(Math.random() * 4);
        const borderBuffer = 2; 
        let spawnRow, spawnCol;
    
        if (spawnBorder === 0) {
            spawnRow = borderBuffer;
            spawnCol = this.getRandomCol(borderBuffer);
        } else if (spawnBorder === 1) {
            spawnRow = this.getRandomRow(borderBuffer);
            spawnCol = this.cols - 1 - borderBuffer;
        } else if (spawnBorder === 2) {
            spawnRow = this.rows - 1 - borderBuffer;
            spawnCol = this.getRandomCol(borderBuffer);
        } else {
            spawnRow = this.getRandomRow(borderBuffer);
            spawnCol = borderBuffer;
        }
    
        const tile = this.getTile(spawnRow, spawnCol);
        if (this.isOccupied(tile)) {
            return this.generateSpawnTile();
        }
    
        return tile;
    }
    
    getRandomRow(borderBuffer) {
        return Math.floor(Math.random() * (this.rows - 2 * borderBuffer)) + borderBuffer;
    }
    
    getRandomCol(borderBuffer) {
        return Math.floor(Math.random() * (this.cols - 2 * borderBuffer)) + borderBuffer;
    }
    
    isOccupied(tile) {
        for (let occupied of this.occupiedSpawns) {
            if (occupied && occupied.x === tile.x && occupied.y === tile.y) {
                return true;
            }
        }
        for (let row = -1; row < 2; row++) {
            for (let col = -1; col < 2; col++) {
                const newRow = tile.y + row;
                const newCol = tile.x + col;
    
                if (
                    newRow >= 0 &&
                    newRow < this.rows &&
                    newCol >= 0 &&
                    newCol < this.cols
                ) {
                    const checkTile = this.getTile(newRow, newCol);
                    if (checkTile && checkTile.hasTail) {
                        return true;
                    }
                }
            }
        }
    
        return false;
    }
    
    releaseSpawn(playerId) {
        this.occupiedSpawns = this.occupiedSpawns.filter(spawn => spawn.playerId !== playerId);
    }

    countTiles() {
        return this.rows * this.cols;
    }

    toJSON() {
        const tiles = this.updatedTiles.map(tile => tile.toJSON());
        return tiles;
    }

}

export class Tile {
    constructor(x, y, playerId, score, size, color, hasTail) {
        this.x = x;
        this.y = y;
        this.playerId = playerId;
        this.score = score;
        this.size = size;
        this.color = color;
        this.hasTail = hasTail;
        this.oldColor = color;
        this.tailOwner = playerId;
 
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            color: this.color,

        }
    }
}

