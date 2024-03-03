export class Team {
    constructor(name, color, tailColor) {
      this.name = name;
      this.color = color;
      this.tailColor = tailColor;
      this.lands = [];
      this.score = 0;
    }
    
    addScore(score) {
      this.score += score;
    }
  
    getTerritoryPercentage(map) {
      const totalTiles = map.countTiles();
      const teamTiles = this.lands.length;
      return ((teamTiles / totalTiles) * 100).toFixed(2);
    }
  }