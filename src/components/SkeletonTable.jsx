import React from 'react';

const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
      <div className="h-6 bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="bg-gray-900/50 p-4 rounded border border-gray-700 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonTable;
