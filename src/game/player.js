export class Player {
  constructor(user, game, color) {
    this.user = user;
    this.game = game;
    this.psize = 32;
    this.x = 0;
    this.y = 0;
    this.speed = 0.20;
    this.color = color;
    this.tileColor = '#ff0000';
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
        this.input = [];
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

         const oldLand = this.game.map.getTile(Math.floor(this.y), Math.floor(this.x));

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
        
          const land = this.game.map.getTile(Math.floor(this.y), Math.floor(this.x));
     
          if (oldLand !== land) {
            if (oldLand.playerId !== this.user.id && !this.dead) {
              this.addLandToTail(oldLand);
            }
          
    
            if (this.user.id === land.playerId && !land.hasTail && this.tail.length > 0) {
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
    const dt = (deltaTime / 1000) * 60
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
  
    if (!(currentDirection.dx === -newDirection.dx && currentDirection.dy === -newDirection.dy)) {
      this.direction = newDirection;
    }
  

  }
  queueDirection(direction) {
    
     
      this.moveQueue.push(direction);
    
  }
  setInput(input) {
    const inputKeys = ["w", "s", "a", "d", "e", "r", "t"];
    const validatedInput = input.filter((key) => inputKeys.includes(key));
  
    if (validatedInput.length > 0 && !this.dead) {
      this.moveQueue = [];
      validatedInput.forEach((key) => {
        if (["w", "s", "a", "d"].includes(key)) {
        
            this.queueDirection(key);
          
        }
      });
  
      this.input = validatedInput;
  
    } else {
      this.input = [];
    }
  }
  addLandToTail(land) {
    land.hasTail = true;
    land.color = this.tileColor;
    land.playerId = this.user.id;
    return this.tail.push(land);
  }
  takeArea() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    const start = this.tail[0];
    const end = this.tail[this.tail.length - 1];

    let wholeBase = [...this.tail, ...this.lands];

    for (const segment of wholeBase) {
      if (segment.x < minX) minX = segment.x;
      if (segment.x > maxX) maxX = segment.x;
      if (segment.y < minY) minY = segment.y;
      if (segment.y > maxY) maxY = segment.y;
    }

    wholeBase = [];
    const baseTiles = [];

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        let tile = this.game.map.getTile(y, x);
        if (tile.playerId === this.user.id && !tile.hasTail) {
          baseTiles.push({ x, y });
        }
      }
    } 
    this.tail = this.tail.concat(this.getTailComplement(start.x, start.y, end.x, end.y, baseTiles));

    this.fillZone();

    this.updateTailAndLands();
  }

  fillZone() {
    const xs = this.tail.map(segment => segment.x);
    const ys = this.tail.map(segment => segment.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
  
    const width = maxX - minX + 2;
    const height = maxY - minY + 2;
  
    let helpTiles = new Map();
    for (let i = 0; i < width + 1; i++) {
      for (let j = 0; j < height + 1; j++) {
        helpTiles.set(`${i},${j}`, 0);
      }
    }
  
    let tile;
    for (let i = 1; i < width; i++) {
      for (let j = 1; j < height; j++) {
        tile = this.game.map.getTile(minY + j - 1, minX + i - 1);
        helpTiles.set(`${i},${j}`, tile.playerId);
      }
    }
  
    this.startFilling(helpTiles, 0, 0);
  
    for (let i = 1; i < width; i++) {
      for (let j = 1; j < height; j++) {
        tile = this.game.map.getTile(minY + j - 1, minX + i - 1);
        if (tile.playerId === this.user.id && tile.hasTail) {
          helpTiles.set(`${i},${j}`, -1);
        }
      }
    }
  
    for (let [key, value] of helpTiles) {
      if (value !== -1) {
        const [i, j] = key.split(',').map(Number);
        tile = this.game.map.getTile(minY + j - 1, minX + i - 1);
        this.tail.push(tile);
      }
    }
  }
  
  startFilling(tiles, x, y) {
  let stack = [x, y];
  while (stack.length > 0) {
    let y = stack.pop();
    let x = stack.pop();
    let key = `${x},${y}`;
    if (!tiles.has(key)) {
      continue;
    }
    let tile = tiles.get(key);
    if (tile === this.user.id || tile === -1) {
      continue;
    }

    tiles.set(key, -1);

    for (const directionKey in Direction) {
      const direction = Direction[directionKey];
      stack.push(x + direction.dx, y + direction.dy);
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

    while (queue.length > 0) {

      const { x, y, distance, path } = queue.shift();


      if (x === endX && y === endY) {
        return path;
      }

      if (visited.has(`${x},${y}`)) {
        continue;
      }

      visited.add(`${x},${y}`);

      const neighbors = [
        { x: x + 1, y, direction: "Right" },
        { x: x - 1, y, direction: "Left" },
        { x, y: y + 1, direction: "Down" },
        { x, y: y - 1, direction: "Up" },
      ];

      for (const neighbor of neighbors) {
        if (tiles.some(tile => tile.x === neighbor.x && tile.y === neighbor.y)) {
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
    this.tail.forEach(segment => {
      segment.playerId = this.user.id;
      segment.color = this.color;
      segment.hasTail = false;
    });
    this.lands.push(...this.tail);
    this.tail = [];

  }
  
  gainPoints() {
    let totalScore = 0;
    this.lands.forEach((land) => {
      totalScore += land.score * this.multiplyScore;
    });
    this.score += totalScore;
  }

  getOwnPercentageOfMap() {
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

    this.lands.forEach((square) => {
      square.playerId = 0;
      square.hasTail = false;
      square.color = "#111";
    });


    this.tail.forEach((square) => {
      square.hasTail = false;
      square.color = "#111";
      square.playerId = 0;
    });
   
    this.lands = [];
    this.tail = [];
    this.score = 0;
    this.direction = Direction.None;
    this.speed = 0.20;
    this.moving = false;
    this.moveQueue = [];
   
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
              tile.hasTail = false;
              tile.color = "#111";
              tile.playerId = 0;
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
    const territory = this.getOwnPercentageOfMap();
    return {
      nickname: this.user.name,
      color: this.color,
      x: this.x,
      y: this.y,
      psize: this.psize,
      score: this.score,
      dead: this.dead,
      kills: this.kills,
      deaths: this.deaths,
      territory: territory,
      abilities: this.abilitiesBinds,
      bonus: this.activeBonus,
      activeAbility: this.activeAbility,
      slowMultiplier: this.slowMultiplier,
      tileColor: this.tileColor,
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
  Left: { dx: -1, dy: 0},
  None: { dx: 0, dy: 0}
};

const keyToDirection = {
  [Keys.W]: Direction.Up,
  [Keys.S]: Direction.Down,
  [Keys.A]: Direction.Left,
  [Keys.D]: Direction.Right,
};