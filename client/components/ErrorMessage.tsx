import React, { useEffect, useState } from 'react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onClose,
  autoHide = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          onClose();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="error-message">
      {message}
      {onClose && (
        <button 
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
