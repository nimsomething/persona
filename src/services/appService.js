import logger from './loggerService';
import { APP_VERSION, APP_NAME, APP_DESCRIPTION, APP_VERSION_LABEL } from '../utils/appMeta';

// Re-export for convenience
export { APP_VERSION, APP_NAME, APP_DESCRIPTION, APP_VERSION_LABEL };

// --- Versioning ---

export const isV2Assessment = (version) => version?.startsWith('2.');
export const isV3Assessment = (version) => version?.startsWith('3.');

// --- Debugging ---

const urlParams = new URLSearchParams(window.location.search);
let debugEnabledState = urlParams.get('debug') !== 'false';

logger.isDebugEnabled = () => debugEnabledState;
window.__logger = logger;
window.__toggleDebug = (enabled) => {
    debugEnabledState = enabled;
    logger.toggleLocalStorageDebugging(enabled);
    logger.setLogLevel(enabled ? 'DEBUG' : 'INFO');
};

if (debugEnabledState) {
    logger.toggleLocalStorageDebugging(true);
    logger.setLogLevel('DEBUG');
} else {
    logger.setLogLevel('INFO');
    logger.toggleLocalStorageDebugging(false);
}

export const isDebugEnabled = () => debugEnabledState;

export function getDebugLogs() {
    try {
        const logs = localStorage.getItem('personality_assessment_debug_log');
        return logs ? JSON.parse(logs) : [];
    } catch (e) {
        console.error('Failed to retrieve debug logs:', e);
        return [];
    }
}

export function clearDebugLogs() {
    try {
        localStorage.removeItem('personality_assessment_debug_log');
        logger.info('Debug logs cleared', {}, 'debug');
        return true;
    } catch (e) {
        console.error('Failed to clear debug logs:', e);
        return false;
    }
}

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
}
