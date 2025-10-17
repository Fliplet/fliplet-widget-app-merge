// src/middleware/api/MediaApiService.js

/**
 * MediaApiService - Wrapper for file and folder-related API endpoints
 *
 * Provides methods to interact with media endpoints.
 *
 * @class MediaApiService
 */
class MediaApiService {
  /**
   * Create MediaApiService instance
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
   * Fetch app media (files and folders)
   *
   * @param {number} appId - App ID to fetch media for
   * @param {Object} [options={}] - Fetch options
   * @param {Array<string>} [options.include=[]] - Associations to include
   * @param {Object} [options.filters={}] - Additional filters
   * @param {string} [options.filters.type] - Filter by file type
   * @param {boolean} [options.filters.hasAssociations] - Filter by association existence
   * @param {boolean} [options.filters.isUnused] - Filter unused files
   * @param {boolean} [options.filters.isGlobalLibrary] - Filter global libraries
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {Object} [options.sort] - Sort configuration
   * @param {string} [options.sort.field='name'] - Field to sort by
   * @param {string} [options.sort.order='asc'] - Sort order
   * @param {Object} [options.pagination] - Pagination configuration
   * @param {number} [options.pagination.page=1] - Page number
   * @param {number} [options.pagination.limit=50] - Items per page
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Object>} Object with files and folders arrays
   *
   * @example
   * const media = await mediaApiService.fetchMedia(123, {
   *   include: ['associatedPages'],
   *   filters: { isUnused: false }
   * });
   */
  async fetchMedia(appId, options = {}) {
    if (!appId || typeof appId !== 'number') {
      throw new Error('Valid app ID is required');
    }

    const {
      include = [],
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

    // Add filters
    if (filters.type) {
      params.type = filters.type;
    }

    if (filters.hasAssociations !== undefined) {
      params.hasAssociations = filters.hasAssociations;
    }

    if (filters.isUnused !== undefined) {
      params.isUnused = filters.isUnused;
    }

    if (filters.isGlobalLibrary !== undefined) {
      params.isGlobalLibrary = filters.isGlobalLibrary;
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

    const response = await this.apiClient.get('v1/media', params);

    return response;
  }

  /**
   * Fetch single file details
   *
   * @param {number} fileId - File ID to fetch
   * @param {Object} [options={}] - Fetch options
   * @param {number} [options.appId] - App ID (required for association queries)
   * @param {Array<string>} [options.include=[]] - Associations to include
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Object>} File object
   *
   * @example
   * const file = await mediaApiService.fetchFile(100, {
   *   appId: 123,
   *   include: ['associatedPages']
   * });
   */
  async fetchFile(fileId, options = {}) {
    if (!fileId || typeof fileId !== 'number') {
      throw new Error('Valid file ID is required');
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

    const response = await this.apiClient.get(`v1/media/files/${fileId}`, params);

    return response.file || response;
  }

  /**
   * Fetch single folder details
   *
   * @param {number} folderId - Folder ID to fetch
   * @param {Object} [options={}] - Fetch options
   * @param {number} [options.appId] - App ID (required for association queries)
   * @param {Array<string>} [options.include=[]] - Associations to include
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Object>} Folder object
   *
   * @example
   * const folder = await mediaApiService.fetchFolder(200, {
   *   appId: 123
   * });
   */
  async fetchFolder(folderId, options = {}) {
    if (!folderId || typeof folderId !== 'number') {
      throw new Error('Valid folder ID is required');
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

    const response = await this.apiClient.get(`v1/media/folders/${folderId}`, params);

    return response.folder || response;
  }
}

export default MediaApiService;

