// src/middleware/controllers/AppLockController.test.js

const AppLockController = require('./AppLockController');

describe('AppLockController', () => {
  let appLockController;
  let mockMergeApiService;
  let mockStateManager;
  let mockEventEmitter;

  beforeEach(() => {
    jest.useFakeTimers();

    mockMergeApiService = {
      lockApps: jest.fn(),
      unlockApps: jest.fn(),
      extendLock: jest.fn()
    };

    mockStateManager = {
      getState: jest.fn(),
      setState: jest.fn()
    };

    mockEventEmitter = {
      emit: jest.fn()
    };

    appLockController = new AppLockController(
      mockMergeApiService,
      mockStateManager,
      mockEventEmitter
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    appLockController.cleanup();
  });

  describe('constructor', () => {
    test('should throw error if mergeApiService not provided', () => {
      expect(() => {
        new AppLockController();
      }).toThrow('MergeApiService is required');
    });

    test('should throw error if stateManager not provided', () => {
      expect(() => {
        new AppLockController(mockMergeApiService);
      }).toThrow('StateManager is required');
    });

    test('should throw error if eventEmitter not provided', () => {
      expect(() => {
        new AppLockController(mockMergeApiService, mockStateManager);
      }).toThrow('EventEmitter is required');
    });

    test('should initialize with dependencies', () => {
      expect(appLockController.mergeApiService).toBe(mockMergeApiService);
      expect(appLockController.stateManager).toBe(mockStateManager);
      expect(appLockController.eventEmitter).toBe(mockEventEmitter);
    });
  });

  describe('lockApps()', () => {
    const futureDate = new Date(Date.now() + 600000).toISOString();

    beforeEach(() => {
      mockMergeApiService.lockApps.mockResolvedValue({
        lockedUntil: futureDate
      });
    });

    test('should throw error if sourceAppId not provided', async () => {
      await expect(appLockController.lockApps()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if destinationAppId not provided', async () => {
      await expect(appLockController.lockApps(123)).rejects.toThrow('Valid destination app ID is required');
    });

    test('should lock apps with default duration', async () => {
      const result = await appLockController.lockApps(123, 456);

      expect(mockMergeApiService.lockApps).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          targetApp: { id: 456 },
          lockDuration: 600
        })
      );
      expect(result.lockedUntil).toBe(futureDate);
    });

    test('should update state with lock information', async () => {
      await appLockController.lockApps(123, 456);

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'lockStatus',
        expect.objectContaining({
          sourceAppId: 123,
          destinationAppId: 456,
          lockedUntil: futureDate
        })
      );
    });

    test('should emit lock acquired event', async () => {
      await appLockController.lockApps(123, 456);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'lock:acquired',
        expect.objectContaining({
          sourceAppId: 123,
          destinationAppId: 456
        })
      );
    });

    test('should start monitoring when autoExtend enabled', async () => {
      await appLockController.lockApps(123, 456, { autoExtend: true });

      expect(appLockController.monitoringTimers.has(123)).toBe(true);
    });

    test('should not start monitoring when autoExtend disabled', async () => {
      await appLockController.lockApps(123, 456, { autoExtend: false });

      expect(appLockController.monitoringTimers.has(123)).toBe(false);
    });

    test('should allow custom duration', async () => {
      await appLockController.lockApps(123, 456, { duration: 300 });

      expect(mockMergeApiService.lockApps).toHaveBeenCalledWith(
        123,
        expect.objectContaining({ lockDuration: 300 })
      );
    });

    test('should emit lock failed event on error', async () => {
      mockMergeApiService.lockApps.mockRejectedValue(new Error('Lock failed'));

      await expect(appLockController.lockApps(123, 456)).rejects.toThrow('Lock failed');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'lock:failed',
        expect.objectContaining({
          sourceAppId: 123,
          destinationAppId: 456,
          error: 'Lock failed'
        })
      );
    });
  });

  describe('unlockApps()', () => {
    beforeEach(() => {
      mockMergeApiService.unlockApps.mockResolvedValue({ success: true });
    });

    test('should throw error if sourceAppId not provided', async () => {
      await expect(appLockController.unlockApps()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if destinationAppId not provided', async () => {
      await expect(appLockController.unlockApps(123)).rejects.toThrow('Valid destination app ID is required');
    });

    test('should unlock apps', async () => {
      await appLockController.unlockApps(123, 456);

      expect(mockMergeApiService.unlockApps).toHaveBeenCalledWith(
        123,
        expect.objectContaining({ targetApp: { id: 456 } })
      );
    });

    test('should clear lock state', async () => {
      await appLockController.unlockApps(123, 456);

      expect(mockStateManager.setState).toHaveBeenCalledWith('lockStatus', null);
    });

    test('should emit lock released event', async () => {
      await appLockController.unlockApps(123, 456);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'lock:released',
        expect.objectContaining({
          sourceAppId: 123,
          destinationAppId: 456
        })
      );
    });

    test('should stop monitoring', async () => {
      // Start monitoring first
      appLockController.monitoringTimers.set(123, setInterval(() => {}, 1000));

      await appLockController.unlockApps(123, 456);

      expect(appLockController.monitoringTimers.has(123)).toBe(false);
    });

    test('should emit release failed event on error', async () => {
      mockMergeApiService.unlockApps.mockRejectedValue(new Error('Unlock failed'));

      await expect(appLockController.unlockApps(123, 456)).rejects.toThrow('Unlock failed');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'lock:release-failed',
        expect.objectContaining({ error: 'Unlock failed' })
      );
    });
  });

  describe('extendLock()', () => {
    const futureDate = new Date(Date.now() + 900000).toISOString();

    beforeEach(() => {
      mockMergeApiService.extendLock.mockResolvedValue({
        lockedUntil: futureDate
      });

      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456
      });
    });

    test('should throw error if sourceAppId not provided', async () => {
      await expect(appLockController.extendLock()).rejects.toThrow('Valid source app ID is required');
    });

    test('should throw error if destinationAppId not provided', async () => {
      await expect(appLockController.extendLock(123)).rejects.toThrow('Valid destination app ID is required');
    });

    test('should extend lock with default duration', async () => {
      await appLockController.extendLock(123, 456);

      expect(mockMergeApiService.extendLock).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          targetApp: { id: 456 },
          extendDuration: 300
        })
      );
    });

    test('should update state with new lock time', async () => {
      await appLockController.extendLock(123, 456);

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'lockStatus',
        expect.objectContaining({
          lockedUntil: futureDate
        })
      );
    });

    test('should emit lock extended event', async () => {
      await appLockController.extendLock(123, 456);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'lock:extended',
        expect.objectContaining({
          sourceAppId: 123,
          destinationAppId: 456,
          lockedUntil: futureDate
        })
      );
    });

    test('should allow custom duration', async () => {
      await appLockController.extendLock(123, 456, { additionalDuration: 600 });

      expect(mockMergeApiService.extendLock).toHaveBeenCalledWith(
        123,
        expect.objectContaining({ extendDuration: 600 })
      );
    });

    test('should emit extend failed event on error', async () => {
      mockMergeApiService.extendLock.mockRejectedValue(new Error('Extend failed'));

      await expect(appLockController.extendLock(123, 456)).rejects.toThrow('Extend failed');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'lock:extend-failed',
        expect.objectContaining({ error: 'Extend failed' })
      );
    });
  });

  describe('checkLockStatus()', () => {
    test('should return not locked when no lock state', () => {
      mockStateManager.getState.mockReturnValue(null);

      const result = appLockController.checkLockStatus(123);

      expect(result.isLocked).toBe(false);
      expect(result.lockStatus).toBe(null);
    });

    test('should return locked status for active lock', () => {
      const futureDate = new Date(Date.now() + 300000).toISOString();

      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456,
        lockedUntil: futureDate
      });

      const result = appLockController.checkLockStatus(123);

      expect(result.isLocked).toBe(true);
      expect(result.remainingSeconds).toBeGreaterThan(0);
    });

    test('should return not locked for expired lock', () => {
      const pastDate = new Date(Date.now() - 300000).toISOString();

      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456,
        lockedUntil: pastDate
      });

      const result = appLockController.checkLockStatus(123);

      expect(result.isLocked).toBe(false);
      expect(result.remainingSeconds).toBe(0);
    });
  });

  describe('monitorLockExpiration()', () => {
    beforeEach(() => {
      mockMergeApiService.extendLock.mockResolvedValue({
        lockedUntil: new Date(Date.now() + 600000).toISOString()
      });
    });

    test('should start monitoring interval', () => {
      appLockController.monitorLockExpiration(123, { destinationAppId: 456 });

      expect(appLockController.monitoringTimers.has(123)).toBe(true);
    });

    test('should emit expiring event when approaching threshold', () => {
      const futureDate = new Date(Date.now() + 50000).toISOString();

      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456,
        lockedUntil: futureDate
      });

      appLockController.monitorLockExpiration(123, {
        destinationAppId: 456,
        warningThreshold: 60
      });

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'lock:expiring',
        expect.objectContaining({
          sourceAppId: 123,
          remainingSeconds: expect.any(Number)
        })
      );
    });

    test('should auto-extend lock when enabled', () => {
      const futureDate = new Date(Date.now() + 50000).toISOString();

      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456,
        lockedUntil: futureDate
      });

      appLockController.monitorLockExpiration(123, {
        destinationAppId: 456,
        warningThreshold: 60,
        autoExtend: true
      });

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      expect(mockMergeApiService.extendLock).toHaveBeenCalled();
    });

    test('should emit expired event when lock expires', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();

      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456,
        lockedUntil: pastDate
      });

      appLockController.monitorLockExpiration(123, { destinationAppId: 456 });

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'lock:expired',
        expect.objectContaining({ sourceAppId: 123 })
      );
    });

    test('should stop monitoring after lock expires', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();

      mockStateManager.getState.mockReturnValue({
        sourceAppId: 123,
        destinationAppId: 456,
        lockedUntil: pastDate
      });

      appLockController.monitorLockExpiration(123, { destinationAppId: 456 });

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      expect(appLockController.monitoringTimers.has(123)).toBe(false);
    });
  });

  describe('stopMonitoring()', () => {
    test('should clear monitoring timer', () => {
      const timerId = setInterval(() => {}, 1000);

      appLockController.monitoringTimers.set(123, timerId);

      appLockController.stopMonitoring(123);

      expect(appLockController.monitoringTimers.has(123)).toBe(false);
    });

    test('should handle non-existent timer gracefully', () => {
      expect(() => {
        appLockController.stopMonitoring(999);
      }).not.toThrow();
    });
  });

  describe('cleanup()', () => {
    test('should clear all monitoring timers', () => {
      appLockController.monitoringTimers.set(123, setInterval(() => {}, 1000));
      appLockController.monitoringTimers.set(456, setInterval(() => {}, 1000));

      appLockController.cleanup();

      expect(appLockController.monitoringTimers.size).toBe(0);
    });
  });
});

