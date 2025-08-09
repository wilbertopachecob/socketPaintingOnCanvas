import { render } from '@testing-library/react';
import { Canvas } from '@/components/Canvas';
import { CanvasControls } from '@/types';

// Mock socket.io-client
jest.mock('socket.io-client');

describe('Canvas Component', () => {
  const mockControls: CanvasControls = {
    lineWidth: 2,
    strokeColor: '#000000'
  };

  beforeEach(() => {
    // Mock canvas getContext
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      clearRect: jest.fn(),
      lineWidth: 2,
      lineCap: 'round',
      strokeStyle: '#000000'
    })) as any;

    // Mock canvas dimensions
    Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
      writable: true,
      value: 1024
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
      writable: true,
      value: 768
    });
  });

  it('renders canvas element', () => {
    render(<Canvas socket={null} controls={mockControls} />);
    
    const canvas = document.getElementById('drawing');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('id', 'drawing');
    expect(canvas?.tagName.toLowerCase()).toBe('canvas');
  });

  it('applies correct styles to canvas', () => {
    render(<Canvas socket={null} controls={mockControls} />);
    
    const canvas = document.getElementById('drawing');
    expect(canvas).toHaveStyle({
      display: 'block',
      background: 'white',
      cursor: 'crosshair'
    });
  });
});
