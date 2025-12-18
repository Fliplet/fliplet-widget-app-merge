# Loading States Pattern

## When to Use

Use loading states whenever your component performs asynchronous operations:

- Fetching data from API
- Processing long-running operations
- Waiting for user actions to complete
- Loading resources (images, files, etc.)

**Why it matters**: Users need visual feedback that something is happening. Without loading states, users may think the app is frozen or broken.

## Implementation

### 1. Component-Level Loading

Use this approach when a single component fetches its own data.

```javascript
import { ref } from 'vue';

setup() {
  const loading = ref(false);
  const data = ref(null);
  const error = ref(null);

  const fetchData = async () => {
    loading.value = true;
    error.value = null;

    try {
      data.value = await window.MergeAPI.getData();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false; // Always runs, even if error
    }
  };

  return { loading, data, error, fetchData };
}
```

**Template usage**:

```vue
<template>
  <div class="component">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <merge-loading-spinner />
      <p>Loading data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <merge-alert variant="danger">{{ error }}</merge-alert>
    </div>

    <!-- Success State -->
    <div v-else-if="data">
      <!-- Your data here -->
      {{ data }}
    </div>

    <!-- Empty State -->
    <div v-else>
      <p>No data available</p>
    </div>
  </div>
</template>
```

### 2. Multiple Concurrent Requests

When fetching multiple resources at once:

```javascript
import { ref, computed } from 'vue';

setup() {
  const loadingApps = ref(false);
  const loadingDataSources = ref(false);
  const loadingScreens = ref(false);

  // Computed property for overall loading state
  const isLoading = computed(() => {
    return loadingApps.value || loadingDataSources.value || loadingScreens.value;
  });

  const loadAll = async () => {
    loadingApps.value = true;
    loadingDataSources.value = true;
    loadingScreens.value = true;

    try {
      // Fetch in parallel
      const [apps, dataSources, screens] = await Promise.all([
        window.MergeAPI.getApps(orgId),
        window.MergeAPI.getDataSources(appId),
        window.MergeAPI.getScreens(appId)
      ]);

      // Process results...
    } catch (err) {
      // Handle error
    } finally {
      loadingApps.value = false;
      loadingDataSources.value = false;
      loadingScreens.value = false;
    }
  };

  return { isLoading, loadingApps, loadingDataSources, loadingScreens, loadAll };
}
```

### 3. Global Loading State (MergeState)

For operations that affect multiple components:

```javascript
// Component A - Start loading
window.MergeState.loading.apps = true;

try {
  const apps = await window.MergeAPI.getApps(orgId);
  window.MergeState.apps = apps;
} finally {
  window.MergeState.loading.apps = false;
}

// Component B - React to loading
import { computed } from 'vue';

setup() {
  const isLoadingApps = computed(() => {
    return window.MergeState.loading.apps;
  });

  return { isLoadingApps };
}
```

**Template in Component B**:

```vue
<template>
  <div v-if="isLoadingApps">
    <merge-loading-spinner message="Loading apps..." />
  </div>
  <div v-else>
    <!-- Display apps -->
  </div>
</template>
```

## Loading UI Components

### Using MergeLoadingSpinner

```vue
<!-- Small inline spinner -->
<merge-loading-spinner size="sm" />

<!-- Default size with message -->
<merge-loading-spinner message="Loading data..." />

<!-- Large spinner with overlay -->
<merge-loading-spinner size="lg" overlay message="Processing merge..." />
```

### Using MergeProgressBar

For operations with known progress:

```vue
<template>
  <div>
    <merge-progress-bar
      :value="progress"
      variant="primary"
      show-label
      animated
    />
    <p>{{ statusMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const progress = ref(0);
    const statusMessage = ref('Starting...');

    const processItems = async (items) => {
      for (let i = 0; i < items.length; i++) {
        await processItem(items[i]);
        progress.value = Math.round(((i + 1) / items.length) * 100);
        statusMessage.value = `Processing ${i + 1} of ${items.length}...`;
      }
    };

    return { progress, statusMessage, processItems };
  }
}
</script>
```

### Skeleton Screens

For content-heavy components, use skeleton screens instead of spinners:

```vue
<template>
  <div class="card-list">
    <!-- Loading state with skeletons -->
    <div v-if="loading" class="skeleton-container">
      <div v-for="i in 5" :key="i" class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
    </div>

    <!-- Actual content -->
    <merge-card v-else v-for="item in items" :key="item.id">
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
    </merge-card>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
}

.skeleton-title,
.skeleton-text {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: var(--spacing-sm);
}

.skeleton-title {
  height: 24px;
  width: 60%;
}

.skeleton-text {
  height: 16px;
  width: 100%;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

## Best Practices

### Do:
- Always set `loading = true` before async operation
- Always set `loading = false` in `finally` block
- Show descriptive loading messages
- Use spinners for short operations (< 3 seconds)
- Use progress bars for long operations with known duration
- Use skeleton screens for content-heavy interfaces
- Disable buttons during loading to prevent duplicate requests

### Don't:
- Don't forget to set `loading = false` if operation fails
- Don't show loading states for operations < 300ms (feels janky)
- Don't use multiple loading indicators for the same operation
- Don't block the entire UI unless absolutely necessary
- Don't forget to handle the case where data is empty (not loading, no error, but no data)

## Accessibility

### ARIA Attributes

```vue
<div
  v-if="loading"
  role="status"
  aria-live="polite"
  aria-busy="true"
>
  <merge-loading-spinner />
  <span class="sr-only">Loading data, please wait...</span>
</div>
```

### Screen Reader Announcements

```vue
<template>
  <div>
    <!-- Visual loading indicator -->
    <merge-loading-spinner v-if="loading" />

    <!-- Screen reader announcement -->
    <div v-if="loading" class="sr-only" role="status" aria-live="polite">
      Loading {{ resourceName }}, please wait...
    </div>
  </div>
</template>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

## Common Pitfalls

### Pitfall 1: Forgetting to Reset Loading State

```javascript
// ❌ WRONG: Loading never resets if error occurs
const fetchData = async () => {
  loading.value = true;
  data.value = await api.getData(); // Throws error
  loading.value = false; // Never reached!
};

// ✅ CORRECT: Use finally block
const fetchData = async () => {
  loading.value = true;
  try {
    data.value = await api.getData();
  } finally {
    loading.value = false; // Always runs
  }
};
```

### Pitfall 2: Showing Loading State for Cached Data

```javascript
// ✅ CORRECT: Check cache first
const fetchData = async () => {
  // Check if data is already loaded
  if (window.MergeState.apps.length > 0) {
    apps.value = window.MergeState.apps;
    return; // Don't show loading for cached data
  }

  loading.value = true;
  try {
    apps.value = await window.MergeAPI.getApps(orgId);
  } finally {
    loading.value = false;
  }
};
```

### Pitfall 3: Not Handling Empty State

```vue
<!-- ❌ WRONG: Shows nothing when data is empty array -->
<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </div>
</template>

<!-- ✅ CORRECT: Show empty state -->
<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="items.length === 0">
    <merge-alert variant="info">No items found</merge-alert>
  </div>
  <div v-else>
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </div>
</template>
```

## Related Patterns

- [Error Handling](error-handling.md) - Handle errors during loading
- [API Calls](api-calls.md) - Make API requests with loading states
- [State Persistence](state-persistence.md) - Save loading state for recovery

## Related Documentation

- [COMPONENT_TEMPLATE.md](../COMPONENT_TEMPLATE.md#template-3-component-with-api-integration) - API integration template
- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md#mergeloadingspinner) - Loading spinner component
- [AGENT_GUIDELINES.md](../AGENT_GUIDELINES.md#3-loading-states-for-all-data-fetching) - Loading state requirements

---

**Last Updated**: December 18, 2024
**Pattern Category**: UI Feedback
**Difficulty**: Beginner
