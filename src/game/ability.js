class Ability {
    constructor(x, y, name, duration){
        this.position = {
            x : x,
            y : y
        };
        this.name = name;
        this.duration = duration;
        
    }
    
    removeBind(player) {
        for (const key of Object.keys(player.abilitiesBinds)) { 
            if (player.abilitiesBinds[key] === player.activeAbility) {
               
                player.abilitiesBinds[key] = null;
                break;
            }
        }
        
        player.activeAbility = null;
    }
    toJSON() {
        return {
            x: this.position.x,
            y : this.position.y,
            name : this.name,
        }
    }

}

class SpeedAbility extends Ability {
    constructor(x, y){
        super(x, y, "PRĘDKOŚĆ", 5000);
        
    }

    use(player) {
        player.speed *= 2;
    }

    reset(player) {
        player.speed /= 2;
        super.removeBind(player);
    }
    update(player, deltaTime) {
        this.duration -= deltaTime;
     
        if (this.duration <= 0) {
            this.reset(player);
        }
    }
}

class SlowAbility extends Ability {
    constructor(x, y){
        super(x, y, "SPOWOLNIENIE", 5000);
    }

    use(player) {
        let otherPlayers;
        if (player.team) {
            otherPlayers = Object.values(player.game.players).filter((p) => p.user.id !== player.user.id && p.team !== player.team);
        } else {
            
            otherPlayers = Object.values(player.game.players).filter((p) => p.user.id !== player.user.id);
        }
        
        for (const other of otherPlayers) {
            other.slowMultiplier = 0.5;
        }
    }

    reset(player) {
        const otherPlayers = Object.values(player.game.players).filter((p) => p.user.id !== player.user.id);
        for (const other of otherPlayers) {
            other.slowMultiplier = 1;
        }
        super.removeBind(player);
    }
    update(player, deltaTime) {
        this.duration -= deltaTime;
        if (this.duration <= 0) {
            this.reset(player);
        }
    }
}

class SelfImmunityAbility extends Ability {
    constructor(x, y){
        super(x, y, "ODPORNOŚĆ", 5000);
    }

    use(player) {
        player.noHitSelf = true;
    }

    reset(player) {
        player.noHitSelf = false;
        super.removeBind(player);
    }
    update(player, deltaTime) {
        this.duration -= deltaTime;
        if (this.duration <= 0) {
            this.reset(player);
        }
    }
    
}

class EnhancedVisionAbility extends Ability {
    constructor(x, y){
        super(x, y, "WIDOCZNOŚĆ", 3000);
    }

    use(player) {
      
        player.psize = 24;
    }

    reset(player) {
        player.psize = 32;
        super.removeBind(player);
    }
    update(player, deltaTime) {
        this.duration -= deltaTime;
        if (this.duration <= 0) {
            this.reset(player);
        }
    }

}

class TeleportAbility extends Ability {
    constructor(x, y){
        super(x, y, "TELEPORT", 0);
    }

    use(player) {
        const randomIndex = Math.floor(Math.random() * player.lands.length);
        const randomLand = player.lands[randomIndex];
        player.x = randomLand.x;
        player.y = randomLand.y;
        player.targetX = randomLand.x;
        player.targetY = randomLand.y;
        player.tail.forEach((tile) => {
            if (tile.playerId !== 0) {
              player.game.map.setTile({ x: tile.x, y: tile.y, playerId: tile.playerId, color: tile.oldColor, hasTail: false });
            } else {
              player.game.map.setTile({ x: tile.x, y: tile.y, playerId: 0, color: '#111', hasTail: false });
            }
      
          });
        player.tail = []

    }
    reset(player) {
        super.removeBind(player);
    }
    update(player, deltaTime) {
        this.duration -= deltaTime;
        if (this.duration <= 0) {
            this.reset(player);
        }
    }
}

export { SpeedAbility, SlowAbility, SelfImmunityAbility, EnhancedVisionAbility, TeleportAbility }
