import {Player} from "./player.js";
import {Ability} from "./ability.js";
import {Bonus} from "./bonus.js";
import { ColorSystem } from "./color.js";
export class Game {
    constructor(id, gameMap){
        this.id = id;
        this.map = gameMap;
        this.gameTimer = 5000 * 60;
        this.gameOver = false;
        this.abilitySpawnInterval = 1000;
        this.lastAbilitySpawnTimer = 0;
        this.bonusSpawnInterval = 30 * 1000;
        this.lastBonusSpawnTimer = 0;
        this.abilities = [];
        this.bonuses = [];
        this.players = {};
        this.colors = new ColorSystem();
        this.lastFrameTime = performance.now();

    }
    update() {
        const currentFrameTime = performance.now();
        const deltaTime = currentFrameTime - this.lastFrameTime;
        this.lastFrameTime = currentFrameTime;

        if (this.gameTimer >= 0){
       
            this.gameTimer -= deltaTime

            if (this.lastAbilitySpawnTimer > this.abilitySpawnInterval){
                this.lastAbilitySpawnTimer = 0;
                this.spawnAbility();
            } else {
                this.lastAbilitySpawnTimer += deltaTime;
            }

            if (this.lastBonusSpawnTimer > this.bonusSpawnInterval){
                this.lastBonusSpawnTimer = 0;
                this.spawnBonus();
            } else {
                this.lastBonusSpawnTimer += deltaTime;
            }

            for (const id in this.players){
                const player = this.players[id];
                // const socket = this.sockets[id];
                const socket = player.user.socket;
                player.update(deltaTime);
           
                for (const otherId in this.players) {
                    if (id !== otherId) {
                        const otherPlayer = this.players[otherId];
                        player.isSomeoneHitsMe(otherPlayer);
                      
                    }

                }
                
                if (player.dead) {
                   let messages = this.deadMessage(player.deadInterval, player.deadTimer);
                   socket.emit('deadMessage', { messages: messages } );
                }

            }

        } else{
            this.gameOver = true;
        }
        
    }


    spawnAbility(){
        const abilities = ['Prędkość','Spowolnienie', 'Powrót', 'noHitSelf'] ; 
        const randomIndex = Math.floor(Math.random() * abilities.length);
        const randomNames = abilities[randomIndex];
        const duration = 5000;

        const col = Math.floor(Math.random() * this.map.cols);
        const row = Math.floor(Math.random() * this.map.rows);
        const tile = this.map.getTile(row, col);

        const ability = new Ability(randomNames, duration, tile.x, tile.y);
        
        this.abilities.push(ability);
      

    }
    spawnBonus(){
        const bonuses = ['x2', 'x4', 'x8']; 
        const randomIndex = Math.floor(Math.random() * bonuses.length);
        const randomName = bonuses[randomIndex];

        const col = Math.floor(Math.random() * this.map.cols);
        const row = Math.floor(Math.random() * this.map.rows);
        const tile = this.map.getTile(row, col);
        
        const duration = 5000 * 2;
        const bonus = new Bonus(tile.x , tile.y, randomName, duration);

        this.bonuses.push(bonus)

    }
    addPlayer(player) {
        // this.sockets[socket.id] = socket;

        this.players[player.user.id] = player;
        return player;
    }

    deletePlayer(id) {
        const player = this.players[id];
        if (player) {
            player.clear();
        }
        delete this.players[id];
        return player;
    }
    getPlayer(id){
       return this.players[id];
    }

    init() {
       for (const id in this.players){
            const player = this.players[id];
       
            player.initBase();
       }
    }
    getLeaderboard() {
       return Object.values(this.players).sort((a, b) => {
            return b.score - a.score;
        });
    }
    getLeaderboardPosition(search) {
        const leaderboard = this.getLeaderboard();
        const playerIndex = leaderboard.findIndex(player => player === search);
        return playerIndex === -1 ? "Brak" : playerIndex + 1;
    }
    deadMessage(deadInterval, deadTime) {

        let messageDead = 'Wyelimowano cię!';
        let messageTime = `Powrócisz na planszę za: ${Math.ceil((deadInterval * 0.001) - (deadTime * 0.001).toFixed(1))}`;

        return [messageDead, messageTime];
    }
    toJSON() {
       
        let backendPlayers = {};
        for (const id in this.players) {
            backendPlayers[id] = this.players[id].toJSON();
        }
        return {
            id: this.id,
            map: this.map,
            gameTimer: this.gameTimer,
            abilities: this.abilities,
            bonuses: this.bonuses,
            gameOver: this.gameOver,
            players: backendPlayers,
        };
    }

   
}
   

