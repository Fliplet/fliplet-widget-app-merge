// src/middleware/core/ApiClient.test.js

const ApiClient = require('./ApiClient');

describe('ApiClient', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = new ApiClient();
  });

  describe('constructor', () => {
    test('should initialize with default configuration', () => {
      expect(apiClient.config).toEqual({
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      });
    });

    test('should not set custom apiUrl when not provided', () => {
      expect(apiClient.apiUrl).toBeNull();
    });

    test('should not set custom authToken when not provided', () => {
      expect(apiClient.authToken).toBeNull();
    });

    test('should set custom apiUrl from Fliplet.Navigate.query', () => {
      global.Fliplet.Navigate.query.apiUrl = 'https://custom-api.test/';

      const client = new ApiClient();

      expect(client.apiUrl).toBe('https://custom-api.test/');
    });

    test('should set custom auth token from Fliplet.Navigate.query', () => {
      global.Fliplet.Navigate.query.auth_token = 'custom-token-123';

      const client = new ApiClient();

      expect(client.authToken).toBe('custom-token-123');
    });
  });

  describe('buildRequestUrl()', () => {
    test('should return endpoint without leading slash when no custom apiUrl', () => {
      const url = apiClient.buildRequestUrl('v1/apps');

      expect(url).toBe('v1/apps');
    });

    test('should remove leading slash from endpoint when no custom apiUrl', () => {
      const url = apiClient.buildRequestUrl('/v1/apps');

      expect(url).toBe('v1/apps');
    });

    test('should combine custom apiUrl with endpoint', () => {
      apiClient.apiUrl = 'https://custom-api.test/';

      const url = apiClient.buildRequestUrl('v1/apps');

      expect(url).toBe('https://custom-api.test/v1/apps');
    });

    test('should add trailing slash to custom apiUrl if missing', () => {
      apiClient.apiUrl = 'https://custom-api.test';

      const url = apiClient.buildRequestUrl('v1/apps');

      expect(url).toBe('https://custom-api.test/v1/apps');
    });

    test('should handle custom apiUrl with trailing slash and endpoint with leading slash', () => {
      apiClient.apiUrl = 'https://custom-api.test/';

      const url = apiClient.buildRequestUrl('/v1/apps');

      expect(url).toBe('https://custom-api.test/v1/apps');
    });
  });

  describe('buildRequestHeaders()', () => {
    test('should return empty object when no custom headers or auth token', () => {
      const headers = apiClient.buildRequestHeaders();

      expect(headers).toEqual({});
    });

    test('should include custom headers', () => {
      const headers = apiClient.buildRequestHeaders({
        'Custom-Header': 'value',
        'Another-Header': 'another-value'
      });

      expect(headers).toEqual({
        'Custom-Header': 'value',
        'Another-Header': 'another-value'
      });
    });

    test('should add Auth-token header when authToken is set', () => {
      apiClient.authToken = 'custom-token-123';

      const headers = apiClient.buildRequestHeaders();

      expect(headers).toEqual({
        'Auth-token': 'custom-token-123'
      });
    });

    test('should merge custom headers with Auth-token', () => {
      apiClient.authToken = 'custom-token-123';

      const headers = apiClient.buildRequestHeaders({
        'Custom-Header': 'value'
      });

      expect(headers).toEqual({
        'Custom-Header': 'value',
        'Auth-token': 'custom-token-123'
      });
    });
  });

  describe('request()', () => {
    test('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };

      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.request('GET', 'v1/apps');

      expect(result).toEqual(mockResponse);
      expect(global.Fliplet.API.request).toHaveBeenCalledWith({
        url: 'v1/apps',
        method: 'GET',
        headers: {},
        timeout: 30000
      });
    });

    test('should make successful POST request with data', async () => {
      const mockResponse = { id: 123 };
      const requestData = { name: 'Test App' };

      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.request('POST', 'v1/apps', requestData);

      expect(result).toEqual(mockResponse);
      expect(global.Fliplet.API.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'v1/apps',
          method: 'POST',
          data: requestData
        })
      );
    });

    test('should include custom apiUrl in request config when set', async () => {
      apiClient.apiUrl = 'https://custom-api.test/';

      global.Fliplet.API.request.mockResolvedValue({});

      await apiClient.request('GET', 'v1/apps');

      expect(global.Fliplet.API.request).toHaveBeenCalledWith(
        expect.objectContaining({
          apiUrl: 'https://custom-api.test/'
        })
      );
    });

    test('should not include apiUrl in request config when not set', async () => {
      global.Fliplet.API.request.mockResolvedValue({});

      await apiClient.request('GET', 'v1/apps');

      const callArgs = global.Fliplet.API.request.mock.calls[0][0];

      expect(callArgs).not.toHaveProperty('apiUrl');
    });

    test('should include custom headers in request', async () => {
      global.Fliplet.API.request.mockResolvedValue({});

      await apiClient.request('GET', 'v1/apps', null, {
        headers: { 'Custom-Header': 'value' }
      });

      expect(global.Fliplet.API.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { 'Custom-Header': 'value' }
        })
      );
    });

    test('should include timeout in request config', async () => {
      global.Fliplet.API.request.mockResolvedValue({});

      await apiClient.request('GET', 'v1/apps');

      expect(global.Fliplet.API.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000
        })
      );
    });

    test('should use custom timeout if provided in options', async () => {
      global.Fliplet.API.request.mockResolvedValue({});

      await apiClient.request('GET', 'v1/apps', null, { timeout: 60000 });

      expect(global.Fliplet.API.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 60000
        })
      );
    });

    test('should add params for GET requests with data', async () => {
      global.Fliplet.API.request.mockResolvedValue({});

      await apiClient.request('GET', 'v1/apps', { organizationId: 123 });

      expect(global.Fliplet.API.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { organizationId: 123 }
        })
      );
    });
  });

  describe('executeWithRetry()', () => {
    test('should return response on first successful attempt', async () => {
      const mockResponse = { data: 'test' };

      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.request('GET', 'v1/apps');

      expect(result).toEqual(mockResponse);
      expect(global.Fliplet.API.request).toHaveBeenCalledTimes(1);
    });

    test('should retry on network error (status 0)', async () => {
      const networkError = { status: 0, message: 'Network error' };
      const mockResponse = { data: 'success' };

      global.Fliplet.API.request
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockResponse);

      const result = await apiClient.request('GET', 'v1/apps');

      expect(result).toEqual(mockResponse);
      expect(global.Fliplet.API.request).toHaveBeenCalledTimes(3);
    });

    test('should retry on 5xx server error', async () => {
      const serverError = { status: 500, message: 'Internal server error' };
      const mockResponse = { data: 'success' };

      global.Fliplet.API.request
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(mockResponse);

      const result = await apiClient.request('GET', 'v1/apps');

      expect(result).toEqual(mockResponse);
      expect(global.Fliplet.API.request).toHaveBeenCalledTimes(2);
    });

    test('should NOT retry on 4xx client error', async () => {
      const clientError = { status: 404, message: 'Not found' };

      global.Fliplet.API.request.mockRejectedValue(clientError);

      await expect(apiClient.request('GET', 'v1/apps')).rejects.toEqual(clientError);
      expect(global.Fliplet.API.request).toHaveBeenCalledTimes(1);
    });

    test('should NOT retry on 401 authentication error', async () => {
      const authError = { status: 401, message: 'Unauthorized' };

      global.Fliplet.API.request.mockRejectedValue(authError);

      await expect(apiClient.request('GET', 'v1/apps')).rejects.toEqual(authError);
      expect(global.Fliplet.API.request).toHaveBeenCalledTimes(1);
    });

    test('should throw error after max retries exhausted', async () => {
      const networkError = { status: 0, message: 'Network error' };

      global.Fliplet.API.request.mockRejectedValue(networkError);

      await expect(apiClient.request('GET', 'v1/apps')).rejects.toEqual(networkError);
      expect(global.Fliplet.API.request).toHaveBeenCalledTimes(3);
    });

    test('should use exponential backoff for retries', async () => {
      // Test that delays increase exponentially by checking the delay calculations
      const delaySpy = jest.spyOn(apiClient, 'delay');

      const networkError = { status: 0, message: 'Network error' };

      global.Fliplet.API.request.mockRejectedValue(networkError);

      await expect(apiClient.request('GET', 'v1/apps')).rejects.toEqual(networkError);

      // Should have been called twice (after 1st and 2nd attempts, not after 3rd)
      expect(delaySpy).toHaveBeenCalledTimes(2);

      // First delay: 1000ms * 2^0 = 1000ms
      expect(delaySpy).toHaveBeenNthCalledWith(1, 1000);

      // Second delay: 1000ms * 2^1 = 2000ms (exponential backoff)
      expect(delaySpy).toHaveBeenNthCalledWith(2, 2000);

      delaySpy.mockRestore();
    });
  });

  describe('helper methods', () => {
    test('get() should make GET request', async () => {
      const mockResponse = { data: 'test' };

      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.get('v1/apps', { organizationId: 123 });

      expect(result).toEqual(mockResponse);
      expect(global.Fliplet.API.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          params: { organizationId: 123 }
        })
      );
    });

    test('post() should make POST request', async () => {
      const mockResponse = { id: 456 };
      const requestData = { name: 'New App' };

      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.post('v1/apps', requestData);

      expect(result).toEqual(mockResponse);
      expect(global.Fliplet.API.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          data: requestData
        })
      );
    });

    test('put() should make PUT request', async () => {
      const mockResponse = { success: true };
      const requestData = { name: 'Updated App' };

      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.put('v1/apps/123', requestData);

      expect(result).toEqual(mockResponse);
      expect(global.Fliplet.API.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          data: requestData
        })
      );
    });

    test('delete() should make DELETE request', async () => {
      const mockResponse = { success: true };

      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.delete('v1/apps/123');

      expect(result).toEqual(mockResponse);
      expect(global.Fliplet.API.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('delay()', () => {
    test('should delay execution for specified time', async () => {
      jest.useFakeTimers();

      const delayPromise = apiClient.delay(1000);
      let resolved = false;

      delayPromise.then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);

      jest.advanceTimersByTime(1000);
      await delayPromise;

      expect(resolved).toBe(true);

      jest.useRealTimers();
    });
  });
});

