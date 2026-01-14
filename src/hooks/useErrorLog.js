import { useState, useEffect, useCallback } from 'react';
import logger from '../services/loggerService';

export const useErrorLog = () => {
  const [errors, setErrors] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Load existing errors on mount
  useEffect(() => {
    const existingErrors = logger.loadErrorsFromLocalStorage();
    setErrors(existingErrors);

    // Subscribe to new errors
    const unsubscribe = logger.subscribeToErrors((newError) => {
      setErrors(prevErrors => {
        const updated = [...prevErrors, newError];
        // Keep only last 20 errors in memory
        if (updated.length > 20) {
          return updated.slice(-20);
        }
        return updated;
      });

      // Auto-show panel when errors occur
      setIsVisible(true);
    });

    // Load from URL parameter (?errors=true)
    const urlParams = new URLSearchParams(window.location.search);
    const showErrors = urlParams.get('errors') === 'true';
    if (showErrors) {
      setIsVisible(true);
    }

    return unsubscribe;
  }, []);

  const addError = useCallback((message, context = {}, category = 'app') => {
    logger.error(message, context, category);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
    logger.clearErrorLog();
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const dismissError = useCallback((errorId) => {
    setErrors(prevErrors => prevErrors.filter(error => error.id !== errorId));
  }, []);

  const copyErrorsToClipboard = useCallback(async () => {
    try {
      const errorsJson = JSON.stringify(errors, null, 2);
      await navigator.clipboard.writeText(errorsJson);
      return true;
    } catch (error) {
      console.error('Failed to copy errors to clipboard:', error);
      return false;
    }
  }, [errors]);

  return {
    errors,
    isVisible,
    addError,
    clearErrors,
    toggleVisibility,
    dismissError,
    copyErrorsToClipboard
  };
};