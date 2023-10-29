import { GameMap } from "./gameMap.js";
import { Camera } from "./camera.js";
import { canvas } from "./animate.js"
import { Player } from "./player.js";
import { lerp } from "./animate.js";
import { Ability } from "./ability.js"
import { Bonus } from "./bonus.js";

export class Game {
    constructor({ id, map, gameTimer }) {

        this.id = id;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.map = new GameMap(map);
        this.camera = new Camera(this);
        this.players = {};
        this.gameTimer = gameTimer;
        this.gameOver = false;
        this.abilities = [];
        this.bonuses = [];

    }
    update(gameData) {
        this.map.tiles = gameData.map.tiles;
        this.gameTimer = gameData.gameTimer;
        this.gameOver = gameData.gameOver;



        for (const playerID in this.players) {
            if (!gameData.players[playerID]) {
                delete this.players[playerID];
            }
        }

        for (const playerId in gameData.players) {
            const backendPlayer = gameData.players[playerId];

            if (this.players[playerId]) {
                const clientPlayer = this.players[playerId];
                clientPlayer.direction = backendPlayer.direction;
                clientPlayer.dead = backendPlayer.dead;
                clientPlayer.deadTimer = backendPlayer.deadTimer;
                clientPlayer.lands = backendPlayer.lands;
                clientPlayer.tail = backendPlayer.tail;
                clientPlayer.score = backendPlayer.score;
                clientPlayer.speed = backendPlayer.speed;
                clientPlayer.direction = backendPlayer.direction;

                clientPlayer.target.x = backendPlayer.x;
                clientPlayer.target.y = backendPlayer.y;

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


    }
    draw() {

        this.map.drawTiles(this.context, this.canvas, this.camera, this.players);
        this.map.drawGrid(this.context, this.canvas, this.camera);

        for (const id in this.players) {
            const player = this.players[id]
            if (player.dead === false) {

                player.x = lerp(player.x, player.target.x, 0.5);
                player.y = lerp(player.y, player.target.y, 0.5);

                player.draw();

            }
            player.ui.draw();
        }

        
            for (const i in this.abilities) {
                const ability = this.abilities[i];
                ability.draw();
            }
        
         
            for (const i in this.bonuses) {
                const bonus = this.bonuses[i];
                bonus.draw();
            }
        



        //  this.ui.draw();
    }
    addPLayer(player, id) {
        const frontendPlayer = new Player({
            nickname: player.nickname,
            color: player.color,
            x: player.x,
            y: player.y,
            speed: player.speed,
            direction: player.direction,
            lands: player.lands,
            tail: player.tail,
            score: player.score,
            dead: player.dead,
            deadTimer: player.deadTimer,
            deadInterval: player.deadInterval
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

        const frontendAbility = new Ability(this, name, abilityInfo.duration, position.x, position.y);
        this.abilities.push(frontendAbility);

    }
    _receiveBonusUpdate(bonusInfo) {
        const { name: bonusName, position: bonusPosition } = bonusInfo;

        const frontendBonus = new Bonus(this, bonusName, bonusInfo.duration, bonusPosition.x, bonusPosition.y);
        this.bonuses.push(frontendBonus);

    }


}