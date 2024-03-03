export class Room {
    constructor(id, name, maxPlayers) {
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.users = [];
        this.game = null;
    }

    toJSON() {
        return {
            name: this.name,
            currentPlayers: this.users.length,
            maxPlayers: this.maxPlayers
        }
    }
}