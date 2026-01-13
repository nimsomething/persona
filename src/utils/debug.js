import logger from '../services/loggerService';

/**
 * Debug utility for development and troubleshooting
 * Debug mode is enabled by default in development.
 * Use ?debug=false in URL to disable if needed.
 */

// Check URL for debug flag
const urlParams = new URLSearchParams(window.location.search);
// Debug is enabled by default unless ?debug=false is specified
let debugEnabledState = urlParams.get('debug') !== 'false';

// Attach to logger so logger.isDebugEnabled() works throughout the app
logger.isDebugEnabled = () => debugEnabledState;

// Expose logger to window for console debugging - always available in dev
window.__logger = logger;
window.__toggleDebug = (enabled) => {
  debugEnabledState = enabled;
  logger.toggleLocalStorageDebugging(enabled);
  logger.setLogLevel(enabled ? 'DEBUG' : 'INFO');
  logger.info(`Debug ${enabled ? 'enabled' : 'disabled'}`, { 
    debugEnabledState,
    logLevel: enabled ? 'DEBUG' : 'INFO'
  }, 'debug');
};

if (debugEnabledState) {
  logger.toggleLocalStorageDebugging(true);
  logger.setLogLevel('DEBUG');
  logger.info('Debug mode enabled by default', { 
    localStorageDebugging: true,
    logLevel: 'DEBUG',
    howToDisable: 'Add ?debug=false to URL to disable'
  }, 'debug');
} else {
  // If explicitly disabled, ensure logger is in INFO mode
  logger.setLogLevel('INFO');
  logger.toggleLocalStorageDebugging(false);
}

export const isDebugEnabled = () => debugEnabledState;

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
