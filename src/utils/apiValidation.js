/**
 * API Field Mapping Validation Utilities
 *
 * Provides functions to validate field mappings against actual API responses
 * and mock data to ensure consistency between API and UI expectations
 */

import { mapAppFields, mapDataSourceFields, mapPageFields, mapMediaFields, mapOrganizationFields } from './apiFieldMapping.js';
import { isLocked, hasPublisherRights, isGlobalDependency, isPublished } from './computedFields.js';

/**
 * Validation result structure
 */
class ValidationResult {
  constructor(endpoint, field, expected, actual, status = 'unknown') {
    this.endpoint = endpoint;
    this.field = field;
    this.expected = expected;
    this.actual = actual;
    this.status = status; // 'pass', 'fail', 'unknown'
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Validation report structure
 */
class ValidationReport {
  constructor() {
    this.results = [];
    this.summary = {
      total: 0,
      pass: 0,
      fail: 0,
      unknown: 0
    };
  }

  addResult(result) {
    this.results.push(result);
    this.summary.total++;
    if (this.summary.hasOwnProperty(result.status)) {
      this.summary[result.status]++;
    }
  }

  getReport() {
    return {
      summary: this.summary,
      results: this.results,
      generatedAt: new Date().toISOString()
    };
  }
}

/**
 * Validate app field mappings
 * @param {Object} rawApp - Raw app object from API
 * @param {Object} options - Validation options
 * @returns {Array<ValidationResult>} Validation results
 */
export function validateAppFields(rawApp, options = {}) {
  const results = [];
  const mappedApp = mapAppFields(rawApp, options);

  // Test productionAppId → isPublished mapping
  results.push(new ValidationResult(
    'GET /v1/apps/:appId',
    'productionAppId → isPublished',
    !!rawApp.productionAppId,
    mappedApp.isPublished,
    !!rawApp.productionAppId === mappedApp.isPublished ? 'pass' : 'fail'
  ));

  // Test updatedAt field exists
  results.push(new ValidationResult(
    'GET /v1/apps/:appId',
    'updatedAt field exists',
    true,
    !!rawApp.updatedAt,
    !!rawApp.updatedAt ? 'pass' : 'fail'
  ));

  // Test updatedBy field does not exist (per feedback)
  results.push(new ValidationResult(
    'GET /v1/apps/:appId',
    'updatedBy field does not exist',
    false,
    !!rawApp.updatedBy,
    !rawApp.updatedBy ? 'pass' : 'fail'
  ));

  // Test organizationId field exists
  results.push(new ValidationResult(
    'GET /v1/apps/:appId',
    'organizationId field exists',
    true,
    !!rawApp.organizationId,
    !!rawApp.organizationId ? 'pass' : 'fail'
  ));

  // Test users array structure for publisher rights
  if (rawApp.users && Array.isArray(rawApp.users)) {
    const hasValidUserStructure = rawApp.users.every(user =>
      user.email && typeof user.userRoleId === 'number'
    );
    results.push(new ValidationResult(
      'GET /v1/apps/:appId',
      'users array structure',
      true,
      hasValidUserStructure,
      hasValidUserStructure ? 'pass' : 'fail'
    ));
  }

  return results;
}

/**
 * Validate data source field mappings
 * @param {Object} rawDataSource - Raw data source object from API
 * @returns {Array<ValidationResult>} Validation results
 */
export function validateDataSourceFields(rawDataSource) {
  const results = [];
  const mappedDataSource = mapDataSourceFields(rawDataSource);

  // Test entriesCount → entryCount mapping
  results.push(new ValidationResult(
    'GET /v1/data-sources?appId=X',
    'entriesCount → entryCount',
    rawDataSource.entriesCount || 0,
    mappedDataSource.entryCount,
    (rawDataSource.entriesCount || 0) === mappedDataSource.entryCount ? 'pass' : 'fail'
  ));

  // Test associatedPages field name
  results.push(new ValidationResult(
    'GET /v1/data-sources?appId=X',
    'associatedPages field name',
    'associatedPages',
    rawDataSource.hasOwnProperty('associatedPages') ? 'associatedPages' : 'missing',
    rawDataSource.hasOwnProperty('associatedPages') ? 'pass' : 'fail'
  ));

  // Test associatedPages → associatedScreens mapping
  results.push(new ValidationResult(
    'GET /v1/data-sources?appId=X',
    'associatedPages → associatedScreens',
    rawDataSource.associatedPages || [],
    mappedDataSource.associatedScreens,
    JSON.stringify(rawDataSource.associatedPages || []) === JSON.stringify(mappedDataSource.associatedScreens) ? 'pass' : 'fail'
  ));

  return results;
}

/**
 * Validate page/screen field mappings
 * @param {Object} rawPage - Raw page object from API
 * @returns {Array<ValidationResult>} Validation results
 */
export function validatePageFields(rawPage) {
  const results = [];
  const mappedPage = mapPageFields(rawPage);

  // Test associatedDS field name
  results.push(new ValidationResult(
    'GET /v1/apps/:appId/pages',
    'associatedDS field name',
    'associatedDS',
    rawPage.hasOwnProperty('associatedDS') ? 'associatedDS' : 'missing',
    rawPage.hasOwnProperty('associatedDS') ? 'pass' : 'fail'
  ));

  // Test associatedFiles field name
  results.push(new ValidationResult(
    'GET /v1/apps/:appId/pages',
    'associatedFiles field name',
    'associatedFiles',
    rawPage.hasOwnProperty('associatedFiles') ? 'associatedFiles' : 'missing',
    rawPage.hasOwnProperty('associatedFiles') ? 'pass' : 'fail'
  ));

  // Test associatedDS → associatedDataSources mapping
  results.push(new ValidationResult(
    'GET /v1/apps/:appId/pages',
    'associatedDS → associatedDataSources',
    rawPage.associatedDS || [],
    mappedPage.associatedDataSources,
    JSON.stringify(rawPage.associatedDS || []) === JSON.stringify(mappedPage.associatedDataSources) ? 'pass' : 'fail'
  ));

  return results;
}

/**
 * Validate media field mappings
 * @param {Object} rawMedia - Raw media response from API
 * @returns {Array<ValidationResult>} Validation results
 */
export function validateMediaFields(rawMedia) {
  const results = [];
  const mappedMedia = mapMediaFields(rawMedia);

  // Test files array exists
  results.push(new ValidationResult(
    'GET /v1/media?appId=X',
    'files array exists',
    true,
    Array.isArray(rawMedia.files),
    Array.isArray(rawMedia.files) ? 'pass' : 'fail'
  ));

  // Test folders array exists
  results.push(new ValidationResult(
    'GET /v1/media?appId=X',
    'folders array exists',
    true,
    Array.isArray(rawMedia.folders),
    Array.isArray(rawMedia.folders) ? 'pass' : 'fail'
  ));

  // Test merged array structure
  const expectedLength = (rawMedia.files?.length || 0) + (rawMedia.folders?.length || 0);
  results.push(new ValidationResult(
    'GET /v1/media?appId=X',
    'merged files/folders array length',
    expectedLength,
    mappedMedia.length,
    expectedLength === mappedMedia.length ? 'pass' : 'fail'
  ));

  // Test type field assignment
  if (rawMedia.folders && rawMedia.folders.length > 0) {
    const folderTypes = mappedMedia.filter(item => item.type === 'folder');
    results.push(new ValidationResult(
      'GET /v1/media?appId=X',
      'folder type assignment',
      rawMedia.folders.length,
      folderTypes.length,
      rawMedia.folders.length === folderTypes.length ? 'pass' : 'fail'
    ));
  }

  return results;
}

/**
 * Validate merge API field mappings
 * @param {Object} rawMergeStatus - Raw merge status response
 * @returns {Array<ValidationResult>} Validation results
 */
export function validateMergeFields(rawMergeStatus) {
  const results = [];

  // Test status values are "copy" and "overwrite" only (no "conflict")
  if (rawMergeStatus.status) {
    const validStatuses = ['copy', 'overwrite', 'not_started', 'in_progress', 'completed', 'error'];
    results.push(new ValidationResult(
      'POST /v1/apps/:appId/merge/status',
      'status values',
      'valid status',
      validStatuses.includes(rawMergeStatus.status),
      validStatuses.includes(rawMergeStatus.status) ? 'pass' : 'fail'
    ));
  }

  // Test limitWarnings field exists
  results.push(new ValidationResult(
    'POST /v1/apps/:appId/merge/status',
    'limitWarnings field',
    true,
    rawMergeStatus.hasOwnProperty('limitWarnings'),
    rawMergeStatus.hasOwnProperty('limitWarnings') ? 'pass' : 'fail'
  ));

  return results;
}

/**
 * Validate computed fields
 * @param {Object} testData - Test data object
 * @returns {Array<ValidationResult>} Validation results
 */
export function validateComputedFields(testData) {
  const results = [];

  // Test isLocked computation
  if (testData.app && testData.app.lockedUntil !== undefined) {
    const expectedLocked = testData.app.lockedUntil && new Date(testData.app.lockedUntil).getTime() > Date.now();
    const actualLocked = isLocked(testData.app.lockedUntil);
    results.push(new ValidationResult(
      'computed fields',
      'isLocked computation',
      expectedLocked,
      actualLocked,
      expectedLocked === actualLocked ? 'pass' : 'fail'
    ));
  }

  // Test hasPublisherRights computation
  if (testData.app && testData.currentUser) {
    const expectedRights = testData.app.users?.some(user =>
      user.email === testData.currentUser.email && user.userRoleId === 1
    ) || false;
    const actualRights = hasPublisherRights(testData.app, testData.currentUser);
    results.push(new ValidationResult(
      'computed fields',
      'hasPublisherRights computation',
      expectedRights,
      actualRights,
      expectedRights === actualRights ? 'pass' : 'fail'
    ));
  }

  // Test isGlobalDependency computation
  if (testData.dataSource) {
    const expectedGlobal = !testData.dataSource.associatedPages || testData.dataSource.associatedPages.length === 0;
    const actualGlobal = isGlobalDependency(testData.dataSource);
    results.push(new ValidationResult(
      'computed fields',
      'isGlobalDependency computation',
      expectedGlobal,
      actualGlobal,
      expectedGlobal === actualGlobal ? 'pass' : 'fail'
    ));
  }

  return results;
}

/**
 * Run comprehensive validation against mock data
 * @param {Object} mockData - Mock data object
 * @returns {ValidationReport} Validation report
 */
export function validateMockData(mockData) {
  const report = new ValidationReport();

  // Validate apps
  if (mockData.apps) {
    mockData.apps.forEach(app => {
      const results = validateAppFields(app);
      results.forEach(result => report.addResult(result));
    });
  }

  // Validate data sources
  if (mockData.dataSources) {
    mockData.dataSources.forEach(dataSource => {
      const results = validateDataSourceFields(dataSource);
      results.forEach(result => report.addResult(result));
    });
  }

  // Validate pages
  if (mockData.pages) {
    mockData.pages.forEach(page => {
      const results = validatePageFields(page);
      results.forEach(result => report.addResult(result));
    });
  }

  // Validate media
  if (mockData.media) {
    const results = validateMediaFields(mockData.media);
    results.forEach(result => report.addResult(result));
  }

  // Validate merge status
  if (mockData.mergeStatus) {
    mockData.mergeStatus.forEach(status => {
      const results = validateMergeFields(status);
      results.forEach(result => report.addResult(result));
    });
  }

  // Validate computed fields
  if (mockData.testData) {
    const results = validateComputedFields(mockData.testData);
    results.forEach(result => report.addResult(result));
  }

  return report;
}

/**
 * Create test data for computed field validation
 * @returns {Object} Test data object
 */
export function createTestData() {
  return {
    app: {
      id: 1,
      name: 'Test App',
      lockedUntil: new Date(Date.now() + 600000).toISOString(), // 10 minutes from now
      users: [
        { email: 'test@example.com', userRoleId: 1 },
        { email: 'editor@example.com', userRoleId: 2 }
      ]
    },
    currentUser: {
      email: 'test@example.com'
    },
    dataSource: {
      id: 1,
      name: 'Test Data Source',
      associatedPages: [] // Empty array = global dependency
    }
  };
}

/**
 * Generate validation report as JSON string
 * @param {ValidationReport} report - Validation report
 * @returns {string} JSON string
 */
export function generateReportJson(report) {
  return JSON.stringify(report.getReport(), null, 2);
}

/**
 * Generate validation report as markdown
 * @param {ValidationReport} report - Validation report
 * @returns {string} Markdown string
 */
export function generateReportMarkdown(report) {
  const data = report.getReport();

  let markdown = `# API Field Mapping Validation Report\n\n`;
  markdown += `Generated: ${data.generatedAt}\n\n`;

  markdown += `## Summary\n\n`;
  markdown += `- **Total Tests**: ${data.summary.total}\n`;
  markdown += `- **Passed**: ${data.summary.pass}\n`;
  markdown += `- **Failed**: ${data.summary.fail}\n`;
  markdown += `- **Unknown**: ${data.summary.unknown}\n\n`;

  markdown += `## Results\n\n`;

  // Group results by endpoint
  const groupedResults = data.results.reduce((acc, result) => {
    if (!acc[result.endpoint]) {
      acc[result.endpoint] = [];
    }
    acc[result.endpoint].push(result);
    return acc;
  }, {});

  Object.entries(groupedResults).forEach(([endpoint, results]) => {
    markdown += `### ${endpoint}\n\n`;
    results.forEach(result => {
      const status = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '❓';
      markdown += `- ${status} **${result.field}**: Expected \`${JSON.stringify(result.expected)}\`, Got \`${JSON.stringify(result.actual)}\`\n`;
    });
    markdown += '\n';
  });

  return markdown;
}
