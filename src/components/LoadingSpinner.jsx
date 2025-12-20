import React from 'react';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin-reverse"></div>
      </div>
      {text && (
        <p className="text-cyan-400 font-mono text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
