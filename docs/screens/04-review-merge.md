# Review & Merge Screen

## Purpose

The Review & Merge screen provides a final overview of all selections before merge execution. It displays a summary of items to be merged, identifies conflicts, shows operation types (copy/overwrite/conflict), and requires user confirmation before starting the irreversible merge process.

**User Goals**:
- Review complete summary of merge selections
- Identify conflicts that prevent merge
- Understand which items will be copied vs. overwritten
- Confirm readiness before irreversible execution
- Edit configuration if issues found
- Start merge with confidence

---

## URL/Route

**Path**: `/review-merge` or `#/review-merge`

**Query Parameters**: None (selections stored in MergeState)

**Prerequisites**:
- User completed Configure Merge screen
- Selections stored in MergeState (may be empty)
- Lock still active

---

## Layout Structure

### Screen Container
```
┌─────────────────────────────────────────────┐
│ Progress Indicator (Step 3 of 3)            │
├─────────────────────────────────────────────┤
│ Header: Review Merge Summary                │
│ Lock Timer: 8:30 remaining                  │
├─────────────────────────────────────────────┤
│ Summary Overview (Cards)                    │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │Screen│ │ Data │ │Files │ │Config│        │
│ │  8   │ │Src 2 │ │  5   │ │  2   │        │
│ └──────┘ └──────┘ └──────┘ └──────┘        │
├─────────────────────────────────────────────┤
│ Conflict & Warning Panel                    │
│ ⚠️ 0 conflicts · 4 overwrites · 6 new items │
├─────────────────────────────────────────────┤
│ Detailed Item Lists (Expandable Cards)      │
│ ┌─────────────────────────────────────────┐ │
│ │ Screens (8 selected)                [v] │ │
│ │ ├ 2 new screens (COPY - green)          │ │
│ │ │  - New Feature Screen                 │ │
│ │ │  - Beta Dashboard                     │ │
│ │ ├ 6 existing screens (OVERWRITE-orange) │ │
│ │ │  - Home                               │ │
│ │ │  - User List                          │ │
│ │ │  - Profile                            │ │
│ │ │  - Settings                           │ │
│ │ │  - About                              │ │
│ │ │  - Contact                            │ │
│ └─────────────────────────────────────────┘ │
│ (Similar cards for DS, Files, Settings)     │
├─────────────────────────────────────────────┤
│ Important Warnings                          │
│ ⚠️ No automatic rollback available          │
│ ⚠️ Data source changes go live immediately  │
│ ⚠️ Cannot cancel once merge starts          │
├─────────────────────────────────────────────┤
│ Action Buttons                              │
│ [← Edit Configuration]  [Cancel]            │
│                         [Start Merge →]     │
└─────────────────────────────────────────────┘
```

### 1. Header Section

**Content**:
- Title (H1): "Review Merge Summary"
- Source → Destination (with arrow)
- Lock timer: "8:30 remaining"

**Visual**:
```
Review Merge Summary

Sales Conference 2024  →  Production 2024 App

Lock expires in: 8:30
```

### 2. Summary Overview Cards

**Purpose**: High-level counts at a glance

**4 Cards**:
1. **Screens** - Count and icon
2. **Data Sources** - Count and icon
3. **Files** - Count and icon
4. **Settings** - Count and icon

**Visual**:
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   📱         │ │   📊         │ │   📁         │ │   ⚙️         │
│              │ │              │ │              │ │              │
│  8 screens   │ │ 2 data       │ │  5 files     │ │ 2 settings   │
│              │ │   sources    │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Card Style**:
- White background
- Border: 1px solid gray
- Icon: Large (48px), colored
- Count: Bold, large (20px)
- Label: Small (12px), gray

### 3. Conflict & Warning Panel

**Purpose**: Surface conflicts and operation counts prominently

**Content**:
- Conflict count (red if >0)
- Overwrite count (orange)
- New items count (green)

**States**:

**No Conflicts** (merge allowed):
```
┌─────────────────────────────────────────────┐
│ ✅ 0 conflicts · 4 overwrites · 6 new items │
│                                             │
│ Ready to merge. Review details below.       │
└─────────────────────────────────────────────┘
```

**Conflicts Detected** (merge blocked):
```
┌─────────────────────────────────────────────┐
│ ❌ 3 conflicts · 4 overwrites · 5 new items │
│                                             │
│ Conflicts must be resolved before merging.  │
│ Edit configuration to fix issues.           │
└─────────────────────────────────────────────┘
```

**Color Coding**:
- Green background if 0 conflicts
- Red background if conflicts >0
- Icons: ✅ (green check) or ❌ (red X)

### 4. Detailed Item Lists

**Format**: Expandable cards (one per category)

#### Card 1: Screens

**Header**:
- Title: "Screens (8 selected)"
- Expand/collapse icon

**Expanded Content**:
```
Screens (8 selected)                          [v]
├ 2 new screens (COPY)                        🟢 Green
│  - New Feature Screen
│  - Beta Dashboard
├ 6 existing screens (OVERWRITE)              🟠 Orange
│  - Home
│  - User List
│  - Profile
│  - Settings
│  - About
│  - Contact
```

**Operation Badges**:
- **COPY** (green badge): New screens that don't exist in destination
- **OVERWRITE** (orange badge): Screens with matching names in destination
- **CONFLICT** (red badge): Screens that can't be merged (if any)

**Empty State** (0 selected):
```
Screens (0 selected)
No screens selected for merge.
```

#### Card 2: Data Sources

**Expanded Content**:
```
Data Sources (2 selected)                     [v]
├ 1 new data source (COPY)                    🟢 Green
│  - Settings (Structure only)                🔵 Blue
├ 1 existing data source (OVERWRITE)          🟠 Orange
│  - Users (All rows - 1,250 entries)
```

**Special Indicators**:
- **Structure only**: Blue badge "PARTIAL"
- **All rows**: Shows entry count "(1,250 entries)"

#### Card 3: Files

**Expanded Content**:
```
Files (5 files, 2 folders selected)           [v]
├ All new (COPY)                              🟢 Green
│  Folders:
│  - Images (All files mode) → 3 files
│  - Media (Folder only mode)
│  Files:
│  - logo.png (45 KB)
│  - banner.jpg (120 KB)
│  - icon.png (12 KB)
```

**Folder Modes**:
- Show mode: "(All files)" or "(Folder only)"
- Show file count if applicable

#### Card 4: Settings & Global Code

**Expanded Content**:
```
Settings & Global Code (2 selected)           [v]
├ App settings (OVERWRITE)                    🟠 Orange
│  - App name, icon, slug, navigation
│  - Excludes: SAML, payment settings
├ Global code (OVERWRITE)                     🟠 Orange
│  - Global JS, CSS, dependencies
│  - Version history will be created
```

**Warnings**:
- "App settings may require republishing"
- "Global code creates version history for rollback"

### 5. Important Warnings

**Purpose**: Remind user of critical constraints

**Warnings List**:
```
⚠️ Important Notes

• No automatic rollback: Use version history to restore
  manually if needed.

• Data source changes go live immediately: Test the app
  after merging.

• Cannot cancel once merge starts: Review carefully
  before confirming.

• App may require republishing: If app settings or global
  code changed.
```

**Style**:
- Orange/yellow background
- Warning icon for each item
- Clear, concise language

### 6. Action Buttons

**Buttons** (3 total):
1. **Edit Configuration** (← icon) - Returns to Configure Merge
2. **Cancel** - Cancels merge, releases locks
3. **Start Merge** (→ icon, primary) - Starts merge execution

**Layout**:
```
[← Edit Configuration]  [Cancel]    [Start Merge →]
(secondary)            (secondary)  (primary, blue)
```

**Button States**:
- **Start Merge**: Enabled if 0 conflicts, disabled if conflicts >0
- **Edit Configuration**: Always enabled
- **Cancel**: Always enabled (shows confirmation modal)

**Start Merge Flow**:
1. User clicks "Start Merge"
2. Confirmation modal appears:
   ```
   ┌──────────────────────────────────────┐
   │ Confirm Merge                        │
   │                                      │
   │ Are you sure you want to start the   │
   │ merge? You cannot cancel once        │
   │ started.                             │
   │                                      │
   │ Summary:                             │
   │ • 8 screens                          │
   │ • 2 data sources                     │
   │ • 5 files                            │
   │ • 2 settings                         │
   │                                      │
   │ Estimated time: 2-5 minutes          │
   │                                      │
   │ [Cancel]          [Confirm Merge]    │
   └──────────────────────────────────────┘
   ```
3. User clicks "Confirm Merge"
4. Modal shows loading spinner
5. API call initiated
6. Navigate to Merge Progress screen

---

## Component Breakdown

### SummaryCard Component

**Purpose**: Display count for each category

**Props**:
- `icon`: String (FontAwesome class)
- `count`: Number
- `label`: String (plural form)

**Template**:
```vue
<template>
  <div class="summary-card">
    <i :class="['fa', icon]" class="summary-icon"></i>
    <h3 class="summary-count">{{ count }}</h3>
    <p class="summary-label">{{ label }}</p>
  </div>
</template>

<style scoped>
.summary-card {
  text-align: center;
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: white;
}

.summary-icon {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.summary-count {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.summary-label {
  font-size: var(--font-size-sm);
  color: var(--info-color);
}
</style>
```

### ConflictPanel Component

**Purpose**: Display conflict status and operation counts

**Props**:
- `conflicts`: Number
- `overwrites`: Number
- `newItems`: Number

**Template**:
```vue
<template>
  <merge-alert
    :variant="conflicts > 0 ? 'danger' : 'success'"
    class="conflict-panel">
    <div class="conflict-summary">
      <i :class="conflicts > 0 ? 'fa fa-times-circle' : 'fa fa-check-circle'"></i>
      <strong>
        {{ conflicts }} conflicts · {{ overwrites }} overwrites · {{ newItems }} new items
      </strong>
    </div>
    <p v-if="conflicts > 0" class="conflict-message">
      Conflicts must be resolved before merging. Edit configuration to fix issues.
    </p>
    <p v-else class="conflict-message">
      Ready to merge. Review details below.
    </p>
  </merge-alert>
</template>
```

### ItemListCard Component

**Purpose**: Expandable card showing detailed items

**Props**:
- `title`: String
- `totalCount`: Number
- `items`: Array grouped by operation type
- `expanded`: Boolean (default: true)

**Template**:
```vue
<template>
  <merge-card class="item-list-card">
    <div class="card-header" @click="toggleExpand">
      <h3>{{ title }} ({{ totalCount }} selected)</h3>
      <i :class="expanded ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"></i>
    </div>

    <div v-if="expanded" class="card-content">
      <div v-if="items.copy && items.copy.length > 0" class="item-group">
        <h4 class="group-header">
          <merge-badge variant="success">COPY</merge-badge>
          {{ items.copy.length }} new item{{ items.copy.length > 1 ? 's' : '' }}
        </h4>
        <ul class="item-list">
          <li v-for="item in items.copy" :key="item.id">
            {{ item.name }}
            <span v-if="item.meta" class="item-meta">{{ item.meta }}</span>
          </li>
        </ul>
      </div>

      <div v-if="items.overwrite && items.overwrite.length > 0" class="item-group">
        <h4 class="group-header">
          <merge-badge variant="warning">OVERWRITE</merge-badge>
          {{ items.overwrite.length }} existing item{{ items.overwrite.length > 1 ? 's' : '' }}
        </h4>
        <ul class="item-list">
          <li v-for="item in items.overwrite" :key="item.id">
            {{ item.name }}
            <span v-if="item.meta" class="item-meta">{{ item.meta }}</span>
          </li>
        </ul>
      </div>

      <div v-if="items.conflict && items.conflict.length > 0" class="item-group">
        <h4 class="group-header">
          <merge-badge variant="danger">CONFLICT</merge-badge>
          {{ items.conflict.length }} conflict{{ items.conflict.length > 1 ? 's' : '' }}
        </h4>
        <ul class="item-list error-list">
          <li v-for="item in items.conflict" :key="item.id">
            {{ item.name }}
            <span class="conflict-reason">{{ item.reason }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="totalCount === 0" class="empty-state">
      No {{ title.toLowerCase() }} selected for merge.
    </div>
  </merge-card>
</template>

<script setup>
import { ref } from 'vue';

const expanded = ref(true);

const toggleExpand = () => {
  expanded.value = !expanded.value;
};
</script>
```

---

## Mock Data

### Summary Counts
```javascript
const mockSummary = {
  screens: {
    total: 8,
    copy: 2,
    overwrite: 6,
    conflict: 0
  },
  dataSources: {
    total: 2,
    copy: 1,
    overwrite: 1,
    conflict: 0
  },
  files: {
    total: 5,
    folders: 2,
    copy: 5,
    overwrite: 0,
    conflict: 0
  },
  settings: {
    total: 2,
    copy: 0,
    overwrite: 2,
    conflict: 0
  }
};
```

### Detailed Screens List
```javascript
const mockScreensDetailed = {
  copy: [
    { id: 55010, name: 'New Feature Screen' },
    { id: 55011, name: 'Beta Dashboard' }
  ],
  overwrite: [
    { id: 55001, name: 'Home' },
    { id: 55002, name: 'User List' },
    { id: 55003, name: 'Profile' },
    { id: 55004, name: 'Settings' },
    { id: 55005, name: 'About' },
    { id: 55006, name: 'Contact' }
  ],
  conflict: []
};
```

### Detailed Data Sources List
```javascript
const mockDataSourcesDetailed = {
  copy: [
    {
      id: 302,
      name: 'Settings',
      meta: 'Structure only',
      mode: 'structure'
    }
  ],
  overwrite: [
    {
      id: 301,
      name: 'Users',
      meta: 'All rows (1,250 entries)',
      mode: 'all',
      entriesCount: 1250
    }
  ],
  conflict: []
};
```

### Conflict Example (if present)
```javascript
const mockConflicts = {
  screens: {
    conflict: [
      {
        id: 55020,
        name: 'Reports',
        reason: 'Missing dependency: Analytics data source'
      },
      {
        id: 55021,
        name: 'Dashboard',
        reason: 'Duplicate name with different content'
      }
    ]
  },
  dataSources: {
    conflict: [
      {
        id: 305,
        name: 'Users',
        reason: 'Schema mismatch: missing "role" column in destination'
      }
    ]
  }
};
```

---

## API Integration

### Validate Selections (On Mount)

**Endpoint**: `POST /v1/merge/validate`

**Purpose**: Check for conflicts before allowing merge

**Request Body**:
```json
{
  "sourceAppId": 123456,
  "destinationAppId": 789012,
  "selectedScreens": [55001, 55002, 55003, ...],
  "selectedDataSources": [
    { "id": 301, "mode": "all" },
    { "id": 302, "mode": "structure" }
  ],
  "selectedFiles": [1001, 1002, 1003],
  "selectedFolders": [
    { "id": "folder-1", "mode": "all" }
  ],
  "settings": {
    "appSettings": true,
    "menuSettings": false,
    "globalAppearance": false,
    "globalCode": true
  }
}
```

**Example Response** (No Conflicts):
```json
{
  "valid": true,
  "conflicts": [],
  "summary": {
    "screens": {
      "total": 8,
      "copy": 2,
      "overwrite": 6,
      "conflict": 0,
      "details": {
        "copy": [
          { "id": 55010, "name": "New Feature Screen" },
          { "id": 55011, "name": "Beta Dashboard" }
        ],
        "overwrite": [
          { "id": 55001, "name": "Home" },
          ...
        ]
      }
    },
    "dataSources": { ... },
    "files": { ... },
    "settings": { ... }
  }
}
```

**Example Response** (With Conflicts):
```json
{
  "valid": false,
  "conflicts": [
    {
      "type": "screen",
      "id": 55020,
      "name": "Reports",
      "reason": "Missing dependency: Analytics data source",
      "resolution": "Select 'Analytics' data source or deselect this screen"
    },
    {
      "type": "dataSource",
      "id": 305,
      "name": "Users",
      "reason": "Schema mismatch: missing 'role' column in destination",
      "resolution": "Use 'Structure only' mode or add column to destination"
    }
  ],
  "summary": { ... }
}
```

### Start Merge (On Confirm)

**Endpoint**: `POST /v1/merge`

**Triggered**: When user clicks "Confirm Merge" in modal

**Request Body**: Same as validation request

**Example Response**:
```json
{
  "jobId": "merge-job-abc123",
  "status": "started",
  "estimatedDuration": 180000,  // 3 minutes in ms
  "startedAt": "2024-12-18T15:00:00.000Z"
}
```

**Next Action**: Navigate to Merge Progress screen with `jobId`

---

## User Interactions

### Primary Flow

1. **User lands on Review screen**
   - System validates selections via API (2-3 seconds)
   - Shows loading state while validating
   - Displays summary cards and detailed lists

2. **User reviews summary** (1-2 minutes)
   - Reads high-level counts in cards
   - Expands detailed item lists
   - Reviews operation types (copy/overwrite)
   - Checks for conflicts (0 found)

3. **User confirms readiness**
   - No conflicts (green panel)
   - Understands overwrites
   - Aware of warnings (no rollback, live changes)

4. **User clicks "Start Merge"**
   - Confirmation modal appears
   - Reviews summary in modal
   - Clicks "Confirm Merge"

5. **System starts merge**
   - Shows loading spinner (1-2 seconds)
   - Creates merge job via API
   - Receives job ID
   - Navigates to Merge Progress screen

### Alternative Flow: Edit Configuration

1. **User on Review screen**
2. **User sees something to change**
3. **User clicks "Edit Configuration"**
4. **System returns to Configure Merge**
   - Preserves all selections
   - User can modify selections
   - Returns to Review when done

### Alternative Flow: Conflicts Detected

1. **User on Review screen**
2. **Validation finds conflicts** (red panel)
3. **"Start Merge" button disabled**
4. **User reviews conflict details**
   - Sees red badges on conflicting items
   - Reads conflict reasons
5. **User clicks "Edit Configuration"**
6. **User fixes conflicts**
   - Unchecks conflicting items OR
   - Selects missing dependencies OR
   - Changes DS mode to "Structure only"
7. **User returns to Review**
8. **Validation passes** (green panel)
9. **Continues with merge**

---

## Error States

### Error: Validation Failed

**Trigger**: API call to validate fails

**Display**:
```
┌──────────────────────────────────────┐
│ ⚠️  Validation Failed                │
│                                      │
│ We couldn't validate your selections.│
│ Please try again.                    │
│                                      │
│ [Retry]  [Edit Configuration]        │
└──────────────────────────────────────┘
```

### Error: Lock Expired

**Trigger**: Lock expires while on Review screen

**Display**: Same as other screens - modal with "Start Over" option

### Error: Cannot Start Merge

**Trigger**: API call to start merge fails

**Display** (modal):
```
┌──────────────────────────────────────┐
│ ❌ Cannot Start Merge                │
│                                      │
│ The merge could not be started.      │
│                                      │
│ Error: [API error message]           │
│                                      │
│ [Retry]  [Contact Support]           │
└──────────────────────────────────────┘
```

---

## Accessibility

### Keyboard Navigation
- Tab through summary cards
- Tab through action buttons
- Enter to expand/collapse item cards
- Space to toggle in modal

### Screen Reader
- Announces conflict count: "0 conflicts, ready to merge"
- Announces expanded cards: "Screens details expanded"
- Reads operation badges: "Home screen, will overwrite existing"

### Color Contrast
- All badges meet WCAG AA
- Red/orange/green distinguishable by shape/icon, not just color

---

## Visual Design

### Summary Cards
- 4-column grid on desktop
- 2-column on tablet
- Stacked on mobile
- Equal height

### Item List Cards
- Full width
- Expandable (animation on open/close)
- Grouped by operation type
- Color-coded badges

### Buttons
- Primary "Start Merge": Large, blue, prominent
- Secondary: Gray outline
- Disabled: Grayed out, cursor not-allowed

---

## Related Documentation

- [USER_FLOWS.md](../USER_FLOWS.md) - Complete user journey (Step 4: Review & Merge)
- [03-configure-merge.md](03-configure-merge.md) - Previous screen
- [05-merge-progress.md](05-merge-progress.md) - Next screen
- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Badge and alert components

---

**Last Updated**: December 18, 2024
**Status**: Phase 3 Complete
**Version**: 1.0
