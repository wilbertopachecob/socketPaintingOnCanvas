class DrawingManager {
  constructor() {
    this.lineHistory = [];
    this.maxHistorySize = 1000; // Prevent memory issues
  }

  addLine(line) {
    if (!this.isValidLine(line)) {
      throw new Error('Invalid line data');
    }

    this.lineHistory.push(line);
    
    // Prevent memory issues by limiting history size
    if (this.lineHistory.length > this.maxHistorySize) {
      this.lineHistory = this.lineHistory.slice(-this.maxHistorySize);
    }
  }

  getHistory() {
    return [...this.lineHistory]; // Return a copy to prevent external modification
  }

  clearHistory() {
    this.lineHistory = [];
  }

  getHistorySize() {
    return this.lineHistory.length;
  }

  isValidLine(line) {
    return !!(line && 
           Array.isArray(line) && 
           line.length === 2 &&
           this.isValidCoordinate(line[0]) &&
           this.isValidCoordinate(line[1]));
  }

  isValidCoordinate(coord) {
    return !!(coord && 
           typeof coord.x === 'number' && 
           typeof coord.y === 'number' &&
           coord.x >= 0 && coord.x <= 1 &&
           coord.y >= 0 && coord.y <= 1);
  }

  // Get statistics about the drawing
  getStats() {
    return {
      totalLines: this.lineHistory.length,
      historySize: this.maxHistorySize
    };
  }
}

module.exports = DrawingManager; 