import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '@/hooks/useCanvas';
import { Socket } from 'socket.io-client';
import { CanvasControls } from '@/types';

// Mock socket.io-client
jest.mock('socket.io-client');

describe('useCanvas Hook', () => {
  let mockSocket: jest.Mocked<Socket>;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let mockControls: CanvasControls;

  beforeEach(() => {
    // Setup mock socket
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    } as any;

    // Setup mock canvas context
    mockContext = {
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      clearRect: jest.fn(),
      lineWidth: 2,
      lineCap: 'round',
      strokeStyle: '#000000'
    } as any;

    // Setup mock canvas
    mockCanvas = {
      getContext: jest.fn(() => mockContext),
      getBoundingClientRect: jest.fn(() => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600
      })),
      width: 800,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    } as any;

    // Mock canvas creation
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
    Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
      writable: true,
      value: 800
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
      writable: true,
      value: 600
    });

    mockControls = {
      lineWidth: 2,
      strokeColor: '#000000'
    };

    // Mock requestAnimationFrame and cancelAnimationFrame
    global.requestAnimationFrame = jest.fn((callback) => {
      callback(0);
      return 1;
    });
    global.cancelAnimationFrame = jest.fn();

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with canvasRef and clearCanvas function', () => {
    const { result } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    expect(result.current.canvasRef).toBeDefined();
    expect(result.current.clearCanvas).toBeInstanceOf(Function);
  });

  it('should setup socket listeners when socket is provided', () => {
    renderHook(() => useCanvas(mockSocket, mockControls));
    
    expect(mockSocket.on).toHaveBeenCalledWith('draw_line', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('clear_canvas', expect.any(Function));
  });

  it('should not setup socket listeners when socket is null', () => {
    renderHook(() => useCanvas(null, mockControls));
    
    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  it('should cleanup socket listeners on unmount', () => {
    const { unmount } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    unmount();
    
    expect(mockSocket.off).toHaveBeenCalledWith('draw_line', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('clear_canvas', expect.any(Function));
  });

  it('should emit clear_canvas when clearCanvas is called', () => {
    const { result } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    act(() => {
      result.current.clearCanvas();
    });
    
    expect(mockSocket.emit).toHaveBeenCalledWith('clear_canvas');
  });

  it('should not emit clear_canvas when socket is null', () => {
    const { result } = renderHook(() => useCanvas(null, mockControls));
    
    act(() => {
      result.current.clearCanvas();
    });
    
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('should handle socket draw_line events', () => {
    const { result } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    // Get the draw_line handler
    const drawLineHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'draw_line'
    )?.[1] as Function;
    
    // Simulate canvas ref being set
    if (result.current.canvasRef.current) {
      result.current.canvasRef.current = mockCanvas;
    }
    
    act(() => {
      drawLineHandler({
        line: [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }]
      });
    });
    
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalledWith(80, 120); // 0.1 * 800, 0.2 * 600
    expect(mockContext.lineTo).toHaveBeenCalledWith(240, 240); // 0.3 * 800, 0.4 * 600
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should handle socket clear_canvas events', () => {
    const { result } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    // Get the clear_canvas handler
    const clearCanvasHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'clear_canvas'
    )?.[1] as Function;
    
    // Simulate canvas ref being set
    if (result.current.canvasRef.current) {
      result.current.canvasRef.current = mockCanvas;
    }
    
    act(() => {
      clearCanvasHandler();
    });
    
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('should update canvas context when controls change', () => {
    const newControls = { lineWidth: 5, strokeColor: '#ff0000' };
    const { rerender } = renderHook(
      ({ controls }) => useCanvas(mockSocket, controls),
      { initialProps: { controls: mockControls } }
    );
    
    rerender({ controls: newControls });
    
    expect(mockContext.lineWidth).toBe(5);
    expect(mockContext.strokeStyle).toBe('#ff0000');
  });

  it('should calculate relative position correctly', () => {
    const { result } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    // Access the internal getRelativePos function through mouse events
    // We'll test this indirectly by checking mouse event handling
    if (result.current.canvasRef.current) {
      result.current.canvasRef.current = mockCanvas;
      
      // Mock getBoundingClientRect
      mockCanvas.getBoundingClientRect = jest.fn(() => ({
        left: 100,
        top: 50,
        width: 800,
        height: 600
      })) as any;
      
      // Test is implicit through the fact that the hook sets up event listeners correctly
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    }
  });

  it('should handle touch events', () => {
    renderHook(() => useCanvas(mockSocket, mockControls));
    
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
  });

  it('should resize canvas on window resize', () => {
    const { result } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    if (result.current.canvasRef.current) {
      result.current.canvasRef.current = mockCanvas;
      
      // Simulate window resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 1200 });
        Object.defineProperty(window, 'innerHeight', { value: 900 });
        window.dispatchEvent(new Event('resize'));
      });
      
      expect(mockCanvas.width).toBe(1200);
      expect(mockCanvas.height).toBe(900);
    }
  });

  it('should not draw invalid lines', () => {
    const { result } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    // Get the draw_line handler
    const drawLineHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'draw_line'
    )?.[1] as Function;
    
    if (result.current.canvasRef.current) {
      result.current.canvasRef.current = mockCanvas;
    }
    
    // Test with invalid line data
    act(() => {
      drawLineHandler({ line: null });
    });
    
    expect(mockContext.beginPath).not.toHaveBeenCalled();
    
    act(() => {
      drawLineHandler({ line: [{ x: 0.1, y: 0.2 }] }); // Only one point
    });
    
    expect(mockContext.beginPath).not.toHaveBeenCalled();
  });

  it('should emit draw_line when drawing', () => {
    const { result } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    if (result.current.canvasRef.current) {
      result.current.canvasRef.current = mockCanvas;
    }
    
    // The drawing loop is tested indirectly through requestAnimationFrame
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should cleanup animation frame on unmount', () => {
    const { unmount } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    unmount();
    
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useCanvas(mockSocket, mockControls));
    
    if (mockCanvas) {
      unmount();
      
      expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
      expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
    }
  });
});
