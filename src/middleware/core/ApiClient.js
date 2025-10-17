// src/middleware/core/ApiClient.js

/**
 * ApiClient - HTTP communication layer using Fliplet.API.request()
 *
 * Handles all HTTP requests to the Fliplet API with automatic retry logic,
 * authentication, and error handling.
 *
 * IMPORTANT: This class uses Fliplet.API.request() as documented at:
 * https://developers.fliplet.com/API/core/api.html
 *
 * @class ApiClient
 */
class ApiClient {
  /**
   * Create ApiClient instance
   *
   * Checks for custom apiUrl and auth_token from Fliplet.Navigate.query
   * and uses them if provided.
   */
  constructor() {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    };

    // Check for overrides from Fliplet.Navigate.query
    this.apiUrl = null; // Only set if custom apiUrl provided
    this.authToken = null;

    if (typeof Fliplet !== 'undefined' && Fliplet.Navigate && Fliplet.Navigate.query) {
      if (Fliplet.Navigate.query.apiUrl) {
        this.apiUrl = Fliplet.Navigate.query.apiUrl;
      }

      if (Fliplet.Navigate.query.auth_token) {
        this.authToken = Fliplet.Navigate.query.auth_token;
      }
    }
  }

  /**
   * Make an HTTP request
   *
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} endpoint - API endpoint (e.g., 'v1/apps' or '/v1/apps')
   * @param {*} [data=null] - Request payload for POST/PUT requests
   * @param {Object} [options={}] - Additional request options
   * @param {Object} [options.headers={}] - Custom headers to include
   * @param {number} [options.timeout] - Request timeout in milliseconds
   * @returns {Promise<*>} Response data from API
   *
   * @example
   * const apps = await apiClient.request('GET', 'v1/apps', null, {
   *   headers: { 'Custom-Header': 'value' }
   * });
   */
  async request(method, endpoint, data = null, options = {}) {
    const requestConfig = {
      url: this.buildRequestUrl(endpoint),
      method: method.toUpperCase(),
      headers: this.buildRequestHeaders(options.headers)
    };

    // Add custom apiUrl only if provided
    if (this.apiUrl) {
      requestConfig.apiUrl = this.apiUrl;
    }

    // Add timeout if specified
    if (options.timeout || this.config.timeout) {
      requestConfig.timeout = options.timeout || this.config.timeout;
    }

    // Add data for POST/PUT/PATCH requests
    if (data && ['POST', 'PUT', 'PATCH'].includes(requestConfig.method)) {
      requestConfig.data = data;
    }

    // Add query params for GET requests
    if (data && requestConfig.method === 'GET') {
      requestConfig.url = this.buildUrlWithQueryParams(requestConfig.url, data);
    }

    return this.executeWithRetry(requestConfig);
  }

  /**
   * Build request URL from endpoint
   *
   * Handles both custom apiUrl and default cases.
   * - No custom apiUrl: return 'v1/apps' (Fliplet.API.request() adds base URL)
   * - Custom apiUrl: return full URL
   *
   * @param {string} endpoint - API endpoint
   * @returns {string} Properly formatted request URL
   *
   * @private
   */
  buildRequestUrl(endpoint) {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    if (this.apiUrl) {
      // Custom apiUrl: ensure it ends with / and combine with endpoint
      const baseUrl = this.apiUrl.endsWith('/') ? this.apiUrl : `${this.apiUrl}/`;

      return `${baseUrl}${cleanEndpoint}`;
    }

    // Default: Fliplet.API.request() will add the base URL
    return cleanEndpoint;
  }

  /**
   * Build URL with query parameters
   *
   * @param {string} url - Base URL
   * @param {Object} params - Query parameters object
   * @returns {string} URL with query parameters
   *
   * @private
   */
  buildUrlWithQueryParams(url, params) {
    if (!params || typeof params !== 'object') {
      return url;
    }

    const queryString = Object.keys(params)
      .filter(key => params[key] !== null && params[key] !== undefined)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    if (queryString) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${queryString}`;
    }

    return url;
  }

  /**
   * Build request headers
   *
   * Adds custom auth token if provided via Fliplet.Navigate.query.auth_token
   *
   * @param {Object} [customHeaders={}] - Additional headers to include
   * @returns {Object} Complete headers object
   *
   * @private
   */
  buildRequestHeaders(customHeaders = {}) {
    const headers = { ...customHeaders };

    if (this.authToken) {
      headers['Auth-token'] = this.authToken;
    }

    return headers;
  }

  /**
   * Execute request with exponential backoff retry logic
   *
   * Retries on network errors and 5xx server errors.
   * Does NOT retry on 4xx client errors.
   *
   * @param {Object} requestConfig - Request configuration for Fliplet.API.request()
   * @returns {Promise<*>} Response data from API
   *
   * @private
   */
  async executeWithRetry(requestConfig) {
    let lastError;

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const response = await Fliplet.API.request(requestConfig);

        return response;
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Wait before retry with exponential backoff
        if (attempt < this.config.retryAttempts - 1) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);

          await this.delay(delay);
        }
      }
    }

    // All retries exhausted, throw last error
    throw lastError;
  }

  /**
   * Delay execution for specified milliseconds
   *
   * Used for retry backoff delays.
   *
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>} Promise that resolves after delay
   *
   * @private
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET request helper
   *
   * @param {string} endpoint - API endpoint
   * @param {Object} [params=null] - Query parameters
   * @param {Object} [options={}] - Additional request options
   * @returns {Promise<*>} Response data
   *
   * @example
   * const apps = await apiClient.get('v1/apps', { organizationId: 123 });
   */
  async get(endpoint, params = null, options = {}) {
    return this.request('GET', endpoint, params, options);
  }

  /**
   * POST request helper
   *
   * @param {string} endpoint - API endpoint
   * @param {*} [data=null] - Request payload
   * @param {Object} [options={}] - Additional request options
   * @returns {Promise<*>} Response data
   *
   * @example
   * const result = await apiClient.post('v1/apps/123/lock', { duration: 600 });
   */
  async post(endpoint, data = null, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  /**
   * PUT request helper
   *
   * @param {string} endpoint - API endpoint
   * @param {*} [data=null] - Request payload
   * @param {Object} [options={}] - Additional request options
   * @returns {Promise<*>} Response data
   */
  async put(endpoint, data = null, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  /**
   * DELETE request helper
   *
   * @param {string} endpoint - API endpoint
   * @param {Object} [options={}] - Additional request options
   * @returns {Promise<*>} Response data
   */
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }
}

export default ApiClient;

