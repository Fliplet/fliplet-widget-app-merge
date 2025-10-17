// src/middleware/controllers/MergeConfigurationController.js

/**
 * MergeConfigurationController - Orchestrates multi-step merge configuration workflow
 *
 * Manages the entire configuration process including destination selection,
 * resource configuration, validation, and state management.
 *
 * @class MergeConfigurationController
 */
class MergeConfigurationController {
  /**
   * Create MergeConfigurationController instance
   *
   * @param {Object} dependencies - Controller dependencies
   * @param {Object} dependencies.appsApiService - AppsApiService instance
   * @param {Object} dependencies.pagesApiService - PagesApiService instance
   * @param {Object} dependencies.dataSourcesApiService - DataSourcesApiService instance
   * @param {Object} dependencies.mediaApiService - MediaApiService instance
   * @param {Object} dependencies.stateManager - StateManager instance
   * @param {Object} dependencies.validationController - ValidationController instance
   * @param {Object} dependencies.appLockController - AppLockController instance
   * @param {Object} dependencies.eventEmitter - EventEmitter instance
   */
  constructor(dependencies = {}) {
    const {
      appsApiService,
      pagesApiService,
      dataSourcesApiService,
      mediaApiService,
      stateManager,
      validationController,
      appLockController,
      eventEmitter
    } = dependencies;

    // Validate required dependencies
    if (!appsApiService) throw new Error('appsApiService is required');
    if (!pagesApiService) throw new Error('pagesApiService is required');
    if (!dataSourcesApiService) throw new Error('dataSourcesApiService is required');
    if (!mediaApiService) throw new Error('mediaApiService is required');
    if (!stateManager) throw new Error('stateManager is required');
    if (!validationController) throw new Error('validationController is required');
    if (!appLockController) throw new Error('appLockController is required');
    if (!eventEmitter) throw new Error('eventEmitter is required');

    this.appsApiService = appsApiService;
    this.pagesApiService = pagesApiService;
    this.dataSourcesApiService = dataSourcesApiService;
    this.mediaApiService = mediaApiService;
    this.stateManager = stateManager;
    this.validationController = validationController;
    this.appLockController = appLockController;
    this.eventEmitter = eventEmitter;

    // Define workflow steps
    this.workflowSteps = [
      'destination-selection',
      'resource-configuration',
      'review'
    ];
  }

  /**
   * Start configuration workflow
   *
   * @param {number} sourceAppId - Source app ID
   * @param {Object} [options={}] - Configuration options
   * @param {boolean} [options.validateSource=true] - Validate source app
   * @returns {Promise<Object>} Configuration initialization result
   *
   * @example
   * const result = await controller.startConfiguration(123);
   */
  async startConfiguration(sourceAppId, options = {}) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    const { validateSource = true } = options;

    try {
      // Validate source app if requested
      if (validateSource) {
        const validation = await this.validationController.validateAppForMerge(sourceAppId, {
          checkDuplicates: true,
          checkPermissions: true,
          checkLock: false
        });

        if (!validation.isValid) {
          throw new Error(`Source app validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
        }
      }

      // Initialize configuration state
      this.stateManager.setState('mergeConfiguration', {
        sourceAppId,
        currentStep: 'destination-selection',
        stepIndex: 0,
        startedAt: new Date().toISOString(),
        isComplete: false
      });

      // Emit configuration started event
      this.eventEmitter.emit('configuration:started', { sourceAppId });

      return {
        success: true,
        sourceAppId,
        currentStep: 'destination-selection'
      };
    } catch (error) {
      this.eventEmitter.emit('configuration:failed', {
        sourceAppId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Validate current step
   *
   * @param {string} stepName - Step name to validate
   * @param {Object} [options={}] - Validation options
   * @returns {Promise<Object>} Validation result
   *
   * @example
   * const result = await controller.validateStep('destination-selection');
   */
  async validateStep(stepName, options = {}) {
    const config = this.stateManager.getState('mergeConfiguration');

    if (!config) {
      return {
        isValid: false,
        errors: [{ message: 'No active configuration found' }]
      };
    }

    switch (stepName) {
      case 'destination-selection':
        return this.validateDestinationSelection(config);

      case 'resource-configuration':
        return this.validateResourceConfiguration(config);

      case 'review':
        return this.validateReview(config);

      default:
        return {
          isValid: false,
          errors: [{ message: `Unknown step: ${stepName}` }]
        };
    }
  }

  /**
   * Validate destination selection step
   *
   * @param {Object} config - Current configuration
   * @returns {Promise<Object>} Validation result
   */
  async validateDestinationSelection(config) {
    const errors = [];

    if (!config.destinationAppId) {
      errors.push({ message: 'Destination app must be selected' });
    }

    if (!config.destinationOrganizationId) {
      errors.push({ message: 'Destination organization must be selected' });
    }

    if (config.sourceAppId === config.destinationAppId) {
      errors.push({ message: 'Source and destination apps must be different' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate resource configuration step
   *
   * @param {Object} config - Current configuration
   * @returns {Promise<Object>} Validation result
   */
  async validateResourceConfiguration(config) {
    const errors = [];

    // Check that at least one resource is selected
    const hasPages = config.pageIds && (config.pageIds === 'all' || config.pageIds.length > 0);
    const hasDataSources = config.dataSources && (config.dataSources === 'all' || config.dataSources.length > 0);
    const hasFiles = config.fileIds && (config.fileIds === 'all' || config.fileIds.length > 0);
    const hasFolders = config.folderIds && (config.folderIds === 'all' || config.folderIds.length > 0);

    if (!hasPages && !hasDataSources && !hasFiles && !hasFolders) {
      errors.push({ message: 'At least one resource must be selected for merge' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate review step
   *
   * @param {Object} config - Current configuration
   * @returns {Promise<Object>} Validation result
   */
  async validateReview(config) {
    // Aggregate all validations
    const destValidation = await this.validateDestinationSelection(config);
    const resourceValidation = await this.validateResourceConfiguration(config);

    const allErrors = [
      ...destValidation.errors,
      ...resourceValidation.errors
    ];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * Proceed to next step
   *
   * @param {Object} [options={}] - Options
   * @param {boolean} [options.autoValidate=true] - Validate current step before proceeding
   * @returns {Promise<Object>} Result with new current step
   *
   * @example
   * const result = await controller.proceedToNextStep();
   */
  async proceedToNextStep(options = {}) {
    const { autoValidate = true } = options;

    const config = this.stateManager.getState('mergeConfiguration');

    if (!config) {
      throw new Error('No active configuration found');
    }

    // Validate current step if auto-validate enabled
    if (autoValidate) {
      const validation = await this.validateStep(config.currentStep);

      if (!validation.isValid) {
        throw new Error(`Current step validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
      }
    }

    // Calculate next step
    const currentIndex = this.workflowSteps.indexOf(config.currentStep);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= this.workflowSteps.length) {
      // Mark as complete
      this.stateManager.setState('mergeConfiguration.isComplete', true);

      this.eventEmitter.emit('configuration:completed', {
        sourceAppId: config.sourceAppId,
        destinationAppId: config.destinationAppId
      });

      return {
        success: true,
        isComplete: true,
        currentStep: config.currentStep
      };
    }

    const nextStep = this.workflowSteps[nextIndex];

    // Update state
    this.stateManager.setState('mergeConfiguration.currentStep', nextStep);
    this.stateManager.setState('mergeConfiguration.stepIndex', nextIndex);

    this.eventEmitter.emit('configuration:step-changed', {
      previousStep: config.currentStep,
      currentStep: nextStep
    });

    return {
      success: true,
      currentStep: nextStep,
      previousStep: config.currentStep
    };
  }

  /**
   * Return to previous step
   *
   * @param {Object} [options={}] - Options
   * @param {boolean} [options.preserveState=true] - Keep configuration data for current step
   * @returns {Promise<Object>} Result with new current step
   *
   * @example
   * const result = await controller.returnToPreviousStep();
   */
  async returnToPreviousStep(options = {}) {
    const { preserveState = true } = options;

    const config = this.stateManager.getState('mergeConfiguration');

    if (!config) {
      throw new Error('No active configuration found');
    }

    const currentIndex = this.workflowSteps.indexOf(config.currentStep);

    if (currentIndex <= 0) {
      throw new Error('Already at first step');
    }

    const previousIndex = currentIndex - 1;
    const previousStep = this.workflowSteps[previousIndex];

    // Update state
    this.stateManager.setState('mergeConfiguration.currentStep', previousStep);
    this.stateManager.setState('mergeConfiguration.stepIndex', previousIndex);

    this.eventEmitter.emit('configuration:step-changed', {
      previousStep: config.currentStep,
      currentStep: previousStep
    });

    return {
      success: true,
      currentStep: previousStep,
      nextStep: config.currentStep
    };
  }

  /**
   * Cancel configuration workflow
   *
   * @param {Object} [options={}] - Options
   * @param {boolean} [options.autoUnlock=true] - Automatically unlock apps
   * @returns {Promise<Object>} Cancellation result
   *
   * @example
   * await controller.cancelConfiguration();
   */
  async cancelConfiguration(options = {}) {
    const { autoUnlock = true } = options;

    const config = this.stateManager.getState('mergeConfiguration');

    if (!config) {
      throw new Error('No active configuration found');
    }

    try {
      // Unlock apps if auto-unlock enabled
      if (autoUnlock && config.destinationAppId) {
        await this.appLockController.unlockApps(
          config.sourceAppId,
          config.destinationAppId
        );
      }

      // Clear configuration state
      this.stateManager.setState('mergeConfiguration', null);

      this.eventEmitter.emit('configuration:cancelled', {
        sourceAppId: config.sourceAppId,
        destinationAppId: config.destinationAppId
      });

      return {
        success: true,
        cancelled: true
      };
    } catch (error) {
      this.eventEmitter.emit('configuration:cancel-failed', {
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Get current configuration
   *
   * @param {Object} [options={}] - Options
   * @param {boolean} [options.includeSummary=false] - Include resource counts summary
   * @returns {Object} Current configuration
   *
   * @example
   * const config = controller.getConfiguration({ includeSummary: true });
   */
  getConfiguration(options = {}) {
    const { includeSummary = false } = options;

    const config = this.stateManager.getState('mergeConfiguration');

    if (!config) {
      return null;
    }

    if (!includeSummary) {
      return config;
    }

    // Calculate summary
    const summary = {
      hasPages: config.pageIds === 'all' || (Array.isArray(config.pageIds) && config.pageIds.length > 0),
      hasDataSources: config.dataSources === 'all' || (Array.isArray(config.dataSources) && config.dataSources.length > 0),
      hasFiles: config.fileIds === 'all' || (Array.isArray(config.fileIds) && config.fileIds.length > 0),
      hasFolders: config.folderIds === 'all' || (Array.isArray(config.folderIds) && config.folderIds.length > 0),
      pageCount: Array.isArray(config.pageIds) ? config.pageIds.length : (config.pageIds === 'all' ? 'all' : 0),
      dataSourceCount: Array.isArray(config.dataSources) ? config.dataSources.length : (config.dataSources === 'all' ? 'all' : 0),
      fileCount: Array.isArray(config.fileIds) ? config.fileIds.length : (config.fileIds === 'all' ? 'all' : 0),
      folderCount: Array.isArray(config.folderIds) ? config.folderIds.length : (config.folderIds === 'all' ? 'all' : 0)
    };

    return {
      ...config,
      summary
    };
  }

  /**
   * Update configuration data
   *
   * @param {Object} updates - Configuration updates
   * @returns {Object} Updated configuration
   *
   * @example
   * controller.updateConfiguration({ destinationAppId: 456 });
   */
  updateConfiguration(updates) {
    const config = this.stateManager.getState('mergeConfiguration');

    if (!config) {
      throw new Error('No active configuration found');
    }

    // Merge updates into configuration
    Object.keys(updates).forEach((key) => {
      this.stateManager.setState(`mergeConfiguration.${key}`, updates[key]);
    });

    this.eventEmitter.emit('configuration:updated', {
      updates,
      config: this.stateManager.getState('mergeConfiguration')
    });

    return this.stateManager.getState('mergeConfiguration');
  }
}

export default MergeConfigurationController;

