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

        const pointsScale = 2;
        const scoreAreaCol = this.cols / 2;
        const scoreAreaRow = this.rows / 2;
        const scoreAreaSize = this.tileSize / 2;

        const colStart = scoreAreaCol - scoreAreaSize;
        const colEnd = scoreAreaCol + scoreAreaSize;
        const rowStart = scoreAreaRow - scoreAreaSize;
        const rowEnd = scoreAreaRow + scoreAreaSize;

        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];

            for (let col = 0; col < this.cols; col++) {
                let points = (col >= colStart && col <= colEnd && row >= rowStart && row <= rowEnd) ? 1 * pointsScale : 1;

                let tile = new Tile(col, row, 0, points, this.tileSize, '#111', false);
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
        const borderBuffer = 1;
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
        return Math.floor(Math.random() * (this.rows - 4 * borderBuffer)) + 2;
    }

    getRandomCol(borderBuffer) {
        return Math.floor(Math.random() * (this.cols - 4 * borderBuffer)) + 2;
    }

    isOccupied(tile) {
        for (let i = 0; i < this.occupiedSpawns.length; i++) {
            const spawn = this.occupiedSpawns[i];
            if (spawn.x === tile.x && spawn.y === tile.y) {
                return true;
            }
        }

        for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
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

