// src/middleware/utils/CacheManager.test.js

const CacheManager = require('./CacheManager');

describe('CacheManager', () => {
  let cacheManager;

  beforeEach(() => {
    jest.useFakeTimers();
    cacheManager = new CacheManager({ maxSize: 3, defaultTTL: 60000 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const cache = new CacheManager();

      expect(cache.maxSize).toBe(100);
      expect(cache.defaultTTL).toBe(300000);
    });

    test('should initialize with custom options', () => {
      expect(cacheManager.maxSize).toBe(3);
      expect(cacheManager.defaultTTL).toBe(60000);
    });
  });

  describe('generateCacheKey()', () => {
    test('should generate deterministic key from endpoint', () => {
      const key = cacheManager.generateCacheKey('v1/apps');

      expect(key).toBe('v1/apps:{}');
    });

    test('should include options in key', () => {
      const key = cacheManager.generateCacheKey('v1/apps', {
        organizationId: 123,
        fields: ['id', 'name']
      });

      expect(key).toContain('v1/apps:');
      expect(key).toContain('organizationId');
    });

    test('should generate same key for same options regardless of order', () => {
      const key1 = cacheManager.generateCacheKey('v1/apps', {
        b: 2,
        a: 1
      });

      const key2 = cacheManager.generateCacheKey('v1/apps', {
        a: 1,
        b: 2
      });

      expect(key1).toBe(key2);
    });
  });

  describe('get() and set()', () => {
    test('should store and retrieve data', () => {
      cacheManager.set('key1', { data: 'test' });

      const result = cacheManager.get('key1');

      expect(result).toEqual({ data: 'test' });
    });

    test('should return null for non-existent key', () => {
      const result = cacheManager.get('missing');

      expect(result).toBe(null);
    });

    test('should return null for expired data', () => {
      cacheManager.set('key1', { data: 'test' }, 1000);

      // Fast-forward past expiration
      jest.advanceTimersByTime(1001);

      const result = cacheManager.get('key1');

      expect(result).toBe(null);
    });

    test('should use default TTL if not specified', () => {
      cacheManager.set('key1', { data: 'test' });

      // Fast-forward but not past default TTL
      jest.advanceTimersByTime(30000);

      const result = cacheManager.get('key1');

      expect(result).toEqual({ data: 'test' });
    });

    test('should allow TTL of 0 for no expiration', () => {
      cacheManager.set('key1', { data: 'test' }, 0);

      // Fast-forward way past normal TTL
      jest.advanceTimersByTime(1000000);

      const result = cacheManager.get('key1');

      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('LRU eviction', () => {
    test('should evict least recently used when at max size', () => {
      cacheManager.set('key1', 'data1');
      jest.advanceTimersByTime(100);

      cacheManager.set('key2', 'data2');
      jest.advanceTimersByTime(100);

      cacheManager.set('key3', 'data3');
      jest.advanceTimersByTime(100);

      // Access key1 and key2 to make them more recent
      cacheManager.get('key1');
      jest.advanceTimersByTime(100);

      cacheManager.get('key2');
      jest.advanceTimersByTime(100);

      // Adding key4 should evict key3 (least recently accessed)
      cacheManager.set('key4', 'data4');

      expect(cacheManager.has('key1')).toBe(true);
      expect(cacheManager.has('key2')).toBe(true);
      expect(cacheManager.has('key3')).toBe(false);
      expect(cacheManager.has('key4')).toBe(true);
    });

    test('should not evict when updating existing key', () => {
      cacheManager.set('key1', 'data1');
      cacheManager.set('key2', 'data2');
      cacheManager.set('key3', 'data3');

      // Update existing key - should not evict
      cacheManager.set('key1', 'updated1');

      expect(cacheManager.size()).toBe(3);
      expect(cacheManager.get('key1')).toBe('updated1');
    });
  });

  describe('clear()', () => {
    test('should clear all entries', () => {
      cacheManager.set('key1', 'data1');
      cacheManager.set('key2', 'data2');

      cacheManager.clear();

      expect(cacheManager.size()).toBe(0);
      expect(cacheManager.get('key1')).toBe(null);
    });
  });

  describe('size()', () => {
    test('should return current cache size', () => {
      expect(cacheManager.size()).toBe(0);

      cacheManager.set('key1', 'data1');
      expect(cacheManager.size()).toBe(1);

      cacheManager.set('key2', 'data2');
      expect(cacheManager.size()).toBe(2);
    });
  });

  describe('has()', () => {
    test('should return true for existing unexpired key', () => {
      cacheManager.set('key1', 'data1');

      expect(cacheManager.has('key1')).toBe(true);
    });

    test('should return false for non-existent key', () => {
      expect(cacheManager.has('missing')).toBe(false);
    });

    test('should return false for expired key', () => {
      cacheManager.set('key1', 'data1', 1000);

      jest.advanceTimersByTime(1001);

      expect(cacheManager.has('key1')).toBe(false);
    });
  });

  describe('delete()', () => {
    test('should delete existing key', () => {
      cacheManager.set('key1', 'data1');

      const result = cacheManager.delete('key1');

      expect(result).toBe(true);
      expect(cacheManager.has('key1')).toBe(false);
    });

    test('should return false for non-existent key', () => {
      const result = cacheManager.delete('missing');

      expect(result).toBe(false);
    });
  });
});

