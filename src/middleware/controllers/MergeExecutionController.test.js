// src/middleware/controllers/MergeExecutionController.test.js

const MergeExecutionController = require('./MergeExecutionController');

describe('MergeExecutionController', () => {
  let controller;
  let mockMergeApiService;
  let mockStateManager;
  let mockEventEmitter;

  beforeEach(() => {
    jest.useFakeTimers();

    mockMergeApiService = {
      initiateMerge: jest.fn(),
      getMergeStatus: jest.fn(),
      fetchMergeLogs: jest.fn()
    };

    mockStateManager = {
      getState: jest.fn(),
      setState: jest.fn()
    };

    mockEventEmitter = {
      emit: jest.fn()
    };

    controller = new MergeExecutionController(
      mockMergeApiService,
      mockStateManager,
      mockEventEmitter
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    controller.cleanup();
  });

  describe('constructor', () => {
    test('should throw error if mergeApiService not provided', () => {
      expect(() => {
        new MergeExecutionController();
      }).toThrow('MergeApiService is required');
    });

    test('should throw error if stateManager not provided', () => {
      expect(() => {
        new MergeExecutionController(mockMergeApiService);
      }).toThrow('StateManager is required');
    });

    test('should throw error if eventEmitter not provided', () => {
      expect(() => {
        new MergeExecutionController(mockMergeApiService, mockStateManager);
      }).toThrow('EventEmitter is required');
    });

    test('should initialize with dependencies', () => {
      expect(controller.mergeApiService).toBe(mockMergeApiService);
      expect(controller.stateManager).toBe(mockStateManager);
      expect(controller.eventEmitter).toBe(mockEventEmitter);
    });
  });

  describe('initiateMerge()', () => {
    const mockMergeConfig = {
      destinationAppId: 456,
      destinationOrganizationId: 100,
      pageIds: [1, 2, 3]
    };

    beforeEach(() => {
      mockMergeApiService.initiateMerge.mockResolvedValue({
        mergeId: 5000,
        status: 'in_progress',
        progress: 0
      });
    });

    test('should throw error if sourceAppId not provided', async () => {
      await expect(controller.initiateMerge()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if mergeConfig not provided', async () => {
      await expect(controller.initiateMerge(123)).rejects.toThrow('Merge configuration is required');
    });

    test('should initiate merge via API', async () => {
      await controller.initiateMerge(123, mockMergeConfig, { startMonitoring: false });

      expect(mockMergeApiService.initiateMerge).toHaveBeenCalledWith(123, mockMergeConfig);
    });

    test('should update state with merge information', async () => {
      await controller.initiateMerge(123, mockMergeConfig, { startMonitoring: false });

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'mergeStatus',
        expect.objectContaining({
          mergeId: 5000,
          sourceAppId: 123,
          destinationAppId: 456,
          status: 'in_progress'
        })
      );
    });

    test('should emit merge initiated event', async () => {
      await controller.initiateMerge(123, mockMergeConfig, { startMonitoring: false });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'merge:initiated',
        expect.objectContaining({
          mergeId: 5000,
          sourceAppId: 123
        })
      );
    });

    test('should start monitoring by default', async () => {
      await controller.initiateMerge(123, mockMergeConfig);

      expect(controller.monitoringTimers.has(123)).toBe(true);
    });

    test('should skip monitoring when disabled', async () => {
      await controller.initiateMerge(123, mockMergeConfig, { startMonitoring: false });

      expect(controller.monitoringTimers.has(123)).toBe(false);
    });

    test('should emit failed event on error', async () => {
      mockMergeApiService.initiateMerge.mockRejectedValue(new Error('API error'));

      await expect(controller.initiateMerge(123, mockMergeConfig)).rejects.toThrow('API error');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'merge:failed',
        expect.objectContaining({ error: 'API error' })
      );
    });
  });

  describe('monitorProgress()', () => {
    beforeEach(() => {
      mockMergeApiService.getMergeStatus.mockResolvedValue({
        status: 'in_progress',
        progress: 50,
        currentStage: 'copying-pages'
      });

      mockStateManager.getState.mockReturnValue({
        mergeId: 5000,
        sourceAppId: 123
      });
    });

    test('should start monitoring interval', () => {
      controller.monitorProgress(123, 5000);

      expect(controller.monitoringTimers.has(123)).toBe(true);
    });

    test('should poll merge status at interval', async () => {
      controller.monitorProgress(123, 5000, { pollInterval: 1000 });

      // Fast-forward time
      await jest.advanceTimersByTimeAsync(1000);

      expect(mockMergeApiService.getMergeStatus).toHaveBeenCalledWith(
        123,
        expect.objectContaining({ mergeId: 5000 })
      );
    });

    test('should update state with latest status', async () => {
      controller.monitorProgress(123, 5000);

      await jest.advanceTimersByTimeAsync(2000);

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'mergeStatus',
        expect.objectContaining({
          status: 'in_progress',
          progress: 50,
          currentStage: 'copying-pages'
        })
      );
    });

    test('should emit progress event', async () => {
      controller.monitorProgress(123, 5000);

      await jest.advanceTimersByTimeAsync(2000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'merge:progress',
        expect.objectContaining({
          mergeId: 5000,
          progress: 50
        })
      );
    });

    test('should emit stage complete event', async () => {
      mockMergeApiService.getMergeStatus.mockResolvedValue({
        status: 'in_progress',
        progress: 50,
        currentStage: 'copying-pages',
        stageComplete: true
      });

      controller.monitorProgress(123, 5000);

      await jest.advanceTimersByTimeAsync(2000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'merge:stage-complete',
        expect.objectContaining({
          stage: 'copying-pages'
        })
      );
    });

    test('should emit complete event when merge completes', async () => {
      mockMergeApiService.getMergeStatus.mockResolvedValue({
        status: 'completed',
        progress: 100,
        result: { success: true }
      });

      controller.monitorProgress(123, 5000);

      await jest.advanceTimersByTimeAsync(2000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'merge:complete',
        expect.objectContaining({
          mergeId: 5000
        })
      );
    });

    test('should emit error event when merge fails', async () => {
      mockMergeApiService.getMergeStatus.mockResolvedValue({
        status: 'failed',
        progress: 30,
        error: 'Merge failed'
      });

      controller.monitorProgress(123, 5000);

      await jest.advanceTimersByTimeAsync(2000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'merge:error',
        expect.objectContaining({
          error: 'Merge failed'
        })
      );
    });

    test('should stop monitoring when merge completes', async () => {
      mockMergeApiService.getMergeStatus.mockResolvedValue({
        status: 'completed',
        progress: 100
      });

      controller.monitorProgress(123, 5000);

      await jest.advanceTimersByTimeAsync(2000);

      expect(controller.monitoringTimers.has(123)).toBe(false);
    });

    test('should emit monitoring error on exception', async () => {
      mockMergeApiService.getMergeStatus.mockRejectedValue(new Error('API error'));

      controller.monitorProgress(123, 5000);

      await jest.advanceTimersByTimeAsync(2000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'merge:monitoring-error',
        expect.objectContaining({ error: 'API error' })
      );
    });
  });

  describe('stopMonitoring()', () => {
    test('should clear monitoring timer', () => {
      const timerId = setInterval(() => {}, 1000);

      controller.monitoringTimers.set(123, timerId);

      controller.stopMonitoring(123);

      expect(controller.monitoringTimers.has(123)).toBe(false);
    });

    test('should handle non-existent timer gracefully', () => {
      expect(() => {
        controller.stopMonitoring(999);
      }).not.toThrow();
    });
  });

  describe('getMergeResult()', () => {
    beforeEach(() => {
      mockMergeApiService.getMergeStatus.mockResolvedValue({
        status: 'completed',
        progress: 100,
        result: { copiedPages: 3, copiedDataSources: 2 }
      });
    });

    test('should throw error if sourceAppId not provided', async () => {
      await expect(controller.getMergeResult()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if mergeId not provided', async () => {
      await expect(controller.getMergeResult(123)).rejects.toThrow('Valid merge ID is required');
    });

    test('should get merge result from API', async () => {
      const result = await controller.getMergeResult(123, 5000);

      expect(mockMergeApiService.getMergeStatus).toHaveBeenCalledWith(
        123,
        expect.objectContaining({ mergeId: 5000 })
      );
      expect(result.mergeId).toBe(5000);
      expect(result.status).toBe('completed');
    });

    test('should throw error on API failure', async () => {
      mockMergeApiService.getMergeStatus.mockRejectedValue(new Error('API error'));

      await expect(controller.getMergeResult(123, 5000)).rejects.toThrow('Failed to get merge result');
    });
  });

  describe('fetchLogs()', () => {
    beforeEach(() => {
      mockMergeApiService.fetchMergeLogs.mockResolvedValue([
        { message: 'Log 1', type: 'info' },
        { message: 'Log 2', type: 'error' }
      ]);
    });

    test('should throw error if appId not provided', async () => {
      await expect(controller.fetchLogs()).rejects.toThrow('Valid app ID is required');
    });

    test('should throw error if mergeId not provided', async () => {
      await expect(controller.fetchLogs(123)).rejects.toThrow('Valid merge ID is required');
    });

    test('should fetch logs from API', async () => {
      const logs = await controller.fetchLogs(123, 5000);

      expect(mockMergeApiService.fetchMergeLogs).toHaveBeenCalledWith(
        123,
        expect.objectContaining({ mergeId: 5000 })
      );
      expect(logs.length).toBe(2);
    });

    test('should pass options to API', async () => {
      await controller.fetchLogs(123, 5000, {
        types: ['info', 'error'],
        pagination: { page: 1, limit: 50 }
      });

      expect(mockMergeApiService.fetchMergeLogs).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          mergeId: 5000,
          types: ['info', 'error'],
          pagination: { page: 1, limit: 50 }
        })
      );
    });

    test('should throw error on API failure', async () => {
      mockMergeApiService.fetchMergeLogs.mockRejectedValue(new Error('API error'));

      await expect(controller.fetchLogs(123, 5000)).rejects.toThrow('Failed to fetch logs');
    });
  });

  describe('cleanup()', () => {
    test('should clear all monitoring timers', () => {
      controller.monitoringTimers.set(123, setInterval(() => {}, 1000));
      controller.monitoringTimers.set(456, setInterval(() => {}, 1000));

      controller.cleanup();

      expect(controller.monitoringTimers.size).toBe(0);
    });
  });
});

