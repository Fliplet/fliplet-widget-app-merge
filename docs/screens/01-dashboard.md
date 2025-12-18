# Dashboard Screen

## Purpose

The Dashboard screen is the entry point for the merge flow. It shows source app information, verifies prerequisites are met, and provides context before the user begins configuration.

**User Goals**:
- Understand which app is being merged (source app)
- Verify they have permission and prerequisites to proceed
- Review source app content summary (screens, data sources, files)
- Access audit log for historical merge information
- Start merge configuration

---

## URL/Route

**Path**: `/` or `/dashboard` (default screen)

**Query Parameters**:
- `sourceAppId`: Required. ID of app to merge from (set by Fliplet Studio)
- Example: `/?sourceAppId=123456`

---

## Layout Structure

### Screen Container
```
┌─────────────────────────────────────────┐
│ Header                                   │
├─────────────────────────────────────────┤
│ Prerequisites Panel                      │
├─────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │Screens │ │  Data  │ │ Files  │       │
│ │ Card   │ │Sources │ │  Card  │       │
│ │        │ │  Card  │ │        │       │
│ └────────┘ └────────┘ └────────┘       │
├─────────────────────────────────────────┤
│ Warning Panel (if applicable)            │
├─────────────────────────────────────────┤
│ Action Panel                             │
└─────────────────────────────────────────┘
```

### 1. Header Section

**Content**:
- Source app name (H1 heading)
- App ID (small text, gray)
- Last updated timestamp (e.g., "Last modified: Dec 15, 2024 at 10:30 AM")
- Organization name (with icon)
- Region (e.g., "US-East")

**Example**:
```
Sales Conference 2024              (H1, 24px, bold)
App ID: 123456                     (small, gray)
Last modified: Dec 15, 2024 at 10:30 AM by Alice Smith
Acme Corporation · US-East         (gray, with icons)
```

### 2. Prerequisites Panel

**Purpose**: Show user checklist of requirements before proceeding.

**Content**:
- Card with checklist title: "Prerequisites"
- List of prerequisite checks with status icons
- All items must show green checkmark to enable "Configure Merge" button

**Items**:
1. "You have permission to merge" (check: user has App Publisher rights)
2. "Source app has content to merge" (check: app has screens, DS, or files)
3. "You are a member of at least one organization" (check: user in ≥1 org)

**Visual**:
```
Prerequisites
✅ You have permission to merge
✅ Source app has content to merge
✅ You are a member of at least one organization
```

### 3. Source App Summary Cards (3-column grid)

**Layout**: 3 equal-width cards in row (mobile: stack vertically)

#### Card 1: Screens
- **Icon**: Screens icon (fa-window)
- **Count**: "15 screens" (large, bold)
- **Description**: "App screens and layouts" (small, gray)

#### Card 2: Data Sources
- **Icon**: Database icon (fa-database)
- **Count**: "3 data sources" (large, bold)
- **Description**: "Data tables and records" (small, gray)

#### Card 3: Files
- **Icon**: Folder icon (fa-folder)
- **Count**: "42 files" (large, bold)
- **Description**: "Images and documents" (small, gray)

**Card Visual Style**:
```
┌──────────────────┐
│   📱 (icon)      │
│                  │
│  15 screens      │  (large, bold)
│                  │
│  App screens     │  (small, gray)
│  and layouts     │
└──────────────────┘
```

### 4. Warning Panel (Conditional)

**Shown when**:
- Destination app already locked by another user
- Previous merge in progress
- User lacks permission in some organizations

**Example** (locked app warning):
```
┌──────────────────────────────────────────┐
│ ⚠️  Warning                              │
│ This app is currently locked by another  │
│ merge operation. Please try again later. │
└──────────────────────────────────────────┘
```

**Style**:
- Orange/yellow background (`#fff3cd`)
- Orange left border (4px, `#ff9800`)
- Warning icon
- Clear message

### 5. Action Panel

**Primary Action**:
- **Button**: "Configure Merge" (large, blue, primary)
- **State**: Enabled when all prerequisites met
- **State**: Disabled (grayed out) if prerequisites fail

**Secondary Action**:
- **Link**: "View Audit Log" (blue text link)
- **Action**: Opens audit log in new tab or modal

**Layout**:
```
┌──────────────────────────────────────────┐
│  [Configure Merge]  View Audit Log       │
│  (primary button)   (link)               │
└──────────────────────────────────────────┘
```

---

## Component Breakdown

### SourceAppCard Component

**Purpose**: Display summary statistic for app content type.

**Props**:
- `icon`: String (FontAwesome class, e.g., "fa-window")
- `count`: Number (e.g., 15)
- `label`: String (e.g., "screens")
- `description`: String (e.g., "App screens and layouts")

**Template**:
```vue
<template>
  <merge-card variant="summary" class="source-app-card">
    <div class="icon-wrapper">
      <i :class="['fa', icon]" aria-hidden="true"></i>
    </div>
    <h3 class="count">{{ count }} {{ label }}</h3>
    <p class="description">{{ description }}</p>
  </merge-card>
</template>

<style scoped>
.source-app-card {
  text-align: center;
  padding: var(--spacing-lg);
}

.icon-wrapper {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.count {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--secondary-color);
  margin-bottom: var(--spacing-sm);
}

.description {
  font-size: var(--font-size-sm);
  color: var(--info-color);
}
</style>
```

### PrerequisiteChecklist Component

**Purpose**: Display prerequisite checks with status indicators.

**Props**:
- `items`: Array of `{ id, text, met }` objects

**Template**:
```vue
<template>
  <merge-card variant="checklist" class="prerequisites">
    <h3>Prerequisites</h3>
    <ul class="checklist">
      <li
        v-for="item in items"
        :key="item.id"
        :class="{ met: item.met, unmet: !item.met }">
        <i
          :class="item.met ? 'fa fa-check-circle' : 'fa fa-times-circle'"
          :aria-hidden="true"></i>
        <span>{{ item.text }}</span>
      </li>
    </ul>
  </merge-card>
</template>

<style scoped>
.checklist {
  list-style: none;
  padding: 0;
  margin: var(--spacing-md) 0 0 0;
}

.checklist li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
}

.checklist li.met i {
  color: var(--success-color);
  font-size: 20px;
}

.checklist li.unmet i {
  color: var(--danger-color);
  font-size: 20px;
}

.checklist li span {
  font-size: var(--font-size-base);
}
</style>
```

### DashboardHeader Component

**Purpose**: Display source app metadata.

**Props**:
- `appName`: String
- `appId`: Number
- `organizationName`: String
- `region`: String
- `lastModified`: String (ISO date)
- `lastModifiedBy`: String

**Template**:
```vue
<template>
  <div class="dashboard-header">
    <h1>{{ appName }}</h1>
    <p class="app-meta">
      <span class="app-id">App ID: {{ appId }}</span>
      <span class="separator">·</span>
      <span class="organization">
        <i class="fa fa-building" aria-hidden="true"></i>
        {{ organizationName }}
      </span>
      <span class="separator">·</span>
      <span class="region">{{ region }}</span>
    </p>
    <p class="last-modified">
      Last modified: {{ formatDate(lastModified) }} by {{ lastModifiedBy }}
    </p>
  </div>
</template>

<script setup>
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
</script>

<style scoped>
.dashboard-header {
  margin-bottom: var(--spacing-lg);
}

.dashboard-header h1 {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--secondary-color);
  margin-bottom: var(--spacing-sm);
}

.app-meta {
  font-size: var(--font-size-sm);
  color: var(--info-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.separator {
  color: var(--border-color);
}

.last-modified {
  font-size: var(--font-size-sm);
  color: var(--info-color);
  margin-top: var(--spacing-xs);
}
</style>
```

---

## Mock Data

### Source App Data
```javascript
const mockSourceApp = {
  id: 123456,
  name: "Sales Conference 2024",
  organizationId: 789,
  organizationName: "Acme Corporation",
  region: "US-East",
  screensCount: 15,
  dataSourcesCount: 3,
  filesCount: 42,
  updatedAt: "2024-12-15T10:30:00.000Z",
  updatedBy: {
    id: 5001,
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@acme.com"
  },
  permissions: {
    canMerge: true,
    canEdit: true,
    canPublish: true
  }
};
```

### Prerequisites Data
```javascript
const mockPrerequisites = [
  {
    id: 'permission',
    text: 'You have permission to merge',
    met: true,
    check: () => mockSourceApp.permissions.canMerge
  },
  {
    id: 'content',
    text: 'Source app has content to merge',
    met: true,
    check: () => {
      return mockSourceApp.screensCount > 0 ||
             mockSourceApp.dataSourcesCount > 0 ||
             mockSourceApp.filesCount > 0;
    }
  },
  {
    id: 'organization',
    text: 'You are a member of at least one organization',
    met: true,
    check: () => mockUserOrganizations.length > 0
  }
];
```

### Summary Cards Data
```javascript
const mockSummaryCards = [
  {
    id: 'screens',
    icon: 'fa-window',
    count: 15,
    label: 'screens',
    description: 'App screens and layouts'
  },
  {
    id: 'dataSources',
    icon: 'fa-database',
    count: 3,
    label: 'data sources',
    description: 'Data tables and records'
  },
  {
    id: 'files',
    icon: 'fa-folder',
    count: 42,
    label: 'files',
    description: 'Images and documents'
  }
];
```

---

## API Integration

### On Mount

**Endpoint**: `GET /v1/apps/:id`

**Parameters**:
- `id`: Source app ID (from `sourceAppId` query parameter)
- `include`: `screens,dataSources,files`

**Example Request**:
```javascript
const sourceAppId = new URLSearchParams(window.location.search).get('sourceAppId');

const response = await MergeAPI.fetchApp(sourceAppId, {
  include: ['screens', 'dataSources', 'files']
});
```

**Example Response**:
```json
{
  "app": {
    "id": 123456,
    "name": "Sales Conference 2024",
    "organizationId": 789,
    "organizationName": "Acme Corporation",
    "region": "us-east",
    "screensCount": 15,
    "dataSourcesCount": 3,
    "filesCount": 42,
    "updatedAt": "2024-12-15T10:30:00.000Z",
    "updatedBy": {
      "id": 5001,
      "firstName": "Alice",
      "lastName": "Smith"
    },
    "permissions": {
      "canMerge": true,
      "canEdit": true,
      "canPublish": true
    }
  }
}
```

**Error Handling**:

| Error Code | Message | User Action |
|------------|---------|-------------|
| 404 | "App not found" | Show error alert with "Contact Support" link |
| 403 | "No permission to access this app" | Show permission error, suggest requesting access |
| 500 | "Failed to load app" | Show error with "Retry" button |

**Loading State**: Show skeleton cards while loading

### Check User Organizations

**Endpoint**: `GET /v1/organizations`

**Purpose**: Verify user belongs to at least one organization

**Example Request**:
```javascript
const orgs = await MergeAPI.fetchUserOrganizations();
const hasOrgs = orgs.length > 0;
```

**Example Response**:
```json
{
  "organizations": [
    {
      "id": 789,
      "name": "Acme Corporation",
      "role": "App Publisher"
    },
    {
      "id": 790,
      "name": "Beta Staging Org",
      "role": "App Publisher"
    }
  ]
}
```

### On "Configure Merge" Click

**Action**: Navigate to Select Destination screen

**State Management**:
```javascript
// Store source app in MergeState
window.MergeState.setSourceApp(sourceApp);

// Persist to localStorage
window.MergeStorage.set('mergeState', {
  sourceAppId: sourceApp.id,
  sourceAppName: sourceApp.name,
  timestamp: Date.now()
});

// Navigate
window.location.hash = '#/select-destination';
```

---

## User Interactions

### Primary Flow

1. **User lands on screen** (via Studio iframe)
   - System loads source app data via API
   - Shows loading skeleton (1-2 seconds)
   - Renders app details and summary cards

2. **User reviews source app information** (10-30 seconds)
   - Reads app name, org, last modified
   - Sees content summary (15 screens, 3 DS, 42 files)
   - Confirms prerequisites checklist (all green)

3. **User confirms prerequisites are met**
   - All checkmarks green
   - "Configure Merge" button enabled

4. **User clicks "Configure Merge"**
   - Button shows loading spinner briefly
   - Stores source app in MergeState
   - Navigates to Select Destination screen

### Alternative Flow: View Audit Log

1. **User clicks "View Audit Log" link**
   - Opens audit log in new browser tab
   - URL: `/audit-log?appId=123456&category=merge`
   - User can review historical merge operations
   - User returns to Dashboard (tab still open)

---

## Error States

### Error State 1: Loading Failed

**Trigger**: API call to fetch app fails

**Display**:
```
┌──────────────────────────────────────────┐
│ ⚠️  Failed to Load App                   │
│                                          │
│ We couldn't load the app information.   │
│ Please try again.                        │
│                                          │
│ [Retry]                                  │
└──────────────────────────────────────────┘
```

**Actions**:
- Retry button calls API again
- If retry fails 3 times: show "Contact Support" option

### Error State 2: No Permission

**Trigger**: User lacks App Publisher permission

**Display**:
- Prerequisites checklist shows red X:
  - ❌ You have permission to merge
- "Configure Merge" button disabled (grayed out)
- Info box below: "You need App Publisher permission to merge apps. Contact your organization admin."

### Error State 3: Empty App

**Trigger**: App has 0 screens, 0 data sources, 0 files

**Display**:
- Prerequisites checklist shows red X:
  - ❌ Source app has content to merge
- Summary cards show: "0 screens", "0 data sources", "0 files"
- "Configure Merge" button disabled
- Info box: "This app is empty. Add content before merging."

### Error State 4: No Organizations

**Trigger**: User not member of any organization

**Display**:
- Prerequisites checklist shows red X:
  - ❌ You are a member of at least one organization
- "Configure Merge" button disabled
- Info box: "You must belong to an organization to merge apps. Contact Fliplet support."

---

## Accessibility

### Semantic HTML
- `<h1>` for app name (screen title)
- `<h3>` for card titles and section headers
- Proper heading hierarchy (no skipped levels)

### ARIA Attributes
- All icons: `aria-hidden="true"` (decorative)
- Prerequisites checklist: `role="list"` on `<ul>`
- Card stats: `aria-label` for context (e.g., "15 screens in source app")

### Keyboard Navigation
1. **Tab order**:
   - Prerequisites panel (informational, not focusable)
   - Summary cards (informational, not focusable)
   - "Configure Merge" button (primary action)
   - "View Audit Log" link (secondary action)

2. **Focus indicators**:
   - Blue outline (3px) on focused button/link
   - Outline offset: 2px

3. **Keyboard shortcuts**:
   - Enter on "Configure Merge": navigate to next screen
   - Escape: close merge overlay (return to Studio)

### Screen Reader Support
- "Configure Merge" button: `aria-label="Configure merge for Sales Conference 2024 app"`
- Prerequisites: Announce status (e.g., "Prerequisite met: You have permission to merge")
- Loading state: `aria-live="polite"` region announces "Loading app information..."

### Color Contrast
- All text meets WCAG AA standards (4.5:1 for normal text)
- Green checkmarks: sufficient contrast on white background
- Button states clearly distinguishable (color + disabled attribute)

---

## Visual Design

### Layout
- **Container**: Max width 1200px, centered
- **Spacing**: 24px between sections
- **Cards grid**: 3 columns on desktop, stack on mobile (<768px)

### Typography
- **H1** (app name): 24px, bold, dark gray
- **H3** (card counts): 20px, semibold
- **Body text**: 14px, normal weight
- **Small text**: 12px (meta info, descriptions)

### Colors
- **Primary action**: Blue (#00abd1)
- **Success indicators**: Green (#19cd9d)
- **Text**: Dark gray (#36344c)
- **Meta text**: Medium gray (#4e5169)

### Cards
- **Background**: White
- **Border**: 1px solid #dee2e6
- **Border radius**: 4px
- **Shadow**: Subtle (0 1px 3px rgba(0,0,0,0.12))
- **Padding**: 24px

### Buttons
- **Primary**: Blue background, white text, 8px 16px padding
- **Hover**: Darker blue
- **Disabled**: Light gray background, gray text, not clickable

### Responsive Behavior
- **Desktop (≥1024px)**: 3-column card grid
- **Tablet (768-1023px)**: 2-column card grid
- **Mobile (<768px)**: Single column, cards stack

---

## Related Documentation

- [USER_FLOWS.md](../USER_FLOWS.md) - Complete user journey (Step 1: Dashboard)
- [02-select-destination.md](02-select-destination.md) - Next screen in flow
- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Visual design tokens and components
- [GLOSSARY.md](../GLOSSARY.md) - Terminology reference

---

**Last Updated**: December 18, 2024
**Status**: Phase 3 Complete
**Version**: 1.0
