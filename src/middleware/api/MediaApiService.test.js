// src/middleware/api/MediaApiService.test.js

const MediaApiService = require('./MediaApiService');

describe('MediaApiService', () => {
  let mediaApiService;
  let mockApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: jest.fn()
    };

    mediaApiService = new MediaApiService(mockApiClient);
  });

  describe('constructor', () => {
    test('should throw error if apiClient not provided', () => {
      expect(() => {
        new MediaApiService();
      }).toThrow('ApiClient is required');
    });

    test('should initialize with apiClient', () => {
      expect(mediaApiService.apiClient).toBe(mockApiClient);
    });
  });

  describe('fetchMedia()', () => {
    test('should throw error if appId not provided', async () => {
      await expect(mediaApiService.fetchMedia()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if appId is not a number', async () => {
      await expect(mediaApiService.fetchMedia('123')).rejects.toThrow('Valid app ID is required');
    });

    test('should fetch media with minimal options', async () => {
      const mockMedia = { files: [{ id: 1 }], folders: [{ id: 2 }] };

      mockApiClient.get.mockResolvedValue(mockMedia);

      const result = await mediaApiService.fetchMedia(123);

      expect(mockApiClient.get).toHaveBeenCalledWith('v1/media', expect.objectContaining({ appId: 123 }));
      expect(result).toEqual(mockMedia);
    });

    test('should include associations parameter', async () => {
      mockApiClient.get.mockResolvedValue({});

      await mediaApiService.fetchMedia(123, {
        include: ['associatedPages', 'associatedDS']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media',
        expect.objectContaining({ include: 'associatedPages,associatedDS' })
      );
    });

    test('should include type filter', async () => {
      mockApiClient.get.mockResolvedValue({});

      await mediaApiService.fetchMedia(123, {
        filters: { type: 'image/png' }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media',
        expect.objectContaining({ type: 'image/png' })
      );
    });

    test('should include hasAssociations filter', async () => {
      mockApiClient.get.mockResolvedValue({});

      await mediaApiService.fetchMedia(123, {
        filters: { hasAssociations: true }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media',
        expect.objectContaining({ hasAssociations: true })
      );
    });

    test('should include isUnused filter', async () => {
      mockApiClient.get.mockResolvedValue({});

      await mediaApiService.fetchMedia(123, {
        filters: { isUnused: false }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media',
        expect.objectContaining({ isUnused: false })
      );
    });

    test('should include isGlobalLibrary filter', async () => {
      mockApiClient.get.mockResolvedValue({});

      await mediaApiService.fetchMedia(123, {
        filters: { isGlobalLibrary: true }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media',
        expect.objectContaining({ isGlobalLibrary: true })
      );
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({});

      await mediaApiService.fetchMedia(123, {
        fields: ['id', 'name', 'type']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media',
        expect.objectContaining({ fields: 'id,name,type' })
      );
    });

    test('should include sort parameters', async () => {
      mockApiClient.get.mockResolvedValue({});

      await mediaApiService.fetchMedia(123, {
        sort: { field: 'updatedAt', order: 'desc' }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media',
        expect.objectContaining({ sortBy: 'updatedAt', sortOrder: 'desc' })
      );
    });

    test('should include pagination parameters', async () => {
      mockApiClient.get.mockResolvedValue({});

      await mediaApiService.fetchMedia(123, {
        pagination: { page: 2, limit: 25 }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media',
        expect.objectContaining({ page: 2, limit: 25 })
      );
    });
  });

  describe('fetchFile()', () => {
    test('should throw error if fileId not provided', async () => {
      await expect(mediaApiService.fetchFile()).rejects.toThrow('Valid file ID is required');
    });

    test('should throw error if fileId is not a number', async () => {
      await expect(mediaApiService.fetchFile('100')).rejects.toThrow('Valid file ID is required');
    });

    test('should fetch single file by ID', async () => {
      const mockFile = { id: 100, name: 'logo.png' };

      mockApiClient.get.mockResolvedValue({ file: mockFile });

      const result = await mediaApiService.fetchFile(100);

      expect(mockApiClient.get).toHaveBeenCalledWith('v1/media/files/100', expect.any(Object));
      expect(result).toEqual(mockFile);
    });

    test('should include appId parameter', async () => {
      mockApiClient.get.mockResolvedValue({ file: {} });

      await mediaApiService.fetchFile(100, { appId: 123 });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media/files/100',
        expect.objectContaining({ appId: 123 })
      );
    });

    test('should include associations parameter', async () => {
      mockApiClient.get.mockResolvedValue({ file: {} });

      await mediaApiService.fetchFile(100, {
        include: ['associatedPages']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media/files/100',
        expect.objectContaining({ include: 'associatedPages' })
      );
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({ file: {} });

      await mediaApiService.fetchFile(100, {
        fields: ['id', 'name']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media/files/100',
        expect.objectContaining({ fields: 'id,name' })
      );
    });

    test('should return file object from response', async () => {
      const mockFile = { id: 100, name: 'logo.png' };

      mockApiClient.get.mockResolvedValue({ file: mockFile });

      const result = await mediaApiService.fetchFile(100);

      expect(result).toEqual(mockFile);
    });
  });

  describe('fetchFolder()', () => {
    test('should throw error if folderId not provided', async () => {
      await expect(mediaApiService.fetchFolder()).rejects.toThrow('Valid folder ID is required');
    });

    test('should throw error if folderId is not a number', async () => {
      await expect(mediaApiService.fetchFolder('200')).rejects.toThrow('Valid folder ID is required');
    });

    test('should fetch single folder by ID', async () => {
      const mockFolder = { id: 200, name: 'images' };

      mockApiClient.get.mockResolvedValue({ folder: mockFolder });

      const result = await mediaApiService.fetchFolder(200);

      expect(mockApiClient.get).toHaveBeenCalledWith('v1/media/folders/200', expect.any(Object));
      expect(result).toEqual(mockFolder);
    });

    test('should include appId parameter', async () => {
      mockApiClient.get.mockResolvedValue({ folder: {} });

      await mediaApiService.fetchFolder(200, { appId: 123 });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media/folders/200',
        expect.objectContaining({ appId: 123 })
      );
    });

    test('should include associations parameter', async () => {
      mockApiClient.get.mockResolvedValue({ folder: {} });

      await mediaApiService.fetchFolder(200, {
        include: ['associatedPages']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media/folders/200',
        expect.objectContaining({ include: 'associatedPages' })
      );
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({ folder: {} });

      await mediaApiService.fetchFolder(200, {
        fields: ['id', 'name']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/media/folders/200',
        expect.objectContaining({ fields: 'id,name' })
      );
    });

    test('should return folder object from response', async () => {
      const mockFolder = { id: 200, name: 'images' };

      mockApiClient.get.mockResolvedValue({ folder: mockFolder });

      const result = await mediaApiService.fetchFolder(200);

      expect(result).toEqual(mockFolder);
    });
  });
});

