import { GameMap } from "./gameMap.js";
import { Camera } from "./camera.js";
import { canvas } from "./animate.js"
import { Player } from "./player.js";
import { Ability } from "./ability.js"
import { Bonus } from "./bonus.js";
import { animate } from "./animate.js";
import { InputHandler } from "./input.js";
import { UI } from "./ui.js";


export class Game {
    constructor({ id, map, gameTimer, me, leaderBoard}) {

        this.id = id;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.map = new GameMap(this, map);
        this.me = new Player({
            nickname: me.nickname,
            color: me.color,
            x: me.x,
            y: me.y,
        }, this);

        this.camera = new Camera(this);
        this.ui = new UI(this);
        this.inputHandler = new InputHandler();

        this.players = {};
        this.leaderBoard = leaderBoard;
        this.gameTimer = gameTimer;
        this.gameOver = false;  
        this.abilities = [];
        this.bonuses = [];
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        window.addEventListener("resize", this.resizeCanvas.bind(this));
        this.canvas.addEventListener("wheel", (event) => event.preventDefault());

        animate(0);
        console.log(this.me);
        console.log(this.players);

    }
    update(gameData) {
        this.map.update(gameData.map);
        for (const playerID in this.players) {
            if (!gameData.players[playerID]) {
                delete this.players[playerID];
            }
        }
        const backendPlayer = gameData.me;
        if (backendPlayer) {
           
            this.me.updatePosition(backendPlayer.x, backendPlayer.y);
    
            this.me.score = backendPlayer.score;
            this.me.kills = backendPlayer.kills;
            this.me.deaths = backendPlayer.deaths;
            this.gameTimer = gameData.gameTimer;
            this.gameOver = gameData.gameOver;
            this.me.territory = backendPlayer.territory; 
            this.me.dead = backendPlayer.dead;
        }
       
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
        if(this.me) {
            this.map.drawTiles();
            this.map.drawGrid();
            if(!this.me.dead) {
             
                this.me.move();
                this.me.draw();
            }
        
            for (const id in this.players) {
                const player = this.players[id]
            
                    player.move();
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
        const { name, position } = abilityInfo;
        const frontendAbility = new Ability(this, name, abilityInfo.duration, position.x * 32, position.y * 32);
        this.abilities.push(frontendAbility);

    }
    _receiveBonusUpdate(bonusInfo) {
        const { name: bonusName, position: bonusPosition } = bonusInfo;

        const frontendBonus = new Bonus(this, bonusName, bonusInfo.duration, bonusPosition.x * 32, bonusPosition.y * 32);
        this.bonuses.push(frontendBonus);

    }
    resizeCanvas() {

        const devicePixelRatio = window.devicePixelRatio || 1;
        const newWidth = window.innerWidth * devicePixelRatio;
        const newHeight = window.innerHeight * devicePixelRatio;

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;

        this.ctx.scale(devicePixelRatio, devicePixelRatio);

        this.camera.setViewport(newWidth, newHeight);
    }


}