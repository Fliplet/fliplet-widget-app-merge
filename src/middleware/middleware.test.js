// src/middleware/middleware.test.js

const AppMergeMiddleware = require('./middleware');

describe('AppMergeMiddleware', () => {
  let middleware;

  beforeEach(() => {
    middleware = new AppMergeMiddleware();
  });

  afterEach(() => {
    if (middleware.initialized) {
      middleware.cleanup();
    }
  });

  describe('constructor', () => {
    test('should create middleware instance', () => {
      expect(middleware).toBeInstanceOf(AppMergeMiddleware);
      expect(middleware.initialized).toBe(false);
    });

    test('should accept user configuration', () => {
      const customMiddleware = new AppMergeMiddleware({
        cache: { maxSize: 50 }
      });

      expect(customMiddleware.userConfig).toEqual({ cache: { maxSize: 50 } });
    });
  });

  describe('initialize()', () => {
    test('should initialize all components', async () => {
      await middleware.initialize();

      expect(middleware.initialized).toBe(true);
      expect(middleware.core.apiClient).toBeDefined();
      expect(middleware.core.stateManager).toBeDefined();
      expect(middleware.api.apps).toBeDefined();
      expect(middleware.controllers.validation).toBeDefined();
      expect(middleware.controllers.configuration).toBeDefined();
      expect(middleware.utils.eventEmitter).toBeDefined();
    });

    test('should merge user configuration', async () => {
      const customMiddleware = new AppMergeMiddleware({
        cache: { maxSize: 50 }
      });

      await customMiddleware.initialize();

      expect(customMiddleware.config.cache.maxSize).toBe(50);
    });

    test('should throw error if already initialized', async () => {
      await middleware.initialize();

      await expect(middleware.initialize()).rejects.toThrow('Middleware already initialized');
    });
  });

  describe('public API methods', () => {
    beforeEach(async () => {
      await middleware.initialize();
    });

    test('should delegate startConfiguration to controller', async () => {
      const mockResult = { success: true };

      middleware.controllers.configuration.startConfiguration = jest.fn().mockResolvedValue(mockResult);

      const result = await middleware.startConfiguration(123);

      expect(middleware.controllers.configuration.startConfiguration).toHaveBeenCalledWith(123, {});
      expect(result).toEqual(mockResult);
    });

    test('should delegate updateConfiguration to controller', () => {
      const mockResult = { destinationAppId: 456 };

      middleware.controllers.configuration.updateConfiguration = jest.fn().mockReturnValue(mockResult);

      const result = middleware.updateConfiguration({ destinationAppId: 456 });

      expect(middleware.controllers.configuration.updateConfiguration).toHaveBeenCalledWith({ destinationAppId: 456 });
      expect(result).toEqual(mockResult);
    });

    test('should delegate getConfiguration to controller', () => {
      const mockConfig = { sourceAppId: 123 };

      middleware.controllers.configuration.getConfiguration = jest.fn().mockReturnValue(mockConfig);

      const result = middleware.getConfiguration();

      expect(middleware.controllers.configuration.getConfiguration).toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });

    test('should delegate initiateMerge to execution controller', async () => {
      const mockResult = { mergeId: 5000 };
      const mergeConfig = { destinationAppId: 456 };

      middleware.controllers.execution.initiateMerge = jest.fn().mockResolvedValue(mockResult);

      const result = await middleware.initiateMerge(123, mergeConfig);

      expect(middleware.controllers.execution.initiateMerge).toHaveBeenCalledWith(123, mergeConfig, {});
      expect(result).toEqual(mockResult);
    });

    test('should delegate getMergeResult to execution controller', async () => {
      const mockResult = { status: 'completed' };

      middleware.controllers.execution.getMergeResult = jest.fn().mockResolvedValue(mockResult);

      const result = await middleware.getMergeResult(123, 5000);

      expect(middleware.controllers.execution.getMergeResult).toHaveBeenCalledWith(123, 5000);
      expect(result).toEqual(mockResult);
    });
  });

  describe('event subscription', () => {
    beforeEach(async () => {
      await middleware.initialize();
    });

    test('should subscribe to events', () => {
      const handler = jest.fn();

      middleware.on('test-event', handler);

      middleware.utils.eventEmitter.emit('test-event', { data: 'test' });

      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    test('should unsubscribe from events', () => {
      const handler = jest.fn();

      middleware.on('test-event', handler);
      middleware.off('test-event', handler);

      middleware.utils.eventEmitter.emit('test-event', { data: 'test' });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('cleanup()', () => {
    test('should clean up resources', async () => {
      await middleware.initialize();

      middleware.controllers.appLock.cleanup = jest.fn();
      middleware.controllers.execution.cleanup = jest.fn();

      middleware.cleanup();

      expect(middleware.controllers.appLock.cleanup).toHaveBeenCalled();
      expect(middleware.controllers.execution.cleanup).toHaveBeenCalled();
    });
  });

  describe('ensureInitialized()', () => {
    test('should throw error if not initialized', () => {
      expect(() => {
        middleware.ensureInitialized();
      }).toThrow('Middleware not initialized');
    });

    test('should not throw error if initialized', async () => {
      await middleware.initialize();

      expect(() => {
        middleware.ensureInitialized();
      }).not.toThrow();
    });

    test('should prevent API calls before initialization', () => {
      expect(() => {
        middleware.updateConfiguration({});
      }).toThrow('Middleware not initialized');
    });
  });
});

