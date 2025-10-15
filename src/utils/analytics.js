// src/utils/analytics.js

/**
 * Analytics utility for tracking user interactions
 * Wraps Fliplet.App.Analytics.event()
 */

const EVENT_CATEGORIES = {
  APP_MERGE: 'app_merge',
  UI_INTERACTION: 'ui_interaction',
  WORKFLOW: 'workflow'
};

/**
 * Track generic event
 */
const trackEvent = (category, action, label = null, value = null) => {
  try {
    if (typeof window !== 'undefined' && window.Fliplet && window.Fliplet.App && window.Fliplet.App.Analytics) {
      window.Fliplet.App.Analytics.event({
        category,
        action,
        label,
        value
      });
    } else {
      console.log('[Analytics] Event:', { category, action, label, value });
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
};

/**
 * Track dashboard viewed
 */
const trackDashboardViewed = (appId) => {
  trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'dashboard_viewed',
    `App ${appId}`,
    appId
  );
};

/**
 * Track destination selected
 */
const trackDestinationSelected = (sourceAppId, targetAppId) => {
  trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'destination_selected',
    `From ${sourceAppId} to ${targetAppId}`,
    targetAppId
  );
};

/**
 * Track tab switched in configuration
 */
const trackTabSwitched = (tabName) => {
  trackEvent(
    EVENT_CATEGORIES.UI_INTERACTION,
    'tab_switched',
    tabName
  );
};

/**
 * Track items selected in configuration
 */
const trackItemsSelected = (category, count) => {
  trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'items_selected',
    category,
    count
  );
};

/**
 * Track review viewed
 */
const trackReviewViewed = (sourceAppId, targetAppId, itemCount) => {
  trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'review_viewed',
    `From ${sourceAppId} to ${targetAppId}`,
    itemCount
  );
};

/**
 * Track conflict detected
 */
const trackConflictDetected = (conflictType, count) => {
  trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'conflict_detected',
    conflictType,
    count
  );
};

/**
 * Track merge initiated
 */
const trackMergeInitiated = (sourceAppId, targetAppId, itemCount) => {
  trackEvent(
    EVENT_CATEGORIES.WORKFLOW,
    'merge_initiated',
    `From ${sourceAppId} to ${targetAppId}`,
    itemCount
  );
};

/**
 * Track merge progress updated
 */
const trackMergeProgressUpdated = (phase, percentage) => {
  trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'merge_progress_updated',
    phase,
    percentage
  );
};

/**
 * Track merge completed
 */
const trackMergeCompleted = (sourceAppId, targetAppId, duration, itemCount) => {
  trackEvent(
    EVENT_CATEGORIES.WORKFLOW,
    'merge_completed',
    `From ${sourceAppId} to ${targetAppId}`,
    duration
  );

  // Also track item count separately
  trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'merge_completed_items',
    `From ${sourceAppId} to ${targetAppId}`,
    itemCount
  );
};

/**
 * Track merge failed
 */
const trackMergeFailed = (sourceAppId, targetAppId, errorMessage) => {
  trackEvent(
    EVENT_CATEGORIES.WORKFLOW,
    'merge_failed',
    `From ${sourceAppId} to ${targetAppId}: ${errorMessage}`
  );
};

/**
 * Track destination app opened
 */
const trackDestinationAppOpened = (targetAppId) => {
  trackEvent(
    EVENT_CATEGORIES.UI_INTERACTION,
    'destination_app_opened',
    `App ${targetAppId}`,
    targetAppId
  );
};

/**
 * Track audit log viewed
 */
const trackAuditLogViewed = (appId) => {
  trackEvent(
    EVENT_CATEGORIES.UI_INTERACTION,
    'audit_log_viewed',
    `App ${appId}`,
    appId
  );
};

/**
 * Track merge cancelled
 */
const trackMergeCancelled = (stage) => {
  trackEvent(
    EVENT_CATEGORIES.WORKFLOW,
    'merge_cancelled',
    stage
  );
};

/**
 * Track lock extended
 */
const trackLockExtended = (sourceAppId, targetAppId) => {
  trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'lock_extended',
    `From ${sourceAppId} to ${targetAppId}`
  );
};

/**
 * Track button click
 */
const trackButtonClick = (buttonName, context) => {
  trackEvent(
    EVENT_CATEGORIES.UI_INTERACTION,
    'button_click',
    `${buttonName} - ${context}`
  );
};

module.exports = {
  EVENT_CATEGORIES,
  trackEvent,
  trackDashboardViewed,
  trackDestinationSelected,
  trackTabSwitched,
  trackItemsSelected,
  trackReviewViewed,
  trackConflictDetected,
  trackMergeInitiated,
  trackMergeProgressUpdated,
  trackMergeCompleted,
  trackMergeFailed,
  trackDestinationAppOpened,
  trackAuditLogViewed,
  trackMergeCancelled,
  trackLockExtended,
  trackButtonClick
};

