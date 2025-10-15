// src/middleware/controllers/AppLockController.js

/**
 * AppLockController - Manages app locking lifecycle for merge operations
 *
 * Handles locking, unlocking, extending locks, and monitoring lock expiration
 * with automatic extension capabilities.
 *
 * @class AppLockController
 */
class AppLockController {
  /**
   * Create AppLockController instance
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

    // Track active monitoring timers
    this.monitoringTimers = new Map();
  }

  /**
   * Lock apps for merge configuration
   *
   * @param {number} sourceAppId - Source app ID
   * @param {number} destinationAppId - Destination app ID
   * @param {Object} [options={}] - Lock options
   * @param {number} [options.duration=600] - Lock duration in seconds
   * @param {boolean} [options.autoExtend=false] - Enable auto-extension
   * @param {number} [options.warningThreshold=60] - Seconds before expiry to emit warning
   * @returns {Promise<Object>} Lock result
   *
   * @example
   * const result = await appLockController.lockApps(123, 456, {
   *   duration: 600,
   *   autoExtend: true
   * });
   */
  async lockApps(sourceAppId, destinationAppId, options = {}) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    if (!destinationAppId || typeof destinationAppId !== 'number') {
      throw new Error('Valid destination app ID is required');
    }

    const {
      duration = 600,
      autoExtend = false,
      warningThreshold = 60
    } = options;

    try {
      // Lock both apps via merge API
      const lockResult = await this.mergeApiService.lockApps(sourceAppId, {
        targetApp: { id: destinationAppId },
        lockDuration: duration
      });

      // Update state with lock information
      this.stateManager.setState('lockStatus', {
        sourceAppId,
        destinationAppId,
        lockedAt: new Date().toISOString(),
        lockedUntil: lockResult.lockedUntil,
        duration,
        autoExtend
      });

      // Emit lock acquired event
      this.eventEmitter.emit('lock:acquired', {
        sourceAppId,
        destinationAppId,
        lockedUntil: lockResult.lockedUntil
      });

      // Start monitoring if auto-extend enabled
      if (autoExtend) {
        this.monitorLockExpiration(sourceAppId, {
          destinationAppId,
          warningThreshold,
          autoExtend: true
        });
      }

      return lockResult;
    } catch (error) {
      // Emit lock failed event
      this.eventEmitter.emit('lock:failed', {
        sourceAppId,
        destinationAppId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Unlock apps
   *
   * @param {number} sourceAppId - Source app ID
   * @param {number} destinationAppId - Destination app ID
   * @returns {Promise<Object>} Unlock result
   *
   * @example
   * await appLockController.unlockApps(123, 456);
   */
  async unlockApps(sourceAppId, destinationAppId) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    if (!destinationAppId || typeof destinationAppId !== 'number') {
      throw new Error('Valid destination app ID is required');
    }

    try {
      // Stop any active monitoring
      this.stopMonitoring(sourceAppId);

      // Unlock apps via merge API
      const unlockResult = await this.mergeApiService.unlockApps(sourceAppId, {
        targetApp: { id: destinationAppId }
      });

      // Clear lock state
      this.stateManager.setState('lockStatus', null);

      // Emit lock released event
      this.eventEmitter.emit('lock:released', {
        sourceAppId,
        destinationAppId
      });

      return unlockResult;
    } catch (error) {
      this.eventEmitter.emit('lock:release-failed', {
        sourceAppId,
        destinationAppId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Extend lock duration
   *
   * @param {number} sourceAppId - Source app ID
   * @param {number} destinationAppId - Destination app ID
   * @param {Object} [options={}] - Extend options
   * @param {number} [options.additionalDuration=300] - Additional seconds to add
   * @returns {Promise<Object>} Extended lock result
   *
   * @example
   * await appLockController.extendLock(123, 456, { additionalDuration: 300 });
   */
  async extendLock(sourceAppId, destinationAppId, options = {}) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    if (!destinationAppId || typeof destinationAppId !== 'number') {
      throw new Error('Valid destination app ID is required');
    }

    const { additionalDuration = 300 } = options;

    try {
      const extendResult = await this.mergeApiService.extendLock(sourceAppId, {
        targetApp: { id: destinationAppId },
        extendDuration: additionalDuration
      });

      // Update state with new lock time
      const currentLockState = this.stateManager.getState('lockStatus') || {};

      this.stateManager.setState('lockStatus', {
        ...currentLockState,
        lockedUntil: extendResult.lockedUntil,
        lastExtended: new Date().toISOString()
      });

      // Emit lock extended event
      this.eventEmitter.emit('lock:extended', {
        sourceAppId,
        destinationAppId,
        lockedUntil: extendResult.lockedUntil,
        additionalDuration
      });

      return extendResult;
    } catch (error) {
      this.eventEmitter.emit('lock:extend-failed', {
        sourceAppId,
        destinationAppId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Check lock status
   *
   * @param {number} appId - App ID to check
   * @returns {Object} Lock status from state
   *
   * @example
   * const status = appLockController.checkLockStatus(123);
   */
  checkLockStatus(appId) {
    const lockStatus = this.stateManager.getState('lockStatus');

    if (!lockStatus || (lockStatus.sourceAppId !== appId && lockStatus.destinationAppId !== appId)) {
      return {
        isLocked: false,
        lockStatus: null
      };
    }

    const now = new Date();
    const lockedUntil = new Date(lockStatus.lockedUntil);
    const isLocked = lockedUntil > now;

    return {
      isLocked,
      lockStatus,
      remainingSeconds: isLocked ? Math.floor((lockedUntil - now) / 1000) : 0
    };
  }

  /**
   * Monitor lock expiration with optional auto-extension
   *
   * @param {number} appId - App ID to monitor
   * @param {Object} [options={}] - Monitoring options
   * @param {number} [options.destinationAppId] - Destination app ID for lock extension
   * @param {number} [options.warningThreshold=60] - Seconds before expiry to emit warning
   * @param {boolean} [options.autoExtend=false] - Automatically extend lock
   * @param {number} [options.checkInterval=10] - Check interval in seconds
   * @returns {void}
   *
   * @example
   * appLockController.monitorLockExpiration(123, {
   *   destinationAppId: 456,
   *   autoExtend: true,
   *   warningThreshold: 60
   * });
   */
  monitorLockExpiration(appId, options = {}) {
    const {
      destinationAppId,
      warningThreshold = 60,
      autoExtend = false,
      checkInterval = 10
    } = options;

    // Stop any existing monitoring for this app
    this.stopMonitoring(appId);

    // Create monitoring interval
    const timerId = setInterval(() => {
      const status = this.checkLockStatus(appId);

      if (!status.isLocked) {
        // Lock expired
        this.eventEmitter.emit('lock:expired', {
          sourceAppId: appId,
          destinationAppId
        });

        this.stopMonitoring(appId);

        return;
      }

      // Check if approaching expiration
      if (status.remainingSeconds <= warningThreshold) {
        this.eventEmitter.emit('lock:expiring', {
          sourceAppId: appId,
          destinationAppId,
          remainingSeconds: status.remainingSeconds
        });

        // Auto-extend if enabled
        if (autoExtend && destinationAppId) {
          this.extendLock(appId, destinationAppId, { additionalDuration: 300 })
            .catch((error) => {
              this.eventEmitter.emit('lock:auto-extend-failed', {
                sourceAppId: appId,
                destinationAppId,
                error: error.message
              });
            });
        }
      }
    }, checkInterval * 1000);

    // Store timer reference
    this.monitoringTimers.set(appId, timerId);
  }

  /**
   * Stop monitoring lock expiration
   *
   * @param {number} appId - App ID to stop monitoring
   * @returns {void}
   *
   * @example
   * appLockController.stopMonitoring(123);
   */
  stopMonitoring(appId) {
    const timerId = this.monitoringTimers.get(appId);

    if (timerId) {
      clearInterval(timerId);
      this.monitoringTimers.delete(appId);
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
  module.exports = AppLockController;
}

