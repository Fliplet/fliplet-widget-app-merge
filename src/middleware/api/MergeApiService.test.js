// src/middleware/api/MergeApiService.test.js

const MergeApiService = require('./MergeApiService');

describe('MergeApiService', () => {
  let mergeApiService;
  let mockApiClient;

  beforeEach(() => {
    mockApiClient = {
      post: jest.fn()
    };

    mergeApiService = new MergeApiService(mockApiClient);
  });

  describe('constructor', () => {
    test('should throw error if apiClient not provided', () => {
      expect(() => {
        new MergeApiService();
      }).toThrow('ApiClient is required');
    });

    test('should initialize with apiClient', () => {
      expect(mergeApiService.apiClient).toBe(mockApiClient);
    });
  });

  describe('lockApps()', () => {
    test('should throw error if sourceAppId not provided', async () => {
      await expect(mergeApiService.lockApps()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if sourceAppId is not a number', async () => {
      await expect(mergeApiService.lockApps('123')).rejects.toThrow('Valid source app ID is required');
    });

    test('should lock apps with default options', async () => {
      const mockResult = { lockedUntil: '2024-12-31T23:59:59.000Z' };

      mockApiClient.post.mockResolvedValue(mockResult);

      const result = await mergeApiService.lockApps(123);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge/lock',
        expect.objectContaining({ lockDuration: 600 })
      );
      expect(result).toEqual(mockResult);
    });

    test('should include targetApp in request', async () => {
      mockApiClient.post.mockResolvedValue({});

      await mergeApiService.lockApps(123, {
        targetApp: { id: 456, region: 'eu' }
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge/lock',
        expect.objectContaining({
          targetApp: { id: 456, region: 'eu' }
        })
      );
    });

    test('should allow custom lockDuration', async () => {
      mockApiClient.post.mockResolvedValue({});

      await mergeApiService.lockApps(123, { lockDuration: 300 });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge/lock',
        expect.objectContaining({ lockDuration: 300 })
      );
    });
  });

  describe('unlockApps()', () => {
    test('should throw error if sourceAppId not provided', async () => {
      await expect(mergeApiService.unlockApps()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if sourceAppId is not a number', async () => {
      await expect(mergeApiService.unlockApps('123')).rejects.toThrow('Valid source app ID is required');
    });

    test('should unlock apps', async () => {
      const mockResult = { success: true };

      mockApiClient.post.mockResolvedValue(mockResult);

      const result = await mergeApiService.unlockApps(123);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge/unlock',
        expect.any(Object)
      );
      expect(result).toEqual(mockResult);
    });

    test('should include targetApp in request', async () => {
      mockApiClient.post.mockResolvedValue({});

      await mergeApiService.unlockApps(123, {
        targetApp: { id: 456 }
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge/unlock',
        expect.objectContaining({
          targetApp: { id: 456 }
        })
      );
    });
  });

  describe('extendLock()', () => {
    test('should throw error if sourceAppId not provided', async () => {
      await expect(mergeApiService.extendLock()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if sourceAppId is not a number', async () => {
      await expect(mergeApiService.extendLock('123')).rejects.toThrow('Valid source app ID is required');
    });

    test('should extend lock with default duration', async () => {
      const mockResult = { lockedUntil: '2024-12-31T23:59:59.000Z' };

      mockApiClient.post.mockResolvedValue(mockResult);

      const result = await mergeApiService.extendLock(123);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge/lock/extend',
        expect.objectContaining({ extendDuration: 300 })
      );
      expect(result).toEqual(mockResult);
    });

    test('should include targetApp in request', async () => {
      mockApiClient.post.mockResolvedValue({});

      await mergeApiService.extendLock(123, {
        targetApp: { id: 456 },
        extendDuration: 600
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge/lock/extend',
        expect.objectContaining({
          targetApp: { id: 456 },
          extendDuration: 600
        })
      );
    });
  });

  describe('previewMerge()', () => {
    const validMergeConfig = {
      destinationAppId: 456,
      destinationOrganizationId: 100,
      pageIds: [1, 2, 3],
      dataSources: [],
      fileIds: [],
      folderIds: []
    };

    test('should throw error if sourceAppId not provided', async () => {
      await expect(mergeApiService.previewMerge()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if sourceAppId is not a number', async () => {
      await expect(mergeApiService.previewMerge('123', validMergeConfig)).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if mergeConfig not provided', async () => {
      await expect(mergeApiService.previewMerge(123)).rejects.toThrow('Valid merge configuration');
    });

    test('should throw error if destinationAppId missing', async () => {
      await expect(mergeApiService.previewMerge(123, {})).rejects.toThrow('Valid merge configuration');
    });

    test('should preview merge with valid config', async () => {
      const mockPreview = { copied: [], overwritten: [] };

      mockApiClient.post.mockResolvedValue(mockPreview);

      const result = await mergeApiService.previewMerge(123, validMergeConfig);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge/preview',
        validMergeConfig
      );
      expect(result).toEqual(mockPreview);
    });
  });

  describe('initiateMerge()', () => {
    const validMergeConfig = {
      destinationAppId: 456,
      destinationOrganizationId: 100,
      pageIds: [1, 2, 3],
      dataSources: [],
      fileIds: [],
      folderIds: []
    };

    test('should throw error if sourceAppId not provided', async () => {
      await expect(mergeApiService.initiateMerge()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if sourceAppId is not a number', async () => {
      await expect(mergeApiService.initiateMerge('123', validMergeConfig)).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if mergeConfig not provided', async () => {
      await expect(mergeApiService.initiateMerge(123)).rejects.toThrow('Valid merge configuration');
    });

    test('should throw error if destinationAppId missing', async () => {
      await expect(mergeApiService.initiateMerge(123, {})).rejects.toThrow('Valid merge configuration');
    });

    test('should initiate merge with valid config', async () => {
      const mockResult = { mergeId: 5000, status: 'in_progress' };

      mockApiClient.post.mockResolvedValue(mockResult);

      const result = await mergeApiService.initiateMerge(123, validMergeConfig);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge',
        validMergeConfig
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getMergeStatus()', () => {
    test('should throw error if sourceAppId not provided', async () => {
      await expect(mergeApiService.getMergeStatus()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if sourceAppId is not a number', async () => {
      await expect(mergeApiService.getMergeStatus('123')).rejects.toThrow('Valid source app ID is required');
    });

    test('should get merge status without mergeId', async () => {
      const mockStatus = { status: 'completed', progress: 100 };

      mockApiClient.post.mockResolvedValue(mockStatus);

      const result = await mergeApiService.getMergeStatus(123);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge/status',
        {}
      );
      expect(result).toEqual(mockStatus);
    });

    test('should get merge status with mergeId', async () => {
      const mockStatus = { status: 'in_progress', progress: 50 };

      mockApiClient.post.mockResolvedValue(mockStatus);

      const result = await mergeApiService.getMergeStatus(123, { mergeId: 5000 });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/merge/status',
        { mergeId: 5000 }
      );
      expect(result).toEqual(mockStatus);
    });
  });

  describe('fetchMergeLogs()', () => {
    test('should throw error if appId not provided', async () => {
      await expect(mergeApiService.fetchMergeLogs()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(mergeApiService.fetchMergeLogs('123')).rejects.toThrow('Valid app ID is required');
    });

    test('should fetch logs with minimal options', async () => {
      const mockLogs = [{ message: 'Log 1' }, { message: 'Log 2' }];

      mockApiClient.post.mockResolvedValue({ logs: mockLogs });

      const result = await mergeApiService.fetchMergeLogs(123);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/logs',
        expect.objectContaining({
          page: 1,
          limit: 50
        })
      );
      expect(result).toEqual(mockLogs);
    });

    test('should include mergeId in request', async () => {
      mockApiClient.post.mockResolvedValue({ logs: [] });

      await mergeApiService.fetchMergeLogs(123, { mergeId: 5000 });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/logs',
        expect.objectContaining({ mergeId: 5000 })
      );
    });

    test('should include types filter', async () => {
      mockApiClient.post.mockResolvedValue({ logs: [] });

      await mergeApiService.fetchMergeLogs(123, {
        types: ['info', 'error']
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/logs',
        expect.objectContaining({
          types: ['info', 'error']
        })
      );
    });

    test('should include pagination parameters', async () => {
      mockApiClient.post.mockResolvedValue({ logs: [] });

      await mergeApiService.fetchMergeLogs(123, {
        pagination: { page: 2, limit: 25 }
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/logs',
        expect.objectContaining({
          page: 2,
          limit: 25
        })
      );
    });

    test('should return logs array from response', async () => {
      const mockLogs = [{ message: 'Log 1' }];

      mockApiClient.post.mockResolvedValue({ logs: mockLogs });

      const result = await mergeApiService.fetchMergeLogs(123);

      expect(result).toEqual(mockLogs);
    });

    test('should return response directly if no logs property', async () => {
      const mockLogs = [{ message: 'Log 1' }];

      mockApiClient.post.mockResolvedValue(mockLogs);

      const result = await mergeApiService.fetchMergeLogs(123);

      expect(result).toEqual(mockLogs);
    });
  });
});

