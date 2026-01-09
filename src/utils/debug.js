import logger from '../services/loggerService';

/**
 * Debug utility for development and troubleshooting
 * Add ?debug=true to URL to enable localStorage debugging
 */

// Check URL for debug flag
const urlParams = new URLSearchParams(window.location.search);
const debugEnabled = urlParams.has('debug');

if (debugEnabled) {
  logger.toggleLocalStorageDebugging(true);
  logger.setLogLevel('DEBUG');
  logger.info('Debug mode enabled via URL parameter', {}, 'debug');

  // Expose logger to window for console debugging
  window.__logger = logger;
  window.__toggleDebug = (enabled) => {
    logger.toggleLocalStorageDebugging(enabled);
    logger.setLogLevel(enabled ? 'DEBUG' : 'INFO');
    logger.info(`Debug ${enabled ? 'enabled' : 'disabled'}`, {}, 'debug');
  };
}

export const isDebugEnabled = debugEnabled;

/**
 * Helper to get debug logs from localStorage
 */
export function getDebugLogs() {
  try {
    const debugKey = 'personality_assessment_debug_log';
    const logs = localStorage.getItem(debugKey);
    return logs ? JSON.parse(logs) : [];
  } catch (e) {
    console.error('Failed to retrieve debug logs:', e);
    return [];
  }
}

/**
 * Helper to clear debug logs from localStorage
 */
export function clearDebugLogs() {
  try {
    const debugKey = 'personality_assessment_debug_log';
    localStorage.removeItem(debugKey);
    logger.info('Debug logs cleared', {}, 'debug');
    return true;
  } catch (e) {
    console.error('Failed to clear debug logs:', e);
    return false;
  }
}

/**
 * Helper to export debug logs as JSON
 */
export function exportDebugLogs() {
  const logs = getDebugLogs();
  const dataStr = JSON.stringify(logs, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `personality-assessment-debug-${new Date().toISOString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  logger.info('Debug logs exported', { logCount: logs.length }, 'debug');
}

export default logger;
