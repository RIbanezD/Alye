import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50 animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="border-t border-dotted border-gray-600 mb-4"></div>
      <div className="space-y-3">
        <div className="flex items-center">
          <div className="h-4 bg-gray-700 rounded w-20 mr-2"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
        </div>
        <div className="flex items-center">
          <div className="h-4 bg-gray-700 rounded w-24 mr-2"></div>
          <div className="h-4 bg-gray-700 rounded w-28"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
