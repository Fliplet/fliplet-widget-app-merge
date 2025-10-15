// src/middleware/api/OrganizationsApiService.test.js

const OrganizationsApiService = require('./OrganizationsApiService');

describe('OrganizationsApiService', () => {
  let organizationsApiService;
  let mockApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: jest.fn()
    };

    organizationsApiService = new OrganizationsApiService(mockApiClient);
  });

  describe('constructor', () => {
    test('should throw error if apiClient not provided', () => {
      expect(() => {
        new OrganizationsApiService();
      }).toThrow('ApiClient is required');
    });

    test('should initialize with apiClient', () => {
      expect(organizationsApiService.apiClient).toBe(mockApiClient);
    });
  });

  describe('fetchOrganizations()', () => {
    test('should fetch organizations with minimal options', async () => {
      const mockOrgs = [{ id: 1, name: 'Org 1' }];

      mockApiClient.get.mockResolvedValue({ organizations: mockOrgs });

      const result = await organizationsApiService.fetchOrganizations();

      expect(mockApiClient.get).toHaveBeenCalledWith('v1/organizations', expect.any(Object));
      expect(result).toEqual(mockOrgs);
    });

    test('should include userId parameter', async () => {
      mockApiClient.get.mockResolvedValue({ organizations: [] });

      await organizationsApiService.fetchOrganizations({ userId: 123 });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/organizations',
        expect.objectContaining({ userId: 123 })
      );
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({ organizations: [] });

      await organizationsApiService.fetchOrganizations({
        fields: ['id', 'name', 'settings']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/organizations',
        expect.objectContaining({ fields: 'id,name,settings' })
      );
    });

    test('should include sort parameters', async () => {
      mockApiClient.get.mockResolvedValue({ organizations: [] });

      await organizationsApiService.fetchOrganizations({
        sort: { field: 'updatedAt', order: 'desc' }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/organizations',
        expect.objectContaining({
          sortBy: 'updatedAt',
          sortOrder: 'desc'
        })
      );
    });

    test('should return organizations array from response', async () => {
      const mockOrgs = [{ id: 1 }, { id: 2 }];

      mockApiClient.get.mockResolvedValue({ organizations: mockOrgs });

      const result = await organizationsApiService.fetchOrganizations();

      expect(result).toEqual(mockOrgs);
    });

    test('should return response directly if no organizations property', async () => {
      const mockOrgs = [{ id: 1 }, { id: 2 }];

      mockApiClient.get.mockResolvedValue(mockOrgs);

      const result = await organizationsApiService.fetchOrganizations();

      expect(result).toEqual(mockOrgs);
    });
  });

  describe('fetchOrganization()', () => {
    test('should fetch single organization by ID', async () => {
      const mockOrg = { id: 123, name: 'Test Org' };

      mockApiClient.get.mockResolvedValue({ organization: mockOrg });

      const result = await organizationsApiService.fetchOrganization(123);

      expect(mockApiClient.get).toHaveBeenCalledWith('v1/organizations/123', expect.any(Object));
      expect(result).toEqual(mockOrg);
    });

    test('should throw error if organizationId not provided', async () => {
      await expect(organizationsApiService.fetchOrganization()).rejects.toThrow('Valid organization ID is required');
    });

    test('should throw error if organizationId is not a number', async () => {
      await expect(organizationsApiService.fetchOrganization('123')).rejects.toThrow('Valid organization ID is required');
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({ organization: {} });

      await organizationsApiService.fetchOrganization(123, {
        fields: ['id', 'name']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/organizations/123',
        expect.objectContaining({ fields: 'id,name' })
      );
    });

    test('should return organization object from response', async () => {
      const mockOrg = { id: 123, name: 'Test' };

      mockApiClient.get.mockResolvedValue({ organization: mockOrg });

      const result = await organizationsApiService.fetchOrganization(123);

      expect(result).toEqual(mockOrg);
    });
  });

  describe('fetchUserApps()', () => {
    test('should fetch user apps in organization', async () => {
      const mockApps = [{ id: 1, name: 'App 1' }];

      mockApiClient.get.mockResolvedValue({ apps: mockApps });

      const result = await organizationsApiService.fetchUserApps(123, 456);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/organizations/123/users/456/apps',
        expect.any(Object)
      );
      expect(result).toEqual(mockApps);
    });

    test('should throw error if organizationId not provided', async () => {
      await expect(organizationsApiService.fetchUserApps()).rejects.toThrow('Valid organization ID is required');
    });

    test('should throw error if userId not provided', async () => {
      await expect(organizationsApiService.fetchUserApps(123)).rejects.toThrow('Valid user ID is required');
    });

    test('should throw error if organizationId is not a number', async () => {
      await expect(organizationsApiService.fetchUserApps('123', 456)).rejects.toThrow('Valid organization ID is required');
    });

    test('should throw error if userId is not a number', async () => {
      await expect(organizationsApiService.fetchUserApps(123, '456')).rejects.toThrow('Valid user ID is required');
    });

    test('should include publisher filter', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await organizationsApiService.fetchUserApps(123, 456, {
        filters: { publisher: true }
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/organizations/123/users/456/apps',
        expect.objectContaining({ publisher: true })
      );
    });

    test('should include fields parameter', async () => {
      mockApiClient.get.mockResolvedValue({ apps: [] });

      await organizationsApiService.fetchUserApps(123, 456, {
        fields: ['id', 'name']
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/organizations/123/users/456/apps',
        expect.objectContaining({ fields: 'id,name' })
      );
    });

    test('should return apps array from response', async () => {
      const mockApps = [{ id: 1 }, { id: 2 }];

      mockApiClient.get.mockResolvedValue({ apps: mockApps });

      const result = await organizationsApiService.fetchUserApps(123, 456);

      expect(result).toEqual(mockApps);
    });
  });
});

