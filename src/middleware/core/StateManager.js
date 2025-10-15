// src/middleware/core/StateManager.js

const EventEmitter = require('../utils/EventEmitter');

/**
 * StateManager - Temporary merge configuration state management
 *
 * Manages in-memory state for the merge configuration process.
 * State is NOT persisted and is cleared on cancellation or completion.
 *
 * @class StateManager
 */
class StateManager {
  /**
   * Create StateManager instance
   *
   * Initializes state schema and event emitter for state change notifications.
   */
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.state = this.getInitialState();

    // Valid state transitions map
    this.validTransitions = {
      not_started: ['destination_selected', 'cancelled'],
      destination_selected: ['configuring_resources', 'not_started', 'cancelled'],
      configuring_resources: ['reviewing_preview', 'destination_selected', 'cancelled'],
      reviewing_preview: ['merge_in_progress', 'configuring_resources', 'cancelled'],
      merge_in_progress: ['completed', 'error', 'cancelled'],
      completed: ['not_started'],
      error: ['not_started', 'cancelled'],
      cancelled: ['not_started']
    };
  }

  /**
   * Get initial state structure
   *
   * @returns {Object} Initial state object
   *
   * @private
   */
  getInitialState() {
    return {
      mergeConfiguration: {
        sourceApp: {
          id: null,
          name: null,
          organizationId: null,
          region: null
        },
        destinationApp: {
          id: null,
          name: null,
          organizationId: null,
          region: null
        },
        selectedPages: [],
        selectedDataSources: [],
        selectedFiles: [],
        selectedFolders: [],
        appLevelSettings: {
          mergeAppSettings: false,
          mergeMenuSettings: false,
          mergeAppearanceSettings: false,
          mergeGlobalCode: false
        },
        customDataSourcesInUse: []
      },
      lockStatus: {
        sourceAppLockedUntil: null,
        destinationAppLockedUntil: null,
        lockOwner: null
      },
      mergeStatus: {
        mergeId: null,
        status: 'not_started',
        currentStage: null,
        progress: 0,
        logs: []
      },
      validationState: {
        sourceAppDuplicates: {
          pages: [],
          dataSources: []
        },
        destinationAppDuplicates: {
          pages: [],
          dataSources: []
        },
        hasErrors: false,
        errors: []
      },
      cache: {}
    };
  }

  /**
   * Get state by path
   *
   * Supports dot-notation paths like 'mergeConfiguration.sourceApp.id'
   *
   * @param {string} [path] - Dot-notation path to state property
   * @returns {*} State value at path, or entire state if no path provided
   *
   * @example
   * const sourceAppId = stateManager.getState('mergeConfiguration.sourceApp.id');
   * const allState = stateManager.getState();
   */
  getState(path) {
    if (!path) {
      // Return deep clone of entire state
      return JSON.parse(JSON.stringify(this.state));
    }

    const keys = path.split('.');
    let value = this.state;

    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }

      value = value[key];
    }

    // Return deep clone to prevent external mutations
    if (typeof value === 'object' && value !== null) {
      return JSON.parse(JSON.stringify(value));
    }

    return value;
  }

  /**
   * Set state by path
   *
   * Updates state immutably and emits 'state:change' event.
   *
   * @param {string} path - Dot-notation path to state property
   * @param {*} value - New value to set
   * @returns {StateManager} Returns this for chaining
   *
   * @example
   * stateManager.setState('mergeConfiguration.sourceApp.id', 123);
   * stateManager.setState('mergeStatus.status', 'in_progress');
   */
  setState(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();

    // Navigate to parent object
    let current = this.state;

    for (const key of keys) {
      if (current[key] === null || current[key] === undefined) {
        current[key] = {};
      }

      current = current[key];
    }

    // Store old value for comparison
    const oldValue = current[lastKey];

    // Set new value
    current[lastKey] = value;

    // Emit state change event
    this.eventEmitter.emit('state:change', {
      path,
      oldValue,
      newValue: value,
      timestamp: new Date().toISOString()
    });

    return this;
  }

  /**
   * Clear all state
   *
   * Resets state to initial values and emits 'state:cleared' event.
   *
   * @returns {StateManager} Returns this for chaining
   *
   * @example
   * stateManager.clearState();
   */
  clearState() {
    this.state = this.getInitialState();

    this.eventEmitter.emit('state:cleared', {
      timestamp: new Date().toISOString()
    });

    return this;
  }

  /**
   * Validate state transition
   *
   * Checks if transition from current status to new status is valid.
   *
   * @param {string} fromStatus - Current status
   * @param {string} toStatus - Desired status
   * @returns {boolean} True if transition is valid
   *
   * @example
   * const isValid = stateManager.validateStateTransition('not_started', 'destination_selected');
   */
  validateStateTransition(fromStatus, toStatus) {
    if (!this.validTransitions[fromStatus]) {
      return false;
    }

    return this.validTransitions[fromStatus].includes(toStatus);
  }

  /**
   * Get current merge status
   *
   * @returns {string} Current merge status
   */
  getCurrentStatus() {
    return this.state.mergeStatus.status;
  }

  /**
   * Update merge status with validation
   *
   * Validates transition before updating status.
   *
   * @param {string} newStatus - New status to set
   * @param {Object} [additionalData={}] - Additional data to update with status
   * @returns {boolean} True if update succeeded, false if transition invalid
   *
   * @example
   * stateManager.updateMergeStatus('in_progress', {
   *   currentStage: 'screens',
   *   progress: 45
   * });
   */
  updateMergeStatus(newStatus, additionalData = {}) {
    const currentStatus = this.getCurrentStatus();

    // Validate transition
    if (!this.validateStateTransition(currentStatus, newStatus)) {
      console.warn(`Invalid state transition from ${currentStatus} to ${newStatus}`);

      return false;
    }

    // Update status
    this.setState('mergeStatus.status', newStatus);

    // Update additional fields
    Object.keys(additionalData).forEach((key) => {
      this.setState(`mergeStatus.${key}`, additionalData[key]);
    });

    // Emit status change event
    this.eventEmitter.emit('merge:status:change', {
      from: currentStatus,
      to: newStatus,
      data: additionalData,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Subscribe to state changes
   *
   * @param {string} event - Event name to listen for
   * @param {Function} callback - Callback function
   * @returns {StateManager} Returns this for chaining
   *
   * @example
   * stateManager.on('state:change', (data) => {
   *   console.log('State changed:', data.path, data.newValue);
   * });
   */
  on(event, callback) {
    this.eventEmitter.on(event, callback);

    return this;
  }

  /**
   * Unsubscribe from state changes
   *
   * @param {string} event - Event name to stop listening for
   * @param {Function} [callback] - Specific callback to remove
   * @returns {StateManager} Returns this for chaining
   */
  off(event, callback) {
    this.eventEmitter.off(event, callback);

    return this;
  }

  /**
   * Subscribe to state changes once
   *
   * @param {string} event - Event name to listen for
   * @param {Function} callback - Callback function
   * @returns {StateManager} Returns this for chaining
   */
  once(event, callback) {
    this.eventEmitter.once(event, callback);

    return this;
  }

  /**
   * Get validation errors
   *
   * @returns {Array} List of validation errors
   */
  getValidationErrors() {
    return this.getState('validationState.errors') || [];
  }

  /**
   * Add validation error
   *
   * @param {Object} error - Error object with field, message, type
   * @returns {StateManager} Returns this for chaining
   */
  addValidationError(error) {
    const errors = this.getValidationErrors();

    errors.push({
      ...error,
      timestamp: new Date().toISOString()
    });

    this.setState('validationState.errors', errors);
    this.setState('validationState.hasErrors', true);

    return this;
  }

  /**
   * Clear validation errors
   *
   * @returns {StateManager} Returns this for chaining
   */
  clearValidationErrors() {
    this.setState('validationState.errors', []);
    this.setState('validationState.hasErrors', false);

    return this;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateManager;
}

