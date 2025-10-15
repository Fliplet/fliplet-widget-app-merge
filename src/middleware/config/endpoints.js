// src/middleware/config/endpoints.js

/**
 * API endpoint URL constants
 *
 * Defines all API endpoint templates with parameter placeholders.
 */

const ENDPOINTS = {
  // Apps endpoints
  APPS_LIST: 'v1/apps',
  APPS_GET: 'v1/apps/:appId',
  APPS_DUPLICATES: 'v1/apps/:appId/duplicates',
  APPS_LOCK: 'v1/apps/:appId/lock',
  APPS_UNLOCK: 'v1/apps/:appId/unlock',
  APPS_LOCK_EXTEND: 'v1/apps/:appId/lock/extend',

  // Organizations endpoints
  ORGANIZATIONS_LIST: 'v1/organizations',
  ORGANIZATIONS_GET: 'v1/organizations/:organizationId',
  ORGANIZATIONS_USER_APPS: 'v1/organizations/:organizationId/users/:userId/apps',

  // Pages endpoints
  PAGES_LIST: 'v1/apps/:appId/pages',
  PAGES_GET: 'v1/apps/:appId/pages/:pageId',
  PAGES_PREVIEW: 'v1/apps/:appId/pages/:pageId/preview',

  // Data Sources endpoints
  DATA_SOURCES_LIST: 'v1/data-sources',
  DATA_SOURCES_GET: 'v1/data-sources/:dataSourceId',

  // Media endpoints
  MEDIA_LIST: 'v1/media',
  MEDIA_FILES_GET: 'v1/media/files/:fileId',
  MEDIA_FOLDERS_GET: 'v1/media/folders/:folderId',

  // Merge endpoints
  MERGE_LOCK: 'v1/apps/:appId/merge/lock',
  MERGE_UNLOCK: 'v1/apps/:appId/merge/unlock',
  MERGE_LOCK_EXTEND: 'v1/apps/:appId/merge/lock/extend',
  MERGE_PREVIEW: 'v1/apps/:appId/merge/preview',
  MERGE_INITIATE: 'v1/apps/:appId/merge',
  MERGE_STATUS: 'v1/apps/:appId/merge/status',
  MERGE_LOGS: 'v1/apps/:appId/logs'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ENDPOINTS;
}

