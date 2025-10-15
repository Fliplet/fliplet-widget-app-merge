// src/middleware/api/PagesApiService.js

/**
 * PagesApiService - Wrapper for screen/page-related API endpoints
 *
 * Provides methods to interact with page endpoints including fetching pages
 * with their associations to data sources and files.
 *
 * @class PagesApiService
 */
class PagesApiService {
  /**
   * Create PagesApiService instance
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
   * Fetch app pages with associations
   *
   * @param {number} appId - App ID to fetch pages for
   * @param {Object} [options={}] - Fetch options
   * @param {Array<string>} [options.include=[]] - Associations to include ('associatedDS', 'associatedFiles')
   * @param {Array<string>} [options.fields=[]] - Page fields to return
   * @param {Object} [options.filters={}] - Custom filters
   * @param {Object} [options.sort] - Sort configuration
   * @param {string} [options.sort.field='title'] - Field to sort by
   * @param {string} [options.sort.order='asc'] - Sort order
   * @param {Object} [options.pagination] - Pagination configuration
   * @param {number} [options.pagination.page=1] - Page number
   * @param {number} [options.pagination.limit=50] - Items per page
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Array>} Array of page objects
   *
   * @example
   * const pages = await pagesApiService.fetchPages(123, {
   *   include: ['associatedDS', 'associatedFiles'],
   *   fields: ['id', 'title', 'order']
   * });
   */
  async fetchPages(appId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    const {
      include = [],
      fields = [],
      filters = {},
      sort = { field: 'title', order: 'asc' },
      pagination = { page: 1, limit: 50 },
      cache = 'default'
    } = options;

    const params = {};

    // Add include parameter
    if (include.length > 0) {
      params.include = include.join(',');
    }

    // Add fields
    if (fields.length > 0) {
      params.fields = fields.join(',');
    }

    // Add any custom filters
    Object.keys(filters).forEach((key) => {
      params[key] = filters[key];
    });

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

    const response = await this.apiClient.get(`v1/apps/${appId}/pages`, params);

    return response.pages || response;
  }

  /**
   * Fetch single page details
   *
   * @param {number} appId - App ID
   * @param {number} pageId - Page ID to fetch
   * @param {Object} [options={}] - Fetch options
   * @param {Array<string>} [options.include=[]] - Associations to include
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Object>} Page object
   *
   * @example
   * const page = await pagesApiService.fetchPage(123, 456, {
   *   include: ['associatedDS']
   * });
   */
  async fetchPage(appId, pageId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    if (!pageId || typeof pageId !== 'number') {
      throw new Error('Valid page ID is required');
    }

    const {
      include = [],
      fields = [],
      cache = 'default'
    } = options;

    const params = {};

    if (include.length > 0) {
      params.include = include.join(',');
    }

    if (fields.length > 0) {
      params.fields = fields.join(',');
    }

    const response = await this.apiClient.get(`v1/apps/${appId}/pages/${pageId}`, params);

    return response.page || response;
  }

  /**
   * Fetch page preview
   *
   * @param {number} appId - App ID
   * @param {number} pageId - Page ID
   * @param {Object} [options={}] - Preview options
   * @param {string} [options.format='html'] - Preview format ('html' or 'json')
   * @returns {Promise<Object>} Preview data
   *
   * @example
   * const preview = await pagesApiService.fetchPagePreview(123, 456);
   */
  async fetchPagePreview(appId, pageId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    if (!pageId || typeof pageId !== 'number') {
      throw new Error('Valid page ID is required');
    }

    const { format = 'html' } = options;

    const params = { format };

    const response = await this.apiClient.get(`v1/apps/${appId}/pages/${pageId}/preview`, params);

    return response;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PagesApiService;
}

