// src/middleware/api/DataSourcesApiService.test.js

const DataSourcesApiService = require('./DataSourcesApiService');

describe('DataSourcesApiService', () => {
  let dataSourcesApiService;
  let mockApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: jest.fn()
    };

    dataSourcesApiService = new DataSourcesApiService(mockApiClient);
  });

  describe('constructor', () => {
    test('should throw error if apiClient not provided', () => {
      expect(() => {
        new DataSourcesApiService();
      }).toThrow('ApiClient is required');
    });

    test('should initialize with apiClient', () => {
      expect(dataSourcesApiService.apiClient).toBe(mockApiClient);
    });
  });

  describe('fetchDataSources()', () => {
    test('should throw error if appId not provided', async () => {
      await expect(dataSourcesApiService.fetchDataSources()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(dataSourcesApiService.fetchDataSources('123')).rejects.toThrow('Valid app ID is required');
    });

    test('should fetch data sources with minimal options', async () => {
      const mockDataSources = [{ id: 1, name: 'Users' }];

      mockApiClient.get.mockResolvedValue({ dataSources: mockDataSources });

      const result = await dataSourcesApiService.fetchDataSources(123);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources',
        expect.objectContaining({ appId: 123 })
      );
      expect(result).toEqual(mockDataSources);
    });

    test('should include associations parameter', async () => {
      mockApiClient.get.mockResolvedValue({ dataSources: [] });

      await dataSourcesApiService.fetchDataSources(123, {
        include: ['associatedPages', 'associatedFiles']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources',
        expect.objectContaining({ include: 'associatedPages,associatedFiles' })
      );
    });

    test('should include includeInUse parameter', async () => {
      mockApiClient.get.mockResolvedValue({ dataSources: [] });

      await dataSourcesApiService.fetchDataSources(123, {
        includeInUse: true
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources',
        expect.objectContaining({ includeInUse: true })
      );
    });

    test('should include type filter', async () => {
      mockApiClient.get.mockResolvedValue({ dataSources: [] });

      await dataSourcesApiService.fetchDataSources(123, {
        filters: { type: null }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources',
        expect.objectContaining({ type: null })
      );
    });

    test('should include hasGlobalDependency filter', async () => {
      mockApiClient.get.mockResolvedValue({ dataSources: [] });

      await dataSourcesApiService.fetchDataSources(123, {
        filters: { hasGlobalDependency: false }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources',
        expect.objectContaining({ hasGlobalDependency: false })
      );
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({ dataSources: [] });

      await dataSourcesApiService.fetchDataSources(123, {
        fields: ['id', 'name', 'entriesCount']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources',
        expect.objectContaining({ fields: 'id,name,entriesCount' })
      );
    });

    test('should include sort parameters', async () => {
      mockApiClient.get.mockResolvedValue({ dataSources: [] });

      await dataSourcesApiService.fetchDataSources(123, {
        sort: { field: 'updatedAt', order: 'desc' }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources',
        expect.objectContaining({
          sortBy: 'updatedAt',
          sortOrder: 'desc'
        })
      );
    });

    test('should include pagination parameters', async () => {
      mockApiClient.get.mockResolvedValue({ dataSources: [] });

      await dataSourcesApiService.fetchDataSources(123, {
        pagination: { page: 2, limit: 25 }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources',
        expect.objectContaining({
          page: 2,
          limit: 25
        })
      );
    });

    test('should return dataSources array from response', async () => {
      const mockDataSources = [{ id: 1 }, { id: 2 }];

      mockApiClient.get.mockResolvedValue({ dataSources: mockDataSources });

      const result = await dataSourcesApiService.fetchDataSources(123);

      expect(result).toEqual(mockDataSources);
    });

    test('should return response directly if no dataSources property', async () => {
      const mockDataSources = [{ id: 1 }, { id: 2 }];

      mockApiClient.get.mockResolvedValue(mockDataSources);

      const result = await dataSourcesApiService.fetchDataSources(123);

      expect(result).toEqual(mockDataSources);
    });
  });

  describe('fetchDataSource()', () => {
    test('should throw error if dataSourceId not provided', async () => {
      await expect(dataSourcesApiService.fetchDataSource()).rejects.toThrow('Valid data source ID is required');
    });

    test('should throw error if dataSourceId is not a number', async () => {
      await expect(dataSourcesApiService.fetchDataSource('123')).rejects.toThrow('Valid data source ID is required');
    });

    test('should fetch single data source by ID', async () => {
      const mockDataSource = { id: 789, name: 'Users' };

      mockApiClient.get.mockResolvedValue({ dataSource: mockDataSource });

      const result = await dataSourcesApiService.fetchDataSource(789);

      expect(mockApiClient.get).toHaveBeenCalledWith('v1/data-sources/789', expect.any(Object));
      expect(result).toEqual(mockDataSource);
    });

    test('should include appId parameter', async () => {
      mockApiClient.get.mockResolvedValue({ dataSource: {} });

      await dataSourcesApiService.fetchDataSource(789, {
        appId: 123
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources/789',
        expect.objectContaining({ appId: 123 })
      );
    });

    test('should include associations parameter', async () => {
      mockApiClient.get.mockResolvedValue({ dataSource: {} });

      await dataSourcesApiService.fetchDataSource(789, {
        include: ['associatedPages']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources/789',
        expect.objectContaining({ include: 'associatedPages' })
      );
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({ dataSource: {} });

      await dataSourcesApiService.fetchDataSource(789, {
        fields: ['id', 'name']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/data-sources/789',
        expect.objectContaining({ fields: 'id,name' })
      );
    });

    test('should return dataSource object from response', async () => {
      const mockDataSource = { id: 789, name: 'Users' };

      mockApiClient.get.mockResolvedValue({ dataSource: mockDataSource });

      const result = await dataSourcesApiService.fetchDataSource(789);

      expect(result).toEqual(mockDataSource);
    });
  });
});

