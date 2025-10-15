// src/middleware/utils/DataMapper.test.js

const DataMapper = require('./DataMapper');

describe('DataMapper', () => {
  describe('transformAppResponse()', () => {
    test('should return null for null input', () => {
      const result = DataMapper.transformAppResponse(null);

      expect(result).toBe(null);
    });

    test('should transform complete app response', () => {
      const apiResponse = {
        id: 123,
        name: 'Test App',
        organizationId: 100,
        userRole: 'publisher',
        lockedUntil: '2024-12-31T23:59:59.000Z',
        settings: { theme: 'light' },
        extraField: 'ignored'
      };

      const result = DataMapper.transformAppResponse(apiResponse);

      expect(result.id).toBe(123);
      expect(result.name).toBe('Test App');
      expect(result.organizationId).toBe(100);
      expect(result.extraField).toBeUndefined();
    });

    test('should filter fields when specified', () => {
      const apiResponse = {
        id: 123,
        name: 'Test App',
        organizationId: 100,
        settings: { theme: 'light' }
      };

      const result = DataMapper.transformAppResponse(apiResponse, {
        fields: ['id', 'name']
      });

      expect(result).toEqual({ id: 123, name: 'Test App' });
    });
  });

  describe('transformPageResponse()', () => {
    test('should return null for null input', () => {
      const result = DataMapper.transformPageResponse(null);

      expect(result).toBe(null);
    });

    test('should transform page response', () => {
      const apiResponse = {
        id: 456,
        title: 'Home',
        order: 1,
        appId: 123,
        template: 'list'
      };

      const result = DataMapper.transformPageResponse(apiResponse);

      expect(result.id).toBe(456);
      expect(result.title).toBe('Home');
      expect(result.order).toBe(1);
    });

    test('should include associations when requested', () => {
      const apiResponse = {
        id: 456,
        title: 'Home',
        associatedDataSources: [1, 2, 3],
        associatedFiles: [10, 11]
      };

      const result = DataMapper.transformPageResponse(apiResponse, {
        includeAssociations: true
      });

      expect(result.associatedDataSources).toEqual([1, 2, 3]);
      expect(result.associatedFiles).toEqual([10, 11]);
    });

    test('should not include associations by default', () => {
      const apiResponse = {
        id: 456,
        title: 'Home',
        associatedDataSources: [1, 2, 3]
      };

      const result = DataMapper.transformPageResponse(apiResponse);

      expect(result.associatedDataSources).toBeUndefined();
    });

    test('should filter fields when specified', () => {
      const apiResponse = {
        id: 456,
        title: 'Home',
        order: 1
      };

      const result = DataMapper.transformPageResponse(apiResponse, {
        fields: ['id', 'title']
      });

      expect(result).toEqual({ id: 456, title: 'Home' });
    });
  });

  describe('transformDataSourceResponse()', () => {
    test('should return null for null input', () => {
      const result = DataMapper.transformDataSourceResponse(null);

      expect(result).toBe(null);
    });

    test('should transform data source response', () => {
      const apiResponse = {
        id: 789,
        name: 'Users',
        type: null,
        appId: 123,
        entriesCount: 100
      };

      const result = DataMapper.transformDataSourceResponse(apiResponse);

      expect(result.id).toBe(789);
      expect(result.name).toBe('Users');
      expect(result.entriesCount).toBe(100);
    });
  });

  describe('transformMediaResponse()', () => {
    test('should return null for null input', () => {
      const result = DataMapper.transformMediaResponse(null);

      expect(result).toBe(null);
    });

    test('should transform media response', () => {
      const apiResponse = {
        id: 100,
        name: 'logo.png',
        type: 'image/png',
        size: 1024,
        url: 'https://example.com/logo.png'
      };

      const result = DataMapper.transformMediaResponse(apiResponse);

      expect(result.id).toBe(100);
      expect(result.name).toBe('logo.png');
      expect(result.type).toBe('image/png');
    });
  });

  describe('buildApiRequest()', () => {
    test('should return empty object for null input', () => {
      const result = DataMapper.buildApiRequest(null);

      expect(result).toEqual({});
    });

    test('should pass through internal model', () => {
      const internalModel = {
        sourceAppId: 123,
        destinationAppId: 456,
        pageIds: [1, 2, 3]
      };

      const result = DataMapper.buildApiRequest(internalModel);

      expect(result).toEqual(internalModel);
    });
  });

  describe('filterFields()', () => {
    test('should filter object to specified fields', () => {
      const obj = {
        id: 1,
        name: 'Test',
        extra: 'data',
        another: 'field'
      };

      const result = DataMapper.filterFields(obj, ['id', 'name']);

      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    test('should return original object if fields not provided', () => {
      const obj = { id: 1, name: 'Test' };

      const result = DataMapper.filterFields(obj);

      expect(result).toEqual(obj);
    });

    test('should handle non-existent fields gracefully', () => {
      const obj = { id: 1, name: 'Test' };

      const result = DataMapper.filterFields(obj, ['id', 'missing']);

      expect(result).toEqual({ id: 1 });
    });
  });

  describe('transformArray()', () => {
    test('should return empty array for non-array input', () => {
      const result = DataMapper.transformArray(null, DataMapper.transformAppResponse);

      expect(result).toEqual([]);
    });

    test('should transform array of responses', () => {
      const apiResponses = [
        { id: 1, name: 'App 1' },
        { id: 2, name: 'App 2' }
      ];

      const result = DataMapper.transformArray(
        apiResponses,
        DataMapper.transformAppResponse,
        { fields: ['id', 'name'] }
      );

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ id: 1, name: 'App 1' });
      expect(result[1]).toEqual({ id: 2, name: 'App 2' });
    });
  });
});

