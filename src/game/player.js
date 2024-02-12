export class Player {
  constructor(user, game, color) {
    this.user = user;
    this.game = game;
    this.psize = 32;
    this.x = 0;
    this.y = 0;
    this.speed = 0.2;
    this.color = color;
    this.tileColor = "#ff0000";
    this.lands = [];
    this.tail = [];
    this.input = [];
    this.score = 0;
    this.dead = false;
    this.direction = Direction.None;
    this.multiplyScore = 1;
    this.deadTimer = 0;
    this.deadInterval = 5000;
    this.kills = 0;
    this.deaths = 0;
    this.abilitiesBinds = {};
    this.activeAbility = null;
    this.activeBonus = null;
    this.slowMultiplier = 1;
    this.moveQueue = [];
    this.moving = false;
  }

  update(deltaTime) {

    if (this.dead) {

      if (this.deadTimer > this.deadInterval) {
        this.dead = false;
        this.deadTimer = 0;
        this.moveQueue = [];
        this.initBase();
      } else {
        this.deadTimer += deltaTime;
      }
    } else {

      this.checkTakeEffects();

      if (this.activeAbility) {
        this.activeAbility.duration -= deltaTime;

        if (this.activeAbility.duration <= 0) {
          this.resetAbilityEffects();
        }
      }

      if (this.activeBonus) {
        this.activeBonus.duration -= deltaTime;

        if (this.activeBonus.duration <= 0) {
          this.resetBonusEffect();
        }
      }

      if (!this.moving && this.moveQueue.length > 0) {
        const newDir = this.moveQueue.shift();
        this.setDirection(newDir);
      }
      this.move(deltaTime);

      if (this.isHitInBorders() || this.isHitSelf()) {
        this.dead = true;
        this.deaths++;
        this.clear();
        return;
      }

      if (!this.moving) {
        const land = this.game.map.getTile(this.y, this.x);
        if (land.playerId !== this.user.id) {

          this.addLandToTail(land);

        }

        if (
          this.user.id === land.playerId &&
          !land.hasTail &&
          this.tail.length > 0
        ) {
          this.tail.push(land);

          this.takeArea();

          this.gainPoints();
          this.tail = [];
        }
        const ability = this.useAbility();
        if (ability) {
          this.previousDirection = this.direction;

          this.activeAbility = ability;
        }
      }
    }
  }

  move(deltaTime) {
    if (!this.moving) {
      this.moving = true;
      this.targetX = this.x + this.direction.dx;
      this.targetY = this.y + this.direction.dy;
    }
    const dt = (deltaTime / 1000) * 60;
    const moveAmount = this.speed * this.slowMultiplier * dt;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;

      this.x += normalizedX * moveAmount;
      this.y += normalizedY * moveAmount;
    }

    if (Math.abs(dx) <= moveAmount && Math.abs(dy) <= moveAmount) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.moving = false;
    }
  }

  setDirection(newDir) {
    const currentDirection = this.direction;
    const newDirection = keyToDirection[newDir];

    if (
      currentDirection.dx + newDirection.dx !== 0 ||
      currentDirection.dy + newDirection.dy !== 0
    ) {
      this.direction = newDirection;
    }
  }

  setInput(input) {
    const key = input.pop();

    if (!this.dead) {
      if ([Keys.W, Keys.S, Keys.A, Keys.D].includes(key) && !this.moveQueue.includes(key)) {

        this.moveQueue.push(key);
        this.input = input;

      }
    }


  }
  addLandToTail(land) {
    this.game.map.setTile(
      land.x,
      land.y,
      {
        playerId: land.playerId,
        color: this.tileColor,
      },
      true);
    return this.tail.push(land);
  }
  takeArea() {

    const start = this.tail[0];
    const end = this.tail[this.tail.length - 1];


    this.tail = this.tail.concat(
      this.getTailComplement(start.x, start.y, end.x, end.y, this.lands)
    );

    this.fillZone();
    this.updateTailAndLands();
  }

  fillZone() {
    const xs = this.tail.map((segment) => segment.x);
    const ys = this.tail.map((segment) => segment.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const lostTiles = new Map();

    const addToLostTiles = (playerId, tile) => {
      if (!lostTiles.has(playerId)) {
        lostTiles.set(playerId, []);
      }
      lostTiles.get(playerId).push(tile);
    };

    this.tail = this.tail.filter(tile => {
      if (tile.playerId !== this.user.id) {
        tile.color = this.color;

        if (tile.playerId !== 0) {
          addToLostTiles(tile.playerId, tile);
        }
        return true;
      }
      return false;
    });

    const width = maxX - minX + 2;
    const height = maxY - minY + 2;

    const helpTiles = new Map();
   
    for (let i = 0; i < width + 1; i++) {
      for (let j = 0; j < height + 1; j++) {
        helpTiles.set(`${i},${j}`, 0);
      }
    }

    let tile;
    for (let i = 1; i < width; i++) {
      for (let j = 1; j < height; j++) {
        tile = this.game.map.getTile(minY + j - 1, minX + i - 1);
        helpTiles.set(`${i},${j}`, tile.color);
      }
    }

    this.startFilling(helpTiles, 0, 0);

    for (let i = 1; i < width; i++) {
      for (let j = 1; j < height; j++) {
        let tile = this.game.map.getTile(minY + j - 1, minX + i - 1);

        if (tile.color === this.color) {
          helpTiles.set(`${i},${j}`, -1);
        } else if (tile.playerId !== this.user.id && tile.playerId !== 0) {
            addToLostTiles(tile.playerId, tile);
        }
      }
    }

    for (let [key, value] of helpTiles) {

      if (value !== -1) {

        const [i, j] = key.split(",").map(Number);
        tile = this.game.map.getTile(minY + j - 1, minX + i - 1);

        this.tail.push(tile);
      }
    }

    for (let [playerId, tiles] of lostTiles) {
    
      const player = this.game.getPlayer(playerId);
      player.removeTilesFromTerritory(tiles);
    }

  }

  startFilling(tiles, x, y) {
    const stack = [{x, y}];
    while (stack.length > 0) {
      const {x, y} = stack.pop();
      let position = `${x},${y}`;
      if (!tiles.has(position)) {
        continue;
      }
      let tile = tiles.get(position);
      if (tile === this.color || tile === -1) {
        continue;
      }
  
      tiles.set(position, -1);
  
      for (const direction of Object.values(Direction)) {
        stack.push({x: x + direction.dx, y: y + direction.dy});
      }
    }
  }

  getTailComplement(startX, startY, endX, endY, tiles) {
    const points = this.findShortestPath(startX, startY, endX, endY, tiles);

    const complementTiles = [];

    points.forEach((point) => {
      const tile = this.game.map.getTile(point.y, point.x);
      complementTiles.push(tile);
    });

    return complementTiles;
  }
  findShortestPath(startX, startY, endX, endY, tiles) {
    const queue = [{ x: startX, y: startY, distance: 0, path: [] }];
    const visited = new Set();
    const tilesMap = new Map(tiles.map(tile => [`${tile.x},${tile.y}`, tile]));
  
    while (queue.length > 0) {
      const { x, y, distance, path } = queue.shift();
  
      if (x === endX && y === endY) {
        return path;
      }
  
      if (visited.has(`${x},${y}`)) {
        continue;
      }
  
      visited.add(`${x},${y}`);
  
      for (const direction of Object.values(Direction)) {
        const neighbor = { x: x + direction.dx, y: y + direction.dy };
        if (tilesMap.has(`${neighbor.x},${neighbor.y}`)) {
          queue.push({
            x: neighbor.x,
            y: neighbor.y,
            distance: distance + 1,
            path: [...path, { x: neighbor.x, y: neighbor.y }],
          });
        }
      }
    }
  
    return null;
  }
  updateTailAndLands() {


    this.tail.forEach((tile) => {
      this.game.map.setTile(
        tile.x,
        tile.y,
        { playerId: this.user.id, color: this.color },
        false);
    });

    const scoreToAdd = this.gainPoints();
    this.score += scoreToAdd;

    this.lands.push(...this.tail);

    this.tail = [];
  }


  gainPoints() {
    let totalScore = 0;
    this.tail.forEach((land) => {
      totalScore += land.score * this.multiplyScore;
    });
    return totalScore;
  }
  removeTilesFromTerritory(tiles) {
    this.lands = this.lands.filter(land => {
      if (tiles.includes(land)) {
        this.score -= land.score;
        return false;
      }
      return true;
    })
  }

  getTerritoryPercentage() {
    const squaresAll = this.game.map.countTiles();
    const percent = (this.lands.length / squaresAll) * 100;

    return percent.toFixed(1);
  }
  isHitSelf() {
    if (this.activeAbility && this.activeAbility.name === "noHitSelf") {
      return false;
    } else {
      for (const segment of this.tail) {
        if (segment.x === this.x && segment.y === this.y) {
          return true;
        }
      }
    }

    return false;
  }
  isHitInBorders() {
    return (
      this.x < 0 ||
      this.x >= this.game.map.cols ||
      this.y < 0 ||
      this.y >= this.game.map.rows
    );
  }
  isSomeoneHitsMe(otherPlayer) {
    for (const segment of this.tail) {
      if (segment.x === otherPlayer.x && segment.y === otherPlayer.y) {
        this.dead = true;
        this.deaths++;
        this.clear();
        otherPlayer.kills++;
        otherPlayer.score += 10;
        break;
      }
    }
  }
  clear() {

    this.lands.forEach((land) => {
      this.game.map.setTile(
        land.x,
        land.y,
        { playerId: 0, color: '#111' },
        false
      );

    });
    this.tail.forEach((tile) => {
      this.game.map.setTile(
        tile.x,
        tile.y,
        { playerId: 0, color: '#111', oldPlayerId: this.user.id, oldColor: this.color },
        false
      );

    });

    this.lands = [];
    this.tail = [];
    this.score = 0;
    this.direction = Direction.None;
    this.speed = 0.2;
    this.moving = false;
    this.moveQueue = [];
    if (this.activeBonus) {
      this.resetBonusEffect();
    }


  }

  spawn() {
    const spawnBorder = Math.floor(Math.random() * 4);
    let spawnRow, spawnCol;

    const borderBuffer = 1;

    if (spawnBorder === 0) {
      spawnRow = borderBuffer;
      spawnCol =
        Math.floor(Math.random() * (this.game.map.cols - 12 + borderBuffer)) +
        6;
    } else if (spawnBorder === 1) {
      spawnRow =
        Math.floor(Math.random() * (this.game.map.rows - 12 + borderBuffer)) +
        6;
      spawnCol = this.game.map.cols - 1 - borderBuffer;
    } else if (spawnBorder === 2) {
      spawnRow = this.game.map.rows - 1 - borderBuffer;
      spawnCol =
        Math.floor(Math.random() * (this.game.map.cols - 12 + borderBuffer)) +
        6;
    } else {
      spawnRow =
        Math.floor(Math.random() * (this.game.map.rows - 12 + borderBuffer)) +
        6;
      spawnCol = borderBuffer;
    }

    const spawnTile = this.game.map.getTile(spawnRow, spawnCol);
    this.x = spawnTile.x;
    this.y = spawnTile.y;
  }
  checkTakeEffects() {
    const abilities = this.game.abilities;
    const bonuses = this.game.bonuses;

    abilities.forEach((ability, index) => {
      const abilityPosition = ability.position;

      if (this.x === abilityPosition.x && this.y === abilityPosition.y) {
        this.applyAbilityEffect(ability);
        abilities.splice(index, 1);
      }
    });

    bonuses.forEach((bonus, index) => {
      const bonusPosition = bonus.position;

      if (this.x === bonusPosition.x && this.y === bonusPosition.y) {
        this.applyBonusEffect(bonus);
        bonuses.splice(index, 1);
      }
    });
  }
  applyAbilityEffect(ability) {
    if (!this.abilitiesBinds[Keys.R]) {
      this.abilitiesBinds[Keys.R] = ability;
    } else if (!this.abilitiesBinds[Keys.T]) {
      this.abilitiesBinds[Keys.T] = ability;
    } else if (!this.abilitiesBinds[Keys.E]) {
      this.abilitiesBinds[Keys.E] = ability;
    }
  }
  useAbility() {
    if (!this.activeAbility) {
      let abilityKey = null;
      if (this.input.includes(Keys.R)) {
        abilityKey = Keys.R;
      } else if (this.input.includes(Keys.T)) {
        abilityKey = Keys.T;
      } else if (this.input.includes(Keys.E)) {
        abilityKey = Keys.E;
      }

      if (abilityKey && this.abilitiesBinds[abilityKey]) {
        const ability = this.abilitiesBinds[abilityKey];
        if (ability.name === "Prędkość" && this.activeAbility !== "Prędkość") {
          this.speed *= 2;
        } else if (
          ability.name === "Spowolnienie" &&
          this.activeAbility !== "Spowolnienie"
        ) {
          for (const id in this.game.players) {
            if (id !== this.user.id) {
              const otherPlayer = this.game.players[id];
              otherPlayer.slowMultiplier = 0.5;
            }
          }
        } else if (
          ability.name === "Powrót" &&
          this.activeAbility !== "Powrót"
        ) {
          if (this.lands.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.lands.length);
            const randomLand = this.lands[randomIndex];
            this.x = randomLand.x;
            this.y = randomLand.y;
            this.targetX = randomLand.x;
            this.targetY = randomLand.y;
            this.tail.forEach((tile) => {
              this.game.map.setTile(tile.x, tile.y, 0, '#111', false);
            });
            this.tail = [];
          }
        }

        return ability;
      }
    }
    return null;
  }

  resetAbilityEffects() {
    if (this.activeAbility.name === "Prędkość") {
      this.speed *= 0.5;
    } else if (this.activeAbility.name === "Spowolnienie") {
      for (const id in this.game.players) {
        const otherPlayer = this.game.players[id];
        otherPlayer.slowMultiplier = 1;
      }
    } else if (this.activeAbility.name === "Powrót") {
      this.direction = this.previousDirection;
    }

    for (const key of Object.keys(this.abilitiesBinds)) {
      if (this.abilitiesBinds[key] === this.activeAbility) {
        this.abilitiesBinds[key] = null;
        break;
      }
    }

    this.activeAbility = null;
  }
  applyBonusEffect(bonus) {
    if (bonus.name === "x2") {
      this.multiplyScore = 2;
    } else if (bonus.name === "x4") {
      this.multiplyScore = 4;
    } else if (bonus.name === "x8") {
      this.multiplyScore = 8;
    }
    this.activeBonus = bonus;
  }
  resetBonusEffect() {
    if (
      this.activeBonus.name === "x2" ||
      this.activeBonus.name === "x4" ||
      this.activeBonus.name === "x8"
    ) {
      this.multiplyScore = 1;
    }
    this.activeBonus = null;
  }
  initBase() {
    this.spawn();

    for (let row = -1; row < 2; row++) {
      for (let col = -1; col < 2; col++) {
        const newRow = this.y + row;
        const newCol = this.x + col;

        if (
          newRow >= 0 &&
          newRow < this.game.map.rows &&
          newCol >= 0 &&
          newCol < this.game.map.cols
        ) {
          const spawnLand = this.game.map.getTile(newRow, newCol);
          spawnLand.playerId = this.user.id;
          spawnLand.color = this.color;
          this.lands.push(spawnLand);
          this.game.map.updatedTiles.push(spawnLand);
        }
      }
    }
  }

  calculateDistance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  getCountTiles() {
    return this.lands.length;
  }

  toJSON() {
    const territory = this.getTerritoryPercentage();
    return {
      nickname: this.user.name,
      color: this.color,
      x: this.x,
      y: this.y,
      score: this.score,
      kills: this.kills,
      deaths: this.deaths,
      territory: territory,
      abilities: this.abilitiesBinds,
      bonus: this.activeBonus,
      activeAbility: this.activeAbility,
      dead: this.dead
    };
  }

}

const Keys = {
  W: "w",
  S: "s",
  A: "a",
  D: "d",
  R: "r",
  T: "t",
  E: "e",
};

const Direction = {
  Up: { dx: 0, dy: -1 },
  Down: { dx: 0, dy: 1 },
  Right: { dx: 1, dy: 0 },
  Left: { dx: -1, dy: 0 },
  None: { dx: 0, dy: 0 },
};

const keyToDirection = {
  [Keys.W]: Direction.Up,
  [Keys.S]: Direction.Down,
  [Keys.A]: Direction.Left,
  [Keys.D]: Direction.Right,
};
