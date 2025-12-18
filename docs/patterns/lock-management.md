# Lock Management Pattern

## When to Use

Implement lock management when working with the destination app to prevent concurrent modifications:

- Selecting destination app
- Starting merge process
- Making changes to destination app
- Navigating away from merge flow
- Detecting lock expiry

**Why it matters**: Locks prevent data corruption from simultaneous edits and ensure merge integrity. Without proper lock management, multiple users could corrupt app data.

## Implementation

### 1. Acquiring a Lock

Acquire lock when user selects destination app:

```javascript
import { ref } from 'vue';

setup() {
  const loading = ref(false);
  const error = ref(null);
  const lockAcquired = ref(false);

  const selectDestination = async (app) => {
    loading.value = true;
    error.value = null;

    try {
      // Attempt to acquire lock (15 minutes)
      const lock = await window.MergeAPI.acquireLock({
        appId: app.id,
        duration: 900 // 15 minutes in seconds
      });

      // Store lock info in global state
      window.MergeState.lock = lock;
      window.MergeState.destinationApp = app;
      lockAcquired.value = true;

      // Start lock timer to monitor expiry
      startLockTimer();

      console.log('Lock acquired:', lock);
    } catch (err) {
      if (err.code === 'LOCK_HELD') {
        error.value = `This app is currently locked by ${err.lockedBy}. Please try again later.`;
      } else {
        error.value = err.message || 'Failed to acquire lock';
      }
      console.error('Lock acquisition failed:', err);
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, lockAcquired, selectDestination };
}
```

### 2. Lock Timer and Auto-Extend

Monitor lock and auto-extend before expiry:

```javascript
import { ref, onBeforeUnmount } from 'vue';

setup() {
  let lockTimer = null;
  const lockTimeRemaining = ref(0);

  const startLockTimer = () => {
    // Clear any existing timer
    if (lockTimer) {
      clearInterval(lockTimer);
    }

    // Update every second
    lockTimer = setInterval(() => {
      const lock = window.MergeState.lock;
      if (!lock || !lock.expiresAt) {
        clearInterval(lockTimer);
        return;
      }

      // Calculate time remaining
      const remaining = lock.expiresAt - Date.now();
      lockTimeRemaining.value = Math.max(0, remaining);

      // Auto-extend if less than 2 minutes remaining
      if (remaining < 2 * 60 * 1000 && remaining > 0) {
        extendLock();
      }

      // Lock expired
      if (remaining <= 0) {
        handleLockExpiry();
      }
    }, 1000);
  };

  const extendLock = async () => {
    const lock = window.MergeState.lock;
    if (!lock) return;

    try {
      const extendedLock = await window.MergeAPI.extendLock({
        appId: window.MergeState.destinationApp.id,
        lockId: lock.id,
        duration: 900 // Extend by 15 minutes
      });

      window.MergeState.lock = extendedLock;
      console.log('Lock extended:', extendedLock);
    } catch (err) {
      console.error('Failed to extend lock:', err);
      // Lock might have expired or been released
      handleLockExpiry();
    }
  };

  const handleLockExpiry = () => {
    clearInterval(lockTimer);
    lockTimer = null;

    // Clear lock from state
    window.MergeState.lock = null;

    // Show error message
    window.MergeState.error = {
      message: 'Your lock has expired. Please select the destination app again.',
      code: 'LOCK_EXPIRED'
    };

    // Optionally redirect to app selection
    // router.push('/select-destination');
  };

  // Clean up timer on component unmount
  onBeforeUnmount(() => {
    if (lockTimer) {
      clearInterval(lockTimer);
    }
  });

  return { lockTimeRemaining, startLockTimer, extendLock };
}
```

### 3. Displaying Lock Status

Show lock timer to user:

```vue
<template>
  <div class="lock-status">
    <merge-lock-timer
      v-if="lock"
      :locked-until="lock.expiresAt"
      @expired="handleLockExpiry"
      @extend="extendLock"
    />
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  setup() {
    const lock = computed(() => window.MergeState.lock);

    const handleLockExpiry = () => {
      // Handle expired lock
      alert('Lock has expired. Please reselect the destination app.');
    };

    const extendLock = async () => {
      try {
        const extended = await window.MergeAPI.extendLock({
          appId: window.MergeState.destinationApp.id,
          lockId: lock.value.id,
          duration: 900
        });

        window.MergeState.lock = extended;
      } catch (err) {
        console.error('Failed to extend lock:', err);
      }
    };

    return { lock, handleLockExpiry, extendLock };
  }
}
</script>
```

### 4. Releasing a Lock

Release lock when done or navigating away:

```javascript
const releaseLock = async () => {
  const lock = window.MergeState.lock;
  if (!lock) return;

  try {
    await window.MergeAPI.releaseLock({
      appId: window.MergeState.destinationApp.id,
      lockId: lock.id
    });

    // Clear lock from state
    window.MergeState.lock = null;

    console.log('Lock released successfully');
  } catch (err) {
    console.error('Failed to release lock:', err);
    // Lock might have already expired - clear it anyway
    window.MergeState.lock = null;
  }
};

// Release lock when user cancels merge
const cancelMerge = async () => {
  await releaseLock();
  // Navigate back
  router.push('/');
};

// Release lock on component unmount
import { onBeforeUnmount } from 'vue';

onBeforeUnmount(async () => {
  await releaseLock();
});
```

### 5. Handling Lock Conflicts

Deal with locks held by other users:

```vue
<template>
  <div class="destination-selector">
    <!-- App is locked by another user -->
    <merge-card v-if="lockConflict" class="lock-conflict">
      <merge-alert variant="warning">
        <strong>App Locked</strong>
        <p>
          {{ lockConflict.app.name }} is currently locked by
          {{ lockConflict.lockedBy }} until
          {{ formatTime(lockConflict.expiresAt) }}.
        </p>
        <p class="mt-2">
          <merge-button size="sm" @click="checkLockStatus">
            Check Again
          </merge-button>
          <merge-button size="sm" variant="secondary" @click="selectDifferentApp">
            Choose Different App
          </merge-button>
        </p>
      </merge-alert>
    </merge-card>

    <!-- Normal app selection -->
    <div v-else>
      <!-- App selection UI -->
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const lockConflict = ref(null);

    const selectDestination = async (app) => {
      try {
        const lock = await window.MergeAPI.acquireLock({
          appId: app.id,
          duration: 900
        });

        window.MergeState.lock = lock;
        window.MergeState.destinationApp = app;
        lockConflict.value = null;

        // Proceed with merge
      } catch (err) {
        if (err.code === 'LOCK_HELD') {
          lockConflict.value = {
            app: app,
            lockedBy: err.lockedBy,
            expiresAt: err.expiresAt
          };
        } else {
          // Handle other errors
          console.error('Error acquiring lock:', err);
        }
      }
    };

    const checkLockStatus = async () => {
      if (!lockConflict.value) return;

      // Retry acquiring lock
      await selectDestination(lockConflict.value.app);
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    };

    return { lockConflict, selectDestination, checkLockStatus, formatTime };
  }
}
</script>
```

### 6. Navigation Guards

Prevent navigation without releasing lock:

```javascript
// In Vue Router setup
import { onBeforeRouteLeave } from 'vue-router';

setup() {
  onBeforeRouteLeave(async (to, from, next) => {
    const lock = window.MergeState.lock;

    if (lock) {
      const confirmed = confirm(
        'You have an active lock on the destination app. ' +
        'Leaving will release the lock. Are you sure?'
      );

      if (confirmed) {
        await releaseLock();
        next();
      } else {
        next(false); // Cancel navigation
      }
    } else {
      next(); // No lock, proceed
    }
  });

  return {};
}
```

## Best Practices

### Do:
- Acquire lock before modifying destination app
- Start timer immediately after acquiring lock
- Auto-extend lock before it expires (2-3 minutes before)
- Release lock when merge completes or is cancelled
- Handle lock expiry gracefully
- Show lock status to users
- Prevent navigation without releasing lock
- Clear lock from state when expired or released

### Don't:
- Don't modify destination app without a lock
- Don't forget to release lock on unmount
- Don't ignore lock expiry
- Don't acquire multiple locks on the same app
- Don't let locks expire during active operations
- Don't bypass lock checks
- Don't forget to handle lock conflicts

## Lock State Management

### Lock Object Structure

```javascript
{
  id: 'lock-123456',
  appId: 123,
  userId: 456,
  userName: 'John Doe',
  acquiredAt: 1634567890000, // Timestamp
  expiresAt: 1634568790000,  // Timestamp
  duration: 900 // Seconds
}
```

### Global State Integration

```javascript
// MergeState.lock structure
window.MergeState.lock = {
  id: 'lock-123',
  appId: 123,
  expiresAt: Date.now() + (15 * 60 * 1000),
  // ... other lock properties
};

// Check if lock exists and is valid
const hasValidLock = () => {
  const lock = window.MergeState.lock;
  return lock && lock.expiresAt > Date.now();
};

// Get time remaining on lock
const getLockTimeRemaining = () => {
  const lock = window.MergeState.lock;
  if (!lock || !lock.expiresAt) return 0;
  return Math.max(0, lock.expiresAt - Date.now());
};
```

## Accessibility

### Lock Timer Announcements

```vue
<template>
  <div class="lock-timer">
    <!-- Visual timer -->
    <merge-lock-timer
      :locked-until="lock.expiresAt"
      @expired="handleExpiry"
    />

    <!-- Screen reader announcements -->
    <div v-if="timeRemaining < 2 * 60 * 1000" role="alert" aria-live="assertive" class="sr-only">
      Lock expires in {{ Math.ceil(timeRemaining / 60000) }} minutes
    </div>

    <div v-if="timeRemaining === 0" role="alert" aria-live="assertive" class="sr-only">
      Lock has expired
    </div>
  </div>
</template>
```

## Common Pitfalls

### Pitfall 1: Not Releasing Lock on Error

```javascript
// ❌ WRONG: Lock not released if error occurs
const performMerge = async () => {
  const lock = await acquireLock();
  await executeMerge(); // Might throw error
  await releaseLock(); // Never reached if error
};

// ✅ CORRECT: Always release lock
const performMerge = async () => {
  let lock = null;
  try {
    lock = await acquireLock();
    await executeMerge();
  } finally {
    if (lock) {
      await releaseLock();
    }
  }
};
```

### Pitfall 2: Not Cleaning Up Timer

```javascript
// ❌ WRONG: Timer continues after component unmounts
setup() {
  let timer = setInterval(() => checkLock(), 1000);
  return {};
}

// ✅ CORRECT: Clean up on unmount
import { onBeforeUnmount } from 'vue';

setup() {
  let timer = setInterval(() => checkLock(), 1000);

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  return {};
}
```

### Pitfall 3: Extending Lock Too Late

```javascript
// ❌ WRONG: Wait until last second to extend
if (timeRemaining < 5000) { // 5 seconds
  extendLock(); // Might be too late
}

// ✅ CORRECT: Extend with buffer time
if (timeRemaining < 2 * 60 * 1000) { // 2 minutes
  extendLock(); // Plenty of time
}
```

## Lock Expiry Recovery

```javascript
const handleLockExpiry = async () => {
  // Save current state
  window.MergeStorage.set('mergeState', {
    sourceApp: window.MergeState.sourceApp,
    destinationApp: window.MergeState.destinationApp,
    selectedItems: window.MergeState.selectedScreens,
    timestamp: Date.now()
  });

  // Clear expired lock
  window.MergeState.lock = null;

  // Show recovery modal
  showModal({
    title: 'Lock Expired',
    message: 'Your lock has expired. Would you like to reacquire it and continue?',
    actions: [
      {
        label: 'Reacquire Lock',
        variant: 'primary',
        handler: async () => {
          await selectDestination(window.MergeState.destinationApp);
          // Restore selections
          restoreMergeState();
        }
      },
      {
        label: 'Start Over',
        variant: 'secondary',
        handler: () => {
          window.MergeStorage.clear();
          router.push('/');
        }
      }
    ]
  });
};
```

## Related Patterns

- [API Calls](api-calls.md) - Make lock-related API requests
- [Error Handling](error-handling.md) - Handle lock errors
- [State Persistence](state-persistence.md) - Save state during lock operations

## Related Documentation

- [GLOSSARY.md](../GLOSSARY.md#lock) - Lock terminology
- [AGENT_GUIDELINES.md](../AGENT_GUIDELINES.md#4-lock-management-for-destination-app-modifications) - Lock requirements

---

**Last Updated**: December 18, 2024
**Pattern Category**: State Management
**Difficulty**: Advanced
