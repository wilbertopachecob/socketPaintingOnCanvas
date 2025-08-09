import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controls } from '@/components/Controls';
import { CanvasControls } from '@/types';

describe('Controls Component', () => {
  const mockControls: CanvasControls = {
    lineWidth: 2,
    strokeColor: '#000000'
  };

  const mockProps = {
    controls: mockControls,
    onControlsChange: jest.fn(),
    onClearCanvas: jest.fn(),
    isConnected: true,
    userCount: { current: 2, max: 10 },
    connectionError: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all control elements', () => {
    render(<Controls {...mockProps} />);
    
    expect(screen.getByText('Clear Canvas')).toBeInTheDocument();
    expect(screen.getByLabelText('Color:')).toBeInTheDocument();
    expect(screen.getByLabelText('Line Width:')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Users: 2/10')).toBeInTheDocument();
  });

  it('calls onClearCanvas when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<Controls {...mockProps} />);
    
    const clearButton = screen.getByText('Clear Canvas');
    await user.click(clearButton);
    
    expect(mockProps.onClearCanvas).toHaveBeenCalledTimes(1);
  });

  it('calls onControlsChange when line width changes', async () => {
    const user = userEvent.setup();
    render(<Controls {...mockProps} />);
    
    const lineWidthSlider = screen.getByLabelText('Line Width:') as HTMLInputElement;
    
    // Simulate range input change
    fireEvent.change(lineWidthSlider, { target: { value: '5' } });
    
    expect(mockProps.onControlsChange).toHaveBeenCalledWith({
      ...mockControls,
      lineWidth: 5
    });
  });

  it('calls onControlsChange when color changes', async () => {
    const user = userEvent.setup();
    render(<Controls {...mockProps} />);
    
    const colorPicker = screen.getByLabelText('Color:');
    await user.click(colorPicker);
    fireEvent.change(colorPicker, { target: { value: '#ff0000' } });
    
    expect(mockProps.onControlsChange).toHaveBeenCalledWith({
      ...mockControls,
      strokeColor: '#ff0000'
    });
  });

  it('shows connection status correctly', () => {
    const { rerender } = render(<Controls {...mockProps} />);
    expect(screen.getByText('Connected')).toHaveClass('connected');
    
    rerender(<Controls {...mockProps} isConnected={false} />);
    expect(screen.getByText('Disconnected')).toHaveClass('disconnected');
  });

  it('displays user count correctly', () => {
    render(<Controls {...mockProps} />);
    expect(screen.getByText('Users: 2/10')).toBeInTheDocument();
  });

  it('toggles controls visibility', async () => {
    const user = userEvent.setup();
    render(<Controls {...mockProps} />);
    
    const toggleButton = screen.getByLabelText('Toggle controls');
    const controlsContent = screen.getByText('Clear Canvas').closest('.controls-content');
    
    expect(controlsContent).toHaveStyle({ display: 'block' });
    
    await user.click(toggleButton);
    expect(controlsContent).toHaveStyle({ display: 'none' });
    
    await user.click(toggleButton);
    expect(controlsContent).toHaveStyle({ display: 'block' });
  });
});
