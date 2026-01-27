class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.hand = [];
        this.isActive = true;
        this.position = null;
    }
}

export default Player;