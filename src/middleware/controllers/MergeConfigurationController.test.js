// src/middleware/controllers/MergeConfigurationController.test.js

const MergeConfigurationController = require('./MergeConfigurationController');

describe('MergeConfigurationController', () => {
  let controller;
  let mockAppsApiService;
  let mockPagesApiService;
  let mockDataSourcesApiService;
  let mockMediaApiService;
  let mockStateManager;
  let mockValidationController;
  let mockAppLockController;
  let mockEventEmitter;

  beforeEach(() => {
    mockAppsApiService = {};
    mockPagesApiService = {};
    mockDataSourcesApiService = {};
    mockMediaApiService = {};

    mockStateManager = {
      getState: jest.fn(),
      setState: jest.fn()
    };

    mockValidationController = {
      validateAppForMerge: jest.fn()
    };

    mockAppLockController = {
      unlockApps: jest.fn()
    };

    mockEventEmitter = {
      emit: jest.fn()
    };

    controller = new MergeConfigurationController({
      appsApiService: mockAppsApiService,
      pagesApiService: mockPagesApiService,
      dataSourcesApiService: mockDataSourcesApiService,
      mediaApiService: mockMediaApiService,
      stateManager: mockStateManager,
      validationController: mockValidationController,
      appLockController: mockAppLockController,
      eventEmitter: mockEventEmitter
    });
  });

  describe('constructor', () => {
    test('should throw error if appsApiService not provided', () => {
      expect(() => {
        new MergeConfigurationController({});
      }).toThrow('appsApiService is required');
    });

    test('should throw error if pagesApiService not provided', () => {
      expect(() => {
        new MergeConfigurationController({
          appsApiService: mockAppsApiService
        });
      }).toThrow('pagesApiService is required');
    });

    test('should initialize with all dependencies', () => {
      expect(controller.appsApiService).toBe(mockAppsApiService);
      expect(controller.stateManager).toBe(mockStateManager);
      expect(controller.validationController).toBe(mockValidationController);
    });

    test('should define workflow steps', () => {
      expect(controller.workflowSteps).toEqual([
        'destination-selection',
        'resource-configuration',
        'review'
      ]);
    });
  });

  describe('startConfiguration()', () => {
    beforeEach(() => {
      mockValidationController.validateAppForMerge.mockResolvedValue({
        isValid: true,
        errors: []
      });
    });

    test('should throw error if sourceAppId not provided', async () => {
      await expect(controller.startConfiguration()).rejects.toThrow('Valid source app ID is required');
    });

    test('should validate source app by default', async () => {
      await controller.startConfiguration(123);

      expect(mockValidationController.validateAppForMerge).toHaveBeenCalledWith(
        123,
        expect.objectContaining({ checkDuplicates: true })
      );
    });

    test('should skip validation when disabled', async () => {
      await controller.startConfiguration(123, { validateSource: false });

      expect(mockValidationController.validateAppForMerge).not.toHaveBeenCalled();
    });

    test('should initialize configuration state', async () => {
      await controller.startConfiguration(123);

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'mergeConfiguration',
        expect.objectContaining({
          sourceAppId: 123,
          currentStep: 'destination-selection',
          stepIndex: 0,
          isComplete: false
        })
      );
    });

    test('should emit configuration started event', async () => {
      await controller.startConfiguration(123);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'configuration:started',
        expect.objectContaining({ sourceAppId: 123 })
      );
    });

    test('should throw error if validation fails', async () => {
      mockValidationController.validateAppForMerge.mockResolvedValue({
        isValid: false,
        errors: [{ message: 'Validation error' }]
      });

      await expect(controller.startConfiguration(123)).rejects.toThrow('Source app validation failed');
    });

    test('should emit failed event on error', async () => {
      mockValidationController.validateAppForMerge.mockRejectedValue(new Error('API error'));

      await expect(controller.startConfiguration(123)).rejects.toThrow();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'configuration:failed',
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe('validateStep()', () => {
    test('should return invalid when no active configuration', async () => {
      mockStateManager.getState.mockReturnValue(null);

      const result = await controller.validateStep('destination-selection');

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('No active configuration');
    });

    test('should validate destination selection step', async () => {
      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456,
        destinationOrganizationId: 100
      });

      const result = await controller.validateStep('destination-selection');

      expect(result.isValid).toBe(true);
    });

    test('should validate resource configuration step', async () => {
      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        pageIds: [1, 2, 3]
      });

      const result = await controller.validateStep('resource-configuration');

      expect(result.isValid).toBe(true);
    });

    test('should return error for unknown step', async () => {
      mockStateManager.getState.mockReturnValue({ sourceAppId: 123 });

      const result = await controller.validateStep('unknown-step');

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('Unknown step');
    });
  });

  describe('validateDestinationSelection()', () => {
    test('should pass with valid destination', async () => {
      const config = {
        sourceAppId: 123,
        destinationAppId: 456,
        destinationOrganizationId: 100
      };

      const result = await controller.validateDestinationSelection(config);

      expect(result.isValid).toBe(true);
    });

    test('should fail without destination app', async () => {
      const config = {
        sourceAppId: 123,
        destinationOrganizationId: 100
      };

      const result = await controller.validateDestinationSelection(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Destination app'))).toBe(true);
    });

    test('should fail without destination organization', async () => {
      const config = {
        sourceAppId: 123,
        destinationAppId: 456
      };

      const result = await controller.validateDestinationSelection(config);

      expect(result.isValid).toBe(false);
    });

    test('should fail if source and destination are same', async () => {
      const config = {
        sourceAppId: 123,
        destinationAppId: 123,
        destinationOrganizationId: 100
      };

      const result = await controller.validateDestinationSelection(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must be different'))).toBe(true);
    });
  });

  describe('validateResourceConfiguration()', () => {
    test('should pass with pages selected', async () => {
      const config = { pageIds: [1, 2, 3] };

      const result = await controller.validateResourceConfiguration(config);

      expect(result.isValid).toBe(true);
    });

    test('should pass with data sources selected', async () => {
      const config = { dataSources: [1, 2] };

      const result = await controller.validateResourceConfiguration(config);

      expect(result.isValid).toBe(true);
    });

    test('should pass with "all" resources selected', async () => {
      const config = { pageIds: 'all' };

      const result = await controller.validateResourceConfiguration(config);

      expect(result.isValid).toBe(true);
    });

    test('should fail with no resources selected', async () => {
      const config = {};

      const result = await controller.validateResourceConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('At least one resource');
    });
  });

  describe('proceedToNextStep()', () => {
    beforeEach(() => {
      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456,
        destinationOrganizationId: 100,
        currentStep: 'destination-selection',
        stepIndex: 0
      });
    });

    test('should throw error if no active configuration', async () => {
      mockStateManager.getState.mockReturnValue(null);

      await expect(controller.proceedToNextStep()).rejects.toThrow('No active configuration');
    });

    test('should validate current step by default', async () => {
      await controller.proceedToNextStep();

      // Validation is called implicitly via validateStep
      expect(mockStateManager.setState).toHaveBeenCalled();
    });

    test('should skip validation when disabled', async () => {
      await controller.proceedToNextStep({ autoValidate: false });

      expect(mockStateManager.setState).toHaveBeenCalled();
    });

    test('should move to next step', async () => {
      await controller.proceedToNextStep();

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'mergeConfiguration.currentStep',
        'resource-configuration'
      );
    });

    test('should update step index', async () => {
      await controller.proceedToNextStep();

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'mergeConfiguration.stepIndex',
        1
      );
    });

    test('should emit step changed event', async () => {
      await controller.proceedToNextStep();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'configuration:step-changed',
        expect.objectContaining({
          previousStep: 'destination-selection',
          currentStep: 'resource-configuration'
        })
      );
    });

    test('should mark as complete when reaching last step', async () => {
      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456,
        destinationOrganizationId: 100,
        currentStep: 'review',
        stepIndex: 2,
        pageIds: [1, 2, 3]
      });

      const result = await controller.proceedToNextStep();

      expect(result.isComplete).toBe(true);
      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'mergeConfiguration.isComplete',
        true
      );
    });

    test('should emit completed event when finishing', async () => {
      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456,
        currentStep: 'review',
        stepIndex: 2,
        pageIds: [1, 2, 3],
        destinationOrganizationId: 100
      });

      await controller.proceedToNextStep();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'configuration:completed',
        expect.objectContaining({ sourceAppId: 123 })
      );
    });
  });

  describe('returnToPreviousStep()', () => {
    beforeEach(() => {
      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        currentStep: 'resource-configuration',
        stepIndex: 1
      });
    });

    test('should throw error if no active configuration', async () => {
      mockStateManager.getState.mockReturnValue(null);

      await expect(controller.returnToPreviousStep()).rejects.toThrow('No active configuration');
    });

    test('should throw error if at first step', async () => {
      mockStateManager.getState.mockReturnValue({
        currentStep: 'destination-selection',
        stepIndex: 0
      });

      await expect(controller.returnToPreviousStep()).rejects.toThrow('Already at first step');
    });

    test('should move to previous step', async () => {
      await controller.returnToPreviousStep();

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'mergeConfiguration.currentStep',
        'destination-selection'
      );
    });

    test('should emit step changed event', async () => {
      await controller.returnToPreviousStep();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'configuration:step-changed',
        expect.objectContaining({
          previousStep: 'resource-configuration',
          currentStep: 'destination-selection'
        })
      );
    });
  });

  describe('cancelConfiguration()', () => {
    beforeEach(() => {
      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456
      });

      mockAppLockController.unlockApps.mockResolvedValue({});
    });

    test('should throw error if no active configuration', async () => {
      mockStateManager.getState.mockReturnValue(null);

      await expect(controller.cancelConfiguration()).rejects.toThrow('No active configuration');
    });

    test('should unlock apps by default', async () => {
      await controller.cancelConfiguration();

      expect(mockAppLockController.unlockApps).toHaveBeenCalledWith(123, 456);
    });

    test('should skip unlock when disabled', async () => {
      await controller.cancelConfiguration({ autoUnlock: false });

      expect(mockAppLockController.unlockApps).not.toHaveBeenCalled();
    });

    test('should clear configuration state', async () => {
      await controller.cancelConfiguration();

      expect(mockStateManager.setState).toHaveBeenCalledWith('mergeConfiguration', null);
    });

    test('should emit cancelled event', async () => {
      await controller.cancelConfiguration();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'configuration:cancelled',
        expect.objectContaining({ sourceAppId: 123 })
      );
    });

    test('should emit cancel failed event on error', async () => {
      mockAppLockController.unlockApps.mockRejectedValue(new Error('Unlock failed'));

      await expect(controller.cancelConfiguration()).rejects.toThrow();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'configuration:cancel-failed',
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe('getConfiguration()', () => {
    test('should return null when no active configuration', () => {
      mockStateManager.getState.mockReturnValue(null);

      const result = controller.getConfiguration();

      expect(result).toBe(null);
    });

    test('should return configuration without summary by default', () => {
      const mockConfig = {
        sourceAppId: 123,
        destinationAppId: 456
      };

      mockStateManager.getState.mockReturnValue(mockConfig);

      const result = controller.getConfiguration();

      expect(result).toEqual(mockConfig);
      expect(result.summary).toBeUndefined();
    });

    test('should include summary when requested', () => {
      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        pageIds: [1, 2, 3],
        dataSources: 'all'
      });

      const result = controller.getConfiguration({ includeSummary: true });

      expect(result.summary).toBeDefined();
      expect(result.summary.hasPages).toBe(true);
      expect(result.summary.pageCount).toBe(3);
      expect(result.summary.dataSourceCount).toBe('all');
    });
  });

  describe('updateConfiguration()', () => {
    beforeEach(() => {
      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        currentStep: 'destination-selection'
      });
    });

    test('should throw error if no active configuration', () => {
      mockStateManager.getState.mockReturnValue(null);

      expect(() => {
        controller.updateConfiguration({ destinationAppId: 456 });
      }).toThrow('No active configuration');
    });

    test('should update configuration fields', () => {
      controller.updateConfiguration({ destinationAppId: 456 });

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'mergeConfiguration.destinationAppId',
        456
      );
    });

    test('should emit updated event', () => {
      controller.updateConfiguration({ destinationAppId: 456 });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'configuration:updated',
        expect.objectContaining({
          updates: expect.objectContaining({ destinationAppId: 456 })
        })
      );
    });
  });
});

