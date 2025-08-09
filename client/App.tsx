import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@/components/Canvas';
import { Controls } from '@/components/Controls';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useSocket } from '@/hooks/useSocket';
import { CanvasControls } from '@/types';
import '@/App.css';

const App: React.FC = () => {
  const { socket, isConnected, connectionError, userCount } = useSocket();
  const [controls, setControls] = useState<CanvasControls>({
    lineWidth: 2,
    strokeColor: '#000000'
  });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const clearCanvasRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleError = (data: { message: string }) => {
      setErrorMessages(prev => [...prev, data.message]);
    };

    socket.on('error', handleError);

    return () => {
      socket.off('error', handleError);
    };
  }, [socket]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (clearCanvasRef.current) {
          clearCanvasRef.current();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const removeErrorMessage = (index: number) => {
    setErrorMessages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="app">
      <Canvas 
        socket={socket} 
        controls={controls} 
        onClearCanvasReady={(clearFn) => {
          clearCanvasRef.current = clearFn;
        }}
      />
      
      <Controls
        controls={controls}
        onControlsChange={setControls}
        onClearCanvas={() => clearCanvasRef.current?.()}
        isConnected={isConnected}
        userCount={userCount}
        connectionError={connectionError}
      />
      
      {errorMessages.map((message, index) => (
        <ErrorMessage
          key={index}
          message={message}
          onClose={() => removeErrorMessage(index)}
        />
      ))}
    </div>
  );
};

export default App;
