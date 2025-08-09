import React, { useState, useEffect } from 'react';
import { Canvas } from '@/components/Canvas';
import { Controls } from '@/components/Controls';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useSocket } from '@/hooks/useSocket';
import { useCanvas } from '@/hooks/useCanvas';
import { CanvasControls } from '@/types';
import '@/App.css';

const App: React.FC = () => {
  const { socket, isConnected, connectionError, userCount } = useSocket();
  const [controls, setControls] = useState<CanvasControls>({
    lineWidth: 2,
    strokeColor: '#000000'
  });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  
  const { clearCanvas } = useCanvas(socket, controls);

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
        clearCanvas();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [clearCanvas]);

  const removeErrorMessage = (index: number) => {
    setErrorMessages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="app">
      <Canvas socket={socket} controls={controls} />
      
      <Controls
        controls={controls}
        onControlsChange={setControls}
        onClearCanvas={clearCanvas}
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
