// src/utils/analytics.js

/**
 * Analytics utility for tracking user interactions
 * Wraps Fliplet.App.Analytics.event()
 */

const EVENT_CATEGORIES = {
  APP_MERGE: 'app_merge',
  WORKFLOW: 'workflow',
  UI_INTERACTION: 'ui_interaction'
};

let analyticsEnabled = true;

/**
 * Track generic event
 */
const trackEvent = (category, action, label, value) => {
  if (!analyticsEnabled) {
    return null;
  }

  const analyticsInstance = getAnalyticsInstance();

  if (!analyticsInstance) {
    return null;
  }

  const payload = {
    category,
    action,
    label,
    value
  };

  try {
    analyticsInstance.event(payload);
    return payload;
  } catch (error) {
    return null;
  }
};

const resolveFliplet = () => {
  if (typeof window !== 'undefined' && window && window.Fliplet) {
    return window.Fliplet;
  }

  if (typeof globalThis !== 'undefined' && globalThis.Fliplet) {
    return globalThis.Fliplet;
  }

  if (typeof global !== 'undefined' && global.Fliplet) {
    return global.Fliplet;
  }

  return null;
};

const getAnalyticsInstance = () => {
  const fliplet = resolveFliplet();

  if (!fliplet || !fliplet.App || !fliplet.App.Analytics || typeof fliplet.App.Analytics.event !== 'function') {
    return null;
  }

  return fliplet.App.Analytics;
};

const setAnalyticsEnabled = (enabled) => {
  analyticsEnabled = enabled;
};

/**
 * Track dashboard viewed
 */
const trackDashboardViewed = (appId) => {
  return trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'dashboard_viewed',
    `App ${appId}`,
    appId
  );
};

/**
 * Track destination selected
 */
const trackDestinationSelected = (sourceAppId, destinationAppId) => {
  return trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'destination_selected',
    `From ${sourceAppId} to ${destinationAppId}`,
    destinationAppId
  );
};

/**
 * Track tab switched in configuration
 */
const trackTabSwitched = (tabId) => {
  return trackEvent(
    EVENT_CATEGORIES.UI_INTERACTION,
    'tab_switched',
    tabId,
    null
  );
};

/**
 * Track items selected in configuration
 */
const trackItemsSelected = (itemType, count) => {
  return trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'items_selected',
    itemType,
    count
  );
};

/**
 * Track review viewed
 */
const trackReviewViewed = (sourceAppId, destinationAppId, itemCount) => {
  return trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'review_viewed',
    `From ${sourceAppId} to ${destinationAppId}`,
    itemCount
  );
};

/**
 * Track conflict detected
 */
const trackConflictDetected = (conflictType, count) => {
  if (!analyticsEnabled) {
    return null;
  }
  return trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'conflict_detected',
    conflictType,
    count
  );
};

/**
 * Track merge initiated
 */
const trackMergeInitiated = (sourceAppId, destinationAppId, itemCount) => {
  return trackEvent(
    EVENT_CATEGORIES.WORKFLOW,
    'merge_initiated',
    `From ${sourceAppId} to ${destinationAppId}`,
    itemCount
  );
};

/**
 * Track merge progress updated
 */
const trackMergeProgressUpdated = (phase, percentage) => {
  return trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'merge_progress_updated',
    phase,
    percentage
  );
};

/**
 * Track merge completed
 */
const trackMergeCompleted = (sourceAppId, destinationAppId, duration, itemCount) => {
  trackEvent(
    EVENT_CATEGORIES.WORKFLOW,
    'merge_completed',
    `From ${sourceAppId} to ${destinationAppId}`,
    duration
  );

  // Also track item count separately
  trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'merge_completed_items',
    `From ${sourceAppId} to ${destinationAppId}`,
    itemCount
  );
};

/**
 * Track merge failed
 */
const trackMergeFailed = (sourceAppId, destinationAppId, reason) => {
  return trackEvent(
    EVENT_CATEGORIES.WORKFLOW,
    'merge_failed',
    `From ${sourceAppId} to ${destinationAppId}: ${reason}`,
    null
  );
};

/**
 * Track destination app opened
 */
const trackDestinationAppOpened = (destinationAppId) => {
  return trackEvent(
    EVENT_CATEGORIES.UI_INTERACTION,
    'destination_app_opened',
    `App ${destinationAppId}`,
    destinationAppId
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
  return trackEvent(
    EVENT_CATEGORIES.WORKFLOW,
    'merge_cancelled',
    stage,
    null
  );
};

/**
 * Track lock extended
 */
const trackLockExtended = (sourceAppId, targetAppId) => {
  return trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'lock_extended',
    `From ${sourceAppId} to ${targetAppId}`,
    null
  );
};

/**
 * Track button click
 */
const trackButtonClick = (buttonName, context) => {
  return trackEvent(
    EVENT_CATEGORIES.UI_INTERACTION,
    'button_click',
    `${buttonName} - ${context}`,
    null
  );
};

const trackPreviewViewed = (sourceAppId, destinationAppId, itemCount) => {
  return trackEvent(
    EVENT_CATEGORIES.APP_MERGE,
    'preview_viewed',
    `From ${sourceAppId} to ${destinationAppId}`,
    itemCount
  );
};

module.exports = {
  EVENT_CATEGORIES,
  trackEvent,
  getAnalyticsInstance,
  setAnalyticsEnabled,
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
  trackButtonClick,
  trackPreviewViewed
};

