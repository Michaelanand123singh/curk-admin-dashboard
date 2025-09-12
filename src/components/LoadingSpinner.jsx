import React from 'react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`} />
        {text && <span className="text-gray-600">{text}</span>}
      </div>
    </div>
  );
}
