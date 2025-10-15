# Middleware Architecture Plan: App Merge Widget

## Overview

This middleware system provides the data access and business logic layer for the App Merge Widget in Fliplet Studio. It abstracts REST API calls, enforces workflow validation, manages temporary state during the merge configuration process, and provides real-time status updates. The middleware is designed to be caller-agnostic, supporting any UI component through behavior-parameterized interfaces.

## System Architecture

### Core Principles

**Foundation Philosophy:**
- **Behavior-Parameterized Design**: Middleware accepts parameters describing *what behavior is needed*, never *who is calling*
- **Caller-Agnostic Implementation**: No coupling to specific UI contexts, screens, or device types
- **Intent-Based Signatures**: Function parameters express behavioral options, not caller identity
- **Explicit Over Implicit**: All behavior must be explicitly requested through parameters, no magic defaults based on caller assumptions
- **Design-Time Awareness, Runtime Agnosticism**: Review PRD/specs to understand usage patterns, but never hardcode assumptions about callers

**Reference:** See `docs/middleware-dev-guidelines.md` for detailed philosophy and examples.

**Architecture Principles:**
- **Workflow Enforcement**: Multi-step merge configuration process enforced through state validation
- **Data Integrity**: Client-side validation before API calls, server response validation
- **State Management**: Temporary in-memory state for merge configuration (no persistence until merge initiation)
- **Error Handling**: Consistent error transformation and user-friendly messaging
- **API Abstraction**: All REST API calls wrapped with behavioral interfaces using Fliplet.API.request()

### Component Hierarchy

```
AppMergeMiddleware (entry point)
├── Core Foundation
│   ├── ApiClient (HTTP communication via Fliplet.API.request())
│   ├── StateManager (temporary merge configuration state)
│   ├── ValidationEngine (client-side validation)
│   └── ErrorHandler (error transformation)
│
├── API Service Classes
│   ├── AppsApiService (app listing, details, locking)
│   ├── OrganizationsApiService (org listing)
│   ├── PagesApiService (screens with associations)
│   ├── DataSourcesApiService (data sources with associations)
│   ├── MediaApiService (files and folders with associations)
│   └── MergeApiService (merge operations, status, preview)
│
└── Workflow Controllers
    ├── MergeConfigurationController (orchestrates multi-step config)
    ├── AppLockController (manages app locking lifecycle)
    ├── MergeExecutionController (initiates and monitors merge)
    └── ValidationController (duplicate checks, permissions, limits)
```

### Middleware Design Principles

#### Intent-Based Function Signatures

**DO:** Accept parameters that describe *what behavior is needed*
```javascript
// ✓ Behavior-driven parameters
fetchApps(options = {
  organizationId: 123,
  filters: { publisher: true, mergeable: true, locked: false },
  fields: ['id', 'name', 'organizationId', 'lockedUntil'],
  sort: { field: 'name', order: 'asc' },
  pagination: { page: 1, limit: 50 }
})

fetchPages(appId, options = {
  include: ['associatedDS', 'associatedFiles'],
  fields: ['id', 'title', 'order', 'updatedAt'],
  sort: { field: 'title', order: 'asc' }
})
```

**DON'T:** Accept parameters that identify *who is calling*
```javascript
// ❌ Caller identification
fetchApps(orgId, viewType: 'dashboard' | 'selector')
fetchPages(appId, { isConfigurationStep: true })
```

#### API Response Transformation

**Driven by Options, Not Assumptions:**
- Transform REST API responses based on the `fields` and `include` parameters passed in
- Filter response data according to options, not based on assumed caller context
- Construct API requests from behavioral parameters

**Example:**
```javascript
// ✓ Transformation based on explicit options
function transformAppResponse(apiResponse, options = {}) {
  const { fields, include } = options;

  let result = apiResponse;

  // Filter fields if specified
  if (fields && fields.length > 0) {
    result = fields.reduce((obj, field) => {
      if (apiResponse[field] !== undefined) {
        obj[field] = apiResponse[field];
      }
      return obj;
    }, {});
  }

  // Include related resources if specified
  if (include) {
    if (include.includes('organization') && apiResponse.organizationId) {
      // Fetch organization details
    }
  }

  return result;
}
```

#### State Management Integration

**Cache Keys Based on Request Parameters:**
- State structure should be **deterministic** based on data, not caller
- Cache keys must be derived from **request parameters**, not caller identity
- Provide cache control options: `{ cache: 'force-refresh' | 'cache-first' | 'no-cache' }`

**Example:**
```javascript
// ✓ Cache key from request parameters
function generateCacheKey(endpoint, options) {
  const sortedOptions = JSON.stringify(options, Object.keys(options).sort());
  return `${endpoint}:${sortedOptions}`;
}

// ❌ Cache key from caller identity
function generateCacheKey(endpoint, stepName) {
  return `${endpoint}:${stepName}`;
}
```

#### Data Fetching Patterns

**When PRD/design shows different UIs need different data:**
- ✓ Implement field selection: `{ fields: ['id', 'name', 'lockedUntil'] }`
- ✓ Implement inclusion of relations: `{ include: ['associatedDS', 'associatedFiles'] }`
- ✓ Implement depth control: `{ depth: 1 }` for shallow vs deep fetching
- ✓ Implement filters: `{ filters: { publisher: true, mergeable: true } }`
- ❌ Don't implement: `{ stepType: 'selection' }` or `{ viewMode: 'configuration' }`

**Performance as Opt-In:**
- Let callers opt into performance features rather than guessing when to apply them
- Implement caching options that callers can enable
- Provide pagination capabilities without assuming when to use them

#### Critical Thinking for Design

Before implementing any middleware function, validate:
1. **Could this function serve a caller I haven't thought of yet?**
2. **Are my parameters describing *what to do* or *who is asking*?**
3. **If the UI completely changes tomorrow, would this function still make sense?**
4. **Can I explain every parameter's purpose without referring to specific screens or steps?**

If you answer "no" to any of these, reconsider the design.

## Functional Requirements

### FR1: App Selection and Listing

**Description:** Fetch and filter apps available for merge operations within organizations

**Dependencies:** OrganizationsApiService, ValidationEngine

**Validation Rules:**
- User must have App Publisher rights on apps
- Apps must not be locked by other users
- Apps must not have duplicate screen/data source names
- Source and destination apps cannot be the same

**Error Handling:**
- Handle permission errors with clear messaging
- Handle locked app errors with lock owner information
- Handle API errors with retry capabilities

### FR2: Organization Management

**Description:** Fetch user organizations and manage cross-organization merge scenarios

**Dependencies:** OrganizationsApiService

**Validation Rules:**
- User must have access to both source and destination organizations
- Organization policy must allow app merge

**Error Handling:**
- Handle organization access errors
- Handle policy restriction errors

### FR3: Resource Discovery with Associations

**Description:** Fetch screens, data sources, and files with their associations to other resources

**Dependencies:** PagesApiService, DataSourcesApiService, MediaApiService

**Validation Rules:**
- Only standard data sources (type=null) are selectable
- Associated resources must be tracked for dependency management

**Error Handling:**
- Handle missing resource errors
- Handle association query failures

### FR4: Duplicate Detection

**Description:** Detect duplicate names in screens and data sources to prevent merge conflicts

**Dependencies:** ValidationController, AppsApiService

**Validation Rules:**
- Screen names must be unique within an app
- Data source names must be unique within an app
- Both source and destination apps must pass duplicate checks

**Error Handling:**
- Return detailed list of duplicates with IDs
- Block merge configuration if duplicates found

### FR5: Merge Preview

**Description:** Preview merge results before execution showing what will be copied/overwritten

**Dependencies:** MergeApiService, ValidationController

**Validation Rules:**
- All selected resources must exist
- Preview must calculate overwrite vs. copy for each resource
- Plan limits must be checked

**Error Handling:**
- Handle preview calculation errors
- Show plan limit warnings

### FR6: App Locking

**Description:** Lock source and destination apps during merge configuration and execution

**Dependencies:** AppLockController, AppsApiService

**Validation Rules:**
- Apps must not already be locked
- Lock must be owned by current user
- Lock expires after timeout (default 10 minutes)

**Error Handling:**
- Handle lock conflicts
- Handle lock expiration
- Auto-unlock on configuration cancellation

### FR7: Merge Execution

**Description:** Initiate and monitor app merge process with real-time status updates

**Dependencies:** MergeExecutionController, MergeApiService, StateManager

**Validation Rules:**
- All required configurations must be complete
- Apps must be locked
- No duplicate names in selected resources
- User must have publisher rights on both apps

**Error Handling:**
- Handle merge initiation failures
- Handle merge execution errors
- Provide detailed error logs
- Auto-unlock apps on failure

### FR8: Real-Time Status Monitoring

**Description:** Track merge progress with real-time updates on each stage

**Dependencies:** MergeApiService, event system

**Validation Rules:**
- Status must reflect current merge stage
- Progress must be accurately calculated

**Error Handling:**
- Handle status polling failures
- Handle WebSocket connection errors
- Fallback to polling if WebSocket unavailable

## Technical Architecture

### Core Foundation Classes

#### BaseMiddleware

**Purpose:** Foundation class providing common utilities and dependency injection

**Key Methods:**
- `initialize(config)`: Configure middleware with API settings
- `getDependency(name)`: Retrieve injected dependencies
- `emit(event, data)`: Emit events for UI consumption

**Dependencies:** Event emitter, logger, configuration store

#### StateManager

**Purpose:** Manage temporary merge configuration state (not persisted)

**State Schema:**
```javascript
{
  mergeConfiguration: {
    sourceApp: { id, name, organizationId },
    destinationApp: { id, name, organizationId },
    selectedPages: [{ id, name, hasNonCopyableComponents }],
    selectedDataSources: [{ id, name, structureOnly, entriesCount }],
    selectedFiles: [{ id, name, type, path }],
    selectedFolders: [{ id, name, scope: 'folder' | 'all' }],
    appLevelSettings: {
      mergeAppSettings: false,
      mergeMenuSettings: false,
      mergeAppearanceSettings: false,
      mergeGlobalCode: false
    },
    customDataSourcesInUse: []
  },
  lockStatus: {
    sourceAppLockedUntil: null,
    destinationAppLockedUntil: null,
    lockOwner: null
  },
  mergeStatus: {
    mergeId: null,
    status: 'not_started' | 'in_progress' | 'completed' | 'error',
    currentStage: null,
    progress: 0
  },
  validationState: {
    sourceAppDuplicates: { pages: [], dataSources: [] },
    destinationAppDuplicates: { pages: [], dataSources: [] },
    hasErrors: false,
    errors: []
  }
}
```

**Validation Rules:**
- State transitions must be validated
- Configuration must be complete before merge initiation
- State is cleared on cancellation or completion

#### ValidationEngine

**Purpose:** Client-side validation before API calls

**Validation Types:**
- Duplicate name detection
- Permission validation
- Configuration completeness
- Plan limit checks

**Integration:** Works with ValidationController to perform both local and API-based validation

#### ApiClient

**Purpose:** HTTP communication using Fliplet.API.request()

**Features:**
- Request/response interceptors
- Automatic authentication handling
- Retry logic with exponential backoff
- Request/response logging
- Error standardization

**Configuration:**
- Default timeout: 30000ms
- Retry attempts: 3
- Retry delay: 1000ms (exponential backoff)

**Implementation:** Must use Fliplet.API.request() as documented at https://developers.fliplet.com/API/core/api.html

**CRITICAL IMPLEMENTATION REQUIREMENTS:**

1. **No baseUrl needed:** Fliplet.API.request() automatically uses `Fliplet.Env.get('apiUrl')` as the default base URL
2. **Custom API URL:** Check `Fliplet.Navigate.query.apiUrl` and pass it as `{ apiUrl }` option only when provided
3. **Custom Auth Token:** Check `Fliplet.Navigate.query.auth_token` and pass it as `{ headers: { 'Auth-token': auth_token } }` option
4. **URL handling:** Fliplet.API.request() expects base URL to end with trailing slash and endpoint to start without slash

**Example Implementation Pattern:**
```javascript
class ApiClient {
  constructor() {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    };

    // Check for overrides from Fliplet.Navigate.query
    this.apiUrl = null; // Only set if custom apiUrl provided
    this.authToken = null;

    if (typeof Fliplet !== 'undefined' && Fliplet.Navigate && Fliplet.Navigate.query) {
      if (Fliplet.Navigate.query.apiUrl) {
        this.apiUrl = Fliplet.Navigate.query.apiUrl;
      }
      if (Fliplet.Navigate.query.auth_token) {
        this.authToken = Fliplet.Navigate.query.auth_token;
      }
    }
  }

  async request(method, endpoint, data = null, options = {}) {
    const requestConfig = {
      url: this.buildRequestUrl(endpoint),
      method: method.toUpperCase(),
      headers: this.buildRequestHeaders(options.headers)
    };

    // Add custom apiUrl only if provided
    if (this.apiUrl) {
      requestConfig.apiUrl = this.apiUrl;
    }

    if (data) {
      requestConfig.data = data;
    }

    return this.executeWithRetry(requestConfig);
  }

  buildRequestUrl(endpoint) {
    // No custom apiUrl: return 'v1/apps' (Fliplet.API.request() adds base URL)
    // Custom apiUrl: return full URL
    if (this.apiUrl) {
      const baseUrl = this.apiUrl.endsWith('/') ? this.apiUrl : `${this.apiUrl}/`;
      const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      return `${baseUrl}${path}`;
    }
    return endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  }

  buildRequestHeaders(customHeaders = {}) {
    const headers = { ...customHeaders };

    if (this.authToken) {
      headers['Auth-token'] = this.authToken;
    }

    return headers;
  }

  async executeWithRetry(requestConfig) {
    let lastError;

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const response = await Fliplet.API.request(requestConfig);
        return response;
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Wait before retry with exponential backoff
        if (attempt < this.config.retryAttempts - 1) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### ErrorHandler

**Purpose:** Standardize error handling and messaging

**Error Categories:**
- Validation errors (client-side)
- API errors (server-side)
- Network errors (connectivity)
- Permission errors (authorization)

**Recovery Strategies:**
- Validation errors: Show inline messages, block action
- API errors: Retry with user prompt
- Network errors: Auto-retry with exponential backoff
- Permission errors: Clear messaging, no retry

**User Experience:**
- User-friendly error messages
- Technical details in expandable sections
- Actionable guidance (e.g., "Rename these items:", "Contact admin")

### API Service Classes

#### AppsApiService

**Purpose:** Wrapper for app-related API endpoints

**Methods:**

```javascript
// Fetch apps with behavioral options
fetchApps(options = {
  organizationId: null,          // Filter by organization
  userId: null,                  // Filter by user access
  filters: {
    publisher: false,            // Only apps where user has publisher role
    mergeable: false,            // Only apps that can be merged
    locked: null                 // Filter by lock status (true/false/null)
  },
  fields: [],                    // Which fields to return
  sort: { field: 'name', order: 'asc' },
  pagination: { page: 1, limit: 50 },
  cache: 'default'               // Cache strategy
})

// Fetch single app details
fetchApp(appId, options = {
  fields: [],                    // Which fields to return
  cache: 'default'
})

// Check for duplicates
checkDuplicates(appId, options = {
  items: ['pages', 'dataSources']  // What to check
})
```

**Validation:**
- Validate appId is provided
- Validate organizationId if filtering by org
- Transform API responses based on `fields` parameter

**Error Mapping:**
- 404 → "App not found"
- 403 → "Insufficient permissions to access this app"
- 400 → Pass validation message from server

#### OrganizationsApiService

**Purpose:** Wrapper for organization-related API endpoints

**Methods:**

```javascript
// Fetch user's organizations
fetchOrganizations(options = {
  userId: null,                  // Filter by user (optional, defaults to current user)
  fields: [],                    // Which fields to return
  sort: { field: 'name', order: 'asc' },
  cache: 'default'
})

// Fetch organization details
fetchOrganization(organizationId, options = {
  fields: [],
  cache: 'default'
})
```

**Validation:**
- Validate organizationId is provided
- Check user access to organization

**Error Mapping:**
- 404 → "Organization not found"
- 403 → "You don't have access to this organization"

#### PagesApiService

**Purpose:** Wrapper for screen/page-related API endpoints

**Methods:**

```javascript
// Fetch app pages with associations
fetchPages(appId, options = {
  include: [],                   // 'associatedDS', 'associatedFiles'
  fields: [],                    // Which page fields to return
  filters: {},                   // Custom filters
  sort: { field: 'title', order: 'asc' },
  pagination: { page: 1, limit: 50 },
  cache: 'default'
})

// Fetch single page details
fetchPage(appId, pageId, options = {
  include: [],
  fields: [],
  cache: 'default'
})

// Fetch page preview
fetchPagePreview(appId, pageId, options = {
  format: 'html' | 'json'
})
```

**Validation:**
- Validate appId and pageId are provided
- Build API query string from `include` parameter

**Error Mapping:**
- 404 → "Screen not found"
- 403 → "Insufficient permissions"

#### DataSourcesApiService

**Purpose:** Wrapper for data source-related API endpoints

**Methods:**

```javascript
// Fetch app data sources with associations
fetchDataSources(appId, options = {
  include: [],                   // 'associatedPages', 'associatedFiles'
  includeInUse: false,          // Include usage information
  filters: {
    type: null,                  // Only standard data sources (type=null)
    hasGlobalDependency: null   // Filter by global dependency
  },
  fields: [],                    // Which fields to return
  sort: { field: 'name', order: 'asc' },
  pagination: { page: 1, limit: 50 },
  cache: 'default'
})

// Fetch single data source details
fetchDataSource(dataSourceId, options = {
  appId: null,                   // Required for association queries
  include: [],
  fields: [],
  cache: 'default'
})
```

**Validation:**
- Validate appId is provided
- Validate only standard data sources returned

**Error Mapping:**
- 404 → "Data source not found"
- 403 → "Insufficient permissions"

#### MediaApiService

**Purpose:** Wrapper for file and folder-related API endpoints

**Methods:**

```javascript
// Fetch app media (files and folders)
fetchMedia(appId, options = {
  include: [],                   // 'associatedPages', 'associatedDS'
  filters: {
    type: null,                  // Filter by file type
    hasAssociations: null,      // Filter by association existence
    isUnused: null,             // Filter unused files
    isGlobalLibrary: null       // Filter global libraries
  },
  fields: [],                    // Which fields to return
  sort: { field: 'name', order: 'asc' },
  pagination: { page: 1, limit: 50 },
  cache: 'default'
})

// Fetch single file details
fetchFile(fileId, options = {
  appId: null,                   // Required for association queries
  include: [],
  fields: [],
  cache: 'default'
})

// Fetch single folder details
fetchFolder(folderId, options = {
  appId: null,
  include: [],
  fields: [],
  cache: 'default'
})
```

**Validation:**
- Validate appId is provided
- Validate fileId or folderId for detail queries

**Error Mapping:**
- 404 → "File not found" or "Folder not found"
- 403 → "Insufficient permissions"

#### MergeApiService

**Purpose:** Wrapper for merge-related API endpoints

**Methods:**

```javascript
// Lock apps for merge configuration
lockApps(sourceAppId, options = {
  targetApp: { id: null, region: null },
  lockDuration: 600              // Duration in seconds (default 10 minutes)
})

// Unlock apps
unlockApps(sourceAppId, options = {
  targetApp: { id: null, region: null }
})

// Extend lock duration
extendLock(sourceAppId, options = {
  targetApp: { id: null, region: null },
  extendDuration: 300            // Duration to add in seconds
})

// Preview merge results
previewMerge(sourceAppId, mergeConfig)

// Initiate merge
initiateMerge(sourceAppId, mergeConfig)

// Get merge status
getMergeStatus(sourceAppId, options = {
  mergeId: null
})

// Fetch merge logs
fetchMergeLogs(appId, options = {
  mergeId: null,
  types: [],                     // Filter by log types
  pagination: { page: 1, limit: 50 }
})
```

**Method Design Guidelines:**
- All methods use options objects with behavioral parameters
- `mergeConfig` parameter structure:
  ```javascript
  {
    destinationAppId: Number,
    destinationOrganizationId: Number,
    fileIds: [],                  // [] or 'all'
    folderIds: [{ id, scope }],  // [] or 'all'
    pageIds: [],                  // [] or 'all'
    dataSources: [{ id, structureOnly }], // [] or 'all'
    mergeAppSettings: false,
    mergeMenuSettings: false,
    mergeAppearanceSettings: false,
    mergeGlobalCode: false,
    customDataSourcesInUse: []
  }
  ```

**Validation:**
- Validate sourceAppId and destinationAppId are different
- Validate all selected resources exist
- Validate user has publisher rights on both apps

**Error Mapping:**
- 400 → Pass validation message from server
- 401 → "Insufficient permissions"
- 404 → "App not found"
- 409 → "Apps already locked" or other conflict messages

### Workflow Controller Classes

#### MergeConfigurationController

**Purpose:** Orchestrate multi-step merge configuration workflow

**Steps:**
1. Destination selection
2. Resource selection (screens, data sources, files, settings)
3. Preview and review
4. Initiation

**Controller Design Guidelines:**
- Accepts workflow configuration options (validation level, auto-save state)
- Provides step validation before allowing progression
- Emits events for UI state updates

**Methods:**

```javascript
// Initialize merge configuration
startConfiguration(sourceAppId, options = {
  autoLock: true,                // Automatically lock apps when destination selected
  validationLevel: 'strict'      // 'strict' | 'lenient'
})

// Validate current step
validateStep(stepName, options = {
  blockProgression: true         // Block if validation fails
})

// Move to next step
proceedToNextStep(options = {
  autoValidate: true            // Automatically validate before proceeding
})

// Go back to previous step
returnToPreviousStep(options = {
  preserveState: true           // Keep current step's state
})

// Cancel configuration
cancelConfiguration(options = {
  autoUnlock: true              // Automatically unlock apps
  clearState: true              // Clear all configuration state
})

// Get current configuration state
getConfiguration(options = {
  format: 'complete' | 'summary'  // Return full config or summary
})
```

**Validation:**
- Each step must pass validation before progression
- Destination app must not have duplicates
- User must have permissions on selected apps

**State Management:**
- Uses StateManager to track configuration
- Emits state change events for UI updates

#### AppLockController

**Purpose:** Manage app locking lifecycle during merge configuration

**Methods:**

```javascript
// Lock apps
lockApps(sourceAppId, destinationAppId, options = {
  duration: 600,                 // Lock duration in seconds
  autoExtend: true,             // Auto-extend when activity detected
  extendThreshold: 300          // Extend when X seconds remain
})

// Unlock apps
unlockApps(sourceAppId, destinationAppId)

// Extend lock
extendLock(sourceAppId, destinationAppId, options = {
  additionalDuration: 300       // Seconds to add
})

// Check lock status
checkLockStatus(appId)

// Monitor lock expiration
monitorLockExpiration(appId, options = {
  warningThreshold: 120,        // Warn when X seconds remain
  autoExtend: false
})
```

**Controller Design Guidelines:**
- Manages lock lifecycle automatically when `autoExtend: true`
- Emits warnings when lock is expiring
- Auto-unlocks on configuration cancellation
- Provides lock status for UI display

**Validation:**
- Apps must not already be locked
- User must have publisher rights

**State Management:**
- Tracks lock status in StateManager
- Emits lock expiration warnings

#### MergeExecutionController

**Purpose:** Initiate and monitor merge execution

**Methods:**

```javascript
// Initiate merge with configuration
initiateMerge(sourceAppId, mergeConfig, options = {
  waitForCompletion: false,     // Wait for merge to complete
  pollInterval: 2000,           // Status polling interval in ms
  enableWebSocket: true         // Use WebSocket for real-time updates
})

// Monitor merge progress
monitorProgress(sourceAppId, mergeId, options = {
  pollInterval: 2000,
  enableWebSocket: true,
  onProgress: null,             // Callback for progress updates
  onComplete: null,             // Callback for completion
  onError: null                 // Callback for errors
})

// Get merge result
getMergeResult(sourceAppId, mergeId, options = {
  includeDetails: true          // Include detailed results
})

// Fetch merge logs
fetchLogs(appId, mergeId, options = {
  types: [],                    // Filter by log type
  pagination: { page: 1, limit: 50 }
})
```

**Controller Design Guidelines:**
- Orchestrates merge initiation with validation
- Provides real-time status updates via events
- Supports both WebSocket and polling for status updates
- Handles merge completion and error states

**Validation:**
- Configuration must be complete
- Apps must be locked
- User must have permissions

**State Management:**
- Updates merge status in StateManager
- Emits progress events for UI updates

#### ValidationController

**Purpose:** Centralized validation for merge operations

**Methods:**

```javascript
// Validate app can be merged
validateAppForMerge(appId, options = {
  checkDuplicates: true,
  checkPermissions: true,
  checkLockStatus: true
})

// Check for duplicate names
checkDuplicates(appId, options = {
  items: ['pages', 'dataSources']  // What to check
})

// Validate merge configuration
validateConfiguration(mergeConfig, options = {
  checkPlanLimits: true,
  checkConflicts: true
})

// Validate user permissions
validatePermissions(appId, options = {
  requiredRole: 'publisher'
})

// Check plan limits
checkPlanLimits(destinationAppId, mergeConfig, options = {
  warnOnly: false               // Warn or block
})
```

**Validation Rules:**
- Screen names must be unique within an app
- Data source names must be unique within an app
- User must have publisher role on both apps
- Apps must not be locked by other users
- Merge must not exceed plan limits

**Error Handling:**
- Returns detailed validation results
- Provides list of issues with IDs
- Suggests remediation actions

### Supporting Infrastructure

#### ErrorHandler

**Purpose:** Standardize error transformation and presentation

**Error Categories:**
1. **Validation Errors**: Client-side validation failures
2. **API Errors**: Server-side errors and responses
3. **Network Errors**: Connectivity and timeout issues
4. **Permission Errors**: Authorization failures

**Methods:**

```javascript
// Transform API error to user-friendly format
transformError(error, options = {
  includeDetails: true,         // Include technical details
  suggestAction: true          // Suggest remediation
})

// Get error message for error code
getErrorMessage(errorCode, context = {})

// Log error
logError(error, options = {
  level: 'error',               // 'error' | 'warning' | 'info'
  notify: false                 // Send to error tracking service
})
```

**Recovery Strategies:**
- Validation errors: Display inline, block action
- API errors: Offer retry with exponential backoff
- Network errors: Auto-retry, show connection status
- Permission errors: Clear messaging, no retry

**User Experience:**
- User-friendly primary message
- Technical details in expandable section
- Actionable guidance
- Error context (what the user was trying to do)

#### DataMapper

**Purpose:** Transform API responses to internal data structures

**Transformations:**
- API response → Internal model
- Internal model → API request
- Flattening nested structures
- Calculating derived fields

**Validation:**
- Type checking
- Required field validation
- Format validation

## API Integration Mapping

### Endpoint Groups

#### Apps Group (Maps to AppsApiService)

- **GET /v1/apps** → `fetchApps()`: List apps with filtering and pagination
- **GET /v1/apps/:appId** → `fetchApp()`: Get app details including lock status
- **POST /v1/apps/:appId/duplicates** → `checkDuplicates()`: Check for duplicate names
- **POST /v1/apps/:appId/lock** → `lockApp()`: Lock app for merge configuration
- **POST /v1/apps/:appId/unlock** → `unlockApp()`: Unlock app
- **POST /v1/apps/:appId/lock/extend** → `extendLock()`: Extend lock duration

#### Organizations Group (Maps to OrganizationsApiService)

- **GET /v1/organizations** → `fetchOrganizations()`: List user's organizations
- **GET /v1/organizations/:id** → `fetchOrganization()`: Get organization details
- **GET /v1/organizations/:organizationId/users/:userId/apps** → `fetchUserApps()`: List user's apps in organization

#### Pages Group (Maps to PagesApiService)

- **GET /v1/apps/:appId/pages** → `fetchPages()`: List screens with optional associations
- **GET /v1/apps/:appId/pages/:pageId** → `fetchPage()`: Get screen details with associations
- **GET /v1/apps/:appId/pages/:pageId/preview** → `fetchPagePreview()`: Get screen preview

#### Data Sources Group (Maps to DataSourcesApiService)

- **GET /v1/data-sources?appId=:appId** → `fetchDataSources()`: List data sources with associations
- **GET /v1/data-sources/:dataSourceId** → `fetchDataSource()`: Get data source details

#### Media Group (Maps to MediaApiService)

- **GET /v1/media?appId=:appId** → `fetchMedia()`: List files and folders with associations
- **GET /v1/media/files/:fileId** → `fetchFile()`: Get file details
- **GET /v1/media/folders/:folderId** → `fetchFolder()`: Get folder details

#### Merge Group (Maps to MergeApiService)

- **POST /v1/apps/:sourceAppId/merge/preview** → `previewMerge()`: Preview merge results
- **POST /v1/apps/:sourceAppId/merge** → `initiateMerge()`: Start merge process
- **POST /v1/apps/:sourceAppId/merge/status** → `getMergeStatus()`: Get current merge status
- **POST /v1/apps/:appId/logs** → `fetchMergeLogs()`: Get merge audit logs

### Workflow Sequences

#### Workflow: Select Destination App (Maps to MergeConfigurationController)

**Steps:**
1. Fetch user organizations → `OrganizationsApiService.fetchOrganizations()`
2. User selects organization
3. Fetch apps in organization → `OrganizationsApiService.fetchUserApps()` with `{ filters: { publisher: true, mergeable: true } }`
4. Check destination app for duplicates → `AppsApiService.checkDuplicates()` with `{ items: ['pages', 'dataSources'] }`
5. Validate user permissions → `ValidationController.validatePermissions()`
6. Lock both apps → `AppLockController.lockApps()`

**Dependencies:**
- User must belong to at least one organization
- User must have publisher rights on destination app
- Destination app must not have duplicates

**Validation Points:**
- After organization selection: Check user has access
- After app selection: Check duplicates, permissions, lock status
- Before locking: Validate both apps are available

**Error Handling:**
- Duplicate detection failure → Block progression, show duplicate list
- Permission validation failure → Block progression, show error
- Lock failure → Retry or cancel configuration

#### Workflow: Configure Merge Settings (Maps to MergeConfigurationController)

**Steps:**
1. Fetch source app screens → `PagesApiService.fetchPages()` with `{ include: ['associatedDS', 'associatedFiles'] }`
2. Fetch source app data sources → `DataSourcesApiService.fetchDataSources()` with `{ include: ['associatedPages', 'associatedFiles'], includeInUse: true }`
3. Fetch source app media → `MediaApiService.fetchMedia()` with `{ include: ['associatedPages', 'associatedDS'] }`
4. User selects resources and options
5. Validate configuration → `ValidationController.validateConfiguration()`
6. Monitor lock status → `AppLockController.monitorLockExpiration()`
7. Auto-extend lock on activity → `AppLockController.extendLock()`

**Dependencies:**
- Apps must be locked
- All resource data must be fetched successfully

**Validation Points:**
- After each resource selection: Update state
- Before proceeding to review: Validate at least one item selected
- Continuous: Monitor lock expiration

**Error Handling:**
- Resource fetch failure → Retry or show error
- Lock expiration → Warn user, extend or cancel
- Configuration incomplete → Block progression

#### Workflow: Review and Initiate Merge (Maps to MergeExecutionController)

**Steps:**
1. Generate merge preview → `MergeApiService.previewMerge()` with complete configuration
2. Display preview results (copied, overwritten, conflicts)
3. Validate no conflicts → `ValidationController.validateConfiguration()` with `{ checkConflicts: true }`
4. Check plan limits → `ValidationController.checkPlanLimits()`
5. User confirms merge
6. Initiate merge → `MergeApiService.initiateMerge()`
7. Monitor progress → `MergeExecutionController.monitorProgress()` with WebSocket/polling

**Dependencies:**
- Configuration must be complete
- No conflicts in selected resources
- Plan limits not exceeded (or user acknowledges)

**Validation Points:**
- After preview: Check for conflicts, validate limits
- Before initiation: Final validation
- During execution: Monitor status

**Error Handling:**
- Preview failure → Show error, allow retry
- Conflict detection → Block merge, show conflicts
- Plan limit exceeded → Warn or block based on settings
- Merge initiation failure → Show error, unlock apps
- Merge execution error → Show detailed error, unlock apps

#### Workflow: Monitor Merge Progress (Maps to MergeExecutionController)

**Steps:**
1. Establish real-time connection (WebSocket) or start polling
2. Receive status updates → `MergeApiService.getMergeStatus()`
3. Update UI with progress (percentage, current stage, messages)
4. Handle completion → Fetch final result → `MergeExecutionController.getMergeResult()`
5. Unlock apps automatically
6. Display completion summary

**Dependencies:**
- Merge must be in progress
- WebSocket or polling connection

**Validation Points:**
- Continuous: Validate status updates
- On completion: Validate merge result

**Error Handling:**
- Connection loss → Fallback to polling
- Status fetch failure → Retry with backoff
- Merge error → Display error, unlock apps

## State Management Design

### State Schema

```javascript
{
  // Merge configuration (temporary, cleared on cancel/complete)
  mergeConfiguration: {
    sourceApp: {
      id: null,
      name: null,
      organizationId: null,
      region: null
    },
    destinationApp: {
      id: null,
      name: null,
      organizationId: null,
      region: null
    },
    selectedPages: [
      {
        id: null,
        name: null,
        hasNonCopyableComponents: false,
        associatedDS: [],
        associatedFiles: []
      }
    ],
    selectedDataSources: [
      {
        id: null,
        name: null,
        structureOnly: false,
        entriesCount: 0,
        associatedPages: [],
        associatedFiles: [],
        hasGlobalDependency: false
      }
    ],
    selectedFiles: [
      {
        id: null,
        name: null,
        type: null,
        path: null,
        associatedPages: [],
        associatedDS: []
      }
    ],
    selectedFolders: [
      {
        id: null,
        name: null,
        scope: 'folder', // 'folder' | 'all'
        associatedPages: [],
        associatedDS: []
      }
    ],
    appLevelSettings: {
      mergeAppSettings: false,
      mergeMenuSettings: false,
      mergeAppearanceSettings: false,
      mergeGlobalCode: false
    },
    customDataSourcesInUse: []
  },

  // Lock status
  lockStatus: {
    sourceAppLockedUntil: null,
    destinationAppLockedUntil: null,
    lockOwner: null
  },

  // Merge execution status
  mergeStatus: {
    mergeId: null,
    status: 'not_started', // 'not_started' | 'in_progress' | 'completed' | 'error'
    currentStage: null,    // 'media' | 'data-sources' | 'global-code' | 'settings' | 'screens'
    progress: 0,           // 0-100
    logs: []
  },

  // Validation state
  validationState: {
    sourceAppDuplicates: {
      pages: [],           // [{ title, count, ids }]
      dataSources: []      // [{ name, count, ids }]
    },
    destinationAppDuplicates: {
      pages: [],
      dataSources: []
    },
    hasErrors: false,
    errors: []             // [{ field, message, type }]
  },

  // Cache (API responses cached by request parameters)
  cache: {
    // Key format: "endpoint:sortedOptionsJSON"
    // Example: "v1/apps:{"organizationId":123,"filters":{"publisher":true}}"
    // Value: { data, timestamp, ttl }
  }
}
```

### State Transitions

**Valid Transitions:**

1. **Not Started → Destination Selected**
   - Trigger: User selects destination app
   - Validation: Destination app has no duplicates, user has permissions
   - Action: Lock both apps

2. **Destination Selected → Configuring Resources**
   - Trigger: Apps locked successfully
   - Validation: Lock confirmed
   - Action: Fetch resource lists

3. **Configuring Resources → Reviewing Preview**
   - Trigger: User completes configuration
   - Validation: At least one item selected
   - Action: Generate merge preview

4. **Reviewing Preview → Merge In Progress**
   - Trigger: User confirms merge
   - Validation: No conflicts, plan limits OK
   - Action: Initiate merge

5. **Merge In Progress → Completed**
   - Trigger: Merge finishes successfully
   - Validation: Merge status is 'completed'
   - Action: Unlock apps, show results

6. **Any State → Cancelled**
   - Trigger: User cancels or lock expires
   - Validation: None
   - Action: Unlock apps, clear state

7. **Any State → Error**
   - Trigger: Critical error occurs
   - Validation: None
   - Action: Unlock apps, show error

### Persistence Strategy

**No Persistence:**
- Merge configuration is temporary and stored only in memory
- If user closes overlay or navigates away, configuration is lost
- State is cleared on cancellation or completion
- Only merge results are persisted (via audit logs on backend)

**Rationale:**
- PRD explicitly states configuration cannot be saved
- Reduces complexity and security concerns
- Encourages users to complete configuration in one session
- Lock timeout enforces session boundaries

## Validation Framework Design

### Validation Rules

#### Field Validation

**App Selection:**
- **Required Fields:** sourceAppId, destinationAppId, destinationOrganizationId
- **Data Types:** All IDs must be numbers
- **Constraints:**
  - sourceAppId !== destinationAppId
  - Both apps must exist and be accessible
  - Both apps must not be locked by other users

**Resource Selection:**
- **Required Fields:** At least one of (pageIds, dataSourceIds, fileIds, appLevelSettings flags) must be selected
- **Data Types:**
  - pageIds: array of numbers or 'all'
  - dataSourceIds: array of objects with id and structureOnly, or 'all'
  - fileIds: array of numbers or 'all'
  - folderIds: array of objects with id and scope, or 'all'
- **Constraints:**
  - Selected resources must exist in source app
  - Data sources must be standard type (type=null)

**App-Level Settings:**
- **Data Types:** All boolean flags
- **Constraints:** At least one flag must be true if no other resources selected

#### Business Rules

**Duplicate Names:**
- Screen names must be unique within an app
- Data source names must be unique within an app
- Both source and destination apps must pass duplicate checks

**Permissions:**
- User must have App Publisher role on source app
- User must have App Publisher role on destination app
- Organization policy must allow app merge

**App Locking:**
- Apps must not be locked by another user
- Lock must be owned by current user for extension
- Lock duration must be valid (> 0 seconds)

**Plan Limits:**
- Total files must not exceed plan limit
- Total storage must not exceed plan limit
- Total data rows must not exceed plan limit
- Warnings shown if limits exceeded

### Error Messages

**Validation Errors:**
- "Source and destination apps cannot be the same"
- "You must select at least one screen, data source, file, or app-level setting"
- "Data source '{name}' is not a standard data source and cannot be merged"

**Duplicate Errors:**
- "This app contains duplicate screen names: {list}. Please rename before proceeding."
- "This app contains duplicate data source names: {list}. Please rename before proceeding."

**Permission Errors:**
- "You must have App Publisher rights on this app to merge"
- "You don't have permission to access this organization"
- "App merge is not enabled for this organization. Contact your administrator."

**Lock Errors:**
- "This app is currently locked by {userName} until {timestamp}"
- "Lock has expired. Please restart the merge configuration."
- "Unable to lock apps. Please try again."

**Plan Limit Errors:**
- "This merge will exceed your plan limits: {details}"
- "File count: {current + merge} / {limit} (over by {overage})"
- "Storage: {current + merge}MB / {limit}MB (over by {overage})"

**API Errors:**
- "App not found or you don't have access"
- "Connection error. Please check your internet connection."
- "Server error. Please try again later."

## Error Handling Strategy

### Error Categories

1. **Validation Errors:** Client-side validation failures before API calls
2. **API Errors:** Server-side errors and responses (4xx, 5xx)
3. **Network Errors:** Connectivity and timeout issues
4. **Business Logic Errors:** Workflow and dependency failures

### Recovery Strategies

**Validation Errors:**
- Display inline error messages
- Highlight invalid fields
- Block action until resolved
- No automatic retry

**API Errors:**
- 4xx errors: Display error message, block action, no retry
- 5xx errors: Display error message, offer retry with exponential backoff
- 404 errors: Display "not found" message, no retry
- 403 errors: Display permission error, no retry
- 409 errors: Display conflict message, suggest resolution

**Network Errors:**
- Automatic retry with exponential backoff (3 attempts)
- Display connection status
- Show retry countdown
- Allow manual retry

**Business Logic Errors:**
- Display error with context
- Suggest remediation (e.g., "Rename these items")
- Provide link to documentation
- Log error for debugging

### User Experience

**Error Display:**
- Primary message: User-friendly, actionable
- Secondary details: Technical information in expandable section
- Error icon: Visual indicator of severity
- Context: What the user was trying to do

**Actions:**
- Retry button (for retryable errors)
- Cancel button (to abort operation)
- Help link (to documentation)
- Contact support (for critical errors)

**Logging:**
- All errors logged to console
- Critical errors sent to error tracking service
- Error context included (user action, state)

## Anti-Patterns to Avoid

### Caller Identification

❌ **Never accept parameters that identify who is calling:**

```javascript
// ❌ Bad: Caller identification
function fetchApps(organizationId, stepType: 'selection' | 'configuration')
function fetchPages(appId, { forConfigurationStep: true })
function fetchDataSources(appId, viewMode: 'list' | 'detail')
```

### Hidden Branching Logic

❌ **Never use implicit branching based on caller context:**

```javascript
// ❌ Bad: Hidden branching
function fetchApps(organizationId) {
  // Don't do this - inferring behavior from internal state
  if (this.currentStep === 'selection') {
    return minimalAppData;
  }
  return fullAppData;
}
```

### Overloaded Boolean Flags

❌ **Never use ambiguous boolean parameters:**

```javascript
// ❌ Bad: What does "detailed" mean?
function fetchApps(organizationId, detailed: boolean)
function fetchPages(appId, full: boolean)
```

### Magic Strings Without Clear Semantics

❌ **Never use mode strings without clear behavioral meaning:**

```javascript
// ❌ Bad: What's the difference between these?
function fetchApps(organizationId, mode: 'quick' | 'full' | 'complete')
```

### Environmental Detection

❌ **Never detect caller context from environment:**

```javascript
// ❌ Bad: Detecting UI state
function fetchApps(organizationId) {
  if (document.querySelector('.destination-selector')) {
    return minimalData;
  }
  return fullData;
}
```

### Proper Alternatives

✓ **Instead, use explicit behavioral options:**

```javascript
// ✓ Good: Explicit behavioral parameters
function fetchApps(options = {
  organizationId: null,
  fields: [],                    // What data to include
  include: [],                   // Related resources to include
  filters: {},                   // Data filtering criteria
  pagination: {},                // Page number and limit
  sort: {},                      // Sort field and order
  cache: 'default'               // Cache strategy
})

function fetchPages(appId, options = {
  include: [],                   // 'associatedDS', 'associatedFiles'
  fields: [],                    // Which fields to return
  depth: 1                       // How deep to fetch relations
})
```

## Integration Patterns

### Dependency Injection

**Constructor-Based:**

```javascript
class MergeConfigurationController {
  constructor(dependencies = {}) {
    this.appsApi = dependencies.appsApi || new AppsApiService();
    this.orgsApi = dependencies.orgsApi || new OrganizationsApiService();
    this.pagesApi = dependencies.pagesApi || new PagesApiService();
    this.dataSourcesApi = dependencies.dataSourcesApi || new DataSourcesApiService();
    this.mediaApi = dependencies.mediaApi || new MediaApiService();
    this.mergeApi = dependencies.mergeApi || new MergeApiService();
    this.stateManager = dependencies.stateManager || new StateManager();
    this.validationController = dependencies.validationController || new ValidationController();
    this.lockController = dependencies.lockController || new AppLockController();
    this.eventEmitter = dependencies.eventEmitter || new EventEmitter();
  }
}
```

**Benefits:**
- Easy to test with mock dependencies
- Clear dependency visibility
- Flexible configuration

### Event System

**Event Types:**

```javascript
// State change events
'merge:config:destination-selected'
'merge:config:resources-selected'
'merge:config:settings-selected'
'merge:config:cancelled'

// Lock events
'merge:lock:acquired'
'merge:lock:extended'
'merge:lock:expiring' // Warning: lock will expire soon
'merge:lock:expired'
'merge:lock:released'

// Merge execution events
'merge:initiated'
'merge:progress' // { stage, progress, message }
'merge:stage-complete' // { stage, result }
'merge:complete' // { mergeId, result }
'merge:error' // { error, stage }

// Validation events
'merge:validation:error'
'merge:validation:warning'
'merge:validation:success'

// API events
'api:request-start'
'api:request-complete'
'api:request-error'
```

**Event Payload Structure:**

```javascript
{
  type: 'merge:progress',
  timestamp: 1234567890,
  data: {
    mergeId: 123,
    stage: 'screens',
    progress: 45,
    message: 'Copying screen 12 of 27...'
  }
}
```

**Usage:**

```javascript
// Emit event
this.eventEmitter.emit('merge:progress', {
  mergeId: 123,
  stage: 'screens',
  progress: 45,
  message: 'Copying screen 12 of 27...'
});

// Listen to event
this.eventEmitter.on('merge:progress', (data) => {
  // Update UI with progress
});
```

### Configuration Management

**Configuration Schema:**

```javascript
{
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    apiUrl: null,            // Override from Fliplet.Navigate.query.apiUrl
    authToken: null          // Override from Fliplet.Navigate.query.auth_token
  },

  locks: {
    defaultDuration: 600,    // 10 minutes
    autoExtend: true,
    extendThreshold: 300,    // Extend when 5 minutes remain
    extendDuration: 300,     // Add 5 minutes
    warningThreshold: 120    // Warn when 2 minutes remain
  },

  merge: {
    enableWebSocket: true,
    pollInterval: 2000,
    maxPollAttempts: 150     // 5 minutes at 2-second intervals
  },

  cache: {
    enabled: true,
    defaultTTL: 300000,      // 5 minutes
    maxSize: 100             // Maximum cache entries
  },

  validation: {
    level: 'strict',         // 'strict' | 'lenient'
    blockOnError: true,
    warnOnLimit: true
  }
}
```

**Initialization:**

```javascript
// Initialize middleware with custom configuration
const middleware = new AppMergeMiddleware({
  api: {
    timeout: 60000
  },
  locks: {
    autoExtend: false
  }
});
```

## Testing Foundations

### Framework & Conventions

**Framework:** Jest for vanilla JavaScript projects

**Directory Layout:**
```
/src/middleware/
├── core/
│   ├── ApiClient.js
│   ├── ApiClient.test.js
│   ├── StateManager.js
│   ├── StateManager.test.js
│   └── ...
├── api/
│   ├── AppsApiService.js
│   ├── AppsApiService.test.js
│   └── ...
├── controllers/
│   ├── MergeConfigurationController.js
│   ├── MergeConfigurationController.test.js
│   └── ...
└── middleware.js
```

**Coverage Targets:**
- Unit test coverage: > 80%
- Integration test coverage: > 70%
- Critical paths: 100% coverage

### Setup Artifacts

**Configuration Files:**

1. **jest.config.js:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

2. **tests/setup.js:**
```javascript
// Global mocks for Fliplet APIs
global.Fliplet = {
  API: {
    request: jest.fn()
  },
  Env: {
    get: jest.fn((key) => {
      if (key === 'apiUrl') return 'https://api.fliplet.test/';
      return null;
    })
  },
  Navigate: {
    query: {}
  }
};
```

**npm Scripts:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose"
  }
}
```

**Mocking Strategy:**
- Fliplet.API.request: Stubbed in global setup
- API responses: Mock data in `/tests/mocks/`
- WebSocket: Mock implementation for real-time tests

### Execution & CI

**Local Execution:**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ApiClient.test.js
```

**CI Integration:**
- Tests run on every commit
- Coverage report generated and uploaded
- Build fails if coverage drops below threshold
- Tests must pass before merge

### Caller-Agnostic Testing Principles

**Test behavior under different option combinations, not "caller types":**

```javascript
// ✓ Good: Test different behavioral options
describe('AppsApiService.fetchApps', () => {
  test('with minimal fields returns only specified fields', async () => {
    const result = await appsApi.fetchApps({
      organizationId: 123,
      fields: ['id', 'name']
    });

    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).not.toHaveProperty('settings');
  });

  test('with full fields returns all fields', async () => {
    const result = await appsApi.fetchApps({
      organizationId: 123,
      fields: ['id', 'name', 'settings', 'organizationId']
    });

    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('settings');
    expect(result[0]).toHaveProperty('organizationId');
  });

  test('with filters applies correct filtering', async () => {
    const result = await appsApi.fetchApps({
      organizationId: 123,
      filters: { publisher: true, mergeable: true }
    });

    // Verify API was called with correct query parameters
    expect(Fliplet.API.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('publisher=true&mergeable=true')
      })
    );
  });
});

// ❌ Bad: Test caller types
describe('AppsApiService.fetchApps', () => {
  test('for destination selector returns minimal data', async () => {
    const result = await appsApi.fetchApps({
      organizationId: 123,
      callerType: 'destination-selector'
    });
    // This is wrong - we shouldn't have callerType parameter
  });
});
```

**Verify determinism: Same options always produce the same behavior:**

```javascript
test('fetchApps with same options produces consistent results', async () => {
  const options = {
    organizationId: 123,
    fields: ['id', 'name'],
    sort: { field: 'name', order: 'asc' }
  };

  const result1 = await appsApi.fetchApps(options);
  const result2 = await appsApi.fetchApps(options);

  expect(result1).toEqual(result2);
});
```

**Test edge cases: Empty options, maximum options, invalid combinations:**

```javascript
test('fetchApps with empty options uses defaults', async () => {
  const result = await appsApi.fetchApps({});

  expect(Fliplet.API.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: 'v1/apps'
    })
  );
});

test('fetchApps with all options applies all parameters', async () => {
  const result = await appsApi.fetchApps({
    organizationId: 123,
    fields: ['id', 'name', 'settings'],
    filters: { publisher: true, mergeable: true },
    sort: { field: 'name', order: 'asc' },
    pagination: { page: 1, limit: 50 }
  });

  expect(Fliplet.API.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: expect.stringContaining('organizationId=123')
    })
  );
});

test('fetchApps with invalid options throws error', async () => {
  await expect(
    appsApi.fetchApps({ organizationId: 'invalid' })
  ).rejects.toThrow('organizationId must be a number');
});
```

### Test Coverage

**Unit Tests:**

1. **ApiClient:**
   - Request construction with/without custom apiUrl
   - Header building with/without custom auth token
   - Retry logic on network errors
   - No retry on client errors (4xx)
   - Timeout handling
   - Response transformation

2. **StateManager:**
   - State initialization
   - State updates
   - State transitions
   - State validation
   - State clearing

3. **ValidationEngine:**
   - Duplicate detection
   - Permission validation
   - Configuration validation
   - Plan limit checking

4. **API Service Classes:**
   - Request construction from options
   - Response transformation based on fields
   - Include parameter handling
   - Filter application
   - Sort and pagination
   - Error handling

5. **Controller Classes:**
   - Workflow orchestration
   - Step validation
   - State management
   - Event emission
   - Error recovery

**Integration Tests:**

1. **Complete Workflow:**
   - Select destination app
   - Configure resources
   - Preview merge
   - Initiate merge
   - Monitor progress
   - Handle completion

2. **Error Scenarios:**
   - Lock expiration during configuration
   - Network error during merge
   - Validation failure at review step
   - Permission error during selection

3. **Lock Management:**
   - Lock acquisition
   - Lock extension
   - Lock expiration
   - Auto-unlock on cancel

**Mock Data:**

Located in `/tests/mocks/`:
- `apps.json`: Sample app data
- `organizations.json`: Sample organization data
- `pages.json`: Sample page data with associations
- `dataSources.json`: Sample data source data
- `media.json`: Sample file and folder data
- `mergeStatus.json`: Sample merge status responses

**Error Simulation:**

```javascript
// Simulate API errors
Fliplet.API.request.mockRejectedValueOnce({
  status: 404,
  message: 'App not found'
});

// Simulate network errors
Fliplet.API.request.mockRejectedValueOnce({
  status: 0,
  message: 'Network error'
});

// Simulate validation errors
Fliplet.API.request.mockRejectedValueOnce({
  status: 400,
  message: 'Duplicate screen names found',
  data: {
    pages: [{ title: 'Home', count: 2, ids: [1, 2] }]
  }
});
```

### Performance Considerations

**Caching Strategy:**
- Cache API responses by request parameters
- Default TTL: 5 minutes
- Cache key includes endpoint and sorted options JSON
- Cache invalidation on relevant mutations

**State Optimization:**
- Use immutable state updates
- Only emit events when state actually changes
- Batch state updates where possible
- Clear cache on configuration cancellation

**Memory Management:**
- Limit cache size (max 100 entries, LRU eviction)
- Clear state on completion/cancellation
- Unsubscribe from events when not needed
- Release WebSocket connections properly

## Success Metrics

### Functional Success

- **Workflow Enforcement:** Users cannot proceed past validation failures
- **Data Integrity:** Invalid data is caught before API calls
- **Error Recovery:** All error conditions have proper handling and user guidance
- **State Consistency:** Application state remains valid throughout configuration

### Technical Success

- **API Abstraction:** UI code never directly calls REST APIs, always goes through middleware
- **Code Reusability:** Middleware components can be reused across different UI implementations
- **Maintainability:** Clear separation of concerns, comprehensive documentation
- **Testability:** All components have comprehensive test coverage (>80%)

### Design Quality Success

- **Caller Agnosticism:** Middleware functions can serve any caller without modification
- **Parameter Clarity:** Every parameter describes behavior, not caller identity
- **Future-Proof Design:** Functions remain valid if UI completely changes
- **Self-Documenting:** Parameters are self-explanatory without referring to specific UI contexts
- **Behavioral Composition:** Complex behaviors can be achieved by combining simple options
- **Deterministic Behavior:** Same options always produce the same result

## Middleware Design Validation Checklist

Before finalizing implementation, validate each middleware function design against these criteria:

### Caller Agnosticism Validation

- [ ] Could this function serve a caller I haven't thought of yet?
- [ ] Are parameters describing *what to do* or *who is asking*?
- [ ] If the UI completely changes tomorrow, would this function still make sense?
- [ ] Can I explain every parameter's purpose without referring to specific screens or steps?

### Parameter Design Validation

- [ ] Are all behaviors explicitly opt-in through parameters?
- [ ] Is there any hidden branching based on caller identity?
- [ ] Are options objects used instead of positional parameters?
- [ ] Do all parameters have clear, self-documenting names?
- [ ] Are there any boolean flags that could be replaced with explicit enums?

### State & Caching Validation

- [ ] Do cache keys depend only on request parameters, not caller context?
- [ ] Is state structure deterministic based on data, not caller?
- [ ] Are cache control options explicitly provided to callers?
- [ ] Can the same parameters produce different results based on hidden state?

### API Integration Validation

- [ ] Are REST API responses transformed based on explicit options?
- [ ] Is there any caller-specific response formatting?
- [ ] Are API errors mapped consistently regardless of caller?
- [ ] Can callers control API request behavior through options?

### Documentation Validation

- [ ] Is there documentation explaining the design rationale without mentioning specific UIs?
- [ ] Are usage examples provided showing different option combinations?
- [ ] Are all parameters documented with their behavioral purpose?
- [ ] Is it clear which options are mutually exclusive or interdependent?

**If any checkbox cannot be checked, the design must be reconsidered.**

## File Structure Plan

```
/src/middleware/
├── core/
│   ├── BaseMiddleware.js
│   ├── StateManager.js
│   ├── ValidationEngine.js
│   ├── ErrorHandler.js
│   └── ApiClient.js
├── api/
│   ├── AppsApiService.js
│   ├── OrganizationsApiService.js
│   ├── PagesApiService.js
│   ├── DataSourcesApiService.js
│   ├── MediaApiService.js
│   └── MergeApiService.js
├── controllers/
│   ├── MergeConfigurationController.js
│   ├── AppLockController.js
│   ├── MergeExecutionController.js
│   └── ValidationController.js
├── config/
│   ├── endpoints.js
│   ├── validation-rules.js
│   ├── error-messages.js
│   └── defaults.js
├── utils/
│   ├── EventEmitter.js
│   ├── DataMapper.js
│   └── CacheManager.js
└── middleware.js (main entry point)
```

## Implementation Considerations

### Development Approach

- **No Module System:** Pure vanilla JavaScript with global namespace
- **Fliplet API Integration:** ALL HTTP requests must use Fliplet.API.request() (https://developers.fliplet.com/API/core/api.html)
- **Dependency Injection:** Constructor-based dependency injection for testability
- **Event-Driven:** Event system for component communication and UI updates
- **Self-Documenting:** Comprehensive JSDoc documentation for all public methods

### Testing Strategy

**Framework:** Jest

**Approach:**
- One test file per class, colocated with implementation
- Test all option combinations
- Verify deterministic behavior
- Test error conditions
- Mock Fliplet APIs globally

**Coverage:**
- Unit tests: >80% coverage
- Integration tests: Critical workflows
- E2E tests: Not in middleware scope (handled by UI layer)

### Performance Considerations

**Caching:**
- API responses cached by request parameters
- Default 5-minute TTL
- LRU eviction when cache full
- Cache cleared on configuration cancel/complete

**State:**
- Immutable state updates
- Event emission only on actual changes
- Batch updates where possible

**Memory:**
- Clear state on completion/cancellation
- Limit cache size (100 entries)
- Unsubscribe from events when done
- Release WebSocket connections

## Next Steps

This architecture plan should be reviewed for:

1. **Completeness:** All API endpoints and workflows covered
2. **Accuracy:** Proper mapping of requirements to components
3. **Feasibility:** Implementation approach is sound
4. **Scalability:** Architecture can grow with requirements
5. **Adherence to Principles:** Behavior-parameterized design enforced throughout

Once approved, this plan will be converted to implementation tasks using `generate-tasks.mdc`.
