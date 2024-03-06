import { SpeedAbility, SlowAbility, SelfImmunityAbility, EnhancedVisionAbility, TeleportAbility } from './ability.js';
import { Bonus } from "./bonus.js";
import { ColorSystem } from "./color.js";
export class Game {
    constructor(id, gameMap, mode, gameTimer) {
        this.id = id;
        this.map = gameMap;
        this.gameTimer = gameTimer;
        this.gameOver = false;
        this.abilitySpawnInterval =  30 * 1000;
        this.lastAbilitySpawnTimer = 0;
        this.bonusSpawnInterval =  30 * 1000;
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
               
                if (player.getCountTiles() === this.map.countTiles())  this.gameOver = true;

            }

        } else {
            this.gameOver = true;
        }

    }


    spawnAbility() {
        const allAbilities = [SpeedAbility, SlowAbility, SelfImmunityAbility, EnhancedVisionAbility, TeleportAbility];
       
        for (let i = 0; i < 5; i++) {

            const Ability = allAbilities[Math.floor(Math.random() * allAbilities.length)];
            const x = Math.floor(Math.random() * this.map.cols);
            const y = Math.floor(Math.random() * this.map.rows);

            const newAbility = new Ability(x, y);


            this.abilities.push(newAbility);
        }

    }
    spawnBonus() {
        const bonuses = ['SCORE_X2', 'SCORE_X4', 'SCORE_X8', 'KILL_X2'];
    
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * bonuses.length);
            const randomName = bonuses[randomIndex];
    
            const col = Math.floor(Math.random() * this.map.cols);
            const row = Math.floor(Math.random() * this.map.rows);
            const tile = this.map.getTile(row, col);
    
            const duration = Math.floor(Math.random() * 5) + 10;
            const bonus = new Bonus(tile.x, tile.y, randomName, duration * 1000);
    
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
        leaderboard.sort((a, b) => b.score - a.score);
        return leaderboard;
    }
    getTeamLeaderboard() {
        const leaderboard = this.teams.map(team => ({
            name: team.name,
            score: team.score,
            territoryPercentage: team.getTerritoryPercentage(this.map),
        }));

        leaderboard.sort((a, b) => b.score - a.score);

        return leaderboard;
    }
    deadMessage(deadInterval, deadTime) {

        let messageDead = 'Wyelimowano cię!';
        let messageTime = `Powrócisz na planszę za: ${Math.ceil((deadInterval * 0.001) - (deadTime * 0.001).toFixed(1))}`;

        return [messageDead, messageTime];
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
        leaderboard.sort((a, b) => b.score - a.score);
        return leaderboard;
    }
    toJSON(playerId) { 
        const me = this.players[playerId].toJSON();
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

        const map = this.map.toJSON();
        const bonuses = this.bonuses.map(bonus => bonus.toJSON());
        const abilities = this.abilities.map(ability => ability.toJSON());

        let leaderBoard;
        if (this.mode === 'team') {
            leaderBoard = this.getTeamLeaderboard();
        } else {
            leaderBoard = this.getLeaderboard();
        }
    
        return {
            mode: this.mode,
            map: map,
            gameTimer: Math.round(this.gameTimer),
            abilities: abilities,
            bonuses: bonuses,
            gameOver: this.gameOver,
            me: me,
            players: backendPlayers,
            leaderBoard: leaderBoard,
        };
    }

}


