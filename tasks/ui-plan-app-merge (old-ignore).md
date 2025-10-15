# UI/UX Plan: App Merge Widget

## Overview

The App Merge Widget provides a multi-step user interface within Fliplet Studio that enables users to merge apps within or across organizations. The widget guides users through destination selection, merge configuration, review, and real-time monitoring of the merge process.

**Purpose:** Configure, initiate, and monitor app merge operations
**Target Users:** Fliplet Studio users with App Publisher rights
**Context:** Build context - runs as an overlay in Fliplet Studio
**Framework:** Vue.js 3.5.13 with Options API

### Source Alignment

**Primary PRD References:**
- Multi-step workflow (Dashboard → Select Destination → Configure → Review → Progress → Complete)
- Tabular UI for screens, data sources, and files with search, sort, filter, pagination
- Real-time progress monitoring and completion summary
- Client-side validation for duplicates, permissions, plan limits
- App locking during configuration and merge execution

**Design Spec References:**
- 6 distinct UI states with specific layouts and interactions
- Table component with expandable rows, nested associations, bulk selection
- Progress indicators, lock countdown warnings, validation messages
- Color-coded status indicators (copy, overwrite, conflict)
- Responsive layouts adapting to different screen sizes

## Technical Stack

### Framework
- **Vue.js Version:** 3.5.13
- **Component API:** Vue Options API
- **Build Context:** Build (runs in Fliplet Studio overlay)
- **Build Tool:** Webpack via Gulp

### Available Dependencies

**Current Dependencies (widget.json):**
```json
{
  "build": {
    "dependencies": ["fliplet-core"],
    "assets": [
      "dist/css/index.css",
      "dist/app.js"
    ]
  }
}
```

**Required Additional Dependencies:**
- `fliplet-table` - For tabular data display with advanced features
- `bootstrap` - For responsive grid and UI components (if not already available via fliplet-core)

**Note:** All dependencies must be verified against [Fliplet's asset library](https://api.fliplet.com/v1/widgets/assets) before implementation.

### File Structure Plan

```
/src/
├── components/
│   ├── layout/
│   │   ├── AppOverlay.vue              # Main overlay wrapper
│   │   ├── StepIndicator.vue           # Progress breadcrumb (Step 1/2/3)
│   │   └── WarningBanner.vue           # Reusable warning/info banner
│   ├── dashboard/
│   │   ├── MergeDashboard.vue          # State 1: Dashboard view
│   │   └── AppInfoCard.vue             # Source app information display
│   ├── destination/
│   │   ├── DestinationSelection.vue    # State 2: Destination picker
│   │   ├── OrganizationDropdown.vue    # Organization selector
│   │   └── AppSelectionTable.vue       # App list table
│   ├── configuration/
│   │   ├── MergeConfiguration.vue      # State 3: Main configuration view
│   │   ├── TabNavigation.vue           # Tab switcher
│   │   ├── ScreensTab.vue              # Screens selection tab
│   │   ├── DataSourcesTab.vue          # Data sources tab
│   │   ├── FilesTab.vue                # Files tab
│   │   └── SettingsTab.vue             # Settings & Global Code tab
│   ├── review/
│   │   ├── ReviewSummary.vue           # State 4: Review screen
│   │   └── SummarySection.vue          # Reusable summary section
│   ├── progress/
│   │   ├── MergeProgress.vue           # State 5: Progress monitoring
│   │   ├── ProgressBar.vue             # Animated progress indicator
│   │   └── StatusLog.vue               # Scrolling status messages
│   ├── completion/
│   │   ├── MergeComplete.vue           # State 6: Completion screen
│   │   └── CompletionSummary.vue       # Results summary
│   ├── ui/
│   │   ├── DataTable.vue               # Reusable table wrapper (uses fliplet-table)
│   │   ├── SearchInput.vue             # Search field component
│   │   ├── StatusBadge.vue             # Status indicator (copy/overwrite/conflict)
│   │   ├── ActionButton.vue            # Button with loading states
│   │   ├── LockCountdown.vue           # Lock timer warning
│   │   └── EmptyState.vue              # Empty data placeholder
│   └── shared/
│       ├── LoadingSpinner.vue          # Loading indicator
│       └── ErrorMessage.vue            # Error display component
├── scss/
│   ├── _variables.scss                 # Design system variables
│   ├── _mixins.scss                    # Reusable SCSS mixins
│   ├── _base.scss                      # Base styles and resets
│   ├── _layout.scss                    # Layout utilities
│   ├── _components.scss                # Component styles
│   ├── _responsive.scss                # Breakpoint-specific styles
│   └── index.scss                      # Main entry point
├── utils/
│   ├── validators.js                   # Validation helpers
│   ├── formatters.js                   # Date/number formatting
│   └── constants.js                    # App constants
├── Application.vue                     # Root component
└── main.js                             # Vue app initialization

/build.html                              # HTML template for overlay
```

## Design Principles

### Core Principles
- **Responsive Design:** Mobile-first approach with fluid layouts (320px+)
- **Accessibility:** WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Progressive Disclosure:** Show details only when needed (expandable rows, tooltips)
- **Clear Feedback:** Immediate validation, loading states, success/error messages
- **Safe Operations:** Confirmations before destructive actions, clear warning messages

### Design System Integration
- **Fliplet Studio UI:** Align with existing Fliplet Studio patterns and terminology
- **Custom Components:** Extend Fliplet base styles with BEM methodology
- **Theming Architecture:** CSS custom properties for brand customization

## User Journey Mapping

### Primary User Flow: Complete App Merge

**User Goal:** Merge content from source app into destination app
**Entry Point:** User clicks "App > Merge app..." menu in Fliplet Studio
**Success Criteria:** Merge completes successfully with all selected items copied/overwritten
**Referenced States:** All 6 states from design spec (Dashboard → Selection → Configuration → Review → Progress → Complete)
**PRD Alignment:** Complete multi-step workflow with validation, locking, progress monitoring

**Steps:**

1. **View Merge Dashboard**
   - User Action: Click "Configure merge" button
   - System Response: Display State 2 (Destination Selection)
   - Data Displayed: Source app info, prerequisites, warnings
   - Possible Errors: App already locked, user lacks publisher rights

2. **Select Destination App**
   - User Action: Select organization (if multiple), search/select app, click "Next"
   - System Response: Lock both apps, display State 3 (Configuration)
   - Data Displayed: Organizations list, apps list with lock/status indicators
   - Possible Errors: Destination has duplicates, insufficient permissions, app is locked

3. **Configure Merge Settings**
   - User Action: Switch tabs, search/filter/select items, configure options, click "Review"
   - System Response: Validate selections, display State 4 (Review)
   - Data Displayed: Screens, data sources, files, settings in tabular format with associations
   - Possible Errors: No items selected, lock expired, validation failures

4. **Review Merge Summary**
   - User Action: Review all selections, click "Start merge" or "Edit settings"
   - System Response: Validate for conflicts/limits, initiate merge, display State 5 (Progress)
   - Data Displayed: Color-coded summary of all selections (copy/overwrite/conflict)
   - Possible Errors: Duplicate names detected, plan limits exceeded

5. **Monitor Merge Progress**
   - User Action: Watch progress, optionally close overlay
   - System Response: Real-time status updates, transition to State 6 on completion
   - Data Displayed: Progress bar, scrolling status messages, success/failure indicators
   - Possible Errors: Merge failures, timeout errors

6. **View Completion Summary**
   - User Action: Review results, click "Open app" or "Close"
   - System Response: Unlock apps, open destination app in Studio (if requested)
   - Data Displayed: Items merged counts, warnings, errors, next steps
   - Possible Errors: None (merge is complete)

## State-Oriented UX Specifications

### UI State Matrix

#### State 1: Merge Dashboard

**Entry Triggers:**
- User navigates to "App > Merge app..." menu in Fliplet Studio
- User returns to dashboard from Step 1 by clicking "Back"

**Design References:**
- Design Spec State 1 (lines 52-96)
- Shows source app info card, prerequisites section, audit log link, "Configure merge" CTA

**Visibility/Data:**
- **Source App Information:**
  - App name, ID, organization, region
  - Published/Not Published status badge
  - Last modified timestamp and user name
- **Prerequisites Section:**
  - "Before you start" warning text
  - Bullet points about duplicate checking, naming, configuration not saved
  - App locking warning
- **Audit Log Link:** Opens in new tab/window
- **Actions:** "Configure merge" (primary), "Cancel" (secondary)

**Allowed Actions:**
- Click "Configure merge" → Navigate to State 2 (if user has publisher rights and app not locked)
- Click "View audit log" → Open audit log in new window
- Click "Cancel" or X → Close overlay

**Forbidden Actions (and Why):**
- Cannot configure merge if app is locked → Show lock status message
- Cannot configure merge without publisher rights → Hide "Configure merge" button
- Cannot save progress → Warning displayed prominently

**System Feedback:**
- Loading: Skeleton/spinner while fetching app details
- Error: "Unable to load app details" with retry option
- Lock status: "This app is currently locked" banner

**Empty/Error/Offline Variants:**
- **App not found:** "The app could not be found or you don't have access"
- **Network error:** "Connection failed. Please check your internet connection"
- **Locked app:** Lock icon with "Locked due to ongoing merge" message

**Permissions/Entitlements:**
- Must have App Publisher rights on source app
- Must be authenticated Fliplet user

**Analytics:**
```javascript
// Dashboard loaded
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'dashboard_viewed',
  label: sourceAppId
});

// Configure merge clicked
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'configure_merge_started',
  label: sourceAppId
});
```

**Transitions:**
- → State 2 (Destination Selection) when "Configure merge" clicked
- → Closed when "Cancel" or X clicked
- → State 5 (Merge in Progress) if merge already initiated

---

#### State 2: Step 1 - Select Destination App

**Entry Triggers:**
- User clicks "Configure merge" from State 1
- User clicks "Back" from State 3 (unlocks apps)

**Design References:**
- Design Spec State 2 (lines 99-173)
- Shows 3-step progress indicator, warnings, organization dropdown (conditional), app selection table

**Visibility/Data:**
- **Progress Indicator:** Step 1 highlighted, Steps 2-3 upcoming
- **Warning Banners:**
  - "Progress cannot be saved until merge is initiated"
  - "Selected apps will be locked after proceeding"
- **Organization Selection:** Dropdown with search (hidden if only one org)
  - Organization name, ID, region
- **App List Table:**
  - Columns: App name, App ID, Last modified, Live badge
  - Features: Search (name/ID), Sort (name/modified), Radio selection
  - Visual indicators: Locked apps (disabled), Source app (disabled with label)

**Allowed Actions:**
- Select organization from dropdown → Reload app list for that org
- Search/sort apps → Filter/reorder table
- Select destination app (radio) → Enable "Next" button
- Click "Next" → Validate and navigate to State 3 (locks both apps)
- Click "Back" → Return to State 1
- Click "Cancel" or X → Close overlay (no locking)

**Forbidden Actions (and Why):**
- Cannot select source app → Visually disabled with "Source app" label
- Cannot select locked apps → Disabled with lock icon and tooltip
- Cannot select apps with duplicate names → Error indicator and message
- Cannot select apps without publisher rights → Disabled with permissions message
- Cannot proceed without selection → "Next" button disabled

**System Feedback:**
- Loading: Skeleton table while fetching apps
- Validation: Inline errors for invalid selections
- Success: "Next" button enabled when valid app selected

**Empty/Error/Offline Variants:**
- **No apps available:** "No apps found in this organization"
- **No organizations:** "You don't belong to any organizations"
- **Duplicate names error:** "This app cannot be selected because it contains duplicate screen or data source names: [list]"
- **Permission error:** "You don't have App Publisher rights on this app"
- **Locked app:** Lock icon with "This app is currently locked due to an ongoing merge"
- **Network error:** "Unable to load apps. Please retry"

**Permissions/Entitlements:**
- Must have access to at least one organization
- Must have App Publisher rights on destination app
- Destination app must not be locked

**Analytics:**
```javascript
// Step 1 viewed
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'step1_viewed',
  label: sourceAppId
});

// Organization changed
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'organization_selected',
  label: selectedOrgId
});

// Destination app selected
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'destination_app_selected',
  label: destinationAppId
});

// Validation error
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'validation_error_destination',
  label: errorType // 'duplicates', 'permissions', 'locked'
});
```

**Transitions:**
- → State 3 (Configuration) when "Next" clicked and validation passes
- → State 1 (Dashboard) when "Back" clicked
- → Closed when "Cancel" or X clicked

---

#### State 3: Step 2 - Configure Merge Settings

**Entry Triggers:**
- User clicks "Next" from State 2 (apps are now locked)
- User clicks "Edit merge settings" from State 4

**Design References:**
- Design Spec State 3 (lines 175-401)
- Shows step indicator, app direction arrow, lock warning, 4 tabs with tables/checkboxes

**Visibility/Data:**
- **Progress Indicator:** Step 2 highlighted, Step 1 complete, Step 3 upcoming
- **App Direction:** "[Source App] → [Destination App]"
- **Lock Warning Banner:** "Both apps are now locked..." with countdown (if < 5 min)
- **Tab Navigation:** Screens | Data Sources | Files | Settings & Global Code
- **Selected Items Counter:** "X items selected" (dynamic)
- **Tab Content:** Different UI per tab (see sub-states below)

**Allowed Actions:**
- Switch tabs → Show different content
- Search/filter/sort items → Update table display
- Select/deselect items → Update counter and "Review" button
- Expand rows → Show associated items
- Change copy mode/options → Update configuration
- Click "Review merge settings" → Navigate to State 4
- Click "Back" → Return to State 2 (unlocks apps)
- Click "Cancel" or X → Close overlay (unlocks apps)
- Click "Extend lock" (if timer < 5 min) → Add 5 minutes to lock

**Forbidden Actions (and Why):**
- Cannot rename items → Read-only view
- Cannot edit app content → Configuration only
- Cannot select non-standard data sources → Filtered out
- Cannot proceed without selections → "Review" button shows "0 items"

**System Feedback:**
- Loading: Skeleton tables while fetching data
- Selection changes: Counter updates immediately
- Lock timer: Countdown warnings at < 5 min and < 2 min
- Validation: Warnings for non-copyable components

**Empty/Error/Offline Variants:**
- **No screens:** "This app has no screens to merge"
- **No data sources:** "This app has no data sources to merge"
- **No files:** "This app has no files to merge"
- **Lock expired:** "Lock has expired. Please start over" modal
- **Network error:** "Connection lost. Your selections may not be saved"

**Permissions/Entitlements:**
- Apps must be locked by current user
- Lock must not be expired

**Analytics:**
```javascript
// Step 2 viewed
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'step2_viewed',
  label: sourceAppId
});

// Tab switched
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'tab_switched',
  label: tabName // 'screens', 'dataSources', 'files', 'settings'
});

// Items selected
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'items_selected',
  label: `${tabName}:${selectedCount}`
});

// Lock extended
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'lock_extended',
  label: sourceAppId
});
```

**Transitions:**
- → State 4 (Review) when "Review merge settings" clicked
- → State 2 (Destination) when "Back" clicked (unlocks apps)
- → Closed when "Cancel" or X clicked (unlocks apps)
- → Lock Expired Modal when timer reaches 0

##### Sub-state: Screens Tab

**Visibility/Data:**
- **Instructions:** "Screen components, code, and settings will be migrated..."
- **Table:** Screens with columns:
  - Select checkbox
  - Screen name (sortable)
  - Screen ID
  - Preview icon (👁️)
  - Last modified (sortable)
  - Associated DS count (expandable)
  - Associated Files count (expandable)
- **Features:** Select all, search, sort, pagination (25/50/100/Show all)
- **Selection Counter:** "X of Y screens selected"

**Interactions:**
- Click checkbox → Select/deselect screen
- Click "Select all" → Toggle all visible screens
- Click preview icon → Open screen preview modal
- Click expand → Show associated DS/files in nested table
- Search → Filter by name/ID
- Sort columns → Reorder rows

##### Sub-state: Data Sources Tab

**Visibility/Data:**
- **Instructions:** "Data sources with matching names will be overwritten..."
- **Table:** Data sources with columns:
  - Select checkbox
  - DS name (sortable)
  - DS ID
  - Last modified (sortable)
  - Entries count (sortable)
  - Copy mode dropdown (Structure only | Structure & Data)
  - Associated screens count (expandable)
  - Associated files count (expandable)
  - Global dependency indicator (⭐)
- **Features:** Select all, "Set all to structure only" bulk action, search, sort, filter, pagination
- **Selection Counter:** "X of Y data sources selected" + "X with structure only"

**Interactions:**
- Click checkbox → Select/deselect DS
- Change dropdown → Update copy mode
- Click "Set all to structure only" → Bulk update all selected DS
- Filter by global dependency → Show only DS with global deps

##### Sub-state: Files Tab

**Visibility/Data:**
- **Instructions:** "Files with matching names will rename the destination file..."
- **Table:** Files/folders with columns:
  - Select checkbox
  - File/folder name (sortable)
  - Path (sortable)
  - Type icon (sortable)
  - Added date (sortable)
  - File ID
  - Preview icon (👁️ for images)
  - Associated screens count (expandable)
  - Associated DS count (expandable)
  - Global library indicator (⭐)
- **Features:** Select all, search, sort, filter (by type, associations, unused, global lib), pagination
- **Folder Options:** Dropdown (Copy folder only | Copy folder and files)
- **Selection Counter:** "X of Y files selected"

**Interactions:**
- Click checkbox → Select/deselect file/folder
- Change folder dropdown → Update copy scope
- Click preview → Show image preview modal
- Filter unused files → Show only files with no associations

##### Sub-state: Settings & Global Code Tab

**Visibility/Data:**
- **Instructions:** "App-level configurations will replace destination settings..."
- **Checkboxes:**
  1. ☐ App settings - "Merge app settings (excluding unique identifiers...)"
  2. ☐ Menu settings - "Copy menu type and menu list configuration"
  3. ☐ Global appearance settings - "Copy all global appearance settings..."
  4. ☐ Global code customizations - "Copy global CSS and JavaScript..." (⚠️ warning)
- **Details:** Link to "See which settings are copied", tooltips, warnings
- **Selection Counter:** "X of 4 app-level options selected"

**Interactions:**
- Toggle checkboxes → Select/deselect settings
- Click "See which settings" link → Open modal with details
- Hover tooltips → Show additional information

---

#### State 4: Step 3 - Review Merge Summary

**Entry Triggers:**
- User clicks "Review merge settings" from State 3

**Design References:**
- Design Spec State 4 (lines 404-509)
- Shows step indicator, app direction, warnings, color-coded summary tables

**Visibility/Data:**
- **Progress Indicator:** Step 3 highlighted, Steps 1-2 complete
- **App Direction:** "[Source App] → [Destination App]"
- **Instructions:** "Review your merge configuration. The merge will complete in under 5 minutes."
- **Warning Banners (all displayed):**
  - "Automated rollback is unavailable..."
  - "Data source changes go live immediately..."
  - "App settings and global code will overwrite..."
  - "Screens and global code can be restored using version control"
- **Summary Sections:**
  - **Screens:** Table with Status | Name | ID (🟢 Copy, 🟠 Overwrite, 🔴 Conflict)
  - **Data Sources:** Table with Status | Name | ID | Mode | Entries
  - **Files:** Table with Status | Name | ID | Folder Option
  - **App-Level Configurations:** List with checkmarks (✓ selected, ✗ not selected)
- **Plan/Pricing Warnings:** If limits exceeded (🚨)

**Allowed Actions:**
- Review all sections → Scroll through summary
- Click "Start merge" → Validate and navigate to State 5 (if no conflicts/limits)
- Click "Edit merge settings" → Return to State 3
- Click "Cancel" or X → Close overlay (unlocks apps)

**Forbidden Actions (and Why):**
- Cannot start merge with conflicts → Button disabled, error message shown
- Cannot start merge if limits exceeded → Button disabled, upgrade message shown
- Cannot start merge with no items → Button disabled, warning shown
- Cannot edit items directly → Must return to State 3

**System Feedback:**
- Loading: Skeleton while calculating summary
- Conflicts detected: Red indicators with error message at top
- Limits exceeded: Warning banner with specific limits
- Validation: Disable/enable "Start merge" button based on validation

**Empty/Error/Offline Variants:**
- **No items selected:** "No items selected. Please return to configuration"
- **Conflicts exist:** "Cannot start merge: The following items have duplicate names: [list]"
- **Limits exceeded:** "Cannot start merge: This merge will exceed your plan limits" with details
- **Network error:** "Unable to validate merge. Please retry"

**Permissions/Entitlements:**
- Apps must still be locked by current user
- Lock must not be expired

**Analytics:**
```javascript
// Step 3 viewed
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'step3_viewed',
  label: sourceAppId
});

// Conflicts detected
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'conflicts_detected',
  label: conflictCount
});

// Limits exceeded
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'limits_exceeded',
  label: limitType // 'files', 'storage', 'data_rows'
});

// Merge initiated
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'merge_initiated',
  label: sourceAppId,
  value: totalItemsCount
});

// Audit log
Fliplet.App.Logs.create({
  action: 'App merge initiated',
  source_app_id: sourceAppId,
  destination_app_id: destinationAppId,
  items_count: totalItemsCount,
  timestamp: new Date().toISOString()
}, 'app.merge.initiated');
```

**Transitions:**
- → State 5 (Merge in Progress) when "Start merge" clicked and validation passes
- → State 3 (Configuration) when "Edit merge settings" clicked
- → Closed when "Cancel" or X clicked (unlocks apps)

---

#### State 5: Merge in Progress

**Entry Triggers:**
- User clicks "Start merge" from State 4
- User reopens overlay while merge is running (if closed during merge)

**Design References:**
- Design Spec State 5 (lines 511-555)
- Shows progress bar, real-time scrolling status messages

**Visibility/Data:**
- **Header:** "Merge in progress"
- **Message:** "Please do not close this window. The merge will complete in under 5 minutes."
- **Progress Bar:** Animated bar showing % complete
- **Status Messages (real-time, scrolling):**
  - ✓ "Locking apps..."
  - ✓ "Copying files... (1 of 25)"
  - ✓ "Creating data sources... (1 of 5)"
  - ⏳ "Updating data source entries... (1 of 5)"
  - ✓ "Copying screens... (1 of 40)"
  - ❌ "Error copying file 'logo.png': [message]" (if errors)

**Allowed Actions:**
- View progress → Watch real-time updates
- Click "Close" → Close overlay (merge continues in background)
- Click "Retry" (on errors) → Retry failed operation
- Click "Skip" (on errors) → Skip failed item and continue

**Forbidden Actions (and Why):**
- Cannot cancel merge → No cancel button (merge is irreversible)
- Cannot edit apps → Apps locked during merge
- Cannot start another merge → Apps locked

**System Feedback:**
- Real-time updates: Status messages append to list every 1-2 seconds
- Progress bar: Smooth animation from 0% to 100%
- Success indicators: Green checkmarks (✓)
- Error indicators: Red X (❌) with error message and actions

**Empty/Error/Offline Variants:**
- **Connection lost:** "Connection lost. Merge is still running. Reconnecting..."
- **Merge errors:** Individual error messages with retry/skip options
- **Critical error:** "Merge failed: [reason]" with option to view logs

**Permissions/Entitlements:**
- Apps remain locked during merge
- Only user who initiated merge can view progress

**Analytics:**
```javascript
// Merge progress update (throttled to every 10% or major milestone)
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'merge_progress',
  label: sourceAppId,
  value: percentComplete
});

// Merge stage completed
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'merge_stage_completed',
  label: stageName // 'files', 'dataSources', 'screens', etc.
});

// Merge error occurred
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'merge_error',
  label: errorType
});

// Audit logs for each stage
Fliplet.App.Logs.create({
  action: 'Merge stage completed',
  stage: stageName,
  items_processed: count,
  timestamp: new Date().toISOString()
}, `app.merge.${stageName}`);
```

**Transitions:**
- → State 6 (Merge Complete) when merge finishes successfully
- → State 6 (with errors) when merge completes with errors
- → Error Modal if merge fails critically

---

#### State 6: Merge Complete

**Entry Triggers:**
- Merge completes successfully from State 5
- Merge completes with warnings/errors from State 5

**Design References:**
- Design Spec State 6 (lines 557-618)
- Shows completion summary, issues/warnings, next steps, previous merges

**Visibility/Data:**
- **Header:** "Merge complete"
- **Success Message:** "✓ Your apps have been successfully merged"
- **Summary Section:**
  - Screens: X merged (Y overwritten, Z created)
  - Data Sources: X merged (Y overwritten, Z created)
  - Files: X merged (Y replaced, Z created)
  - App-Level Configurations: List with checkmarks
- **Issues Section (if any):**
  - ⚠️ Warnings (file renamed, settings not copied, etc.)
  - ❌ Errors (file not found, etc.)
- **Plan/Pricing Warnings (if applicable):**
  - Exceeded limits with counts
- **Next Steps:**
  - Review changes, test functionality, publish app, data sources already live
- **Previous Merges (if any):**
  - List of recent merges with timestamps and "View log" links

**Allowed Actions:**
- Click "Open app" → Open destination app in Studio
- Click "View audit log" → Open detailed logs in new window
- Click "Close" → Close overlay (apps now unlocked)
- Click "View log" (on previous merge) → Open that merge's audit log

**Forbidden Actions (and Why):**
- Cannot undo merge → Must use version control manually
- Cannot view detailed diff → Not implemented in this screen
- Cannot retry merge → Merge is complete

**System Feedback:**
- Success state: Green checkmarks and success message
- Warnings: Yellow warning icons with clear messages
- Errors: Red error icons with details
- Apps unlocked: Lock indicator removed

**Empty/Error/Offline Variants:**
- **No previous merges:** Hide "Previous Merges" section
- **Network error loading history:** "Unable to load merge history"

**Permissions/Entitlements:**
- Apps now unlocked
- User can open destination app (if they have access)

**Analytics:**
```javascript
// Merge completed
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'merge_completed',
  label: sourceAppId,
  value: totalItemsMerged
});

// Opened destination app
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'destination_app_opened',
  label: destinationAppId
});

// Viewed audit log
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'audit_log_viewed',
  label: mergeId
});

// Final audit log
Fliplet.App.Logs.create({
  action: 'App merge completed',
  source_app_id: sourceAppId,
  destination_app_id: destinationAppId,
  screens_merged: screensCount,
  datasources_merged: dsCount,
  files_merged: filesCount,
  errors_count: errorsCount,
  timestamp: new Date().toISOString()
}, 'app.merge.complete');
```

**Transitions:**
- → Destination App in Studio when "Open app" clicked
- → Closed when "Close" clicked
- → Audit Log (new window) when "View audit log" clicked

---

### State Transition Matrix

| State / Action | Configure | Next/Select | Review | Start Merge | Back | Cancel/Close | Open App | View Log |
|---|---|---|---|---|---|---|---|---|
| **Dashboard** | ✅ → State 2 | ❌ | ❌ | ❌ | ❌ | ✅ Close | ❌ | ✅ New Window |
| **Destination Selection** | ❌ | ✅ → State 3 (locks apps) | ❌ | ❌ | ✅ → State 1 | ✅ Close | ❌ | ❌ |
| **Configuration** | ❌ | ❌ | ✅ → State 4 | ❌ | ✅ → State 2 (unlocks) | ✅ Close (unlocks) | ❌ | ❌ |
| **Review Summary** | ❌ | ❌ | ❌ | ✅ → State 5 | ⚠️ Edit → State 3 | ✅ Close (unlocks) | ❌ | ❌ |
| **Merge Progress** | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ Background | ❌ | ❌ |
| **Merge Complete** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Close | ✅ Studio | ✅ New Window |

**Legend:**
- ✅ Allowed action
- ❌ Not applicable or restricted
- ⚠️ With confirmation or special behavior

## Product Analytics & Audit Logging

### Analytics Strategy

#### Product Success Metrics
- **Primary Success Metrics:**
  - Merge completion rate (successful merges / initiated merges)
  - Average time to complete merge
  - Error rate during merge process
- **User Engagement Metrics:**
  - Number of merges per user per week/month
  - Repeat usage (users who merge multiple times)
  - Feature discovery (how users find the merge feature)
- **Business Impact Metrics:**
  - Reduction in manual app recreation time
  - Cross-organization collaboration increase
- **User Experience Metrics:**
  - Task abandonment rate at each step
  - Lock timeout frequency
  - Conflict resolution rate

#### Analytics Event Categories

**User Journey Events:**
- Entry: Dashboard viewed
- Navigation: Step transitions, tab switches
- Completion: Merge initiated, merge completed
- Abandonment: Cancel clicked, lock expired

**Feature Usage Events:**
- Discovery: First time viewing merge dashboard
- Adoption: First successful merge completion
- Mastery: Bulk selection usage, advanced filtering
- Feedback: Error encounters, retry actions

**Business Process Events:**
- Workflow Initiation: "Configure merge" clicked
- Process Milestones: Destination selected, configuration complete, review complete
- Process Completion: Merge successful
- Process Optimization: Lock extensions, retry after errors

### Analytics Implementation Plan

#### Fliplet App Analytics Events

All user interactions tracked using `Fliplet.App.Analytics.event()`:

```javascript
// Example: User completes merge
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'merge_completed',
  label: sourceAppId,
  value: totalItemsMerged
});

// Example: User switches tab in configuration
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'tab_switched',
  label: 'dataSources'
});

// Example: Validation error
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'validation_error',
  label: 'duplicate_names_detected'
});
```

#### Fliplet App Logs for Audit Trail

Critical business events logged using `Fliplet.App.Logs.create()`:

```javascript
// Example: Merge initiated (scope only, not detailed configuration)
Fliplet.App.Logs.create({
  action: 'App merge initiated',
  source_app_id: sourceAppId,
  destination_app_id: destinationAppId,
  items_count: totalItemsCount,
  timestamp: new Date().toISOString()
}, 'app.merge.initiated');

// Example: Merge completed
Fliplet.App.Logs.create({
  action: 'App merge completed',
  source_app_id: sourceAppId,
  destination_app_id: destinationAppId,
  screens_merged: screensCount,
  datasources_merged: dsCount,
  files_merged: filesCount,
  errors_count: errorsCount,
  timestamp: new Date().toISOString()
}, 'app.merge.complete');

// Example: Merge failed
Fliplet.App.Logs.create({
  action: 'App merge failed',
  source_app_id: sourceAppId,
  destination_app_id: destinationAppId,
  error_type: 'duplicate_names',
  timestamp: new Date().toISOString()
}, 'app.merge.error');
```

### Audit Logging Requirements

#### Compliance and Security Logging
- **Data Access:** When user views merge dashboard, configuration details
- **Data Modification:** When merge changes destination app content
- **Permission Changes:** Not applicable to this widget
- **Configuration Changes:** App settings, global code changes via merge

#### Business Process Audit Trail
- **Merge Workflow:** Complete audit trail from initiation to completion
- **Approval Workflows:** Not applicable
- **Regulatory Compliance:** Track which user merged what content and when
- **Data Retention:** Merge logs retained for audit purposes

## Component Architecture

### Layout Components

#### AppOverlay
**Purpose:** Main overlay wrapper providing full-screen modal experience

**Props:**
```javascript
{
  isOpen: Boolean,        // Controls overlay visibility
  canClose: Boolean,      // Whether close button is enabled
  size: String           // 'default' | 'large' | 'full' (default: 'large')
}
```

**Events:**
- `@close` - Emitted when user clicks close button or ESC key

**Features:**
- Semi-transparent backdrop
- Centered modal content
- ESC key to close (if enabled)
- Click outside to close (with confirmation if dirty state)
- Responsive sizing (full screen on mobile)

---

#### StepIndicator
**Purpose:** Visual breadcrumb showing 3-step progress

**Props:**
```javascript
{
  currentStep: Number,    // 1, 2, or 3
  completedSteps: Array   // [1, 2] means steps 1 and 2 are complete
}
```

**Features:**
- Three steps: "Select destination" | "Select items to merge" | "Review merge summary"
- Visual states: Completed (✓), Current (highlighted), Upcoming (greyed)
- Responsive: Condense labels on mobile

---

#### WarningBanner
**Purpose:** Reusable warning/info banner component

**Props:**
```javascript
{
  type: String,           // 'warning' | 'error' | 'info' | 'success'
  icon: String,           // Icon to display (⚠️, 🔒, ℹ️, ✓)
  message: String,        // Main message text
  dismissible: Boolean,   // Whether banner can be closed
  countdown: Number       // Optional countdown timer (seconds)
}
```

**Events:**
- `@dismiss` - Emitted when user clicks dismiss button
- `@countdown-end` - Emitted when countdown reaches 0

**Features:**
- Color-coded by type (yellow, red, blue, green)
- Optional countdown timer (for lock warnings)
- Dismissible option
- Icon + message layout

---

### Dashboard Components

#### MergeDashboard
**Purpose:** State 1 - Main dashboard view

**Data Requirements:**
- Source app details (from middleware)
- User permissions (publisher rights)
- Lock status (if app is locked)

**User Actions:**
- Click "Configure merge" → Navigate to destination selection
- Click "View audit log" → Open audit log
- Click "Cancel" → Close overlay

**States:**
- Loading: Skeleton while fetching app details
- Success: Display app info and actions
- Error: Error message with retry option
- Locked: Show lock status, disable "Configure merge"

**Integration with Middleware:**
```javascript
async mounted() {
  const appDetails = await window.AppMerge.middleware.api.getAppDetails(this.sourceAppId);
  const lockStatus = await window.AppMerge.middleware.api.getAppLockStatus(this.sourceAppId);
  this.appInfo = appDetails;
  this.isLocked = lockStatus.lockedUntil > Date.now();
}
```

---

#### AppInfoCard
**Purpose:** Display source app information

**Props:**
```javascript
{
  appName: String,
  appId: Number,
  organization: String,
  region: String,
  isPublished: Boolean,
  lastModified: String,   // ISO timestamp
  lastModifiedBy: String  // User name
}
```

**Features:**
- Formatted display of app metadata
- Published/Not Published status badge
- Relative time display ("2 hours ago")
- Responsive layout

---

### Destination Selection Components

#### DestinationSelection
**Purpose:** State 2 - Main destination selection view

**Data Requirements:**
- User organizations list
- Apps list for selected organization
- User permissions per app
- Lock status per app
- Duplicate detection results

**User Actions:**
- Select organization → Reload apps list
- Search/filter apps → Update table
- Select destination app → Enable "Next" button
- Click "Next" → Validate and lock apps
- Click "Back" → Return to dashboard

**States:**
- Loading: Skeleton while fetching orgs/apps
- Success: Display organizations and apps
- Validation Error: Show inline errors for invalid selection
- No Apps: Empty state

**Integration with Middleware:**
```javascript
async mounted() {
  const orgs = await window.AppMerge.middleware.api.getUserOrganizations();
  this.organizations = orgs;
  await this.loadApps(this.selectedOrgId);
},

async selectDestination() {
  const validation = await window.AppMerge.middleware.controllers.validateDestination(
    this.sourceAppId,
    this.selectedAppId
  );

  if (validation.isValid) {
    await window.AppMerge.middleware.api.lockApps(this.sourceAppId, this.selectedAppId);
    this.$emit('navigate', 'configuration');
  } else {
    this.validationErrors = validation.errors;
  }
}
```

---

#### OrganizationDropdown
**Purpose:** Organization selector with search

**Props:**
```javascript
{
  organizations: Array,   // [{id, name, region}, ...]
  selectedOrgId: Number,
  disabled: Boolean
}
```

**Events:**
- `@change` - Emitted when user selects new organization

**Features:**
- Searchable dropdown
- Display: Name, ID, Region
- Default to source app's organization
- Hidden if only one organization

---

#### AppSelectionTable
**Purpose:** App list with search, sort, and radio selection

**Props:**
```javascript
{
  apps: Array,              // App list
  sourceAppId: Number,      // To exclude from selection
  selectedAppId: Number,
  loading: Boolean
}
```

**Events:**
- `@select` - Emitted when user selects an app

**Features:**
- Columns: Name, ID, Last Modified, Status (Live badge)
- Search by name/ID
- Sort by name or last modified
- Radio button selection
- Visual indicators: Locked (🔒), Source (disabled), Duplicates (❌)
- Pagination

**Integration with Fliplet Table:**
```javascript
// Using Fliplet.UI.Table() for advanced table features
mounted() {
  this.table = Fliplet.UI.Table({
    el: this.$refs.tableContainer,
    columns: [
      { key: 'name', label: 'App Name', sortable: true },
      { key: 'id', label: 'App ID' },
      { key: 'updatedAt', label: 'Last Modified', sortable: true, type: 'date' },
      { key: 'status', label: 'Status' }
    ],
    data: this.apps,
    searchEnabled: true,
    sortable: true,
    pagination: { pageSize: 25 }
  });
}
```

---

### Configuration Components

#### MergeConfiguration
**Purpose:** State 3 - Main configuration view with tabs

**Data Requirements:**
- Source app screens, data sources, files, settings
- Selected items configuration
- Lock status and countdown

**User Actions:**
- Switch tabs → Show different content
- Configure items → Update selections
- Click "Review" → Navigate to review
- Click "Back" → Return to destination selection (unlocks)
- Click "Extend lock" → Add time to lock

**States:**
- Loading: Skeleton while fetching data
- Success: Display tabs and content
- Lock Warning: Show countdown when < 5 min
- Lock Expired: Modal with error

**Integration with Middleware:**
```javascript
async mounted() {
  const [screens, dataSources, files, settings] = await Promise.all([
    window.AppMerge.middleware.api.getAppScreens(this.sourceAppId),
    window.AppMerge.middleware.api.getDataSources(this.sourceAppId),
    window.AppMerge.middleware.api.getAppFiles(this.sourceAppId),
    window.AppMerge.middleware.api.getAppSettings(this.sourceAppId)
  ]);

  this.tabsData = { screens, dataSources, files, settings };
  this.startLockMonitoring();
},

startLockMonitoring() {
  this.lockInterval = setInterval(async () => {
    const lockStatus = await window.AppMerge.middleware.api.getAppLockStatus(this.sourceAppId);
    this.lockRemaining = lockStatus.lockedUntil - Date.now();

    if (this.lockRemaining < 5 * 60 * 1000) {
      this.showLockWarning = true;
    }
    if (this.lockRemaining <= 0) {
      this.handleLockExpired();
    }
  }, 30000); // Check every 30 seconds
}
```

---

#### TabNavigation
**Purpose:** Tab switcher for 4 configuration tabs

**Props:**
```javascript
{
  tabs: Array,            // [{id, label, count}, ...]
  activeTab: String,      // Current tab ID
  counts: Object          // {screens: 10, dataSources: 5, files: 20, settings: 2}
}
```

**Events:**
- `@change` - Emitted when user clicks tab

**Features:**
- 4 tabs: Screens | Data Sources | Files | Settings & Global Code
- Display selected count badge on each tab
- Highlight active tab
- Responsive: Stack vertically on mobile

---

#### ScreensTab
**Purpose:** Screens selection with expandable associations

**Props:**
```javascript
{
  screens: Array,         // List of screens with metadata
  selectedScreenIds: Array,
  associationsData: Object // DS and files associated with each screen
}
```

**Events:**
- `@update:selection` - Emitted when user changes selection

**Features:**
- Table with columns: Select | Name | ID | Preview | Last Modified | Associated DS | Associated Files
- Select all / individual checkboxes
- Expandable rows showing associated items
- Preview icon opens modal
- Search, sort, pagination
- Counter: "X of Y screens selected"

**Table Integration:**
```javascript
mounted() {
  this.table = Fliplet.UI.Table({
    el: this.$refs.screensTable,
    columns: [
      { key: 'checkbox', label: '', template: 'checkbox' },
      { key: 'title', label: 'Screen Name', sortable: true },
      { key: 'id', label: 'Screen ID' },
      { key: 'preview', label: '', template: 'icon' },
      { key: 'updatedAt', label: 'Last Modified', sortable: true, type: 'date' },
      { key: 'associatedDS', label: 'Associated DS', expandable: true },
      { key: 'associatedFiles', label: 'Associated Files', expandable: true }
    ],
    data: this.screens,
    selectable: true,
    expandable: true,
    searchEnabled: true
  });
}
```

---

#### DataSourcesTab
**Purpose:** Data sources selection with copy mode options

**Props:**
```javascript
{
  dataSources: Array,
  selectedDataSources: Array, // [{id, structureOnly}, ...]
  associationsData: Object
}
```

**Events:**
- `@update:selection` - Emitted when selection or mode changes

**Features:**
- Table with columns: Select | Name | ID | Last Modified | Entries | Copy Mode | Associated Screens | Associated Files | Global Dep
- Copy mode dropdown per row: "Structure only" | "Structure & Data"
- Bulk action: "Set all to structure only"
- Global dependency indicator (⭐)
- Filter by: global dependency, has associations
- Warning for immediate live impact

---

#### FilesTab
**Purpose:** Files/folders selection with folder options

**Props:**
```javascript
{
  files: Array,
  folders: Array,
  selectedFileIds: Array,
  selectedFolders: Array, // [{id, scope: 'folder' | 'all'}, ...]
  associationsData: Object
}
```

**Events:**
- `@update:selection` - Emitted when selection or options change

**Features:**
- Table with columns: Select | Name | Path | Type | Added | ID | Preview | Associated Screens | Associated DS | Global Lib
- Folder scope dropdown: "Copy folder only" | "Copy folder and files"
- Filter by: type, has associations, unused files, global libraries
- Preview for images
- Unused files indicator (💡)

---

#### SettingsTab
**Purpose:** App-level settings selection

**Props:**
```javascript
{
  selectedSettings: Array // ['appSettings', 'menuSettings', 'globalAppearance', 'globalCode']
}
```

**Events:**
- `@update:selection` - Emitted when checkboxes change

**Features:**
- 4 checkboxes with descriptions and tooltips:
  1. App settings (with "See which settings" link)
  2. Menu settings
  3. Global appearance settings
  4. Global code customizations (with warning)
- Counter: "X of 4 options selected"

---

### Review Components

#### ReviewSummary
**Purpose:** State 4 - Final review before merge

**Data Requirements:**
- Complete merge configuration
- Preview of what will be copied/overwritten/conflict
- Plan/pricing limit validation

**User Actions:**
- Review all sections → Scroll through summary
- Click "Start merge" → Initiate merge
- Click "Edit settings" → Return to configuration

**States:**
- Loading: Skeleton while calculating preview
- Success: Display summary with color-coded indicators
- Conflicts: Error state with disabled "Start merge"
- Limits Exceeded: Warning state with disabled "Start merge"

**Integration with Middleware:**
```javascript
async mounted() {
  const preview = await window.AppMerge.middleware.api.getMergePreview({
    sourceAppId: this.sourceAppId,
    destinationAppId: this.destinationAppId,
    configuration: this.configuration
  });

  this.summary = preview;
  this.hasConflicts = preview.conflicts.length > 0;
  this.limitsExceeded = preview.limitWarnings.some(w => w.exceeded);
},

async startMerge() {
  const result = await window.AppMerge.middleware.controllers.initiateMerge({
    sourceAppId: this.sourceAppId,
    destinationAppId: this.destinationAppId,
    configuration: this.configuration
  });

  if (result.success) {
    this.mergeId = result.mergeId;
    this.$emit('navigate', 'progress', { mergeId: result.mergeId });
  }
}
```

---

#### SummarySection
**Purpose:** Reusable summary section component

**Props:**
```javascript
{
  title: String,          // 'Screens', 'Data Sources', 'Files', 'App-Level Configurations'
  items: Array,           // [{status, name, id, ...}, ...]
  type: String            // 'screens' | 'dataSources' | 'files' | 'settings'
}
```

**Features:**
- Color-coded status indicators:
  - 🟢 Copy (new items)
  - 🟠 Overwrite (existing items)
  - 🔴 Conflict (duplicate names)
- Table layout for screens/DS/files
- List layout for settings
- Count display: "X items"

---

### Progress Components

#### MergeProgress
**Purpose:** State 5 - Real-time merge monitoring

**Data Requirements:**
- Merge ID
- Real-time status updates from backend

**User Actions:**
- View progress → Watch updates
- Click "Close" → Close overlay (merge continues)
- Click "Retry" (on errors) → Retry operation

**States:**
- In Progress: Animated progress bar with status messages
- Errors: Show error messages with retry/skip options
- Complete: Transition to State 6

**Integration with Middleware:**
```javascript
async mounted() {
  // Poll for status updates
  this.statusInterval = setInterval(async () => {
    const status = await window.AppMerge.middleware.api.getMergeStatus(this.mergeId);

    this.progress = status.progress; // 0-100
    this.currentStage = status.stage;
    this.statusMessages.push(...status.newMessages);

    if (status.status === 'completed') {
      clearInterval(this.statusInterval);
      this.$emit('navigate', 'complete', { mergeId: this.mergeId });
    }
  }, 2000); // Poll every 2 seconds
}
```

---

#### ProgressBar
**Purpose:** Animated progress indicator

**Props:**
```javascript
{
  progress: Number,       // 0-100
  label: String,          // Progress text
  variant: String         // 'default' | 'success' | 'error'
}
```

**Features:**
- Smooth animation from 0% to 100%
- Color states: Blue (in-progress), Green (success), Red (error)
- Percentage display
- Optional label text

---

#### StatusLog
**Purpose:** Scrolling list of status messages

**Props:**
```javascript
{
  messages: Array         // [{type, text, timestamp}, ...]
}
```

**Features:**
- Icons: ✓ (success), ⏳ (in-progress), ❌ (error), ⚠️ (warning)
- Timestamps
- Auto-scroll to latest message
- Color coding
- Scrollable container

---

### Completion Components

#### MergeComplete
**Purpose:** State 6 - Completion screen with results

**Data Requirements:**
- Merge results
- Items merged counts
- Warnings/errors
- Previous merge history

**User Actions:**
- Click "Open app" → Open destination app in Studio
- Click "View audit log" → Open logs
- Click "Close" → Close overlay

**States:**
- Success: Display success message and summary
- With Warnings: Display warnings section
- With Errors: Display errors section
- Loading History: Skeleton while fetching previous merges

**Integration with Middleware:**
```javascript
async mounted() {
  const [results, history] = await Promise.all([
    window.AppMerge.middleware.api.getMergeStatus(this.mergeId),
    window.AppMerge.middleware.api.getMergeHistory(this.sourceAppId)
  ]);

  this.results = results.result;
  this.previousMerges = history;
},

openDestinationApp() {
  // Use Fliplet Studio API to navigate
  Fliplet.Studio.emit('navigate', {
    name: 'appEdit',
    appId: this.destinationAppId
  });
}
```

---

#### CompletionSummary
**Purpose:** Results summary display

**Props:**
```javascript
{
  summary: Object,        // {screens: {}, dataSources: {}, files: {}, settings: []}
  warnings: Array,        // [{type, message}, ...]
  errors: Array           // [{type, message}, ...]
}
```

**Features:**
- Counts by category
- Breakdown: created vs overwritten
- Warnings list with icons
- Errors list with details
- Plan/pricing warnings (if applicable)

---

### UI Components (Shared)

#### DataTable
**Purpose:** Reusable table wrapper using Fliplet.UI.Table()

**Props:**
```javascript
{
  columns: Array,         // Column definitions
  data: Array,            // Row data
  selectable: Boolean,    // Show checkboxes
  expandable: Boolean,    // Allow row expansion
  searchable: Boolean,    // Show search input
  sortable: Boolean,      // Enable sorting
  pagination: Object      // {pageSize: 25, options: [25, 50, 100, 'all']}
}
```

**Events:**
- `@selection-change` - Emitted when selection changes
- `@row-click` - Emitted when row is clicked
- `@expand` - Emitted when row is expanded

**Integration:**
```javascript
// Wrapper around Fliplet.UI.Table() with Vue integration
mounted() {
  this.flipletTable = Fliplet.UI.Table({
    el: this.$refs.tableContainer,
    columns: this.columns,
    data: this.data,
    selectable: this.selectable,
    expandable: this.expandable,
    searchEnabled: this.searchable,
    sortable: this.sortable,
    pagination: this.pagination
  });

  // Bind Fliplet events to Vue events
  this.flipletTable.on('selection-change', (selection) => {
    this.$emit('selection-change', selection);
  });
}
```

---

#### SearchInput
**Purpose:** Search field with debounce

**Props:**
```javascript
{
  placeholder: String,
  debounce: Number        // ms delay (default: 300)
}
```

**Events:**
- `@search` - Emitted with search term (debounced)

**Features:**
- Search icon
- Clear button
- Debounced input (300ms default)

---

#### StatusBadge
**Purpose:** Visual status indicator

**Props:**
```javascript
{
  status: String,         // 'copy' | 'overwrite' | 'conflict' | 'success' | 'error' | 'warning'
  label: String,          // Optional custom label
  size: String            // 'small' | 'medium' | 'large'
}
```

**Features:**
- Color-coded:
  - 🟢 Green: Copy, Success
  - 🟠 Orange: Overwrite, Warning
  - 🔴 Red: Conflict, Error
  - 🔵 Blue: Info, In Progress
- Icon + text layout
- Responsive sizing

---

#### ActionButton
**Purpose:** Button with loading and disabled states

**Props:**
```javascript
{
  variant: String,        // 'primary' | 'secondary' | 'tertiary' | 'danger'
  loading: Boolean,       // Show spinner
  disabled: Boolean,
  icon: String            // Optional icon
}
```

**Events:**
- `@click` - Emitted when button is clicked (if not disabled/loading)

**Features:**
- Visual variants (filled, outlined, text)
- Loading spinner
- Disabled state
- Optional icon
- Keyboard accessible

---

#### LockCountdown
**Purpose:** Lock timer warning component

**Props:**
```javascript
{
  remaining: Number       // Milliseconds remaining
}
```

**Events:**
- `@extend` - Emitted when user clicks extend button
- `@expired` - Emitted when timer reaches 0

**Features:**
- Countdown display: "5:23" (MM:SS)
- Warning levels:
  - < 5 min: Yellow banner
  - < 2 min: Red modal with prominent warning
- "Extend lock by 5 minutes" button
- Auto-updates every second

---

#### EmptyState
**Purpose:** Empty data placeholder

**Props:**
```javascript
{
  icon: String,           // Icon to display
  title: String,          // Main message
  description: String,    // Additional context
  actionLabel: String,    // Optional CTA button label
  actionIcon: String      // Optional CTA button icon
}
```

**Events:**
- `@action` - Emitted when CTA button is clicked

**Features:**
- Centered layout
- Icon, title, description
- Optional action button
- Responsive

---

### Shared Components

#### LoadingSpinner
**Purpose:** Loading indicator

**Props:**
```javascript
{
  size: String,           // 'small' | 'medium' | 'large'
  overlay: Boolean        // Show semi-transparent overlay
}
```

**Features:**
- Animated spinner
- Multiple sizes
- Optional full-screen overlay
- Accessible (aria-busy, aria-label)

---

#### ErrorMessage
**Purpose:** Error display component

**Props:**
```javascript
{
  error: Object,          // {message, details, code}
  dismissible: Boolean,
  retryable: Boolean
}
```

**Events:**
- `@dismiss` - Emitted when user dismisses error
- `@retry` - Emitted when user clicks retry

**Features:**
- Error message display
- Optional details (expandable)
- Dismiss button
- Retry button
- Red color scheme

---

## Responsive Design Strategy

### Breakpoints
```scss
$breakpoints: (
  'mobile': 320px,        // Base mobile
  'tablet': 768px,        // Tablet portrait
  'desktop': 1024px,      // Desktop
  'wide': 1440px          // Wide screens
);
```

### Layout Patterns

#### Mobile First (<768px)
- **Overlay:** Full screen width and height
- **Tables:** Convert to cards or horizontal scroll
- **Columns:** Stack vertically
- **Navigation:** Tabs become dropdown or vertical stack
- **Forms:** Full width inputs
- **Actions:** Full width buttons stacked

#### Tablet (768px-1024px)
- **Overlay:** 90% viewport width, centered
- **Tables:** Horizontal scroll for many columns
- **Columns:** 2-column layout where appropriate
- **Navigation:** Horizontal tabs (condensed labels)
- **Forms:** Two-column layouts where appropriate

#### Desktop (>1024px)
- **Overlay:** 80% viewport width (max 1200px), centered
- **Tables:** Full table layout with all columns
- **Columns:** Multi-column layouts
- **Navigation:** Full horizontal tabs with icons
- **Forms:** Optimized layouts with side-by-side fields
- **Panels:** Side-by-side content

### Responsive Considerations for Components

**Tables:**
- Desktop: Full table with all columns
- Tablet: Hide less important columns, horizontal scroll
- Mobile: Card-based layout or accordion

**Step Indicator:**
- Desktop: Full labels with icons
- Tablet: Condensed labels
- Mobile: Step numbers only (1/3, 2/3, 3/3)

**Tab Navigation:**
- Desktop: Horizontal tabs with full labels
- Tablet: Horizontal tabs with condensed labels
- Mobile: Dropdown selector or vertical stack

**Warning Banners:**
- Desktop: Full width with icon and text
- Mobile: Icon above text, full width

## Theming & Customization

### CSS Custom Properties

```css
:root {
  /* Brand Colors */
  --primary-color: #00abd1;
  --secondary-color: #eae9ec;
  --accent-color: #36344c;

  /* Semantic Colors */
  --success-color: #19cd9d;
  --warning-color: #ed9119;
  --error-color: #e03629;
  --info-color: #413e5b;

  /* Status Colors */
  --status-copy: #19cd9d;        /* Green */
  --status-overwrite: #ed9119;   /* Orange */
  --status-conflict: #e03629;    /* Red */
  --status-progress: #00abd1;    /* Blue */

  /* Typography */
  --font-family-base: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-size-base: 14px;
  --font-size-large: 16px;
  --font-size-small: 12px;
  --line-height-base: 1.428571429;

  /* Spacing */
  --spacing-unit: 8px;
  --spacing-xs: calc(var(--spacing-unit) * 0.5);   /* 4px */
  --spacing-sm: var(--spacing-unit);               /* 8px */
  --spacing-md: calc(var(--spacing-unit) * 2);     /* 16px */
  --spacing-lg: calc(var(--spacing-unit) * 3);     /* 24px */
  --spacing-xl: calc(var(--spacing-unit) * 4);     /* 32px */

  /* Container */
  --container-max-width: 1200px;
  --overlay-padding: var(--spacing-lg);

  /* Shadows & Borders */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
  --border-radius: 4px;
  --border-color: #d1d1d1;

  /* Z-index Layers */
  --z-base: 1;
  --z-dropdown: 100;
  --z-overlay: 1000;
  --z-modal: 1100;
  --z-tooltip: 1200;
}
```

### Theme Configuration

Not required for this widget as it runs in Fliplet Studio context and should align with Studio's existing theme. However, CSS custom properties allow for easy adjustments if needed.

## Interaction Patterns

### Form Interactions
- **Inline Validation:** Real-time feedback on destination selection, duplicate detection
- **Error Prevention:** Disable "Next"/"Start merge" buttons until valid
- **Clear Error Messages:** Specific, actionable error text (e.g., "This app contains duplicate screen names: screen1, screen2")
- **Progress Indication:** Step indicator (1→2→3) with completed checkmarks

### Data Loading
- **Skeleton Screens:** Show table structure while loading data
- **Progressive Loading:** Load critical data first (app info, organizations) then tables
- **Optimistic Updates:** Immediate checkbox/selection feedback
- **Error Recovery:** Retry button on failed loads, clear error messages

### Navigation
- **Breadcrumbs:** Step indicator shows where user is in workflow
- **Tab Navigation:** Switch between Screens, DS, Files, Settings without losing selections
- **Back/Cancel:** Always available to exit or go back (unlocks apps when appropriate)
- **Deep Linking:** Not required (overlay flow is sequential)

### Table Interactions
- **Search:** Debounced search (300ms) filtering visible rows
- **Sort:** Click column header to toggle ascending/descending
- **Select:** Checkboxes with "Select all" for bulk selection
- **Expand:** Click row or arrow icon to show associated items
- **Pagination:** Switch between page sizes, navigate pages

### Lock Management
- **Auto-extend:** Lock extends automatically while user is active on page
- **Countdown Warning:** Yellow banner when < 5 min remaining
- **Critical Warning:** Red modal when < 2 min remaining
- **Manual Extend:** "Extend lock by 5 minutes" button
- **Expiry Handling:** Show "Lock expired" modal, return to dashboard

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Normal Text:** Minimum 4.5:1 contrast ratio
- **Large Text:** Minimum 3:1 contrast ratio
- **UI Components:** Minimum 3:1 for interactive elements
- **Status Indicators:** Don't rely on color alone (use icons + text)

#### Keyboard Navigation
- **Tab Order:** Logical tab sequence through all interactive elements
- **Focus Indicators:** Visible focus ring on all focusable elements
- **Keyboard Shortcuts:**
  - ESC: Close overlay (when allowed)
  - Enter: Submit/confirm actions
  - Space: Toggle checkboxes, expand rows
  - Arrow keys: Navigate table rows, dropdown items
- **Skip Links:** "Skip to main content" for screen readers

#### Screen Reader Support
- **ARIA Labels:** All interactive elements have descriptive labels
- **ARIA Landmarks:** `role="navigation"`, `role="main"`, `role="dialog"`
- **ARIA Live Regions:** Status messages announced (`aria-live="polite"`)
- **Table Semantics:** Proper `<th>`, `<thead>`, `<tbody>` structure
- **Form Labels:** All inputs have associated `<label>` or `aria-label`

#### Focus Management
- **Modal Opens:** Focus moves to modal
- **Modal Closes:** Focus returns to trigger element
- **Tab Switches:** Focus moves to tab content
- **Errors:** Focus moves to first error message

### Implementation Guidelines

```html
<!-- Example: Accessible table -->
<table role="table" aria-label="Screens to merge">
  <thead>
    <tr role="row">
      <th role="columnheader" scope="col">
        <input type="checkbox" aria-label="Select all screens" />
      </th>
      <th role="columnheader" scope="col">Screen Name</th>
      <th role="columnheader" scope="col">Screen ID</th>
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <td role="cell">
        <input
          type="checkbox"
          aria-label="Select screen Home"
          :checked="isSelected"
        />
      </td>
      <td role="cell">Home</td>
      <td role="cell">123</td>
    </tr>
  </tbody>
</table>

<!-- Example: Accessible button -->
<button
  type="button"
  :disabled="loading"
  :aria-busy="loading"
  aria-label="Start app merge"
  @click="startMerge"
>
  <span v-if="loading" role="status" aria-live="polite">
    <span class="spinner" aria-hidden="true"></span>
    Starting merge...
  </span>
  <span v-else>Start Merge</span>
</button>

<!-- Example: Accessible live region -->
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="visually-hidden"
>
  {{ selectionCount }} items selected
</div>
```

## Performance Optimization

### Loading Strategy
- **Code Splitting:** Not required (single overlay, not route-based)
- **Lazy Loading:** Load table data on-demand when tabs are opened
- **Image Optimization:** Use thumbnails for file previews, lazy load
- **Font Loading:** Inherit from Fliplet Studio (no custom fonts)

### Runtime Performance
- **Virtual Scrolling:** Use Fliplet.UI.Table() built-in pagination instead
- **Debounced Inputs:** 300ms debounce on search fields
- **Memoization:** Cache computed properties (selected counts, filter results)
- **Animation Performance:** CSS transforms for smooth animations
- **Event Throttling:** Throttle lock countdown updates to 1/second

### Network Optimization
- **Batched Requests:** Load all tab data in parallel when entering State 3
- **Polling Optimization:** Poll merge status every 2 seconds (not every 100ms)
- **Request Cancellation:** Cancel in-flight requests when user navigates away
- **Error Retry:** Exponential backoff for failed requests

### Performance Targets
- **Initial Load:** Overlay open < 500ms
- **Tab Switch:** Content visible < 200ms
- **Search/Filter:** Results update < 300ms (debounced)
- **Selection Update:** Counter updates < 50ms
- **Progress Updates:** New status < 1 second of backend event

## Error Handling & Feedback

### Error States

#### Network Errors
- **Initial Load:** "Unable to load app details. Please check your connection and retry."
- **During Configuration:** "Connection lost. Your selections may not be saved. Please retry."
- **During Merge:** "Connection lost. Merge is still running. Reconnecting..."
- **Recovery:** Auto-retry with exponential backoff, manual retry button

#### Validation Errors
- **Duplicate Names:** "This app cannot be selected because it contains duplicate screen names: [list]"
- **Permission Errors:** "You don't have App Publisher rights on this app"
- **Lock Errors:** "This app is currently locked due to an ongoing merge"
- **Conflict Errors:** "Cannot start merge: The following items have duplicate names: [list]"
- **Limit Errors:** "Cannot start merge: This merge will exceed your plan limits"

#### System Errors
- **API Errors:** "An error occurred. Please try again or contact support."
- **Lock Expired:** "Lock has expired. Please start over."
- **Merge Failed:** "Merge failed: [reason]. View logs for details."

### User Feedback

#### Success Confirmations
- **Destination Selected:** "Next" button enabled, visual feedback
- **Items Selected:** Counter updates "X items selected"
- **Merge Complete:** "✓ Your apps have been successfully merged"

#### Progress Indicators
- **Loading:** Skeleton screens, spinners, "Loading..." text
- **In Progress:** Animated progress bar, scrolling status messages
- **Lock Countdown:** Timer display with warnings

#### Warnings
- **Before Starting:** "Progress cannot be saved", "Apps will be locked"
- **Data Impact:** "Data source changes go live immediately"
- **Non-copyable:** "Some component settings cannot be copied"
- **Limits:** "This merge will exceed your plan limits"

## Integration with Middleware

### Middleware Architecture Assumption

Since middleware is being developed separately, this UI plan assumes the following interface:

```javascript
window.AppMerge = {
  middleware: {
    // API Service Layer
    api: {
      getAppDetails(appId),
      getUserOrganizations(),
      getAppsForOrganization(orgId, userId),
      getAppLockStatus(appId),
      lockApps(sourceAppId, destinationAppId),
      unlockApps(sourceAppId, destinationAppId),
      extendLock(sourceAppId, destinationAppId),
      getAppScreens(appId, options),
      getDataSources(appId, options),
      getAppFiles(appId, options),
      getAppSettings(appId),
      getMergePreview(config),
      initiateMerge(config),
      getMergeStatus(mergeId),
      getMergeHistory(appId)
    },

    // Controller Layer
    controllers: {
      validateDestination(sourceAppId, destinationAppId),
      validateMergeConfiguration(config),
      initiateMerge(config)
    },

    // Event System
    on(event, handler),
    off(event, handler),
    emit(event, data)
  }
};
```

### State Management Integration

```javascript
// Example Vue component integration
export default {
  name: 'MergeConfiguration',

  data() {
    return {
      sourceAppId: null,
      destinationAppId: null,
      screens: [],
      dataSources: [],
      files: [],
      selectedItems: {
        screenIds: [],
        dataSources: [],
        fileIds: [],
        folderIds: [],
        settings: []
      },
      loading: false,
      error: null
    };
  },

  async created() {
    // Initialize from middleware
    this.sourceAppId = window.AppMerge.currentSourceAppId;
    this.destinationAppId = window.AppMerge.currentDestinationAppId;

    await this.loadData();
  },

  methods: {
    async loadData() {
      try {
        this.loading = true;

        const [screens, dataSources, files, settings] = await Promise.all([
          window.AppMerge.middleware.api.getAppScreens(this.sourceAppId, {
            include: 'associatedDS,associatedFiles'
          }),
          window.AppMerge.middleware.api.getDataSources(this.sourceAppId, {
            include: 'associatedPages,associatedFiles',
            includeInUse: true
          }),
          window.AppMerge.middleware.api.getAppFiles(this.sourceAppId, {
            include: 'associatedPages,associatedDS'
          }),
          window.AppMerge.middleware.api.getAppSettings(this.sourceAppId)
        ]);

        this.screens = screens;
        this.dataSources = dataSources;
        this.files = files;
        this.settings = settings;
      } catch (error) {
        this.error = this.formatError(error);
      } finally {
        this.loading = false;
      }
    },

    formatError(error) {
      // Extract user-friendly message from error
      return error.message || 'An unexpected error occurred';
    }
  },

  mounted() {
    // Listen for middleware events
    window.AppMerge.middleware.on('lock:expiring', this.handleLockExpiring);
    window.AppMerge.middleware.on('lock:expired', this.handleLockExpired);
  },

  beforeUnmount() {
    // Clean up event listeners
    window.AppMerge.middleware.off('lock:expiring', this.handleLockExpiring);
    window.AppMerge.middleware.off('lock:expired', this.handleLockExpired);
  }
};
```

### Event System Integration

```javascript
// Middleware emits events, UI listens
window.AppMerge.middleware.on('lock:expiring', (data) => {
  // Show warning when lock has < 5 min remaining
  this.showLockWarning = true;
  this.lockRemaining = data.remainingMs;
});

window.AppMerge.middleware.on('lock:expired', () => {
  // Show modal and return to dashboard
  this.showLockExpiredModal = true;
});

window.AppMerge.middleware.on('merge:progress', (data) => {
  // Update progress bar and status messages
  this.progress = data.progress;
  this.statusMessages.push(data.message);
});

window.AppMerge.middleware.on('merge:complete', (data) => {
  // Navigate to completion screen
  this.$router.push({
    name: 'complete',
    params: { mergeId: data.mergeId }
  });
});
```

## Implementation Priorities

### Phase 1: Core Structure (Week 1-2)
1. **AppOverlay** - Main overlay wrapper
2. **StepIndicator** - Progress breadcrumb
3. **MergeDashboard** - State 1 implementation
4. **DestinationSelection** - State 2 implementation
5. **Basic navigation** between states
6. **Integration with middleware API** for app details and organizations

**Success Criteria:**
- User can open overlay, view dashboard, select destination app
- Navigation works between dashboard and destination selection
- Data loads from middleware correctly

---

### Phase 2: Configuration UI (Week 3-4)
1. **MergeConfiguration** - State 3 main container
2. **TabNavigation** - Tab switcher
3. **ScreensTab** - Screens table with selection
4. **DataSourcesTab** - DS table with copy mode options
5. **FilesTab** - Files table with folder options
6. **SettingsTab** - Settings checkboxes
7. **DataTable** wrapper component (Fliplet.UI.Table integration)
8. **Lock management** - Countdown timer, extend lock

**Success Criteria:**
- User can switch tabs and see different content
- User can search, sort, filter, select items
- Lock countdown works and extends correctly
- Selected item counter updates in real-time

---

### Phase 3: Review & Execution (Week 5)
1. **ReviewSummary** - State 4 implementation
2. **SummarySection** - Reusable summary component
3. **MergeProgress** - State 5 implementation
4. **ProgressBar** - Animated progress
5. **StatusLog** - Scrolling messages
6. **Validation** - Conflict detection, limit checking

**Success Criteria:**
- User can review summary with color-coded status
- Merge initiates and progress updates in real-time
- Errors are handled gracefully with retry options

---

### Phase 4: Completion & Polish (Week 6)
1. **MergeComplete** - State 6 implementation
2. **CompletionSummary** - Results display
3. **Error handling** refinements
4. **Loading states** throughout
5. **Responsive** adjustments for mobile/tablet
6. **Accessibility** audit and fixes

**Success Criteria:**
- User sees completion summary with all details
- Can open destination app from completion screen
- Works smoothly on mobile, tablet, desktop
- Passes WCAG 2.1 AA accessibility audit

---

### Phase 5: Testing & Refinement (Week 7-8)
1. **Unit tests** for components
2. **Integration tests** with middleware
3. **E2E tests** for critical paths
4. **Performance optimization** (debounce, memoization)
5. **Analytics integration** - Event tracking and audit logs
6. **User testing** and feedback incorporation
7. **Documentation** - Component API docs, usage examples

**Success Criteria:**
- 80%+ test coverage
- All critical paths work end-to-end
- Performance targets met
- Analytics events firing correctly
- User feedback addressed

---

## Success Metrics

### User Experience Metrics
- **Task Completion Rate:** 90%+ users complete merge successfully
- **Time to Complete:** Average merge configuration < 10 minutes
- **Error Rate:** < 5% validation errors (duplicates, permissions)
- **Lock Expiry Rate:** < 2% merges abandoned due to lock timeout
- **Satisfaction Score:** 4.5+ out of 5 (from user feedback)

### Technical Metrics
- **Load Time:** Overlay opens in < 500ms
- **Tab Switch:** Content visible in < 200ms
- **Search Response:** Results in < 300ms
- **Progress Updates:** < 1 second latency from backend
- **Table Rendering:** 500+ items load in < 1 second

### Design System Metrics
- **Component Reuse:** 70%+ code reused across views
- **Accessibility Score:** 100% WCAG 2.1 AA compliance
- **Browser Support:** Works in Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Device Support:** Responsive from 320px width
- **Consistency:** Uses Fliplet Studio UI patterns throughout

### Business Metrics (from Analytics)
- **Feature Adoption:** 40%+ of eligible users try merge feature in first month
- **Repeat Usage:** 60%+ users who merge once merge again within 3 months
- **Success Rate:** 85%+ merges complete without critical errors
- **Time Savings:** 70%+ reduction vs manual app recreation

## Updated widget.json Configuration

```json
{
  "name": "App Merge",
  "package": "com.fliplet.app-merge",
  "version": "1.0.0",
  "description": "Merge apps within or across organizations",
  "icon": "img/icon.png",
  "tags": ["type:component", "category:general"],
  "provider_only": false,
  "references": [],
  "html_tag": "div",
  "interface": {
    "dependencies": [],
    "assets": []
  },
  "build": {
    "dependencies": [
      "fliplet-core",
      "fliplet-table"
    ],
    "assets": [
      "dist/css/index.css",
      "dist/app.js"
    ]
  }
}
```

**Note:** `fliplet-table` dependency must be verified in [Fliplet's asset library](https://api.fliplet.com/v1/widgets/assets) before implementation.

## Next Steps

This UI/UX plan should be reviewed for:

1. **User Experience:** Intuitive workflows, clear navigation, helpful feedback
2. **Visual Design:** Consistent with Fliplet Studio patterns
3. **Technical Feasibility:** Vue.js 3.5.13 implementation within Fliplet constraints
4. **Accessibility:** WCAG 2.1 AA compliance throughout
5. **Performance:** Load times and responsiveness meet targets
6. **Integration:** Middleware interface assumptions are correct
7. **Analytics:** Product success metrics are measurable
8. **Testing:** Test plan can be generated from state specifications

Once approved, this plan will be converted to implementation tasks using `generate-tasks.mdc`.

---

## Appendix: Component API Reference

### Quick Component Lookup

**Layout:**
- `AppOverlay` - Main modal wrapper
- `StepIndicator` - Progress breadcrumb (1/2/3)
- `WarningBanner` - Alert/warning messages

**Dashboard (State 1):**
- `MergeDashboard` - Dashboard view
- `AppInfoCard` - App information display

**Destination (State 2):**
- `DestinationSelection` - Destination picker
- `OrganizationDropdown` - Org selector
- `AppSelectionTable` - App list table

**Configuration (State 3):**
- `MergeConfiguration` - Main config view
- `TabNavigation` - Tab switcher
- `ScreensTab` - Screens selection
- `DataSourcesTab` - DS selection
- `FilesTab` - Files selection
- `SettingsTab` - Settings selection

**Review (State 4):**
- `ReviewSummary` - Review screen
- `SummarySection` - Summary section

**Progress (State 5):**
- `MergeProgress` - Progress monitor
- `ProgressBar` - Progress indicator
- `StatusLog` - Status messages

**Complete (State 6):**
- `MergeComplete` - Completion screen
- `CompletionSummary` - Results summary

**Shared UI:**
- `DataTable` - Reusable table (Fliplet.UI.Table wrapper)
- `SearchInput` - Search field
- `StatusBadge` - Status indicator
- `ActionButton` - Button with states
- `LockCountdown` - Lock timer
- `EmptyState` - Empty placeholder
- `LoadingSpinner` - Loading indicator
- `ErrorMessage` - Error display

---

**End of UI/UX Plan**

