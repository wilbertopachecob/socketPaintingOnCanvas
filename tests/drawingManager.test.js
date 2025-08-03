const DrawingManager = require('../src/socket/drawingManager');

describe('DrawingManager', () => {
  let drawingManager;

  beforeEach(() => {
    drawingManager = new DrawingManager();
  });

  describe('constructor', () => {
    test('should initialize with empty history', () => {
      expect(drawingManager.getHistory()).toEqual([]);
      expect(drawingManager.getHistorySize()).toBe(0);
    });

    test('should set maxHistorySize to 1000', () => {
      expect(drawingManager.maxHistorySize).toBe(1000);
    });
  });

  describe('addLine', () => {
    test('should add valid line to history', () => {
      const line = [
        { x: 0.1, y: 0.2 },
        { x: 0.3, y: 0.4 }
      ];

      drawingManager.addLine(line);
      const history = drawingManager.getHistory();

      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(line);
    });

    test('should throw error for invalid line data', () => {
      const invalidLines = [
        null,
        undefined,
        'not an array',
        [],
        [{ x: 0.1, y: 0.2 }], // Only one point
        [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }, { x: 0.5, y: 0.6 }], // Too many points
        [{ x: 'invalid', y: 0.2 }, { x: 0.3, y: 0.4 }], // Invalid coordinates
        [{ x: -0.1, y: 0.2 }, { x: 0.3, y: 0.4 }], // Negative x
        [{ x: 0.1, y: 1.1 }, { x: 0.3, y: 0.4 }]  // y > 1
      ];

      invalidLines.forEach(line => {
        expect(() => drawingManager.addLine(line)).toThrow('Invalid line data');
      });
    });

    test('should limit history size to maxHistorySize', () => {
      const line = [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }];
      
      // Add more lines than maxHistorySize
      for (let i = 0; i < 1005; i++) {
        drawingManager.addLine(line);
      }

      expect(drawingManager.getHistorySize()).toBe(1000);
      expect(drawingManager.getHistory().length).toBe(1000);
    });
  });

  describe('getHistory', () => {
    test('should return a copy of history', () => {
      const line = [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }];
      drawingManager.addLine(line);

      const history = drawingManager.getHistory();
      history.push('modification'); // Try to modify the returned array

      expect(drawingManager.getHistory()).toEqual([line]);
      expect(history).toContain('modification');
    });
  });

  describe('clearHistory', () => {
    test('should clear all history', () => {
      const line = [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }];
      drawingManager.addLine(line);
      drawingManager.addLine(line);

      expect(drawingManager.getHistorySize()).toBe(2);

      drawingManager.clearHistory();

      expect(drawingManager.getHistory()).toEqual([]);
      expect(drawingManager.getHistorySize()).toBe(0);
    });
  });

  describe('isValidCoordinate', () => {
    test('should validate correct coordinates', () => {
      const validCoords = [
        { x: 0, y: 0 },
        { x: 0.5, y: 0.5 },
        { x: 1, y: 1 },
        { x: 0.1, y: 0.9 }
      ];

      validCoords.forEach(coord => {
        expect(drawingManager.isValidCoordinate(coord)).toBe(true);
      });
    });

    test('should reject invalid coordinates', () => {
      const invalidCoords = [
        null,
        undefined,
        {},
        { x: 0.1 },
        { y: 0.2 },
        { x: '0.1', y: 0.2 },
        { x: 0.1, y: '0.2' },
        { x: -0.1, y: 0.2 },
        { x: 0.1, y: -0.2 },
        { x: 1.1, y: 0.2 },
        { x: 0.1, y: 1.1 }
      ];

      invalidCoords.forEach(coord => {
        expect(drawingManager.isValidCoordinate(coord)).toBe(false);
      });
    });
  });

  describe('isValidLine', () => {
    test('should validate correct lines', () => {
      const validLines = [
        [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }],
        [{ x: 0.5, y: 0.5 }, { x: 0.7, y: 0.8 }]
      ];

      validLines.forEach(line => {
        expect(drawingManager.isValidLine(line)).toBe(true);
      });
    });

    test('should reject invalid lines', () => {
      const invalidLines = [
        null,
        undefined,
        'not an array',
        [],
        [{ x: 0.1, y: 0.2 }],
        [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }, { x: 0.5, y: 0.6 }],
        [{ x: 'invalid', y: 0.2 }, { x: 0.3, y: 0.4 }],
        [{ x: 0.1, y: 0.2 }, null],
        [null, { x: 0.3, y: 0.4 }]
      ];

      invalidLines.forEach(line => {
        expect(drawingManager.isValidLine(line)).toBe(false);
      });
    });
  });

  describe('getStats', () => {
    test('should return correct statistics', () => {
      const stats = drawingManager.getStats();
      
      expect(stats).toEqual({
        totalLines: 0,
        historySize: 1000
      });

      const line = [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }];
      drawingManager.addLine(line);

      const updatedStats = drawingManager.getStats();
      expect(updatedStats).toEqual({
        totalLines: 1,
        historySize: 1000
      });
    });
  });
}); 