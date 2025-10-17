// src/middleware/config/defaults.js

/**
 * Default configuration values
 *
 * Defines default settings for API, locks, merge, cache, and validation.
 */

const DEFAULTS = {
  // API configuration
  API: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    retryBackoff: 2 // Exponential backoff multiplier
  },

  // Lock configuration
  LOCK: {
    defaultDuration: 600, // 10 minutes in seconds
    autoExtend: true,
    extendDuration: 300, // 5 minutes in seconds
    warningThreshold: 60, // 1 minute in seconds
    checkInterval: 10 // 10 seconds
  },

  // Merge configuration
  MERGE: {
    enableWebSocket: false, // WebSocket not implemented yet
    pollInterval: 2000, // 2 seconds
    maxRetries: 3,
    retryDelay: 5000 // 5 seconds
  },

  // Cache configuration
  CACHE: {
    enabled: true,
    defaultTTL: 300000, // 5 minutes in ms
    maxSize: 100, // Maximum cached entries
    maxAge: 3600000 // 1 hour in ms
  },

  // Validation configuration
  VALIDATION: {
    level: 'strict', // 'strict' or 'lenient'
    blockOnError: true,
    checkDuplicates: true,
    checkPermissions: true,
    checkLock: true,
    checkPlanLimits: true
  },

  // Workflow configuration
  WORKFLOW: {
    steps: [
      'destination-selection',
      'resource-configuration',
      'review'
    ],
    autoSave: false,
    confirmNavigation: true
  },

  // Resource selection defaults
  RESOURCES: {
    includePages: true,
    includeDataSources: true,
    includeFiles: true,
    includeFolders: true,
    includeAppSettings: false,
    includeMenuSettings: false,
    includeAppearanceSettings: false,
    includeGlobalCode: false
  }
};

/**
 * Get merged configuration
 *
 * @param {Object} [userConfig={}] - User-provided configuration
 * @returns {Object} Merged configuration with defaults
 */
function getMergedConfig(userConfig = {}) {
  return {
    api: { ...DEFAULTS.API, ...(userConfig.api || {}) },
    lock: { ...DEFAULTS.LOCK, ...(userConfig.lock || {}) },
    merge: { ...DEFAULTS.MERGE, ...(userConfig.merge || {}) },
    cache: { ...DEFAULTS.CACHE, ...(userConfig.cache || {}) },
    validation: { ...DEFAULTS.VALIDATION, ...(userConfig.validation || {}) },
    workflow: { ...DEFAULTS.WORKFLOW, ...(userConfig.workflow || {}) },
    resources: { ...DEFAULTS.RESOURCES, ...(userConfig.resources || {}) }
  };
}

export { DEFAULTS, getMergedConfig };

