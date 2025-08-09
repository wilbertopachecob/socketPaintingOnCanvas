import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from '../../client/components/ErrorMessage';

describe('ErrorMessage Component', () => {
  const defaultProps = {
    message: 'Test error message'
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders error message', () => {
    render(<ErrorMessage {...defaultProps} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<ErrorMessage message="Custom error occurred" />);
    
    expect(screen.getByText('Custom error occurred')).toBeInTheDocument();
  });

  it('shows close button when onClose is provided', () => {
    const mockOnClose = jest.fn();
    render(<ErrorMessage {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveTextContent('×');
  });

  it('does not show close button when onClose is not provided', () => {
    render(<ErrorMessage {...defaultProps} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const mockOnClose = jest.fn();
    render(<ErrorMessage {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button');
    await act(async () => {
      await user.click(closeButton);
    });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('hides message when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const mockOnClose = jest.fn();
    render(<ErrorMessage {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button');
    await act(async () => {
      await user.click(closeButton);
    });
    
    expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
  });

  it('auto-hides after default duration (5000ms)', async () => {
    const mockOnClose = jest.fn();
    render(<ErrorMessage {...defaultProps} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    
    // Fast-forward time by 5000ms
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('auto-hides after custom duration', async () => {
    const mockOnClose = jest.fn();
    render(<ErrorMessage {...defaultProps} onClose={mockOnClose} duration={3000} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    
    // Fast-forward time by 3000ms
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not auto-hide when autoHide is false', async () => {
    const mockOnClose = jest.fn();
    render(<ErrorMessage {...defaultProps} onClose={mockOnClose} autoHide={false} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    
    // Fast-forward time by 10000ms (more than default duration)
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Message should still be visible
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('does not auto-hide when no onClose callback is provided', async () => {
    render(<ErrorMessage {...defaultProps} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    
    // Fast-forward time by 5000ms
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Message should be hidden but no callback should be called
    await waitFor(() => {
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });
  });

  it('cleans up timer on unmount', () => {
    const mockOnClose = jest.fn();
    const { unmount } = render(<ErrorMessage {...defaultProps} onClose={mockOnClose} />);
    
    unmount();
    
    // Fast-forward time after unmount
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // onClose should not be called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('applies correct CSS class', () => {
    render(<ErrorMessage {...defaultProps} />);
    
    const errorElement = screen.getByText('Test error message').closest('.error-message');
    expect(errorElement).toHaveClass('error-message');
  });

  it('applies correct button styles', () => {
    const mockOnClose = jest.fn();
    render(<ErrorMessage {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button');
    // Test individual style properties that we explicitly set
    expect(closeButton).toHaveStyle('background: none');
    expect(closeButton).toHaveStyle('color: white');
    expect(closeButton).toHaveStyle('margin-left: 10px');
    expect(closeButton).toHaveStyle('cursor: pointer');
  });

  it('handles multiple error messages with different durations', async () => {
    const mockOnClose1 = jest.fn();
    const mockOnClose2 = jest.fn();
    
    const { rerender } = render(
      <ErrorMessage message="Error 1" onClose={mockOnClose1} duration={2000} />
    );
    
    rerender(
      <ErrorMessage message="Error 2" onClose={mockOnClose2} duration={4000} />
    );
    
    expect(screen.getByText('Error 2')).toBeInTheDocument();
    
    // Fast-forward by 4000ms
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Error 2')).not.toBeInTheDocument();
    });
    
    expect(mockOnClose2).toHaveBeenCalledTimes(1);
  });

  it('creates new timer when props change', async () => {
    const mockOnClose1 = jest.fn();
    const mockOnClose2 = jest.fn();
    const { rerender } = render(
      <ErrorMessage message="Original message" onClose={mockOnClose1} duration={5000} />
    );
    
    expect(screen.getByText('Original message')).toBeInTheDocument();
    
    // Change the props (new onClose and message)
    rerender(
      <ErrorMessage message="Updated message" onClose={mockOnClose2} duration={3000} />
    );
    
    expect(screen.getByText('Updated message')).toBeInTheDocument();
    
    // Fast-forward by 3000ms (duration for the new timer)
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Updated message')).not.toBeInTheDocument();
    });
    
    // Should call the new onClose function
    expect(mockOnClose2).toHaveBeenCalledTimes(1);
    expect(mockOnClose1).not.toHaveBeenCalled();
  });

  it('handles edge case with zero duration', async () => {
    const mockOnClose = jest.fn();
    render(<ErrorMessage {...defaultProps} onClose={mockOnClose} duration={0} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    
    // With 0 duration, it should hide immediately
    act(() => {
      jest.advanceTimersByTime(0);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
