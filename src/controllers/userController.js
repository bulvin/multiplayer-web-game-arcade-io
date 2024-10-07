import { formatMessage } from "../utils/formatMessage.js";
import { isValidToStartGame } from "../utils/valid.js";

export class UserController {
    constructor(socket, user) {
        this.socket = socket;
        this.user = user;
    }

    joinRoom(room) {
        this.socket.join(room);
        this.user.room = room;
        if (room !== "rooms") {
            this.socket.emit("message", formatMessage("SERVER", "Welcome, player!", "info"));
            this.socket.to(room).emit(
                "message",
                formatMessage("SERVER", `${this.user.name} has joined the game`, "info")
            );
        }
    }

    leaveCurrRoom() {
        this.socket.leave(this.user.room);
        if (this.user.room !== "rooms") {
            this.socket.to(this.user.room).emit("message", formatMessage('SERVER', `Player ${this.user.name} has left the game.`, "info"));
        }
    }

    sendMessage(message) {
        if (message.trim() === "" || !message || message.length > 255) return;

        this.socket.emit("message", formatMessage(this.user.name, message));
        this.socket.broadcast.to(this.user.room).emit("message", formatMessage(this.user.name, message));
    }

    updateGameForm(gameData, room) {
        const GameDataFormValidation = isValidToStartGame(gameData, room);
        if (GameDataFormValidation.error) {
            return;
        }
        this.socket.to(this.user.room).emit("updateGameForm", gameData);
    }

    disconnect() {
        this.socket.to(this.user.room).emit("message", formatMessage('SERVER', `Player ${this.user.name} has disconnected.`, "info"));
    }
}