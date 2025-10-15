// src/middleware/config/validation-rules.js

/**
 * Validation rule definitions
 *
 * Defines validation rules for app selection, resource selection, and business rules.
 */

const VALIDATION_RULES = {
  // App selection rules
  APP_SELECTION: {
    SOURCE_REQUIRED: {
      field: 'sourceAppId',
      message: 'Source app ID is required',
      validate: (value) => value && typeof value === 'number'
    },
    DESTINATION_REQUIRED: {
      field: 'destinationAppId',
      message: 'Destination app ID is required',
      validate: (value) => value && typeof value === 'number'
    },
    APPS_DIFFERENT: {
      fields: ['sourceAppId', 'destinationAppId'],
      message: 'Source and destination apps must be different',
      validate: (source, destination) => source !== destination
    },
    ORGANIZATION_REQUIRED: {
      field: 'destinationOrganizationId',
      message: 'Destination organization ID is required',
      validate: (value) => value && typeof value === 'number'
    }
  },

  // Resource selection rules
  RESOURCE_SELECTION: {
    AT_LEAST_ONE_RESOURCE: {
      message: 'At least one resource (pages, data sources, files, or folders) must be selected',
      validate: (config) => {
        const hasPages = config.pageIds && (config.pageIds === 'all' || config.pageIds.length > 0);
        const hasDataSources = config.dataSources && (config.dataSources === 'all' || config.dataSources.length > 0);
        const hasFiles = config.fileIds && (config.fileIds === 'all' || config.fileIds.length > 0);
        const hasFolders = config.folderIds && (config.folderIds === 'all' || config.folderIds.length > 0);

        return hasPages || hasDataSources || hasFiles || hasFolders;
      }
    }
  },

  // Business rules
  BUSINESS_RULES: {
    NO_DUPLICATE_NAMES: {
      message: 'Duplicate names are not allowed in the source app',
      category: 'duplicate'
    },
    PUBLISHER_ROLE_REQUIRED: {
      message: 'User must have publisher role to merge apps',
      category: 'permission'
    },
    APP_NOT_LOCKED: {
      message: 'App must not be locked by another user',
      category: 'lock'
    },
    WITHIN_PLAN_LIMITS: {
      message: 'Merge must not exceed destination app plan limits',
      category: 'plan'
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VALIDATION_RULES;
}

