# Error Handling Pattern

## When to Use

Implement error handling for all scenarios where operations might fail:

- API calls and network requests
- User input validation
- File operations
- Lock acquisition failures
- Permission errors
- Business logic violations

**Why it matters**: Graceful error handling prevents app crashes, provides helpful feedback to users, and enables recovery from failure states.

## Implementation

### 1. Basic Try-Catch Pattern

Standard error handling for async operations:

```javascript
import { ref } from 'vue';

setup() {
  const loading = ref(false);
  const error = ref(null);
  const data = ref(null);

  const fetchData = async () => {
    loading.value = true;
    error.value = null; // Clear previous errors

    try {
      data.value = await window.MergeAPI.getData();
    } catch (err) {
      // Extract user-friendly error message
      error.value = err.message || 'An unexpected error occurred';
      console.error('Error fetching data:', err);
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, data, fetchData };
}
```

### 2. Displaying Errors to Users

```vue
<template>
  <div class="component">
    <!-- Error State with Retry -->
    <div v-if="error" class="error-state">
      <merge-alert variant="danger" dismissible>
        <strong>Error:</strong> {{ error }}
        <div class="mt-2">
          <merge-button variant="secondary" size="sm" @click="retry">
            <i class="fa fa-refresh"></i> Retry
          </merge-button>
        </div>
      </merge-alert>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading">
      <merge-loading-spinner message="Loading..." />
    </div>

    <!-- Success State -->
    <div v-else>
      <!-- Your content -->
    </div>
  </div>
</template>

<script>
export default {
  setup() {
    const error = ref(null);
    const loading = ref(false);

    const fetchData = async () => {
      // ... fetch logic
    };

    const retry = () => {
      error.value = null;
      fetchData();
    };

    return { error, loading, retry };
  }
}
</script>
```

### 3. Error Type Handling

Handle different types of errors differently:

```javascript
const handleError = (err) => {
  // Network errors
  if (err.code === 'NETWORK_ERROR' || !navigator.onLine) {
    error.value = 'Network connection lost. Please check your internet connection.';
    return;
  }

  // Authentication errors
  if (err.status === 401 || err.status === 403) {
    error.value = 'You do not have permission to perform this action.';
    // Optionally redirect to login
    return;
  }

  // Lock errors
  if (err.code === 'LOCK_HELD') {
    error.value = `This app is currently locked by ${err.lockedBy}. Please try again later.`;
    return;
  }

  // Validation errors
  if (err.code === 'VALIDATION_ERROR') {
    error.value = err.details?.join(', ') || 'Invalid input provided.';
    return;
  }

  // Not found errors
  if (err.status === 404) {
    error.value = 'The requested resource was not found.';
    return;
  }

  // Server errors
  if (err.status >= 500) {
    error.value = 'Server error occurred. Please try again later.';
    return;
  }

  // Default error message
  error.value = err.message || 'An unexpected error occurred.';
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;

  try {
    data.value = await window.MergeAPI.getData();
  } catch (err) {
    handleError(err);
    console.error('Error details:', err);
  } finally {
    loading.value = false;
  }
};
```

### 4. Global Error Handling

For errors that affect the entire app:

```javascript
// Set global error state
window.MergeState.error = {
  message: 'Failed to load application data',
  code: 'INIT_ERROR',
  timestamp: Date.now()
};

// Clear global error
window.MergeState.error = null;

// Display global error in app root
const globalError = computed(() => window.MergeState.error);
```

```vue
<template>
  <div id="app">
    <!-- Global error banner -->
    <div v-if="globalError" class="global-error">
      <merge-alert variant="danger" dismissible @close="clearGlobalError">
        {{ globalError.message }}
      </merge-alert>
    </div>

    <!-- App content -->
    <router-view />
  </div>
</template>
```

### 5. Field-Level Validation Errors

For form validation:

```javascript
import { ref, reactive } from 'vue';

setup() {
  const form = reactive({
    appName: '',
    description: ''
  });

  const errors = reactive({
    appName: null,
    description: null
  });

  const validateField = (field, value) => {
    // Clear previous error
    errors[field] = null;

    switch (field) {
      case 'appName':
        if (!value || value.trim() === '') {
          errors[field] = 'App name is required';
        } else if (value.length < 3) {
          errors[field] = 'App name must be at least 3 characters';
        }
        break;

      case 'description':
        if (value && value.length > 500) {
          errors[field] = 'Description must not exceed 500 characters';
        }
        break;
    }

    return !errors[field];
  };

  const validateForm = () => {
    let isValid = true;

    Object.keys(form).forEach(field => {
      if (!validateField(field, form[field])) {
        isValid = false;
      }
    });

    return isValid;
  };

  const submit = async () => {
    if (!validateForm()) {
      return;
    }

    // Proceed with submission
    try {
      await window.MergeAPI.createApp(form);
    } catch (err) {
      // Handle submission error
    }
  };

  return { form, errors, validateField, submit };
}
```

```vue
<template>
  <form @submit.prevent="submit">
    <div class="form-group">
      <label for="appName">App Name *</label>
      <input
        id="appName"
        v-model="form.appName"
        @blur="validateField('appName', form.appName)"
        :class="{ 'is-invalid': errors.appName }"
        type="text"
        class="form-control"
      />
      <div v-if="errors.appName" class="invalid-feedback">
        {{ errors.appName }}
      </div>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        @blur="validateField('description', form.description)"
        :class="{ 'is-invalid': errors.description }"
        class="form-control"
      ></textarea>
      <div v-if="errors.description" class="invalid-feedback">
        {{ errors.description }}
      </div>
    </div>

    <merge-button type="submit" variant="primary">
      Submit
    </merge-button>
  </form>
</template>

<style scoped>
.form-control.is-invalid {
  border-color: var(--danger-color);
}

.invalid-feedback {
  display: block;
  color: var(--danger-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}
</style>
```

## Best Practices

### Do:
- Always wrap async operations in try-catch blocks
- Clear previous errors before new operations
- Provide user-friendly error messages (not technical jargon)
- Log detailed errors to console for debugging
- Offer retry mechanisms when appropriate
- Display errors prominently but not intrusively
- Handle different error types appropriately
- Validate input before submission

### Don't:
- Don't show raw error objects to users
- Don't silently swallow errors (always log them)
- Don't use generic "An error occurred" for all errors
- Don't forget to reset error state when retrying
- Don't block the entire UI for non-critical errors
- Don't expose sensitive information in error messages
- Don't forget to handle network timeouts

## Error Message Guidelines

### User-Friendly Messages

```javascript
// ❌ WRONG: Technical jargon
error.value = 'ERR_NETWORK_TIMEOUT: XMLHttpRequest failed at line 42';

// ✅ CORRECT: User-friendly explanation
error.value = 'The request timed out. Please check your connection and try again.';
```

### Actionable Messages

```javascript
// ❌ WRONG: No guidance
error.value = 'Operation failed';

// ✅ CORRECT: Tell user what to do
error.value = 'Unable to save changes. Please ensure all required fields are filled and try again.';
```

### Contextual Messages

```javascript
// ❌ WRONG: Generic
error.value = 'Error loading data';

// ✅ CORRECT: Specific context
error.value = 'Failed to load screens for "My App". The app may have been deleted.';
```

## Retry Mechanisms

### Simple Retry

```javascript
const retry = () => {
  error.value = null;
  fetchData();
};
```

### Automatic Retry with Exponential Backoff

```javascript
const fetchDataWithRetry = async (maxRetries = 3) => {
  let retries = 0;
  let delay = 1000; // Start with 1 second

  while (retries < maxRetries) {
    try {
      loading.value = true;
      data.value = await window.MergeAPI.getData();
      return; // Success
    } catch (err) {
      retries++;

      if (retries >= maxRetries) {
        // Final attempt failed
        error.value = `Failed after ${maxRetries} attempts: ${err.message}`;
        console.error('Max retries reached:', err);
        return;
      }

      // Wait before retrying (exponential backoff)
      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Double the delay for next retry
    } finally {
      loading.value = false;
    }
  }
};
```

## Graceful Degradation

When data fails to load, show partial UI:

```vue
<template>
  <div class="app-details">
    <!-- Always show app name if available -->
    <h2>{{ app?.name || 'Unknown App' }}</h2>

    <!-- Show screens if loaded -->
    <div v-if="screens && !screensError" class="screens-section">
      <h3>Screens</h3>
      <div v-for="screen in screens" :key="screen.id">
        {{ screen.title }}
      </div>
    </div>

    <!-- Show error for screens, but don't block entire UI -->
    <merge-alert v-else-if="screensError" variant="warning">
      Unable to load screens: {{ screensError }}
      <merge-button size="sm" @click="retryScreens">Retry</merge-button>
    </merge-alert>

    <!-- Data sources loaded independently -->
    <div v-if="dataSources && !dataSourcesError">
      <!-- ... -->
    </div>
  </div>
</template>
```

## Common Pitfalls

### Pitfall 1: Not Clearing Previous Errors

```javascript
// ❌ WRONG: Old error persists
const fetchData = async () => {
  loading.value = true;
  try {
    data.value = await api.getData();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// ✅ CORRECT: Clear error before fetching
const fetchData = async () => {
  loading.value = true;
  error.value = null; // Clear previous error
  try {
    data.value = await api.getData();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
```

### Pitfall 2: Exposing Sensitive Information

```javascript
// ❌ WRONG: Exposes API keys, tokens, etc.
error.value = err.stack; // Contains sensitive data

// ✅ CORRECT: Show safe message only
error.value = err.message || 'An error occurred';
console.error('Full error details:', err); // Log for debugging
```

### Pitfall 3: Not Handling Network Offline

```javascript
// ✅ CORRECT: Check network status
const fetchData = async () => {
  if (!navigator.onLine) {
    error.value = 'No internet connection. Please check your network.';
    return;
  }

  try {
    data.value = await window.MergeAPI.getData();
  } catch (err) {
    handleError(err);
  }
};

// Listen for network status changes
window.addEventListener('online', () => {
  if (error.value?.includes('internet connection')) {
    error.value = null;
    fetchData(); // Auto-retry when back online
  }
});
```

## Accessibility

### Error Announcements

```vue
<template>
  <!-- Visual error -->
  <merge-alert v-if="error" variant="danger">
    {{ error }}
  </merge-alert>

  <!-- Screen reader announcement -->
  <div v-if="error" role="alert" aria-live="assertive" class="sr-only">
    Error: {{ error }}
  </div>
</template>
```

### Focus Management

```javascript
import { ref, nextTick } from 'vue';

setup() {
  const errorRef = ref(null);

  const fetchData = async () => {
    try {
      // ... fetch logic
    } catch (err) {
      error.value = err.message;

      // Move focus to error message for screen readers
      await nextTick();
      errorRef.value?.focus();
    }
  };

  return { errorRef, fetchData };
}
```

```vue
<template>
  <div
    v-if="error"
    ref="errorRef"
    tabindex="-1"
    role="alert"
  >
    <merge-alert variant="danger">{{ error }}</merge-alert>
  </div>
</template>
```

## Related Patterns

- [Loading States](loading-states.md) - Handle loading during async operations
- [API Calls](api-calls.md) - Make API requests with error handling
- [Form Validation](form-validation.md) - Validate user input

## Related Documentation

- [COMPONENT_TEMPLATE.md](../COMPONENT_TEMPLATE.md#template-3-component-with-api-integration) - API integration with errors
- [AGENT_GUIDELINES.md](../AGENT_GUIDELINES.md#2-error-boundaries-for-all-async-operations) - Error handling requirements

---

**Last Updated**: December 18, 2024
**Pattern Category**: Error Management
**Difficulty**: Beginner
