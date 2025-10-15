# Implementation Tasks: App Merge Middleware

## Current State Assessment

**Existing Infrastructure:**
- Vue 3 project with minimal structure (src/main.js, Application.vue)
- Gulp build system with Babel transpilation
- No test framework exists
- No middleware layer exists
- Dependencies: fliplet-core, vue 3.5.13

**What Needs to Be Built:**
- Complete middleware architecture with ~20 classes
- Test framework setup (Jest)
- API service layer wrapping Fliplet.API.request()
- Workflow controllers for merge orchestration
- State management, validation, and error handling
- Event system and utilities

## Relevant Files

### Core Foundation
- `src/middleware/core/ApiClient.js` - HTTP communication using Fliplet.API.request() with retry logic
- `src/middleware/core/ApiClient.test.js` - Unit tests for ApiClient
- `src/middleware/core/StateManager.js` - Temporary merge configuration state management
- `src/middleware/core/StateManager.test.js` - Unit tests for StateManager
- `src/middleware/core/ValidationEngine.js` - Client-side validation before API calls
- `src/middleware/core/ValidationEngine.test.js` - Unit tests for ValidationEngine
- `src/middleware/core/ErrorHandler.js` - Error transformation and user-friendly messaging
- `src/middleware/core/ErrorHandler.test.js` - Unit tests for ErrorHandler
- `src/middleware/core/BaseMiddleware.js` - Foundation class with common utilities
- `src/middleware/core/BaseMiddleware.test.js` - Unit tests for BaseMiddleware

### API Service Classes
- `src/middleware/api/AppsApiService.js` - Wrapper for app-related endpoints
- `src/middleware/api/AppsApiService.test.js` - Unit tests for AppsApiService
- `src/middleware/api/OrganizationsApiService.js` - Wrapper for organization endpoints
- `src/middleware/api/OrganizationsApiService.test.js` - Unit tests for OrganizationsApiService
- `src/middleware/api/PagesApiService.js` - Wrapper for pages/screens endpoints
- `src/middleware/api/PagesApiService.test.js` - Unit tests for PagesApiService
- `src/middleware/api/DataSourcesApiService.js` - Wrapper for data sources endpoints
- `src/middleware/api/DataSourcesApiService.test.js` - Unit tests for DataSourcesApiService
- `src/middleware/api/MediaApiService.js` - Wrapper for files/folders endpoints
- `src/middleware/api/MediaApiService.test.js` - Unit tests for MediaApiService
- `src/middleware/api/MergeApiService.js` - Wrapper for merge operation endpoints
- `src/middleware/api/MergeApiService.test.js` - Unit tests for MergeApiService

### Workflow Controllers
- `src/middleware/controllers/MergeConfigurationController.js` - Orchestrates multi-step configuration
- `src/middleware/controllers/MergeConfigurationController.test.js` - Unit tests for MergeConfigurationController
- `src/middleware/controllers/AppLockController.js` - Manages app locking lifecycle
- `src/middleware/controllers/AppLockController.test.js` - Unit tests for AppLockController
- `src/middleware/controllers/MergeExecutionController.js` - Initiates and monitors merge
- `src/middleware/controllers/MergeExecutionController.test.js` - Unit tests for MergeExecutionController
- `src/middleware/controllers/ValidationController.js` - Centralized validation logic
- `src/middleware/controllers/ValidationController.test.js` - Unit tests for ValidationController

### Utilities
- `src/middleware/utils/EventEmitter.js` - Event system for component communication
- `src/middleware/utils/EventEmitter.test.js` - Unit tests for EventEmitter
- `src/middleware/utils/DataMapper.js` - Transform API responses to internal models
- `src/middleware/utils/DataMapper.test.js` - Unit tests for DataMapper
- `src/middleware/utils/CacheManager.js` - API response caching with LRU eviction
- `src/middleware/utils/CacheManager.test.js` - Unit tests for CacheManager

### Configuration
- `src/middleware/config/endpoints.js` - API endpoint URL constants
- `src/middleware/config/validation-rules.js` - Validation rule definitions
- `src/middleware/config/error-messages.js` - User-friendly error message mappings
- `src/middleware/config/defaults.js` - Default configuration values

### Main Entry Point
- `src/middleware/middleware.js` - Main middleware entry point and initialization
- `src/middleware/middleware.test.js` - Unit tests for main middleware

### Test Infrastructure
- `jest.config.js` - Jest configuration with coverage thresholds
- `tests/setup.js` - Global test setup with Fliplet API mocks
- `tests/mocks/apps.json` - Sample app data for tests
- `tests/mocks/organizations.json` - Sample organization data for tests
- `tests/mocks/pages.json` - Sample page data with associations
- `tests/mocks/dataSources.json` - Sample data source data
- `tests/mocks/media.json` - Sample file and folder data
- `tests/mocks/mergeStatus.json` - Sample merge status responses

### Integration Tests
- `tests/integration/workflow-destination-selection.test.js` - Test destination app selection workflow
- `tests/integration/workflow-resource-configuration.test.js` - Test resource configuration workflow
- `tests/integration/workflow-merge-execution.test.js` - Test merge execution workflow
- `tests/integration/error-scenarios.test.js` - Test error handling scenarios

### Notes

- Unit tests should be colocated with the code files they test (e.g., `ApiClient.js` and `ApiClient.test.js` in the same directory)
- Use `npm test` to run all tests. Running without a path executes all tests found by Jest
- Use `npm run test:watch` for development with auto-rerun on file changes
- Use `npm run test:coverage` to generate coverage reports
- All middleware functions must follow behavior-parameterized design principles (no caller identification)

## Tasks

- [x] 1.0 Establish testing framework and infrastructure
  - [x] 1.1 Install Jest and testing dependencies (`jest`, `@types/jest`, `babel-jest`)
  - [x] 1.2 Create `jest.config.js` with jsdom environment, test match patterns, and coverage thresholds (80% for branches, functions, lines, statements)
  - [x] 1.3 Create `tests/setup.js` with global Fliplet API mocks (Fliplet.API.request, Fliplet.Env.get, Fliplet.Navigate.query)
  - [x] 1.4 Add npm scripts to package.json: `"test": "jest"`, `"test:watch": "jest --watch"`, `"test:coverage": "jest --coverage"`, `"test:verbose": "jest --verbose"`
  - [x] 1.5 Create `tests/mocks/` directory and add sample JSON files for apps, organizations, pages, dataSources, media, and mergeStatus
  - [x] 1.6 Create a sample test `tests/example.test.js` to verify Jest configuration runs successfully
  - [x] 1.7 Run `npm test` to ensure the test framework is working correctly

- [ ] 2.0 Implement core foundation classes
  - [ ] 2.1 Create `src/middleware/core/EventEmitter.js` first (needed by other classes)
    - [ ] 2.1.1 Implement basic event emitter with `on()`, `off()`, `emit()` methods
    - [ ] 2.1.2 Add support for one-time listeners with `once()` method
    - [ ] 2.1.3 Add JSDoc documentation for all public methods
    - [ ] 2.1.4 Create `src/middleware/utils/EventEmitter.test.js` with tests for all methods
  - [ ] 2.2 Create `src/middleware/core/ApiClient.js`
    - [ ] 2.2.1 Implement constructor checking for Fliplet.Navigate.query.apiUrl and auth_token
    - [ ] 2.2.2 Implement `request(method, endpoint, data, options)` method using Fliplet.API.request()
    - [ ] 2.2.3 Implement `buildRequestUrl()` handling both custom apiUrl and default cases
    - [ ] 2.2.4 Implement `buildRequestHeaders()` with custom auth token support
    - [ ] 2.2.5 Implement `executeWithRetry()` with exponential backoff (no retry on 4xx errors)
    - [ ] 2.2.6 Implement `delay(ms)` helper for retry delays
    - [ ] 2.2.7 Add comprehensive JSDoc documentation
    - [ ] 2.2.8 Create `ApiClient.test.js` with tests for all methods and error scenarios
  - [ ] 2.3 Create `src/middleware/core/ErrorHandler.js`
    - [ ] 2.3.1 Implement `transformError(error, options)` to create user-friendly error objects
    - [ ] 2.3.2 Implement `getErrorMessage(errorCode, context)` to map error codes to messages
    - [ ] 2.3.3 Implement `logError(error, options)` for error logging
    - [ ] 2.3.4 Define error categories constants (validation, api, network, permission)
    - [ ] 2.3.5 Add JSDoc documentation
    - [ ] 2.3.6 Create `ErrorHandler.test.js` with tests for all error types
  - [ ] 2.4 Create `src/middleware/core/StateManager.js`
    - [ ] 2.4.1 Implement constructor initializing state schema (mergeConfiguration, lockStatus, mergeStatus, validationState, cache)
    - [ ] 2.4.2 Implement `getState(path)` to retrieve state by path (e.g., 'mergeConfiguration.sourceApp')
    - [ ] 2.4.3 Implement `setState(path, value)` to update state immutably
    - [ ] 2.4.4 Implement `clearState()` to reset all state
    - [ ] 2.4.5 Implement `validateStateTransition(from, to)` to check valid transitions
    - [ ] 2.4.6 Integrate EventEmitter to emit 'state:change' events on updates
    - [ ] 2.4.7 Add JSDoc documentation
    - [ ] 2.4.8 Create `StateManager.test.js` with tests for state operations and transitions
  - [ ] 2.5 Create `src/middleware/core/ValidationEngine.js`
    - [ ] 2.5.1 Implement `validateAppSelection(sourceAppId, destinationAppId)` for basic validation
    - [ ] 2.5.2 Implement `validateResourceSelection(config)` to check at least one resource selected
    - [ ] 2.5.3 Implement `validateDataTypes(config)` to check ID types and data structures
    - [ ] 2.5.4 Implement `validateConstraints(config)` for business rule validation
    - [ ] 2.5.5 Implement `getValidationErrors()` to return list of validation errors
    - [ ] 2.5.6 Add JSDoc documentation
    - [ ] 2.5.7 Create `ValidationEngine.test.js` with tests for all validation scenarios
  - [ ] 2.6 Create `src/middleware/core/BaseMiddleware.js`
    - [ ] 2.6.1 Implement constructor accepting dependencies and configuration
    - [ ] 2.6.2 Implement `initialize(config)` to configure middleware
    - [ ] 2.6.3 Implement `getDependency(name)` to retrieve injected dependencies
    - [ ] 2.6.4 Implement `emit(event, data)` wrapper for event emission
    - [ ] 2.6.5 Add JSDoc documentation
    - [ ] 2.6.6 Create `BaseMiddleware.test.js` with tests for initialization and dependency injection

- [ ] 3.0 Implement API service classes
  - [ ] 3.1 Create `src/middleware/api/AppsApiService.js`
    - [ ] 3.1.1 Implement constructor accepting ApiClient dependency
    - [ ] 3.1.2 Implement `fetchApps(options)` with organizationId, filters, fields, sort, pagination, cache options
    - [ ] 3.1.3 Implement `fetchApp(appId, options)` with fields and cache options
    - [ ] 3.1.4 Implement `checkDuplicates(appId, options)` calling POST /v1/apps/:appId/duplicates
    - [ ] 3.1.5 Implement `lockApp(sourceAppId, options)` calling POST /v1/apps/:appId/lock
    - [ ] 3.1.6 Implement `unlockApp(sourceAppId, options)` calling POST /v1/apps/:appId/unlock
    - [ ] 3.1.7 Implement `extendLock(sourceAppId, options)` calling POST /v1/apps/:appId/lock/extend
    - [ ] 3.1.8 Implement helper methods for building query strings and transforming responses
    - [ ] 3.1.9 Add comprehensive JSDoc documentation with option parameter descriptions
    - [ ] 3.1.10 Create `AppsApiService.test.js` with tests for all methods and option combinations
  - [ ] 3.2 Create `src/middleware/api/OrganizationsApiService.js`
    - [ ] 3.2.1 Implement constructor accepting ApiClient dependency
    - [ ] 3.2.2 Implement `fetchOrganizations(options)` calling GET /v1/organizations with fields, sort, cache
    - [ ] 3.2.3 Implement `fetchOrganization(organizationId, options)` with fields and cache
    - [ ] 3.2.4 Implement `fetchUserApps(organizationId, userId, options)` calling GET /v1/organizations/:orgId/users/:userId/apps with filters
    - [ ] 3.2.5 Add JSDoc documentation
    - [ ] 3.2.6 Create `OrganizationsApiService.test.js` with tests for all methods
  - [ ] 3.3 Create `src/middleware/api/PagesApiService.js`
    - [ ] 3.3.1 Implement constructor accepting ApiClient dependency
    - [ ] 3.3.2 Implement `fetchPages(appId, options)` calling GET /v1/apps/:appId/pages with include, fields, filters, sort, pagination
    - [ ] 3.3.3 Implement `fetchPage(appId, pageId, options)` with include, fields, cache
    - [ ] 3.3.4 Implement `fetchPagePreview(appId, pageId, options)` calling preview endpoint
    - [ ] 3.3.5 Implement query string builder for include parameter (associatedDS, associatedFiles)
    - [ ] 3.3.6 Add JSDoc documentation
    - [ ] 3.3.7 Create `PagesApiService.test.js` with tests for all methods and include options
  - [ ] 3.4 Create `src/middleware/api/DataSourcesApiService.js`
    - [ ] 3.4.1 Implement constructor accepting ApiClient dependency
    - [ ] 3.4.2 Implement `fetchDataSources(appId, options)` calling GET /v1/data-sources with include, includeInUse, filters, fields, sort, pagination
    - [ ] 3.4.3 Implement `fetchDataSource(dataSourceId, options)` with appId, include, fields, cache
    - [ ] 3.4.4 Implement filtering for standard data sources only (type=null)
    - [ ] 3.4.5 Add JSDoc documentation
    - [ ] 3.4.6 Create `DataSourcesApiService.test.js` with tests for all methods
  - [ ] 3.5 Create `src/middleware/api/MediaApiService.js`
    - [ ] 3.5.1 Implement constructor accepting ApiClient dependency
    - [ ] 3.5.2 Implement `fetchMedia(appId, options)` calling GET /v1/media with include, filters, fields, sort, pagination
    - [ ] 3.5.3 Implement `fetchFile(fileId, options)` with appId, include, fields, cache
    - [ ] 3.5.4 Implement `fetchFolder(folderId, options)` with appId, include, fields, cache
    - [ ] 3.5.5 Add JSDoc documentation
    - [ ] 3.5.6 Create `MediaApiService.test.js` with tests for all methods
  - [ ] 3.6 Create `src/middleware/api/MergeApiService.js`
    - [ ] 3.6.1 Implement constructor accepting ApiClient dependency
    - [ ] 3.6.2 Implement `lockApps(sourceAppId, options)` with targetApp and lockDuration
    - [ ] 3.6.3 Implement `unlockApps(sourceAppId, options)` with targetApp
    - [ ] 3.6.4 Implement `extendLock(sourceAppId, options)` with targetApp and extendDuration
    - [ ] 3.6.5 Implement `previewMerge(sourceAppId, mergeConfig)` calling POST /v1/apps/:appId/merge/preview
    - [ ] 3.6.6 Implement `initiateMerge(sourceAppId, mergeConfig)` calling POST /v1/apps/:appId/merge
    - [ ] 3.6.7 Implement `getMergeStatus(sourceAppId, options)` calling POST /v1/apps/:appId/merge/status
    - [ ] 3.6.8 Implement `fetchMergeLogs(appId, options)` calling POST /v1/apps/:appId/logs
    - [ ] 3.6.9 Add JSDoc documentation with mergeConfig structure details
    - [ ] 3.6.10 Create `MergeApiService.test.js` with tests for all methods

- [ ] 4.0 Implement workflow controller classes
  - [ ] 4.1 Create `src/middleware/controllers/ValidationController.js`
    - [ ] 4.1.1 Implement constructor accepting AppsApiService and ValidationEngine dependencies
    - [ ] 4.1.2 Implement `validateAppForMerge(appId, options)` orchestrating multiple validations
    - [ ] 4.1.3 Implement `checkDuplicates(appId, options)` calling AppsApiService.checkDuplicates
    - [ ] 4.1.4 Implement `validateConfiguration(mergeConfig, options)` for complete config validation
    - [ ] 4.1.5 Implement `validatePermissions(appId, options)` checking publisher role
    - [ ] 4.1.6 Implement `checkPlanLimits(destinationAppId, mergeConfig, options)` for plan validation
    - [ ] 4.1.7 Add JSDoc documentation
    - [ ] 4.1.8 Create `ValidationController.test.js` with tests for all validation scenarios
  - [ ] 4.2 Create `src/middleware/controllers/AppLockController.js`
    - [ ] 4.2.1 Implement constructor accepting MergeApiService and StateManager dependencies
    - [ ] 4.2.2 Implement `lockApps(sourceAppId, destinationAppId, options)` with duration and autoExtend
    - [ ] 4.2.3 Implement `unlockApps(sourceAppId, destinationAppId)` for manual unlock
    - [ ] 4.2.4 Implement `extendLock(sourceAppId, destinationAppId, options)` with additionalDuration
    - [ ] 4.2.5 Implement `checkLockStatus(appId)` to retrieve current lock status
    - [ ] 4.2.6 Implement `monitorLockExpiration(appId, options)` with warning thresholds and auto-extend
    - [ ] 4.2.7 Implement timer management for auto-extension when activity detected
    - [ ] 4.2.8 Emit events for lock acquired, extended, expiring, expired, released
    - [ ] 4.2.9 Add JSDoc documentation
    - [ ] 4.2.10 Create `AppLockController.test.js` with tests for lock lifecycle and events
  - [ ] 4.3 Create `src/middleware/controllers/MergeConfigurationController.js`
    - [ ] 4.3.1 Implement constructor accepting all API services, StateManager, ValidationController, AppLockController, EventEmitter
    - [ ] 4.3.2 Implement `startConfiguration(sourceAppId, options)` to initialize configuration workflow
    - [ ] 4.3.3 Implement `validateStep(stepName, options)` for step-specific validation
    - [ ] 4.3.4 Implement `proceedToNextStep(options)` with auto-validation
    - [ ] 4.3.5 Implement `returnToPreviousStep(options)` with state preservation
    - [ ] 4.3.6 Implement `cancelConfiguration(options)` with auto-unlock and state clearing
    - [ ] 4.3.7 Implement `getConfiguration(options)` returning complete or summary format
    - [ ] 4.3.8 Implement workflow orchestration for destination selection step
    - [ ] 4.3.9 Implement workflow orchestration for resource configuration step
    - [ ] 4.3.10 Emit events for configuration state changes
    - [ ] 4.3.11 Add comprehensive JSDoc documentation
    - [ ] 4.3.12 Create `MergeConfigurationController.test.js` with tests for complete workflow
  - [ ] 4.4 Create `src/middleware/controllers/MergeExecutionController.js`
    - [ ] 4.4.1 Implement constructor accepting MergeApiService, StateManager, EventEmitter
    - [ ] 4.4.2 Implement `initiateMerge(sourceAppId, mergeConfig, options)` calling MergeApiService.initiateMerge
    - [ ] 4.4.3 Implement `monitorProgress(sourceAppId, mergeId, options)` with WebSocket support
    - [ ] 4.4.4 Implement polling fallback when WebSocket unavailable
    - [ ] 4.4.5 Implement `getMergeResult(sourceAppId, mergeId, options)` for final results
    - [ ] 4.4.6 Implement `fetchLogs(appId, mergeId, options)` for merge audit logs
    - [ ] 4.4.7 Emit events for merge initiated, progress, stage-complete, complete, error
    - [ ] 4.4.8 Handle automatic app unlocking on completion or error
    - [ ] 4.4.9 Add JSDoc documentation
    - [ ] 4.4.10 Create `MergeExecutionController.test.js` with tests for execution workflow

- [ ] 5.0 Implement supporting utilities and configuration
  - [ ] 5.1 Create `src/middleware/utils/EventEmitter.js` (if not already done in 2.1)
  - [ ] 5.2 Create `src/middleware/utils/DataMapper.js`
    - [ ] 5.2.1 Implement `transformAppResponse(apiResponse, options)` filtering by fields parameter
    - [ ] 5.2.2 Implement `transformPageResponse(apiResponse, options)` with association handling
    - [ ] 5.2.3 Implement `transformDataSourceResponse(apiResponse, options)` with filters
    - [ ] 5.2.4 Implement `transformMediaResponse(apiResponse, options)` for files/folders
    - [ ] 5.2.5 Implement `buildApiRequest(internalModel)` converting to API format
    - [ ] 5.2.6 Add JSDoc documentation
    - [ ] 5.2.7 Create `DataMapper.test.js` with tests for all transformations
  - [ ] 5.3 Create `src/middleware/utils/CacheManager.js`
    - [ ] 5.3.1 Implement constructor with maxSize and defaultTTL configuration
    - [ ] 5.3.2 Implement `generateCacheKey(endpoint, options)` creating deterministic keys from parameters
    - [ ] 5.3.3 Implement `get(key)` retrieving cached data if not expired
    - [ ] 5.3.4 Implement `set(key, data, ttl)` storing data with expiration
    - [ ] 5.3.5 Implement `clear()` to empty entire cache
    - [ ] 5.3.6 Implement LRU eviction when maxSize exceeded
    - [ ] 5.3.7 Add JSDoc documentation
    - [ ] 5.3.8 Create `CacheManager.test.js` with tests for caching and eviction
  - [ ] 5.4 Create `src/middleware/config/endpoints.js`
    - [ ] 5.4.1 Define constants for all API endpoints (apps, organizations, pages, dataSources, media, merge)
    - [ ] 5.4.2 Export endpoint templates with parameter placeholders (e.g., '/v1/apps/:appId')
    - [ ] 5.4.3 Add JSDoc comments documenting each endpoint
  - [ ] 5.5 Create `src/middleware/config/validation-rules.js`
    - [ ] 5.5.1 Define validation rules for app selection (sourceAppId !== destinationAppId, etc.)
    - [ ] 5.5.2 Define validation rules for resource selection (at least one resource, etc.)
    - [ ] 5.5.3 Define business rules (duplicate names, permissions, locking, plan limits)
    - [ ] 5.5.4 Export validation rule objects
  - [ ] 5.6 Create `src/middleware/config/error-messages.js`
    - [ ] 5.6.1 Define user-friendly error messages for validation errors
    - [ ] 5.6.2 Define error messages for duplicate errors
    - [ ] 5.6.3 Define error messages for permission errors
    - [ ] 5.6.4 Define error messages for lock errors
    - [ ] 5.6.5 Define error messages for plan limit errors
    - [ ] 5.6.6 Define error messages for API errors
    - [ ] 5.6.7 Export error message mappings by error code
  - [ ] 5.7 Create `src/middleware/config/defaults.js`
    - [ ] 5.7.1 Define default API configuration (timeout: 30000, retryAttempts: 3, retryDelay: 1000)
    - [ ] 5.7.2 Define default lock configuration (defaultDuration: 600, autoExtend: true, etc.)
    - [ ] 5.7.3 Define default merge configuration (enableWebSocket: true, pollInterval: 2000, etc.)
    - [ ] 5.7.4 Define default cache configuration (enabled: true, defaultTTL: 300000, maxSize: 100)
    - [ ] 5.7.5 Define default validation configuration (level: 'strict', blockOnError: true, etc.)
    - [ ] 5.7.6 Export default configuration object

- [ ] 6.0 Create main middleware entry point and integration tests
  - [ ] 6.1 Create `src/middleware/middleware.js`
    - [ ] 6.1.1 Implement main AppMergeMiddleware class constructor accepting configuration
    - [ ] 6.1.2 Initialize all core foundation classes (ApiClient, StateManager, ValidationEngine, ErrorHandler)
    - [ ] 6.1.3 Initialize all API service classes with ApiClient dependency
    - [ ] 6.1.4 Initialize all workflow controllers with their dependencies
    - [ ] 6.1.5 Initialize utilities (EventEmitter, DataMapper, CacheManager)
    - [ ] 6.1.6 Implement `initialize(config)` method merging user config with defaults
    - [ ] 6.1.7 Implement public API methods delegating to controllers (e.g., startConfiguration, initiateMerge)
    - [ ] 6.1.8 Implement event subscription methods for UI integration
    - [ ] 6.1.9 Add comprehensive JSDoc documentation with usage examples
    - [ ] 6.1.10 Create `middleware.test.js` with unit tests for initialization and delegation
  - [ ] 6.2 Create integration test: `tests/integration/workflow-destination-selection.test.js`
    - [ ] 6.2.1 Test complete destination selection workflow (fetch orgs → select org → fetch apps → check duplicates → validate → lock)
    - [ ] 6.2.2 Test error scenario: duplicate detection blocking selection
    - [ ] 6.2.3 Test error scenario: permission validation failure
    - [ ] 6.2.4 Test error scenario: lock failure
  - [ ] 6.3 Create integration test: `tests/integration/workflow-resource-configuration.test.js`
    - [ ] 6.3.1 Test resource fetching workflow (pages, data sources, media)
    - [ ] 6.3.2 Test resource selection and state updates
    - [ ] 6.3.3 Test lock monitoring and auto-extension
    - [ ] 6.3.4 Test error scenario: resource fetch failure
    - [ ] 6.3.5 Test error scenario: lock expiration during configuration
  - [ ] 6.4 Create integration test: `tests/integration/workflow-merge-execution.test.js`
    - [ ] 6.4.1 Test preview generation workflow
    - [ ] 6.4.2 Test merge initiation workflow
    - [ ] 6.4.3 Test progress monitoring with polling
    - [ ] 6.4.4 Test completion handling and app unlocking
    - [ ] 6.4.5 Test error scenario: merge failure and error recovery
  - [ ] 6.5 Create integration test: `tests/integration/error-scenarios.test.js`
    - [ ] 6.5.1 Test network error handling and retry logic
    - [ ] 6.5.2 Test validation error handling
    - [ ] 6.5.3 Test permission error handling
    - [ ] 6.5.4 Test conflict detection and resolution
  - [ ] 6.6 Run full test suite with coverage
    - [ ] 6.6.1 Execute `npm run test:coverage` and verify >80% coverage for all metrics
    - [ ] 6.6.2 Review coverage report and add tests for any uncovered branches
    - [ ] 6.6.3 Ensure all critical paths have 100% coverage
  - [ ] 6.7 Create documentation: `docs/middleware-usage.md`
    - [ ] 6.7.1 Document middleware initialization and configuration
    - [ ] 6.7.2 Document public API methods with examples
    - [ ] 6.7.3 Document event system and available events
    - [ ] 6.7.4 Document behavior-parameterized design principles
    - [ ] 6.7.5 Include troubleshooting section for common issues

## Implementation Notes

### Critical Design Principles

**Behavior-Parameterized Design:**
- ALL middleware functions must accept options objects describing *what behavior is needed*
- NEVER accept parameters identifying *who is calling* (e.g., no `callerType`, `stepName`, `viewMode`)
- Examples:
  - ✓ Good: `fetchApps({ fields: ['id', 'name'], filters: { publisher: true } })`
  - ❌ Bad: `fetchApps(orgId, 'destination-selector')`

**Cache Keys Must Be Deterministic:**
- Cache keys derived from request parameters only, not caller context
- Example: `"v1/apps:{'organizationId':123,'filters':{'publisher':true}}"`

**State Structure:**
- State is temporary and cleared on cancel/complete
- No persistence to localStorage or backend
- State transitions must be validated

**Testing Requirements:**
- Test behavioral options, not caller types
- Verify determinism (same options = same result)
- Test edge cases (empty options, max options, invalid combinations)
- Mock Fliplet.API.request in all tests

### Implementation Order

Follow the task order strictly:
1. Set up tests first (TDD approach)
2. Build foundation classes (they're dependencies for everything else)
3. Build API services (they wrap the REST endpoints)
4. Build controllers (they orchestrate API services)
5. Build utilities and config
6. Wire everything together in main entry point

### Definition of Done for Each Task

- [ ] Code implemented following behavior-parameterized design
- [ ] Comprehensive JSDoc documentation added
- [ ] Unit tests written and passing
- [ ] Code reviewed against anti-patterns (no caller identification)
- [ ] Validated against design checklist (could this serve unknown callers?)
