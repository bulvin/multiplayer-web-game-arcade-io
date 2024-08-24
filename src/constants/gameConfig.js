const Direction = Object.freeze({
    UP: { dx: 0, dy: -1 },
    DOWN: { dx: 0, dy: 1 },
    LEFT: { dx: -1, dy: 0 },
    RIGHT: { dx: 1, dy: 0 },
    NONE: { dx: 0, dy: 0 },
});

const Keys = Object.freeze({
    W: 'W',
    S: 'S',
    A: 'A',
    D: 'D',
    R: 'R',
    T: 'T',
    E: 'E',
    ArrowLeft: 'ARROWLEFT',
    ArrowRight: 'ARROWRIGHT',
    ArrowUp: 'ARROWUP',
    ArrowDown: 'ARROWDOWN',
});

const MOVEMENT_KEYS = new Set([
    Keys.W, Keys.S, Keys.A, Keys.D,
    Keys.ArrowUp, Keys.ArrowDown, Keys.ArrowLeft, Keys.ArrowRight]);

const SPAWN_SIZE = 3;

export { Direction, Keys, SPAWN_SIZE, MOVEMENT_KEYS };