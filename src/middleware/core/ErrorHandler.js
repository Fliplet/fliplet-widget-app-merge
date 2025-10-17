// src/middleware/core/ErrorHandler.js

/**
 * ErrorHandler - Standardize error transformation and user-friendly messaging
 *
 * Transforms technical errors into user-friendly formats and provides
 * consistent error handling across the middleware layer.
 *
 * @class ErrorHandler
 */
class ErrorHandler {
  constructor() {
    // Error category constants
    this.ERROR_CATEGORIES = {
      VALIDATION: 'validation',
      API: 'api',
      NETWORK: 'network',
      PERMISSION: 'permission',
      CONFLICT: 'conflict',
      UNKNOWN: 'unknown'
    };

    // Default error messages
    this.defaultMessages = {
      NETWORK_ERROR: 'Connection error. Please check your internet connection and try again.',
      SERVER_ERROR: 'Server error. Please try again later.',
      NOT_FOUND: 'The requested resource was not found.',
      UNAUTHORIZED: 'You are not authorized to perform this action.',
      FORBIDDEN: 'You don\'t have permission to access this resource.',
      VALIDATION_ERROR: 'The provided data is invalid.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
    };
  }

  /**
   * Transform an error into user-friendly format
   *
   * @param {Error|Object} error - Error object from API or application
   * @param {Object} [options={}] - Transformation options
   * @param {boolean} [options.includeDetails=true] - Include technical details
   * @param {boolean} [options.suggestAction=true] - Suggest remediation action
   * @param {string} [options.context] - Context of the error (what user was doing)
   * @returns {Object} Transformed error object
   *
   * @example
   * const friendlyError = errorHandler.transformError(apiError, {
   *   context: 'merging apps',
   *   includeDetails: true
   * });
   */
  transformError(error, options = {}) {
    const {
      includeDetails = true,
      suggestAction = true,
      context = null
    } = options;

    const category = this.categorizeError(error);
    const message = this.getErrorMessage(error.code || error.status, { error, category });

    const transformedError = {
      category,
      message,
      code: error.code || error.status || 'UNKNOWN',
      timestamp: new Date().toISOString()
    };

    // Add context if provided
    if (context) {
      transformedError.context = context;
    }

    // Add technical details if requested
    if (includeDetails && error) {
      transformedError.details = {
        originalMessage: error.message,
        status: error.status,
        statusText: error.statusText,
        data: error.data
      };
    }

    // Add suggested action if requested
    if (suggestAction) {
      transformedError.suggestedAction = this.getSuggestedAction(category, error);
    }

    // Add retryable flag
    transformedError.retryable = this.isRetryable(error);

    return transformedError;
  }

  /**
   * Categorize an error by type
   *
   * @param {Error|Object} error - Error to categorize
   * @returns {string} Error category
   *
   * @private
   */
  categorizeError(error) {
    if (!error) {
      return this.ERROR_CATEGORIES.UNKNOWN;
    }

    // Network errors (status 0 or no status)
    if (error.status === 0 || error.message === 'Network error') {
      return this.ERROR_CATEGORIES.NETWORK;
    }

    // Permission errors
    if (error.status === 401 || error.status === 403) {
      return this.ERROR_CATEGORIES.PERMISSION;
    }

    // Validation errors
    if (error.status === 400 || error.category === 'validation') {
      return this.ERROR_CATEGORIES.VALIDATION;
    }

    // Conflict errors
    if (error.status === 409) {
      return this.ERROR_CATEGORIES.CONFLICT;
    }

    // API errors
    if (error.status >= 500) {
      return this.ERROR_CATEGORIES.API;
    }

    // 404 errors
    if (error.status === 404) {
      return this.ERROR_CATEGORIES.API;
    }

    return this.ERROR_CATEGORIES.UNKNOWN;
  }

  /**
   * Get user-friendly error message
   *
   * @param {string|number} errorCode - Error code or HTTP status
   * @param {Object} [context={}] - Additional context
   * @param {Object} [context.error] - Original error object
   * @param {string} [context.category] - Error category
   * @returns {string} User-friendly error message
   *
   * @example
   * const message = errorHandler.getErrorMessage(404, { category: 'api' });
   */
  getErrorMessage(errorCode, context = {}) {
    const { error, category } = context;

    // If error.data has a message, use it first (most specific)
    if (error && error.data && error.data.message) {
      return error.data.message;
    }

    // If error has a user-friendly message, use it
    if (error && error.message && !this.isTechnicalMessage(error.message)) {
      return error.message;
    }

    // Use status-based messages
    switch (errorCode) {
      case 0:
      case 'NETWORK_ERROR':
        return this.defaultMessages.NETWORK_ERROR;

      case 401:
      case 'UNAUTHORIZED':
        return this.defaultMessages.UNAUTHORIZED;

      case 403:
      case 'FORBIDDEN':
        return this.defaultMessages.FORBIDDEN;

      case 404:
      case 'NOT_FOUND':
        return this.defaultMessages.NOT_FOUND;

      case 400:
      case 'VALIDATION_ERROR':
        return this.defaultMessages.VALIDATION_ERROR;

      case 409:
      case 'CONFLICT':
        return 'This operation conflicts with the current state. Please refresh and try again.';

      case 500:
      case 502:
      case 503:
      case 504:
      case 'SERVER_ERROR':
        return this.defaultMessages.SERVER_ERROR;

      default:
        return this.defaultMessages.UNKNOWN_ERROR;
    }
  }

  /**
   * Get suggested action for recovery
   *
   * @param {string} category - Error category
   * @param {Object} error - Original error object
   * @returns {string} Suggested action
   *
   * @private
   */
  getSuggestedAction(category, error) {
    switch (category) {
      case this.ERROR_CATEGORIES.NETWORK:
        return 'Check your internet connection and try again.';

      case this.ERROR_CATEGORIES.PERMISSION:
        if (error.status === 401) {
          return 'Please log in again.';
        }

        return 'Contact your administrator for access.';

      case this.ERROR_CATEGORIES.VALIDATION:
        return 'Please check the highlighted fields and try again.';

      case this.ERROR_CATEGORIES.CONFLICT:
        return 'Refresh the page and try again.';

      case this.ERROR_CATEGORIES.API:
        if (error.status === 404) {
          return 'The item may have been deleted. Please refresh.';
        }

        return 'Please try again later or contact support if the issue persists.';

      default:
        return 'Please try again or contact support if the issue persists.';
    }
  }

  /**
   * Check if error message is technical
   *
   * @param {string} message - Error message
   * @returns {boolean} True if message appears technical
   *
   * @private
   */
  isTechnicalMessage(message) {
    const technicalPatterns = [
      /^Error:/i,
      /^TypeError:/i,
      /^ReferenceError:/i,
      /^SyntaxError:/i,
      /stack trace/i,
      /at line \d+/i,
      /undefined is not/i,
      /cannot read property/i
    ];

    return technicalPatterns.some((pattern) => pattern.test(message));
  }

  /**
   * Check if error is retryable
   *
   * @param {Object} error - Error object
   * @returns {boolean} True if error can be retried
   *
   * @private
   */
  isRetryable(error) {
    // Network errors are retryable
    if (error.status === 0) {
      return true;
    }

    // 5xx server errors are retryable
    if (error.status >= 500) {
      return true;
    }

    // 429 (rate limit) is retryable
    if (error.status === 429) {
      return true;
    }

    // 4xx client errors are not retryable
    if (error.status >= 400 && error.status < 500) {
      return false;
    }

    return false;
  }

  /**
   * Log error to console or external service
   *
   * @param {Error|Object} error - Error to log
   * @param {Object} [options={}] - Logging options
   * @param {string} [options.level='error'] - Log level
   * @param {boolean} [options.notify=false] - Send to error tracking service
   * @param {Object} [options.metadata={}] - Additional metadata
   *
   * @example
   * errorHandler.logError(error, {
   *   level: 'warning',
   *   metadata: { userId: 123, action: 'merge' }
   * });
   */
  logError(error, options = {}) {
    const {
      level = 'error',
      notify = false,
      metadata = {}
    } = options;

    const transformedError = this.transformError(error, {
      includeDetails: true,
      suggestAction: false
    });

    const logEntry = {
      ...transformedError,
      level,
      metadata
    };

    // Log to console based on level
    switch (level) {
      case 'error':
        console.error('[ErrorHandler]', logEntry);
        break;
      case 'warning':
        console.warn('[ErrorHandler]', logEntry);
        break;
      case 'info':
        console.info('[ErrorHandler]', logEntry);
        break;
      default:
        console.log('[ErrorHandler]', logEntry);
    }

    // Send to external error tracking service if notify is true
    if (notify && typeof Fliplet !== 'undefined' && Fliplet.Analytics) {
      // Send to Fliplet Analytics or error tracking service
      Fliplet.Analytics.trackError(error, metadata);
    }

    return logEntry;
  }
}

export default ErrorHandler;

