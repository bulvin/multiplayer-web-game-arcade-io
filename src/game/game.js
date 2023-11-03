import {Player} from "./player.js";
import {Ability} from "./ability.js";
import {Bonus} from "./bonus.js";

export class Game {
    constructor(id, gameMap){
        this.id = id;
        this.map = gameMap;
        this.gameTimer = 5000 * 60;
        this.gameOver = false;
        this.abilitySpawnInterval = 30 * 1000;
        this.lastAbilitySpawnTimer = 0;
        this.bonusSpawnInterval = 30 * 1000;
        this.lastBonusSpawnTimer = 0;
        this.abilities = [];
        this.bonuses = [];
        this.players = {};
        this.sockets = {};

        this.init();
    }
    update(deltaTime) {
     
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
                const socket = this.sockets[id];
                player.update(deltaTime);
                if (player.dead) {
                    socket.emit('deadMessage', { player: player.id, messages: this.deadMessage(player.deadInterval, player.deadTimer) } );
                }

            }

        } else{
            this.gameOver = true;
        }
    
    }


    spawnAbility(){
        const abilities = ['Speed', 'Bigger'] ; 
        const randomIndex = Math.floor(Math.random() * abilities.length);
        const randomNames = abilities[randomIndex];
        const duration = 5000;

        const col = this.map.getCol(Math.floor(Math.random() * this.map.width));
        const row = this.map.getRow(Math.floor(Math.random() * this.map.height));


        const ability = new Ability(randomNames, duration, col * this.map.tileSize, row * this.map.tileSize);

        this.abilities.push(ability);

    }
    spawnBonus(){
        const bonuses = ['x2', 'x4', 'x8'] ; 
        const randomIndex = Math.floor(Math.random() * bonuses.length);
        const randomName = bonuses[randomIndex];

        const col = this.map.getCol(Math.floor(Math.random() * this.map.width));
        const row = this.map.getRow(Math.floor(Math.random() * this.map.height));
        
        const duration = 5000 * 2;
        const bonus = new Bonus(col * this.map.tileSize, row * this.map.tileSize, randomName, duration);

        this.bonuses.push(bonus);

    }
    addPlayer(socket, username) {
        this.sockets[socket.id] = socket;

        const player = new Player(socket.id, username, this);
        this.players[socket.id] = player;
        return player;
    }

    deletePlayer(id) {
        const player = this.players[id];
        delete this.sockets[id];
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
    deadMessage(deadInterval, deadTime) {

        let messageDead = 'Wyelimowano cię!';
        let messageTime = `Powrócisz na planszę za: ${Math.ceil((deadInterval * 0.001) - (deadTime * 0.001).toFixed(1))}`;

        return [messageDead, messageTime];
    }
    toJSON() {
        const leaderboard = this.getLeaderboard();

        let backendPlayers = {};
        for (const player of leaderboard) {
            backendPlayers[player.id] = player.toJSON();
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
