// src/middleware/controllers/ValidationController.test.js

const ValidationController = require('./ValidationController');

describe('ValidationController', () => {
  let validationController;
  let mockAppsApiService;
  let mockValidationEngine;

  beforeEach(() => {
    mockAppsApiService = {
      checkDuplicates: jest.fn(),
      fetchApp: jest.fn()
    };

    mockValidationEngine = {
      validateConfiguration: jest.fn()
    };

    validationController = new ValidationController(mockAppsApiService, mockValidationEngine);
  });

  describe('constructor', () => {
    test('should throw error if appsApiService not provided', () => {
      expect(() => {
        new ValidationController();
      }).toThrow('AppsApiService is required');
    });

    test('should throw error if validationEngine not provided', () => {
      expect(() => {
        new ValidationController(mockAppsApiService);
      }).toThrow('ValidationEngine is required');
    });

    test('should initialize with dependencies', () => {
      expect(validationController.appsApiService).toBe(mockAppsApiService);
      expect(validationController.validationEngine).toBe(mockValidationEngine);
    });
  });

  describe('validateAppForMerge()', () => {
    beforeEach(() => {
      mockAppsApiService.checkDuplicates.mockResolvedValue({});
      mockAppsApiService.fetchApp.mockResolvedValue({ userRole: 'publisher' });
    });

    test('should validate app with all checks enabled', async () => {
      const result = await validationController.validateAppForMerge(123);

      expect(mockAppsApiService.checkDuplicates).toHaveBeenCalled();
      expect(mockAppsApiService.fetchApp).toHaveBeenCalled();
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should skip duplicate check when disabled', async () => {
      await validationController.validateAppForMerge(123, { checkDuplicates: false });

      expect(mockAppsApiService.checkDuplicates).not.toHaveBeenCalled();
    });

    test('should skip permission check when disabled', async () => {
      mockAppsApiService.fetchApp.mockClear();

      await validationController.validateAppForMerge(123, {
        checkPermissions: false,
        checkLock: false
      });

      expect(mockAppsApiService.fetchApp).not.toHaveBeenCalled();
    });

    test('should aggregate errors from multiple checks', async () => {
      mockAppsApiService.checkDuplicates.mockResolvedValue({
        pages: [{ name: 'Home', count: 2 }]
      });

      mockAppsApiService.fetchApp.mockResolvedValue({ userRole: 'viewer' });

      const result = await validationController.validateAppForMerge(123);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('checkDuplicates()', () => {
    test('should check for duplicates with default items', async () => {
      mockAppsApiService.checkDuplicates.mockResolvedValue({
        pages: [],
        dataSources: []
      });

      const result = await validationController.checkDuplicates(123);

      expect(mockAppsApiService.checkDuplicates).toHaveBeenCalledWith(
        123,
        expect.objectContaining({ items: ['pages', 'dataSources'] })
      );
      expect(result.isValid).toBe(true);
    });

    test('should detect page duplicates', async () => {
      mockAppsApiService.checkDuplicates.mockResolvedValue({
        pages: [
          { title: 'Home', count: 2, ids: [1, 2] }
        ],
        dataSources: []
      });

      const result = await validationController.checkDuplicates(123);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].type).toBe('DUPLICATE_NAME');
      expect(result.errors[0].itemType).toBe('pages');
    });

    test('should detect data source duplicates', async () => {
      mockAppsApiService.checkDuplicates.mockResolvedValue({
        pages: [],
        dataSources: [
          { name: 'Users', count: 3, ids: [1, 2, 3] }
        ]
      });

      const result = await validationController.checkDuplicates(123);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].itemType).toBe('dataSources');
    });

    test('should handle API errors gracefully', async () => {
      mockAppsApiService.checkDuplicates.mockRejectedValue(new Error('API Error'));

      const result = await validationController.checkDuplicates(123);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('DUPLICATE_CHECK_FAILED');
    });

    test('should allow custom items to check', async () => {
      mockAppsApiService.checkDuplicates.mockResolvedValue({ pages: [] });

      await validationController.checkDuplicates(123, { items: ['pages'] });

      expect(mockAppsApiService.checkDuplicates).toHaveBeenCalledWith(
        123,
        expect.objectContaining({ items: ['pages'] })
      );
    });
  });

  describe('validateConfiguration()', () => {
    test('should validate configuration using ValidationEngine', async () => {
      mockValidationEngine.validateConfiguration.mockReturnValue([]);

      const mergeConfig = {
        sourceAppId: 123,
        destinationAppId: 456,
        pageIds: [1, 2, 3]
      };

      const result = await validationController.validateConfiguration(mergeConfig);

      expect(mockValidationEngine.validateConfiguration).toHaveBeenCalledWith(mergeConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should return errors from ValidationEngine', async () => {
      mockValidationEngine.validateConfiguration.mockReturnValue([
        { field: 'sourceAppId', message: 'Source app ID is required' }
      ]);

      const result = await validationController.validateConfiguration({});

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].type).toBe('CONFIGURATION_INVALID');
    });
  });

  describe('validatePermissions()', () => {
    test('should validate publisher role', async () => {
      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 123,
        userRole: 'publisher'
      });

      const result = await validationController.validatePermissions(123);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject non-publisher roles', async () => {
      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 123,
        userRole: 'viewer'
      });

      const result = await validationController.validatePermissions(123);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('INSUFFICIENT_PERMISSIONS');
      expect(result.errors[0].currentRole).toBe('viewer');
    });

    test('should reject apps without userRole', async () => {
      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 123
      });

      const result = await validationController.validatePermissions(123);

      expect(result.isValid).toBe(false);
    });

    test('should handle API errors', async () => {
      mockAppsApiService.fetchApp.mockRejectedValue(new Error('API Error'));

      const result = await validationController.validatePermissions(123);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('PERMISSION_CHECK_FAILED');
    });

    test('should allow custom required role', async () => {
      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 123,
        userRole: 'admin'
      });

      const result = await validationController.validatePermissions(123, {
        requiredRole: 'admin'
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe('checkPlanLimits()', () => {
    test('should pass when no limits defined', async () => {
      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 456,
        plan: 'enterprise'
      });

      const result = await validationController.checkPlanLimits(456, {
        pageIds: [1, 2, 3]
      });

      expect(result.isValid).toBe(true);
    });

    test('should check page limit', async () => {
      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 456,
        limits: { pages: 10 },
        currentUsage: { pages: 8 }
      });

      const result = await validationController.checkPlanLimits(456, {
        pageIds: [1, 2, 3]
      });

      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('PLAN_LIMIT_EXCEEDED');
      expect(result.errors[0].limit).toBe(10);
      expect(result.errors[0].current).toBe(8);
      expect(result.errors[0].additional).toBe(3);
    });

    test('should check data source limit', async () => {
      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 456,
        limits: { dataSources: 5 },
        currentUsage: { dataSources: 4 }
      });

      const result = await validationController.checkPlanLimits(456, {
        dataSources: [1, 2]
      });

      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('PLAN_LIMIT_EXCEEDED');
    });

    test('should pass when within limits', async () => {
      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 456,
        limits: { pages: 20 },
        currentUsage: { pages: 10 }
      });

      const result = await validationController.checkPlanLimits(456, {
        pageIds: [1, 2, 3]
      });

      expect(result.isValid).toBe(true);
    });

    test('should handle API errors', async () => {
      mockAppsApiService.fetchApp.mockRejectedValue(new Error('API Error'));

      const result = await validationController.checkPlanLimits(456, {});

      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('PLAN_LIMIT_CHECK_FAILED');
    });
  });

  describe('checkLockStatus()', () => {
    test('should pass when app not locked', async () => {
      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 123,
        lockedUntil: null
      });

      const result = await validationController.checkLockStatus(123);

      expect(result.isValid).toBe(true);
      expect(result.isLocked).toBe(false);
    });

    test('should fail when app is locked', async () => {
      const futureDate = new Date(Date.now() + 600000).toISOString();

      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 123,
        lockedUntil: futureDate,
        lockedBy: 'user@example.com'
      });

      const result = await validationController.checkLockStatus(123);

      expect(result.isValid).toBe(false);
      expect(result.isLocked).toBe(true);
      expect(result.errors[0].type).toBe('APP_LOCKED');
    });

    test('should pass when lock expired', async () => {
      const pastDate = new Date(Date.now() - 600000).toISOString();

      mockAppsApiService.fetchApp.mockResolvedValue({
        id: 123,
        lockedUntil: pastDate
      });

      const result = await validationController.checkLockStatus(123);

      expect(result.isValid).toBe(true);
      expect(result.isLocked).toBe(false);
    });

    test('should handle API errors', async () => {
      mockAppsApiService.fetchApp.mockRejectedValue(new Error('API Error'));

      const result = await validationController.checkLockStatus(123);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe('LOCK_STATUS_CHECK_FAILED');
    });
  });
});

