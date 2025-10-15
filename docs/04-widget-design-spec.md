# App Merge Widget - Design Specification

> **Note:** This document describes the design specification specifically for the App Merge UI widget. For the complete App Merge project design including backend processes, Studio integration, and other system components, see [03-design-spec.md](./03-design-spec.md).

## Overview

This widget provides the user interface for configuring and monitoring app merge operations in Fliplet Studio. It is a web application that runs within an overlay in Fliplet Studio and guides users through a multi-step process.

### Widget Scope

This design spec covers the following UI components implemented by the widget:

1. **Merge Dashboard** - Initial state showing app info and merge options
2. **Step 1: Select Destination App** - Organisation and app selection
3. **Step 2: Configure Merge Settings** - Multi-tab item selection interface
4. **Step 3: Review Merge Summary** - Final review before merge
5. **Merge Progress & Completion** - Real-time monitoring and results

### Out of Scope

This design spec does NOT cover:

- Backend API implementation
- Studio menu integration
- Global code version control UI (separate feature)
- Organisation admin settings (separate feature)
- App locking backend logic
- Audit log implementation (widget only displays link)

## User Flow States

### State Flow Diagram

```
[Studio: User clicks "Merge app with..."]
           ↓
[State 1: Merge Dashboard]
           ↓
[State 2: Step 1 - Select Destination App]
           ↓ (apps locked)
[State 3: Step 2 - Configure Merge Settings]
           ↓
[State 4: Step 3 - Review Merge Summary]
           ↓
[State 5: Merge in Progress]
           ↓
[State 6: Merge Complete]
           ↓
[User opens merged app in Studio]
```

## State 1: Merge Dashboard

### What Users See

**Header:**
- Title: "Merge app"
- Close button (X)

**Source App Information Card:**
- App name (large, prominent)
- App ID
- Organisation name
- Region
- Published/Not Published status badge
- Last modified: timestamp
- Last modified by: user name

**Prerequisites Section:**
- **Title:** "Before you start"
- **Description text:**
  - "Check that screens and data sources don't have duplicate names in either app"
  - "Rename items to match names if you want them to be overwritten"
  - "⚠️ Your merge configuration cannot be saved. If you leave this interface, you'll need to start over."
  - "Both the source and destination apps will be locked during merge configuration and execution"

**Audit Log Link:**
- "View audit log" link (opens in new tab/window)

**Actions:**
- Primary button: "Configure merge"
- Secondary button: "Cancel"

### What Users Can Do

- Click "Configure merge" to proceed to destination selection
- Click "View audit log" to open app audit log
- Click "Cancel" or X to close overlay
- Read source app information

### Restrictions

- "Configure merge" is only visible if user has App Publisher rights
- If app is currently locked, show lock status message and disable "Configure merge"
- If merge is in progress, redirect to State 5 (Merge in Progress)

---

## State 2: Step 1 - Select Destination App

### What Users See

**Progress Indicator:**
- Step 1: Select destination app (current, highlighted)
- Step 2: Select items to merge (upcoming)
- Step 3: Review merge summary (upcoming)

**Warning Banner:**
- ⚠️ "Progress cannot be saved until merge is initiated"
- ⚠️ "Selected apps will be locked and unavailable for editing after proceeding to the next step"

**Organisation Selection:**
- **Label:** "Select destination organisation"
- **Dropdown:**
  - List of organisations user has access to
  - Each item shows: Organisation name, ID, region
  - Search/filter by typing
  - Default: source app's organisation
- **Hidden if:** User belongs to only one organisation

**App List:**
- **Label:** "Select destination app"
- **Description:** "Choose the app that will receive the merged content"

**Table Columns:**
- App name (sortable)
- App ID
- Last modified (sortable, timestamp)
- Status badge: "Live" if published

**Table Features:**
- Search box (searches name and ID)
- Sort by name or last modified
- Visual indicator for locked apps (greyed out, disabled)
- Visual indicator excluding source app (greyed out, disabled with "Source app" label)
- Select radio button (only one app can be selected)

**Actions:**
- Primary button: "Next" (enabled only when app selected)
- Secondary button: "Back" (returns to Dashboard)
- Tertiary button: "Cancel"
- Close button (X)

### What Users Can Do

- Select organisation from dropdown
- Search and sort apps
- Select one destination app
- Click "Next" to proceed to merge configuration
- Click "Back" to return to dashboard (unlocks any selected apps)
- Click "Cancel" or X to close (unlocks any selected apps)

### Restrictions

- Cannot select source app
- Cannot select locked apps
- Cannot select apps user doesn't have App Publisher rights on
- Cannot select apps with duplicate screen or data source names (shown with error indicator)
- Cannot proceed without selecting an app
- Organisation dropdown hidden if user belongs to only one org

### Validation Messages

**If destination has duplicates:**
- ❌ "This app cannot be selected because it contains duplicate screen or data source names. Please rename the following items: [list of duplicates]"

**If insufficient permissions:**
- ❌ "You don't have App Publisher rights on this app"

**If app is locked:**
- 🔒 "This app is currently locked due to an ongoing merge"

---

## State 3: Step 2 - Configure Merge Settings

### What Users See

**Progress Indicator:**
- Step 1: Select destination app (completed, checkmark)
- Step 2: Select items to merge (current, highlighted)
- Step 3: Review merge summary (upcoming)

**App Direction Indicator:**
- Visual arrow: "[Source App Name] → [Destination App Name]"

**Warning Banner:**
- 🔒 "Both apps are now locked. Other users cannot edit them until the merge completes or is cancelled."
- ⏱️ Lock countdown indicator (when < 5 minutes remaining)

**Tab Navigation:**
- Tab 1: Screens
- Tab 2: Data Sources
- Tab 3: Files
- Tab 4: Settings & Global Code

**Selected Items Counter:**
- "X items selected" (updates dynamically)

**Actions:**
- Primary button: "Review merge settings" (shows count of selected items)
- Secondary button: "Back"
- Tertiary button: "Cancel"
- Close button (X)

### Tab 1: Screens

**Instructions:**
- "Screen components, code, and settings will be migrated. Screens with matching names will be overwritten as new versions."
- "⚠️ Some component settings (e.g., SSO Login) cannot be copied and will need reconfiguration."
- "✓ Screen versions allow you to roll back changes after merge."

**Table Columns:**
| Select | Screen Name | Screen ID | Preview | Last Modified | Associated DS | Associated Files |
|--------|-------------|-----------|---------|---------------|---------------|------------------|
| ☑️ | | | 👁️ | timestamp | count (expandable) | count (expandable) |

**Table Features:**
- Select all checkbox (header)
- Individual select checkboxes
- Preview icon (opens preview modal)
- Expandable rows showing:
  - Associated data sources (nested table: name, selected status)
  - Associated files (nested table: name, selected status)
- Search (searches name and ID)
- Sort by name or last modified
- Pagination (25, 50, 100, Show all)

**Selection Behavior:**
- By default, all screens are selected
- Selecting a screen does not auto-select associated DS/files
- Warning icon on screens with non-copyable components

**Visual Indicators:**
- ☑️ Selected
- ☐ Not selected
- 🔸 Partial selection (some associated items not selected)
- ⚠️ Contains settings that cannot be copied

**Count Display:**
- "X of Y screens selected"

### Tab 2: Data Sources

**Instructions:**
- "Data sources with matching names will be overwritten. Changes go live immediately."
- "⚠️ Data source changes cannot be undone - they affect live apps instantly."
- "✓ Data source versions allow you to review and restore previous versions."

**Table Columns:**
| Select | DS Name | DS ID | Last Modified | Entries | Copy Mode | Associated Screens | Associated Files | Global Dep |
|--------|---------|-------|---------------|---------|-----------|-------------------|------------------|------------|
| ☑️ | | | timestamp | count | dropdown | count (expandable) | count (expandable) | Yes/No |

**Copy Mode Dropdown (per row):**
- "Overwrite structure and data" (default)
- "Copy structure only"

**Table Features:**
- Select all checkbox (header)
- Individual select checkboxes
- Copy mode dropdown per row
- "Set all to structure only" bulk action button
- Expandable rows showing:
  - Associated screens (nested table: name, selected status)
  - Associated files (nested table: name, selected status)
- Search (searches name and ID)
- Sort by name, last modified, or entry count
- Pagination (25, 50, 100, Show all)
- Filter by: has global dependency, has associated screens, has associated files

**Selection Behavior:**
- By default, all data sources are selected with "Overwrite structure and data" mode
- Only standard data sources shown (no data source types)
- Data sources in global dependencies highlighted

**Visual Indicators:**
- ☑️ Selected
- ☐ Not selected
- 🔸 Partial selection (some associated items not selected)
- ⭐ Global dependency
- ⚠️ Immediate live impact

**Count Display:**
- "X of Y data sources selected"
- "X with structure only"

### Tab 3: Files

**Instructions:**
- "Files with matching names will rename the destination file with a timestamp before replacing it."
- "Example: logo.png becomes logo (replaced on 2025-04-14T07:40:04).png"
- "✓ Renamed files remain in File Manager for reference."

**Table Columns:**
| Select | File/Folder Name | Path | Type | Added | File ID | Preview | Associated Screens | Associated DS | Global Lib |
|--------|------------------|------|------|-------|---------|---------|-------------------|---------------|------------|
| ☑️ | | | icon | timestamp | | 👁️ | count (expandable) | count (expandable) | Yes/No |

**Folder Options (per folder row):**
- Dropdown: "Copy folder only" or "Copy folder and files"
- Tooltip explains difference

**Table Features:**
- Select all checkbox (header)
- Individual select checkboxes
- Preview icon for images
- Expandable rows showing:
  - Associated screens (nested table: name, selected status)
  - Associated data sources (nested table: name, selected status)
- Search (searches name and path)
- Sort by name, type, or added date
- Pagination (25, 50, 100, Show all)
- Filter by: file type, has associations, unused files, global libraries

**Selection Behavior:**
- By default, all files are selected
- Folders default to "Copy folder and files"

**Visual Indicators:**
- ☑️ Selected
- ☐ Not selected
- 🔸 Partial selection (some associated items not selected)
- 📁 Folder
- 📄 File
- ⭐ Global library
- 💡 Unused file (no associations)

**Count Display:**
- "X of Y files selected"

### Tab 4: Settings & Global Code

**Instructions:**
- "App-level configurations will replace destination settings. Use version control to review and roll back global code changes."

**Checkboxes:**

1. **☐ App settings**
   - Description: "Merge app settings (excluding unique identifiers and sensitive configurations)"
   - Link: "See which settings are copied"
   - Tooltip: Lists settings that are copied vs. excluded

2. **☐ Menu settings**
   - Description: "Copy menu type and menu list configuration"

3. **☐ Global appearance settings**
   - Description: "Copy all global appearance settings and associated media files"
   - Note: "Widget-specific appearance settings are not copied"

4. **☐ Global code customizations**
   - Description: "Copy global CSS and JavaScript code"
   - ⚠️ Warning: "This will overwrite destination global code. A version will be saved for rollback."
   - Shows:
     - Global CSS (included)
     - Global JS (included)
     - Library dependencies (included)
     - Data source dependencies (included)

**Selection Behavior:**
- All unchecked by default
- Each can be toggled independently

**Count Display:**
- "X of 4 app-level options selected"

### Lock Extension UI

**When lock < 5 minutes:**
- Warning banner appears: ⏱️ "Lock expires in X minutes. Extend lock?"
- Auto-extends if user interacts with page

**When lock < 2 minutes:**
- Prominent warning modal:
  - "⚠️ Lock expires in X seconds"
  - "The merge will be aborted if the lock expires"
  - Button: "Extend lock by 5 minutes"
  - Countdown timer

### What Users Can Do

- Switch between tabs
- Search, sort, filter items in tables
- Select/deselect items individually or in bulk
- Expand rows to view associations
- Change copy mode for data sources
- Change folder copy options
- Preview screens and files
- Toggle app-level configuration checkboxes
- Click "Review merge settings" to proceed
- Click "Back" to change destination app (unlocks apps)
- Click "Cancel" or X to exit (unlocks apps)
- Extend lock when prompted

### Restrictions

- Cannot rename items
- Cannot edit app content
- Cannot select non-standard data sources
- Must make selections before proceeding

---

## State 4: Step 3 - Review Merge Summary

### What Users See

**Progress Indicator:**
- Step 1: Select destination app (completed, checkmark)
- Step 2: Select items to merge (completed, checkmark)
- Step 3: Review merge summary (current, highlighted)

**App Direction Indicator:**
- Visual arrow: "[Source App Name] → [Destination App Name]"

**Instructions:**
- "Review your merge configuration. The merge will complete in under 5 minutes."
- "⚠️ Once started, the merge cannot be cancelled."

**Warning Banners (all displayed prominently):**
- ⚠️ "Automated rollback is unavailable. Use version control to manually restore previous versions."
- ⚠️ "Data source changes go live immediately and affect live apps."
- ⚠️ "App settings and global code will overwrite destination configurations."
- ⚠️ "Screens and global code can be restored using version control."

**Summary Sections:**

### Screens Section
- **Title:** "Screens" (count)
- **Table:**
  | Status | Screen Name | Screen ID |
  |--------|-------------|-----------|
  | 🟢 Copy | | |
  | 🟠 Overwrite | | |
  | 🔴 Conflict | | |

**Legend:**
- 🟢 Copy: New screen will be created
- 🟠 Overwrite: Existing screen will be replaced with new version
- 🔴 Conflict: Duplicate name detected (blocks merge)

### Data Sources Section
- **Title:** "Data Sources" (count)
- **Table:**
  | Status | DS Name | DS ID | Mode | Entries |
  |--------|---------|-------|------|---------|
  | 🟢 Copy | | | Structure & Data / Structure Only | count |
  | 🟠 Overwrite | | | Structure & Data / Structure Only | count |
  | 🔴 Conflict | | | - | - |

### Files Section
- **Title:** "Files" (count)
- **Table:**
  | Status | File Name | File ID | Folder Option |
  |--------|-----------|---------|---------------|
  | 🟢 Copy | | | - |
  | 🟠 Replace | | | Folder only / Folder & files |
  | 🔴 Conflict | | | - |

### App-Level Configurations Section
- **Title:** "App-Level Configurations"
- **List:**
  - ✓ App settings (if selected)
  - ✓ Menu settings (if selected)
  - ✓ Global appearance settings (if selected)
  - ✓ Global code customizations (if selected)
  - ✗ Not selected (greyed out for unchecked items)

**Plan/Pricing Limit Warnings (if applicable):**
- 🚨 "This merge will exceed your plan limits:"
  - File count: X / Y
  - Storage: X / Y
  - Data rows: X / Y
- "Please review your plan or contact support before proceeding."

**Actions:**
- Primary button: "Start merge" (disabled if conflicts exist or limits exceeded)
- Secondary button: "Edit merge settings" (returns to Step 2)
- Tertiary button: "Cancel"
- Close button (X)

### What Users Can Do

- Review all items to be merged
- Identify conflicts
- Click "Edit merge settings" to modify configuration
- Click "Start merge" to initiate merge (if no conflicts)
- Click "Cancel" or X to exit (unlocks apps)

### Restrictions

- Cannot start merge if:
  - Conflicts exist (duplicate names)
  - Plan/pricing limits exceeded
  - No items selected
- Cannot edit items directly from this screen
- Must return to Step 2 to make changes

### Validation Messages

**If conflicts exist:**
- ❌ "Cannot start merge: The following items have duplicate names: [list]"
- "Please return to merge settings and rename or deselect these items."

**If limits exceeded:**
- ❌ "Cannot start merge: This merge will exceed your plan limits."
- "Please upgrade your plan or deselect some items."

---

## State 5: Merge in Progress

### What Users See

**Header:**
- Title: "Merge in progress"
- Message: "Please do not close this window. The merge will complete in under 5 minutes."

**Progress Bar:**
- Animated progress bar showing percentage
- Text: "X% complete"

**Status Messages (real-time, scrolling list):**
- ✓ "Locking apps..."
- ✓ "Copying files... (1 of 25)"
- ✓ "Creating data sources... (1 of 5)"
- ✓ "Copying global code..."
- ✓ "Copying screens... (1 of 40)"
- ⏳ "Updating data source entries... (1 of 5)"
- ✓ "Updating app settings..."
- ✓ "Merge complete!"

**Error Messages (if any):**
- ❌ "Error copying file 'logo.png': [error message]"
- "Action: Retry / Skip"

**Actions During Merge:**
- Button: "Close" (merge continues in background)
- No cancel button (merge cannot be stopped)

### What Users Can Do

- View real-time progress updates
- See which items are being merged
- View success/failure status for each item
- Close overlay (merge continues)
- Take action on errors (retry/skip)

### Restrictions

- Cannot cancel merge once started
- Cannot edit apps during merge
- Cannot start another merge on these apps

---

## State 6: Merge Complete

### What Users See

**Header:**
- Title: "Merge complete"
- Success message: "✓ Your apps have been successfully merged"

**Summary Section:**
- **Screens:** X screens merged (Y overwritten, Z created)
- **Data Sources:** X data sources merged (Y overwritten, Z created)
- **Files:** X files merged (Y replaced, Z created)
- **App-Level Configurations:**
  - ✓ App settings applied
  - ✓ Menu settings applied
  - ✓ Global appearance settings applied
  - ✓ Global code applied

**Issues Section (if any):**
- **Title:** "Issues and Warnings"
- **List:**
  - ⚠️ "File 'logo.png' was renamed in destination to 'logo (replaced on 2025-04-14T07:40:04).png'"
  - ⚠️ "Component settings for SSO Login were not copied and require reconfiguration"
  - ❌ "Error copying file 'missing.jpg': File not found"

**Plan/Pricing Limit Warnings (if applicable):**
- 🚨 "This merge exceeded your plan limits:"
  - File count: X / Y (over by Z)
  - Storage: X MB / Y MB (over by Z)
- "Please upgrade your plan or remove unused files."

**Next Steps Section:**
- "✓ Review changes in the destination app"
- "✓ Test functionality"
- "✓ Publish app if required (screen changes need republish)"
- "⚠️ Data source changes are already live"

**Previous Merges Section (if any):**
- **Title:** "Recent Merges"
- **List:**
  - Merge from [Source App] to [Dest App] on [timestamp] by [user] - View log

**Actions:**
- Primary button: "Open app" (opens destination app in Studio)
- Secondary button: "View audit log"
- Tertiary button: "Close"

### What Users Can Do

- Review merge summary and counts
- Read issues and warnings
- Click "Open app" to navigate to destination app in Studio
- Click "View audit log" to see detailed logs
- Click "Close" to exit overlay
- Apps are now unlocked for editing

### Restrictions

- Cannot undo merge from this screen
- Must use version control to restore previous versions
- Cannot view detailed diff from this screen

---

## Component Specifications

### Table Component

**Features:**
- Clear column headings
- Configurable pagination (25, 50, 100, Show all)
- Global search across specified columns
- Column sorting (ascending/descending)
- Proper numerical sorting
- Loading spinners during data fetch
- Empty state message
- Bulk selection checkbox (header)
- Individual selection checkboxes
- Partial selection visual indicator (indeterminate checkbox)
- Custom cell UI (dropdowns, badges, icons)
- Nested tables (expandable rows)
- Row click, double-click, selection change events
- Responsive layout (horizontal scroll on small screens)

**Accessibility:**
- Keyboard navigation (arrow keys, space for select, enter for expand)
- Screen reader labels
- Focus indicators
- ARIA attributes

### Progress Bar Component

**Features:**
- Animated fill
- Percentage display
- Color states (in-progress blue, success green, error red)
- Smooth transitions

### Status Message Component

**Features:**
- Icons (✓ ⏳ ❌ ⚠️)
- Timestamp
- Scrollable list
- Auto-scroll to latest
- Color coding

### Modal/Overlay Component

**Features:**
- Backdrop (semi-transparent black)
- Close button (X)
- Escape key to close
- Click outside to close (with warning if dirty state)
- Responsive sizing
- Header, content, footer sections

### Button Component

**Variants:**
- Primary (filled, prominent)
- Secondary (outlined)
- Tertiary (text only)
- Disabled state
- Loading state (spinner)

### Form Controls

**Checkbox:**
- Checked, unchecked, indeterminate states
- Label
- Disabled state

**Dropdown:**
- Search/filter
- Single select
- Keyboard navigation
- Loading state

**Search Input:**
- Search icon
- Clear button
- Placeholder text
- Real-time filtering

## Responsive Behavior

### Desktop (> 1024px)
- Full table layout
- Overlay: 80% viewport width, centered
- All columns visible

### Tablet (768px - 1024px)
- Overlay: 90% viewport width
- Hide less important columns
- Horizontal scroll for tables

### Mobile (< 768px)
- Overlay: Full width
- Card-based layout instead of tables
- Vertical stacking
- Collapsible sections

## Error Handling

### API Errors
- Display user-friendly error message
- Show technical details in expandable section
- Provide retry option
- Log error for debugging

### Validation Errors
- Inline error messages below fields
- Red border on invalid fields
- Error summary at top of form
- Block submission until resolved

### Network Errors
- "Connection lost" message
- Auto-retry on reconnect
- Save draft state if possible

## Performance Considerations

### Initial Load
- Load critical data first (app info, org list)
- Lazy load table data
- Show loading skeletons

### Table Rendering
- Virtual scrolling for large datasets (> 500 items)
- Debounce search input (300ms)
- Paginate by default

### Real-Time Updates
- WebSocket or long-polling for merge progress
- Update UI within 1 second of backend event
- Throttle rapid updates

## Visual Design

### Color Coding
- 🟢 Green: Success, new items
- 🟠 Orange: Warning, overwrite
- 🔴 Red: Error, conflict
- 🔵 Blue: Info, in progress
- ⚫ Grey: Disabled, locked

### Typography
- Headers: Large, bold
- Body: Regular weight, readable
- Labels: Smaller, subtle
- Monospace: IDs, code

### Spacing
- Consistent padding/margins
- Clear visual hierarchy
- Adequate whitespace

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation throughout
- Screen reader support
- Focus management
- Color contrast ratios
- Alt text for images/icons

## Notes for Developers

### State Management
- Use Vue 3 composition API
- Centralized state for merge configuration
- Temporary state (no persistence)
- Clear state on exit

### API Integration
- REST API for data fetching
- WebSocket for real-time updates
- Error handling and retry logic
- Loading states

### Component Structure
- Modular components
- Reusable table component
- Composables for common logic
- Props and events for communication

### Testing
- Unit tests for components
- Integration tests for flows
- E2E tests for critical paths
- Accessibility testing
