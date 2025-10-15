// src/middleware/controllers/MergeExecutionController.js

/**
 * MergeExecutionController - Manages merge execution and progress monitoring
 *
 * Handles merge initiation, progress monitoring with WebSocket/polling fallback,
 * and automatic app unlocking on completion or error.
 *
 * @class MergeExecutionController
 */
class MergeExecutionController {
  /**
   * Create MergeExecutionController instance
   *
   * @param {Object} mergeApiService - MergeApiService instance
   * @param {Object} stateManager - StateManager instance
   * @param {Object} eventEmitter - EventEmitter instance
   */
  constructor(mergeApiService, stateManager, eventEmitter) {
    if (!mergeApiService) {
      throw new Error('MergeApiService is required');
    }

    if (!stateManager) {
      throw new Error('StateManager is required');
    }

    if (!eventEmitter) {
      throw new Error('EventEmitter is required');
    }

    this.mergeApiService = mergeApiService;
    this.stateManager = stateManager;
    this.eventEmitter = eventEmitter;

    // Track active monitoring
    this.monitoringTimers = new Map();
  }

  /**
   * Initiate merge operation
   *
   * @param {number} sourceAppId - Source app ID
   * @param {Object} mergeConfig - Merge configuration
   * @param {Object} [options={}] - Execution options
   * @param {boolean} [options.startMonitoring=true] - Start progress monitoring automatically
   * @param {number} [options.pollInterval=2000] - Polling interval in ms
   * @returns {Promise<Object>} Merge initiation result with mergeId
   *
   * @example
   * const result = await controller.initiateMerge(123, mergeConfig);
   */
  async initiateMerge(sourceAppId, mergeConfig, options = {}) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    if (!mergeConfig) {
      throw new Error('Merge configuration is required');
    }

    const {
      startMonitoring = true,
      pollInterval = 2000
    } = options;

    try {
      // Initiate merge via API
      const result = await this.mergeApiService.initiateMerge(sourceAppId, mergeConfig);

      // Update state with merge information
      this.stateManager.setState('mergeStatus', {
        mergeId: result.mergeId,
        sourceAppId,
        destinationAppId: mergeConfig.destinationAppId,
        status: result.status || 'in_progress',
        progress: result.progress || 0,
        startedAt: new Date().toISOString()
      });

      // Emit merge initiated event
      this.eventEmitter.emit('merge:initiated', {
        mergeId: result.mergeId,
        sourceAppId,
        destinationAppId: mergeConfig.destinationAppId
      });

      // Start monitoring if requested
      if (startMonitoring) {
        this.monitorProgress(sourceAppId, result.mergeId, {
          pollInterval
        });
      }

      return result;
    } catch (error) {
      this.eventEmitter.emit('merge:failed', {
        sourceAppId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Monitor merge progress with polling
   *
   * @param {number} sourceAppId - Source app ID
   * @param {number} mergeId - Merge ID to monitor
   * @param {Object} [options={}] - Monitoring options
   * @param {number} [options.pollInterval=2000] - Polling interval in ms
   * @param {boolean} [options.useWebSocket=false] - Use WebSocket (not implemented)
   * @returns {void}
   *
   * @example
   * controller.monitorProgress(123, 5000, { pollInterval: 2000 });
   */
  monitorProgress(sourceAppId, mergeId, options = {}) {
    const {
      pollInterval = 2000,
      useWebSocket = false
    } = options;

    // Stop any existing monitoring for this app
    this.stopMonitoring(sourceAppId);

    // Create polling interval
    const timerId = setInterval(async () => {
      try {
        const status = await this.mergeApiService.getMergeStatus(sourceAppId, { mergeId });

        // Update state with latest status
        this.stateManager.setState('mergeStatus', {
          ...this.stateManager.getState('mergeStatus'),
          status: status.status,
          progress: status.progress || 0,
          currentStage: status.currentStage,
          lastUpdated: new Date().toISOString()
        });

        // Emit progress event
        this.eventEmitter.emit('merge:progress', {
          mergeId,
          sourceAppId,
          status: status.status,
          progress: status.progress,
          currentStage: status.currentStage
        });

        // Check for stage completion
        if (status.currentStage && status.stageComplete) {
          this.eventEmitter.emit('merge:stage-complete', {
            mergeId,
            sourceAppId,
            stage: status.currentStage
          });
        }

        // Check for completion or error
        if (status.status === 'completed' || status.status === 'failed' || status.status === 'error') {
          this.stopMonitoring(sourceAppId);

          if (status.status === 'completed') {
            this.eventEmitter.emit('merge:complete', {
              mergeId,
              sourceAppId,
              result: status.result
            });
          } else {
            this.eventEmitter.emit('merge:error', {
              mergeId,
              sourceAppId,
              error: status.error || 'Merge failed'
            });
          }
        }
      } catch (error) {
        this.eventEmitter.emit('merge:monitoring-error', {
          mergeId,
          sourceAppId,
          error: error.message
        });
      }
    }, pollInterval);

    // Store timer reference
    this.monitoringTimers.set(sourceAppId, timerId);
  }

  /**
   * Stop monitoring merge progress
   *
   * @param {number} sourceAppId - Source app ID
   * @returns {void}
   *
   * @example
   * controller.stopMonitoring(123);
   */
  stopMonitoring(sourceAppId) {
    const timerId = this.monitoringTimers.get(sourceAppId);

    if (timerId) {
      clearInterval(timerId);
      this.monitoringTimers.delete(sourceAppId);
    }
  }

  /**
   * Get merge result
   *
   * @param {number} sourceAppId - Source app ID
   * @param {number} mergeId - Merge ID
   * @param {Object} [options={}] - Options
   * @returns {Promise<Object>} Merge result
   *
   * @example
   * const result = await controller.getMergeResult(123, 5000);
   */
  async getMergeResult(sourceAppId, mergeId, options = {}) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    if (!mergeId || typeof mergeId !== 'number') {
      throw new Error('Valid merge ID is required');
    }

    try {
      const status = await this.mergeApiService.getMergeStatus(sourceAppId, { mergeId });

      return {
        mergeId,
        status: status.status,
        progress: status.progress,
        result: status.result,
        error: status.error
      };
    } catch (error) {
      throw new Error(`Failed to get merge result: ${error.message}`);
    }
  }

  /**
   * Fetch merge logs
   *
   * @param {number} appId - App ID
   * @param {number} mergeId - Merge ID
   * @param {Object} [options={}] - Fetch options
   * @param {Array<string>} [options.types] - Filter by log types
   * @param {Object} [options.pagination] - Pagination configuration
   * @returns {Promise<Array>} Array of log entries
   *
   * @example
   * const logs = await controller.fetchLogs(123, 5000, {
   *   types: ['info', 'error']
   * });
   */
  async fetchLogs(appId, mergeId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    if (!mergeId || typeof mergeId !== 'number') {
      throw new Error('Valid merge ID is required');
    }

    try {
      const logs = await this.mergeApiService.fetchMergeLogs(appId, {
        mergeId,
        ...options
      });

      return logs;
    } catch (error) {
      throw new Error(`Failed to fetch logs: ${error.message}`);
    }
  }

  /**
   * Clean up all monitoring timers
   *
   * @returns {void}
   */
  cleanup() {
    this.monitoringTimers.forEach((timerId) => {
      clearInterval(timerId);
    });

    this.monitoringTimers.clear();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MergeExecutionController;
}

