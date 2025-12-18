# API Calls Pattern

## When to Use

Use the MergeAPI middleware for all API interactions:

- Fetching apps, screens, data sources
- Creating or updating resources
- Acquiring and managing locks
- Executing merge operations
- Any communication with Fliplet API

**Why it matters**: The MergeAPI middleware provides consistent error handling, loading states, request/response formatting, and centralized API logic.

## Implementation

### 1. Basic API Call

Simple GET request to fetch data:

```javascript
import { ref, onMounted } from 'vue';

setup() {
  const loading = ref(false);
  const error = ref(null);
  const apps = ref([]);

  const fetchApps = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await window.MergeAPI.getApps({
        organizationId: window.MergeState.organizationId,
        includeArchived: false
      });

      apps.value = response.apps || [];
    } catch (err) {
      error.value = err.message || 'Failed to load apps';
      console.error('Error fetching apps:', err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch on component mount
  onMounted(() => {
    fetchApps();
  });

  return { loading, error, apps, fetchApps };
}
```

### 2. API Call with Parameters

POST/PUT request with data:

```javascript
const createDataSource = async (name, columns) => {
  loading.value = true;
  error.value = null;

  try {
    const response = await window.MergeAPI.createDataSource({
      appId: window.MergeState.destinationApp.id,
      name: name,
      columns: columns
    });

    // Update global state
    window.MergeState.dataSources.push(response.dataSource);

    return response.dataSource;
  } catch (err) {
    error.value = err.message || 'Failed to create data source';
    console.error('Error creating data source:', err);
    throw err; // Re-throw for caller to handle
  } finally {
    loading.value = false;
  }
};
```

### 3. Parallel API Calls

Fetch multiple resources simultaneously:

```javascript
import { ref, onMounted } from 'vue';

setup() {
  const loading = ref(false);
  const error = ref(null);
  const screens = ref([]);
  const dataSources = ref([]);
  const mediaFiles = ref([]);

  const loadAllData = async () => {
    loading.value = true;
    error.value = null;

    try {
      const appId = window.MergeState.sourceApp.id;

      // Fetch all resources in parallel
      const [screensData, dataSourcesData, filesData] = await Promise.all([
        window.MergeAPI.getScreens({ appId }),
        window.MergeAPI.getDataSources({ appId }),
        window.MergeAPI.getMediaFiles({ appId })
      ]);

      screens.value = screensData.screens || [];
      dataSources.value = dataSourcesData.dataSources || [];
      mediaFiles.value = filesData.files || [];
    } catch (err) {
      error.value = err.message || 'Failed to load app data';
      console.error('Error loading data:', err);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadAllData();
  });

  return { loading, error, screens, dataSources, mediaFiles, loadAllData };
}
```

### 4. Sequential API Calls

When one call depends on the result of another:

```javascript
const initializeMerge = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Step 1: Acquire lock on destination app
    const lock = await window.MergeAPI.acquireLock({
      appId: destinationApp.value.id,
      duration: 900 // 15 minutes in seconds
    });

    window.MergeState.lock = lock;

    // Step 2: Fetch destination app details (needs lock first)
    const appDetails = await window.MergeAPI.getAppDetails({
      appId: destinationApp.value.id
    });

    window.MergeState.destinationAppDetails = appDetails;

    // Step 3: Analyze merge conflicts (needs app details)
    const analysis = await window.MergeAPI.analyzeMerge({
      sourceAppId: sourceApp.value.id,
      destinationAppId: destinationApp.value.id,
      selectedItems: window.MergeState.selectedScreens
    });

    conflicts.value = analysis.conflicts || [];
  } catch (err) {
    error.value = err.message || 'Failed to initialize merge';
    console.error('Error in merge initialization:', err);

    // Release lock if we acquired it
    if (window.MergeState.lock) {
      await releaseLock();
    }

    throw err;
  } finally {
    loading.value = false;
  }
};
```

### 5. Pagination Pattern

Handle paginated API responses:

```javascript
import { ref, computed } from 'vue';

setup() {
  const loading = ref(false);
  const error = ref(null);
  const items = ref([]);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const pageSize = ref(20);

  const fetchPage = async (page) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await window.MergeAPI.getScreens({
        appId: window.MergeState.sourceApp.id,
        page: page,
        perPage: pageSize.value
      });

      items.value = response.screens || [];
      currentPage.value = response.currentPage || page;
      totalPages.value = response.totalPages || 1;
    } catch (err) {
      error.value = err.message || 'Failed to load items';
      console.error('Error fetching page:', err);
    } finally {
      loading.value = false;
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      fetchPage(currentPage.value + 1);
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      fetchPage(currentPage.value - 1);
    }
  };

  const canGoNext = computed(() => currentPage.value < totalPages.value);
  const canGoPrev = computed(() => currentPage.value > 1);

  return {
    loading,
    error,
    items,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    fetchPage
  };
}
```

### 6. Debounced API Calls

For search/filter operations to avoid excessive requests:

```javascript
import { ref, watch } from 'vue';

setup() {
  const searchQuery = ref('');
  const searchResults = ref([]);
  const loading = ref(false);
  let debounceTimer = null;

  const performSearch = async (query) => {
    if (!query || query.trim() === '') {
      searchResults.value = [];
      return;
    }

    loading.value = true;

    try {
      const response = await window.MergeAPI.searchApps({
        organizationId: window.MergeState.organizationId,
        query: query.trim()
      });

      searchResults.value = response.apps || [];
    } catch (err) {
      console.error('Search error:', err);
      searchResults.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Watch search query and debounce API calls
  watch(searchQuery, (newQuery) => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    debounceTimer = setTimeout(() => {
      performSearch(newQuery);
    }, 300); // Wait 300ms after user stops typing
  });

  return { searchQuery, searchResults, loading };
}
```

## Best Practices

### Do:
- Always use `window.MergeAPI` methods (never direct `fetch()` or `Fliplet.API`)
- Include loading and error states for all API calls
- Clear errors before new requests
- Log errors to console for debugging
- Handle different HTTP status codes appropriately
- Use `Promise.all()` for independent parallel requests
- Debounce search/filter operations
- Validate parameters before making requests
- Update global state (`MergeState`) after successful operations

### Don't:
- Don't make direct API calls bypassing middleware
- Don't forget to handle errors
- Don't ignore loading states
- Don't make the same request multiple times simultaneously
- Don't block UI during long operations without feedback
- Don't expose API tokens or sensitive data in error messages
- Don't forget to clean up (release locks, clear timers, etc.)

## Request/Response Patterns

### Standard Request Format

```javascript
const response = await window.MergeAPI.methodName({
  // Required parameters
  appId: 123,
  organizationId: 456,

  // Optional parameters
  includeArchived: false,
  page: 1,
  perPage: 20
});
```

### Standard Response Format

```javascript
{
  // Success response
  success: true,
  data: {
    apps: [...],
    screens: [...],
    // ... resource data
  },

  // Pagination (if applicable)
  currentPage: 1,
  totalPages: 5,
  totalCount: 100,

  // Metadata
  timestamp: 1634567890123
}
```

### Error Response Format

```javascript
{
  success: false,
  error: {
    message: 'User-friendly error message',
    code: 'ERROR_CODE',
    status: 404,
    details: { /* Additional context */ }
  }
}
```

## Error Handling by Status Code

```javascript
const handleApiError = (err) => {
  switch (err.status) {
    case 400:
      return 'Invalid request. Please check your input.';

    case 401:
      return 'Authentication required. Please log in again.';

    case 403:
      return 'You do not have permission to perform this action.';

    case 404:
      return 'The requested resource was not found.';

    case 409:
      return 'Conflict detected. The resource may have been modified.';

    case 423:
      return 'Resource is locked. Please try again later.';

    case 429:
      return 'Too many requests. Please wait a moment and try again.';

    case 500:
    case 502:
    case 503:
      return 'Server error. Please try again later.';

    default:
      return err.message || 'An unexpected error occurred.';
  }
};

const fetchData = async () => {
  try {
    const response = await window.MergeAPI.getData();
    return response;
  } catch (err) {
    error.value = handleApiError(err);
    console.error('API Error:', err);
  }
};
```

## Caching Strategies

### Simple In-Memory Cache

```javascript
const cache = {
  apps: null,
  appsTimestamp: null,
  cacheDuration: 5 * 60 * 1000 // 5 minutes
};

const fetchApps = async (useCache = true) => {
  // Check cache first
  if (useCache && cache.apps && cache.appsTimestamp) {
    const age = Date.now() - cache.appsTimestamp;
    if (age < cache.cacheDuration) {
      console.log('Using cached apps');
      apps.value = cache.apps;
      return;
    }
  }

  // Cache miss or expired - fetch fresh data
  loading.value = true;
  try {
    const response = await window.MergeAPI.getApps({
      organizationId: window.MergeState.organizationId
    });

    apps.value = response.apps;

    // Update cache
    cache.apps = response.apps;
    cache.appsTimestamp = Date.now();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Invalidate cache when data changes
const createApp = async (appData) => {
  const newApp = await window.MergeAPI.createApp(appData);

  // Invalidate apps cache
  cache.apps = null;
  cache.appsTimestamp = null;

  return newApp;
};
```

## Common Pitfalls

### Pitfall 1: Not Handling Race Conditions

```javascript
// ❌ WRONG: Multiple simultaneous requests
const fetchApps = async () => {
  loading.value = true;
  const response = await window.MergeAPI.getApps(orgId);
  apps.value = response.apps; // Last request wins, may be outdated
  loading.value = false;
};

// ✅ CORRECT: Cancel or ignore outdated requests
let currentRequestId = 0;

const fetchApps = async () => {
  const requestId = ++currentRequestId;
  loading.value = true;

  try {
    const response = await window.MergeAPI.getApps(orgId);

    // Only update if this is still the latest request
    if (requestId === currentRequestId) {
      apps.value = response.apps;
    }
  } finally {
    if (requestId === currentRequestId) {
      loading.value = false;
    }
  }
};
```

### Pitfall 2: Not Cleaning Up on Component Unmount

```javascript
// ✅ CORRECT: Cancel requests on unmount
import { onBeforeUnmount } from 'vue';

setup() {
  let isMounted = true;

  const fetchData = async () => {
    loading.value = true;
    try {
      const response = await window.MergeAPI.getData();
      if (isMounted) {
        data.value = response.data;
      }
    } finally {
      if (isMounted) {
        loading.value = false;
      }
    }
  };

  onBeforeUnmount(() => {
    isMounted = false;
  });

  return { fetchData };
}
```

### Pitfall 3: Forgetting to Update Global State

```javascript
// ❌ WRONG: State out of sync
const selectApp = async (appId) => {
  const app = await window.MergeAPI.getApp({ appId });
  selectedApp.value = app; // Only local state updated
};

// ✅ CORRECT: Update global state
const selectApp = async (appId) => {
  const app = await window.MergeAPI.getApp({ appId });
  selectedApp.value = app;
  window.MergeState.sourceApp = app; // Update global state
};
```

## Related Patterns

- [Loading States](loading-states.md) - Handle loading during API calls
- [Error Handling](error-handling.md) - Handle API errors gracefully
- [Lock Management](lock-management.md) - Acquire and manage locks via API

## Related Documentation

- [MIDDLEWARE_GUIDELINES.md](../MIDDLEWARE_GUIDELINES.md) - Detailed API middleware documentation
- [COMPONENT_TEMPLATE.md](../COMPONENT_TEMPLATE.md#template-3-component-with-api-integration) - API integration template
- [AGENT_GUIDELINES.md](../AGENT_GUIDELINES.md#1-all-api-calls-through-mergeapi-middleware) - API call requirements

---

**Last Updated**: December 18, 2024
**Pattern Category**: Data Management
**Difficulty**: Intermediate
