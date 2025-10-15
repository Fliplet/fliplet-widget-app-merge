// src/middleware/api/AppsApiService.test.js

const AppsApiService = require('./AppsApiService');

describe('AppsApiService', () => {
  let appsApiService;
  let mockApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: jest.fn(),
      post: jest.fn()
    };

    appsApiService = new AppsApiService(mockApiClient);
  });

  describe('constructor', () => {
    test('should throw error if apiClient not provided', () => {
      expect(() => {
        new AppsApiService();
      }).toThrow('ApiClient is required');
    });

    test('should initialize with apiClient', () => {
      expect(appsApiService.apiClient).toBe(mockApiClient);
    });
  });

  describe('fetchApps()', () => {
    test('should fetch apps with minimal options', async () => {
      const mockResponse = { apps: [{ id: 1, name: 'App 1' }] };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await appsApiService.fetchApps();

      expect(mockApiClient.get).toHaveBeenCalledWith('v1/apps', expect.any(Object));
      expect(result).toEqual(mockResponse.apps);
    });

    test('should include organizationId in params', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await appsApiService.fetchApps({ organizationId: 123 });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps',
        expect.objectContaining({ organizationId: 123 })
      );
    });

    test('should include userId in params', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await appsApiService.fetchApps({ userId: 456 });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps',
        expect.objectContaining({ userId: 456 })
      );
    });

    test('should include publisher filter', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await appsApiService.fetchApps({
        filters: { publisher: true }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps',
        expect.objectContaining({ publisher: true })
      );
    });

    test('should include mergeable filter', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await appsApiService.fetchApps({
        filters: { mergeable: true }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps',
        expect.objectContaining({ mergeable: true })
      );
    });

    test('should include locked filter', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await appsApiService.fetchApps({
        filters: { locked: false }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps',
        expect.objectContaining({ locked: false })
      );
    });

    test('should include fields as comma-separated string', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await appsApiService.fetchApps({
        fields: ['id', 'name', 'organizationId']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps',
        expect.objectContaining({ fields: 'id,name,organizationId' })
      );
    });

    test('should include sort parameters', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await appsApiService.fetchApps({
        sort: { field: 'updatedAt', order: 'desc' }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps',
        expect.objectContaining({
          sortBy: 'updatedAt',
          sortOrder: 'desc'
        })
      );
    });

    test('should include pagination parameters', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await appsApiService.fetchApps({
        pagination: { page: 2, limit: 25 }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps',
        expect.objectContaining({
          page: 2,
          limit: 25
        })
      );
    });

    test('should handle all options combined', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await appsApiService.fetchApps({
        organizationId: 123,
        filters: { publisher: true, mergeable: true },
        fields: ['id', 'name'],
        sort: { field: 'name', order: 'asc' },
        pagination: { page: 1, limit: 50 }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps',
        expect.objectContaining({
          organizationId: 123,
          publisher: true,
          mergeable: true,
          fields: 'id,name',
          sortBy: 'name',
          sortOrder: 'asc',
          page: 1,
          limit: 50
        })
      );
    });

    test('should return apps array from response', async () => {
      const mockApps = [{ id: 1 }, { id: 2 }];

      mockApiClient.get.mockResolvedValue({ apps: mockApps });

      const result = await appsApiService.fetchApps();

      expect(result).toEqual(mockApps);
    });

    test('should return response directly if no apps property', async () => {
      const mockResponse = [{ id: 1 }, { id: 2 }];

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await appsApiService.fetchApps();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('fetchApp()', () => {
    test('should fetch single app by ID', async () => {
      const mockApp = { id: 123, name: 'Test App' };

      mockApiClient.get.mockResolvedValue({ app: mockApp });

      const result = await appsApiService.fetchApp(123);

      expect(mockApiClient.get).toHaveBeenCalledWith('v1/apps/123', expect.any(Object));
      expect(result).toEqual(mockApp);
    });

    test('should throw error if appId not provided', async () => {
      await expect(appsApiService.fetchApp()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(appsApiService.fetchApp('123')).rejects.toThrow('Valid app ID is required');
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({ app: {} });

      await appsApiService.fetchApp(123, {
        fields: ['id', 'name', 'settings']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps/123',
        expect.objectContaining({ fields: 'id,name,settings' })
      );
    });

    test('should return app object from response', async () => {
      const mockApp = { id: 123, name: 'Test' };

      mockApiClient.get.mockResolvedValue({ app: mockApp });

      const result = await appsApiService.fetchApp(123);

      expect(result).toEqual(mockApp);
    });

    test('should return response directly if no app property', async () => {
      const mockApp = { id: 123, name: 'Test' };

      mockApiClient.get.mockResolvedValue(mockApp);

      const result = await appsApiService.fetchApp(123);

      expect(result).toEqual(mockApp);
    });
  });

  describe('checkDuplicates()', () => {
    test('should check for duplicates with default items', async () => {
      const mockDuplicates = { pages: [], dataSources: [] };

      mockApiClient.post.mockResolvedValue({ duplicates: mockDuplicates });

      const result = await appsApiService.checkDuplicates(123);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/duplicates',
        { items: ['pages', 'dataSources'] }
      );
      expect(result).toEqual(mockDuplicates);
    });

    test('should throw error if appId not provided', async () => {
      await expect(appsApiService.checkDuplicates()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(appsApiService.checkDuplicates('123')).rejects.toThrow('Valid app ID is required');
    });

    test('should allow custom items to check', async () => {
      mockApiClient.post.mockResolvedValue({ duplicates: {} });

      await appsApiService.checkDuplicates(123, {
        items: ['pages']
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/duplicates',
        { items: ['pages'] }
      );
    });

    test('should return duplicates from response', async () => {
      const mockDuplicates = {
        pages: [{ title: 'Home', count: 2, ids: [1, 2] }],
        dataSources: []
      };

      mockApiClient.post.mockResolvedValue({ duplicates: mockDuplicates });

      const result = await appsApiService.checkDuplicates(123);

      expect(result).toEqual(mockDuplicates);
    });
  });

  describe('lockApp()', () => {
    test('should lock app with default duration', async () => {
      const mockLockResult = { lockedUntil: '2024-12-31T23:59:59.000Z' };

      mockApiClient.post.mockResolvedValue(mockLockResult);

      const result = await appsApiService.lockApp(123);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/lock',
        { duration: 600 }
      );
      expect(result).toEqual(mockLockResult);
    });

    test('should throw error if appId not provided', async () => {
      await expect(appsApiService.lockApp()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(appsApiService.lockApp('123')).rejects.toThrow('Valid app ID is required');
    });

    test('should allow custom duration', async () => {
      mockApiClient.post.mockResolvedValue({});

      await appsApiService.lockApp(123, { duration: 300 });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/lock',
        { duration: 300 }
      );
    });
  });

  describe('unlockApp()', () => {
    test('should unlock app', async () => {
      const mockUnlockResult = { success: true };

      mockApiClient.post.mockResolvedValue(mockUnlockResult);

      const result = await appsApiService.unlockApp(123);

      expect(mockApiClient.post).toHaveBeenCalledWith('v1/apps/123/unlock');
      expect(result).toEqual(mockUnlockResult);
    });

    test('should throw error if appId not provided', async () => {
      await expect(appsApiService.unlockApp()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(appsApiService.unlockApp('123')).rejects.toThrow('Valid app ID is required');
    });
  });

  describe('extendLock()', () => {
    test('should extend lock with default duration', async () => {
      const mockExtendResult = { lockedUntil: '2024-12-31T23:59:59.000Z' };

      mockApiClient.post.mockResolvedValue(mockExtendResult);

      const result = await appsApiService.extendLock(123);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/lock/extend',
        { duration: 300 }
      );
      expect(result).toEqual(mockExtendResult);
    });

    test('should throw error if appId not provided', async () => {
      await expect(appsApiService.extendLock()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(appsApiService.extendLock('123')).rejects.toThrow('Valid app ID is required');
    });

    test('should allow custom duration', async () => {
      mockApiClient.post.mockResolvedValue({});

      await appsApiService.extendLock(123, { duration: 600 });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/apps/123/lock/extend',
        { duration: 600 }
      );
    });
  });
});

