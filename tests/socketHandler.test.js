const SocketHandler = require('../src/socket/socketHandler');
const DrawingManager = require('../src/socket/drawingManager');

// Mock Socket.IO
const mockIo = {
  on: jest.fn(),
  emit: jest.fn()
};

const mockSocket = {
  id: 'test-socket-id',
  emit: jest.fn(),
  on: jest.fn()
};

describe('SocketHandler', () => {
  let socketHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    socketHandler = new SocketHandler(mockIo);
  });

  describe('constructor', () => {
    test('should initialize with io instance and drawing manager', () => {
      expect(socketHandler.io).toBe(mockIo);
      expect(socketHandler.drawingManager).toBeInstanceOf(DrawingManager);
    });

    test('should setup socket handlers', () => {
      expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
  });

  describe('setupSocketHandlers', () => {
    let connectionHandler;

    beforeEach(() => {
      // Get the connection handler function
      connectionHandler = mockIo.on.mock.calls[0][1];
    });

    test('should handle new connections', () => {
      connectionHandler(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledWith('draw_line', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('clear_canvas', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    test('should send drawing history to new connections', () => {
      const line = [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }];
      socketHandler.drawingManager.addLine(line);

      connectionHandler(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('draw_line', { line });
    });
  });

  describe('handleDrawLine', () => {
    let drawLineHandler;

    beforeEach(() => {
      const connectionHandler = mockIo.on.mock.calls[0][1];
      connectionHandler(mockSocket);
      drawLineHandler = mockSocket.on.mock.calls.find(call => call[0] === 'draw_line')[1];
    });

    test('should handle valid line data', () => {
      const line = [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }];
      const data = { line };

      drawLineHandler(data);

      expect(socketHandler.drawingManager.getHistory()).toContain(line);
      expect(mockIo.emit).toHaveBeenCalledWith('draw_line', { line });
    });

    test('should handle invalid line data format', () => {
      const invalidData = [
        null,
        undefined,
        {},
        { line: null },
        { line: 'not an array' },
        { line: [] },
        { line: [{ x: 0.1, y: 0.2 }] }, // Only one point
        { line: [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }, { x: 0.5, y: 0.6 }] } // Too many points
      ];

      invalidData.forEach(data => {
        drawLineHandler(data);
        expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: 'Invalid drawing data' });
      });
    });

    test('should handle invalid coordinates', () => {
      const invalidLines = [
        { line: [{ x: -0.1, y: 0.2 }, { x: 0.3, y: 0.4 }] },
        { line: [{ x: 0.1, y: 1.1 }, { x: 0.3, y: 0.4 }] },
        { line: [{ x: 'invalid', y: 0.2 }, { x: 0.3, y: 0.4 }] }
      ];

      invalidLines.forEach(data => {
        drawLineHandler(data);
        expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: 'Invalid drawing data' });
      });
    });
  });

  describe('handleClearCanvas', () => {
    let clearCanvasHandler;

    beforeEach(() => {
      const connectionHandler = mockIo.on.mock.calls[0][1];
      connectionHandler(mockSocket);
      clearCanvasHandler = mockSocket.on.mock.calls.find(call => call[0] === 'clear_canvas')[1];
    });

    test('should clear canvas and broadcast to all clients', () => {
      // Add some lines first
      const line = [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }];
      socketHandler.drawingManager.addLine(line);

      clearCanvasHandler();

      expect(socketHandler.drawingManager.getHistory()).toEqual([]);
      expect(mockIo.emit).toHaveBeenCalledWith('clear_canvas');
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
        expect(socketHandler.isValidCoordinate(coord)).toBe(true);
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
        expect(socketHandler.isValidCoordinate(coord)).toBe(false);
      });
    });
  });
}); 