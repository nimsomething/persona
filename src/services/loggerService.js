import { APP_VERSION } from '../utils/appMeta';

const LOG_LEVELS = {
  DEBUG: { value: 0, color: '#9CA3AF', icon: '🔍' },
  INFO: { value: 1, color: '#3B82F6', icon: 'ℹ️' },
  WARN: { value: 2, color: '#F59E0B', icon: '⚠️' },
  ERROR: { value: 3, color: '#EF4444', icon: '❌' }
};

class LoggerService {
  constructor() {
    this.currentLevel = LOG_LEVELS.DEBUG.value;
    this.enableLocalStorageDebugging = false;
    this.setupGlobalErrorHandler();
  }

  setupGlobalErrorHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error('Global error caught', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.stack
        }, 'global');
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled promise rejection', {
          reason: event.reason,
          stack: event.reason?.stack
        }, 'global');
      });
    }
  }

  setLogLevel(level) {
    if (typeof level === 'string') {
      this.currentLevel = LOG_LEVELS[level.toUpperCase()]?.value ?? LOG_LEVELS.INFO.value;
    } else {
      this.currentLevel = level;
    }
  }

  toggleLocalStorageDebugging(enabled) {
    this.enableLocalStorageDebugging = enabled;
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, category, context = {}) {
    const levelConfig = LOG_LEVELS[level];
    const timestamp = this.formatTimestamp();
    const categoryTag = category ? `[${category.toUpperCase()}]` : '';
    const versionTag = `v${APP_VERSION}`;

    return {
      timestamp,
      level,
      category,
      message,
      version: versionTag,
      ...context
    };
  }

  log(level, message, context = {}, category = null) {
    const levelConfig = LOG_LEVELS[level];
    if (!levelConfig || levelConfig.value < this.currentLevel) {
      return;
    }

    const logEntry = this.formatMessage(level, message, category, context);

    // Console output with styling
    const style = `color: ${levelConfig.color}; font-weight: bold;`;
    const prefix = `%c${levelConfig.icon} ${logEntry.timestamp} [${level}]${categoryTag ? ` ${categoryTag}` : ''}`;
    console.log(prefix, style, message, context || '');

    // localStorage debugging for storage operations
    if (this.enableLocalStorageDebugging && category === 'storage') {
      this.saveToLocalStorageDebug(logEntry);
    }

    return logEntry;
  }

  saveToLocalStorageDebug(logEntry) {
    try {
      const debugKey = 'personality_assessment_debug_log';
      const existingLogs = JSON.parse(localStorage.getItem(debugKey) || '[]');
      existingLogs.push(logEntry);

      // Keep only last 100 log entries
      if (existingLogs.length > 100) {
        existingLogs.shift();
      }

      localStorage.setItem(debugKey, JSON.stringify(existingLogs));
    } catch (e) {
      // Silently fail to avoid infinite loops
    }
  }

  debug(message, context = {}, category = null) {
    return this.log('DEBUG', message, context, category);
  }

  info(message, context = {}, category = null) {
    return this.log('INFO', message, context, category);
  }

  warn(message, context = {}, category = null) {
    return this.log('WARN', message, context, category);
  }

  error(message, context = {}, category = null) {
    return this.log('ERROR', message, context, category);
  }

  // Specialized logging methods for common operations
  logStorageOperation(operation, key, dataSize, success, error = null) {
    if (success) {
      this.info(`Storage ${operation} successful`, {
        key,
        dataSize: `${dataSize} bytes`,
        operation
      }, 'storage');
    } else {
      this.error(`Storage ${operation} failed`, {
        key,
        dataSize: dataSize ? `${dataSize} bytes` : 'unknown',
        operation,
        error: error?.message || String(error)
      }, 'storage');
    }
  }

  logAssessmentEvent(event, userName, details = {}) {
    this.info(`Assessment ${event}`, {
      userName,
      ...details
    }, 'assessment');
  }

  logPDFGeneration(status, userName, details = {}) {
    if (status === 'started') {
      this.info('PDF generation started', { userName }, 'pdf');
    } else if (status === 'completed') {
      this.info('PDF generation completed', { userName, ...details }, 'pdf');
    } else if (status === 'failed') {
      this.error('PDF generation failed', { userName, ...details }, 'pdf');
    }
  }

  // Utility to measure and log performance
  async measureAsyncOperation(label, operationFn, category = 'performance') {
    const startTime = performance.now();
    this.debug(`${label} started`, {}, category);

    try {
      const result = await operationFn();
      const duration = performance.now() - startTime;
      this.debug(`${label} completed`, { duration: `${duration.toFixed(2)}ms` }, category);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.error(`${label} failed`, { duration: `${duration.toFixed(2)}ms`, error: error.message }, category);
      throw error;
    }
  }
}

export default new LoggerService();
