import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState({ current: 0, max: 10 });

  useEffect(() => {
    const newSocket = io();

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = () => {
      setConnectionError('Connection failed. Please refresh the page.');
    };

    const handleConnectionRejected = (data: { message: string }) => {
      setConnectionError(data.message);
      setIsConnected(false);
    };

    const handleUserCountUpdate = (data: { currentUsers: number; maxUsers: number }) => {
      setUserCount({ current: data.currentUsers, max: data.maxUsers });
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('connect_error', handleConnectError);
    newSocket.on('connection_rejected', handleConnectionRejected);
    newSocket.on('user_count_update', handleUserCountUpdate);

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return {
    socket,
    isConnected,
    connectionError,
    userCount
  };
};
