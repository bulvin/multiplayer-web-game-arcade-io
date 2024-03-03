const directions = [
    { dx: 1, dy: 0 }, 
    { dx: -1, dy: 0 }, 
    { dx: 0, dy: 1 }, 
    { dx: 0, dy: -1 }  
];

function startFillEnclosedArea(tiles, x, y, color) {
    const {playerColor, tailColor} = color;
    const stack = [{ x, y }];
    while (stack.length > 0) {
        const { x, y } = stack.pop();
        let position = `${x},${y}`;
        if (!tiles.has(position)) {
            continue;
        }
        let tile = tiles.get(position);
        if (tile === playerColor || tile === tailColor || tile === -1) {
            continue;
        }

        tiles.set(position, -1);

        for (const direction of directions) {
            stack.push({ x: x + direction.dx, y: y + direction.dy });
        }
      
    }
}

function addLostTile(lostTiles, playerId, tile) {
    if (playerId !== 0) {
        if (!lostTiles.has(playerId)) {
            lostTiles.set(playerId, []);
        }
        lostTiles.get(playerId).push(tile);
    }
};

export { startFillEnclosedArea, addLostTile };