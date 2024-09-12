import { SpeedAbility, SlowAbility, SelfImmunityAbility, EnhancedVisionAbility, TeleportAbility } from './ability.js';
import { Bonus } from "./bonus.js";
import { ColorSystem } from "./color.js";

export class Game {
    constructor(id, gameMap, mode, gameTimer) {
        this.id = id;
        this.map = gameMap;
        this.gameTimer = gameTimer;
        this.gameOver = false;
        this.abilitySpawnInterval = 30 * 1000;
        this.lastAbilitySpawnTimer = 0;
        this.bonusSpawnInterval = 30 * 1000;
        this.lastBonusSpawnTimer = 0;
        this.abilities = [];
        this.bonuses = [];
        this.players = {};
        this.colors = new ColorSystem();
        this.mode = mode;
        this.lastFrameTime = performance.now();
    }
    update() {
        const currentFrameTime = performance.now();
        const deltaTime = currentFrameTime - this.lastFrameTime;
        this.lastFrameTime = currentFrameTime;
        if (this.gameTimer >= 0) {
            this.gameTimer -= deltaTime;
            if (this.lastAbilitySpawnTimer > this.abilitySpawnInterval) {
                this.lastAbilitySpawnTimer = 0;
                this.spawnAbility();
            } else {
                this.lastAbilitySpawnTimer += deltaTime;
            }
            if (this.lastBonusSpawnTimer > this.bonusSpawnInterval) {
                this.lastBonusSpawnTimer = 0;
                this.spawnBonus();
            } else {
                this.lastBonusSpawnTimer += deltaTime;
            }
            for (const id in this.players) {
                const player = this.players[id];
                player.update(deltaTime);
                if (player.getCountTiles() === this.map.countTiles() || player.team?.lands.length === this.map.countTiles()) {
                    this.gameOver = true;
                    return;
                } 
                
            }
        } else {
            this.gameOver = true;
        }
    }
    spawnAbility() {
        const allAbilities = [SpeedAbility, SlowAbility, SelfImmunityAbility, EnhancedVisionAbility, TeleportAbility];
    
        for (let i= 0; i < 5; i++) { 
    
            if (this.abilities.length >= 20) {
                return;
            }
    
            const Ability = allAbilities[Math.floor(Math.random() * allAbilities.length)];
            let x, y;
    
            do {
                x = Math.floor(Math.random() * this.map.cols);
                y = Math.floor(Math.random() * this.map.rows);
            } while (this.isOccupied(x, y));
    
            const newAbility = new Ability(x, y);
            this.abilities.push(newAbility);
        }
    }
    
    spawnBonus() {
        const bonuses = ['SCORE_X2', 'SCORE_X4', 'SCORE_X8', 'KILL_X2'];
    
        for (let i = 0; i < 5; i++) {
            if (this.bonuses.length >= 20) {
                return;
            }
    
            const randomIndex = Math.floor(Math.random() * bonuses.length);
            const randomName = bonuses[randomIndex];
            let x, y;
    
            do {
                x = Math.floor(Math.random() * this.map.cols);
                y = Math.floor(Math.random() * this.map.rows);
            } while (this.isOccupied(x, y));
    
            const duration = Math.floor(Math.random() * 5) + 10;
            const bonus = new Bonus(x, y, randomName, duration * 1000);
            this.bonuses.push(bonus);
        }
    }
    addPlayer(player) {

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
    getPlayer(id) {
        return this.players[id];
    }

    init() {
        for (const id in this.players) {
            const player = this.players[id];

            player.initBase();
        }
    }
    getLeaderboard() {
        const leaderboard = [];
    
        for (const id in this.players) {
            const player = this.players[id];
            const score = player.score;
            const territoryPercentage = player.getTerritoryPercentage();
            leaderboard.push({
                name: player.user.name,
                score: score,
                territoryPercentage: territoryPercentage,
            });
        }
       return this.sortLeaderBoard(leaderboard);
    }
    getTeamLeaderboard() {
        const leaderboard = this.teams.map(team => ({
            name: team.name,
            score: team.score,
            territoryPercentage: team.getTerritoryPercentage(this.map),
        }));

        return this.sortLeaderBoard(leaderboard);
    }
    deadMessage(deadInterval, deadTime) {

        let messageDead = 'Wyelimowano cię!';
        let time = (deadInterval * 0.001) - (deadTime * 0.001);
        let messageTime = `Powrócisz na planszę za: ${Math.ceil(time)}`;

        return [messageDead, messageTime];
    }
    isOccupied(x, y) {
        for (let ability of this.abilities) {
            if (ability.x === x && ability.y === y) {
                return true;
            }
        }
    
        for (let bonus of this.bonuses) {
            if (bonus.x === x && bonus.y === y) {
                return true;
            }
        }
    
        return false;
    }
    getEndLeaderboard() {
        const leaderboard = [];
        for (const id in this.players) {
            const player = this.players[id];
            const score = player.score;
            const territoryPercentage = player.getTerritoryPercentage();
            leaderboard.push({
                name: player.user.name,
                score: score,
                territory: territoryPercentage,
                kills: player.kills,
                deaths: player.deaths,
                team: player.team ? player.team.name : ''
            });
        }
        
        return this.sortLeaderBoard(leaderboard);
    }
    sortLeaderBoard(leaderboard) {
        leaderboard.sort((a, b) => {
            if (a.score !== b.score) {
                return b.score - a.score;
            } else if (a.territoryPercentage !== b.territoryPercentage) {
                return b.territoryPercentage - a.territoryPercentage;
            } else if  (a.kills !== b.kills) {
                return b.kills - a.kills;
            } else {
                return a.deaths - b.deaths;
            }
        });
        return leaderboard;
    }

    toJSON(playerId) {
        const backendPlayers = {};
        for (const id in this.players) {
            if (id !== playerId && !this.players[id].dead) {
                backendPlayers[id] = {
                    nickname: this.players[id].user.name,
                    color: this.players[id].color,
                    x: this.players[id].x,
                    y: this.players[id].y,
                };
            }
        }

        const currentState = {
            mode: this.mode,
            map: this.map.toJSON(),
            gameTimer: this.gameTimer,
            abilities: this.abilities.map(ability => ability.toJSON()),
            bonuses: this.bonuses.map(bonus => bonus.toJSON()),
            me: this.players[playerId].toJSON(),
            players: backendPlayers,
            leaderBoard: this.mode !== 'team' ? this.getLeaderboard() : this.getTeamLeaderboard(),
        };
      
        return currentState;
    }

}


