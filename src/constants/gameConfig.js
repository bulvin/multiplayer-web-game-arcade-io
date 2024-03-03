const Direction = Object.freeze({
    UP: { dx: 0, dy: -1 },
    DOWN: { dx: 0, dy: 1 },
    LEFT: { dx: -1, dy: 0 },
    RIGHT: { dx: 1, dy: 0 },
    NONE: { dx: 0, dy: 0 },
});

const Keys = Object.freeze({
    W: 'w',
    S: 's',
    A: 'a',
    D: 'd',
    R: 'r',
    T: 't',
    E: 'e',
});

const SPAWN_SIZE = 3;

export { Direction, Keys, SPAWN_SIZE };