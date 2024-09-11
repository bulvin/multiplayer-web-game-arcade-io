export class ColorSystem {
    constructor() {
        this.colors = [
            'hsl(300, 100%, 50%)',
            'hsl(180, 100%, 50%)', 
            'hsl(240, 100%, 50%)', 
            'hsl(120, 100%, 50%)', 
            'hsl(0, 100%, 50%)', 
            'hsl(30, 100%, 50%)',    
            'hsl(270, 100%, 50%)', 
            'hsl(60, 100%, 50%)',
        ];
        this.usedColors = [];
    }

    getColors() {
        const playerColor = this._generatePlayerColor();
        const tailColor = this._generateTailColor(playerColor);
        this.usedColors.push(playerColor);
        return { playerColor, tailColor };
    }

    _generatePlayerColor() {
        if (this.colors.length === 0) {
            this.colors = this.usedColors;
            this.usedColors = [];
        }

        const color = this.colors.shift();
        this.usedColors.push(color);
        return color;
    }

    _generateTailColor(color) {
        const [hue, saturation, lightness] = color.match(/\d+/g);
        const darkerColor = `hsl(${hue}, ${saturation}%, ${Math.max(Number(lightness) - 40, 10)}%)`;
        return darkerColor;
    }
}
