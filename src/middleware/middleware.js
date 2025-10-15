// src/middleware/middleware.js

/**
 * AppMergeMiddleware - Main middleware entry point
 *
 * Initializes and provides access to all middleware services and controllers
 * for the App Merge Widget.
 *
 * @class AppMergeMiddleware
 *
 * @example
 * const middleware = new AppMergeMiddleware({ cache: { enabled: true } });
 * await middleware.initialize();
 *
 * // Start configuration
 * await middleware.startConfiguration(sourceAppId);
 *
 * // Update configuration
 * middleware.updateConfiguration({ destinationAppId: 456 });
 *
 * // Initiate merge
 * const result = await middleware.initiateMerge(sourceAppId, mergeConfig);
 */

// Import core classes
const ApiClient = require('./core/ApiClient');
const StateManager = require('./core/StateManager');
const ValidationEngine = require('./core/ValidationEngine');
const ErrorHandler = require('./core/ErrorHandler');

// Import API services
const AppsApiService = require('./api/AppsApiService');
const OrganizationsApiService = require('./api/OrganizationsApiService');
const PagesApiService = require('./api/PagesApiService');
const DataSourcesApiService = require('./api/DataSourcesApiService');
const MediaApiService = require('./api/MediaApiService');
const MergeApiService = require('./api/MergeApiService');

// Import controllers
const ValidationController = require('./controllers/ValidationController');
const AppLockController = require('./controllers/AppLockController');
const MergeConfigurationController = require('./controllers/MergeConfigurationController');
const MergeExecutionController = require('./controllers/MergeExecutionController');

// Import utilities
const EventEmitter = require('./utils/EventEmitter');
const DataMapper = require('./utils/DataMapper');
const CacheManager = require('./utils/CacheManager');

// Import configuration
const { getMergedConfig } = require('./config/defaults');

class AppMergeMiddleware {
  /**
   * Create AppMergeMiddleware instance
   *
   * @param {Object} [userConfig={}] - User configuration
   */
  constructor(userConfig = {}) {
    this.userConfig = userConfig;
    this.config = null;
    this.initialized = false;

    // Will be initialized in initialize()
    this.core = {};
    this.api = {};
    this.controllers = {};
    this.utils = {};
  }

  /**
   * Initialize middleware with configuration
   *
   * @param {Object} [config={}] - Additional configuration
   * @returns {Promise<void>}
   *
   * @example
   * await middleware.initialize({ api: { timeout: 60000 } });
   */
  async initialize(config = {}) {
    if (this.initialized) {
      throw new Error('Middleware already initialized');
    }

    // Merge configurations
    this.config = getMergedConfig({ ...this.userConfig, ...config });

    // Initialize utilities
    this.utils.eventEmitter = new EventEmitter();
    this.utils.cacheManager = new CacheManager({
      maxSize: this.config.cache.maxSize,
      defaultTTL: this.config.cache.defaultTTL
    });
    this.utils.dataMapper = DataMapper;

    // Initialize core foundation
    this.core.apiClient = new ApiClient();
    this.core.stateManager = new StateManager(this.utils.eventEmitter);
    this.core.validationEngine = new ValidationEngine();
    this.core.errorHandler = new ErrorHandler();

    // Initialize API services
    this.api.apps = new AppsApiService(this.core.apiClient);
    this.api.organizations = new OrganizationsApiService(this.core.apiClient);
    this.api.pages = new PagesApiService(this.core.apiClient);
    this.api.dataSources = new DataSourcesApiService(this.core.apiClient);
    this.api.media = new MediaApiService(this.core.apiClient);
    this.api.merge = new MergeApiService(this.core.apiClient);

    // Initialize controllers
    this.controllers.validation = new ValidationController(
      this.api.apps,
      this.core.validationEngine
    );

    this.controllers.appLock = new AppLockController(
      this.api.merge,
      this.core.stateManager,
      this.utils.eventEmitter
    );

    this.controllers.configuration = new MergeConfigurationController({
      appsApiService: this.api.apps,
      pagesApiService: this.api.pages,
      dataSourcesApiService: this.api.dataSources,
      mediaApiService: this.api.media,
      stateManager: this.core.stateManager,
      validationController: this.controllers.validation,
      appLockController: this.controllers.appLock,
      eventEmitter: this.utils.eventEmitter
    });

    this.controllers.execution = new MergeExecutionController(
      this.api.merge,
      this.core.stateManager,
      this.utils.eventEmitter
    );

    this.initialized = true;
  }

  /**
   * Start configuration workflow
   *
   * @param {number} sourceAppId - Source app ID
   * @param {Object} [options={}] - Configuration options
   * @returns {Promise<Object>} Configuration result
   */
  async startConfiguration(sourceAppId, options = {}) {
    this.ensureInitialized();

    return this.controllers.configuration.startConfiguration(sourceAppId, options);
  }

  /**
   * Update configuration
   *
   * @param {Object} updates - Configuration updates
   * @returns {Object} Updated configuration
   */
  updateConfiguration(updates) {
    this.ensureInitialized();

    return this.controllers.configuration.updateConfiguration(updates);
  }

  /**
   * Get current configuration
   *
   * @param {Object} [options={}] - Get options
   * @returns {Object} Current configuration
   */
  getConfiguration(options = {}) {
    this.ensureInitialized();

    return this.controllers.configuration.getConfiguration(options);
  }

  /**
   * Proceed to next step
   *
   * @param {Object} [options={}] - Options
   * @returns {Promise<Object>} Result
   */
  async proceedToNextStep(options = {}) {
    this.ensureInitialized();

    return this.controllers.configuration.proceedToNextStep(options);
  }

  /**
   * Return to previous step
   *
   * @param {Object} [options={}] - Options
   * @returns {Promise<Object>} Result
   */
  async returnToPreviousStep(options = {}) {
    this.ensureInitialized();

    return this.controllers.configuration.returnToPreviousStep(options);
  }

  /**
   * Cancel configuration
   *
   * @param {Object} [options={}] - Options
   * @returns {Promise<Object>} Result
   */
  async cancelConfiguration(options = {}) {
    this.ensureInitialized();

    return this.controllers.configuration.cancelConfiguration(options);
  }

  /**
   * Initiate merge
   *
   * @param {number} sourceAppId - Source app ID
   * @param {Object} mergeConfig - Merge configuration
   * @param {Object} [options={}] - Execution options
   * @returns {Promise<Object>} Merge result
   */
  async initiateMerge(sourceAppId, mergeConfig, options = {}) {
    this.ensureInitialized();

    return this.controllers.execution.initiateMerge(sourceAppId, mergeConfig, options);
  }

  /**
   * Get merge result
   *
   * @param {number} sourceAppId - Source app ID
   * @param {number} mergeId - Merge ID
   * @returns {Promise<Object>} Merge result
   */
  async getMergeResult(sourceAppId, mergeId) {
    this.ensureInitialized();

    return this.controllers.execution.getMergeResult(sourceAppId, mergeId);
  }

  /**
   * Subscribe to event
   *
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {void}
   */
  on(event, handler) {
    this.ensureInitialized();

    this.utils.eventEmitter.on(event, handler);
  }

  /**
   * Unsubscribe from event
   *
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {void}
   */
  off(event, handler) {
    this.ensureInitialized();

    this.utils.eventEmitter.off(event, handler);
  }

  /**
   * Clean up middleware resources
   *
   * @returns {void}
   */
  cleanup() {
    if (this.controllers.appLock) {
      this.controllers.appLock.cleanup();
    }

    if (this.controllers.execution) {
      this.controllers.execution.cleanup();
    }

    if (this.utils.cacheManager) {
      this.utils.cacheManager.clear();
    }

    if (this.core.stateManager) {
      this.core.stateManager.clearState();
    }
  }

  /**
   * Ensure middleware is initialized
   *
   * @throws {Error} If not initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Middleware not initialized. Call initialize() first.');
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppMergeMiddleware;
}

