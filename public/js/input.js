import { sendPlayerInput } from "./networking.js";

export class InputHandler {
    constructor() {
        this.input = [];
 
        this.keydownHandler = (e) => {
            e.preventDefault();
            const key = e.key.toLowerCase();
  
            if (['w', 's', 'a', 'd', 'r', 't', 'e'].includes(key) && !this.input.includes(key)) {
            
                this.input.push(e.key);
              
                sendPlayerInput(this.input);
            }
        };

        this.keyupHandler = (e) => {
            const key = e.key.toLowerCase();
            if (this.input.includes(key)) {
                this.input.splice(this.input.indexOf(key), 1);
            
    
                sendPlayerInput(this.input);
            }
        };

        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
    }

    stopCapturingInput() {
        window.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('keyup', this.keyupHandler);
    }

    }
