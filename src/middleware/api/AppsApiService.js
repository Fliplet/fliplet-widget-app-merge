// src/middleware/api/AppsApiService.js

/**
 * AppsApiService - Wrapper for app-related API endpoints
 *
 * Provides methods to interact with app endpoints including fetching apps,
 * checking for duplicates, and managing app locks.
 *
 * @class AppsApiService
 */
class AppsApiService {
  /**
   * Create AppsApiService instance
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
   * Fetch apps with filtering and pagination
   *
   * @param {Object} [options={}] - Fetch options
   * @param {number} [options.organizationId] - Filter by organization ID
   * @param {number} [options.userId] - Filter by user ID
   * @param {Object} [options.filters={}] - Additional filters
   * @param {boolean} [options.filters.publisher] - Only apps where user has publisher role
   * @param {boolean} [options.filters.mergeable] - Only apps that can be merged
   * @param {boolean|null} [options.filters.locked] - Filter by lock status
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {Object} [options.sort] - Sort configuration
   * @param {string} [options.sort.field='name'] - Field to sort by
   * @param {string} [options.sort.order='asc'] - Sort order (asc/desc)
   * @param {Object} [options.pagination] - Pagination configuration
   * @param {number} [options.pagination.page=1] - Page number
   * @param {number} [options.pagination.limit=50] - Items per page
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Array>} Array of app objects
   *
   * @example
   * const apps = await appsApiService.fetchApps({
   *   organizationId: 123,
   *   filters: { publisher: true },
   *   fields: ['id', 'name', 'organizationId']
   * });
   */
  async fetchApps(options = {}) {
    const {
      organizationId,
      userId,
      filters = {},
      fields = [],
      sort = { field: 'name', order: 'asc' },
      pagination = { page: 1, limit: 50 },
      cache = 'default'
    } = options;

    // Build query parameters
    const params = {};

    if (organizationId) {
      params.organizationId = organizationId;
    }

    if (userId) {
      params.userId = userId;
    }

    // Add filters
    if (filters.publisher !== undefined) {
      params.publisher = filters.publisher;
    }

    if (filters.mergeable !== undefined) {
      params.mergeable = filters.mergeable;
    }

    if (filters.locked !== undefined && filters.locked !== null) {
      params.locked = filters.locked;
    }

    // Add fields
    if (fields.length > 0) {
      params.fields = fields.join(',');
    }

    // Add sorting
    if (sort && sort.field) {
      params.sortBy = sort.field;
      params.sortOrder = sort.order || 'asc';
    }

    // Add pagination
    if (pagination) {
      params.page = pagination.page || 1;
      params.limit = pagination.limit || 50;
    }

    const response = await this.apiClient.get('v1/apps', params);

    return response.apps || response;
  }

  /**
   * Fetch single app details
   *
   * @param {number} appId - App ID to fetch
   * @param {Object} [options={}] - Fetch options
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Object>} App object
   *
   * @example
   * const app = await appsApiService.fetchApp(123, {
   *   fields: ['id', 'name', 'settings', 'lockedUntil']
   * });
   */
  async fetchApp(appId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    const { fields = [], cache = 'default' } = options;

    const params = {};

    if (fields.length > 0) {
      params.fields = fields.join(',');
    }

    const response = await this.apiClient.get(`v1/apps/${appId}`, params);

    return response.app || response;
  }

  /**
   * Check for duplicate names in an app
   *
   * @param {number} appId - App ID to check
   * @param {Object} [options={}] - Check options
   * @param {Array<string>} [options.items=['pages', 'dataSources']] - Items to check
   * @returns {Promise<Object>} Duplicate check results
   *
   * @example
   * const duplicates = await appsApiService.checkDuplicates(123, {
   *   items: ['pages', 'dataSources']
   * });
   * // Returns: { pages: [{title: 'Home', count: 2, ids: [1,2]}], dataSources: [] }
   */
  async checkDuplicates(appId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    const { items = ['pages', 'dataSources'] } = options;

    const response = await this.apiClient.post(`v1/apps/${appId}/duplicates`, {
      items
    });

    return response.duplicates || response;
  }

  /**
   * Lock an app for merge operations
   *
   * @param {number} appId - App ID to lock
   * @param {Object} [options={}] - Lock options
   * @param {number} [options.duration=600] - Lock duration in seconds
   * @returns {Promise<Object>} Lock result with lockedUntil timestamp
   *
   * @example
   * const lockResult = await appsApiService.lockApp(123, { duration: 600 });
   */
  async lockApp(appId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    const { duration = 600 } = options;

    const response = await this.apiClient.post(`v1/apps/${appId}/lock`, {
      duration
    });

    return response;
  }

  /**
   * Unlock an app
   *
   * @param {number} appId - App ID to unlock
   * @param {Object} [options={}] - Unlock options
   * @returns {Promise<Object>} Unlock result
   *
   * @example
   * await appsApiService.unlockApp(123);
   */
  async unlockApp(appId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    const response = await this.apiClient.post(`v1/apps/${appId}/unlock`);

    return response;
  }

  /**
   * Extend lock duration
   *
   * @param {number} appId - App ID to extend lock for
   * @param {Object} [options={}] - Extend options
   * @param {number} [options.duration=300] - Additional duration in seconds
   * @returns {Promise<Object>} Extended lock result
   *
   * @example
   * await appsApiService.extendLock(123, { duration: 300 });
   */
  async extendLock(appId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    const { duration = 300 } = options;

    const response = await this.apiClient.post(`v1/apps/${appId}/lock/extend`, {
      duration
    });

    return response;
  }
}

export default AppsApiService;

