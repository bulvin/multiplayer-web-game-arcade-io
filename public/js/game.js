import { GameMap } from "./gameMap.js";
import { Camera } from "./camera.js";
import { Player } from "./player.js";
import { Ability } from "./ability.js"
import { Bonus } from "./bonus.js";
import { InputHandler } from "./input.js";
import { UI } from "./ui.js";


export class Game {
    constructor({ mode, map, gameTimer, me, leaderBoard }) {
        this.canvas = document.getElementById("game-map");
        this.ctx = this.canvas.getContext('2d');
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.ctx.scale(this.devicePixelRatio || 1, this.devicePixelRatio || 1);
        this.canvas.width = window.innerWidth 
        this.canvas.height = window.innerHeight;

        this.mode = mode;
        this.me = new Player({
            nickname: me.nickname,
            color: me.color,
            x: me.x,
            y: me.y,
        }, this);
        this.map = new GameMap(this, map);
        this.camera = new Camera(this);
        this.ui = new UI(this);
        this.inputHandler = new InputHandler();

        this.players = {};
        this.leaderBoard = leaderBoard;
        this.gameTimer = gameTimer;
        this.gameOver = false;
        this.abilities = [];
        this.bonuses = [];

        window.addEventListener("resize", this.resizeCanvas.bind(this));
        this.canvas.addEventListener("wheel", (event) => event.preventDefault());
        
        
        this.animate();


    }
    update(gameData) {
      
        for (const playerID in this.players) {
            if (!gameData.players[playerID]) {
                delete this.players[playerID];
            }
        }
        const backendPlayer = gameData.me;
     
            this.gameTimer = gameData.gameTimer;
            this.map.update(gameData.map);
            this.me.update(backendPlayer);
        
        
        for (const playerId in gameData.players) {
            const backendPlayer = gameData.players[playerId];

            if (this.players[playerId]) {
                const clientPlayer = this.players[playerId];
                clientPlayer.updatePosition(backendPlayer.x, backendPlayer.y);
            } else {
                this.players[playerId] = this.addPLayer(backendPlayer, playerId);
            }
        }

        this.abilities = [];
        for (const abilityInfo of gameData.abilities) {
            this._receiveAbilityUpdate(abilityInfo);

        }

        this.bonuses = [];
        for (const bonusInfo of gameData.bonuses) {
            this._receiveBonusUpdate(bonusInfo);

        }

        this.leaderBoard = gameData.leaderBoard;

    }
    draw() {
        this.map.drawTiles();
        this.map.drawGrid();

        if (!this.me.dead) {
            this.me.draw();
        }
        for (const id in this.players) {
            const player = this.players[id]
            player.draw();
        }
      
        for (const i in this.abilities) {
            const ability = this.abilities[i];
            ability.draw();
        }

        for (const i in this.bonuses) {
            const bonus = this.bonuses[i];
            bonus.draw();
        }
        this.ui.draw();

    }
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.me.dead){
            this.me.move();
        }
        for (const id in this.players) {
            const player = this.players[id]
            player.move();
        }
        this.camera.update();
        this.draw();
    }
    stopAnimate() {
        this.inputHandler.stopCapturingInput();
        cancelAnimationFrame(this.animationId);
    }
    lerp(start, end, lerpFactor) {
        return start + (end - start) * lerpFactor;
    }

    addPLayer(player, id) {

        const frontendPlayer = new Player({
            nickname: player.nickname,
            color: player.color,
            x: player.x,
            y: player.y,

        }, this);

        this.players[id] = frontendPlayer;
        return frontendPlayer;
    }
    deletePlayer(id) {
        delete this.players[id];
    }
    getPlayer(id) {
        return this.players[id];
    }
    _receiveAbilityUpdate(abilityInfo) {
        const { name, x, y } = abilityInfo;
        const frontendAbility = new Ability(this, name, abilityInfo.duration, x * this.map.tileSize, y * this.map.tileSize);
        this.abilities.push(frontendAbility);

    }
    _receiveBonusUpdate(bonusInfo) {
        const { name, x, y } = bonusInfo;

        const frontendBonus = new Bonus(this, name, x * this.map.tileSize, y * this.map.tileSize);
        this.bonuses.push(frontendBonus);

    }
    resizeCanvas() {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        const devicePixelRatio = window.devicePixelRatio || 1;

        const originalWidth = this.canvas.width;
        const originalHeight = this.canvas.height;

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;

        this.ctx.scale(devicePixelRatio, devicePixelRatio);


        this.camera.setViewport(
            (this.camera.viewportWidth / originalWidth) * newWidth,
            (this.camera.viewportHeight / originalHeight) * newHeight
        );
    }
}
