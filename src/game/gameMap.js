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

    }
    getTile(row, col) {
        return this.tiles[row][col];
    }
    setTile(x, y, player, hasTail) {

        const tile = this.getTile(y, x);
        tile.playerId = player.playerId;
        tile.color = player.color;
        tile.hasTail = hasTail;
 

        this.updatedTiles.push(tile);
        

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
        return this.rows * this.cols;
    }

    toJSON() {
        const tiles = this.updatedTiles.map(tile => tile.toJSON());
        return tiles;
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

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            color: this.color,

        }
    }
}

