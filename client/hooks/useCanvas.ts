import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { MouseState, LineData, CanvasControls } from '@/types';

export const useCanvas = (socket: Socket | null, controls: CanvasControls) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<MouseState>({
    click: false,
    move: false,
    pos: { x: 0, y: 0 },
    pos_prev: false
  });

  const getRelativePos = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / canvas.width,
      y: (clientY - rect.top) / canvas.height
    };
  }, []);

  const drawLine = useCallback((line: [{ x: number; y: number }, { x: number; y: number }]) => {
    const canvas = canvasRef.current;
    if (!canvas || !line || line.length !== 2) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Draw line from position 0 (previous) to position 1 (current)
    // Line format: [from_position, to_position]
    context.beginPath();
    context.moveTo(line[0].x * canvas.width, line[0].y * canvas.height);
    context.lineTo(line[1].x * canvas.width, line[1].y * canvas.height);
    context.stroke();
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Reapply canvas settings after resize
    const context = canvas.getContext('2d');
    if (context) {
      context.lineWidth = controls.lineWidth;
      context.lineCap = 'round';
      context.strokeStyle = controls.strokeColor;
    }
  }, [controls.lineWidth, controls.strokeColor]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    resizeCanvas();
    
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resizeCanvas]);

  // Update canvas settings when controls change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineWidth = controls.lineWidth;
    context.strokeStyle = controls.strokeColor;
  }, [controls.lineWidth, controls.strokeColor]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleDrawLine = (data: LineData) => {
      drawLine(data.line);
    };

    const handleClearCanvas = () => {
      clearCanvas();
    };

    socket.on('draw_line', handleDrawLine);
    socket.on('clear_canvas', handleClearCanvas);

    return () => {
      socket.off('draw_line', handleDrawLine);
      socket.off('clear_canvas', handleClearCanvas);
    };
  }, [socket, drawLine, clearCanvas]);

  // Setup mouse/touch event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const pos = getRelativePos(e.clientX, e.clientY);
      mouseRef.current.pos = pos;
      mouseRef.current.pos_prev = { ...pos };
      mouseRef.current.click = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.click = false;
      mouseRef.current.pos_prev = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const pos = getRelativePos(e.clientX, e.clientY);
      mouseRef.current.pos = pos;
      mouseRef.current.move = true;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getRelativePos(touch.clientX, touch.clientY);
      mouseRef.current.pos = pos;
      mouseRef.current.pos_prev = { ...pos };
      mouseRef.current.click = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      mouseRef.current.click = false;
      mouseRef.current.pos_prev = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getRelativePos(touch.clientX, touch.clientY);
      mouseRef.current.pos = pos;
      mouseRef.current.move = true;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchmove', handleTouchMove);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [getRelativePos]);

  // Drawing loop
  useEffect(() => {
    if (!socket) return;

    const drawingLoop = () => {
      const mouse = mouseRef.current;
      if (mouse.click && mouse.move && mouse.pos_prev) {
        // Emit line data with correct order: [from_position, to_position]
        // This draws FROM the previous position TO the current position
        socket.emit('draw_line', { 
          line: [mouse.pos_prev, mouse.pos] 
        });
        mouse.move = false;
      }
      mouse.pos_prev = { ...mouse.pos };
      requestAnimationFrame(drawingLoop);
    };

    const animationId = requestAnimationFrame(drawingLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [socket]);

  const emitClearCanvas = useCallback(() => {
    if (socket) {
      socket.emit('clear_canvas');
    }
  }, [socket]);

  return {
    canvasRef,
    clearCanvas: emitClearCanvas
  };
};
