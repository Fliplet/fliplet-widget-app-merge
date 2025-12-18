# State Persistence Pattern

## When to Use

Persist application state to enable recovery after:

- Browser refresh
- Navigation between screens
- Session timeout
- App crashes
- User closing and reopening the app

**Why it matters**: Users lose their progress if state isn't persisted. This pattern ensures a seamless experience even after interruptions.

## Implementation

### 1. Basic State Persistence

Save and restore essential merge state:

```javascript
import { onMounted, watch } from 'vue';

setup() {
  // Save state whenever it changes
  const saveState = () => {
    const stateToSave = {
      sourceApp: window.MergeState.sourceApp,
      destinationApp: window.MergeState.destinationApp,
      selectedScreens: window.MergeState.selectedScreens,
      selectedDataSources: window.MergeState.selectedDataSources,
      selectedFiles: window.MergeState.selectedFiles,
      currentStep: window.MergeState.currentStep,
      timestamp: Date.now()
    };

    window.MergeStorage.set('mergeState', stateToSave);
    console.log('State saved:', stateToSave);
  };

  // Restore state on mount
  onMounted(() => {
    const savedState = window.MergeStorage.get('mergeState');

    if (savedState && isStateValid(savedState)) {
      restoreState(savedState);
    }
  });

  const isStateValid = (state) => {
    // Check if state is recent (within 24 hours)
    const age = Date.now() - (state.timestamp || 0);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (age > maxAge) {
      console.log('State too old, ignoring');
      return false;
    }

    // Validate required fields
    return state.sourceApp && state.destinationApp;
  };

  const restoreState = (state) => {
    window.MergeState.sourceApp = state.sourceApp;
    window.MergeState.destinationApp = state.destinationApp;
    window.MergeState.selectedScreens = state.selectedScreens || [];
    window.MergeState.selectedDataSources = state.selectedDataSources || [];
    window.MergeState.selectedFiles = state.selectedFiles || [];
    window.MergeState.currentStep = state.currentStep || 0;

    console.log('State restored:', state);
  };

  return { saveState };
}
```

### 2. Auto-Save with Debouncing

Automatically save state after changes, with debouncing to avoid excessive writes:

```javascript
import { watch } from 'vue';

setup() {
  let saveTimer = null;

  const debouncedSave = () => {
    // Clear existing timer
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    // Save after 1 second of inactivity
    saveTimer = setTimeout(() => {
      saveState();
    }, 1000);
  };

  // Watch for changes in global state
  watch(
    () => ({
      sourceApp: window.MergeState.sourceApp,
      destinationApp: window.MergeState.destinationApp,
      selectedScreens: [...window.MergeState.selectedScreens],
      selectedDataSources: [...window.MergeState.selectedDataSources]
    }),
    () => {
      debouncedSave();
    },
    { deep: true }
  );

  const saveState = () => {
    const state = {
      sourceApp: window.MergeState.sourceApp,
      destinationApp: window.MergeState.destinationApp,
      selectedScreens: window.MergeState.selectedScreens,
      selectedDataSources: window.MergeState.selectedDataSources,
      currentStep: window.MergeState.currentStep,
      timestamp: Date.now()
    };

    window.MergeStorage.set('mergeState', state);
  };

  return { saveState };
}
```

### 3. Saving Complex Objects

Handle nested objects and arrays:

```javascript
const saveComplexState = () => {
  const state = {
    // Simple values
    currentStep: window.MergeState.currentStep,

    // Arrays
    selectedScreens: window.MergeState.selectedScreens.map(screen => ({
      id: screen.id,
      title: screen.title,
      order: screen.order
    })),

    // Nested objects
    sourceApp: {
      id: window.MergeState.sourceApp.id,
      name: window.MergeState.sourceApp.name,
      organizationId: window.MergeState.sourceApp.organizationId
    },

    // Timestamps
    savedAt: Date.now()
  };

  // MergeStorage handles JSON serialization
  window.MergeStorage.set('mergeState', state);
};

const restoreComplexState = () => {
  const state = window.MergeStorage.get('mergeState');

  if (!state) return false;

  // Restore objects
  window.MergeState.sourceApp = state.sourceApp;

  // Restore arrays
  window.MergeState.selectedScreens = state.selectedScreens || [];

  // Restore simple values
  window.MergeState.currentStep = state.currentStep || 0;

  return true;
};
```

### 4. Multiple Storage Keys

Organize state by feature:

```javascript
const saveMergeSelections = () => {
  window.MergeStorage.set('merge:selections', {
    screens: window.MergeState.selectedScreens,
    dataSources: window.MergeState.selectedDataSources,
    files: window.MergeState.selectedFiles,
    timestamp: Date.now()
  });
};

const saveMergeOptions = () => {
  window.MergeStorage.set('merge:options', {
    mode: window.MergeState.mergeMode, // 'full' or 'partial'
    conflictResolution: window.MergeState.conflictResolution,
    createBackup: window.MergeState.createBackup,
    timestamp: Date.now()
  });
};

const saveAppContext = () => {
  window.MergeStorage.set('merge:apps', {
    source: {
      id: window.MergeState.sourceApp.id,
      name: window.MergeState.sourceApp.name
    },
    destination: {
      id: window.MergeState.destinationApp.id,
      name: window.MergeState.destinationApp.name
    },
    timestamp: Date.now()
  });
};

// Restore all storage
const restoreAllState = () => {
  const selections = window.MergeStorage.get('merge:selections');
  const options = window.MergeStorage.get('merge:options');
  const apps = window.MergeStorage.get('merge:apps');

  if (selections) {
    window.MergeState.selectedScreens = selections.screens || [];
    window.MergeState.selectedDataSources = selections.dataSources || [];
    window.MergeState.selectedFiles = selections.files || [];
  }

  if (options) {
    window.MergeState.mergeMode = options.mode;
    window.MergeState.conflictResolution = options.conflictResolution;
    window.MergeState.createBackup = options.createBackup;
  }

  if (apps) {
    // Note: Only restore IDs, fetch full app data from API
    return {
      sourceAppId: apps.source?.id,
      destinationAppId: apps.destination?.id
    };
  }

  return null;
};
```

### 5. Recovery After Errors

Handle corrupted or invalid state:

```javascript
const recoverState = () => {
  try {
    const rawState = window.MergeStorage.get('mergeState');

    if (!rawState) {
      console.log('No saved state found');
      return false;
    }

    // Validate state structure
    if (!isValidStateStructure(rawState)) {
      console.error('Invalid state structure, clearing');
      window.MergeStorage.remove('mergeState');
      return false;
    }

    // Check if state is stale
    const age = Date.now() - (rawState.timestamp || 0);
    if (age > 24 * 60 * 60 * 1000) { // 24 hours
      console.log('State is stale, clearing');
      window.MergeStorage.remove('mergeState');
      return false;
    }

    // Restore state
    restoreState(rawState);
    return true;
  } catch (err) {
    console.error('Error recovering state:', err);
    // Clear corrupted state
    window.MergeStorage.remove('mergeState');
    return false;
  }
};

const isValidStateStructure = (state) => {
  // Check required fields
  if (!state || typeof state !== 'object') {
    return false;
  }

  // Validate source app
  if (!state.sourceApp || !state.sourceApp.id) {
    return false;
  }

  // Validate destination app
  if (!state.destinationApp || !state.destinationApp.id) {
    return false;
  }

  // Validate arrays
  if (!Array.isArray(state.selectedScreens)) {
    return false;
  }

  return true;
};
```

### 6. Clearing State

Clean up state when merge completes or is cancelled:

```javascript
const clearMergeState = () => {
  // Clear all merge-related storage
  window.MergeStorage.remove('mergeState');
  window.MergeStorage.remove('merge:selections');
  window.MergeStorage.remove('merge:options');
  window.MergeStorage.remove('merge:apps');

  // Reset global state
  window.MergeState.sourceApp = null;
  window.MergeState.destinationApp = null;
  window.MergeState.selectedScreens = [];
  window.MergeState.selectedDataSources = [];
  window.MergeState.selectedFiles = [];
  window.MergeState.currentStep = 0;
  window.MergeState.lock = null;

  console.log('Merge state cleared');
};

// Clear state after successful merge
const completeMerge = async () => {
  try {
    await performMerge();
    clearMergeState();
    showSuccessMessage('Merge completed successfully!');
  } catch (err) {
    console.error('Merge failed:', err);
    // Keep state so user can retry
  }
};

// Clear state when user cancels
const cancelMerge = () => {
  const confirmed = confirm('Are you sure you want to cancel? All selections will be lost.');

  if (confirmed) {
    clearMergeState();
    router.push('/');
  }
};
```

## Best Practices

### Do:
- Save state after significant changes
- Validate state before restoring
- Check state age and discard if too old
- Handle corrupted or invalid state gracefully
- Clear state after successful completion
- Use debouncing to avoid excessive saves
- Store only essential data (not full API responses)
- Include timestamps with saved state

### Don't:
- Don't store sensitive data (passwords, tokens)
- Don't store large binary data (images, files)
- Don't blindly trust saved state
- Don't forget to handle JSON serialization errors
- Don't store full API responses (store IDs instead)
- Don't keep stale state indefinitely
- Don't save on every keystroke (use debouncing)

## Storage API

### MergeStorage Methods

```javascript
// Set a value
window.MergeStorage.set('key', value);

// Get a value
const value = window.MergeStorage.get('key');

// Remove a value
window.MergeStorage.remove('key');

// Clear all stored data
window.MergeStorage.clear();

// Check if key exists
const exists = window.MergeStorage.has('key');

// Get all keys
const keys = window.MergeStorage.keys();
```

### Storage Limits

```javascript
// Check storage size (varies by browser)
const getStorageSize = () => {
  let total = 0;
  const keys = window.MergeStorage.keys();

  keys.forEach(key => {
    const value = window.MergeStorage.get(key);
    const size = JSON.stringify(value).length;
    total += size;
  });

  return total; // Bytes
};

// Typical limit is 5-10 MB for localStorage
const STORAGE_LIMIT = 5 * 1024 * 1024; // 5 MB

if (getStorageSize() > STORAGE_LIMIT * 0.9) {
  console.warn('Storage almost full, clearing old data');
  clearOldState();
}
```

## State Versioning

Handle state schema changes:

```javascript
const STATE_VERSION = 2;

const saveStateWithVersion = () => {
  const state = {
    version: STATE_VERSION,
    data: {
      sourceApp: window.MergeState.sourceApp,
      destinationApp: window.MergeState.destinationApp,
      // ... other state
    },
    timestamp: Date.now()
  };

  window.MergeStorage.set('mergeState', state);
};

const restoreStateWithMigration = () => {
  const state = window.MergeStorage.get('mergeState');

  if (!state) return false;

  // Migrate old versions
  if (!state.version || state.version < STATE_VERSION) {
    const migrated = migrateState(state, state.version || 1, STATE_VERSION);
    window.MergeStorage.set('mergeState', migrated);
    return restoreState(migrated.data);
  }

  return restoreState(state.data);
};

const migrateState = (state, fromVersion, toVersion) => {
  let migrated = { ...state };

  // Migrate from v1 to v2
  if (fromVersion === 1 && toVersion >= 2) {
    migrated = {
      version: 2,
      data: {
        ...state, // v1 had data at root level
        // Add new fields for v2
        selectedFiles: []
      },
      timestamp: state.timestamp || Date.now()
    };
  }

  return migrated;
};
```

## Common Pitfalls

### Pitfall 1: Not Validating Restored State

```javascript
// ❌ WRONG: Blindly trust saved state
const state = window.MergeStorage.get('mergeState');
window.MergeState.sourceApp = state.sourceApp; // Might be undefined!

// ✅ CORRECT: Validate before using
const state = window.MergeStorage.get('mergeState');
if (state && state.sourceApp && state.sourceApp.id) {
  window.MergeState.sourceApp = state.sourceApp;
}
```

### Pitfall 2: Storing Circular References

```javascript
// ❌ WRONG: Circular reference causes error
const state = {
  app: window.MergeState.sourceApp
};
state.app.circular = state; // Circular reference
window.MergeStorage.set('state', state); // Error!

// ✅ CORRECT: Store only serializable data
const state = {
  app: {
    id: window.MergeState.sourceApp.id,
    name: window.MergeState.sourceApp.name
    // No circular references
  }
};
window.MergeStorage.set('state', state);
```

### Pitfall 3: Not Clearing State After Completion

```javascript
// ❌ WRONG: State persists forever
const completeMerge = async () => {
  await performMerge();
  router.push('/success');
  // State still in storage!
};

// ✅ CORRECT: Clear state when done
const completeMerge = async () => {
  await performMerge();
  clearMergeState();
  router.push('/success');
};
```

## Recovery UX

Show recovery prompt to users:

```vue
<template>
  <div id="app">
    <!-- Recovery banner -->
    <merge-alert v-if="showRecovery" variant="info" dismissible @close="dismissRecovery">
      <strong>Previous session detected</strong>
      <p>Would you like to continue your previous merge?</p>
      <div class="mt-2">
        <merge-button size="sm" variant="primary" @click="restoreSession">
          Continue
        </merge-button>
        <merge-button size="sm" variant="secondary" @click="startFresh">
          Start Fresh
        </merge-button>
      </div>
    </merge-alert>

    <!-- App content -->
    <router-view />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const showRecovery = ref(false);

    onMounted(() => {
      const savedState = window.MergeStorage.get('mergeState');

      if (savedState && isStateValid(savedState)) {
        showRecovery.value = true;
      }
    });

    const restoreSession = () => {
      const state = window.MergeStorage.get('mergeState');
      restoreState(state);
      showRecovery.value = false;

      // Navigate to last step
      router.push(`/step-${state.currentStep}`);
    };

    const startFresh = () => {
      clearMergeState();
      showRecovery.value = false;
    };

    const dismissRecovery = () => {
      showRecovery.value = false;
    };

    return { showRecovery, restoreSession, startFresh, dismissRecovery };
  }
}
</script>
```

## Related Patterns

- [API Calls](api-calls.md) - Fetch data after restoring state
- [Lock Management](lock-management.md) - Restore and validate locks
- [Error Handling](error-handling.md) - Handle restore failures

## Related Documentation

- [GLOSSARY.md](../GLOSSARY.md#mergestorage) - MergeStorage documentation
- [AGENT_GUIDELINES.md](../AGENT_GUIDELINES.md#5-state-persistence-via-mergestorage) - Persistence requirements

---

**Last Updated**: December 18, 2024
**Pattern Category**: State Management
**Difficulty**: Intermediate
