import React, { useState } from 'react';
import { CanvasControls } from '@/types';

interface ControlsProps {
  controls: CanvasControls;
  onControlsChange: (controls: CanvasControls) => void;
  onClearCanvas: () => void;
  isConnected: boolean;
  userCount: { current: number; max: number };
  connectionError: string | null;
}

export const Controls: React.FC<ControlsProps> = ({
  controls,
  onControlsChange,
  onClearCanvas,
  isConnected,
  userCount,
  connectionError
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lineWidth = parseInt(e.target.value);
    onControlsChange({ ...controls, lineWidth });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strokeColor = e.target.value;
    onControlsChange({ ...controls, strokeColor });
  };

  const toggleControls = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="controls">
      <div className="controls-header">
        <button 
          className="btn btn-toggle"
          onClick={toggleControls}
          aria-label="Toggle controls"
        >
          <span className="toggle-icon">{isCollapsed ? '+' : '−'}</span>
        </button>
      </div>
      
      <div 
        className="controls-content"
        style={{ display: isCollapsed ? 'none' : 'block' }}
      >
        <div className="control-group">
          <button 
            className="btn btn-clear"
            onClick={onClearCanvas}
          >
            Clear Canvas
          </button>
        </div>
        
        <div className="control-group">
          <label htmlFor="color-picker">Color:</label>
          <input
            type="color"
            id="color-picker"
            value={controls.strokeColor}
            onChange={handleColorChange}
          />
        </div>
        
        <div className="control-group">
          <label htmlFor="line-width-slider">Line Width:</label>
          <input
            type="range"
            id="line-width-slider"
            min="1"
            max="20"
            value={controls.lineWidth}
            onChange={handleLineWidthChange}
          />
          <span id="line-width-display">{controls.lineWidth}px</span>
        </div>
        
        <div className="control-group">
          <span 
            className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="control-group">
          <span className="user-count">
            Users: {userCount.current}/{userCount.max}
          </span>
        </div>
      </div>
      
      {connectionError && (
        <div className="error-message">
          {connectionError}
        </div>
      )}
    </div>
  );
};
