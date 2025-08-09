import React from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { Socket } from 'socket.io-client';
import { CanvasControls } from '@/types';

interface CanvasProps {
  socket: Socket | null;
  controls: CanvasControls;
}

export const Canvas: React.FC<CanvasProps> = ({ socket, controls }) => {
  const { canvasRef } = useCanvas(socket, controls);

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
