const auditLogging = require('./auditLogging');

describe('auditLogging', () => {
  let mockFlipletLogs;
  let originalEnableFlag;

  beforeEach(() => {
    // Save original enable flag
    originalEnableFlag = auditLogging.ENABLE_AUDIT_LOGS;

    // Mock Fliplet.App.Logs.create
    mockFlipletLogs = jest.fn().mockResolvedValue();
    global.window = {
      Fliplet: {
        App: {
          Logs: {
            create: mockFlipletLogs
          }
        }
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.window;
  });

  describe('when ENABLE_AUDIT_LOGS is false', () => {
    beforeEach(() => {
      // Ensure flag is false
      Object.defineProperty(auditLogging, 'ENABLE_AUDIT_LOGS', {
        value: false,
        writable: true,
        configurable: true
      });
    });

    it('does not call Fliplet.App.Logs.create for logMergeInitiated', async () => {
      await auditLogging.logMergeInitiated(123, 456, 1, 'John Doe');

      expect(mockFlipletLogs).not.toHaveBeenCalled();
    });

    it('does not call Fliplet.App.Logs.create for logMergeCompleted', async () => {
      await auditLogging.logMergeCompleted(123, 456, 1, 'John Doe', {
        screensCopied: 5,
        dataSourcesCopied: 3,
        filesCopied: 12,
        configurationsCopied: 2
      });

      expect(mockFlipletLogs).not.toHaveBeenCalled();
    });

    it('does not call Fliplet.App.Logs.create for logLockAcquired', async () => {
      await auditLogging.logLockAcquired(123, 456, 1, 'John Doe', 3600);

      expect(mockFlipletLogs).not.toHaveBeenCalled();
    });

    it('returns resolved promise without calling API', async () => {
      const result = await auditLogging.logMergeInitiated(123, 456, 1, 'John Doe');

      expect(result).toBeUndefined();
      expect(mockFlipletLogs).not.toHaveBeenCalled();
    });

    it('isEnabled returns false', () => {
      expect(auditLogging.isEnabled()).toBe(false);
    });
  });

  describe('when ENABLE_AUDIT_LOGS is true', () => {
    beforeEach(() => {
      // Enable audit logging for these tests
      Object.defineProperty(auditLogging, 'ENABLE_AUDIT_LOGS', {
        value: true,
        writable: true,
        configurable: true
      });
    });

    describe('logMergeInitiated', () => {
      it('calls Fliplet.App.Logs.create with correct parameters', async () => {
        await auditLogging.logMergeInitiated(123, 456, 1, 'John Doe');

        expect(mockFlipletLogs).toHaveBeenCalledWith({
          type: auditLogging.LOG_TYPES.MERGE_INITIATED,
          data: expect.objectContaining({
            sourceAppId: 123,
            targetAppId: 456,
            userId: 1,
            userName: 'John Doe',
            action: 'Merge operation initiated',
            timestamp: expect.any(String)
          })
        });
      });
    });

    describe('logMergeCompleted', () => {
      it('calls Fliplet.App.Logs.create with correct parameters', async () => {
        const summary = {
          screensCopied: 5,
          dataSourcesCopied: 3,
          filesCopied: 12,
          configurationsCopied: 2,
          duration: 30
        };

        await auditLogging.logMergeCompleted(123, 456, 1, 'John Doe', summary);

        expect(mockFlipletLogs).toHaveBeenCalledWith({
          type: auditLogging.LOG_TYPES.MERGE_COMPLETED,
          data: expect.objectContaining({
            sourceAppId: 123,
            targetAppId: 456,
            userId: 1,
            userName: 'John Doe',
            action: 'Merge operation completed successfully',
            summary,
            timestamp: expect.any(String)
          })
        });
      });

      it('handles missing summary fields with defaults', async () => {
        await auditLogging.logMergeCompleted(123, 456, 1, 'John Doe', {});

        expect(mockFlipletLogs).toHaveBeenCalledWith({
          type: auditLogging.LOG_TYPES.MERGE_COMPLETED,
          data: expect.objectContaining({
            summary: {
              screensCopied: 0,
              dataSourcesCopied: 0,
              filesCopied: 0,
              configurationsCopied: 0,
              duration: 0
            }
          })
        });
      });
    });

    describe('logMergeFailed', () => {
      it('calls Fliplet.App.Logs.create with correct parameters', async () => {
        const error = new Error('Test error');
        error.code = 'TEST_ERROR';

        await auditLogging.logMergeFailed(123, 456, 1, 'John Doe', error);

        expect(mockFlipletLogs).toHaveBeenCalledWith({
          type: auditLogging.LOG_TYPES.MERGE_FAILED,
          data: expect.objectContaining({
            sourceAppId: 123,
            targetAppId: 456,
            userId: 1,
            userName: 'John Doe',
            action: 'Merge operation failed',
            error: {
              message: 'Test error',
              code: 'TEST_ERROR',
              stack: expect.any(String)
            },
            timestamp: expect.any(String)
          })
        });
      });

      it('handles error without code or stack', async () => {
        const error = { message: 'Simple error' };

        await auditLogging.logMergeFailed(123, 456, 1, 'John Doe', error);

        expect(mockFlipletLogs).toHaveBeenCalledWith({
          type: auditLogging.LOG_TYPES.MERGE_FAILED,
          data: expect.objectContaining({
            error: {
              message: 'Simple error',
              code: null,
              stack: null
            }
          })
        });
      });
    });

    describe('logLockAcquired', () => {
      it('calls Fliplet.App.Logs.create with correct parameters', async () => {
        await auditLogging.logLockAcquired(123, 456, 1, 'John Doe', 3600);

        expect(mockFlipletLogs).toHaveBeenCalledWith({
          type: auditLogging.LOG_TYPES.LOCK_ACQUIRED,
          data: expect.objectContaining({
            sourceAppId: 123,
            targetAppId: 456,
            userId: 1,
            userName: 'John Doe',
            action: 'Apps locked for merge operation',
            lockDuration: 3600,
            timestamp: expect.any(String)
          })
        });
      });
    });

    describe('logLockReleased', () => {
      it('calls Fliplet.App.Logs.create with correct parameters', async () => {
        await auditLogging.logLockReleased(123, 456, 1, 'John Doe', 'merge_completed');

        expect(mockFlipletLogs).toHaveBeenCalledWith({
          type: auditLogging.LOG_TYPES.LOCK_RELEASED,
          data: expect.objectContaining({
            sourceAppId: 123,
            targetAppId: 456,
            userId: 1,
            userName: 'John Doe',
            action: 'Apps unlocked',
            reason: 'merge_completed',
            timestamp: expect.any(String)
          })
        });
      });

      it('uses default reason if not provided', async () => {
        await auditLogging.logLockReleased(123, 456, 1, 'John Doe');

        expect(mockFlipletLogs).toHaveBeenCalledWith({
          type: auditLogging.LOG_TYPES.LOCK_RELEASED,
          data: expect.objectContaining({
            reason: 'merge_completed'
          })
        });
      });
    });

    describe('logLockExtended', () => {
      it('calls Fliplet.App.Logs.create with correct parameters', async () => {
        await auditLogging.logLockExtended(123, 456, 1, 'John Doe', 1800);

        expect(mockFlipletLogs).toHaveBeenCalledWith({
          type: auditLogging.LOG_TYPES.LOCK_EXTENDED,
          data: expect.objectContaining({
            sourceAppId: 123,
            targetAppId: 456,
            userId: 1,
            userName: 'John Doe',
            action: 'Lock duration extended',
            newDuration: 1800,
            timestamp: expect.any(String)
          })
        });
      });
    });

    it('handles missing Fliplet API gracefully', async () => {
      delete global.window;

      await expect(
        auditLogging.logMergeInitiated(123, 456, 1, 'John Doe')
      ).resolves.not.toThrow();
    });

    it('handles API errors gracefully', async () => {
      mockFlipletLogs.mockRejectedValue(new Error('API error'));

      await expect(
        auditLogging.logMergeInitiated(123, 456, 1, 'John Doe')
      ).rejects.toThrow('API error');
    });

    it('isEnabled returns true', () => {
      expect(auditLogging.isEnabled()).toBe(true);
    });
  });
});

