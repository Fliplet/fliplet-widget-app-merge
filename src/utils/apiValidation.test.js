/**
 * API Field Mapping Validation Tests
 *
 * Tests the validation utilities against mock data to ensure field mappings
 * work correctly and identify any discrepancies
 */

import { validateMockData, createTestData, generateReportJson, generateReportMarkdown } from '../utils/apiValidation.js';

// Import mock data
import appsMock from '../../tests/mocks/apps.json';
import dataSourcesMock from '../../tests/mocks/dataSources.json';
import pagesMock from '../../tests/mocks/pages.json';
import mediaMock from '../../tests/mocks/media.json';
import mergeStatusMock from '../../tests/mocks/mergeStatus.json';

describe('API Field Mapping Validation', () => {
  let validationReport;

  beforeAll(() => {
    // Create comprehensive mock data
    const mockData = {
      apps: appsMock,
      dataSources: dataSourcesMock,
      pages: pagesMock,
      media: mediaMock,
      mergeStatus: mergeStatusMock,
      testData: createTestData()
    };

    // Run validation
    validationReport = validateMockData(mockData);
  });

  describe('Validation Report Generation', () => {
    it('should generate a validation report', () => {
      expect(validationReport).toBeDefined();
      expect(validationReport.getReport).toBeInstanceOf(Function);
    });

    it('should have summary statistics', () => {
      const report = validationReport.getReport();
      expect(report.summary).toBeDefined();
      expect(report.summary.total).toBeGreaterThan(0);
      expect(report.summary.pass).toBeGreaterThanOrEqual(0);
      expect(report.summary.fail).toBeGreaterThanOrEqual(0);
      expect(report.summary.unknown).toBeGreaterThanOrEqual(0);
    });

    it('should have validation results', () => {
      const report = validationReport.getReport();
      expect(report.results).toBeInstanceOf(Array);
      expect(report.results.length).toBeGreaterThan(0);
    });
  });

  describe('App Field Mappings', () => {
    it('should validate productionAppId → isPublished mapping', () => {
      const appResults = validationReport.results.filter(r =>
        r.endpoint === 'GET /v1/apps/:appId' && r.field === 'productionAppId → isPublished'
      );
      expect(appResults.length).toBeGreaterThan(0);

      // All should pass since mock data doesn't have productionAppId
      const passedResults = appResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(appResults.length);
    });

    it('should validate updatedAt field exists', () => {
      const updatedAtResults = validationReport.results.filter(r =>
        r.endpoint === 'GET /v1/apps/:appId' && r.field === 'updatedAt field exists'
      );
      expect(updatedAtResults.length).toBeGreaterThan(0);

      const passedResults = updatedAtResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(updatedAtResults.length);
    });

    it('should validate updatedBy field does not exist', () => {
      const updatedByResults = validationReport.results.filter(r =>
        r.endpoint === 'GET /v1/apps/:appId' && r.field === 'updatedBy field does not exist'
      );
      expect(updatedByResults.length).toBeGreaterThan(0);

      const passedResults = updatedByResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(updatedByResults.length);
    });
  });

  describe('Data Source Field Mappings', () => {
    it('should validate entriesCount → entryCount mapping', () => {
      const entryCountResults = validationReport.results.filter(r =>
        r.endpoint === 'GET /v1/data-sources?appId=X' && r.field === 'entriesCount → entryCount'
      );
      expect(entryCountResults.length).toBeGreaterThan(0);

      const passedResults = entryCountResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(entryCountResults.length);
    });

    it('should validate associatedPages field name', () => {
      const associatedPagesResults = validationReport.results.filter(r =>
        r.endpoint === 'GET /v1/data-sources?appId=X' && r.field === 'associatedPages field name'
      );
      expect(associatedPagesResults.length).toBeGreaterThan(0);

      const passedResults = associatedPagesResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(associatedPagesResults.length);
    });
  });

  describe('Page Field Mappings', () => {
    it('should validate associatedDS field name', () => {
      const associatedDSResults = validationReport.results.filter(r =>
        r.endpoint === 'GET /v1/apps/:appId/pages' && r.field === 'associatedDS field name'
      );
      expect(associatedDSResults.length).toBeGreaterThan(0);

      const passedResults = associatedDSResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(associatedDSResults.length);
    });

    it('should validate associatedFiles field name', () => {
      const associatedFilesResults = validationReport.results.filter(r =>
        r.endpoint === 'GET /v1/apps/:appId/pages' && r.field === 'associatedFiles field name'
      );
      expect(associatedFilesResults.length).toBeGreaterThan(0);

      const passedResults = associatedFilesResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(associatedFilesResults.length);
    });
  });

  describe('Media Field Mappings', () => {
    it('should validate files array exists', () => {
      const filesArrayResults = validationReport.results.filter(r =>
        r.endpoint === 'GET /v1/media?appId=X' && r.field === 'files array exists'
      );
      expect(filesArrayResults.length).toBeGreaterThan(0);

      const passedResults = filesArrayResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(filesArrayResults.length);
    });

    it('should validate folders array exists', () => {
      const foldersArrayResults = validationReport.results.filter(r =>
        r.endpoint === 'GET /v1/media?appId=X' && r.field === 'folders array exists'
      );
      expect(foldersArrayResults.length).toBeGreaterThan(0);

      const passedResults = foldersArrayResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(foldersArrayResults.length);
    });
  });

  describe('Computed Fields', () => {
    it('should validate isLocked computation', () => {
      const isLockedResults = validationReport.results.filter(r =>
        r.endpoint === 'computed fields' && r.field === 'isLocked computation'
      );
      expect(isLockedResults.length).toBeGreaterThan(0);

      const passedResults = isLockedResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(isLockedResults.length);
    });

    it('should validate hasPublisherRights computation', () => {
      const hasPublisherRightsResults = validationReport.results.filter(r =>
        r.endpoint === 'computed fields' && r.field === 'hasPublisherRights computation'
      );
      expect(hasPublisherRightsResults.length).toBeGreaterThan(0);

      const passedResults = hasPublisherRightsResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(hasPublisherRightsResults.length);
    });

    it('should validate isGlobalDependency computation', () => {
      const isGlobalDependencyResults = validationReport.results.filter(r =>
        r.endpoint === 'computed fields' && r.field === 'isGlobalDependency computation'
      );
      expect(isGlobalDependencyResults.length).toBeGreaterThan(0);

      const passedResults = isGlobalDependencyResults.filter(r => r.status === 'pass');
      expect(passedResults.length).toBe(isGlobalDependencyResults.length);
    });
  });

  describe('Report Generation', () => {
    it('should generate JSON report', () => {
      const jsonReport = generateReportJson(validationReport);
      expect(jsonReport).toBeDefined();
      expect(typeof jsonReport).toBe('string');

      const parsed = JSON.parse(jsonReport);
      expect(parsed.summary).toBeDefined();
      expect(parsed.results).toBeInstanceOf(Array);
    });

    it('should generate markdown report', () => {
      const markdownReport = generateReportMarkdown(validationReport);
      expect(markdownReport).toBeDefined();
      expect(typeof markdownReport).toBe('string');
      expect(markdownReport).toContain('# API Field Mapping Validation Report');
      expect(markdownReport).toContain('## Summary');
      expect(markdownReport).toContain('## Results');
    });
  });

  describe('Validation Results Analysis', () => {
    it('should have high pass rate', () => {
      const report = validationReport.getReport();
      const passRate = report.summary.pass / report.summary.total;

      // Expect at least 80% pass rate for mock data validation
      expect(passRate).toBeGreaterThanOrEqual(0.8);
    });

    it('should identify any failed validations', () => {
      const report = validationReport.getReport();
      const failedResults = report.results.filter(r => r.status === 'fail');

      if (failedResults.length > 0) {
        console.warn('Failed validations found:', failedResults);
      }

      // For mock data, we expect most validations to pass
      expect(failedResults.length).toBeLessThanOrEqual(report.summary.total * 0.2);
    });
  });
});
