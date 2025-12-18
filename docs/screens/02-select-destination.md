# Select Destination Screen

## Purpose

The Select Destination screen allows users to choose which organization and specific app will receive the merge. It handles app locking and prepares for the configuration phase.

**User Goals**:
- Select destination organization (if user belongs to multiple)
- Browse and search available apps in organization
- Choose specific destination app for merge target
- Understand lock implications before proceeding
- Confirm selection and acquire locks

---

## URL/Route

**Path**: `/select-destination` or `#/select-destination`

**Query Parameters**: None (source app stored in MergeState from previous screen)

**Prerequisites**: User must have completed Dashboard screen and source app must be loaded in MergeState

---

## Layout Structure

### Screen Container
```
┌─────────────────────────────────────────┐
│ Progress Indicator (Step 1 of 3)        │
├─────────────────────────────────────────┤
│ Screen Title & Instructions              │
├─────────────────────────────────────────┤
│ Warning: Lock Notice                     │
├─────────────────────────────────────────┤
│ Organization Selector                    │
├─────────────────────────────────────────┤
│ Apps Table                               │
│ ┌─────────────────────────────────────┐ │
│ │ Search: [____________]   Sort ▼     │ │
│ ├─────────────────────────────────────┤ │
│ │ App Name  │ ID  │ Modified │ Live   │ │
│ │──────────────────────────────────────│ │
│ │ Prod 2024 │ 789 │ Dec 15   │ ●      │ │
│ │ Staging   │ 790 │ Dec 10   │        │ │
│ │ Test App  │ 791 │ Dec 8    │        │ │  (selectable rows)
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Action Buttons                           │
│ [Cancel]  [Next →]                       │
└─────────────────────────────────────────┘
```

### 1. Progress Indicator

**Content**:
- Step counter: "Step 1 of 3"
- Step name: "Select destination app"
- Progress bar or breadcrumb trail
- Upcoming steps shown in gray (not clickable)

**Visual**:
```
Step 1 of 3: Select destination app
●━━━━○━━━━○
Select     Select      Review
destination items      & merge
```

### 2. Screen Title & Instructions

**Content**:
- **Title** (H1): "Select Destination App"
- **Instructions**: "Choose the organization and app that will receive the merged content. The app will be locked for editing during configuration."
- **Notice**: "Progress cannot be saved. Closing this window will cancel the merge."

### 3. Warning: Lock Notice

**Purpose**: Warn user about app locking before selection

**Content**:
```
⚠️ Notice
When you select a destination app, both the source and destination apps
will be locked for 15 minutes. You and other users won't be able to edit
either app during this time. The lock can be extended if needed.
```

**Style**:
- Orange background (#fff3cd)
- Orange left border (4px)
- Warning icon
- Collapsible (can dismiss but remains accessible)

### 4. Organization Selector

**Visibility**: Only shown if user belongs to multiple organizations

**Content**:
- Label: "Organization"
- Dropdown select with search/filter
- Shows: Organization name, ID, region
- Default: User's current organization pre-selected
- Icon indicator for user's role (App Publisher)

**Example**:
```
Organization
┌────────────────────────────────────┐
│ Acme Corporation (789) · US-East ▼ │  ← Selected
└────────────────────────────────────┘

Dropdown options:
┌────────────────────────────────────┐
│ 🔍 Search organizations...         │
│────────────────────────────────────│
│ ✓ Acme Corporation · US-East       │
│   Beta Staging Org · US-West       │
│   Dev Environment · EU             │
└────────────────────────────────────┘
```

**Behavior**:
- Typing in dropdown filters results
- Selecting org triggers apps table reload
- Only shows orgs where user has App Publisher permission

### 5. Apps Table

**Purpose**: Display and allow selection of destination app

**Columns**:
1. **App Name** (sortable)
   - Main app name
   - Lock icon if locked (🔒)
2. **App ID** (sortable)
   - Numeric ID
3. **Last Modified** (sortable, default sort)
   - Relative time: "2 days ago" or absolute: "Dec 15, 2024"
4. **Live** (filterable)
   - Green dot (●) if published
   - Empty if unpublished

**Features**:
- Global search (searches app name only)
- Column sorting (click header to toggle asc/desc)
- Row selection (click row to select)
- Pagination (if >50 apps: 25/50/100/Show All)
- Locked apps shown but disabled (grayed out, not clickable)
- Current source app excluded from list

**Row States**:
- **Default**: White background, black text
- **Hover**: Light blue background (#f0f8ff)
- **Selected**: Blue background (#e6f3ff), blue left border (4px)
- **Locked**: Gray background, lock icon, not clickable
- **Source app**: Hidden (cannot merge app to itself)

**Empty State**:
```
┌─────────────────────────────────────┐
│   No apps found                     │
│   Try selecting a different         │
│   organization or creating a new app│
└─────────────────────────────────────┘
```

**Locked App Indicator**:
```
│ 🔒 Production 2024 │ 792 │ Dec 14 │ ● │  ← Grayed out
   ↑
   Tooltip: "Locked by Alice Smith (merge in progress)"
```

### 6. Action Buttons

**Primary Action**:
- **Button**: "Next" (blue, large)
- **State**: Disabled until app selected
- **Icon**: Right arrow (→)

**Secondary Action**:
- **Button**: "Cancel" (gray, outlined)
- **Action**: Returns to Dashboard, no state saved

**Layout**:
```
[Cancel]                         [Next →]
(secondary)                      (primary, disabled until selection)
```

---

## Component Breakdown

### ProgressIndicator Component

**Purpose**: Show user their position in multi-step flow

**Props**:
- `currentStep`: Number (1-3)
- `totalSteps`: Number (3)
- `stepLabels`: Array of strings

**Template**:
```vue
<template>
  <div class="progress-indicator">
    <p class="step-counter">
      Step {{ currentStep }} of {{ totalSteps }}:
      <strong>{{ stepLabels[currentStep - 1] }}</strong>
    </p>
    <div class="step-trail">
      <div
        v-for="(label, index) in stepLabels"
        :key="index"
        :class="['step', {
          active: index + 1 === currentStep,
          complete: index + 1 < currentStep,
          pending: index + 1 > currentStep
        }]">
        <div class="step-circle">{{ index + 1 }}</div>
        <span class="step-label">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-trail {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
}

.step.active .step-circle {
  background: var(--primary-color);
  color: white;
}

.step.complete .step-circle {
  background: var(--success-color);
  color: white;
}

.step.pending .step-circle {
  background: var(--border-color-light);
  color: var(--info-color);
}

.step-label {
  font-size: var(--font-size-sm);
  color: var(--info-color);
}
</style>
```

### OrganizationSelector Component

**Purpose**: Select organization with search filtering

**Props**:
- `organizations`: Array of org objects
- `selectedOrgId`: Number
- `@change`: Emit event when selection changes

**Template**:
```vue
<template>
  <div class="org-selector">
    <label for="org-select">Organization</label>
    <select
      id="org-select"
      :value="selectedOrgId"
      @change="$emit('change', $event.target.value)"
      class="org-dropdown">
      <option
        v-for="org in organizations"
        :key="org.id"
        :value="org.id">
        {{ org.name }} ({{ org.id }}) · {{ org.region }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.org-selector {
  margin-bottom: var(--spacing-lg);
}

.org-dropdown {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
}
</style>
```

### AppsTable Component

**Purpose**: Display apps with search, sort, and selection

**Uses**: `Fliplet.UI.Table` library (see PRD requirements for tabular UI)

**Props**:
- `apps`: Array of app objects
- `selectedAppId`: Number or null
- `@select`: Emit event when app selected

**Implementation**:
```javascript
const tableConfig = {
  columns: [
    {
      key: 'name',
      label: 'App Name',
      sortable: true,
      render: (value, row) => {
        const lockIcon = row.locked ? '<i class="fa fa-lock"></i> ' : '';
        return `${lockIcon}${value}`;
      }
    },
    {
      key: 'id',
      label: 'App ID',
      sortable: true
    },
    {
      key: 'updatedAt',
      label: 'Last Modified',
      sortable: true,
      render: (value) => formatRelativeTime(value)
    },
    {
      key: 'published',
      label: 'Live',
      render: (value) => value ? '<span class="live-dot">●</span>' : ''
    }
  ],
  data: apps,
  searchable: true,
  searchPlaceholder: 'Search apps...',
  selectable: 'single',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  pageSize: 25,
  rowClassName: (row) => {
    if (row.locked) return 'locked-row';
    if (row.id === selectedAppId) return 'selected-row';
    return '';
  },
  onRowClick: (row) => {
    if (!row.locked) {
      this.$emit('select', row.id);
    }
  }
};

const table = await Fliplet.UI.Table(tableConfig);
```

---

## Mock Data

### User Organizations
```javascript
const mockOrganizations = [
  {
    id: 789,
    name: "Acme Corporation",
    region: "US-East",
    role: "App Publisher"
  },
  {
    id: 790,
    name: "Beta Staging Org",
    region: "US-West",
    role: "App Publisher"
  },
  {
    id: 791,
    name: "Development Team",
    region: "EU",
    role: "Organization Admin"
  }
];
```

### Apps List
```javascript
const mockApps = [
  {
    id: 789012,
    name: "Production 2024 App",
    organizationId: 789,
    updatedAt: "2024-12-15T14:30:00.000Z",
    updatedBy: { firstName: "Bob", lastName: "Johnson" },
    published: true,
    locked: false
  },
  {
    id: 789013,
    name: "Staging Environment",
    organizationId: 789,
    updatedAt: "2024-12-10T09:15:00.000Z",
    updatedBy: { firstName: "Alice", lastName: "Smith" },
    published: false,
    locked: false
  },
  {
    id: 789014,
    name: "Test App (Locked)",
    organizationId: 789,
    updatedAt: "2024-12-08T16:45:00.000Z",
    updatedBy: { firstName: "Charlie", lastName: "Davis" },
    published: false,
    locked: true,
    lockedBy: { firstName: "Alice", lastName: "Smith" }
  }
];
```

---

## API Integration

### Fetch User Organizations (On Mount)

**Endpoint**: `GET /v1/organizations`

**Purpose**: Load organizations where user has App Publisher permission

**Example Request**:
```javascript
const orgs = await MergeAPI.fetchUserOrganizations({
  filter: 'canMerge'  // Only orgs where user can merge
});
```

**Example Response**:
```json
{
  "organizations": [
    {
      "id": 789,
      "name": "Acme Corporation",
      "region": "us-east",
      "role": "App Publisher"
    },
    {
      "id": 790,
      "name": "Beta Staging Org",
      "region": "us-west",
      "role": "App Publisher"
    }
  ]
}
```

### Fetch Apps for Organization

**Endpoint**: `GET /v1/organizations/:orgId/apps`

**Triggered**: On mount (default org) and when user changes organization

**Parameters**:
- `orgId`: Selected organization ID
- `include`: `locks,published`
- `exclude`: Source app ID (don't show in list)

**Example Request**:
```javascript
const apps = await MergeAPI.fetchAppsForOrganization(selectedOrgId, {
  include: ['locks', 'published'],
  exclude: [sourceAppId]  // Don't show source app
});
```

**Example Response**:
```json
{
  "apps": [
    {
      "id": 789012,
      "name": "Production 2024 App",
      "updatedAt": "2024-12-15T14:30:00.000Z",
      "updatedBy": {
        "firstName": "Bob",
        "lastName": "Johnson"
      },
      "published": true,
      "locked": false
    },
    {
      "id": 789014,
      "name": "Test App",
      "updatedAt": "2024-12-08T16:45:00.000Z",
      "published": false,
      "locked": true,
      "lockedBy": {
        "firstName": "Alice",
        "lastName": "Smith"
      },
      "lockExpiry": "2024-12-18T15:30:00.000Z"
    }
  ]
}
```

### Acquire Lock (On "Next" Click)

**Endpoint**: `POST /v1/apps/:appId/lock`

**Purpose**: Lock both source and destination apps for 15 minutes

**Triggered**: When user clicks "Next" after selecting destination app

**Example Request**:
```javascript
// Show confirmation modal first
const confirmed = await showLockConfirmationModal();
if (!confirmed) return;

// Acquire locks
const locks = await MergeAPI.acquireLocks({
  sourceAppId: MergeState.sourceApp.id,
  destinationAppId: selectedAppId,
  duration: 15 * 60 * 1000  // 15 minutes in ms
});
```

**Example Response**:
```json
{
  "locks": [
    {
      "appId": 123456,
      "lockedAt": "2024-12-18T15:00:00.000Z",
      "expiresAt": "2024-12-18T15:15:00.000Z",
      "lockedBy": {
        "id": 5001,
        "firstName": "Alice",
        "lastName": "Smith"
      }
    },
    {
      "appId": 789012,
      "lockedAt": "2024-12-18T15:00:00.000Z",
      "expiresAt": "2024-12-18T15:15:00.000Z",
      "lockedBy": {
        "id": 5001,
        "firstName": "Alice",
        "lastName": "Smith"
      }
    }
  ]
}
```

**Error Handling**:

| Error | Reason | User Action |
|-------|--------|-------------|
| 409 Conflict | App already locked by another user | Show error, suggest waiting or choosing different app |
| 403 Forbidden | User lacks permission | Show permission error |
| 500 Server Error | Failed to acquire lock | Retry or contact support |

---

## User Interactions

### Primary Flow

1. **User lands on screen** (from Dashboard)
   - System loads user's organizations
   - Pre-selects current organization
   - Loads apps for that organization
   - Shows loading spinner in table (1-2 seconds)

2. **User reviews organization** (if multiple orgs)
   - Sees organization dropdown (if >1 org)
   - Current org pre-selected
   - Optionally changes organization
   - Apps table reloads with new org's apps

3. **User searches/filters apps** (30-60 seconds)
   - Types "Production" in search box
   - Table filters to matching apps (5 results → 2 results)
   - Clicks "Last Modified" column to sort
   - Reviews app details

4. **User selects destination app**
   - Clicks row: "Production 2024 App"
   - Row highlights in blue
   - "Next" button enables

5. **User clicks "Next"**
   - Confirmation modal appears:
     ```
     Confirm App Selection

     You selected: Production 2024 App (ID: 789012)

     Both the source and destination apps will be locked
     for 15 minutes. You and other users won't be able to
     edit either app during configuration.

     Continue?

     [Cancel]  [Continue]
     ```

6. **User confirms in modal**
   - Clicks "Continue"
   - Modal shows loading spinner
   - System acquires locks (2-3 seconds)
   - Success: Navigates to Configure Merge screen
   - Lock timer starts: "14:58 remaining"

### Alternative Flow: Change Organization

1. **User on Select Destination screen**
2. **User clicks organization dropdown**
3. **User types "Staging"** in filter
4. **User selects "Beta Staging Org"**
5. **Apps table reloads**
   - Shows loading spinner
   - Fetches apps for new org
   - Displays new apps list
6. **User continues with app selection**

### Alternative Flow: Locked App

1. **User searches for app**
2. **Finds desired app but sees lock icon**: 🔒
3. **Hovers over locked app**
   - Tooltip: "Locked by Alice Smith (merge in progress)"
4. **User tries to click** (click ignored, row grayed out)
5. **User waits or selects different app**

---

## Error States

### Error State 1: No Organizations

**Trigger**: User not member of any organization

**Display**:
```
┌──────────────────────────────────────┐
│ ⚠️  No Organizations Found           │
│                                      │
│ You must belong to an organization   │
│ to merge apps.                       │
│                                      │
│ Contact Fliplet support for help.   │
│                                      │
│ [Contact Support]                    │
└──────────────────────────────────────┘
```

### Error State 2: No Apps in Organization

**Trigger**: Selected organization has 0 apps

**Display**:
```
Organization: Acme Corporation

┌──────────────────────────────────────┐
│   No apps found in this organization │
│                                      │
│   Try selecting a different          │
│   organization or create a new app.  │
└──────────────────────────────────────┘

[Create New App]  (links to Studio)
```

### Error State 3: Lock Acquisition Failed

**Trigger**: Failed to acquire lock on destination app

**Display** (modal):
```
┌──────────────────────────────────────┐
│ ⚠️  Cannot Lock App                  │
│                                      │
│ This app was just locked by another  │
│ user. Please choose a different app  │
│ or try again later.                  │
│                                      │
│ Locked by: Alice Smith               │
│ Lock expires: Dec 18 at 3:30 PM      │
│                                      │
│ [Choose Different App]  [Retry]      │
└──────────────────────────────────────┘
```

**Actions**:
- "Choose Different App": Dismisses modal, returns to table
- "Retry": Attempts to acquire lock again

### Error State 4: API Error Loading Apps

**Trigger**: API call to fetch apps fails

**Display**:
```
Organization: Acme Corporation

┌──────────────────────────────────────┐
│ ⚠️  Failed to Load Apps              │
│                                      │
│ We couldn't load the apps list.      │
│ Please try again.                    │
│                                      │
│ [Retry]                              │
└──────────────────────────────────────┘
```

---

## Accessibility

### Semantic HTML
- `<h1>` for screen title
- `<label>` for organization selector
- `<table>` with proper `<thead>` and `<tbody>` for apps table
- `<button>` elements for actions (not divs)

### ARIA Attributes
- Organization dropdown: `aria-label="Select destination organization"`
- Apps table: `role="table"`, column headers with `scope="col"`
- Selected row: `aria-selected="true"`
- Locked rows: `aria-disabled="true"`, `aria-label="App locked by [user]"`
- "Next" button when disabled: `aria-disabled="true"`

### Keyboard Navigation
1. **Tab order**:
   - Organization dropdown (if shown)
   - Search box
   - Apps table (enter table with Tab, navigate rows with Arrow keys)
   - "Cancel" button
   - "Next" button

2. **Table navigation**:
   - Arrow Up/Down: Navigate rows
   - Enter/Space: Select row
   - Escape: Clear selection

3. **Focus indicators**:
   - Blue outline (3px) on focused elements
   - Selected row: blue border + background

### Screen Reader Support
- Table announces: "Apps table, 15 rows"
- Row selection announces: "Production 2024 App selected"
- Locked row announces: "Test App, locked by Alice Smith, not selectable"
- Button state announces: "Next button, disabled" or "Next button"

### Color Contrast
- All text meets WCAG AA (4.5:1 contrast)
- Selected row: sufficient contrast between background and text
- Locked row: grayed but still readable (3:1 minimum)

---

## Visual Design

### Layout
- **Container**: Max width 1200px, centered
- **Spacing**: 24px between sections
- **Table**: Full width, scrollable if needed

### Typography
- **H1** (screen title): 24px, bold
- **Instructions**: 14px, normal weight
- **Table headers**: 12px, semibold, uppercase
- **Table cells**: 14px, normal weight

### Colors
- **Selected row**: Blue background (#e6f3ff), blue left border
- **Hover row**: Light blue (#f0f8ff)
- **Locked row**: Light gray (#f5f5f5), gray text
- **Live indicator**: Green dot (#19cd9d)

### Table Styling
- **Header**: Light gray background, bold text
- **Borders**: 1px solid #dee2e6
- **Row height**: 48px
- **Padding**: 12px in cells

### Buttons
- **Primary "Next"**: Blue, right-aligned, with arrow icon
- **Secondary "Cancel"**: Gray outline, left-aligned
- **Disabled state**: Gray background, cursor not-allowed

---

## Related Documentation

- [USER_FLOWS.md](../USER_FLOWS.md) - Complete user journey (Step 2: Select Destination)
- [01-dashboard.md](01-dashboard.md) - Previous screen
- [03-configure-merge.md](03-configure-merge.md) - Next screen in flow
- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Visual design tokens
- [patterns/interaction-patterns.md](../patterns/interaction-patterns.md) - Table interaction patterns

---

**Last Updated**: December 18, 2024
**Status**: Phase 3 Complete
**Version**: 1.0
