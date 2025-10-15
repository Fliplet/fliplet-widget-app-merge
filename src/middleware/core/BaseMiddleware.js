// src/middleware/core/BaseMiddleware.js

const EventEmitter = require('../utils/EventEmitter');

/**
 * BaseMiddleware - Foundation class with common utilities and dependency injection
 *
 * Provides base functionality for middleware components including
 * configuration management, dependency injection, and event emission.
 *
 * @class BaseMiddleware
 */
class BaseMiddleware {
  /**
   * Create BaseMiddleware instance
   *
   * @param {Object} [dependencies={}] - Dependencies to inject
   * @param {Object} [config={}] - Initial configuration
   *
   * @example
   * const middleware = new BaseMiddleware({
   *   apiClient: new ApiClient(),
   *   stateManager: new StateManager()
   * }, {
   *   timeout: 30000
   * });
   */
  constructor(dependencies = {}, config = {}) {
    this.dependencies = dependencies;
    this.config = config;
    this.eventEmitter = dependencies.eventEmitter || new EventEmitter();
    this.initialized = false;
  }

  /**
   * Initialize middleware with configuration
   *
   * Merges provided config with existing config and sets initialized flag.
   *
   * @param {Object} [config={}] - Configuration to merge
   * @returns {BaseMiddleware} Returns this for chaining
   *
   * @example
   * middleware.initialize({
   *   apiUrl: 'https://api.example.com',
   *   timeout: 60000
   * });
   */
  initialize(config = {}) {
    this.config = {
      ...this.config,
      ...config
    };

    this.initialized = true;

    this.emit('middleware:initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });

    return this;
  }

  /**
   * Get injected dependency by name
   *
   * @param {string} name - Dependency name
   * @returns {*} Dependency instance or undefined
   *
   * @example
   * const apiClient = middleware.getDependency('apiClient');
   */
  getDependency(name) {
    return this.dependencies[name];
  }

  /**
   * Check if a dependency exists
   *
   * @param {string} name - Dependency name
   * @returns {boolean} True if dependency exists
   *
   * @example
   * if (middleware.hasDependency('apiClient')) {
   *   // Use apiClient
   * }
   */
  hasDependency(name) {
    return this.dependencies[name] !== undefined;
  }

  /**
   * Set or update a dependency
   *
   * @param {string} name - Dependency name
   * @param {*} dependency - Dependency instance
   * @returns {BaseMiddleware} Returns this for chaining
   *
   * @example
   * middleware.setDependency('logger', new Logger());
   */
  setDependency(name, dependency) {
    this.dependencies[name] = dependency;

    return this;
  }

  /**
   * Get configuration value by key
   *
   * Supports dot-notation paths like 'api.timeout'
   *
   * @param {string} key - Configuration key
   * @param {*} [defaultValue] - Default value if key not found
   * @returns {*} Configuration value
   *
   * @example
   * const timeout = middleware.getConfig('timeout', 30000);
   * const apiUrl = middleware.getConfig('api.url');
   */
  getConfig(key, defaultValue) {
    if (!key) {
      return this.config;
    }

    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value === null || value === undefined) {
        return defaultValue;
      }

      value = value[k];
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set configuration value by key
   *
   * Supports dot-notation paths like 'api.timeout'
   *
   * @param {string} key - Configuration key
   * @param {*} value - Value to set
   * @returns {BaseMiddleware} Returns this for chaining
   *
   * @example
   * middleware.setConfig('timeout', 60000);
   * middleware.setConfig('api.url', 'https://api.example.com');
   */
  setConfig(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let current = this.config;

    for (const k of keys) {
      if (current[k] === null || current[k] === undefined) {
        current[k] = {};
      }

      current = current[k];
    }

    current[lastKey] = value;

    return this;
  }

  /**
   * Emit an event
   *
   * Wrapper for event emitter emit() method.
   *
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {BaseMiddleware} Returns this for chaining
   *
   * @example
   * middleware.emit('data:loaded', { count: 10 });
   */
  emit(event, data) {
    this.eventEmitter.emit(event, data);

    return this;
  }

  /**
   * Subscribe to an event
   *
   * Wrapper for event emitter on() method.
   *
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {BaseMiddleware} Returns this for chaining
   *
   * @example
   * middleware.on('data:loaded', (data) => {
   *   console.log('Data loaded:', data.count);
   * });
   */
  on(event, callback) {
    this.eventEmitter.on(event, callback);

    return this;
  }

  /**
   * Subscribe to an event once
   *
   * Wrapper for event emitter once() method.
   *
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {BaseMiddleware} Returns this for chaining
   */
  once(event, callback) {
    this.eventEmitter.once(event, callback);

    return this;
  }

  /**
   * Unsubscribe from an event
   *
   * Wrapper for event emitter off() method.
   *
   * @param {string} event - Event name
   * @param {Function} [callback] - Specific callback to remove
   * @returns {BaseMiddleware} Returns this for chaining
   */
  off(event, callback) {
    this.eventEmitter.off(event, callback);

    return this;
  }

  /**
   * Check if middleware is initialized
   *
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Ensure middleware is initialized
   *
   * Throws error if not initialized.
   *
   * @throws {Error} If middleware not initialized
   *
   * @example
   * middleware.ensureInitialized();
   * // Proceed with operations...
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Middleware must be initialized before use. Call initialize() first.');
    }
  }

  /**
   * Get all dependencies
   *
   * @returns {Object} All dependencies
   */
  getDependencies() {
    return { ...this.dependencies };
  }

  /**
   * Get all configuration
   *
   * @returns {Object} All configuration
   */
  getAllConfig() {
    return { ...this.config };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseMiddleware;
}

