import React from 'react';

const SkeletonMessage = ({ isUser = false }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] p-4 rounded-lg animate-pulse ${
        isUser
          ? 'bg-cyan-500/20 border-2 border-cyan-500/50'
          : 'bg-purple-500/20 border-2 border-purple-500/50'
      }`}>
        <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          <div className="h-3 bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonMessage;
