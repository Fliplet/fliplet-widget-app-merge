// src/middleware/api/DataSourcesApiService.js

/**
 * DataSourcesApiService - Wrapper for data source-related API endpoints
 *
 * Provides methods to interact with data source endpoints.
 *
 * @class DataSourcesApiService
 */
class DataSourcesApiService {
  /**
   * Create DataSourcesApiService instance
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
   * Fetch app data sources with associations
   *
   * @param {number} appId - App ID to fetch data sources for
   * @param {Object} [options={}] - Fetch options
   * @param {Array<string>} [options.include=[]] - Associations to include
   * @param {boolean} [options.includeInUse=false] - Include usage information
   * @param {Object} [options.filters={}] - Additional filters
   * @param {null|string} [options.filters.type=null] - Filter by type (null for standard data sources)
   * @param {boolean} [options.filters.hasGlobalDependency] - Filter by global dependency
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {Object} [options.sort] - Sort configuration
   * @param {string} [options.sort.field='name'] - Field to sort by
   * @param {string} [options.sort.order='asc'] - Sort order
   * @param {Object} [options.pagination] - Pagination configuration
   * @param {number} [options.pagination.page=1] - Page number
   * @param {number} [options.pagination.limit=50] - Items per page
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Array>} Array of data source objects
   *
   * @example
   * const dataSources = await dataSourcesApiService.fetchDataSources(123, {
   *   filters: { type: null },
   *   include: ['associatedPages']
   * });
   */
  async fetchDataSources(appId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    const {
      include = [],
      includeInUse = false,
      filters = {},
      fields = [],
      sort = { field: 'name', order: 'asc' },
      pagination = { page: 1, limit: 50 },
      cache = 'default'
    } = options;

    const params = {
      appId
    };

    // Add include parameter
    if (include.length > 0) {
      params.include = include.join(',');
    }

    // Add includeInUse
    if (includeInUse) {
      params.includeInUse = true;
    }

    // Add filters
    if (filters.type !== undefined) {
      params.type = filters.type;
    }

    if (filters.hasGlobalDependency !== undefined) {
      params.hasGlobalDependency = filters.hasGlobalDependency;
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

    const response = await this.apiClient.get('v1/data-sources', params);

    return response.dataSources || response;
  }

  /**
   * Fetch single data source details
   *
   * @param {number} dataSourceId - Data source ID to fetch
   * @param {Object} [options={}] - Fetch options
   * @param {number} [options.appId] - App ID (required for association queries)
   * @param {Array<string>} [options.include=[]] - Associations to include
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Object>} Data source object
   *
   * @example
   * const dataSource = await dataSourcesApiService.fetchDataSource(789, {
   *   appId: 123,
   *   include: ['associatedPages']
   * });
   */
  async fetchDataSource(dataSourceId, options = {}) {
    if (!dataSourceId || typeof dataSourceId !== 'number') {
      throw new Error('Valid data source ID is required');
    }

    const {
      appId,
      include = [],
      fields = [],
      cache = 'default'
    } = options;

    const params = {};

    if (appId) {
      params.appId = appId;
    }

    if (include.length > 0) {
      params.include = include.join(',');
    }

    if (fields.length > 0) {
      params.fields = fields.join(',');
    }

    const response = await this.apiClient.get(`v1/data-sources/${dataSourceId}`, params);

    return response.dataSource || response;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataSourcesApiService;
}

