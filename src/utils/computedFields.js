/**
 * Computed Fields Utilities
 *
 * Provides functions to derive computed fields client-side from API data
 * These fields are not returned by the API but need to be calculated in the UI
 */

/**
 * Check if an app is currently locked
 * @param {number|string} lockedUntil - Timestamp when lock expires (milliseconds or ISO string)
 * @returns {boolean} True if app is currently locked
 */
export function isLocked(lockedUntil) {
  if (!lockedUntil) return false;

  const lockTimestamp = typeof lockedUntil === 'string'
    ? new Date(lockedUntil).getTime()
    : lockedUntil;

  return lockTimestamp > Date.now();
}

/**
 * Check if current user has publisher rights on an app
 * @param {Object} app - App object with appUser object or users array
 * @param {Object} currentUser - Current user object
 * @returns {boolean} True if user has publisher rights
 */
export function hasPublisherRights(app, currentUser) {
  if (!app) return false;

  // New API format: check appUser.appRoleId
  if (app.appUser && typeof app.appUser.appRoleId === 'number') {
    return app.appUser.appRoleId === 1;
  }

  // Legacy API format: check users array
  if (app.users && Array.isArray(app.users) && currentUser && currentUser.email) {
    const userInApp = app.users.find(u => u.email === currentUser.email);
    if (userInApp && typeof userInApp.userRoleId === 'number') {
      return userInApp.userRoleId === 1;
    }
  }

  // Fallback: if no permission data is available, assume user has rights
  // This handles cases where the API doesn't return permission data
  console.warn('[hasPublisherRights] No permission data found, assuming publisher rights');
  return true;
}

/**
 * Check if a data source is a global dependency
 * A data source is considered a global dependency if it has no associated pages
 * @param {Object} dataSource - Data source object
 * @returns {boolean} True if data source is a global dependency
 */
export function isGlobalDependency(dataSource) {
  if (!dataSource) return false;

  // Check both possible field names
  const pages = dataSource.associatedPages || dataSource.associatedScreens || [];

  return Array.isArray(pages) && pages.length === 0;
}

/**
 * Check if an app is published (has production app)
 * @param {Object} app - App object
 * @returns {boolean} True if app is published
 */
export function isPublished(app) {
  if (!app) return false;
  return !!app.productionAppId;
}

/**
 * Get formatted lock time remaining
 * @param {number|string} lockedUntil - Timestamp when lock expires
 * @returns {string|null} Human-readable time remaining, or null if not locked
 */
export function getLockTimeRemaining(lockedUntil) {
  if (!isLocked(lockedUntil)) return null;

  const lockTimestamp = typeof lockedUntil === 'string'
    ? new Date(lockedUntil).getTime()
    : lockedUntil;

  const remaining = lockTimestamp - Date.now();
  const minutes = Math.ceil(remaining / 60000);

  if (minutes < 1) return 'Less than 1 minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 1 && mins === 0) return '1 hour';
  if (hours === 1) return `1 hour ${mins} minutes`;
  if (mins === 0) return `${hours} hours`;

  return `${hours} hours ${mins} minutes`;
}

/**
 * Check if user can select an app as merge destination
 * Combines multiple checks: not locked, has publisher rights, is not source app
 * @param {Object} app - App object to check
 * @param {Object} currentUser - Current user object
 * @param {number} sourceAppId - Source app ID to exclude
 * @returns {boolean} True if app can be selected
 */
export function canSelectApp(app, currentUser, sourceAppId) {
  if (!app) return false;

  // Cannot select source app
  if (app.id === sourceAppId) return false;

  // Must have publisher rights
  if (!hasPublisherRights(app, currentUser)) return false;

  // Cannot be locked
  if (isLocked(app.lockedUntil)) return false;

  return true;
}

/**
 * Get user role name from role ID
 * @param {number} roleId - User role ID
 * @returns {string} Role name
 */
export function getUserRoleName(roleId) {
  const roles = {
    1: 'Publisher',
    2: 'Editor',
    3: 'Viewer'
  };

  return roles[roleId] || 'Unknown';
}

/**
 * Calculate selection statistics for UI display
 * @param {Object} selections - Object with selected items arrays
 * @returns {Object} Statistics object
 */
export function calculateSelectionStats(selections) {
  const {
    selectedPages = [],
    selectedDataSources = [],
    selectedFiles = [],
    selectedFolders = [],
    appLevelSettings = {}
  } = selections;

  const settingsCount = Object.values(appLevelSettings).filter(Boolean).length;

  return {
    pages: selectedPages.length,
    dataSources: selectedDataSources.length,
    files: selectedFiles.length,
    folders: selectedFolders.length,
    settings: settingsCount,
    total: selectedPages.length + selectedDataSources.length +
           selectedFiles.length + selectedFolders.length + settingsCount,
    hasSelection: selectedPages.length > 0 ||
                  selectedDataSources.length > 0 ||
                  selectedFiles.length > 0 ||
                  selectedFolders.length > 0 ||
                  settingsCount > 0
  };
}
