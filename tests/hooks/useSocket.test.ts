import { renderHook, act } from '@testing-library/react';
import { useSocket } from '@/hooks/useSocket';
import { io, Socket } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client');

const mockIo = io as jest.MockedFunction<typeof io>;

describe('useSocket Hook', () => {
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      close: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    mockIo.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes socket connection', () => {
    renderHook(() => useSocket());
    
    expect(mockIo).toHaveBeenCalledTimes(1);
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connection_rejected', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('user_count_update', expect.any(Function));
  });

  it('updates connection status on connect', () => {
    const { result } = renderHook(() => useSocket());
    
    // Get the connect handler
    const connectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect'
    )?.[1] as Function;
    
    act(() => {
      connectHandler();
    });
    
    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionError).toBe(null);
  });

  it('updates connection status on disconnect', () => {
    const { result } = renderHook(() => useSocket());
    
    // First connect
    const connectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect'
    )?.[1] as Function;
    
    act(() => {
      connectHandler();
    });
    
    expect(result.current.isConnected).toBe(true);
    
    // Then disconnect
    const disconnectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'disconnect'
    )?.[1] as Function;
    
    act(() => {
      disconnectHandler();
    });
    
    expect(result.current.isConnected).toBe(false);
  });

  it('handles connection errors', () => {
    const { result } = renderHook(() => useSocket());
    
    const errorHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect_error'
    )?.[1] as Function;
    
    act(() => {
      errorHandler(new Error('Connection failed'));
    });
    
    expect(result.current.connectionError).toBe('Connection failed. Please refresh the page.');
  });

  it('handles user count updates', () => {
    const { result } = renderHook(() => useSocket());
    
    const userCountHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'user_count_update'
    )?.[1] as Function;
    
    act(() => {
      userCountHandler({ currentUsers: 3, maxUsers: 10 });
    });
    
    expect(result.current.userCount).toEqual({ current: 3, max: 10 });
  });

  it('cleans up socket on unmount', () => {
    const { unmount } = renderHook(() => useSocket());
    
    unmount();
    
    expect(mockSocket.close).toHaveBeenCalledTimes(1);
  });
});
