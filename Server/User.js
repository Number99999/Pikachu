class User {
    id;
    username;
    room;
    webSocket;
    constructor(id, username, room, websocket) {
        this.id = id;
        this.username = username;
        this.room = room;
        this.webSocket = websocket
    }

}

module.exports = User