// src/middleware/config/error-messages.js

/**
 * User-friendly error message mappings
 *
 * Maps error codes and types to user-friendly messages.
 */

const ERROR_MESSAGES = {
  // Validation errors
  VALIDATION: {
    SOURCE_APP_REQUIRED: 'Please select a source app',
    DESTINATION_APP_REQUIRED: 'Please select a destination app',
    APPS_MUST_BE_DIFFERENT: 'Source and destination apps must be different',
    ORGANIZATION_REQUIRED: 'Please select a destination organization',
    NO_RESOURCES_SELECTED: 'Please select at least one resource to merge',
    INVALID_CONFIGURATION: 'The merge configuration is invalid. Please review your selections.'
  },

  // Duplicate errors
  DUPLICATE: {
    DUPLICATE_PAGES: 'The source app contains pages with duplicate names. Please resolve duplicates before merging.',
    DUPLICATE_DATA_SOURCES: 'The source app contains data sources with duplicate names. Please resolve duplicates before merging.',
    DUPLICATE_CHECK_FAILED: 'Unable to check for duplicates. Please try again.'
  },

  // Permission errors
  PERMISSION: {
    INSUFFICIENT_PERMISSIONS: 'You don\'t have permission to perform this operation. Publisher role is required.',
    PERMISSION_CHECK_FAILED: 'Unable to verify permissions. Please try again.'
  },

  // Lock errors
  LOCK: {
    APP_LOCKED: 'This app is currently locked by another user. Please try again later.',
    LOCK_FAILED: 'Unable to lock the apps. Please try again.',
    UNLOCK_FAILED: 'Unable to unlock the apps. Please try again.',
    LOCK_EXPIRED: 'The app lock has expired. Please restart the merge process.',
    LOCK_STATUS_CHECK_FAILED: 'Unable to check lock status. Please try again.'
  },

  // Plan limit errors
  PLAN: {
    PAGE_LIMIT_EXCEEDED: 'This merge would exceed your plan\'s page limit',
    DATA_SOURCE_LIMIT_EXCEEDED: 'This merge would exceed your plan\'s data source limit',
    PLAN_LIMIT_CHECK_FAILED: 'Unable to verify plan limits. Please try again.'
  },

  // API errors
  API: {
    NETWORK_ERROR: 'Network error occurred. Please check your connection and try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
  },

  // Merge errors
  MERGE: {
    INITIATION_FAILED: 'Unable to start the merge process. Please try again.',
    MERGE_FAILED: 'The merge operation failed. Please review the error logs.',
    MONITORING_ERROR: 'Unable to monitor merge progress. The merge may still be in progress.',
    LOGS_FETCH_FAILED: 'Unable to fetch merge logs. Please try again.'
  }
};

/**
 * Get user-friendly error message
 *
 * @param {string} category - Error category
 * @param {string} code - Error code
 * @param {Object} [context={}] - Additional context for message formatting
 * @returns {string} User-friendly error message
 */
function getErrorMessage(category, code, context = {}) {
  const categoryMessages = ERROR_MESSAGES[category?.toUpperCase()];

  if (!categoryMessages) {
    return ERROR_MESSAGES.API.UNKNOWN_ERROR;
  }

  const message = categoryMessages[code?.toUpperCase()];

  if (!message) {
    return ERROR_MESSAGES.API.UNKNOWN_ERROR;
  }

  // Replace placeholders with context values
  return message.replace(/\{(\w+)\}/g, (match, key) => {
    return context[key] || match;
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ERROR_MESSAGES,
    getErrorMessage
  };
}

