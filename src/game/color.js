export class ColorSystem {
    constructor() {
        this.colors = [];
    }

    getColor() {
        const uniqueColor = this._generateUniqueColor();
        this.colors.push(uniqueColor);
        return uniqueColor;
    }

    _generateUniqueColor() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 100; 
        const lightness = 50; 
        const colorCode = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        if (this.colors.includes(colorCode)) {
            return this._generateUniqueColor();
        }

        return colorCode;
    }
}
    
