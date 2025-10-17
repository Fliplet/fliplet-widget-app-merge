// src/middleware/utils/DataMapper.js

/**
 * DataMapper - Transform API responses to internal models
 *
 * Provides methods to transform API response data into consistent internal models,
 * filtering fields and normalizing structures.
 *
 * @class DataMapper
 */
class DataMapper {
  /**
   * Transform app API response
   *
   * @param {Object} apiResponse - Raw API response
   * @param {Object} [options={}] - Transform options
   * @param {Array<string>} [options.fields] - Fields to include
   * @returns {Object} Transformed app object
   *
   * @example
   * const app = DataMapper.transformAppResponse(apiData, { fields: ['id', 'name'] });
   */
  static transformAppResponse(apiResponse, options = {}) {
    if (!apiResponse) {
      return null;
    }

    const { fields } = options;

    const transformed = {
      id: apiResponse.id,
      name: apiResponse.name,
      organizationId: apiResponse.organizationId,
      userRole: apiResponse.userRole,
      lockedUntil: apiResponse.lockedUntil,
      lockedBy: apiResponse.lockedBy,
      settings: apiResponse.settings,
      plan: apiResponse.plan,
      limits: apiResponse.limits,
      currentUsage: apiResponse.currentUsage,
      createdAt: apiResponse.createdAt,
      updatedAt: apiResponse.updatedAt
    };

    // Filter by fields if specified
    if (fields && Array.isArray(fields)) {
      return this.filterFields(transformed, fields);
    }

    return transformed;
  }

  /**
   * Transform page API response
   *
   * @param {Object} apiResponse - Raw API response
   * @param {Object} [options={}] - Transform options
   * @param {Array<string>} [options.fields] - Fields to include
   * @param {boolean} [options.includeAssociations=false] - Include associations
   * @returns {Object} Transformed page object
   *
   * @example
   * const page = DataMapper.transformPageResponse(pageData, {
   *   fields: ['id', 'title'],
   *   includeAssociations: true
   * });
   */
  static transformPageResponse(apiResponse, options = {}) {
    if (!apiResponse) {
      return null;
    }

    const { fields, includeAssociations = false } = options;

    const transformed = {
      id: apiResponse.id,
      title: apiResponse.title,
      order: apiResponse.order,
      appId: apiResponse.appId,
      template: apiResponse.template,
      settings: apiResponse.settings,
      createdAt: apiResponse.createdAt,
      updatedAt: apiResponse.updatedAt
    };

    // Include associations if requested
    if (includeAssociations) {
      transformed.associatedDataSources = apiResponse.associatedDataSources || [];
      transformed.associatedFiles = apiResponse.associatedFiles || [];
    }

    // Filter by fields if specified
    if (fields && Array.isArray(fields)) {
      return this.filterFields(transformed, fields);
    }

    return transformed;
  }

  /**
   * Transform data source API response
   *
   * @param {Object} apiResponse - Raw API response
   * @param {Object} [options={}] - Transform options
   * @param {Array<string>} [options.fields] - Fields to include
   * @returns {Object} Transformed data source object
   *
   * @example
   * const dataSource = DataMapper.transformDataSourceResponse(dsData);
   */
  static transformDataSourceResponse(apiResponse, options = {}) {
    if (!apiResponse) {
      return null;
    }

    const { fields } = options;

    const transformed = {
      id: apiResponse.id,
      name: apiResponse.name,
      type: apiResponse.type,
      appId: apiResponse.appId,
      entriesCount: apiResponse.entriesCount,
      hasGlobalDependency: apiResponse.hasGlobalDependency,
      inUse: apiResponse.inUse,
      createdAt: apiResponse.createdAt,
      updatedAt: apiResponse.updatedAt
    };

    // Filter by fields if specified
    if (fields && Array.isArray(fields)) {
      return this.filterFields(transformed, fields);
    }

    return transformed;
  }

  /**
   * Transform media API response
   *
   * @param {Object} apiResponse - Raw API response
   * @param {Object} [options={}] - Transform options
   * @param {Array<string>} [options.fields] - Fields to include
   * @returns {Object} Transformed media object
   *
   * @example
   * const file = DataMapper.transformMediaResponse(fileData);
   */
  static transformMediaResponse(apiResponse, options = {}) {
    if (!apiResponse) {
      return null;
    }

    const { fields } = options;

    const transformed = {
      id: apiResponse.id,
      name: apiResponse.name,
      type: apiResponse.type,
      size: apiResponse.size,
      url: apiResponse.url,
      appId: apiResponse.appId,
      folderId: apiResponse.folderId,
      isGlobalLibrary: apiResponse.isGlobalLibrary,
      createdAt: apiResponse.createdAt,
      updatedAt: apiResponse.updatedAt
    };

    // Filter by fields if specified
    if (fields && Array.isArray(fields)) {
      return this.filterFields(transformed, fields);
    }

    return transformed;
  }

  /**
   * Build API request from internal model
   *
   * @param {Object} internalModel - Internal data model
   * @returns {Object} API request format
   *
   * @example
   * const apiRequest = DataMapper.buildApiRequest(mergeConfig);
   */
  static buildApiRequest(internalModel) {
    if (!internalModel) {
      return {};
    }

    // Transform internal model to API format
    // This is typically a pass-through but can normalize field names
    return {
      ...internalModel
    };
  }

  /**
   * Filter object to include only specified fields
   *
   * @param {Object} obj - Object to filter
   * @param {Array<string>} fields - Fields to include
   * @returns {Object} Filtered object
   *
   * @example
   * const filtered = DataMapper.filterFields({ id: 1, name: 'Test', extra: 'data' }, ['id', 'name']);
   * // Returns: { id: 1, name: 'Test' }
   */
  static filterFields(obj, fields) {
    if (!obj || !fields || !Array.isArray(fields)) {
      return obj;
    }

    const filtered = {};

    fields.forEach((field) => {
      if (obj.hasOwnProperty(field)) {
        filtered[field] = obj[field];
      }
    });

    return filtered;
  }

  /**
   * Transform array of API responses
   *
   * @param {Array} apiResponses - Array of API responses
   * @param {Function} transformFn - Transform function to apply
   * @param {Object} [options={}] - Transform options
   * @returns {Array} Array of transformed objects
   *
   * @example
   * const apps = DataMapper.transformArray(apiApps, DataMapper.transformAppResponse, { fields: ['id', 'name'] });
   */
  static transformArray(apiResponses, transformFn, options = {}) {
    if (!Array.isArray(apiResponses)) {
      return [];
    }

    return apiResponses.map((response) => transformFn.call(this, response, options));
  }
}

export default DataMapper;

