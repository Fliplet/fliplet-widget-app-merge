// src/utils/auditLogging.js

/**
 * Audit logging utility for tracking critical merge operations
 * 
 * NOTE: Audit logging requires log types to be whitelisted via API.
 * Enable by setting ENABLE_AUDIT_LOGS = true
 * 
 * This is disabled by default as it requires backend configuration.
 */

// Feature flag - set to true to enable audit logging
const ENABLE_AUDIT_LOGS = false;

/**
 * Log types for audit logging
 */
const LOG_TYPES = {
  MERGE_INITIATED: 'merge_initiated',
  MERGE_COMPLETED: 'merge_completed',
  MERGE_FAILED: 'merge_failed',
  LOCK_ACQUIRED: 'lock_acquired',
  LOCK_RELEASED: 'lock_released',
  LOCK_EXTENDED: 'lock_extended'
};

/**
 * Create audit log entry
 */
const createAuditLog = (type, data) => {
  if (!ENABLE_AUDIT_LOGS) {
    // Audit logging is disabled
    return Promise.resolve();
  }

  try {
    if (typeof window !== 'undefined' && window.Fliplet && window.Fliplet.App && window.Fliplet.App.Logs) {
      return window.Fliplet.App.Logs.create({
        type,
        data: {
          ...data,
          timestamp: new Date().toISOString()
        }
      });
    }

    console.log('[Audit Log] Would create log:', { type, data });
    return Promise.resolve();
  } catch (error) {
    console.error('[Audit Log] Failed to create log:', error);
    return Promise.reject(error);
  }
};

/**
 * Log merge initiated
 */
const logMergeInitiated = (sourceAppId, targetAppId, userId, userName) => {
  return createAuditLog(LOG_TYPES.MERGE_INITIATED, {
    sourceAppId,
    targetAppId,
    userId,
    userName,
    action: 'Merge operation initiated'
  });
};

/**
 * Log merge completed
 */
const logMergeCompleted = (sourceAppId, targetAppId, userId, userName, summary) => {
  return createAuditLog(LOG_TYPES.MERGE_COMPLETED, {
    sourceAppId,
    targetAppId,
    userId,
    userName,
    action: 'Merge operation completed successfully',
    summary: {
      screensCopied: summary.screensCopied || 0,
      dataSourcesCopied: summary.dataSourcesCopied || 0,
      filesCopied: summary.filesCopied || 0,
      configurationsCopied: summary.configurationsCopied || 0,
      duration: summary.duration || 0
    }
  });
};

/**
 * Log merge failed
 */
const logMergeFailed = (sourceAppId, targetAppId, userId, userName, error) => {
  return createAuditLog(LOG_TYPES.MERGE_FAILED, {
    sourceAppId,
    targetAppId,
    userId,
    userName,
    action: 'Merge operation failed',
    error: {
      message: error.message || 'Unknown error',
      code: error.code || null,
      stack: error.stack || null
    }
  });
};

/**
 * Log lock acquired
 */
const logLockAcquired = (sourceAppId, targetAppId, userId, userName, lockDuration) => {
  return createAuditLog(LOG_TYPES.LOCK_ACQUIRED, {
    sourceAppId,
    targetAppId,
    userId,
    userName,
    action: 'Apps locked for merge operation',
    lockDuration
  });
};

/**
 * Log lock released
 */
const logLockReleased = (sourceAppId, targetAppId, userId, userName, reason) => {
  return createAuditLog(LOG_TYPES.LOCK_RELEASED, {
    sourceAppId,
    targetAppId,
    userId,
    userName,
    action: 'Apps unlocked',
    reason: reason || 'merge_completed'
  });
};

/**
 * Log lock extended
 */
const logLockExtended = (sourceAppId, targetAppId, userId, userName, newDuration) => {
  return createAuditLog(LOG_TYPES.LOCK_EXTENDED, {
    sourceAppId,
    targetAppId,
    userId,
    userName,
    action: 'Lock duration extended',
    newDuration
  });
};

/**
 * Check if audit logging is enabled
 */
const isEnabled = () => {
  return ENABLE_AUDIT_LOGS;
};

module.exports = {
  ENABLE_AUDIT_LOGS,
  LOG_TYPES,
  logMergeInitiated,
  logMergeCompleted,
  logMergeFailed,
  logLockAcquired,
  logLockReleased,
  logLockExtended,
  isEnabled
};

