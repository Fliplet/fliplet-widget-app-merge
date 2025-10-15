# UI/UX Plan: App Merge Widget

## Overview

The App Merge Widget provides a comprehensive user interface within Fliplet Studio for configuring, executing, and monitoring app merge operations. The widget guides users through a multi-step workflow to merge screens, data sources, files, and app-level configurations from a source app into a destination app, with real-time progress monitoring and comprehensive validation.

### Source Alignment

**Primary PRD References:**
- **Multi-step merge configuration workflow** (Dashboard → Select Destination → Configure Items → Review → Execute)
- **App locking during configuration** to prevent concurrent modifications
- **Real-time validation** of duplicate names, permissions, and plan limits
- **Tabular UI** for screens, data sources, and files with search, sort, filter, and nested associations
- **Live impact warnings** for data sources and settings
- **Version control integration** for screens and global code rollback
- **Merge progress monitoring** with real-time status updates

**Design Spec References:**
- **State 1: Merge Dashboard** - Initial view with app info and prerequisites
- **State 2: Step 1 - Select Destination** - Organization and app selection
- **State 3: Step 2 - Configure Settings** - Multi-tab item selection (Screens, Data Sources, Files, Settings)
- **State 4: Step 3 - Review Summary** - Final review with conflict detection
- **State 5: Merge in Progress** - Real-time progress monitoring
- **State 6: Merge Complete** - Summary and results
- **Tabular UI specifications** with pagination, sorting, nested rows
- **Lock extension UI** with countdown warnings
- **Responsive behavior** for desktop, tablet, and mobile

## Technical Stack

### Framework
- **Vue.js Version:** 3.5.13
- **Component API:** Vue Options API (for Fliplet compatibility)
- **Build Context:** interface - Runs in Fliplet Studio overlay (iFrame) for app configuration
- **Note:** Widget runs in Studio-managed overlay - close/cancel controls handled by Studio, not the widget

### Styling Framework
- **Tailwind CSS:** Modern utility-first CSS framework
  - Installed via `package.json` as a dev dependency
  - Compiled through Gulp and Webpack build process
  - Configured via `tailwind.config.js`
  - PostCSS processing for production optimization
  - Compiled into `dist/css/index.css` bundle

### Icon Library
- **lucide-vue-next:** Beautiful, consistent SVG icons for Vue 3
  - Installed via `package.json`
  - Tree-shakeable, customizable icons
  - Used for all UI icons and indicators

### Available Fliplet Dependencies
- **fliplet-core:** Core Fliplet functionality (required)
- Only include fliplet-core in widget.json - Tailwind and lucide-vue-next are bundled

## Design Principles

### Core Principles
- **Responsive Design:** Mobile-first approach with fluid layouts
- **Accessibility:** WCAG 2.1 AA compliance throughout
- **Visual Excellence:** Modern, aesthetically pleasing UI with attention to spacing and typography
- **User Experience:** Clear navigation, intuitive interactions, and smooth transitions
- **Performance:** Optimized loading and minimal re-renders

### Design System Integration
- **Tailwind Utility Classes:** Primary styling approach
- **Fliplet Brand Colors:** Configured in Tailwind theme
- **Component Variants:** Reusable Vue components with Tailwind classes
- **Consistent Spacing:** 8px base unit system

## User Journey Mapping

### Primary User Flow: App Merge Configuration and Execution

**User Goal:** Merge selected components from a source app into a destination app
**Entry Point:** Fliplet Studio "App > Merge app..." menu
**Success Criteria:** Successful merge completion with all selected items copied/overwritten
**Referenced States:** Dashboard, Select Destination, Configure Settings, Review, Progress, Complete
**PRD Alignment:** Multi-step workflow with validation at each stage

**Steps:**

1. **View Merge Dashboard**
   - User Action: Click "Configure merge" from App menu
   - System Response: Display dashboard with source app info and prerequisites
   - Data Displayed: App name, ID, organization, publish status, last modified
   - Possible Errors: User lacks publisher rights, app is locked

2. **Select Destination App**
   - User Action: Choose organization (if multiple) and select destination app
   - System Response: List mergeable apps, exclude locked and source app
   - Data Displayed: App list with name, ID, last modified, live status
   - Possible Errors: No publisher rights, destination has duplicates, app is locked

3. **Lock Apps**
   - User Action: Click "Next" after selecting destination
   - System Response: Lock both source and destination apps
   - Data Displayed: Lock confirmation banner, countdown timer
   - Possible Errors: Lock acquisition fails, apps already locked

4. **Configure Merge Settings**
   - User Action: Select items across four tabs (Screens, Data Sources, Files, Settings)
   - System Response: Display filterable tables with associations, update selection counts
   - Data Displayed: Tables with search, sort, pagination, nested associations
   - Possible Errors: None - all selections are temporary until merge initiation

5. **Review Merge Summary**
   - User Action: Review selections, identify conflicts
   - System Response: Display color-coded summary (copy/overwrite/conflict)
   - Data Displayed: Complete list with conflict warnings, plan limit warnings
   - Possible Errors: Duplicate names block merge, plan limits exceeded

6. **Execute Merge**
   - User Action: Click "Start merge"
   - System Response: Initiate background merge process
   - Data Displayed: Real-time progress with status messages
   - Possible Errors: Network failures, API errors, partial merge failures

7. **View Merge Results**
   - User Action: Review completion summary
   - System Response: Display success counts, warnings, errors
   - Data Displayed: Items merged, issues encountered, next steps
   - Possible Errors: None - merge has completed

## State-Oriented UX Specifications

### State 1: Merge Dashboard

**Entry Triggers:**
- User clicks "App > Merge app..." from Studio menu
- Widget loads in Studio overlay

**Design References:**
- Design Spec: "State 1: Merge Dashboard" (lines 52-96)
- PRD: "Merge Dashboard" (lines 117-130)

**Visibility/Data:**
- Source app information card
  - App name (prominent heading)
  - App ID, organization name, region
  - Published/Not Published badge
  - Last modified timestamp and user name
- Prerequisites section with instructions
- Warning: "Merge configuration cannot be saved"
- "View audit log" link

**Allowed Actions:**
- Click "Configure merge" → Navigate to Select Destination (if user has publisher rights)
- Click "View audit log" → Open audit log in new tab
- Click "Cancel" or X → Close overlay

**Forbidden Actions (and Why):**
- "Configure merge" disabled if:
  - User lacks App Publisher rights (permissions check)
  - App is currently locked (show lock status)
  - Merge is in progress (redirect to progress screen)

**System Feedback:**
- Lock status indicator if app is locked
- Publisher rights validation message

**Empty/Error/Offline Variants:**
- **Loading:** Skeleton layout while fetching app details
- **Error:** "Unable to load app details. Please try again."
- **Offline:** "Connection lost. Please check your network."

**Permissions/Entitlements:**
- Must have App Publisher rights on source app

**Analytics:**
- `app_merge_dashboard_viewed` - When dashboard loads
- `app_merge_initiated` - When user clicks "Configure merge"
- `app_merge_cancelled` - When user closes without starting

**Transitions:**
- → Select Destination App (user clicks "Configure merge")
- → Close overlay (user clicks Cancel/X)

### State 2: Step 1 - Select Destination App

**Entry Triggers:**
- User clicks "Configure merge" from dashboard
- User clicks "Back" from Step 2

**Design References:**
- Design Spec: "State 2: Step 1 - Select Destination App" (lines 99-173)
- PRD: "Step 1: Select Destination App" (lines 132-154)

**Visibility/Data:**
- 3-step progress indicator (Step 1 highlighted)
- Warning banners:
  - "Progress cannot be saved until merge is initiated"
  - "Selected apps will be locked after proceeding"
- Organization dropdown (if user belongs to multiple orgs)
  - Organization name, ID, region
  - Search/filter capability
- App list table:
  - Columns: Name, ID, Last Modified, Live Status
  - Radio button selection (single app)
  - Search box, sortable columns
  - Visual indicators: locked apps (greyed), source app (disabled)

**Allowed Actions:**
- Select organization from dropdown (if multiple orgs)
- Search and filter apps
- Sort by name or last modified
- Select one destination app (radio button)
- Click "Next" → Lock apps and navigate to Configure Settings (if app selected and valid)
- Click "Back" → Return to Dashboard
- Click "Cancel" or X → Close overlay

**Forbidden Actions (and Why):**
- Cannot select source app (self-merge not allowed)
- Cannot select locked apps (concurrent merge in progress)
- Cannot select apps without publisher rights (permissions check)
- Cannot select apps with duplicate names (validation fails)
- "Next" disabled until valid app selected

**System Feedback:**
- **Validation messages:**
  - "This app cannot be selected because it contains duplicate screen or data source names. Please rename the following items: [list]"
  - "You don't have App Publisher rights on this app"
  - "This app is currently locked due to an ongoing merge"
- **Loading:** Spinner while fetching apps list
- **Empty:** "No apps available in this organization"

**Empty/Error/Offline Variants:**
- **Loading:** Table skeleton while fetching apps
- **No Apps:** "No mergeable apps found in this organization"
- **Error:** "Unable to load apps. Please try again."
- **Validation Error:** Inline error messages for invalid selections

**Permissions/Entitlements:**
- Must have App Publisher rights on destination app
- Organization access required

**Analytics:**
- `destination_selection_started` - When step loads
- `destination_app_selected` - When app is selected
- `destination_selection_completed` - When "Next" clicked
- `destination_selection_cancelled` - When user goes back or closes

**Transitions:**
- → Dashboard (user clicks "Back")
- → Configure Merge Settings (user clicks "Next" with valid selection, apps are locked)
- → Close overlay (user clicks Cancel/X)

### State 3: Step 2 - Configure Merge Settings

**Entry Triggers:**
- User clicks "Next" from Select Destination
- Apps are successfully locked
- User clicks "Edit merge settings" from Review Summary

**Design References:**
- Design Spec: "State 3: Step 2 - Configure Merge Settings" (lines 175-402)
- PRD: "Step 2: Configure Merge Settings" (lines 156-280)

**Visibility/Data:**
- 3-step progress indicator (Step 2 highlighted, Step 1 completed)
- App direction indicator: "[Source App] → [Destination App]"
- Lock warning banner: "Both apps are now locked. Other users cannot edit them."
- Lock countdown timer (when < 5 minutes remaining)
- Tab navigation: Screens, Data Sources, Files, Settings & Global Code
- Selected items counter (updates dynamically)
- **Screens Tab:**
  - Instructions about screen merging and version control
  - Table: Checkbox, Name, ID, Preview, Last Modified, Associated DS (count), Associated Files (count)
  - Expandable rows show associated items with selection status
  - Search, sort, pagination
- **Data Sources Tab:**
  - Instructions about live impact and versioning
  - Table: Checkbox, Name, ID, Last Modified, Entries, Copy Mode dropdown, Associated Screens, Associated Files, Global Dep indicator
  - "Data structure only" vs "Overwrite structure and data" options
  - Filter by global dependencies
- **Files Tab:**
  - Instructions about file replacement behavior
  - Table: Checkbox, Name, Path, Type, Added, ID, Preview, Associated Screens, Associated DS, Global Lib indicator
  - Folder options: "Copy folder only" vs "Copy folder and files"
  - Filter by unused files, global libraries
- **Settings & Global Code Tab:**
  - Checkboxes with descriptions:
    - App settings (with link to details)
    - Menu settings
    - Global appearance settings
    - Global code customizations (with version warning)

**Allowed Actions:**
- Switch between tabs
- Search, sort, filter items in tables
- Select/deselect items individually or bulk (select all)
- Expand rows to view associations
- Change data source copy mode (structure only / full)
- Change folder copy options (folder only / folder + files)
- Toggle app-level configuration checkboxes
- Click "Review merge settings" → Navigate to Review Summary (any items can be selected)
- Click "Back" → Return to Select Destination, unlock apps
- Click "Cancel" or X → Unlock apps and close overlay
- Click "Extend lock" when prompted

**Forbidden Actions (and Why):**
- Cannot rename items (must be done in main Studio)
- Cannot edit app content (configuration only)
- Cannot select non-standard data sources (only type=null supported)
- Cannot proceed if lock expires (auto-unlock occurs)

**System Feedback:**
- **Lock countdown:**
  - < 5 min: Warning banner with "Extend lock?" button
  - < 2 min: Prominent modal with countdown timer
- **Selection feedback:**
  - Checkbox states: checked, unchecked, indeterminate (partial selection)
  - Count updates: "X of Y screens selected"
- **Loading:** Skeleton tables while fetching data
- **Warnings:**
  - "Screen contains components that cannot be copied (e.g., SSO settings)"
  - "Data source is in global dependencies - changes affect multiple apps"
  - "File has no associations - may be unused"

**Empty/Error/Offline Variants:**
- **Loading:** Skeleton table rows
- **No Items:** "No screens/data sources/files found"
- **Error:** "Unable to load items. Please try again."
- **Lock Expired:** "Lock has expired. Merge configuration cancelled."

**Permissions/Entitlements:**
- Apps must remain locked during configuration
- User must have publisher rights on both apps

**Analytics:**
- `merge_config_started` - When step loads
- `screen_selected` / `datasource_selected` / `file_selected` - Item selections
- `tab_switched` - User navigates between tabs
- `lock_extended` - User extends lock
- `merge_config_completed` - When "Review" clicked

**Transitions:**
- → Select Destination (user clicks "Back", apps are unlocked)
- → Review Summary (user clicks "Review merge settings")
- → Lock Expired (lock timer expires, apps are unlocked)
- → Close overlay (user clicks Cancel/X, apps are unlocked)

### State 4: Step 3 - Review Merge Summary

**Entry Triggers:**
- User clicks "Review merge settings" from Configure Settings
- User validates merge preview successfully

**Design References:**
- Design Spec: "State 4: Step 3 - Review Merge Summary" (lines 404-508)
- PRD: "Step 3: Review Merge Summary" (lines 281-304)

**Visibility/Data:**
- 3-step progress indicator (Step 3 highlighted, Steps 1-2 completed)
- App direction indicator: "[Source App] → [Destination App]"
- Instructions: "Review your merge configuration. Merge will complete in under 5 minutes."
- Warning banners (all prominent):
  - "Once started, the merge cannot be cancelled"
  - "Automated rollback is unavailable. Use version control to restore."
  - "Data source changes go live immediately and affect live apps"
- Summary sections with color-coded tables:
  - **Screens:** Status (Copy/Overwrite/Conflict), Name, ID
  - **Data Sources:** Status, Name, ID, Mode (Structure Only / Full), Entries
  - **Files:** Status, Name, ID, Folder Option
  - **App-Level Configurations:** Checkmarks for selected options
- Legend: 🟢 Copy (new), 🟠 Overwrite (replace), 🔴 Conflict (duplicate)
- Plan limit warnings (if applicable):
  - "This merge will exceed your plan limits: [details]"

**Allowed Actions:**
- Review all selected items and their merge status
- Identify conflicts (duplicate names)
- Click "Start merge" → Initiate merge (if no conflicts and limits OK)
- Click "Edit merge settings" → Return to Configure Settings
- Click "Cancel" or X → Unlock apps and close overlay

**Forbidden Actions (and Why):**
- "Start merge" disabled if:
  - Conflicts exist (duplicate names found)
  - Plan limits exceeded (storage, files, data rows)
  - No items selected (nothing to merge)
- Cannot edit items directly (must return to Step 2)

**System Feedback:**
- **Conflict errors:**
  - "Cannot start merge: The following items have duplicate names: [list]"
  - "Please return to merge settings and rename or deselect these items."
- **Limit errors:**
  - "Cannot start merge: This merge will exceed your plan limits."
  - "Please upgrade your plan or deselect some items."
- **Loading:** Spinner while generating preview

**Empty/Error/Offline Variants:**
- **Loading:** Skeleton summary while generating preview
- **No Items:** "No items selected for merge"
- **Conflict:** Highlighted conflict rows with clear error message
- **Error:** "Unable to generate preview. Please try again."

**Permissions/Entitlements:**
- Apps must remain locked
- User must have publisher rights

**Analytics:**
- `merge_review_started` - When review loads
- `merge_conflict_detected` - When conflicts found
- `merge_initiated` - When "Start merge" clicked
- `merge_review_cancelled` - When user edits or closes

**Transitions:**
- → Configure Settings (user clicks "Edit merge settings")
- → Merge in Progress (user clicks "Start merge" successfully)
- → Close overlay (user clicks Cancel/X, apps are unlocked)

### State 5: Merge in Progress

**Entry Triggers:**
- User clicks "Start merge" from Review Summary
- Merge initiation succeeds
- User reopens overlay while merge is running (if previously closed)

**Design References:**
- Design Spec: "State 5: Merge in Progress" (lines 511-555)
- PRD: "Merge Progress & Completion" (lines 306-333)

**Visibility/Data:**
- Header: "Merge in progress"
- Message: "Please do not close this window. The merge will complete in under 5 minutes."
- Animated progress bar with percentage: "X% complete"
- Real-time status messages (scrolling list):
  - ✓ "Locking apps..."
  - ✓ "Copying files... (1 of 25)"
  - ✓ "Creating data sources... (1 of 5)"
  - ⏳ "Updating data source entries... (1 of 5)"
  - ✓ "Copying screens... (1 of 40)"
  - ✓ "Updating app settings..."
  - ✓ "Merge complete!"
- Error messages (if any):
  - ❌ "Error copying file 'logo.png': [message]"

**Allowed Actions:**
- View real-time progress updates
- See which items are being merged
- View success/failure status
- Click "Close" → Close overlay (merge continues in background)

**Forbidden Actions (and Why):**
- Cannot cancel merge (process is irreversible once started)
- Cannot edit apps (apps are locked)
- Cannot start another merge (apps are locked)

**System Feedback:**
- **Progress indicators:**
  - Animated progress bar
  - Real-time status messages with icons (✓, ⏳, ❌)
  - Item counts: "(1 of 25)"
- **Auto-scroll:** Status list scrolls to latest message
- **Color coding:** Success (green), in-progress (blue), error (red)

**Empty/Error/Offline Variants:**
- **Network Error:** "Connection lost. Merge is continuing but status updates are unavailable."
- **Partial Failure:** Individual item errors shown inline, merge continues

**Permissions/Entitlements:**
- Apps remain locked during merge
- Merge process runs in background

**Analytics:**
- `merge_execution_started` - When merge begins
- `merge_progress_updated` - Progress milestones (25%, 50%, 75%, 100%)
- `merge_error_occurred` - When errors happen
- `merge_execution_completed` - When merge finishes

**Transitions:**
- → Merge Complete (merge finishes successfully or with errors)
- → Background merge (user closes overlay, merge continues)

### State 6: Merge Complete

**Entry Triggers:**
- Merge execution completes (success or partial success)
- User reopens overlay after merge completes

**Design References:**
- Design Spec: "State 6: Merge Complete" (lines 558-618)
- PRD: "After Merge Completion" (lines 317-333)

**Visibility/Data:**
- Header: "Merge complete"
- Success message: "✓ Your apps have been successfully merged"
- Summary section:
  - **Screens:** X screens merged (Y overwritten, Z created)
  - **Data Sources:** X data sources merged (Y overwritten, Z created)
  - **Files:** X files merged (Y replaced, Z created)
  - **App-Level Configurations:** Checkmarks for applied options
- Issues section (if any):
  - ⚠️ "File 'logo.png' was renamed to 'logo (replaced on 2025-04-14T07:40:04).png'"
  - ⚠️ "Component settings for SSO Login were not copied"
  - ❌ "Error copying file 'missing.jpg': File not found"
- Plan limit warnings (if applicable):
  - "This merge exceeded your plan limits: [details]"
- Next steps guidance:
  - "Review changes in the destination app"
  - "Test functionality"
  - "Publish app if required (screen changes need republish)"
  - "Data source changes are already live"
- Previous merges list (if any):
  - "Merge from [Source] to [Dest] on [timestamp] by [user] - View log"

**Allowed Actions:**
- Review merge summary and counts
- Read issues and warnings
- Click "Open app" → Navigate to destination app in Studio
- Click "View audit log" → Open detailed audit log
- Click "Close" → Close overlay
- Apps are now unlocked for editing

**Forbidden Actions (and Why):**
- Cannot undo merge from this screen (must use version control)
- Cannot view detailed diff (not implemented)

**System Feedback:**
- **Success indicators:** Green checkmarks, success counts
- **Warnings:** Orange icons for non-critical issues
- **Errors:** Red icons for failed operations
- **Plan limits:** Highlighted warnings if limits exceeded

**Empty/Error/Offline Variants:**
- **Complete Success:** No issues section shown
- **Partial Success:** Issues section lists warnings and errors
- **Complete Failure:** Error message with retry/support options

**Permissions/Entitlements:**
- Apps are unlocked
- User can now edit both apps

**Analytics:**
- `merge_completion_viewed` - When completion screen loads
- `merge_result_reviewed` - User reviews summary
- `destination_app_opened` - User clicks "Open app"
- `audit_log_viewed` - User clicks "View audit log"

**Transitions:**
- → Destination App in Studio (user clicks "Open app")
- → Audit Log (user clicks "View audit log")
- → Close overlay (user clicks "Close")

## Component Architecture

### Layout Components

#### AppShell
**Purpose:** Main widget wrapper with consistent structure

**Note:** This widget runs in a Fliplet Studio overlay (iFrame). The overlay's close button and controls are managed by Studio, so AppShell does not implement close functionality.

**Features:**
- Header with title
- Progress indicator (for multi-step flows)
- Main content area
- Action button area (footer)

**Props:**
```javascript
{
  title: String,              // Page title
  currentStep: Number,        // Current step (1-3)
  totalSteps: Number,         // Total steps
  showProgress: Boolean       // Show/hide progress indicator
}
```

#### ProgressIndicator
**Purpose:** Multi-step progress visualization

**Design References:** Design Spec Step indicators

**Features:**
- Step numbers with labels
- Completed, current, upcoming states
- Responsive layout

**Props:**
```javascript
{
  steps: Array,               // [{ label: 'Step 1', completed: true }]
  currentStep: Number         // Current step index
}
```

### Page Components

#### MergeDashboard
**Purpose:** Initial dashboard view
**Design References:** Design Spec State 1
**Data Requirements:** Source app details, user permissions
**States:** Loading, Success, Error

#### DestinationSelector
**Purpose:** Organization and app selection
**Design References:** Design Spec State 2
**Data Requirements:** Organizations list, apps list, lock status
**States:** Loading, Success, NoApps, Error

#### MergeConfiguration
**Purpose:** Multi-tab item selection interface
**Design References:** Design Spec State 3
**Data Requirements:** Screens, data sources, files, settings
**States:** Loading, Success, Empty, Error, LockWarning

#### MergeReview
**Purpose:** Final review before merge
**Design References:** Design Spec State 4
**Data Requirements:** Merge preview (copy/overwrite/conflict)
**States:** Loading, Success, Conflicts, LimitWarnings

#### MergeProgress
**Purpose:** Real-time merge monitoring
**Design References:** Design Spec State 5
**Data Requirements:** Real-time merge status updates
**States:** InProgress, Error

#### MergeComplete
**Purpose:** Merge results and summary
**Design References:** Design Spec State 6
**Data Requirements:** Merge results, issues, next steps
**States:** Success, PartialSuccess, Error

### Tab Components (for MergeConfiguration)

#### ScreensTab
**Purpose:** Screen selection with associations
**Features:**
- Table with search, sort, pagination
- Expandable rows for associated DS/files
- Preview icon
- Selection checkboxes

#### DataSourcesTab
**Purpose:** Data source selection with copy mode
**Features:**
- Table with search, sort, filter, pagination
- Copy mode dropdown (structure only / full)
- Global dependency indicators
- Associated screens/files

#### FilesTab
**Purpose:** File and folder selection
**Features:**
- Table with search, sort, filter, pagination
- Folder copy options
- Preview icons
- Unused file indicators

#### SettingsTab
**Purpose:** App-level configuration selection
**Features:**
- Checkboxes with descriptions
- Link to detailed settings list
- Warning messages

### UI Components

#### DataTable
**Purpose:** Reusable table with advanced features

**Design References:** PRD Tabular UI Library (lines 167-182), Design Spec Component Specifications (lines 622-646)

**Features:**
- Clear column headings
- Pagination (25, 50, 100, Show all)
- Global search
- Column sorting (asc/desc)
- Responsive design (mobile cards, tablet/desktop tables)
- Loading indicators
- Bulk selection (select all, individual)
- Partial selection indicator (indeterminate checkbox)
- Custom cell UI (dropdowns, badges, icons)
- Nested rows (expandable)
- Empty state message
- Events: row-click, selection-change, sort-change, page-change

**Props:**
```javascript
{
  columns: Array,             // [{ key: 'name', label: 'Name', sortable: true }]
  data: Array,               // Row data
  selectable: Boolean,       // Show checkboxes
  expandable: Boolean,       // Allow row expansion
  loading: Boolean,          // Show loading state
  pagination: Object,        // { page: 1, perPage: 25 }
  searchable: Boolean        // Show search box
}
```

#### StatusBadge
**Purpose:** Display status indicators

**Variants:**
- Copy (🟢 green)
- Overwrite (🟠 orange)
- Conflict (🔴 red)
- In Progress (🔵 blue)
- Success (✓ green)
- Error (❌ red)

#### LockCountdown
**Purpose:** Display lock expiration timer

**States:**
- Normal (> 5 min): No display
- Warning (< 5 min): Banner with extend button
- Critical (< 2 min): Modal with countdown timer

**Props:**
```javascript
{
  lockedUntil: Number,       // Timestamp
  onExtend: Function         // Extend lock callback
}
```

### Feedback Components

#### NotificationToast
**Purpose:** Temporary feedback messages

**Types:** Success, Warning, Error, Info
**Behavior:** Auto-dismiss (5s) with manual close

**Design References:** Design Spec Status Message Component

#### ModalDialog
**Purpose:** Confirmations and alerts

**Variants:**
- Confirm (with OK/Cancel)
- Alert (with OK)
- Custom content

#### WarningBanner
**Purpose:** Persistent warning messages

**Types:**
- Info (blue)
- Warning (orange)
- Error (red)

## Responsive Design Strategy

### Breakpoints
```javascript
{
  mobile: '320px',    // Base mobile
  tablet: '768px',    // Tablet portrait
  desktop: '1024px',  // Desktop
  wide: '1440px'      // Wide screens
}
```

### Layout Patterns

#### Mobile (< 768px)
- Single column layouts
- Stacked navigation
- Full-width tables convert to cards
- Hamburger menu for tabs
- Bottom-fixed action buttons

#### Tablet (768px - 1024px)
- Two-column layouts
- Tab navigation visible
- Tables with horizontal scroll
- Side-by-side modals

#### Desktop (> 1024px)
- Multi-column layouts
- Full table views
- Persistent navigation
- Larger modals

### Tailwind Responsive Classes

```vue
<!-- Mobile-first responsive example -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="w-full md:w-1/2">
    Left column
  </div>
  <div class="w-full md:w-1/2">
    Right column
  </div>
</div>

<!-- Hide/show based on breakpoint -->
<nav class="hidden lg:block">Desktop nav</nav>
<button class="lg:hidden">Mobile menu</button>

<!-- Responsive text and spacing -->
<h1 class="text-xl md:text-2xl lg:text-3xl px-4 md:px-6 lg:px-8">
  Responsive heading
</h1>
```

## Theming & Customization

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{vue,js,html}',
    './build.html'
  ],
  theme: {
    extend: {
      colors: {
        // Fliplet Brand Colors
        primary: {
          DEFAULT: '#00abd1',
          50: '#e6f7fb',
          100: '#b3e7f4',
          500: '#00abd1',
          600: '#0095b8',
          700: '#00809f',
        },
        secondary: {
          DEFAULT: '#eae9ec',
          500: '#d4d3d8',
          700: '#a8a7af',
        },
        accent: {
          DEFAULT: '#36344c',
          500: '#36344c',
          700: '#242333',
        },
        // Semantic Colors
        success: '#19cd9d',
        warning: '#ed9119',
        error: '#e03629',
        info: '#413e5b',
      },
      fontFamily: {
        sans: ['Open Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        base: '14px',
      },
      spacing: {
        unit: '8px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
```

### Common Tailwind Patterns

#### Buttons
```vue
<!-- Primary -->
<button class="bg-primary hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Primary Action
</button>

<!-- Secondary -->
<button class="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors">
  Secondary Action
</button>

<!-- Danger -->
<button class="bg-error hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Delete
</button>
```

#### Cards
```vue
<!-- Basic Card -->
<div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  <h3 class="text-lg font-semibold text-gray-900 mb-2">Card Title</h3>
  <p class="text-gray-600">Content</p>
</div>
```

#### Alerts
```vue
<!-- Success Alert -->
<div class="bg-success/10 border border-success rounded-lg p-4 flex items-start gap-3">
  <CheckCircle2 class="w-5 h-5 text-success flex-shrink-0" />
  <div>
    <h4 class="font-semibold text-success-700">Success!</h4>
    <p class="text-sm text-success-700">Operation completed successfully.</p>
  </div>
</div>
```

## Interaction Patterns

### Form Interactions
- **Inline Validation:** Real-time feedback as users interact
- **Error Prevention:** Disable submit until valid
- **Clear Error Messages:** Specific, actionable error text
- **Progress Indication:** Multi-step form progress

### Data Loading
- **Skeleton Screens:** Show layout structure while loading
- **Progressive Loading:** Load critical content first
- **Optimistic Updates:** Immediate UI feedback
- **Error Recovery:** Clear retry mechanisms

### Navigation
- **Breadcrumbs:** Clear location indication
- **Tab Navigation:** For related content sections
- **Pagination:** For large data sets
- **Search:** Global and contextual search

## Accessibility Requirements

### WCAG 2.1 AA Compliance

- **Color Contrast:** 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Focus Indicators:** Clear visual focus states
- **Screen Reader Support:** Proper ARIA labels and landmarks
- **Alternative Text:** Alt text for images/icons

### Implementation Guidelines

```vue
<!-- Accessible navigation -->
<nav role="navigation" aria-label="Main navigation">
  <ul role="list">
    <li v-for="item in navItems" :key="item.id">
      <a
        :href="item.url"
        :aria-current="item.active ? 'page' : null"
        class="focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {{ item.label }}
      </a>
    </li>
  </ul>
</nav>

<!-- Accessible form -->
<form @submit.prevent="handleSubmit">
  <label for="app-name" class="block text-sm font-medium text-gray-700">
    App Name
  </label>
  <input
    id="app-name"
    type="text"
    v-model="appName"
    aria-required="true"
    aria-invalid="hasError"
    aria-describedby="app-name-error"
    class="mt-1 block w-full rounded border-gray-300 focus:border-primary focus:ring-primary"
  />
  <p
    v-if="hasError"
    id="app-name-error"
    class="mt-1 text-sm text-error"
    role="alert"
  >
    {{ errorMessage }}
  </p>
</form>
```

## Performance Optimization

### Loading Strategy
- **Code Splitting:** Lazy load tab components
- **Image Optimization:** Use loading="lazy" for images
- **Virtual Scrolling:** For tables with > 500 rows
- **Debounced Inputs:** Prevent excessive API calls (300ms delay)

### Runtime Performance
- **Memoization:** Cache expensive computations
- **Throttled Updates:** Limit real-time update frequency
- **Efficient Rendering:** Minimize re-renders with proper component structure

## Error Handling & Feedback

### Error States
- **Network Errors:** "Connection lost" message with retry
- **Validation Errors:** Inline field-level messages
- **System Errors:** User-friendly error pages
- **Permission Errors:** Clear access denied messaging

### User Feedback
- **Success Confirmations:** Toast notifications
- **Progress Indicators:** For long-running operations
- **Undo Actions:** Where appropriate (cancel before merge)
- **Help Text:** Contextual assistance and tooltips

## Mock-First Development Strategy

### Philosophy

**UI development should never be blocked by middleware availability.**

- **Independent Development**: UI can be built, tested, and iterated without middleware
- **Progressive Integration**: Start with mocks, swap to middleware when ready
- **Design Review Enablement**: Stakeholders see working UI without functional backend
- **Parallel Development**: UI and middleware teams work simultaneously
- **Rapid Prototyping**: Iterate on UI design without backend concerns
- **Realistic Testing**: Test with comprehensive mock scenarios including errors and edge cases

### Configuration-Based Mode Switching

```javascript
// src/config/ui-config.js
const UIConfig = {
  // Development mode: 'mock' | 'middleware' | 'hybrid'
  mode: 'mock',

  // Mock behavior settings
  mock: {
    delay: 500,           // Simulate network latency (ms)
    errorRate: 0.1,       // 10% random error rate for testing
    enableErrors: true,   // Show error scenarios
    logRequests: true     // Console log all data requests
  },

  // Toggle modes easily during development
  useMockData: function() {
    this.mode = 'mock';
    console.log('📦 Using mock data');
  },

  useMiddleware: function() {
    this.mode = 'middleware';
    console.log('⚡ Using middleware');
  },

  useHybrid: function(mockServices = []) {
    this.mode = 'hybrid';
    this.hybridMockServices = mockServices;
    console.log('🔀 Using hybrid mode:', mockServices);
  }
};

// Export for use in components
window.UIConfig = UIConfig;

// Quick toggle in browser console:
// UIConfig.useMockData()
// UIConfig.useMiddleware()
// UIConfig.useHybrid(['locks', 'validation'])
```

### Data Service Abstraction Layer

All UI components access data through a unified `DataService` that automatically switches between mock and real middleware:

```javascript
// src/services/DataService.js

/**
 * Data Service Abstraction Layer
 * Provides unified interface for data operations with configurable backend
 */
class DataService {
  constructor() {
    this.config = window.UIConfig;
    this.mockService = new MockDataService();
    this.middlewareService = window.FlipletAppMerge?.middleware;
  }

  /**
   * Get current mode from config
   */
  get mode() {
    return this.config.mode;
  }

  /**
   * Check if service should use mock data
   */
  shouldUseMock(serviceName) {
    if (this.mode === 'mock') return true;
    if (this.mode === 'middleware') return false;
    if (this.mode === 'hybrid') {
      return this.config.hybridMockServices?.includes(serviceName);
    }
    return false;
  }

  /**
   * Fetch apps for organization
   */
  async fetchApps(options = {}) {
    if (this.shouldUseMock('apps')) {
      return this.mockService.fetchApps(options);
    }

    if (!this.middlewareService) {
      console.warn('Middleware not available, falling back to mock data');
      return this.mockService.fetchApps(options);
    }

    return this.middlewareService.api.apps.fetchApps(options);
  }

  /**
   * Fetch screens for app
   */
  async fetchScreens(appId, options = {}) {
    if (this.shouldUseMock('screens')) {
      return this.mockService.fetchScreens(appId, options);
    }

    return this.middlewareService.api.screens.fetchScreens(appId, options);
  }

  /**
   * Fetch data sources for app
   */
  async fetchDataSources(appId, options = {}) {
    if (this.shouldUseMock('dataSources')) {
      return this.mockService.fetchDataSources(appId, options);
    }

    return this.middlewareService.api.dataSources.fetchDataSources(appId, options);
  }

  /**
   * Lock apps for merge
   */
  async lockApps(sourceAppId, destinationAppId) {
    if (this.shouldUseMock('locks')) {
      return this.mockService.lockApps(sourceAppId, destinationAppId);
    }

    return this.middlewareService.api.locks.lockApps(sourceAppId, destinationAppId);
  }

  /**
   * Initiate merge
   */
  async initiateMerge(mergeConfig) {
    if (this.shouldUseMock('merge')) {
      return this.mockService.initiateMerge(mergeConfig);
    }

    return this.middlewareService.controllers.merge.initiateMerge(mergeConfig);
  }

  /**
   * Subscribe to events
   */
  on(eventName, callback) {
    if (this.shouldUseMock('events')) {
      return this.mockService.on(eventName, callback);
    }

    return this.middlewareService.on(eventName, callback);
  }

  /**
   * Unsubscribe from events
   */
  off(eventName, callback) {
    if (this.shouldUseMock('events')) {
      return this.mockService.off(eventName, callback);
    }

    return this.middlewareService.off(eventName, callback);
  }
}

// Create singleton instance
window.DataService = new DataService();
```

### Mock Data Infrastructure

```javascript
// src/mocks/MockDataService.js

/**
 * Mock Data Service
 * Provides realistic mock data and behavior for UI development
 */
class MockDataService {
  constructor() {
    this.config = window.UIConfig;
    this.fixtures = MockFixtures;
    this.eventListeners = {};
  }

  /**
   * Simulate network delay
   */
  async delay() {
    const ms = this.config.mock.delay || 500;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simulate random errors for testing
   */
  shouldSimulateError() {
    if (!this.config.mock.enableErrors) return false;
    return Math.random() < (this.config.mock.errorRate || 0);
  }

  /**
   * Log mock request
   */
  log(method, ...args) {
    if (this.config.mock.logRequests) {
      console.log(`📦 Mock: ${method}`, ...args);
    }
  }

  /**
   * Fetch apps
   */
  async fetchApps(options = {}) {
    this.log('fetchApps', options);
    await this.delay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to fetch apps');
    }

    let apps = [...this.fixtures.apps];

    // Apply filters
    if (options.filters?.locked === false) {
      apps = apps.filter(app => !app.lockedUntil);
    }

    if (options.filters?.publisher === true) {
      apps = apps.filter(app => app.hasPublisherRights);
    }

    return { apps, total: apps.length };
  }

  /**
   * Fetch screens
   */
  async fetchScreens(appId, options = {}) {
    this.log('fetchScreens', appId, options);
    await this.delay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to fetch screens');
    }

    return {
      screens: this.fixtures.screens,
      total: this.fixtures.screens.length
    };
  }

  /**
   * Fetch data sources
   */
  async fetchDataSources(appId, options = {}) {
    this.log('fetchDataSources', appId, options);
    await this.delay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to fetch data sources');
    }

    return {
      dataSources: this.fixtures.dataSources,
      total: this.fixtures.dataSources.length
    };
  }

  /**
   * Lock apps
   */
  async lockApps(sourceAppId, destinationAppId) {
    this.log('lockApps', sourceAppId, destinationAppId);
    await this.delay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to lock apps');
    }

    return {
      success: true,
      lockedUntil: Date.now() + (15 * 60 * 1000), // 15 minutes
      sourceAppId,
      destinationAppId
    };
  }

  /**
   * Initiate merge
   */
  async initiateMerge(mergeConfig) {
    this.log('initiateMerge', mergeConfig);
    await this.delay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to initiate merge');
    }

    const mergeId = 'mock-merge-' + Date.now();

    // Simulate merge progress events
    setTimeout(() => this.emit('merge:status-updated', {
      mergeId,
      status: 'in-progress',
      progress: 0.25,
      message: 'Copying files...'
    }), 1000);

    setTimeout(() => this.emit('merge:status-updated', {
      mergeId,
      status: 'in-progress',
      progress: 0.5,
      message: 'Creating data sources...'
    }), 2000);

    setTimeout(() => this.emit('merge:status-updated', {
      mergeId,
      status: 'in-progress',
      progress: 0.75,
      message: 'Copying screens...'
    }), 3000);

    setTimeout(() => this.emit('merge:status-updated', {
      mergeId,
      status: 'complete',
      progress: 1.0,
      message: 'Merge complete!'
    }), 4000);

    return {
      success: true,
      mergeId
    };
  }

  /**
   * Event system
   */
  on(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
  }

  off(eventName, callback) {
    if (!this.eventListeners[eventName]) return;
    this.eventListeners[eventName] = this.eventListeners[eventName]
      .filter(cb => cb !== callback);
  }

  emit(eventName, data) {
    if (!this.eventListeners[eventName]) return;
    this.eventListeners[eventName].forEach(callback => callback(data));
  }
}
```

### Mock Data Fixtures

```javascript
// src/mocks/fixtures.js

const MockFixtures = {
  /**
   * Apps for destination selection
   */
  apps: [
    {
      id: 123,
      name: 'Production App',
      organizationId: 1,
      organizationName: 'Acme Corp',
      lockedUntil: null,
      updatedAt: '2025-01-15T10:30:00Z',
      isLive: true,
      hasPublisherRights: true
    },
    {
      id: 456,
      name: 'Staging App',
      organizationId: 1,
      organizationName: 'Acme Corp',
      lockedUntil: null,
      updatedAt: '2025-01-14T15:45:00Z',
      isLive: false,
      hasPublisherRights: true
    },
    {
      id: 789,
      name: 'Dev App (Locked)',
      organizationId: 1,
      organizationName: 'Acme Corp',
      lockedUntil: Date.now() + 600000, // Locked for 10 more minutes
      updatedAt: '2025-01-13T09:20:00Z',
      isLive: false,
      hasPublisherRights: false
    }
  ],

  /**
   * Screens for merge configuration
   */
  screens: [
    {
      id: 1,
      name: 'Home Screen',
      pageId: 'page-1',
      updatedAt: '2025-01-10T12:00:00Z',
      associatedDataSources: [1, 2],
      associatedFiles: [5, 6],
      hasPreview: true
    },
    {
      id: 2,
      name: 'Login Screen',
      pageId: 'page-2',
      updatedAt: '2025-01-09T14:30:00Z',
      associatedDataSources: [3],
      associatedFiles: [7],
      hasPreview: true
    },
    {
      id: 3,
      name: 'Settings Screen',
      pageId: 'page-3',
      updatedAt: '2025-01-08T16:45:00Z',
      associatedDataSources: [],
      associatedFiles: [8, 9],
      hasPreview: false
    }
  ],

  /**
   * Data sources for merge configuration
   */
  dataSources: [
    {
      id: 1,
      name: 'Users',
      dataSourceType: null,
      updatedAt: '2025-01-12T10:00:00Z',
      entries: 150,
      associatedScreens: [1],
      associatedFiles: [],
      isGlobalDependency: false
    },
    {
      id: 2,
      name: 'Products',
      dataSourceType: null,
      updatedAt: '2025-01-11T11:30:00Z',
      entries: 523,
      associatedScreens: [1, 2],
      associatedFiles: [10],
      isGlobalDependency: true
    },
    {
      id: 3,
      name: 'Orders',
      dataSourceType: null,
      updatedAt: '2025-01-10T09:15:00Z',
      entries: 1247,
      associatedScreens: [2],
      associatedFiles: [],
      isGlobalDependency: false
    }
  ],

  /**
   * Files for merge configuration
   */
  files: [
    {
      id: 5,
      name: 'logo.png',
      path: '/assets/images/',
      type: 'image',
      addedAt: '2025-01-05T08:00:00Z',
      associatedScreens: [1, 2],
      associatedDataSources: [],
      isGlobalLibrary: false,
      hasPreview: true
    },
    {
      id: 6,
      name: 'banner.jpg',
      path: '/assets/images/',
      type: 'image',
      addedAt: '2025-01-04T14:20:00Z',
      associatedScreens: [1],
      associatedDataSources: [],
      isGlobalLibrary: false,
      hasPreview: true
    },
    {
      id: 10,
      name: 'analytics.js',
      path: '/assets/js/',
      type: 'javascript',
      addedAt: '2025-01-03T10:30:00Z',
      associatedScreens: [],
      associatedDataSources: [2],
      isGlobalLibrary: true,
      hasPreview: false
    }
  ],

  /**
   * Source app info
   */
  sourceApp: {
    id: 100,
    name: 'Source App',
    organizationId: 1,
    organizationName: 'Acme Corp',
    region: 'EU',
    isPublished: true,
    updatedAt: '2025-01-15T12:00:00Z',
    updatedBy: 'John Smith'
  }
};

window.MockFixtures = MockFixtures;
```

### Test Scenarios

```javascript
// src/mocks/scenarios.js

const TestScenarios = {
  /**
   * Simulate successful merge flow
   */
  async simulateSuccess() {
    UIConfig.useMockData();
    UIConfig.mock.enableErrors = false;
    console.log('✅ Testing success scenario');
  },

  /**
   * Simulate network errors
   */
  async simulateNetworkError() {
    UIConfig.useMockData();
    UIConfig.mock.errorRate = 1.0; // 100% errors
    UIConfig.mock.enableErrors = true;
    console.log('❌ Testing error scenario');
  },

  /**
   * Simulate slow network
   */
  async simulateSlowNetwork() {
    UIConfig.useMockData();
    UIConfig.mock.delay = 3000; // 3 second delay
    console.log('🐌 Testing slow network');
  },

  /**
   * Simulate locked apps
   */
  async simulateLockedApps() {
    UIConfig.useMockData();
    MockFixtures.apps.forEach(app => {
      app.lockedUntil = Date.now() + 600000; // Lock all apps
    });
    console.log('🔒 Testing locked apps scenario');
  },

  /**
   * Simulate empty states
   */
  async simulateEmptyState() {
    UIConfig.useMockData();
    MockFixtures.apps = [];
    MockFixtures.screens = [];
    MockFixtures.dataSources = [];
    MockFixtures.files = [];
    console.log('📭 Testing empty state');
  },

  /**
   * Reset to normal
   */
  async reset() {
    UIConfig.useMockData();
    UIConfig.mock.delay = 500;
    UIConfig.mock.errorRate = 0.1;
    UIConfig.mock.enableErrors = true;
    console.log('🔄 Reset to normal mock behavior');
  }
};

window.TestScenarios = TestScenarios;

// Usage in browser console:
// TestScenarios.simulateNetworkError()
// TestScenarios.simulateSlowNetwork()
// TestScenarios.reset()
```

### Component Implementation Pattern

Components use DataService abstraction - never directly access middleware:

```vue
<script>
export default {
  name: 'DestinationSelector',

  data() {
    return {
      dataService: window.DataService, // Use abstraction layer
      apps: [],
      loading: false,
      error: null
    };
  },

  async created() {
    await this.loadApps();
  },

  methods: {
    async loadApps() {
      try {
        this.loading = true;
        this.error = null;

        // DataService automatically uses mock or middleware based on UIConfig
        const result = await this.dataService.fetchApps({
          organizationId: this.selectedOrgId,
          filters: {
            publisher: true,
            mergeable: true,
            locked: false
          },
          fields: ['id', 'name', 'organizationId', 'lockedUntil', 'updatedAt'],
          sort: { field: 'name', order: 'asc' }
        });

        this.apps = result.apps;
      } catch (err) {
        this.error = err.message;
        console.error('Failed to load apps:', err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

### Progressive Integration Strategy

```javascript
// Phase 1: Pure mock development (UI team working independently)
UIConfig.useMockData();

// Phase 2: Test one service at a time as middleware becomes ready
UIConfig.useHybrid(['locks', 'validation']); // These still use mock, rest use middleware

// Phase 3: Gradually integrate more services
UIConfig.useHybrid(['validation']); // Only validation still mocked

// Phase 4: Full middleware integration
UIConfig.useMiddleware();
```

### Benefits

✅ **Parallel Development** - UI and middleware teams work simultaneously without blocking
✅ **Rapid Prototyping** - Iterate on UI without backend dependencies
✅ **Stakeholder Demos** - Show working UI with realistic data immediately
✅ **Progressive Integration** - Test integration one service at a time
✅ **Better Testing** - Test all UI states (loading, errors, empty) easily
✅ **Component Isolation** - Zero coupling to middleware
✅ **Easy Debugging** - Toggle modes in browser console on the fly

## Integration with Middleware

### Migration from Mock to Middleware

When middleware is ready, integration is seamless thanks to the DataService abstraction:

```javascript
// Development: Pure mock (default)
UIConfig.useMockData();

// Testing: Hybrid mode - test specific services incrementally
UIConfig.useHybrid(['locks']); // Lock service still mocked, rest uses middleware

// Production: Full middleware
UIConfig.useMiddleware();
```

### State Management Integration

```javascript
// Components use DataService - works with both mock and middleware
export default {
  data() {
    return {
      dataService: window.DataService,
      mergeStatus: null,
      loading: false,
      error: null
    };
  },

  mounted() {
    // Event subscription works the same for mock and middleware
    this.dataService.on('merge:status-updated', this.handleStatusUpdate);
    this.dataService.on('lock:expiring', this.handleLockExpiring);
  },

  beforeUnmount() {
    this.dataService.off('merge:status-updated', this.handleStatusUpdate);
    this.dataService.off('lock:expiring', this.handleLockExpiring);
  },

  methods: {
    handleStatusUpdate(status) {
      this.mergeStatus = status;
    },

    handleLockExpiring(data) {
      this.showLockWarning = true;
      this.lockExpiresAt = data.expiresAt;
    }
  }
};
```

## Product Analytics & Audit Logging

### Analytics Strategy

#### Primary Success Metrics
- **Feature Adoption:** % of eligible users who initiate merge
- **Task Completion Rate:** % of merges successfully completed
- **Time to Complete:** Average time from start to finish
- **Error Rate:** % of merges encountering errors
- **User Satisfaction:** Post-merge feedback scores

#### Analytics Events

**User Journey Events:**
```javascript
// Dashboard viewed
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'dashboard_viewed',
  label: 'Source App ID: 123'
});

// Merge initiated
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'merge_initiated',
  label: 'Source: 123, Dest: 456',
  value: 1
});

// Merge completed
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'merge_completed',
  label: 'Duration: 240s',
  value: 1
});
```

**Feature Usage Events:**
```javascript
// Tab navigation
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'tab_switched',
  label: 'Screens Tab'
});

// Item selection
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'items_selected',
  label: 'Screens: 10, DS: 5, Files: 20'
});

// Lock extended
Fliplet.App.Analytics.event({
  category: 'app_merge',
  action: 'lock_extended',
  label: 'Extensions: 2'
});
```

#### Audit Logging

**Critical Actions (Audit Log):**
```javascript
// Merge initiated
Fliplet.App.Logs.create({
  action: 'App merge initiated',
  source_app_id: 123,
  destination_app_id: 456,
  selected_items: {
    screens: [1, 2, 3],
    dataSources: [4, 5],
    files: [6, 7, 8]
  },
  timestamp: new Date().toISOString()
}, 'app.merge.initiated');

// Merge completed
Fliplet.App.Logs.create({
  action: 'App merge completed',
  merge_id: 789,
  result_summary: {
    screens: { copied: 5, overwritten: 3 },
    dataSources: { copied: 2, overwritten: 1 },
    files: { copied: 10, replaced: 5 }
  },
  issues: [],
  timestamp: new Date().toISOString()
}, 'app.merge.completed');

// Lock acquired
Fliplet.App.Logs.create({
  action: 'Apps locked for merge',
  source_app_id: 123,
  destination_app_id: 456,
  locked_until: 1718650400000,
  timestamp: new Date().toISOString()
}, 'app.lock.acquired');
```

## Implementation Guidelines

### Package Dependencies Setup

```json
{
  "dependencies": {
    "vue": "^3.5.13",
    "lucide-vue-next": "^0.x.x",
    "core-js": "^3.39.0",
    "regenerator-runtime": "^0.14.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.x.x",
    "postcss": "^8.x.x",
    "autoprefixer": "^10.x.x",
    "@tailwindcss/forms": "^0.5.x",
    "gulp": "^5.0.0",
    "gulp-sass": "^5.1.0",
    "sass": "^1.81.0",
    "webpack": "^5.96.1",
    "vue-loader": "^17.4.2",
    "@babel/core": "^7.26.0",
    "@babel/preset-env": "^7.26.0"
  }
}
```

### Widget Configuration

```json
{
  "name": "App Merge",
  "package": "com.fliplet.app-merge",
  "build": {
    "dependencies": [
      "fliplet-core"
    ],
    "assets": [
      "dist/css/index.css",
      "dist/app.js"
    ]
  }
}
```

### Build Process

1. **Tailwind Compilation:** SCSS with Tailwind directives → `dist/css/index.css`
2. **Vue Bundling:** Vue components + lucide-vue-next → `dist/app.js`
3. **Asset Declaration:** Only compiled files in widget.json

### File Structure

```
/
├── src/
│   ├── config/
│   │   └── ui-config.js            # UIConfig for mode switching (mock/middleware/hybrid)
│   ├── services/
│   │   └── DataService.js          # Data abstraction layer
│   ├── mocks/
│   │   ├── MockDataService.js      # Mock data service implementation
│   │   ├── fixtures.js             # Mock data fixtures
│   │   └── scenarios.js            # Test scenarios (errors, loading, empty states)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.vue
│   │   │   ├── ProgressIndicator.vue
│   │   ├── pages/
│   │   │   ├── MergeDashboard.vue
│   │   │   ├── DestinationSelector.vue
│   │   │   ├── MergeConfiguration.vue
│   │   │   ├── MergeReview.vue
│   │   │   ├── MergeProgress.vue
│   │   │   ├── MergeComplete.vue
│   │   ├── tabs/
│   │   │   ├── ScreensTab.vue
│   │   │   ├── DataSourcesTab.vue
│   │   │   ├── FilesTab.vue
│   │   │   ├── SettingsTab.vue
│   │   ├── ui/
│   │   │   ├── DataTable.vue
│   │   │   ├── StatusBadge.vue
│   │   │   ├── LockCountdown.vue
│   │   ├── feedback/
│   │   │   ├── NotificationToast.vue
│   │   │   ├── ModalDialog.vue
│   │   │   ├── WarningBanner.vue
│   ├── scss/
│   │   └── index.scss
│   ├── Application.vue
│   └── main.js
├── dist/
│   ├── css/
│   │   └── index.css
│   └── app.js
├── build.html
├── tailwind.config.js
├── postcss.config.js
├── gulpfile.js
├── package.json
└── widget.json
```

## Implementation Priorities

### Phase 1: Mock Infrastructure & Core Structure
1. **Mock-First Infrastructure:**
   - UIConfig configuration (src/config/ui-config.js)
   - DataService abstraction layer (src/services/DataService.js)
   - MockDataService implementation (src/mocks/MockDataService.js)
   - Mock fixtures for all data types (src/mocks/fixtures.js)
   - Test scenarios helper (src/mocks/scenarios.js)
2. **Core UI Components:**
   - AppShell layout component
   - ProgressIndicator component
   - MergeDashboard page (using DataService)
   - DestinationSelector page with app table (using DataService)
3. **Basic Navigation:**
   - Navigation flow between pages
   - State management for current step
4. **Verification:**
   - Test all UI flows with pure mock data
   - Verify mode switching works (mock/middleware/hybrid)

### Phase 2: Configuration UI (Configure Settings → Review)
1. MergeConfiguration page with tabs (using DataService)
2. DataTable component (reusable)
3. ScreensTab, DataSourcesTab, FilesTab, SettingsTab (all using DataService)
4. Selection logic and state management
5. MergeReview page with conflict detection (using DataService)
6. Lock countdown component
7. **Verification:**
   - Test with mock data for all tabs
   - Test error scenarios and empty states
   - Verify hybrid mode works (test one tab with real middleware)

### Phase 3: Execution & Results (Progress → Complete)
1. MergeProgress page with real-time updates (using DataService)
2. MergeComplete page with summary (using DataService)
3. NotificationToast component
4. ModalDialog component
5. Error handling and recovery
6. Analytics integration
7. **Final Integration:**
   - Switch from mock to full middleware
   - End-to-end testing with real API
   - Performance optimization

## Success Metrics

### User Experience
- **Task Completion:** 95%+ successful merges
- **Time to Complete:** < 10 minutes configuration time
- **Error Rate:** < 5% user-caused errors
- **Satisfaction:** 4.5+ out of 5 rating

### Technical
- **Load Time:** < 2 seconds initial load
- **Table Rendering:** < 1 second for 500 items
- **Accessibility:** 100% WCAG 2.1 AA compliance
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)

### Design System
- **Component Reuse:** 80%+ shared components
- **Tailwind Coverage:** 95%+ styling via Tailwind utilities
- **Documentation:** 100% components documented
- **Visual Consistency:** Style guide adherence

## Next Steps

This UI/UX plan should be reviewed for:
1. **User Experience:** Intuitive workflows and clear interactions
2. **Visual Design:** Consistent with Fliplet brand
3. **Technical Feasibility:** Vue 3.5.13 + Tailwind implementation
4. **Accessibility:** WCAG 2.1 AA compliance
5. **Performance:** Optimal loading and runtime

Once approved, this plan will be converted to implementation tasks.
