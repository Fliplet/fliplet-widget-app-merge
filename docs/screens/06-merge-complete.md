# Merge Complete Screen

## Purpose

The Merge Complete screen displays the final results of the merge operation. It shows success/failure status, summary statistics, warnings about live changes, next steps checklist, and actions to view the destination app or start another merge.

**User Goals**:
- Confirm merge completed successfully (or see failure details)
- Review summary of merged items
- Understand warnings and next steps
- Access destination app for testing
- View detailed audit log
- Start another merge if needed
- Download merge report

---

## URL/Route

**Path**: `/merge-complete` or `#/merge-complete`

**Query Parameters**:
- `jobId`: Required. Merge job ID from API
- Example: `#/merge-complete?jobId=merge-job-abc123`

**Prerequisites**:
- Merge job completed (success or failure)
- User navigated from Progress screen or reopened via notification

---

## Layout Structure

### Screen Container (Success)
```
┌─────────────────────────────────────────────┐
│ Status Icon & Message                       │
│ ✅ Merge Completed Successfully!            │
├─────────────────────────────────────────────┤
│ Summary Cards                               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ 8 screens│ │ 2 data   │ │ 5 files  │     │
│ │  merged  │ │ sources  │ │  copied  │     │
│ └──────────┘ └──────────┘ └──────────┘     │
│ ┌──────────┐ ┌──────────┐                  │
│ │ 2 settings│ │ 0 errors │                 │
│ │  updated │ │          │                  │
│ └──────────┘ └──────────┘                  │
├─────────────────────────────────────────────┤
│ Warnings & Notices                          │
│ ⚠️ Data source changes are live. Test app.  │
│ ⚠️ App settings updated. Republish to apply.│
├─────────────────────────────────────────────┤
│ Next Steps Checklist                        │
│ ☐ Review merged screens                    │
│ ☐ Test data source changes                 │
│ ☐ Republish app (if needed)                │
│ ☐ Review audit log                         │
├─────────────────────────────────────────────┤
│ Detailed Results (Expandable)               │
│ ▼ Screens (8 merged)                        │
│   - Home (overwritten)                      │
│   - User List (overwritten)                 │
│   - New Feature Screen (created)            │
│   ...                                       │
├─────────────────────────────────────────────┤
│ Action Buttons                              │
│ [View Audit Log] [Download Report]          │
│ [Start Another Merge]                       │
│             [View Destination App →]        │
└─────────────────────────────────────────────┘
```

### 1. Status Icon & Message

**Success State**:
```
✅ Merge Completed Successfully!

Source: Sales Conference 2024
Destination: Production 2024 App
Completed: Dec 18, 2024 at 2:37 PM
Duration: 4 minutes 45 seconds
```

**Style**:
- Large green checkmark icon (96px)
- H1 heading: "Merge Completed Successfully!"
- Meta info: Source/destination names, timestamp, duration
- Green background tint

**Partial Success State** (with warnings):
```
⚠️ Merge Completed with Warnings

Some items were skipped due to errors.
Review details below.

Completed: Dec 18, 2024 at 2:37 PM
Duration: 4 minutes 45 seconds
```

**Style**:
- Orange warning icon
- Orange background tint
- Warning message about skipped items

**Failure State**:
```
❌ Merge Failed

The merge could not be completed due to errors.
Partial results shown below.

Failed at: Dec 18, 2024 at 2:35 PM (Stage: Merging data sources)
Error: Database connection timeout
```

**Style**:
- Red error icon
- Red background tint
- Error details

### 2. Summary Cards

**Purpose**: Quick visual summary of results

**5 Cards**:
1. **Screens Merged** - Count with icon
2. **Data Sources Merged** - Count with icon
3. **Files Copied** - Count with icon
4. **Settings Updated** - Count with icon
5. **Errors** - Count (0 or >0)

**Card Visual** (Success):
```
┌──────────────┐
│   📱         │
│              │
│  8 screens   │
│   merged     │
│              │
│  ✅ Success  │
└──────────────┘
```

**Card Visual** (Partial):
```
┌──────────────┐
│   📊         │
│              │
│ 1 of 2 data  │
│   sources    │
│              │
│  ⚠️ Partial  │
└──────────────┘
```

**Card Visual** (Errors):
```
┌──────────────┐
│   ❌         │
│              │
│  2 errors    │
│              │
│ View Details │
└──────────────┘
```

### 3. Warnings & Notices

**Purpose**: Alert user to required actions

**Common Warnings**:
```
⚠️ Data source changes are live
   Changes to data sources affect users immediately.
   Test the app thoroughly.

⚠️ App settings updated
   Republish the app to apply changes to published version.

⚠️ Global code overwritten
   Version history created. You can rollback via Global Code settings.

ℹ️ Screens create versions
   Use screen version history to rollback if needed.
```

**Style**:
- Orange background for warnings (⚠️)
- Blue background for info (ℹ️)
- Clear action-oriented text

### 4. Next Steps Checklist

**Purpose**: Guide user on post-merge actions

**Checklist Items**:
```
Next Steps

☐ Review merged screens in destination app
☐ Test data source changes
☐ Republish app to apply settings changes
☐ Review merge audit log
☐ Notify team members of changes
```

**Interactive**:
- Checkboxes are clickable (client-side only, not persisted)
- Visual feedback when checked
- Helps user track progress

**Component**:
```vue
<template>
  <div class="next-steps">
    <h3>Next Steps</h3>
    <ul class="checklist">
      <li v-for="step in steps" :key="step.id">
        <label>
          <input
            type="checkbox"
            v-model="step.completed"
            @change="saveProgress">
          {{ step.text }}
        </label>
      </li>
    </ul>
  </div>
</template>
```

### 5. Detailed Results

**Purpose**: Expandable sections showing item-by-item results

**Sections** (4 expandable cards):

#### Screens (8 merged)
```
▼ Screens (8 merged)                           [Expand/Collapse]

✅ Home (overwritten)
   Replaced existing screen. Version #23 created.

✅ User List (overwritten)
   Replaced existing screen. Version #15 created.

✅ New Feature Screen (created)
   New screen added to destination app.

✅ Profile (overwritten)
✅ Settings (overwritten)
✅ About (overwritten)
✅ Contact (overwritten)
✅ Beta Dashboard (created)
```

#### Data Sources (2 merged)
```
▼ Data Sources (2 merged)

✅ Users (all rows - 1,250 entries)
   Data and structure overwritten. Version #18 created.

✅ Settings (structure only)
   Columns updated. Data preserved.
```

#### Files (5 copied)
```
▼ Files (5 files, 2 folders copied)

Folders:
✅ Images (all files) - 3 files copied
   - logo.png (45 KB)
   - banner.jpg (120 KB)
   - icon.png (12 KB)

✅ Media (folder only) - Structure created
```

#### Settings (2 updated)
```
▼ Settings & Global Code (2 updated)

✅ App settings
   Name, icon, slug, navigation updated.
   SAML settings excluded.

✅ Global code
   JavaScript and CSS overwritten.
   Version #5 created. Rollback available.
```

**With Errors** (partial success):
```
▼ Data Sources (1 of 2 merged)

✅ Settings (structure only)
   Columns updated. Data preserved.

❌ Users (failed)
   Error: Database connection timeout
   [Retry Manually] [View Error Details]
```

### 6. Action Buttons

**Primary Action**:
- **View Destination App** (→ icon, blue, large)
  - Opens destination app in Studio
  - Switches organization if needed

**Secondary Actions**:
- **View Audit Log** (link)
  - Opens audit log filtered to this merge
- **Download Report** (link)
  - Downloads PDF/CSV summary
- **Start Another Merge** (link)
  - Returns to Dashboard with different source app

**Layout**:
```
[View Audit Log]  [Download Report]  [Start Another Merge]

                          [View Destination App →]
                          (primary, right-aligned)
```

---

## Component Breakdown

### ResultSummaryCard Component

**Purpose**: Display count and status for category

**Props**:
- `icon`: String (FontAwesome class)
- `count`: Number
- `total`: Number (if partial)
- `label`: String
- `status`: String ('success', 'partial', 'error')

**Template**:
```vue
<template>
  <div :class="['result-card', `status-${status}`]">
    <i :class="['fa', icon]" class="result-icon"></i>

    <h3 class="result-count">
      <span v-if="total && count !== total">{{ count }} of {{ total }}</span>
      <span v-else>{{ count }}</span>
    </h3>

    <p class="result-label">{{ label }}</p>

    <div class="result-status">
      <i :class="statusIcon"></i>
      <span>{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['icon', 'count', 'total', 'label', 'status']);

const statusIcon = computed(() => {
  switch (props.status) {
    case 'success': return 'fa fa-check-circle text-success';
    case 'partial': return 'fa fa-exclamation-triangle text-warning';
    case 'error': return 'fa fa-times-circle text-danger';
    default: return 'fa fa-info-circle text-info';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'success': return 'Success';
    case 'partial': return 'Partial';
    case 'error': return 'Failed';
    default: return 'N/A';
  }
});
</script>

<style scoped>
.result-card {
  text-align: center;
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: white;
}

.status-success {
  border-color: var(--success-color);
  background: #f0fff4;
}

.status-partial {
  border-color: var(--warning-color);
  background: #fffbeb;
}

.status-error {
  border-color: var(--danger-color);
  background: #fff5f5;
}

.result-icon {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.result-count {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.result-label {
  font-size: var(--font-size-sm);
  color: var(--info-color);
  margin-bottom: var(--spacing-sm);
}

.result-status {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
</style>
```

### DetailedResultsSection Component

**Purpose**: Expandable section with item list

**Props**:
- `title`: String
- `items`: Array of result items
- `expanded`: Boolean (default: false)

**Template**:
```vue
<template>
  <merge-card class="results-section">
    <div class="section-header" @click="toggleExpand">
      <i :class="expanded ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"></i>
      <h3>{{ title }}</h3>
    </div>

    <div v-if="expanded" class="section-content">
      <ul class="results-list">
        <li
          v-for="item in items"
          :key="item.id"
          :class="['result-item', `status-${item.status}`]">
          <i :class="getStatusIcon(item.status)"></i>
          <div class="item-details">
            <strong>{{ item.name }}</strong>
            <span v-if="item.operation" class="item-operation">
              ({{ item.operation }})
            </span>
            <p v-if="item.message" class="item-message">
              {{ item.message }}
            </p>
            <div v-if="item.error" class="item-error">
              <p class="error-message">Error: {{ item.error.message }}</p>
              <div class="error-actions">
                <merge-button
                  variant="secondary"
                  size="small"
                  @click="retryItem(item)">
                  Retry Manually
                </merge-button>
                <merge-button
                  variant="link"
                  size="small"
                  @click="viewErrorDetails(item)">
                  View Error Details
                </merge-button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </merge-card>
</template>

<script setup>
import { ref } from 'vue';

const expanded = ref(false);

const toggleExpand = () => {
  expanded.value = !expanded.value;
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'success': return 'fa fa-check-circle text-success';
    case 'warning': return 'fa fa-exclamation-triangle text-warning';
    case 'error': return 'fa fa-times-circle text-danger';
    default: return 'fa fa-circle text-muted';
  }
};
</script>
```

---

## Mock Data

### Successful Merge
```javascript
const mockSuccessResult = {
  jobId: 'merge-job-abc123',
  status: 'complete',
  completedAt: '2024-12-18T14:37:00.000Z',
  duration: 285000, // 4.75 minutes
  sourceApp: {
    id: 123456,
    name: 'Sales Conference 2024'
  },
  destinationApp: {
    id: 789012,
    name: 'Production 2024 App'
  },
  summary: {
    screensMerged: 8,
    screensTotal: 8,
    dataSourcesMerged: 2,
    dataSourcesTotal: 2,
    filesCopied: 5,
    filesTotal: 5,
    settingsUpdated: 2,
    settingsTotal: 2,
    errors: 0
  },
  details: {
    screens: [
      {
        id: 55001,
        name: 'Home',
        status: 'success',
        operation: 'overwritten',
        message: 'Replaced existing screen. Version #23 created.'
      },
      {
        id: 55002,
        name: 'User List',
        status: 'success',
        operation: 'overwritten',
        message: 'Replaced existing screen. Version #15 created.'
      },
      {
        id: 55010,
        name: 'New Feature Screen',
        status: 'success',
        operation: 'created',
        message: 'New screen added to destination app.'
      }
      // ... more screens
    ],
    dataSources: [
      {
        id: 301,
        name: 'Users',
        status: 'success',
        operation: 'overwritten',
        mode: 'all',
        entriesCount: 1250,
        message: 'Data and structure overwritten. Version #18 created.'
      },
      {
        id: 302,
        name: 'Settings',
        status: 'success',
        operation: 'created',
        mode: 'structure',
        message: 'Columns updated. Data preserved.'
      }
    ],
    files: [
      {
        id: 1001,
        name: 'logo.png',
        status: 'success',
        operation: 'copied',
        size: 46080,
        message: 'File copied successfully.'
      }
      // ... more files
    ],
    settings: [
      {
        id: 'appSettings',
        name: 'App settings',
        status: 'success',
        operation: 'overwritten',
        message: 'Name, icon, slug, navigation updated. SAML settings excluded.'
      },
      {
        id: 'globalCode',
        name: 'Global code',
        status: 'success',
        operation: 'overwritten',
        message: 'JavaScript and CSS overwritten. Version #5 created.'
      }
    ]
  },
  warnings: [
    {
      type: 'live_changes',
      message: 'Data source changes are live. Changes affect users immediately. Test the app thoroughly.'
    },
    {
      type: 'republish_required',
      message: 'App settings updated. Republish the app to apply changes to published version.'
    },
    {
      type: 'version_history',
      message: 'Global code overwritten. Version history created for rollback.'
    }
  ]
};
```

### Partial Success (With Errors)
```javascript
const mockPartialResult = {
  status: 'partial',
  summary: {
    screensMerged: 8,
    screensTotal: 8,
    dataSourcesMerged: 1,
    dataSourcesTotal: 2,
    filesCopied: 5,
    filesTotal: 5,
    settingsUpdated: 2,
    settingsTotal: 2,
    errors: 1
  },
  details: {
    dataSources: [
      {
        id: 301,
        name: 'Users',
        status: 'error',
        operation: 'failed',
        error: {
          message: 'Database connection timeout',
          code: 'DS_MERGE_TIMEOUT',
          details: 'Connection to database timed out after 30 seconds.'
        }
      },
      {
        id: 302,
        name: 'Settings',
        status: 'success',
        operation: 'created',
        mode: 'structure'
      }
    ]
  },
  errors: [
    {
      stage: 'Merging data sources',
      item: 'Users',
      message: 'Database connection timeout',
      resolution: 'Retry merge manually or contact support if issue persists.'
    }
  ]
};
```

---

## API Integration

### Fetch Merge Results (On Mount)

**Endpoint**: `GET /v1/merge/:jobId/result`

**Example Request**:
```javascript
const jobId = new URLSearchParams(window.location.search).get('jobId');
const result = await MergeAPI.getMergeResult(jobId);
```

**Example Response**: See mock data above

### Download Report

**Endpoint**: `GET /v1/merge/:jobId/report`

**Triggered**: When user clicks "Download Report"

**Returns**: PDF or CSV file with detailed results

---

## User Interactions

### Success Flow

1. **User lands on Complete screen** (from Progress)
2. **Sees success message and summary**
3. **Reviews warnings** (data live, republish needed)
4. **Checks next steps checklist** (client-side only)
5. **Expands detailed results** to review screens
6. **Clicks "View Destination App"**
7. **System actions**:
   - Releases locks on both apps
   - Clears MergeState
   - Posts message to Studio parent window
   - Studio switches to destination org (if different)
   - Studio opens destination app

### Alternative: Start Another Merge

1. **User on Complete screen**
2. **Clicks "Start Another Merge"**
3. **System clears state**
4. **Returns to Dashboard** (can select new source app)

### Alternative: Download Report

1. **User clicks "Download Report"**
2. **Modal asks for format**: PDF or CSV
3. **User selects PDF**
4. **Report downloads** (merge-report-abc123.pdf)
5. **User opens report** in PDF viewer

---

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter to expand/collapse sections
- Focus indicators on all buttons/links

### Screen Reader
- Announces success/failure status
- Reads summary counts
- Announces warnings
- Checklist items announced with checkbox state

---

## Related Documentation

- [USER_FLOWS.md](../USER_FLOWS.md) - Complete user journey (Step 6: Merge Complete)
- [05-merge-progress.md](05-merge-progress.md) - Previous screen
- [01-dashboard.md](01-dashboard.md) - Return to start another merge
- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Card and alert components

---

**Last Updated**: December 18, 2024
**Status**: Phase 3 Complete
**Version**: 1.0
