class Player {
    constructor(id, name, isBot = false) {
        this.id = id;
        this.name = name;
        this.hand = [];
        this.isActive = true;
        this.position = null;
        this.isBot = isBot;
    }
}

export default Player;