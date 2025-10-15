// src/middleware/utils/CacheManager.js

/**
 * CacheManager - API response caching with LRU eviction
 *
 * Provides simple in-memory caching with TTL and LRU eviction strategies.
 *
 * @class CacheManager
 */
class CacheManager {
  /**
   * Create CacheManager instance
   *
   * @param {Object} [options={}] - Cache options
   * @param {number} [options.maxSize=100] - Maximum cache entries
   * @param {number} [options.defaultTTL=300000] - Default TTL in ms (5 minutes)
   */
  constructor(options = {}) {
    const {
      maxSize = 100,
      defaultTTL = 300000
    } = options;

    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.cache = new Map();
  }

  /**
   * Generate deterministic cache key from endpoint and options
   *
   * @param {string} endpoint - API endpoint
   * @param {Object} [options={}] - Request options
   * @returns {string} Cache key
   *
   * @example
   * const key = cacheManager.generateCacheKey('v1/apps', { organizationId: 123 });
   * // Returns: "v1/apps:{'organizationId':123}"
   */
  generateCacheKey(endpoint, options = {}) {
    // Sort options keys for deterministic key generation
    const sortedOptions = {};

    Object.keys(options).sort().forEach((key) => {
      sortedOptions[key] = options[key];
    });

    return `${endpoint}:${JSON.stringify(sortedOptions)}`;
  }

  /**
   * Get cached data
   *
   * @param {string} key - Cache key
   * @returns {*} Cached data or null if not found/expired
   *
   * @example
   * const data = cacheManager.get('v1/apps:{}');
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();

    if (entry.expiresAt && entry.expiresAt < now) {
      this.cache.delete(key);

      return null;
    }

    // Update access time for LRU
    entry.lastAccessed = now;

    return entry.data;
  }

  /**
   * Set cached data
   *
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} [ttl] - TTL in ms (defaults to defaultTTL)
   * @returns {void}
   *
   * @example
   * cacheManager.set('v1/apps:{}', appsData, 60000);
   */
  set(key, data, ttl) {
    const now = Date.now();
    const actualTTL = ttl !== undefined ? ttl : this.defaultTTL;

    // Evict if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      expiresAt: actualTTL > 0 ? now + actualTTL : null,
      createdAt: now,
      lastAccessed: now
    });
  }

  /**
   * Clear entire cache
   *
   * @returns {void}
   *
   * @example
   * cacheManager.clear();
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Evict least recently used entry
   *
   * @returns {void}
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    // Find least recently accessed entry
    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache size
   *
   * @returns {number} Current cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Check if key exists in cache
   *
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and not expired
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete entry from cache
   *
   * @param {string} key - Cache key
   * @returns {boolean} True if entry was deleted
   */
  delete(key) {
    return this.cache.delete(key);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CacheManager;
}

