import { GameMap } from "./gameMap.js";
import { Camera } from "./camera.js";
import { Player } from "./player.js";
import { Ability } from "./ability.js"
import { Bonus } from "./bonus.js";
import { InputHandler } from "./input.js";
import { UI } from "./ui.js";
import { debounce } from "throttle-debounce";

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
        this.me.dead = me.dead;
        this.me.score = me.score;
        this.me.kills = me.kills;
        this.me.territory = me.territory;
        this.me.deaths = me.deaths;

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
      
        window.addEventListener("resize", debounce(40, this.resizeCanvas.bind(this)));
        this.canvas.addEventListener("wheel", (event) => event.preventDefault());

        this.lastTime = 0;
        this.animateId = requestAnimationFrame(this.animate.bind(this));
    
    }
    update(gameData) {
       
        this.gameTimer = gameData.gameTimer;
        this.map.update(gameData.map);
        this.me.update(gameData.me);

        for (const playerId in gameData.players) {
            const backendPlayer = gameData.players[playerId];

            if (this.players[playerId]) {
                const clientPlayer = this.players[playerId];
                clientPlayer.updatePosition(backendPlayer.x, backendPlayer.y);
            } else {
                this.players[playerId] = this.addPLayer(backendPlayer, playerId);
            }
        }

        for (const playerId in this.players) {
            if (!gameData.players[playerId]) {
                delete this.players[playerId];
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
        Object.values(this.players).forEach(player => player.draw());
        this.abilities.forEach(ability => ability.draw());
        this.bonuses.forEach(bonus => bonus.draw());
        this.ui.draw();
        
    }
    animate() {
    
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.me.dead) {
            this.me.move();
        }
        for (const id in this.players) {
            const player = this.players[id]
            player.move();
        }
        this.camera.update();
        this.draw();

        requestAnimationFrame(this.animate.bind(this));
    }
    stopAnimate() {
        this.inputHandler.stopCapturingInput();
        cancelAnimationFrame(this.animationId);
    }
    lerp(start, end, t) {
        return start + (end - start) * t;
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
        const frontendAbility = new Ability(this, name, x * this.map.tileSize, y * this.map.tileSize);
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

        this.devicePixelRatio = window.devicePixelRatio || 1;

        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;

        this.canvas.width = newWidth * this.devicePixelRatio;
        this.canvas.height = newHeight * this.devicePixelRatio;

        this.camera.setViewport(newWidth, newHeight);
        this.camera.update();  
    }
}
