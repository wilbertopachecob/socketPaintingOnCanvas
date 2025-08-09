import React, { useEffect, useState, useRef } from 'react';

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
  const onCloseRef = useRef(onClose);

  // Keep the ref up to date
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onCloseRef.current) {
          onCloseRef.current();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="error-message">
      {message}
      {onClose && (
        <button 
          type="button"
          className="error-message-close"
          aria-label="Close error message"
          onClick={() => {
            setIsVisible(false);
            if (onCloseRef.current) {
              onCloseRef.current();
            }
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
