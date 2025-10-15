// src/middleware/core/BaseMiddleware.test.js

const BaseMiddleware = require('./BaseMiddleware');
const EventEmitter = require('../utils/EventEmitter');

describe('BaseMiddleware', () => {
  let middleware;
  let mockDependencies;

  beforeEach(() => {
    mockDependencies = {
      apiClient: { request: jest.fn() },
      stateManager: { getState: jest.fn() }
    };

    middleware = new BaseMiddleware(mockDependencies, { timeout: 30000 });
  });

  describe('constructor', () => {
    test('should initialize with dependencies and config', () => {
      expect(middleware.dependencies).toEqual(mockDependencies);
      expect(middleware.config).toEqual({ timeout: 30000 });
    });

    test('should create event emitter if not provided', () => {
      const m = new BaseMiddleware({}, {});

      expect(m.eventEmitter).toBeInstanceOf(EventEmitter);
    });

    test('should use provided event emitter', () => {
      const customEmitter = new EventEmitter();
      const m = new BaseMiddleware({ eventEmitter: customEmitter }, {});

      expect(m.eventEmitter).toBe(customEmitter);
    });

    test('should set initialized to false', () => {
      expect(middleware.initialized).toBe(false);
    });
  });

  describe('initialize()', () => {
    test('should merge config', () => {
      middleware.initialize({ apiUrl: 'https://api.test.com' });

      expect(middleware.config).toEqual({
        timeout: 30000,
        apiUrl: 'https://api.test.com'
      });
    });

    test('should set initialized to true', () => {
      middleware.initialize();

      expect(middleware.initialized).toBe(true);
    });

    test('should emit middleware:initialized event', () => {
      const callback = jest.fn();

      middleware.on('middleware:initialized', callback);
      middleware.initialize({ test: 'value' });

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({ test: 'value' })
        })
      );
    });

    test('should return this for chaining', () => {
      const result = middleware.initialize({});

      expect(result).toBe(middleware);
    });

    test('should override existing config values', () => {
      middleware.initialize({ timeout: 60000 });

      expect(middleware.config.timeout).toBe(60000);
    });
  });

  describe('getDependency()', () => {
    test('should return dependency by name', () => {
      const apiClient = middleware.getDependency('apiClient');

      expect(apiClient).toBe(mockDependencies.apiClient);
    });

    test('should return undefined for non-existent dependency', () => {
      const result = middleware.getDependency('nonExistent');

      expect(result).toBeUndefined();
    });
  });

  describe('hasDependency()', () => {
    test('should return true for existing dependency', () => {
      expect(middleware.hasDependency('apiClient')).toBe(true);
    });

    test('should return false for non-existent dependency', () => {
      expect(middleware.hasDependency('nonExistent')).toBe(false);
    });
  });

  describe('setDependency()', () => {
    test('should set a new dependency', () => {
      const logger = { log: jest.fn() };

      middleware.setDependency('logger', logger);

      expect(middleware.getDependency('logger')).toBe(logger);
    });

    test('should override existing dependency', () => {
      const newApiClient = { request: jest.fn() };

      middleware.setDependency('apiClient', newApiClient);

      expect(middleware.getDependency('apiClient')).toBe(newApiClient);
    });

    test('should return this for chaining', () => {
      const result = middleware.setDependency('test', {});

      expect(result).toBe(middleware);
    });
  });

  describe('getConfig()', () => {
    beforeEach(() => {
      middleware.config = {
        timeout: 30000,
        api: {
          url: 'https://api.test.com',
          retryAttempts: 3
        }
      };
    });

    test('should return entire config when no key provided', () => {
      const config = middleware.getConfig();

      expect(config).toEqual(middleware.config);
    });

    test('should return value for simple key', () => {
      const timeout = middleware.getConfig('timeout');

      expect(timeout).toBe(30000);
    });

    test('should return value for nested key', () => {
      const url = middleware.getConfig('api.url');

      expect(url).toBe('https://api.test.com');
    });

    test('should return default value when key not found', () => {
      const value = middleware.getConfig('nonExistent', 'default');

      expect(value).toBe('default');
    });

    test('should return default value for nested non-existent key', () => {
      const value = middleware.getConfig('api.nonExistent', 'default');

      expect(value).toBe('default');
    });

    test('should return undefined when key not found and no default', () => {
      const value = middleware.getConfig('nonExistent');

      expect(value).toBeUndefined();
    });
  });

  describe('setConfig()', () => {
    test('should set simple config value', () => {
      middleware.setConfig('timeout', 60000);

      expect(middleware.config.timeout).toBe(60000);
    });

    test('should set nested config value', () => {
      middleware.setConfig('api.url', 'https://new-api.com');

      expect(middleware.getConfig('api.url')).toBe('https://new-api.com');
    });

    test('should create nested structure if it does not exist', () => {
      middleware.setConfig('new.nested.value', 123);

      expect(middleware.getConfig('new.nested.value')).toBe(123);
    });

    test('should return this for chaining', () => {
      const result = middleware.setConfig('test', 'value');

      expect(result).toBe(middleware);
    });
  });

  describe('event methods', () => {
    test('emit() should emit event', () => {
      const callback = jest.fn();

      middleware.on('test-event', callback);
      middleware.emit('test-event', { data: 'test' });

      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    test('on() should register event listener', () => {
      const callback = jest.fn();

      middleware.on('test-event', callback);
      middleware.emit('test-event', { data: 'test' });

      expect(callback).toHaveBeenCalled();
    });

    test('once() should register one-time listener', () => {
      const callback = jest.fn();

      middleware.once('test-event', callback);
      middleware.emit('test-event', { data: 1 });
      middleware.emit('test-event', { data: 2 });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('off() should unregister event listener', () => {
      const callback = jest.fn();

      middleware.on('test-event', callback);
      middleware.off('test-event', callback);
      middleware.emit('test-event', { data: 'test' });

      expect(callback).not.toHaveBeenCalled();
    });

    test('should support method chaining for event methods', () => {
      const callback = jest.fn();

      const result = middleware
        .on('event1', callback)
        .once('event2', callback)
        .off('event1', callback)
        .emit('event2', {});

      expect(result).toBe(middleware);
    });
  });

  describe('isInitialized()', () => {
    test('should return false before initialization', () => {
      expect(middleware.isInitialized()).toBe(false);
    });

    test('should return true after initialization', () => {
      middleware.initialize();

      expect(middleware.isInitialized()).toBe(true);
    });
  });

  describe('ensureInitialized()', () => {
    test('should not throw when initialized', () => {
      middleware.initialize();

      expect(() => {
        middleware.ensureInitialized();
      }).not.toThrow();
    });

    test('should throw when not initialized', () => {
      expect(() => {
        middleware.ensureInitialized();
      }).toThrow('Middleware must be initialized before use');
    });
  });

  describe('getDependencies()', () => {
    test('should return all dependencies', () => {
      const deps = middleware.getDependencies();

      expect(deps).toEqual(mockDependencies);
    });

    test('should return a copy of dependencies', () => {
      const deps = middleware.getDependencies();

      deps.newDep = 'test';

      expect(middleware.dependencies.newDep).toBeUndefined();
    });
  });

  describe('getAllConfig()', () => {
    test('should return all configuration', () => {
      const config = middleware.getAllConfig();

      expect(config).toEqual({ timeout: 30000 });
    });

    test('should return a copy of config', () => {
      const config = middleware.getAllConfig();

      config.newConfig = 'test';

      expect(middleware.config.newConfig).toBeUndefined();
    });
  });
});

