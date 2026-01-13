import React, { useState } from 'react';

const ErrorDisplay = ({ 
  errors, 
  isVisible, 
  onToggle, 
  onClear, 
  onDismiss, 
  onCopyToClipboard 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedError, setExpandedError] = useState(null);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full shadow-lg z-[9999] transition-all duration-200 flex items-center gap-2 text-sm font-medium"
      >
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        Errors
        {errors.length > 0 && (
          <span className="bg-white text-red-500 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
            {errors.length > 99 ? '99+' : errors.length}
          </span>
        )}
      </button>
    );
  }

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '00:00:00';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return 'text-red-400 border-red-500';
      case 'WARN': return 'text-yellow-400 border-yellow-500';
      case 'INFO': return 'text-blue-400 border-blue-500';
      case 'DEBUG': return 'text-gray-400 border-gray-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'ERROR': return '❌';
      case 'WARN': return '⚠️';
      case 'INFO': return 'ℹ️';
      case 'DEBUG': return '🔍';
      default: return '❓';
    }
  };

  const toggleExpanded = (errorId) => {
    setExpandedError(expandedError === errorId ? null : errorId);
  };

  const recentErrors = errors.slice(-20).reverse(); // Show most recent first

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md w-full mx-4 md:mx-0">
      <div className={`bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-96'
      }`}>
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isMinimized ? '📋' : '📖'}
            </button>
            <h3 className="text-white font-bold text-sm">Error Console</h3>
            {errors.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {errors.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onCopyToClipboard}
              disabled={errors.length === 0}
              className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs px-2 py-1 rounded hover:bg-gray-700"
              title="Copy errors to clipboard"
            >
              Copy
            </button>
            <button
              onClick={onClear}
              disabled={errors.length === 0}
              className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs px-2 py-1 rounded hover:bg-gray-700"
              title="Clear all errors"
            >
              Clear
            </button>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors text-xs px-2 py-1 rounded hover:bg-gray-700"
              title="Hide error console"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4 h-80 overflow-y-auto">
            {errors.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-sm">No errors detected</p>
                <p className="text-xs mt-1">Your app is running smoothly!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentErrors.map((error) => (
                  <div
                    key={error.id}
                    className={`bg-gray-800 rounded-lg border-l-4 p-3 cursor-pointer transition-all duration-200 hover:bg-gray-750 ${
                      getLevelColor(error.level)
                    }`}
                    onClick={() => toggleExpanded(error.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">
                            [{formatTimestamp(error.timestamp)}]
                          </span>
                          <span className="text-xs font-bold uppercase">
                            {getLevelIcon(error.level)} {error.level}
                          </span>
                          {error.category && (
                            <span className="text-xs text-gray-500">
                              [{error.category}]
                            </span>
                          )}
                        </div>
                        <p className="text-white text-sm font-medium break-words">
                          {error.message}
                        </p>
                        {expandedError === error.id && error.context && (
                          <div className="mt-2 p-2 bg-gray-900 rounded text-xs">
                            <p className="text-gray-300 font-bold mb-1">Context:</p>
                            <pre className="text-gray-400 whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(error.context, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(error.id);
                        }}
                        className="text-gray-500 hover:text-white ml-2 text-xs"
                        title="Dismiss error"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;