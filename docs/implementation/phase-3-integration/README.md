# Phase 3: API Integration & Testing

## Overview

Replace mock data with real API calls and add robust error handling, lock management, and state persistence.

## Duration

Days 11-14 (4 days)

## Integration Tasks

### [3.1 Replace Mock Data](./3.1-replace-mock-data.md)

Systematically replace mock data with API middleware calls:

**For each screen:**
1. Remove mock data declarations
2. Add loading state management
3. Integrate appropriate middleware function
4. Handle API responses
5. Update UI based on real data
6. Test with actual backend

**Example transformation:**

```javascript
// Before (Mock Data)
data: function() {
  return {
    apps: mockApps
  };
}

// After (API Integration)
data: function() {
  return {
    apps: [],
    loading: false,
    error: null
  };
},
mounted: function() {
  this.fetchApps();
},
methods: {
  fetchApps: function() {
    var self = this;
    self.loading = true;

    MergeAPI.getApps({
      organizationId: this.selectedOrgId,
      publisher: true,
      mergeable: true
    })
    .then(function(response) {
      self.apps = response.apps;
      self.loading = false;
    })
    .catch(function(error) {
      self.error = error.message;
      self.loading = false;
      MergeUtils.showToast(error.message, 'error');
    });
  }
}
```

### [3.2 Error Handling & Edge Cases](./3.2-error-handling.md)

Implement comprehensive error handling for:

**Network Errors:**
- Connection timeout
- Network unavailable
- Server unreachable

**API Errors:**
- 401 Unauthorized - Redirect to login
- 403 Forbidden - Show permission error
- 404 Not Found - Resource doesn't exist
- 409 Conflict - Duplicate names, app locked
- 500 Server Error - Show generic error

**Business Logic Errors:**
- No apps available to merge
- Duplicate screen/data source names
- Plan limits exceeded
- Lock expired during configuration

**Error UI Components:**
```javascript
// Toast for minor errors
MergeUtils.showToast('Failed to load apps', 'error');

// Alert for contextual errors
<merge-alert type="danger" dismissible>
  {{ errorMessage }}
</merge-alert>

// Modal for critical errors
<merge-modal :show="showErrorModal" title="Error">
  <p>{{ criticalError }}</p>
  <template #footer>
    <merge-button @click="retry">Retry</merge-button>
    <merge-button variant="secondary" @click="cancel">Cancel</merge-button>
  </template>
</merge-modal>
```

### [3.3 Lock Management](./3.3-lock-management.md)

Implement the complete lock lifecycle:

**Lock Initiation:**
```javascript
// When destination app is selected
MergeAPI.lockApps(sourceAppId, targetApp, {
  lockedUntil: Date.now() + 10 * 60 * 1000 // 10 minutes
})
.then(function(response) {
  MergeState.lockInfo.lockedUntil = response.lockedUntil;
  startLockMonitoring();
});
```

**Auto-Extension:**
```javascript
// Check every minute
setInterval(function() {
  var timeRemaining = MergeState.lockInfo.lockedUntil - Date.now();
  var fiveMinutes = 5 * 60 * 1000;

  if (timeRemaining < fiveMinutes && timeRemaining > 0) {
    // User was active in last minute
    if (userWasActive()) {
      extendLock();
    }
  }
}, 60000);
```

**Manual Extension:**
```javascript
// When user clicks extend button
function extendLock() {
  MergeAPI.extendLock(sourceAppId, targetApp, {
    extendDuration: 5 * 60 * 1000 // 5 more minutes
  })
  .then(function(response) {
    MergeState.lockInfo.lockedUntil = response.lockedUntil;
    MergeState.lockInfo.lockExtensionCount++;
  });
}
```

**Lock Expiry Handling:**
```javascript
// When lock expires
function handleLockExpiry() {
  MergeUtils.showToast('Lock expired. Apps have been unlocked.', 'warning');
  // Clear state and redirect to dashboard
  MergeState.destinationApp = null;
  MergeStorage.clear();
  Fliplet.Navigate.screen(dashboardScreenId);
}
```

**Unlock on Cancel:**
```javascript
// When user cancels or closes
function cleanup() {
  if (MergeState.destinationApp) {
    MergeAPI.unlockApps(sourceAppId, targetApp, {})
      .then(function() {
        console.log('Apps unlocked');
      });
  }
}
```

### [3.4 State Persistence](./3.4-state-persistence.md)

Implement state recovery using `Fliplet.App.Storage`:

**Save State Periodically:**
```javascript
// Save whenever selections change
function onSelectionChange() {
  MergeStorage.saveState();
}

// Auto-save every 30 seconds
setInterval(function() {
  if (MergeState.destinationApp) {
    MergeStorage.saveState();
  }
}, 30000);
```

**Restore State on Load:**
```javascript
$(document).ready(function() {
  MergeStorage.restoreState().then(function(restored) {
    if (restored) {
      // Check if merge is in progress
      if (MergeState.mergeId) {
        // Navigate to execution screen
        Fliplet.Navigate.screen(executionScreenId);
      } else {
        // Resume configuration
        Fliplet.Navigate.screen(configureScreenId);
      }
    }
  });
});
```

**Clear State on Completion:**
```javascript
// After merge completes successfully
function onMergeComplete() {
  MergeStorage.clear();
  // Keep result in memory for completion screen
}
```

## Integration Order

1. **Dashboard Screen** - Simple, good starting point
2. **Select Destination** - Tests org/app APIs
3. **Configure Merge Tabs** - Most complex, test incremental
4. **Review & Merge** - Depends on preview API
5. **Execution** - Tests polling mechanism
6. **Completion** - Uses cached result

## Testing Strategy

### Unit Testing
- Test each API function individually
- Verify error handling for all status codes
- Test state persistence/restoration

### Integration Testing
- Test complete user flows
- Verify lock lifecycle
- Test recovery from errors
- Test state persistence across page reloads

### Edge Case Testing
- Network failures mid-flow
- API timeouts
- Lock expiry during configuration
- Duplicate names
- Plan limits exceeded
- Empty data scenarios

## Verification Checklist

- [ ] All mock data removed
- [ ] All API calls use middleware
- [ ] Loading states implemented
- [ ] Error handling comprehensive
- [ ] Lock lifecycle works correctly
- [ ] State persistence functional
- [ ] Recovery from errors graceful
- [ ] No console errors
- [ ] User feedback clear and helpful
- [ ] Performance acceptable

## Next Steps

After API integration is complete and tested, proceed to [Phase 4: Polish & Studio Integration](../phase-4-polish/README.md).

