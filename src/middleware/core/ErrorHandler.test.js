// src/middleware/core/ErrorHandler.test.js

const ErrorHandler = require('./ErrorHandler');

describe('ErrorHandler', () => {
  let errorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe('constructor', () => {
    test('should initialize with error categories', () => {
      expect(errorHandler.ERROR_CATEGORIES).toBeDefined();
      expect(errorHandler.ERROR_CATEGORIES.VALIDATION).toBe('validation');
      expect(errorHandler.ERROR_CATEGORIES.API).toBe('api');
      expect(errorHandler.ERROR_CATEGORIES.NETWORK).toBe('network');
      expect(errorHandler.ERROR_CATEGORIES.PERMISSION).toBe('permission');
    });

    test('should initialize with default messages', () => {
      expect(errorHandler.defaultMessages).toBeDefined();
      expect(errorHandler.defaultMessages.NETWORK_ERROR).toContain('Connection error');
      expect(errorHandler.defaultMessages.SERVER_ERROR).toContain('Server error');
    });
  });

  describe('categorizeError()', () => {
    test('should categorize network errors', () => {
      const error = { status: 0, message: 'Network error' };
      const category = errorHandler.categorizeError(error);

      expect(category).toBe('network');
    });

    test('should categorize 401 as permission error', () => {
      const error = { status: 401 };
      const category = errorHandler.categorizeError(error);

      expect(category).toBe('permission');
    });

    test('should categorize 403 as permission error', () => {
      const error = { status: 403 };
      const category = errorHandler.categorizeError(error);

      expect(category).toBe('permission');
    });

    test('should categorize 400 as validation error', () => {
      const error = { status: 400 };
      const category = errorHandler.categorizeError(error);

      expect(category).toBe('validation');
    });

    test('should categorize 409 as conflict error', () => {
      const error = { status: 409 };
      const category = errorHandler.categorizeError(error);

      expect(category).toBe('conflict');
    });

    test('should categorize 500 as API error', () => {
      const error = { status: 500 };
      const category = errorHandler.categorizeError(error);

      expect(category).toBe('api');
    });

    test('should categorize 404 as API error', () => {
      const error = { status: 404 };
      const category = errorHandler.categorizeError(error);

      expect(category).toBe('api');
    });

    test('should categorize unknown errors', () => {
      const error = { status: 418 }; // I'm a teapot
      const category = errorHandler.categorizeError(error);

      expect(category).toBe('unknown');
    });

    test('should handle null error', () => {
      const category = errorHandler.categorizeError(null);

      expect(category).toBe('unknown');
    });
  });

  describe('getErrorMessage()', () => {
    test('should return user-friendly message from error object', () => {
      const error = { message: 'User-friendly error message' };
      const message = errorHandler.getErrorMessage('ERROR_CODE', { error });

      expect(message).toBe('User-friendly error message');
    });

    test('should return message from error.data if available', () => {
      const error = {
        message: 'Technical error',
        data: { message: 'User-friendly message from data' }
      };
      const message = errorHandler.getErrorMessage('ERROR_CODE', { error });

      expect(message).toBe('User-friendly message from data');
    });

    test('should return network error message for status 0', () => {
      const message = errorHandler.getErrorMessage(0);

      expect(message).toContain('Connection error');
    });

    test('should return unauthorized message for 401', () => {
      const message = errorHandler.getErrorMessage(401);

      expect(message).toContain('not authorized');
    });

    test('should return forbidden message for 403', () => {
      const message = errorHandler.getErrorMessage(403);

      expect(message).toContain('permission');
    });

    test('should return not found message for 404', () => {
      const message = errorHandler.getErrorMessage(404);

      expect(message).toContain('not found');
    });

    test('should return validation message for 400', () => {
      const message = errorHandler.getErrorMessage(400);

      expect(message).toContain('invalid');
    });

    test('should return conflict message for 409', () => {
      const message = errorHandler.getErrorMessage(409);

      expect(message).toContain('conflict');
    });

    test('should return server error message for 500', () => {
      const message = errorHandler.getErrorMessage(500);

      expect(message).toContain('Server error');
    });

    test('should return unknown error message for unrecognized codes', () => {
      const message = errorHandler.getErrorMessage(999);

      expect(message).toContain('unexpected error');
    });
  });

  describe('transformError()', () => {
    test('should transform error with all fields', () => {
      const error = {
        status: 404,
        message: 'Not found',
        code: 'RESOURCE_NOT_FOUND'
      };

      const transformed = errorHandler.transformError(error);

      expect(transformed).toHaveProperty('category');
      expect(transformed).toHaveProperty('message');
      expect(transformed).toHaveProperty('code');
      expect(transformed).toHaveProperty('timestamp');
      expect(transformed).toHaveProperty('details');
      expect(transformed).toHaveProperty('suggestedAction');
      expect(transformed).toHaveProperty('retryable');
    });

    test('should include context when provided', () => {
      const error = { status: 500 };
      const transformed = errorHandler.transformError(error, {
        context: 'merging apps'
      });

      expect(transformed.context).toBe('merging apps');
    });

    test('should exclude details when includeDetails is false', () => {
      const error = { status: 500, message: 'Server error' };
      const transformed = errorHandler.transformError(error, {
        includeDetails: false
      });

      expect(transformed.details).toBeUndefined();
    });

    test('should exclude suggestedAction when suggestAction is false', () => {
      const error = { status: 500 };
      const transformed = errorHandler.transformError(error, {
        suggestAction: false
      });

      expect(transformed.suggestedAction).toBeUndefined();
    });

    test('should set correct category', () => {
      const networkError = { status: 0 };
      const transformed = errorHandler.transformError(networkError);

      expect(transformed.category).toBe('network');
    });

    test('should set retryable flag correctly', () => {
      const retryableError = { status: 500 };
      const nonRetryableError = { status: 400 };

      const retryable = errorHandler.transformError(retryableError);
      const nonRetryable = errorHandler.transformError(nonRetryableError);

      expect(retryable.retryable).toBe(true);
      expect(nonRetryable.retryable).toBe(false);
    });
  });

  describe('getSuggestedAction()', () => {
    test('should suggest checking internet connection for network errors', () => {
      const action = errorHandler.getSuggestedAction('network', { status: 0 });

      expect(action).toContain('internet connection');
    });

    test('should suggest logging in for 401 errors', () => {
      const action = errorHandler.getSuggestedAction('permission', { status: 401 });

      expect(action).toContain('log in');
    });

    test('should suggest contacting admin for 403 errors', () => {
      const action = errorHandler.getSuggestedAction('permission', { status: 403 });

      expect(action).toContain('administrator');
    });

    test('should suggest checking fields for validation errors', () => {
      const action = errorHandler.getSuggestedAction('validation', { status: 400 });

      expect(action).toContain('check');
    });

    test('should suggest refreshing for conflict errors', () => {
      const action = errorHandler.getSuggestedAction('conflict', { status: 409 });

      expect(action).toContain('Refresh');
    });

    test('should suggest trying again for API errors', () => {
      const action = errorHandler.getSuggestedAction('api', { status: 500 });

      expect(action).toContain('try again');
    });
  });

  describe('isTechnicalMessage()', () => {
    test('should identify technical error messages', () => {
      const technicalMessages = [
        'Error: Something went wrong',
        'TypeError: Cannot read property',
        'ReferenceError: x is not defined',
        'SyntaxError: Unexpected token',
        'Stack trace at line 42',
        'undefined is not a function'
      ];

      technicalMessages.forEach((msg) => {
        expect(errorHandler.isTechnicalMessage(msg)).toBe(true);
      });
    });

    test('should not flag user-friendly messages as technical', () => {
      const userFriendlyMessages = [
        'This app is currently locked',
        'You don\'t have permission',
        'The app was not found',
        'Please check your internet connection'
      ];

      userFriendlyMessages.forEach((msg) => {
        expect(errorHandler.isTechnicalMessage(msg)).toBe(false);
      });
    });
  });

  describe('isRetryable()', () => {
    test('should mark network errors as retryable', () => {
      const error = { status: 0 };

      expect(errorHandler.isRetryable(error)).toBe(true);
    });

    test('should mark 5xx errors as retryable', () => {
      const errors = [
        { status: 500 },
        { status: 502 },
        { status: 503 },
        { status: 504 }
      ];

      errors.forEach((error) => {
        expect(errorHandler.isRetryable(error)).toBe(true);
      });
    });

    test('should mark 429 rate limit as retryable', () => {
      const error = { status: 429 };

      expect(errorHandler.isRetryable(error)).toBe(true);
    });

    test('should NOT mark 4xx errors as retryable', () => {
      const errors = [
        { status: 400 },
        { status: 401 },
        { status: 403 },
        { status: 404 }
      ];

      errors.forEach((error) => {
        expect(errorHandler.isRetryable(error)).toBe(false);
      });
    });

    test('should NOT mark unknown errors as retryable', () => {
      const error = { status: 418 };

      expect(errorHandler.isRetryable(error)).toBe(false);
    });
  });

  describe('logError()', () => {
    let consoleErrorSpy;
    let consoleWarnSpy;
    let consoleInfoSpy;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });

    test('should log error to console with error level', () => {
      const error = { status: 500, message: 'Server error' };

      errorHandler.logError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should log with warning level when specified', () => {
      const error = { status: 400, message: 'Bad request' };

      errorHandler.logError(error, { level: 'warning' });

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    test('should log with info level when specified', () => {
      const error = { status: 404, message: 'Not found' };

      errorHandler.logError(error, { level: 'info' });

      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    test('should include metadata in log entry', () => {
      const error = { status: 500 };
      const metadata = { userId: 123, action: 'merge' };

      const logEntry = errorHandler.logError(error, { metadata });

      expect(logEntry.metadata).toEqual(metadata);
    });

    test('should return log entry', () => {
      const error = { status: 404 };

      const logEntry = errorHandler.logError(error);

      expect(logEntry).toHaveProperty('category');
      expect(logEntry).toHaveProperty('message');
      expect(logEntry).toHaveProperty('level');
    });
  });
});

