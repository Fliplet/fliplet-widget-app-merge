// src/middleware/controllers/ValidationController.js

/**
 * ValidationController - Centralized validation logic for merge operations
 *
 * Orchestrates validation across multiple services including app validation,
 * duplicate checking, configuration validation, permissions, and plan limits.
 *
 * @class ValidationController
 */
class ValidationController {
  /**
   * Create ValidationController instance
   *
   * @param {Object} appsApiService - AppsApiService instance
   * @param {Object} validationEngine - ValidationEngine instance
   */
  constructor(appsApiService, validationEngine) {
    if (!appsApiService) {
      throw new Error('AppsApiService is required');
    }

    if (!validationEngine) {
      throw new Error('ValidationEngine is required');
    }

    this.appsApiService = appsApiService;
    this.validationEngine = validationEngine;
  }

  /**
   * Validate app for merge operations
   *
   * Orchestrates multiple validation checks including duplicates, permissions, and constraints.
   *
   * @param {number} appId - App ID to validate
   * @param {Object} [options={}] - Validation options
   * @param {boolean} [options.checkDuplicates=true] - Check for duplicate names
   * @param {boolean} [options.checkPermissions=true] - Check user permissions
   * @param {boolean} [options.checkLock=true] - Check lock status
   * @param {Array<string>} [options.duplicateItems=['pages', 'dataSources']] - Items to check for duplicates
   * @returns {Promise<Object>} Validation result with isValid flag and errors array
   *
   * @example
   * const result = await validationController.validateAppForMerge(123, {
   *   checkDuplicates: true,
   *   duplicateItems: ['pages', 'dataSources']
   * });
   * // Returns: { isValid: true, errors: [] }
   */
  async validateAppForMerge(appId, options = {}) {
    const {
      checkDuplicates = true,
      checkPermissions = true,
      checkLock = true,
      duplicateItems = ['pages', 'dataSources']
    } = options;

    const errors = [];

    // Check for duplicates if requested
    if (checkDuplicates) {
      const duplicateResult = await this.checkDuplicates(appId, { items: duplicateItems });

      if (!duplicateResult.isValid) {
        errors.push(...duplicateResult.errors);
      }
    }

    // Check permissions if requested
    if (checkPermissions) {
      const permissionResult = await this.validatePermissions(appId);

      if (!permissionResult.isValid) {
        errors.push(...permissionResult.errors);
      }
    }

    // Check lock status if requested
    if (checkLock) {
      const lockResult = await this.checkLockStatus(appId);

      if (!lockResult.isValid) {
        errors.push(...lockResult.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for duplicate names in app
   *
   * @param {number} appId - App ID to check
   * @param {Object} [options={}] - Check options
   * @param {Array<string>} [options.items=['pages', 'dataSources']] - Items to check
   * @returns {Promise<Object>} Result with isValid flag, errors, and duplicates data
   *
   * @example
   * const result = await validationController.checkDuplicates(123);
   */
  async checkDuplicates(appId, options = {}) {
    const { items = ['pages', 'dataSources'] } = options;

    try {
      const duplicates = await this.appsApiService.checkDuplicates(appId, { items });

      const errors = [];
      const hasDuplicates = Object.keys(duplicates).some(
        (key) => duplicates[key] && duplicates[key].length > 0
      );

      if (hasDuplicates) {
        Object.keys(duplicates).forEach((itemType) => {
          const itemDuplicates = duplicates[itemType] || [];

          itemDuplicates.forEach((duplicate) => {
            errors.push({
              type: 'DUPLICATE_NAME',
              category: 'duplicate',
              itemType,
              message: `Duplicate ${itemType} name "${duplicate.name || duplicate.title}" found (${duplicate.count} instances)`,
              data: duplicate
            });
          });
        });
      }

      return {
        isValid: !hasDuplicates,
        errors,
        duplicates
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          type: 'DUPLICATE_CHECK_FAILED',
          category: 'api',
          message: 'Failed to check for duplicates',
          originalError: error
        }]
      };
    }
  }

  /**
   * Validate merge configuration
   *
   * @param {Object} mergeConfig - Merge configuration to validate
   * @param {Object} [options={}] - Validation options
   * @param {string} [options.validationLevel='strict'] - Validation strictness level
   * @returns {Promise<Object>} Validation result
   *
   * @example
   * const result = await validationController.validateConfiguration({
   *   sourceAppId: 123,
   *   destinationAppId: 456,
   *   pageIds: [1, 2, 3]
   * });
   */
  async validateConfiguration(mergeConfig, options = {}) {
    const { validationLevel = 'strict' } = options;

    const errors = [];

    // Use ValidationEngine for configuration validation
    const configErrors = this.validationEngine.validateConfiguration(mergeConfig);

    if (configErrors.length > 0) {
      errors.push(...configErrors.map((error) => ({
        type: 'CONFIGURATION_INVALID',
        category: 'validation',
        message: error.message || error,
        field: error.field
      })));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user permissions for app
   *
   * @param {number} appId - App ID to check permissions for
   * @param {Object} [options={}] - Validation options
   * @param {string} [options.requiredRole='publisher'] - Required user role
   * @returns {Promise<Object>} Validation result
   *
   * @example
   * const result = await validationController.validatePermissions(123);
   */
  async validatePermissions(appId, options = {}) {
    const { requiredRole = 'publisher' } = options;

    try {
      // Fetch app with role information
      const app = await this.appsApiService.fetchApp(appId, {
        fields: ['id', 'name', 'userRole', 'permissions']
      });

      const errors = [];

      // Check if user has required role
      if (!app.userRole || app.userRole !== requiredRole) {
        errors.push({
          type: 'INSUFFICIENT_PERMISSIONS',
          category: 'permission',
          message: `User must have ${requiredRole} role to perform merge operations`,
          requiredRole,
          currentRole: app.userRole
        });
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          type: 'PERMISSION_CHECK_FAILED',
          category: 'api',
          message: 'Failed to check permissions',
          originalError: error
        }]
      };
    }
  }

  /**
   * Check plan limits for destination app
   *
   * @param {number} destinationAppId - Destination app ID
   * @param {Object} mergeConfig - Merge configuration
   * @param {Object} [options={}] - Check options
   * @returns {Promise<Object>} Validation result
   *
   * @example
   * const result = await validationController.checkPlanLimits(456, mergeConfig);
   */
  async checkPlanLimits(destinationAppId, mergeConfig, options = {}) {
    try {
      // Fetch destination app with plan information
      const app = await this.appsApiService.fetchApp(destinationAppId, {
        fields: ['id', 'name', 'plan', 'limits', 'currentUsage']
      });

      const errors = [];

      // Check if plan has limits
      if (app.limits) {
        // Check page limit
        if (app.limits.pages && mergeConfig.pageIds) {
          const newPageCount = Array.isArray(mergeConfig.pageIds)
            ? mergeConfig.pageIds.length
            : 0;
          const totalPages = (app.currentUsage?.pages || 0) + newPageCount;

          if (totalPages > app.limits.pages) {
            errors.push({
              type: 'PLAN_LIMIT_EXCEEDED',
              category: 'plan',
              message: `Merge would exceed page limit (${totalPages}/${app.limits.pages})`,
              limit: app.limits.pages,
              current: app.currentUsage?.pages || 0,
              additional: newPageCount
            });
          }
        }

        // Check data source limit
        if (app.limits.dataSources && mergeConfig.dataSources) {
          const newDSCount = Array.isArray(mergeConfig.dataSources)
            ? mergeConfig.dataSources.length
            : 0;
          const totalDS = (app.currentUsage?.dataSources || 0) + newDSCount;

          if (totalDS > app.limits.dataSources) {
            errors.push({
              type: 'PLAN_LIMIT_EXCEEDED',
              category: 'plan',
              message: `Merge would exceed data source limit (${totalDS}/${app.limits.dataSources})`,
              limit: app.limits.dataSources,
              current: app.currentUsage?.dataSources || 0,
              additional: newDSCount
            });
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          type: 'PLAN_LIMIT_CHECK_FAILED',
          category: 'api',
          message: 'Failed to check plan limits',
          originalError: error
        }]
      };
    }
  }

  /**
   * Check lock status of an app
   *
   * @param {number} appId - App ID to check
   * @param {Object} [options={}] - Check options
   * @returns {Promise<Object>} Validation result
   *
   * @example
   * const result = await validationController.checkLockStatus(123);
   */
  async checkLockStatus(appId, options = {}) {
    try {
      const app = await this.appsApiService.fetchApp(appId, {
        fields: ['id', 'name', 'lockedUntil', 'lockedBy']
      });

      const errors = [];
      const now = new Date();
      const lockedUntil = app.lockedUntil ? new Date(app.lockedUntil) : null;

      if (lockedUntil && lockedUntil > now) {
        errors.push({
          type: 'APP_LOCKED',
          category: 'lock',
          message: `App is currently locked until ${lockedUntil.toISOString()}`,
          lockedUntil: app.lockedUntil,
          lockedBy: app.lockedBy
        });
      }

      const isLocked = lockedUntil ? lockedUntil > now : false;

      return {
        isValid: errors.length === 0,
        errors,
        isLocked,
        lockedUntil: app.lockedUntil
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          type: 'LOCK_STATUS_CHECK_FAILED',
          category: 'api',
          message: 'Failed to check lock status',
          originalError: error
        }]
      };
    }
  }
}

export default ValidationController;

