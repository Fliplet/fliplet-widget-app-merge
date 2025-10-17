// src/middleware/api/OrganizationsApiService.js

/**
 * OrganizationsApiService - Wrapper for organization-related API endpoints
 *
 * Provides methods to interact with organization endpoints.
 *
 * @class OrganizationsApiService
 */
class OrganizationsApiService {
  /**
   * Create OrganizationsApiService instance
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
   * Fetch user's organizations
   *
   * @param {Object} [options={}] - Fetch options
   * @param {number} [options.userId] - Filter by user ID (defaults to current user)
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {Object} [options.sort] - Sort configuration
   * @param {string} [options.sort.field='name'] - Field to sort by
   * @param {string} [options.sort.order='asc'] - Sort order
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Array>} Array of organization objects
   *
   * @example
   * const orgs = await organizationsApiService.fetchOrganizations({
   *   fields: ['id', 'name']
   * });
   */
  async fetchOrganizations(options = {}) {
    const {
      userId,
      fields = [],
      sort = { field: 'name', order: 'asc' },
      cache = 'default'
    } = options;

    const params = {};

    if (userId) {
      params.userId = userId;
    }

    if (fields.length > 0) {
      params.fields = fields.join(',');
    }

    if (sort && sort.field) {
      params.sortBy = sort.field;
      params.sortOrder = sort.order || 'asc';
    }

    const response = await this.apiClient.get('v1/organizations', params);

    return response.organizations || response;
  }

  /**
   * Fetch organization details
   *
   * @param {number} organizationId - Organization ID to fetch
   * @param {Object} [options={}] - Fetch options
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Object>} Organization object
   *
   * @example
   * const org = await organizationsApiService.fetchOrganization(123);
   */
  async fetchOrganization(organizationId, options = {}) {
    if (!organizationId || typeof organizationId !== 'number') {
      throw new Error('Valid organization ID is required');
    }

    const { fields = [], cache = 'default' } = options;

    const params = {};

    if (fields.length > 0) {
      params.fields = fields.join(',');
    }

    const response = await this.apiClient.get(`v1/organizations/${organizationId}`, params);

    return response.organization || response;
  }

  /**
   * Fetch user's apps in an organization
   *
   * @param {number} organizationId - Organization ID
   * @param {number} userId - User ID
   * @param {Object} [options={}] - Fetch options
   * @param {Object} [options.filters={}] - App filters
   * @param {boolean} [options.filters.publisher] - Only publisher apps
   * @param {Array<string>} [options.fields=[]] - Fields to return
   * @param {string} [options.cache='default'] - Cache strategy
   * @returns {Promise<Array>} Array of app objects
   *
   * @example
   * const apps = await organizationsApiService.fetchUserApps(123, 456, {
   *   filters: { publisher: true }
   * });
   */
  async fetchUserApps(organizationId, userId, options = {}) {
    if (!organizationId || typeof organizationId !== 'number') {
      throw new Error('Valid organization ID is required');
    }

    if (!userId || typeof userId !== 'number') {
      throw new Error('Valid user ID is required');
    }

    const {
      filters = {},
      fields = [],
      cache = 'default'
    } = options;

    const params = {};

    if (filters.publisher !== undefined) {
      params.publisher = filters.publisher;
    }

    if (fields.length > 0) {
      params.fields = fields.join(',');
    }

    const response = await this.apiClient.get(
      `v1/organizations/${organizationId}/users/${userId}/apps`,
      params
    );

    return response.apps || response;
  }
}

export default OrganizationsApiService;

