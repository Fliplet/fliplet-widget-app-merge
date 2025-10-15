// src/middleware/core/ValidationEngine.js

/**
 * ValidationEngine - Client-side validation before API calls
 *
 * Provides validation logic for merge configuration including app selection,
 * resource selection, and business rule validation.
 *
 * @class ValidationEngine
 */
class ValidationEngine {
  constructor() {
    this.validationErrors = [];
  }

  /**
   * Validate app selection
   *
   * Ensures source and destination apps are different and valid.
   *
   * @param {number|null} sourceAppId - Source app ID
   * @param {number|null} destinationAppId - Destination app ID
   * @returns {Object} Validation result
   *
   * @example
   * const result = validationEngine.validateAppSelection(123, 456);
   * if (!result.valid) {
   *   console.log('Errors:', result.errors);
   * }
   */
  validateAppSelection(sourceAppId, destinationAppId) {
    this.clearErrors();

    // Check if both IDs are provided
    if (!sourceAppId) {
      this.addError('sourceAppId', 'Source app is required', 'required');
    }

    if (!destinationAppId) {
      this.addError('destinationAppId', 'Destination app is required', 'required');
    }

    // Check if IDs are numbers
    if (sourceAppId && typeof sourceAppId !== 'number') {
      this.addError('sourceAppId', 'Source app ID must be a number', 'type');
    }

    if (destinationAppId && typeof destinationAppId !== 'number') {
      this.addError('destinationAppId', 'Destination app ID must be a number', 'type');
    }

    // Check if source and destination are different
    if (sourceAppId && destinationAppId && sourceAppId === destinationAppId) {
      this.addError(
        'destinationAppId',
        'Source and destination apps cannot be the same',
        'constraint'
      );
    }

    return this.getValidationResult();
  }

  /**
   * Validate resource selection
   *
   * Ensures at least one resource is selected for merge.
   *
   * @param {Object} config - Merge configuration
   * @param {Array} [config.selectedPages=[]] - Selected pages
   * @param {Array} [config.selectedDataSources=[]] - Selected data sources
   * @param {Array} [config.selectedFiles=[]] - Selected files
   * @param {Array} [config.selectedFolders=[]] - Selected folders
   * @param {Object} [config.appLevelSettings={}] - App-level settings
   * @returns {Object} Validation result
   *
   * @example
   * const result = validationEngine.validateResourceSelection({
   *   selectedPages: [1, 2, 3],
   *   selectedDataSources: []
   * });
   */
  validateResourceSelection(config) {
    this.clearErrors();

    const {
      selectedPages = [],
      selectedDataSources = [],
      selectedFiles = [],
      selectedFolders = [],
      appLevelSettings = {}
    } = config;

    // Check if at least one resource is selected
    const hasPages = selectedPages.length > 0;
    const hasDataSources = selectedDataSources.length > 0;
    const hasFiles = selectedFiles.length > 0;
    const hasFolders = selectedFolders.length > 0;

    const hasAppLevelSettings = Object.values(appLevelSettings).some((value) => value === true);

    const hasAnySelection = hasPages || hasDataSources || hasFiles || hasFolders || hasAppLevelSettings;

    if (!hasAnySelection) {
      this.addError(
        'selection',
        'You must select at least one screen, data source, file, folder, or app-level setting',
        'required'
      );
    }

    return this.getValidationResult();
  }

  /**
   * Validate data types in configuration
   *
   * Checks that all IDs are numbers and arrays are valid.
   *
   * @param {Object} config - Merge configuration to validate
   * @returns {Object} Validation result
   */
  validateDataTypes(config) {
    this.clearErrors();

    // Validate source app
    if (config.sourceApp) {
      if (config.sourceApp.id && typeof config.sourceApp.id !== 'number') {
        this.addError('sourceApp.id', 'Source app ID must be a number', 'type');
      }

      if (config.sourceApp.organizationId && typeof config.sourceApp.organizationId !== 'number') {
        this.addError('sourceApp.organizationId', 'Organization ID must be a number', 'type');
      }
    }

    // Validate destination app
    if (config.destinationApp) {
      if (config.destinationApp.id && typeof config.destinationApp.id !== 'number') {
        this.addError('destinationApp.id', 'Destination app ID must be a number', 'type');
      }

      if (config.destinationApp.organizationId && typeof config.destinationApp.organizationId !== 'number') {
        this.addError('destinationApp.organizationId', 'Organization ID must be a number', 'type');
      }
    }

    // Validate selected pages
    if (config.selectedPages && !Array.isArray(config.selectedPages)) {
      this.addError('selectedPages', 'Selected pages must be an array', 'type');
    }

    // Validate selected data sources
    if (config.selectedDataSources && !Array.isArray(config.selectedDataSources)) {
      this.addError('selectedDataSources', 'Selected data sources must be an array', 'type');
    }

    // Validate selected files
    if (config.selectedFiles && !Array.isArray(config.selectedFiles)) {
      this.addError('selectedFiles', 'Selected files must be an array', 'type');
    }

    // Validate app-level settings
    if (config.appLevelSettings && typeof config.appLevelSettings !== 'object') {
      this.addError('appLevelSettings', 'App-level settings must be an object', 'type');
    }

    return this.getValidationResult();
  }

  /**
   * Validate business constraints
   *
   * Validates business rules like duplicate names, permissions, etc.
   *
   * @param {Object} config - Configuration with validation state
   * @returns {Object} Validation result
   */
  validateConstraints(config) {
    this.clearErrors();

    // Check for duplicate pages in source app
    if (config.validationState && config.validationState.sourceAppDuplicates) {
      const { pages = [], dataSources = [] } = config.validationState.sourceAppDuplicates;

      if (pages.length > 0) {
        const pageNames = pages.map((p) => p.title || p.name).join(', ');

        this.addError(
          'sourceApp.duplicates',
          `Source app contains duplicate screen names: ${pageNames}`,
          'constraint'
        );
      }

      if (dataSources.length > 0) {
        const dsNames = dataSources.map((ds) => ds.name).join(', ');

        this.addError(
          'sourceApp.duplicates',
          `Source app contains duplicate data source names: ${dsNames}`,
          'constraint'
        );
      }
    }

    // Check for duplicate pages in destination app
    if (config.validationState && config.validationState.destinationAppDuplicates) {
      const { pages = [], dataSources = [] } = config.validationState.destinationAppDuplicates;

      if (pages.length > 0) {
        const pageNames = pages.map((p) => p.title || p.name).join(', ');

        this.addError(
          'destinationApp.duplicates',
          `Destination app contains duplicate screen names: ${pageNames}`,
          'constraint'
        );
      }

      if (dataSources.length > 0) {
        const dsNames = dataSources.map((ds) => ds.name).join(', ');

        this.addError(
          'destinationApp.duplicates',
          `Destination app contains duplicate data source names: ${dsNames}`,
          'constraint'
        );
      }
    }

    return this.getValidationResult();
  }

  /**
   * Get all validation errors
   *
   * @returns {Array} List of validation errors
   */
  getValidationErrors() {
    return this.validationErrors;
  }

  /**
   * Get validation result
   *
   * @returns {Object} Validation result with valid flag and errors
   *
   * @private
   */
  getValidationResult() {
    return {
      valid: this.validationErrors.length === 0,
      errors: this.validationErrors
    };
  }

  /**
   * Add a validation error
   *
   * @param {string} field - Field name with error
   * @param {string} message - Error message
   * @param {string} type - Error type (required, type, constraint, etc.)
   *
   * @private
   */
  addError(field, message, type) {
    this.validationErrors.push({
      field,
      message,
      type
    });
  }

  /**
   * Clear all validation errors
   *
   * @private
   */
  clearErrors() {
    this.validationErrors = [];
  }

  /**
   * Validate complete merge configuration
   *
   * Runs all validation checks on the configuration.
   *
   * @param {Object} config - Complete merge configuration
   * @returns {Object} Validation result
   *
   * @example
   * const result = validationEngine.validateConfiguration({
   *   sourceApp: { id: 123 },
   *   destinationApp: { id: 456 },
   *   selectedPages: [1, 2, 3]
   * });
   */
  validateConfiguration(config) {
    // Collect all errors in a local array
    const allErrors = [];

    // Validate app selection
    const sourceAppId = config.sourceApp ? config.sourceApp.id : null;
    const destinationAppId = config.destinationApp ? config.destinationApp.id : null;

    const appSelectionResult = this.validateAppSelection(sourceAppId, destinationAppId);

    allErrors.push(...appSelectionResult.errors);

    // Validate resource selection (only if app selection is valid)
    if (appSelectionResult.valid) {
      const resourceResult = this.validateResourceSelection(config);

      allErrors.push(...resourceResult.errors);
    }

    // Validate data types
    const dataTypeResult = this.validateDataTypes(config);

    allErrors.push(...dataTypeResult.errors);

    // Validate constraints
    const constraintsResult = this.validateConstraints(config);

    allErrors.push(...constraintsResult.errors);

    // Set all collected errors at once
    this.validationErrors = allErrors;

    return this.getValidationResult();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationEngine;
}

