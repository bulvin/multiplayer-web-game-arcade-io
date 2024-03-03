import { addLostTile, startFillEnclosedArea } from "../utils/enclosedArea.js";
import { Direction, Keys, SPAWN_SIZE } from "../constants/gameConfig.js";


export class Player {
  constructor(user, game, color, spawn, team) {
    this.user = user;
    this.game = game;
    this.psize = 32;
    this.x = spawn.x;
    this.y = spawn.y;
    this.speed = 10;
    this.color = color.playerColor;
    this.tailColor = color.tailColor;
    this.lands = [];
    this.tail = [];
    this.score = 0;
    this.dead = false;
    this.direction = Direction.NONE;
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
    this.hasArrived = true;
    this.noHitSelf = false;
    this.visionScale = 1;
    this.killMultiplier = 1;
    this.team = team;
    this.area = {
      minX: this.x - Math.floor(SPAWN_SIZE * 0.5),
      maxX: this.x + Math.floor(SPAWN_SIZE * 0.5),
      minY: this.y - Math.floor(SPAWN_SIZE * 0.5),
      maxY: this.y + Math.floor(SPAWN_SIZE * 0.5)
    }

  }

  update(deltaTime) {
    if (this.dead) {
      this.handleDeadState(deltaTime);
      return;
    }

    this.checkTakeEffects();

    if (this.activeAbility) {
      this.activeAbility.update(this, deltaTime);
    }

    if (this.activeBonus) {
      this.activeBonus.duration -= deltaTime;

      if (this.activeBonus.duration <= 0) {
        this.resetBonusEffect();
      }
    }

    if (this.hasArrived && this.moveQueue.length > 0) {
      const newDir = this.moveQueue.shift();
      this.setDirection(newDir);
    }
    this.move(deltaTime);

    if (this.isHitInBorders()) {
      this.die();
      return;
    }

    if (this.hasArrived) {
      const land = this.game.map.getTile(this.y, this.x);
      this.updateAreaPositions();
      if (this.isHitSelf(land)) {
        this.die();
        return;
      } else if (this.isHitOther(land)) {
        const otherPlayer = Object.values(this.game.players).find(player => player.user.id === land.tailOwner);
        if (otherPlayer) {
          this.kill(otherPlayer, land);
        }
      } else if (land.color !== this.color && !land.hasTail) {
        this.addLandToTail(land);
      } else if (this.color === land.color && this.tail.length > 0) {
        this.takeArea();

        this.tail = [];
      }
    }
  }



  move(deltaTime) {
    if (this.hasArrived) {
      this.hasArrived = false;
      this.targetX = this.x + this.direction.dx;
      this.targetY = this.y + this.direction.dy;
    }
    const dt = (deltaTime / 1000);
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
      this.hasArrived = true;
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

      } else if (key === Keys.E || key === Keys.R || key === Keys.T) {
        this.useAbility(key);
      }
    }


  }
  handleDeadState(deltaTime) {
    if (this.deadTimer > this.deadInterval) {
      this.respawn();
    } else {
      if (this.activeAbility) {
        this.activeAbility.update(this, deltaTime);
      }
      this.deadTimer += deltaTime;
    }
  }

  addLandToTail(land) {
    this.game.map.setTile({ x: land.x, y: land.y, playerId: land.playerId, color: this.tailColor, oldColor: land.color, hasTail: true, tailOwner: this.user.id });
    return this.tail.push(land);
  }
  takeArea() {

    const lostTiles = this.fillArea();

    for (let [playerId, tiles] of lostTiles) {
      const player = this.game.players[playerId];
      player.removeTilesFromTerritory(tiles);
    }


  }

  fillArea() {
    const minX = this.area.minX;
    const maxX = this.area.maxX;
    const minY = this.area.minY;
    const maxY = this.area.maxY;

    const lostTiles = new Map();

    const width = maxX - minX + 2;
    const height = maxY - minY + 2;

    const helpTiles = new Map();

    for (let i = 0; i < height + 1; i++) {
      for (let j = 0; j < width + 1; j++) {
        helpTiles.set(`${i},${j}`, 0);
      }
    }

    let tile;
    for (let i = 1; i < height; i++) {
      for (let j = 1; j < width; j++) {
        tile = this.game.map.getTile(minY + i - 1, minX + j - 1);
        helpTiles.set(`${i},${j}`, tile.color);
      }
    }
    const color = { playerColor: this.color, tailColor: this.tailColor }
    startFillEnclosedArea(helpTiles, 0, 0, color);

    for (let i = 1; i < height; i++) {
      for (let j = 1; j < width; j++) {
        let tile = this.game.map.getTile(minY + i - 1, minX + j - 1);
        if (tile.color === this.color && !tile.hasTail) {
          helpTiles.set(`${i},${j}`, -1);
        }
      }
    }

    let scoreFromNewTiles = 0;
    for (let [key, value] of helpTiles) {

      if (value !== -1) {

        const [i, j] = key.split(",").map(Number);
        tile = this.game.map.getTile(minY + i - 1, minX + j - 1);

        addLostTile(lostTiles, tile.playerId, tile);

        this.game.map.setTile({ x: tile.x, y: tile.y, playerId: this.user.id, color: this.color, hasTail: false, tailOwner: 0 });
        this.lands.push(tile);
        if (this.team) {
          this.team.lands.push(tile);
        }
        scoreFromNewTiles += tile.score;
      }
    }
    this.addScore(scoreFromNewTiles, this.multiplyScore);

    return lostTiles;
  }

  updateAreaPositions() {
    if (this.x > this.area.maxX) {
      this.area.maxX = this.x;
    } else if (this.x < this.area.minX) {
      this.area.minX = this.x;
    }
    if (this.y > this.area.maxY) {
      this.area.maxY = this.y;
    } else if (this.y < this.area.minY) {
      this.area.minY = this.y;
    }
  }


  addScore(score, multiplier) {
    this.score += score * multiplier;
    if (this.team) {
      this.team.score += score * multiplier;

    }
  }
  decreaseScore(score) {
    this.score -= score;
    if (this.team) {
      this.team.score -= score;
    }
    if (this.score <= 0) {
      this.score = 0;
    }
    if (this.team && this.team.score <= 0) {
      this.team.score = 0;
    }
  }
  kill(player, land) {
    player.die();

    if (!this.team || this.team !== player.team) {
      this.kills += 1;
      this.addScore(100, this.killMultiplier);
    } else {
      this.decreaseScore(200);
    }

    this.addLandToTail(land);
  }
  die() {
    this.dead = true;
    this.deaths++;
    this.clear();
  }
  removeTilesFromTerritory(tiles) {
    this.lands = this.lands.filter(land => {
      if (tiles.includes(land)) {
        this.decreaseScore(land.score);
        return false;
      }
      return true;
    })
    if (this.team) {
      this.team.lands = this.team.lands.filter(land => {
        if (tiles.includes(land)) {
          this.decreaseScore(land.score);
          return false;
        }
        return true;
      })
    }
  }

  getTerritoryPercentage() {
    const squaresAll = this.game.map.countTiles();
    const percent = (this.lands.length / squaresAll) * 100;

    return percent.toFixed(2);
  }
  isHitSelf(land) {
    if (this.noHitSelf) {
      return false;
    }
    if (land.tailOwner === this.user.id) {
      return true;
    }
    return false;
  }
  isHitOther(land) {

    return land.hasTail && land.tailOwner !== this.user.id;
  }

  isHitInBorders() {
    return (
      this.x < 0 ||
      this.x >= this.game.map.cols ||
      this.y < 0 ||
      this.y >= this.game.map.rows
    );
  }

  respawn() {
    this.dead = false;
    this.deadTimer = 0;
    this.moveQueue = [];
    const spawnTile = this.game.map.spawn();
    this.x = spawnTile.x;
    this.y = spawnTile.y;
    this.initBase();
  }

  clear() {
    if (!this.team) {
      this.lands.forEach((tile) => {
        if (tile.hasTail) {
          this.game.map.setTile({ x: tile.x, y: tile.y, playerId: 0, color: tile.color, hasTail: true, tailOwner: tile.tailOwner });
        } else {
          this.game.map.setTile({ x: tile.x, y: tile.y, playerId: 0, color: '#111', hasTail: false, tailOwner: 0 });
        }
      });
    }
    this.tail.forEach((tile) => {
      if (tile.playerId !== 0) {
        this.game.map.setTile({ x: tile.x, y: tile.y, playerId: tile.playerId, color: tile.oldColor, hasTail: false, tailOwner: 0 });
      } else {
        this.game.map.setTile({ x: tile.x, y: tile.y, playerId: 0, color: '#111', hasTail: false, tailOwner: 0 });
      }
    });

    this.game.map.releaseSpawn(this.user.id);

    if (!this.team) {
      this.lands = [];
    }
    this.tail = [];
    if (!this.team) {
      this.score = 0;
    } else {
      this.decreaseScore(200);
    }
    this.direction = Direction.NONE;
    this.speed = 10;
    this.hasArrived = true;
    this.moveQueue = [];
    if (this.activeBonus) {
      this.resetBonusEffect();
    }

  }

  checkTakeEffects() {
    const abilities = this.game.abilities;
    const bonuses = this.game.bonuses;

    abilities.forEach((ability, index) => {
      const abilityPosition = ability.position;
      const distance = this.calculateDistance(this.x, this.y, abilityPosition.x, abilityPosition.y);

      if (distance <= 0) {
        this.applyAbilityEffect(ability);
        abilities.splice(index, 1);
      }
    });

    bonuses.forEach((bonus, index) => {
      const bonusPosition = bonus.position;
      const distance = this.calculateDistance(this.x, this.y, bonusPosition.x, bonusPosition.y);

      if (distance <= 1) {
        this.applyBonusEffect(bonus);
        bonuses.splice(index, 1);
      }
    });
  }
  applyAbilityEffect(ability) {
    if (!this.abilitiesBinds[Keys.E]) {
      this.abilitiesBinds[Keys.E] = ability;
    } else if (!this.abilitiesBinds[Keys.R]) {
      this.abilitiesBinds[Keys.R] = ability;
    } else if (!this.abilitiesBinds[Keys.T]) {
      this.abilitiesBinds[Keys.T] = ability;
    }

  }
  useAbility(abilityKey) {
    if (!this.activeAbility) {
      const ability = this.abilitiesBinds[abilityKey];
      if (ability) {
        ability.use(this);
        this.activeAbility = ability;

      }
    }
  }


  applyBonusEffect(bonus) {
    if (bonus.name === "SCORE_X2") {
      this.multiplyScore = 2;
    } else if (bonus.name === "SCORE_X4") {
      this.multiplyScore = 4;
    } else if (bonus.name === "SCORE_X8") {
      this.multiplyScore = 8;
    } else if (bonus.name === "KILL_X2") {
      this.killMultiplier = 2;
    }
    this.activeBonus = bonus;

  }
  resetBonusEffect() {
    if (
      this.activeBonus.name === "SCORE_X2" ||
      this.activeBonus.name === "SCORE_X4" ||
      this.activeBonus.name === "SCORE_X8"
    ) {
      this.multiplyScore = 1;
    } else if (this.activeBonus.name === "KILL_X2") {
      this.killMultiplier = 1;
    }
    this.activeBonus = null;
  }
  initBase() {
    const halfSpawnSize = Math.floor(SPAWN_SIZE * 0.5);
    for (let row = -halfSpawnSize; row <= halfSpawnSize; row++) {
      for (let col = -halfSpawnSize; col <= halfSpawnSize; col++) {
        const newRow = this.y + row;
        const newCol = this.x + col;

        const spawnLand = this.game.map.getTile(newRow, newCol);
        spawnLand.playerId = this.user.id;
        spawnLand.color = this.color;
        this.lands.push(spawnLand);
        this.game.map.updatedTiles.push(spawnLand);
        this.game.map.occupiedSpawns.push(spawnLand);
        if (this.team) {
          this.team.lands.push(spawnLand);
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
    const bonus = {
      name: this.activeBonus ? this.activeBonus.name : '',
      duration: this.activeBonus ? this.activeBonus.duration : ''
    }
    const ability = {
      name: this.activeAbility ? this.activeAbility.name : '',
      duration: this.activeAbility ? this.activeAbility.duration : ''
    }
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
      activeBonus: bonus,
      activeAbility: ability,
      tileSize: this.psize,
      dead: this.dead
    };
  }

}

const keyToDirection = {
  [Keys.W]: Direction.UP,
  [Keys.S]: Direction.DOWN,
  [Keys.A]: Direction.LEFT,
  [Keys.D]: Direction.RIGHT,
};
