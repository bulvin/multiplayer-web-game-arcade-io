export class ColorSystem {
    constructor() {
        this.colors = ['hsl(0, 100%, 50%)', 'hsl(45, 100%, 50%)', 'hsl(90, 100%, 50%)', 'hsl(135, 100%, 50%)', 'hsl(180, 100%, 50%)', 'hsl(225, 100%, 50%)', 'hsl(270, 100%, 50%)', 'hsl(315, 100%, 50%)'];
        this.usedColors = [];
    }

    getColors() {
        const playerColor = this._generatePlayerColor();
        const tailColor = this._generateTailColor(playerColor);
        this.usedColors.push(playerColor);
        return { playerColor, tailColor };
    }

    _generatePlayerColor() {
        const color = Math.floor(Math.random() * this.colors.length);
        const colorCode = this.colors[color];
        this.colors.splice(color, 1); 

        return colorCode;
    }

    _generateTailColor(color) {
        const [hue, saturation, lightness] = color.match(/\d+/g);
        const darkerColor = `hsl(${hue}, ${saturation}%, ${Math.min(Number(lightness) - 40, 100)}%)`;
        return darkerColor;
    }
}
