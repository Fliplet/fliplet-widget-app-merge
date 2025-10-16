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
let ENABLE_AUDIT_LOGS = false;

const getAuditLogsEnabled = () => ENABLE_AUDIT_LOGS;

const getLogsInstance = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const fliplet = window.Fliplet || {}; // Allow tests to stub Fliplet

  if (!fliplet.App || !fliplet.App.Logs || typeof fliplet.App.Logs.create !== 'function') {
    return null;
  }

  return fliplet.App.Logs;
};

const createLogEntry = async (type, data) => {
  if (!ENABLE_AUDIT_LOGS) {
    return null;
  }

  const logsInstance = getLogsInstance();

  if (!logsInstance) {
    return null;
  }

  try {
    return await logsInstance.create({
      type,
      data: {
        timestamp: new Date().toISOString(),
        ...data
      }
    });
  } catch (error) {
    console.error('Failed to create audit log entry:', error);
    throw error;
  }
};

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
 * Log merge initiated
 */
const logMergeInitiated = (sourceAppId, targetAppId, userId, userName) => {
  return createLogEntry(LOG_TYPES.MERGE_INITIATED, {
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
  return createLogEntry(LOG_TYPES.MERGE_COMPLETED, {
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
  return createLogEntry(LOG_TYPES.MERGE_FAILED, {
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
  return createLogEntry(LOG_TYPES.LOCK_ACQUIRED, {
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
  return createLogEntry(LOG_TYPES.LOCK_RELEASED, {
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
  return createLogEntry(LOG_TYPES.LOCK_EXTENDED, {
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

const setAuditLogsEnabled = (enabled) => {
  ENABLE_AUDIT_LOGS = enabled;
};

module.exports = {
  LOG_TYPES,
  logMergeInitiated,
  logMergeCompleted,
  logMergeFailed,
  logLockAcquired,
  logLockReleased,
  logLockExtended,
  createLogEntry,
  isEnabled,
  setAuditLogsEnabled,
  getAuditLogsEnabled
};

