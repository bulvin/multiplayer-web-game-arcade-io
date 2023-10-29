import { sendPlayerInput } from "./networking.js";

export class InputHandler {
    constructor(player) {
        this.player = player;

        window.addEventListener('keydown', (e) => {
            e.preventDefault();
            if (['w', 's', 'a', 'd'].includes(e.key) && !this.player.input.includes(e.key) && !this.player.dead) {
                this.player.input.push(e.key);
                sendPlayerInput(this.player.input)
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.player.input.includes(e.key)) {
                this.player.input.splice(this.player.input.indexOf(e.key), 1);
                sendPlayerInput(this.player.input)
            }
        });

    }


}