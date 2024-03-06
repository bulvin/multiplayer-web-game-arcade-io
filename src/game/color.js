export class ColorSystem {
    constructor() {
        this.colors = [
            'hsl(0, 0%, 40%)', 
            'hsl(90, 100%, 70%)', 
            'hsl(135, 100%, 80%)', 
            'hsl(180, 100%, 90%)', 
            'hsl(225, 100%, 100%)', 
            'hsl(315, 100%, 30%)',
            'hsl(45, 100%, 60%)', 
            'hsl(0, 100%, 50%)', 
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
        const darkerColor = `hsl(${hue}, ${saturation}%, ${Math.min(Number(lightness) - 50, 100)}%)`;
        return darkerColor;
    }
}
