export class Player {

    constructor(id, nickname, game) {

        this.id = id;
        this.nickname = nickname;
        this.game = game;
        this.psize = 32;
        this.x = 0;
        this.y = 0;
        this.speed = 4;
        this.color = `hsl(${360 * Math.random()}, 100%, 50%, 1)`;
        this.lands = [];
        this.tail = [];
        this.input = [];
        this.score = 0;
        this.dead = false;
        this.direction = -1;
        this.multiplyScore = 1;
        this.deadTimer = 0;
        this.deadInterval = 5000;

        this.initBase();

    }

    update(deltaTime) {

        let setlands;

        if (this.dead) {
            this.clear();
            if (this.deadTimer > this.deadInterval) {
                this.dead = false;
                this.direction = -1;
                this.deadTimer = 0;
                this.initBase();
            } else {
                this.deadTimer += deltaTime;
            }
        }
        else {
            this.checkTakeEffects();
            if (Number.isInteger(this.x / this.psize) && Number.isInteger(this.y / this.psize)) {
                let col = this.game.map.getCol(this.x);
                let row = this.game.map.getRow(this.y);
                let land = this.game.map.getTile(row, col);

                if (this.input.length > 0) this.setDirection();
                
               

                 if (this.isHitSelf(land)) {
                    this.dead = true;
                    this.clear();

                } else if (this.HitAnotherPlayer(land)) {
                    const hittedPlayer =  this.game.getPlayer(land.playerId);
                    hittedPlayer.dead = true;
                    hittedPlayer.clear();
                    this.score += 10;
                   
                } 
               
                if (land.playerId !== this.id && !this.dead) {
                    this.addLandToTail(land);
                }
                if (land.type === "land" && this.id === land.playerId && this.tail.length > 0) {
                    for (let i = 0; i < this.lands.length; i++) {
                        this.tail.push(this.lands[i]);
                    }

                    this.tail.sort((a, b) => {
                        return a.y - b.y || a.x - b.x;
                    });

                    this.lands.splice(0);
                    for (let i = 0; i < this.tail.length - 1; i++) {
                        if (this.tail[i].y === this.tail[i + 1].y) {
                            if (this.tail[i + 1].x - this.tail[i].x > this.psize) {
                                let captureLands = Math.floor(Math.abs(this.tail[i].x - this.tail[i + 1].x) / this.psize);

                                for (let j = 1; j <= captureLands - 1; j++) {
                                    let tempLand = this.game.map.getTile(this.game.map.getRow(this.tail[i].y), this.game.map.getCol(this.tail[i].x + this.psize * j));
                                    this.tail.push(tempLand);
                                }
                            }
                        }
                    }

                    setlands = new Set(this.tail);

                    this.lands.push(...setlands);
                    this.lands.forEach(land => {
                        land.playerId = this.id;
                        if (land.type !== "land") {
                            land.type = "land";
                        }
                    });

                    this.gainPoints();
                    this.tail = [];
                }

            }
            if (this.direction === Direction.Up) {
                this.y -= this.speed;
            } else if (this.direction === Direction.Down) {
                this.y += this.speed;
            } else if (this.direction === Direction.Right) {
                this.x += this.speed;
            } else if (this.direction === Direction.Left) {
                this.x -= this.speed;
            }
          

            if(this.isHitInBorders()){
                this.dead = true;
                this.clear();
                
            }


        }


    }

    setDirection() {

        if (this.input.includes(Keys.A)) {

            if (this.direction === Direction.Right)
                this.direction = Direction.Right;
            else
                this.direction = Direction.Left;

        }

        else if (this.input.includes(Keys.D)) {
            if (this.direction === Direction.Left)
                this.direction = Direction.Left
            else
                this.direction = Direction.Right;
        }
        else if (this.input.includes(Keys.W)) {
            if (this.direction === Direction.Down)
                this.direction = Direction.Down;
            else
                this.direction = Direction.Up;
        }
        else if (this.input.includes(Keys.S)) {
            if (this.direction === Direction.Up)
                this.direction = Direction.Up;
            else
                this.direction = Direction.Down;
        }


    }
    addLandToTail(land) {

        land.playerId = this.id;
        land.type = 'tail';
        return this.tail.push(land);
    }

    gainPoints() {
        this.lands.forEach(land => this.score += land.score * this.multiplyScore);

    }
    getOwnPercentageOfMap() {
        const squaresAll = this.game.map.countTiles();
        const percent = (this.lands.length / squaresAll) * 100;

        return percent.toFixed(1);
    }

    isHitSelf(squareTail) {
        if (this.tail.includes(squareTail) && squareTail.x === this.x && squareTail.y === this.y) {
          
            return true;
        }

        return false;
    }
    isHitInBorders(){
        return this.x < -4 || this.x > this.game.map.width - this.psize + 4 || this.y < -4 || this.y > this.game.map.height - this.psize + 4;

    }
    HitAnotherPlayer(tile) {

        if (tile.playerId !== this.id && tile.playerId !== 0 && tile.type === 'tail'){

        
          return true;
        }
      return false;
    }
    clear() {
        this.lands.forEach(square => {
            square.playerId = 0;
        });
        this.tail.forEach(square => {
            square.playerId = 0;
            square.type = 'land';
        })
        this.lands = [];
        this.tail = [];
        this.score = 0;
        this.direction = -1;
        this.speed = 4;


    }
    spawn() {
        const spawnBorder = Math.floor(Math.random() * 4);
        let spawnRow, spawnCol;

        const borderBuffer = 1;

        if (spawnBorder === 0) {
            spawnRow = borderBuffer;
            spawnCol = Math.floor(Math.random() * (this.game.map.cols - 12 + borderBuffer)) + 6;

        } else if (spawnBorder === 1) {
            spawnRow = Math.floor(Math.random() * (this.game.map.rows - 12 + borderBuffer)) + 6;
            spawnCol = this.game.map.cols - 1 - borderBuffer;

        } else if (spawnBorder === 2) {
            spawnRow = this.game.map.rows - 1 - borderBuffer;
            spawnCol = Math.floor(Math.random() * (this.game.map.cols - 12 + borderBuffer)) + 6;

        } else {
            spawnRow = Math.floor(Math.random() * (this.game.map.rows - 12 + borderBuffer)) + 6;
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

         
            const distance = Math.hypot(abilityPosition.x - this.x, abilityPosition.y - this.y);
            const abilityRadius = Math.PI * 2;

            const collisionThreshold = this.psize + 2 + abilityRadius;
            if (distance <= collisionThreshold) {
                this.applyAbilityEffect(ability);
                abilities.splice(index, 1);
            }
        });

        bonuses.forEach((bonus, index) => {
            const bonusPosition = bonus.position;

            const distance = Math.hypot(bonusPosition.x - this.x, bonusPosition.y - this.y);
            const bonusRadius = Math.PI * 2;

            const collisionThreshold =  this.psize + 2 + bonusRadius;
            if (distance <= collisionThreshold) {
                this.applyBonusEffect(bonus);
                bonuses.splice(index, 1);
            }
        });

    }
    applyAbilityEffect(ability) {

        if (ability.name === "Speed") {
            this.speed = 8;

        }
    }
    applyBonusEffect(bonus) {
        if (bonus.name === 'x2') {
            this.multiplyScore = 2;
        } else if (bonus.name === 'x4') {
            this.multiplyScore = 4;
        } else if (bonus.name === 'x8') {
            this.multiplyScore = 8;
        }
    }
    initBase() {
        this.spawn();
        const spawnRow = this.game.map.getRow(this.y);
        const spawnCol = this.game.map.getCol(this.x);


        for (let row = -1; row < 2; row++) {
            for (let col = -1; col < 2; col++) {
                const newRow = spawnRow + row;
                const newCol = spawnCol + col

                if (newRow >= 0 && newRow < this.game.map.rows && newCol >= 0 && newCol < this.game.map.cols) {
                    const spawnLand = this.game.map.getTile(newRow, newCol);
                    spawnLand.playerId = this.id;
                    this.lands.push(spawnLand);
                }
            }
        }
    }
    setInput(input) {
        this.input = input;
    }
    toJSON() {
        return {
            nickname: this.nickname,
            color: this.color,
            x: this.x,
            y: this.y,
            speed: this.speed,
            dead: this.dead,
            direction: this.direction,
            score: this.score,
            lands: this.lands,
            tail: this.tail,
            deadTimer: this.deadTimer,
            deadInterval: this.deadInterval

        };
    }
}

const Keys = {
    W: 'w',
    S: 's',
    A: 'a',
    D: 'd'
}

const Direction = {
    Up: 0,
    Down: 1,
    Right: 2,
    Left: 3
}