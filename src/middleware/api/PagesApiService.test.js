// src/middleware/api/PagesApiService.test.js

const PagesApiService = require('./PagesApiService');

describe('PagesApiService', () => {
  let pagesApiService;
  let mockApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: jest.fn()
    };

    pagesApiService = new PagesApiService(mockApiClient);
  });

  describe('constructor', () => {
    test('should throw error if apiClient not provided', () => {
      expect(() => {
        new PagesApiService();
      }).toThrow('ApiClient is required');
    });

    test('should initialize with apiClient', () => {
      expect(pagesApiService.apiClient).toBe(mockApiClient);
    });
  });

  describe('fetchPages()', () => {
    test('should throw error if appId not provided', async () => {
      await expect(pagesApiService.fetchPages()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(pagesApiService.fetchPages('123')).rejects.toThrow('Valid app ID is required');
    });

    test('should fetch pages with minimal options', async () => {
      const mockPages = [{ id: 1, title: 'Page 1' }];

      mockApiClient.get.mockResolvedValue({ pages: mockPages });

      const result = await pagesApiService.fetchPages(123);

      expect(mockApiClient.get).toHaveBeenCalledWith('v1/apps/123/pages', expect.any(Object));
      expect(result).toEqual(mockPages);
    });

    test('should include associations in params', async () => {
      mockApiClient.get.mockResolvedValue({ pages: [] });

      await pagesApiService.fetchPages(123, {
        include: ['associatedDS', 'associatedFiles']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps/123/pages',
        expect.objectContaining({ include: 'associatedDS,associatedFiles' })
      );
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({ pages: [] });

      await pagesApiService.fetchPages(123, {
        fields: ['id', 'title', 'order']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps/123/pages',
        expect.objectContaining({ fields: 'id,title,order' })
      );
    });

    test('should include custom filters', async () => {
      mockApiClient.get.mockResolvedValue({ pages: [] });

      await pagesApiService.fetchPages(123, {
        filters: { template: 'list', published: true }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps/123/pages',
        expect.objectContaining({ template: 'list', published: true })
      );
    });

    test('should include sort parameters', async () => {
      mockApiClient.get.mockResolvedValue({ pages: [] });

      await pagesApiService.fetchPages(123, {
        sort: { field: 'updatedAt', order: 'desc' }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps/123/pages',
        expect.objectContaining({
          sortBy: 'updatedAt',
          sortOrder: 'desc'
        })
      );
    });

    test('should include pagination parameters', async () => {
      mockApiClient.get.mockResolvedValue({ pages: [] });

      await pagesApiService.fetchPages(123, {
        pagination: { page: 2, limit: 25 }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps/123/pages',
        expect.objectContaining({
          page: 2,
          limit: 25
        })
      );
    });

    test('should return pages array from response', async () => {
      const mockPages = [{ id: 1 }, { id: 2 }];

      mockApiClient.get.mockResolvedValue({ pages: mockPages });

      const result = await pagesApiService.fetchPages(123);

      expect(result).toEqual(mockPages);
    });

    test('should return response directly if no pages property', async () => {
      const mockPages = [{ id: 1 }, { id: 2 }];

      mockApiClient.get.mockResolvedValue(mockPages);

      const result = await pagesApiService.fetchPages(123);

      expect(result).toEqual(mockPages);
    });
  });

  describe('fetchPage()', () => {
    test('should throw error if appId not provided', async () => {
      await expect(pagesApiService.fetchPage()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if pageId not provided', async () => {
      await expect(pagesApiService.fetchPage(123)).rejects.toThrow('Valid page ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(pagesApiService.fetchPage('123', 456)).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if pageId is not a number', async () => {
      await expect(pagesApiService.fetchPage(123, '456')).rejects.toThrow('Valid page ID is required');
    });

    test('should fetch single page by ID', async () => {
      const mockPage = { id: 456, title: 'Test Page' };

      mockApiClient.get.mockResolvedValue({ page: mockPage });

      const result = await pagesApiService.fetchPage(123, 456);

      expect(mockApiClient.get).toHaveBeenCalledWith('v1/apps/123/pages/456', expect.any(Object));
      expect(result).toEqual(mockPage);
    });

    test('should include associations parameter', async () => {
      mockApiClient.get.mockResolvedValue({ page: {} });

      await pagesApiService.fetchPage(123, 456, {
        include: ['associatedDS']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps/123/pages/456',
        expect.objectContaining({ include: 'associatedDS' })
      );
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({ page: {} });

      await pagesApiService.fetchPage(123, 456, {
        fields: ['id', 'title']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps/123/pages/456',
        expect.objectContaining({ fields: 'id,title' })
      );
    });

    test('should return page object from response', async () => {
      const mockPage = { id: 456, title: 'Test' };

      mockApiClient.get.mockResolvedValue({ page: mockPage });

      const result = await pagesApiService.fetchPage(123, 456);

      expect(result).toEqual(mockPage);
    });
  });

  describe('fetchPagePreview()', () => {
    test('should throw error if appId not provided', async () => {
      await expect(pagesApiService.fetchPagePreview()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if pageId not provided', async () => {
      await expect(pagesApiService.fetchPagePreview(123)).rejects.toThrow('Valid page ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(pagesApiService.fetchPagePreview('123', 456)).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if pageId is not a number', async () => {
      await expect(pagesApiService.fetchPagePreview(123, '456')).rejects.toThrow('Valid page ID is required');
    });

    test('should fetch page preview with default format', async () => {
      const mockPreview = { html: '<div>Preview</div>' };

      mockApiClient.get.mockResolvedValue(mockPreview);

      const result = await pagesApiService.fetchPagePreview(123, 456);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps/123/pages/456/preview',
        expect.objectContaining({ format: 'html' })
      );
      expect(result).toEqual(mockPreview);
    });

    test('should allow custom format', async () => {
      mockApiClient.get.mockResolvedValue({});

      await pagesApiService.fetchPagePreview(123, 456, { format: 'json' });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/apps/123/pages/456/preview',
        expect.objectContaining({ format: 'json' })
      );
    });
  });
});

