export class User {
    constructor(id, name, room){
        this.id = id;
        this.name = name;
        this.room = room;
    }

    toJSON() {
        return this.name;
    }


}