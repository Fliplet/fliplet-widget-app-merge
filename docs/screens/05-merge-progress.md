# Merge Progress Screen

## Purpose

The Merge Progress screen displays real-time status updates during merge execution. It shows stage-by-stage progress, live log messages, and estimated completion time. Users cannot cancel once started, but can close the window (merge continues in background).

**User Goals**:
- Monitor merge progress in real-time
- Understand current stage and remaining work
- Review log messages for details
- Identify errors if they occur
- Gain confidence through transparent process
- Know estimated completion time

---

## URL/Route

**Path**: `/merge-progress` or `#/merge-progress`

**Query Parameters**:
- `jobId`: Required. Merge job ID from API
- Example: `#/merge-progress?jobId=merge-job-abc123`

**Prerequisites**:
- User clicked "Start Merge" from Review screen
- Merge job created and started
- Job ID available

---

## Layout Structure

### Screen Container
```
┌─────────────────────────────────────────────┐
│ Header: Merge in Progress                   │
│ Estimated Time: 2-5 minutes                 │
├─────────────────────────────────────────────┤
│ Progress Stages                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ✅ Stage 1: Preparing merge (Complete)  │ │
│ │ ━━━━━━━━━━━━━━━━━━━━ 100%              │ │
│ │                                         │ │
│ │ ✅ Stage 2: Merging files (Complete)    │ │
│ │ ━━━━━━━━━━━━━━━━━━━━ 100% (2/2)        │ │
│ │                                         │ │
│ │ ⏳ Stage 3: Merging screens (Active)    │ │
│ │ ━━━━━━━━━━━━━━━━     37% (3/8)         │ │
│ │ Currently: Merging screen "User List"...│ │
│ │                                         │ │
│ │ ⏸️ Stage 4: Merging data sources       │ │
│ │ ━━━━━                 0% (0/2)          │ │
│ │ Waiting...                              │ │
│ │                                         │ │
│ │ ⏸️ Stage 5: Merging settings            │ │
│ │ ━━━━━                 0% (0/2)          │ │
│ │ Waiting...                              │ │
│ │                                         │ │
│ │ ⏸️ Stage 6: Finalizing                  │ │
│ │ ━━━━━                 0%                │ │
│ │ Waiting...                              │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Overall Progress                            │
│ ━━━━━━━━━━━━━━━━       42% complete        │
├─────────────────────────────────────────────┤
│ Log Messages (Scrollable)                   │
│ ┌─────────────────────────────────────────┐ │
│ │ [14:32:15] Starting merge operation...  │ │
│ │ [14:32:16] Lock acquired on source app  │ │
│ │ [14:32:16] Lock acquired on dest app    │ │
│ │ [14:32:18] Creating version snapshot... │ │
│ │ [14:32:20] Copying file: logo.png       │ │
│ │ [14:32:21] Copying file: banner.jpg     │ │
│ │ [14:32:22] Merging screen: Home         │ │
│ │ [14:32:25] Copying dependencies...      │ │
│ │ [14:32:27] Merging screen: User List... │ │
│ │ ...                                     │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Info & Actions                              │
│ ℹ️ You can close this window. Merge will   │
│   continue in background. You'll be         │
│   notified when complete.                   │
│                                             │
│ [Close] (allowed, merge continues)          │
└─────────────────────────────────────────────┘
```

### 1. Header Section

**Content**:
- Title (H1): "Merge in Progress"
- Source → Destination
- Estimated time: "2-5 minutes" or "About 3 minutes remaining"
- Progress icon (animated spinner)

**Visual**:
```
🔄 Merge in Progress

Sales Conference 2024  →  Production 2024 App

Estimated time: About 3 minutes remaining
```

### 2. Progress Stages

**Purpose**: Show 6 sequential stages with status

**Stages**:
1. **Preparing merge** - Initial setup, validation, snapshots
2. **Merging files** - Copying files and folders
3. **Merging screens** - Copying/overwriting screens
4. **Merging data sources** - Updating DS structure and/or data
5. **Merging settings** - Applying app-level configurations
6. **Finalizing** - Cleanup, releasing locks, sending notifications

**Stage States**:
- **COMPLETE** (✅): Green checkmark, 100% progress bar, "Complete" text
- **ACTIVE** (⏳): Blue spinner, partial progress bar, current action text
- **PENDING** (⏸️): Gray, 0% progress bar, "Waiting..." text
- **ERROR** (❌): Red X, partial progress, error message

**Stage Visual** (Complete):
```
✅ Stage 2: Merging files (Complete)
━━━━━━━━━━━━━━━━━━━━ 100% (2/2 files)
```

**Stage Visual** (Active):
```
⏳ Stage 3: Merging screens (In Progress)
━━━━━━━━━━━━━━━━     37% (3/8 screens)
Currently: Merging screen "User List"...
Copying dependencies for screen...
```

**Stage Visual** (Pending):
```
⏸️ Stage 4: Merging data sources
━━━━━                 0% (0/2)
Waiting...
```

**Stage Visual** (Error):
```
❌ Stage 4: Merging data sources (Error)
━━━━━━━━━━━━━━━━     50% (1/2 completed, 1 failed)
Error: Failed to merge "Users" data source
[Retry] [Skip] [View Details]
```

### 3. Overall Progress

**Purpose**: Show total completion percentage

**Content**:
- Progress bar (0-100%)
- Percentage text
- Items completed / total items

**Visual**:
```
Overall Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━     42% complete
(5 of 12 items merged)
```

**Calculation**:
```javascript
// Weight stages by estimated time
const stageWeights = {
  preparing: 10,
  files: 15,
  screens: 30,
  dataSources: 25,
  settings: 15,
  finalizing: 5
};

const overallProgress = calculateWeightedProgress(stages, stageWeights);
```

### 4. Log Messages Panel

**Purpose**: Show detailed, timestamped log messages

**Content**:
- Scrollable container (max height: 400px)
- Auto-scrolls to bottom as new messages arrive
- Timestamped entries ([HH:MM:SS] format)
- Color-coded by type:
  - **Info**: Black text (default)
  - **Success**: Green text
  - **Warning**: Orange text
  - **Error**: Red text

**Example Log**:
```
[14:32:15] Starting merge operation...
[14:32:16] ✓ Lock acquired on source app (ID: 123456)
[14:32:16] ✓ Lock acquired on destination app (ID: 789012)
[14:32:18] Creating version snapshot...
[14:32:20] Copying file: Images/logo.png
[14:32:21] ✓ File copied successfully (45 KB)
[14:32:21] Copying file: Images/banner.jpg
[14:32:22] ✓ File copied successfully (120 KB)
[14:32:22] Merging screen: Home (ID: 55001)
[14:32:25] Copying dependencies for Home screen...
[14:32:27] ✓ Screen merged successfully
[14:32:27] Merging screen: User List (ID: 55002)
[14:32:30] ⚠️ Warning: Screen uses unselected data source
[14:32:30] Copying dependencies...
[14:32:33] ✓ Screen merged successfully
...
```

**Icons**:
- ✓ (green checkmark): Success
- ⚠️ (orange warning): Warning
- ❌ (red X): Error
- ℹ️ (blue info): Info

### 5. Info & Actions

**Notice**:
```
ℹ️ You can close this window. The merge will continue in the
   background. You'll receive a notification when complete.
```

**Action Button**:
- **Close**: Closes overlay, merge continues
  - Does NOT cancel merge
  - User can reopen via Studio notification

**No Cancel Button**: Cannot cancel once merge started

---

## Component Breakdown

### ProgressStage Component

**Purpose**: Display individual stage with status and progress

**Props**:
- `stage`: Object with status, progress, details
- `number`: Stage number (1-6)

**Template**:
```vue
<template>
  <div :class="['progress-stage', `status-${stage.status}`]">
    <div class="stage-header">
      <i :class="stageIcon" class="stage-icon"></i>
      <h3 class="stage-title">
        Stage {{ number }}: {{ stage.name }}
        <span class="stage-status">({{ stageStatusText }})</span>
      </h3>
    </div>

    <merge-progress-bar
      :progress="stage.progress"
      :variant="stageProgressVariant" />

    <p class="stage-details">
      {{ stage.progress }}%
      <span v-if="stage.itemCount">
        ({{ stage.itemsCompleted }}/{{ stage.itemCount }} {{ stage.itemLabel }})
      </span>
    </p>

    <p v-if="stage.currentAction" class="current-action">
      {{ stage.currentAction }}
    </p>

    <div v-if="stage.status === 'error'" class="stage-error">
      <p class="error-message">{{ stage.errorMessage }}</p>
      <div class="error-actions">
        <merge-button variant="secondary" size="small" @click="retryStage">
          Retry
        </merge-button>
        <merge-button variant="secondary" size="small" @click="skipStage">
          Skip
        </merge-button>
        <merge-button variant="link" size="small" @click="viewErrorDetails">
          View Details
        </merge-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['stage', 'number']);

const stageIcon = computed(() => {
  switch (props.stage.status) {
    case 'complete':
      return 'fa fa-check-circle text-success';
    case 'active':
      return 'fa fa-spinner fa-spin text-primary';
    case 'error':
      return 'fa fa-times-circle text-danger';
    default:
      return 'fa fa-pause-circle text-muted';
  }
});

const stageStatusText = computed(() => {
  switch (props.stage.status) {
    case 'complete': return 'Complete';
    case 'active': return 'In Progress';
    case 'error': return 'Error';
    default: return 'Pending';
  }
});

const stageProgressVariant = computed(() => {
  switch (props.stage.status) {
    case 'complete': return 'success';
    case 'active': return 'primary';
    case 'error': return 'danger';
    default: return 'secondary';
  }
});
</script>

<style scoped>
.progress-stage {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  border-left: 4px solid transparent;
}

.status-complete {
  border-left-color: var(--success-color);
  background: #f0fff4;
}

.status-active {
  border-left-color: var(--primary-color);
  background: #f0f8ff;
}

.status-error {
  border-left-color: var(--danger-color);
  background: #fff5f5;
}

.stage-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.stage-icon {
  font-size: 24px;
}

.stage-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.current-action {
  font-size: var(--font-size-sm);
  color: var(--info-color);
  margin-top: var(--spacing-xs);
  font-style: italic;
}

.stage-error {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: #fff;
  border: 1px solid var(--danger-color);
  border-radius: var(--border-radius);
}

.error-message {
  color: var(--danger-color);
  margin-bottom: var(--spacing-sm);
}

.error-actions {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
```

### LogPanel Component

**Purpose**: Scrollable log with auto-scroll and filtering

**Props**:
- `messages`: Array of log message objects
- `autoScroll`: Boolean (default: true)

**Template**:
```vue
<template>
  <div class="log-panel">
    <div class="log-header">
      <h3>Activity Log</h3>
      <div class="log-controls">
        <label>
          <input type="checkbox" v-model="autoScroll" />
          Auto-scroll
        </label>
        <button @click="clearLogs" class="clear-btn">Clear</button>
      </div>
    </div>

    <div ref="logContainer" class="log-container">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['log-entry', `log-${msg.type}`]">
        <span class="log-timestamp">[{{ formatTime(msg.timestamp) }}]</span>
        <i v-if="msg.icon" :class="['fa', msg.icon]"></i>
        <span class="log-message">{{ msg.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps(['messages']);
const autoScroll = ref(true);
const logContainer = ref(null);

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const clearLogs = () => {
  // Implementation
};

// Auto-scroll to bottom when new messages arrive
watch(() => props.messages.length, () => {
  if (autoScroll.value) {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    });
  }
});
</script>

<style scoped>
.log-panel {
  margin-top: var(--spacing-lg);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  background: #f5f5f5;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: var(--font-size-sm);
}

.log-entry {
  margin-bottom: var(--spacing-xs);
  line-height: 1.6;
}

.log-timestamp {
  color: var(--info-color);
  margin-right: var(--spacing-xs);
}

.log-info .log-message {
  color: var(--secondary-color);
}

.log-success .log-message {
  color: var(--success-color);
}

.log-warning .log-message {
  color: var(--warning-color);
}

.log-error .log-message {
  color: var(--danger-color);
}
</style>
```

---

## Mock Data

### Progress Stages
```javascript
const mockProgressStages = [
  {
    id: 1,
    name: 'Preparing merge',
    status: 'complete',
    progress: 100,
    itemCount: 0,
    itemsCompleted: 0,
    currentAction: null
  },
  {
    id: 2,
    name: 'Merging files',
    status: 'complete',
    progress: 100,
    itemCount: 2,
    itemsCompleted: 2,
    itemLabel: 'files',
    currentAction: null
  },
  {
    id: 3,
    name: 'Merging screens',
    status: 'active',
    progress: 37.5,
    itemCount: 8,
    itemsCompleted: 3,
    itemLabel: 'screens',
    currentAction: 'Merging screen: User List...'
  },
  {
    id: 4,
    name: 'Merging data sources',
    status: 'pending',
    progress: 0,
    itemCount: 2,
    itemsCompleted: 0,
    itemLabel: 'data sources',
    currentAction: 'Waiting...'
  },
  {
    id: 5,
    name: 'Merging settings',
    status: 'pending',
    progress: 0,
    itemCount: 2,
    itemsCompleted: 0,
    itemLabel: 'settings',
    currentAction: 'Waiting...'
  },
  {
    id: 6,
    name: 'Finalizing',
    status: 'pending',
    progress: 0,
    itemCount: 0,
    itemsCompleted: 0,
    currentAction: 'Waiting...'
  }
];
```

### Log Messages
```javascript
const mockLogMessages = [
  {
    timestamp: '2024-12-18T14:32:15.000Z',
    type: 'info',
    message: 'Starting merge operation...'
  },
  {
    timestamp: '2024-12-18T14:32:16.000Z',
    type: 'success',
    icon: 'fa-check',
    message: 'Lock acquired on source app (ID: 123456)'
  },
  {
    timestamp: '2024-12-18T14:32:16.000Z',
    type: 'success',
    icon: 'fa-check',
    message: 'Lock acquired on destination app (ID: 789012)'
  },
  {
    timestamp: '2024-12-18T14:32:18.000Z',
    type: 'info',
    message: 'Creating version snapshot...'
  },
  {
    timestamp: '2024-12-18T14:32:20.000Z',
    type: 'info',
    message: 'Copying file: Images/logo.png'
  },
  {
    timestamp: '2024-12-18T14:32:21.000Z',
    type: 'success',
    icon: 'fa-check',
    message: 'File copied successfully (45 KB)'
  },
  {
    timestamp: '2024-12-18T14:32:27.000Z',
    type: 'info',
    message: 'Merging screen: User List (ID: 55002)'
  },
  {
    timestamp: '2024-12-18T14:32:30.000Z',
    type: 'warning',
    icon: 'fa-exclamation-triangle',
    message: 'Warning: Screen uses unselected data source "Settings"'
  }
];
```

---

## API Integration

### Poll Progress Status

**Endpoint**: `GET /v1/merge/:jobId/status`

**Polling Frequency**: Every 2 seconds

**Example Request**:
```javascript
const jobId = new URLSearchParams(window.location.search).get('jobId');

const pollProgress = async () => {
  const status = await MergeAPI.getMergeStatus(jobId);
  updateProgressUI(status);

  if (status.status === 'complete' || status.status === 'failed') {
    stopPolling();
    navigateToComplete();
  }
};

// Poll every 2 seconds
const pollInterval = setInterval(pollProgress, 2000);
```

**Example Response** (In Progress):
```json
{
  "jobId": "merge-job-abc123",
  "status": "in_progress",
  "overallProgress": 42,
  "stages": [
    {
      "id": 1,
      "name": "Preparing merge",
      "status": "complete",
      "progress": 100
    },
    {
      "id": 2,
      "name": "Merging files",
      "status": "complete",
      "progress": 100,
      "itemsCompleted": 2,
      "itemCount": 2
    },
    {
      "id": 3,
      "name": "Merging screens",
      "status": "active",
      "progress": 37.5,
      "itemsCompleted": 3,
      "itemCount": 8,
      "currentAction": "Merging screen: User List..."
    },
    ...
  ],
  "logs": [
    {
      "timestamp": "2024-12-18T14:32:27.000Z",
      "type": "info",
      "message": "Merging screen: User List (ID: 55002)"
    }
  ],
  "estimatedTimeRemaining": 180000  // 3 minutes in ms
}
```

**Example Response** (Complete):
```json
{
  "jobId": "merge-job-abc123",
  "status": "complete",
  "overallProgress": 100,
  "completedAt": "2024-12-18T14:37:00.000Z",
  "duration": 285000,  // 4.75 minutes
  "summary": {
    "screensMerged": 8,
    "dataSourcesMerged": 2,
    "filesCopied": 5,
    "settingsUpdated": 2,
    "errors": 0
  }
}
```

**Response on Error**:
```json
{
  "jobId": "merge-job-abc123",
  "status": "failed",
  "overallProgress": 65,
  "failedAt": "2024-12-18T14:35:30.000Z",
  "error": {
    "stage": "Merging data sources",
    "message": "Failed to merge data source 'Users'",
    "details": "Database connection timeout",
    "code": "DS_MERGE_TIMEOUT"
  },
  "summary": {
    "screensMerged": 8,
    "dataSourcesMerged": 1,
    "dataSourcesFailed": 1,
    "filesCopied": 5,
    "settingsUpdated": 0
  }
}
```

---

## User Interactions

### Normal Flow

1. **User lands on Progress screen** (from Review)
2. **Polling starts immediately**
3. **User watches progress** (2-5 minutes)
   - Sees stages complete sequentially
   - Reads log messages
   - Overall progress bar increases
4. **All stages complete**
5. **Polling detects completion**
6. **Navigates to Merge Complete screen**

### Background Flow

1. **Merge in progress**
2. **User clicks "Close"**
3. **Overlay closes**
4. **Merge continues on backend**
5. **User works on other tasks in Studio**
6. **3 minutes later: Browser push notification**
   - "Merge completed successfully!"
7. **User clicks notification**
8. **Merge overlay reopens on Complete screen**

### Error Flow

1. **Merge in progress**
2. **Stage 4 fails** (data source error)
3. **Stage shows error state**
4. **User sees error actions: Retry, Skip, View Details**
5. **User clicks "Retry"**
6. **Stage retries (1st attempt)**
   - If success: continues
   - If fails again: offers Skip or Abort
7. **User clicks "Skip"**
8. **Merge continues with remaining items**
9. **Completes with partial success**

---

## Error States

### Error: Polling Failed

**Trigger**: Cannot connect to get status updates

**Display** (banner):
```
⚠️ Connection lost. Retrying...
The merge is continuing on the server. Attempting to reconnect.
```

**Recovery**: Exponential backoff retry (2s, 4s, 8s, 16s)

### Error: Merge Job Not Found

**Trigger**: Invalid job ID or job expired

**Display** (modal):
```
❌ Merge Job Not Found

We couldn't find the merge job. It may have expired
or been cancelled.

[Return to Dashboard]
```

---

## Accessibility

### Keyboard Navigation
- Tab to "Close" button
- Focus indicator on button

### Screen Reader
- Announces stage completions: "Stage 2 complete: Merging files"
- Announces overall progress: "42% complete"
- Live region for log messages

### Visual Indicators
- Progress not shown by color alone
- Icons + text for all states
- Clear labels for each stage

---

## Related Documentation

- [USER_FLOWS.md](../USER_FLOWS.md) - Complete user journey (Step 5: Merge Progress)
- [04-review-merge.md](04-review-merge.md) - Previous screen
- [06-merge-complete.md](06-merge-complete.md) - Next screen
- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Progress bar component

---

**Last Updated**: December 18, 2024
**Status**: Phase 3 Complete
**Version**: 1.0
