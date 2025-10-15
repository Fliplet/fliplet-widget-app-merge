// src/middleware/core/ValidationEngine.test.js

const ValidationEngine = require('./ValidationEngine');

describe('ValidationEngine', () => {
  let validationEngine;

  beforeEach(() => {
    validationEngine = new ValidationEngine();
  });

  describe('validateAppSelection()', () => {
    test('should pass for valid app selection', () => {
      const result = validationEngine.validateAppSelection(123, 456);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail when source app ID is missing', () => {
      const result = validationEngine.validateAppSelection(null, 456);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('sourceAppId');
      expect(result.errors[0].type).toBe('required');
    });

    test('should fail when destination app ID is missing', () => {
      const result = validationEngine.validateAppSelection(123, null);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('destinationAppId');
    });

    test('should fail when both app IDs are missing', () => {
      const result = validationEngine.validateAppSelection(null, null);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    test('should fail when source and destination are the same', () => {
      const result = validationEngine.validateAppSelection(123, 123);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.type === 'constraint')).toBe(true);
      expect(result.errors.some((e) => e.message.includes('cannot be the same'))).toBe(true);
    });

    test('should fail when source app ID is not a number', () => {
      const result = validationEngine.validateAppSelection('123', 456);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.type === 'type')).toBe(true);
    });

    test('should fail when destination app ID is not a number', () => {
      const result = validationEngine.validateAppSelection(123, '456');

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.type === 'type')).toBe(true);
    });
  });

  describe('validateResourceSelection()', () => {
    test('should pass when pages are selected', () => {
      const result = validationEngine.validateResourceSelection({
        selectedPages: [1, 2, 3]
      });

      expect(result.valid).toBe(true);
    });

    test('should pass when data sources are selected', () => {
      const result = validationEngine.validateResourceSelection({
        selectedDataSources: [1, 2]
      });

      expect(result.valid).toBe(true);
    });

    test('should pass when files are selected', () => {
      const result = validationEngine.validateResourceSelection({
        selectedFiles: [100, 101]
      });

      expect(result.valid).toBe(true);
    });

    test('should pass when folders are selected', () => {
      const result = validationEngine.validateResourceSelection({
        selectedFolders: [200]
      });

      expect(result.valid).toBe(true);
    });

    test('should pass when app-level settings are enabled', () => {
      const result = validationEngine.validateResourceSelection({
        appLevelSettings: {
          mergeAppSettings: true
        }
      });

      expect(result.valid).toBe(true);
    });

    test('should fail when nothing is selected', () => {
      const result = validationEngine.validateResourceSelection({
        selectedPages: [],
        selectedDataSources: [],
        selectedFiles: [],
        selectedFolders: [],
        appLevelSettings: {
          mergeAppSettings: false,
          mergeMenuSettings: false
        }
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('at least one');
    });

    test('should handle empty config object', () => {
      const result = validationEngine.validateResourceSelection({});

      expect(result.valid).toBe(false);
    });
  });

  describe('validateDataTypes()', () => {
    test('should pass for valid data types', () => {
      const config = {
        sourceApp: { id: 123, organizationId: 456 },
        destinationApp: { id: 789, organizationId: 456 },
        selectedPages: [1, 2, 3],
        selectedDataSources: [],
        appLevelSettings: {}
      };

      const result = validationEngine.validateDataTypes(config);

      expect(result.valid).toBe(true);
    });

    test('should fail when source app ID is not a number', () => {
      const config = {
        sourceApp: { id: '123' }
      };

      const result = validationEngine.validateDataTypes(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'sourceApp.id')).toBe(true);
    });

    test('should fail when destination app ID is not a number', () => {
      const config = {
        destinationApp: { id: '456' }
      };

      const result = validationEngine.validateDataTypes(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'destinationApp.id')).toBe(true);
    });

    test('should fail when organization ID is not a number', () => {
      const config = {
        sourceApp: { id: 123, organizationId: '456' }
      };

      const result = validationEngine.validateDataTypes(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'sourceApp.organizationId')).toBe(true);
    });

    test('should fail when selectedPages is not an array', () => {
      const config = {
        selectedPages: 'not-an-array'
      };

      const result = validationEngine.validateDataTypes(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'selectedPages')).toBe(true);
    });

    test('should fail when selectedDataSources is not an array', () => {
      const config = {
        selectedDataSources: { id: 1 }
      };

      const result = validationEngine.validateDataTypes(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'selectedDataSources')).toBe(true);
    });

    test('should fail when appLevelSettings is not an object', () => {
      const config = {
        appLevelSettings: 'not-an-object'
      };

      const result = validationEngine.validateDataTypes(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'appLevelSettings')).toBe(true);
    });
  });

  describe('validateConstraints()', () => {
    test('should pass when no duplicates exist', () => {
      const config = {
        validationState: {
          sourceAppDuplicates: { pages: [], dataSources: [] },
          destinationAppDuplicates: { pages: [], dataSources: [] }
        }
      };

      const result = validationEngine.validateConstraints(config);

      expect(result.valid).toBe(true);
    });

    test('should fail when source app has duplicate pages', () => {
      const config = {
        validationState: {
          sourceAppDuplicates: {
            pages: [{ title: 'Home', count: 2 }],
            dataSources: []
          }
        }
      };

      const result = validationEngine.validateConstraints(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('duplicate screen names'))).toBe(true);
      expect(result.errors.some((e) => e.message.includes('Home'))).toBe(true);
    });

    test('should fail when source app has duplicate data sources', () => {
      const config = {
        validationState: {
          sourceAppDuplicates: {
            pages: [],
            dataSources: [{ name: 'Users', count: 2 }]
          }
        }
      };

      const result = validationEngine.validateConstraints(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('duplicate data source names'))).toBe(true);
      expect(result.errors.some((e) => e.message.includes('Users'))).toBe(true);
    });

    test('should fail when destination app has duplicate pages', () => {
      const config = {
        validationState: {
          destinationAppDuplicates: {
            pages: [{ title: 'About', count: 2 }],
            dataSources: []
          }
        }
      };

      const result = validationEngine.validateConstraints(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'destinationApp.duplicates')).toBe(true);
    });

    test('should handle multiple duplicates', () => {
      const config = {
        validationState: {
          sourceAppDuplicates: {
            pages: [{ title: 'Home', count: 2 }, { title: 'About', count: 3 }],
            dataSources: [{ name: 'Users', count: 2 }]
          }
        }
      };

      const result = validationEngine.validateConstraints(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateConfiguration()', () => {
    test('should validate complete valid configuration', () => {
      const config = {
        sourceApp: { id: 123, organizationId: 456 },
        destinationApp: { id: 789, organizationId: 456 },
        selectedPages: [1, 2, 3],
        selectedDataSources: [],
        selectedFiles: [],
        appLevelSettings: {},
        validationState: {
          sourceAppDuplicates: { pages: [], dataSources: [] },
          destinationAppDuplicates: { pages: [], dataSources: [] }
        }
      };

      const result = validationEngine.validateConfiguration(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail when app selection is invalid', () => {
      const config = {
        sourceApp: { id: 123 },
        destinationApp: { id: 123 }, // Same as source
        selectedPages: [1, 2, 3]
      };

      const result = validationEngine.validateConfiguration(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('cannot be the same'))).toBe(true);
    });

    test('should fail when no resources selected', () => {
      const config = {
        sourceApp: { id: 123 },
        destinationApp: { id: 456 },
        selectedPages: [],
        selectedDataSources: [],
        selectedFiles: [],
        appLevelSettings: {}
      };

      const result = validationEngine.validateConfiguration(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('at least one'))).toBe(true);
    });

    test('should accumulate all validation errors', () => {
      const config = {
        sourceApp: { id: '123' }, // Invalid type
        destinationApp: { id: 456 },
        selectedPages: 'not-an-array', // Invalid type
        selectedDataSources: [],
        validationState: {
          sourceAppDuplicates: {
            pages: [{ title: 'Home', count: 2 }], // Constraint violation
            dataSources: []
          }
        }
      };

      const result = validationEngine.validateConfiguration(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('getValidationErrors()', () => {
    test('should return current validation errors', () => {
      validationEngine.validateAppSelection(123, 123);

      const errors = validationEngine.getValidationErrors();

      expect(errors.length).toBeGreaterThan(0);
    });

    test('should return empty array when no errors', () => {
      const errors = validationEngine.getValidationErrors();

      expect(errors).toEqual([]);
    });
  });
});

