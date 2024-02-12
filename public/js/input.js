import { sendPlayerInput } from "./networking.js";

export class InputHandler {
    constructor() {
        this.input = [];

        window.addEventListener('keydown', (e) => {
            e.preventDefault();
          
            if (['w', 's', 'a', 'd', 'r', 't', 'e'].includes(e.key) && !this.input.includes(e.key)) {
                this.input.push(e.key);
                sendPlayerInput(this.input);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.input.includes(e.key)) {
                this.input.splice(this.input.indexOf(e.key), 1);
                sendPlayerInput(this.input);
            }
        });
        
     
    }


}