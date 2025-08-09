import React, { useEffect } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { Socket } from 'socket.io-client';
import { CanvasControls } from '@/types';

interface CanvasProps {
  socket: Socket | null;
  controls: CanvasControls;
  onClearCanvasReady?: (clearFn: () => void) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ socket, controls, onClearCanvasReady }) => {
  const { canvasRef, clearCanvas } = useCanvas(socket, controls);

  useEffect(() => {
    if (onClearCanvasReady) {
      onClearCanvasReady(clearCanvas);
    }
  }, [clearCanvas, onClearCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      id="drawing"
      style={{
        display: 'block',
        background: 'white',
        cursor: 'crosshair',
        touchAction: 'none'
      }}
    />
  );
};
