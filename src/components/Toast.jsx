import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500 text-green-400';
      case 'error':
        return 'bg-red-500/20 border-red-500 text-red-400';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'info':
      default:
        return 'bg-cyan-500/20 border-cyan-500 text-cyan-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border-2 backdrop-blur-sm ${getTypeStyles()} 
        animate-slide-in-right shadow-lg max-w-md flex items-center space-x-3`}
    >
      <div className="text-2xl font-bold">{getIcon()}</div>
      <div className="flex-1 font-mono text-sm">{message}</div>
      <button 
        onClick={onClose}
        className="text-xl hover:opacity-70 transition-opacity"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
