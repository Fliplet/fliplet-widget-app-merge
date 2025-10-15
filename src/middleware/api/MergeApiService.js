// src/middleware/api/MergeApiService.js

/**
 * MergeApiService - Wrapper for merge-related API endpoints
 *
 * Provides methods to interact with merge operation endpoints.
 *
 * @class MergeApiService
 */
class MergeApiService {
  /**
   * Create MergeApiService instance
   *
   * @param {Object} apiClient - ApiClient instance for making requests
   */
  constructor(apiClient) {
    if (!apiClient) {
      throw new Error('ApiClient is required');
    }

    this.apiClient = apiClient;
  }

  /**
   * Lock apps for merge configuration
   *
   * @param {number} sourceAppId - Source app ID to lock
   * @param {Object} [options={}] - Lock options
   * @param {Object} [options.targetApp] - Target app configuration
   * @param {number} [options.targetApp.id] - Target app ID
   * @param {string} [options.targetApp.region] - Target app region
   * @param {number} [options.lockDuration=600] - Lock duration in seconds
   * @returns {Promise<Object>} Lock result
   *
   * @example
   * const result = await mergeApiService.lockApps(123, {
   *   targetApp: { id: 456, region: 'eu' },
   *   lockDuration: 600
   * });
   */
  async lockApps(sourceAppId, options = {}) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    const {
      targetApp = {},
      lockDuration = 600
    } = options;

    const response = await this.apiClient.post(`v1/apps/${sourceAppId}/merge/lock`, {
      targetApp,
      lockDuration
    });

    return response;
  }

  /**
   * Unlock apps
   *
   * @param {number} sourceAppId - Source app ID
   * @param {Object} [options={}] - Unlock options
   * @param {Object} [options.targetApp] - Target app configuration
   * @returns {Promise<Object>} Unlock result
   *
   * @example
   * await mergeApiService.unlockApps(123, {
   *   targetApp: { id: 456 }
   * });
   */
  async unlockApps(sourceAppId, options = {}) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    const { targetApp = {} } = options;

    const response = await this.apiClient.post(`v1/apps/${sourceAppId}/merge/unlock`, {
      targetApp
    });

    return response;
  }

  /**
   * Extend lock duration
   *
   * @param {number} sourceAppId - Source app ID
   * @param {Object} [options={}] - Extend options
   * @param {Object} [options.targetApp] - Target app configuration
   * @param {number} [options.extendDuration=300] - Duration to add in seconds
   * @returns {Promise<Object>} Extended lock result
   *
   * @example
   * await mergeApiService.extendLock(123, {
   *   targetApp: { id: 456 },
   *   extendDuration: 300
   * });
   */
  async extendLock(sourceAppId, options = {}) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    const {
      targetApp = {},
      extendDuration = 300
    } = options;

    const response = await this.apiClient.post(`v1/apps/${sourceAppId}/merge/lock/extend`, {
      targetApp,
      extendDuration
    });

    return response;
  }

  /**
   * Preview merge results
   *
   * @param {number} sourceAppId - Source app ID
   * @param {Object} mergeConfig - Merge configuration
   * @param {number} mergeConfig.destinationAppId - Destination app ID
   * @param {number} mergeConfig.destinationOrganizationId - Destination org ID
   * @param {Array|string} mergeConfig.pageIds - Page IDs to merge or 'all'
   * @param {Array|string} mergeConfig.dataSources - Data sources to merge or 'all'
   * @param {Array|string} mergeConfig.fileIds - File IDs to merge or 'all'
   * @param {Array|string} mergeConfig.folderIds - Folder IDs to merge or 'all'
   * @param {boolean} [mergeConfig.mergeAppSettings=false] - Merge app settings
   * @param {boolean} [mergeConfig.mergeMenuSettings=false] - Merge menu settings
   * @param {boolean} [mergeConfig.mergeAppearanceSettings=false] - Merge appearance
   * @param {boolean} [mergeConfig.mergeGlobalCode=false] - Merge global code
   * @param {Array} [mergeConfig.customDataSourcesInUse=[]] - Custom data sources in use
   * @returns {Promise<Object>} Preview results
   *
   * @example
   * const preview = await mergeApiService.previewMerge(123, {
   *   destinationAppId: 456,
   *   destinationOrganizationId: 100,
   *   pageIds: [1, 2, 3],
   *   dataSources: [],
   *   fileIds: 'all',
   *   folderIds: []
   * });
   */
  async previewMerge(sourceAppId, mergeConfig) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    if (!mergeConfig || !mergeConfig.destinationAppId) {
      throw new Error('Valid merge configuration with destinationAppId is required');
    }

    const response = await this.apiClient.post(`v1/apps/${sourceAppId}/merge/preview`, mergeConfig);

    return response;
  }

  /**
   * Initiate merge
   *
   * @param {number} sourceAppId - Source app ID
   * @param {Object} mergeConfig - Merge configuration (same structure as previewMerge)
   * @returns {Promise<Object>} Merge initiation result with mergeId
   *
   * @example
   * const result = await mergeApiService.initiateMerge(123, mergeConfig);
   */
  async initiateMerge(sourceAppId, mergeConfig) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    if (!mergeConfig || !mergeConfig.destinationAppId) {
      throw new Error('Valid merge configuration with destinationAppId is required');
    }

    const response = await this.apiClient.post(`v1/apps/${sourceAppId}/merge`, mergeConfig);

    return response;
  }

  /**
   * Get merge status
   *
   * @param {number} sourceAppId - Source app ID
   * @param {Object} [options={}] - Status options
   * @param {number} [options.mergeId] - Merge ID to check
   * @returns {Promise<Object>} Merge status
   *
   * @example
   * const status = await mergeApiService.getMergeStatus(123, { mergeId: 5000 });
   */
  async getMergeStatus(sourceAppId, options = {}) {
    if (!sourceAppId || typeof sourceAppId !== 'number') {
      throw new Error('Valid source app ID is required');
    }

    const { mergeId } = options;

    const data = mergeId ? { mergeId } : {};

    const response = await this.apiClient.post(`v1/apps/${sourceAppId}/merge/status`, data);

    return response;
  }

  /**
   * Fetch merge logs
   *
   * @param {number} appId - App ID
   * @param {Object} [options={}] - Fetch options
   * @param {number} [options.mergeId] - Filter by merge ID
   * @param {Array<string>} [options.types=[]] - Filter by log types
   * @param {Object} [options.pagination] - Pagination configuration
   * @param {number} [options.pagination.page=1] - Page number
   * @param {number} [options.pagination.limit=50] - Items per page
   * @returns {Promise<Array>} Array of log entries
   *
   * @example
   * const logs = await mergeApiService.fetchMergeLogs(123, {
   *   mergeId: 5000,
   *   types: ['info', 'error']
   * });
   */
  async fetchMergeLogs(appId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    const {
      mergeId,
      types = [],
      pagination = { page: 1, limit: 50 }
    } = options;

    const data = {};

    if (mergeId) {
      data.mergeId = mergeId;
    }

    if (types.length > 0) {
      data.types = types;
    }

    if (pagination) {
      data.page = pagination.page || 1;
      data.limit = pagination.limit || 50;
    }

    const response = await this.apiClient.post(`v1/apps/${appId}/logs`, data);

    return response.logs || response;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MergeApiService;
}

