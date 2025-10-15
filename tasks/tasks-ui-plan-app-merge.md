# Implementation Tasks: App Merge Widget UI

> **Note:** This task list is generated from `ui-plan-app-merge.md` and provides a step-by-step implementation guide for the App Merge Widget user interface.

## Relevant Files

### Configuration Files
- `tailwind.config.js` - Tailwind CSS configuration with Fliplet brand colors and design tokens
- `postcss.config.js` - PostCSS configuration for Tailwind processing
- `package.json` - Updated with Tailwind CSS and lucide-vue-next dependencies
- `gulpfile.js` - Updated build process to compile Tailwind CSS
- `src/scss/index.scss` - Main SCSS file with Tailwind directives

### Core Application Files
- `src/Application.vue` - Root Vue component with routing/state logic
- `src/main.js` - Vue app initialization with global middleware integration

### Layout Components
- `src/components/layout/AppShell.vue` - Main widget wrapper with header, progress, content areas
- `src/components/layout/AppShell.test.js` - Unit tests for AppShell
- `src/components/layout/ProgressIndicator.vue` - Multi-step progress visualization
- `src/components/layout/ProgressIndicator.test.js` - Unit tests for ProgressIndicator

### Page Components
- `src/components/pages/MergeDashboard.vue` - Initial dashboard view (State 1)
- `src/components/pages/MergeDashboard.test.js` - Unit tests for MergeDashboard
- `src/components/pages/DestinationSelector.vue` - Organization and app selection (State 2)
- `src/components/pages/DestinationSelector.test.js` - Unit tests for DestinationSelector
- `src/components/pages/MergeConfiguration.vue` - Multi-tab item selection (State 3)
- `src/components/pages/MergeConfiguration.test.js` - Unit tests for MergeConfiguration
- `src/components/pages/MergeReview.vue` - Final review before merge (State 4)
- `src/components/pages/MergeReview.test.js` - Unit tests for MergeReview
- `src/components/pages/MergeProgress.vue` - Real-time merge monitoring (State 5)
- `src/components/pages/MergeProgress.test.js` - Unit tests for MergeProgress
- `src/components/pages/MergeComplete.vue` - Merge results and summary (State 6)
- `src/components/pages/MergeComplete.test.js` - Unit tests for MergeComplete

### Tab Components
- `src/components/tabs/ScreensTab.vue` - Screen selection with associations
- `src/components/tabs/ScreensTab.test.js` - Unit tests for ScreensTab
- `src/components/tabs/DataSourcesTab.vue` - Data source selection with copy mode
- `src/components/tabs/DataSourcesTab.test.js` - Unit tests for DataSourcesTab
- `src/components/tabs/FilesTab.vue` - File and folder selection
- `src/components/tabs/FilesTab.test.js` - Unit tests for FilesTab
- `src/components/tabs/SettingsTab.vue` - App-level configuration selection
- `src/components/tabs/SettingsTab.test.js` - Unit tests for SettingsTab

### UI Components
- `src/components/ui/DataTable.vue` - Reusable table with advanced features
- `src/components/ui/DataTable.test.js` - Unit tests for DataTable
- `src/components/ui/StatusBadge.vue` - Status indicator component
- `src/components/ui/StatusBadge.test.js` - Unit tests for StatusBadge
- `src/components/ui/LockCountdown.vue` - Lock expiration timer
- `src/components/ui/LockCountdown.test.js` - Unit tests for LockCountdown

### Feedback Components
- `src/components/feedback/NotificationToast.vue` - Toast notification system
- `src/components/feedback/NotificationToast.test.js` - Unit tests for NotificationToast
- `src/components/feedback/ModalDialog.vue` - Modal/dialog component
- `src/components/feedback/ModalDialog.test.js` - Unit tests for ModalDialog
- `src/components/feedback/WarningBanner.vue` - Warning banner component
- `src/components/feedback/WarningBanner.test.js` - Unit tests for WarningBanner

### Utilities
- `src/utils/formatters.js` - Formatting utility functions
- `src/utils/formatters.test.js` - Unit tests for formatters
- `src/utils/validators.js` - Validation utility functions
- `src/utils/validators.test.js` - Unit tests for validators
- `src/utils/accessibility.js` - Accessibility helper functions
- `src/utils/accessibility.test.js` - Unit tests for accessibility helpers

### Test Mocks
- `tests/mocks/vue-components.js` - Vue component test mocks
- `tests/mocks/middleware.js` - Middleware integration mocks

### Notes

- Unit tests are placed alongside component files (e.g., `DataTable.vue` and `DataTable.test.js`)
- Use `npm test` to run all tests
- Use `npm run test:watch` for development
- Use `npm run test:coverage` to check coverage
- Tailwind CSS is compiled through Gulp into `dist/css/index.css`
- All components use Vue 3.5.13 Options API for Fliplet compatibility
- Components integrate with middleware through `window.FlipletAppMerge.middleware`

## Tasks

- [ ] 1.0 **Setup Tailwind CSS and Dependencies**
- [ ] 2.0 **Implement Core Layout Components**
- [ ] 3.0 **Implement Reusable UI Components**
- [ ] 4.0 **Implement Feedback Components**
- [ ] 5.0 **Implement Page Components (States 1-2: Dashboard & Destination Selector)**
- [ ] 6.0 **Implement Page Components (State 3: Configuration with Tabs)**
- [ ] 7.0 **Implement Page Components (States 4-6: Review, Progress, Complete)**
- [ ] 8.0 **Implement Application Routing and State Management**
- [ ] 9.0 **Integrate Analytics and Optional Audit Logging**
- [ ] 10.0 **Accessibility and Responsive Design Testing**
- [ ] 11.0 **Performance Optimization and Final Polish**

---

## Detailed Sub-Tasks

### 1.0 Setup Tailwind CSS and Dependencies

- [ ] 1.1 Install required npm packages
  - [ ] Run `npm install --save-dev tailwindcss postcss autoprefixer @tailwindcss/forms`
  - [ ] Run `npm install --save lucide-vue-next`
  - [ ] Verify packages are added to `package.json`

- [ ] 1.2 Create Tailwind configuration file
  - [ ] Create `tailwind.config.js` in project root
  - [ ] Configure content paths: `['./src/**/*.{vue,js,html}', './build.html']`
  - [ ] Extend theme with Fliplet brand colors (primary: #00abd1, success: #19cd9d, error: #e03629, warning: #ed9119)
  - [ ] Configure font family: Open Sans
  - [ ] Add spacing system with 8px base unit
  - [ ] Add plugins: @tailwindcss/forms

- [ ] 1.3 Create PostCSS configuration
  - [ ] Create `postcss.config.js` in project root
  - [ ] Configure Tailwind CSS plugin
  - [ ] Configure Autoprefixer plugin

- [ ] 1.4 Update SCSS entry point with Tailwind directives
  - [ ] Update `src/scss/index.scss` to include `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`
  - [ ] Add any custom component styles using `@apply` (sparingly)

- [ ] 1.5 Update Gulp build process
  - [ ] Verify `gulpfile.js` compiles SCSS with PostCSS
  - [ ] Ensure Tailwind CSS is processed during build
  - [ ] Test build: run `npm run build` and verify `dist/css/index.css` contains Tailwind utilities

- [ ] 1.6 Test Tailwind CSS integration
  - [ ] Add test Tailwind classes to `Application.vue` (e.g., `bg-primary`, `text-white`, `p-4`)
  - [ ] Run build and verify styles are applied in browser
  - [ ] Remove test classes after verification

### 2.0 Implement Core Layout Components

- [ ] 2.1 Create AppShell component
  - [ ] Create `src/components/layout/AppShell.vue`
  - [ ] Implement template: header area, progress area, main content slot, action footer
  - [ ] Define props: `title` (String), `currentStep` (Number), `totalSteps` (Number), `showProgress` (Boolean)
  - [ ] Style with Tailwind: white background, shadow, rounded corners, responsive padding
  - [ ] Add ARIA labels for accessibility (role="main", aria-labelledby)
  - [ ] Note: Close functionality handled by Studio overlay - no close button needed

- [ ] 2.2 Create AppShell tests
  - [ ] Create `src/components/layout/AppShell.test.js`
  - [ ] Test: renders title correctly
  - [ ] Test: shows/hides progress indicator based on `showProgress` prop
  - [ ] Test: renders content slot correctly
  - [ ] Test: renders action footer slot correctly
  - [ ] Run tests: `npm test AppShell.test.js`

- [ ] 2.3 Create ProgressIndicator component
  - [ ] Create `src/components/layout/ProgressIndicator.vue`
  - [ ] Implement template: horizontal step indicators with connecting lines
  - [ ] Define props: `steps` (Array of {label, completed}), `currentStep` (Number)
  - [ ] Style with Tailwind: completed (green checkmark), current (blue), upcoming (gray)
  - [ ] Implement responsive design: show icons only on mobile, icons + labels on tablet+
  - [ ] Import CheckCircle2 icon from lucide-vue-next for completed steps

- [ ] 2.4 Create ProgressIndicator tests
  - [ ] Create `src/components/layout/ProgressIndicator.test.js`
  - [ ] Test: renders correct number of steps
  - [ ] Test: applies correct classes for completed/current/upcoming states
  - [ ] Test: displays step labels
  - [ ] Run tests: `npm test ProgressIndicator.test.js`

### 3.0 Implement Reusable UI Components

- [ ] 3.1 Create DataTable component
  - [ ] Create `src/components/ui/DataTable.vue`
  - [ ] Implement template: table with thead, tbody, pagination, search, loading states
  - [ ] Define props: `columns` (Array), `data` (Array), `selectable` (Boolean), `expandable` (Boolean), `loading` (Boolean), `pagination` (Object), `searchable` (Boolean)
  - [ ] Implement search functionality with debouncing (300ms)
  - [ ] Implement column sorting (ascending/descending) with sort icons
  - [ ] Implement pagination controls (25, 50, 100, Show all)
  - [ ] Implement bulk selection with indeterminate checkbox state
  - [ ] Implement expandable rows with slot for nested content
  - [ ] Add loading skeleton for loading state
  - [ ] Add empty state message
  - [ ] Style with Tailwind: responsive table, hover effects, borders
  - [ ] Import Search, ChevronDown, ChevronUp icons from lucide-vue-next
  - [ ] Emit events: `row-click`, `selection-change`, `sort-change`, `page-change`, `search`
  - [ ] Implement responsive design: convert to cards on mobile (<768px)

- [ ] 3.2 Create DataTable tests
  - [ ] Create `src/components/ui/DataTable.test.js`
  - [ ] Test: renders columns and data correctly
  - [ ] Test: search filters data
  - [ ] Test: sorting works for all columns
  - [ ] Test: pagination changes pages
  - [ ] Test: selection emits correct events
  - [ ] Test: expandable rows toggle correctly
  - [ ] Test: loading state shows skeleton
  - [ ] Test: empty state shows message
  - [ ] Run tests: `npm test DataTable.test.js`

- [ ] 3.3 Create StatusBadge component
  - [ ] Create `src/components/ui/StatusBadge.vue`
  - [ ] Implement template: badge with icon and text
  - [ ] Define props: `status` (String: 'copy'|'overwrite'|'conflict'|'success'|'error'|'in-progress'), `label` (String)
  - [ ] Style with Tailwind: color-coded backgrounds and borders (copy: green, overwrite: orange, conflict: red)
  - [ ] Import icons: CheckCircle2 (success), AlertCircle (error), Clock (in-progress), Copy, RefreshCw from lucide-vue-next
  - [ ] Implement icon selection based on status

- [ ] 3.4 Create StatusBadge tests
  - [ ] Create `src/components/ui/StatusBadge.test.js`
  - [ ] Test: renders correct icon for each status
  - [ ] Test: applies correct color classes for each status
  - [ ] Test: displays label correctly
  - [ ] Run tests: `npm test StatusBadge.test.js`

- [ ] 3.5 Create LockCountdown component
  - [ ] Create `src/components/ui/LockCountdown.vue`
  - [ ] Implement template: warning banner with countdown timer and extend button
  - [ ] Define props: `lockedUntil` (Number timestamp), `onExtend` (Function)
  - [ ] Implement computed property for time remaining
  - [ ] Implement countdown timer with setInterval (updates every second)
  - [ ] Show warning banner when < 5 minutes remaining
  - [ ] Show critical modal when < 2 minutes remaining
  - [ ] Format time remaining as "X minutes Y seconds"
  - [ ] Style with Tailwind: warning (orange) when < 5 min, error (red) when < 2 min
  - [ ] Import Clock, AlertTriangle icons from lucide-vue-next
  - [ ] Clear interval on component unmount
  - [ ] Emit events: `extend-lock`, `lock-expired`

- [ ] 3.6 Create LockCountdown tests
  - [ ] Create `src/components/ui/LockCountdown.test.js`
  - [ ] Test: calculates time remaining correctly
  - [ ] Test: shows warning at 5 minutes
  - [ ] Test: shows critical modal at 2 minutes
  - [ ] Test: emits extend event when button clicked
  - [ ] Test: emits expired event when time reaches 0
  - [ ] Test: clears interval on unmount
  - [ ] Run tests: `npm test LockCountdown.test.js`

### 4.0 Implement Feedback Components

- [ ] 4.1 Create NotificationToast component
  - [ ] Create `src/components/feedback/NotificationToast.vue`
  - [ ] Implement template: fixed position toast container with animated toast messages
  - [ ] Define props: `type` ('success'|'warning'|'error'|'info'), `message` (String), `duration` (Number, default: 5000), `show` (Boolean)
  - [ ] Implement auto-dismiss with setTimeout
  - [ ] Add manual close button
  - [ ] Style with Tailwind: positioned fixed bottom-right, slide-in animation, color-coded by type
  - [ ] Import CheckCircle2, AlertCircle, AlertTriangle, Info icons from lucide-vue-next
  - [ ] Emit events: `close`

- [ ] 4.2 Create NotificationToast tests
  - [ ] Create `src/components/feedback/NotificationToast.test.js`
  - [ ] Test: renders with correct type styling
  - [ ] Test: displays message correctly
  - [ ] Test: auto-dismisses after duration
  - [ ] Test: emits close event when close button clicked
  - [ ] Run tests: `npm test NotificationToast.test.js`

- [ ] 4.3 Create ModalDialog component
  - [ ] Create `src/components/feedback/ModalDialog.vue`
  - [ ] Implement template: backdrop overlay, modal container, header, content slot, footer with buttons
  - [ ] Define props: `show` (Boolean), `title` (String), `confirmText` (String), `cancelText` (String), `variant` ('confirm'|'alert'|'custom')
  - [ ] Implement backdrop click to close (with confirmation if needed)
  - [ ] Implement ESC key to close
  - [ ] Style with Tailwind: centered modal, backdrop blur, shadow, responsive sizing
  - [ ] Add focus trap for accessibility
  - [ ] Import X icon from lucide-vue-next for close button
  - [ ] Emit events: `confirm`, `cancel`, `close`

- [ ] 4.4 Create ModalDialog tests
  - [ ] Create `src/components/feedback/ModalDialog.test.js`
  - [ ] Test: shows/hides based on show prop
  - [ ] Test: emits confirm event when confirm button clicked
  - [ ] Test: emits cancel event when cancel button clicked
  - [ ] Test: closes on backdrop click
  - [ ] Test: closes on ESC key press
  - [ ] Run tests: `npm test ModalDialog.test.js`

- [ ] 4.5 Create WarningBanner component
  - [ ] Create `src/components/feedback/WarningBanner.vue`
  - [ ] Implement template: banner with icon, message, and optional action button
  - [ ] Define props: `type` ('info'|'warning'|'error'), `message` (String), `dismissable` (Boolean), `actionLabel` (String)
  - [ ] Style with Tailwind: full-width banner, color-coded backgrounds, border on left
  - [ ] Import AlertTriangle, AlertCircle, Info icons from lucide-vue-next
  - [ ] Emit events: `dismiss`, `action`

- [ ] 4.6 Create WarningBanner tests
  - [ ] Create `src/components/feedback/WarningBanner.test.js`
  - [ ] Test: renders with correct type styling
  - [ ] Test: displays message correctly
  - [ ] Test: shows/hides dismiss button based on prop
  - [ ] Test: emits events correctly
  - [ ] Run tests: `npm test WarningBanner.test.js`

### 5.0 Implement Page Components (States 1-2: Dashboard & Destination Selector)

- [ ] 5.1 Create MergeDashboard component
  - [ ] Create `src/components/pages/MergeDashboard.vue`
  - [ ] Implement template: source app info card, prerequisites section, audit log link, action buttons
  - [ ] Integrate with middleware: fetch app details via `window.FlipletAppMerge.middleware.api.apps.fetchApp(appId)`
  - [ ] Display app name, ID, organization, region, published status, last modified
  - [ ] Add prerequisites text with warnings
  - [ ] Style with Tailwind: card layout, badges for publish status, spacing
  - [ ] Import FileText, ExternalLink icons from lucide-vue-next
  - [ ] Implement loading state (skeleton)
  - [ ] Implement error state
  - [ ] Check user permissions (publisher rights)
  - [ ] Check lock status and display accordingly
  - [ ] Emit events: `configure-merge`, `view-audit-log`, `cancel`

- [ ] 5.2 Create MergeDashboard tests
  - [ ] Create `src/components/pages/MergeDashboard.test.js`
  - [ ] Mock middleware API responses
  - [ ] Test: loads and displays app details correctly
  - [ ] Test: shows loading state while fetching
  - [ ] Test: shows error state on fetch failure
  - [ ] Test: disables "Configure merge" if no publisher rights
  - [ ] Test: shows lock status if app is locked
  - [ ] Test: emits events correctly
  - [ ] Run tests: `npm test MergeDashboard.test.js`

- [ ] 5.3 Create DestinationSelector component
  - [ ] Create `src/components/pages/DestinationSelector.vue`
  - [ ] Implement template: organization dropdown (if multiple orgs), app list table, action buttons
  - [ ] Integrate with middleware: fetch organizations, fetch apps for selected org
  - [ ] Use DataTable component for app list
  - [ ] Configure columns: Name, ID, Last Modified, Live Status
  - [ ] Implement search and sort functionality
  - [ ] Filter out locked apps, source app, apps without publisher rights
  - [ ] Highlight apps with duplicate names (validation error)
  - [ ] Style with Tailwind: form layout, disabled states
  - [ ] Import Building2, Search icons from lucide-vue-next
  - [ ] Implement loading states
  - [ ] Implement validation for duplicate detection
  - [ ] Emit events: `app-selected`, `back`, `cancel`

- [ ] 5.4 Create DestinationSelector tests
  - [ ] Create `src/components/pages/DestinationSelector.test.js`
  - [ ] Mock middleware API responses
  - [ ] Test: loads organizations list
  - [ ] Test: loads apps for selected organization
  - [ ] Test: filters locked apps correctly
  - [ ] Test: filters source app correctly
  - [ ] Test: detects duplicate names
  - [ ] Test: emits app-selected with correct data
  - [ ] Run tests: `npm test DestinationSelector.test.js`

### 6.0 Implement Page Components (State 3: Configuration with Tabs)

- [ ] 6.1 Create MergeConfiguration component
  - [ ] Create `src/components/pages/MergeConfiguration.vue`
  - [ ] Implement template: app direction indicator, lock warning, tab navigation, selected items counter, action buttons
  - [ ] Implement tab switching logic
  - [ ] Manage selection state across all tabs
  - [ ] Display LockCountdown component
  - [ ] Calculate total selected items count
  - [ ] Style with Tailwind: tab navigation, spacing
  - [ ] Import ArrowRight, Lock icons from lucide-vue-next
  - [ ] Emit events: `review`, `back`, `cancel`, `extend-lock`

- [ ] 6.2 Create MergeConfiguration tests
  - [ ] Create `src/components/pages/MergeConfiguration.test.js`
  - [ ] Test: switches tabs correctly
  - [ ] Test: tracks selection counts across tabs
  - [ ] Test: displays lock countdown
  - [ ] Test: emits events correctly
  - [ ] Run tests: `npm test MergeConfiguration.test.js`

- [ ] 6.3 Create ScreensTab component
  - [ ] Create `src/components/tabs/ScreensTab.vue`
  - [ ] Implement template: instructions, DataTable for screens with expandable rows
  - [ ] Integrate with middleware: fetch screens with associations
  - [ ] Configure table columns: Checkbox, Name, ID, Preview, Last Modified, Associated DS (count), Associated Files (count)
  - [ ] Implement expandable rows to show associated data sources and files
  - [ ] Implement bulk selection (select all / individual)
  - [ ] Show warning icon for screens with non-copyable components
  - [ ] Style with Tailwind
  - [ ] Import Eye, AlertTriangle icons from lucide-vue-next
  - [ ] Emit events: `selection-change`

- [ ] 6.4 Create ScreensTab tests
  - [ ] Create `src/components/tabs/ScreensTab.test.js`
  - [ ] Mock middleware API responses
  - [ ] Test: loads screens correctly
  - [ ] Test: shows associated items in expandable rows
  - [ ] Test: selection works correctly
  - [ ] Test: emits selection-change with correct data
  - [ ] Run tests: `npm test ScreensTab.test.js`

- [ ] 6.5 Create DataSourcesTab component
  - [ ] Create `src/components/tabs/DataSourcesTab.vue`
  - [ ] Implement template: instructions with live impact warning, DataTable with copy mode dropdown
  - [ ] Integrate with middleware: fetch data sources with associations
  - [ ] Configure table columns: Checkbox, Name, ID, Last Modified, Entries, Copy Mode (dropdown), Associated Screens, Associated Files, Global Dep
  - [ ] Implement copy mode dropdown per row: "Structure only" vs "Overwrite structure and data"
  - [ ] Add "Set all to structure only" bulk action
  - [ ] Show global dependency indicator (star icon)
  - [ ] Implement expandable rows for associations
  - [ ] Filter: only standard data sources (type=null)
  - [ ] Style with Tailwind
  - [ ] Import Database, Star icons from lucide-vue-next
  - [ ] Emit events: `selection-change`, `copy-mode-change`

- [ ] 6.6 Create DataSourcesTab tests
  - [ ] Create `src/components/tabs/DataSourcesTab.test.js`
  - [ ] Mock middleware API responses
  - [ ] Test: loads data sources correctly
  - [ ] Test: copy mode dropdown changes state
  - [ ] Test: "Set all to structure only" works
  - [ ] Test: filters non-standard data sources
  - [ ] Test: emits events correctly
  - [ ] Run tests: `npm test DataSourcesTab.test.js`

- [ ] 6.7 Create FilesTab component
  - [ ] Create `src/components/tabs/FilesTab.vue`
  - [ ] Implement template: instructions, DataTable with folder options
  - [ ] Integrate with middleware: fetch files and folders with associations
  - [ ] Configure table columns: Checkbox, Name, Path, Type, Added, ID, Preview, Associated Screens, Associated DS, Global Lib
  - [ ] Implement folder copy options dropdown: "Copy folder only" vs "Copy folder and files"
  - [ ] Show file type icons
  - [ ] Show unused file indicator (no associations)
  - [ ] Implement expandable rows for associations
  - [ ] Style with Tailwind
  - [ ] Import Folder, File, Image, FileText icons from lucide-vue-next
  - [ ] Emit events: `selection-change`, `folder-option-change`

- [ ] 6.8 Create FilesTab tests
  - [ ] Create `src/components/tabs/FilesTab.test.js`
  - [ ] Mock middleware API responses
  - [ ] Test: loads files and folders correctly
  - [ ] Test: folder options dropdown works
  - [ ] Test: identifies unused files
  - [ ] Test: emits events correctly
  - [ ] Run tests: `npm test FilesTab.test.js`

- [ ] 6.9 Create SettingsTab component
  - [ ] Create `src/components/tabs/SettingsTab.vue`
  - [ ] Implement template: instructions, checkboxes for app-level configurations
  - [ ] Create 4 checkboxes with descriptions:
    - [ ] App settings (with link to details)
    - [ ] Menu settings
    - [ ] Global appearance settings
    - [ ] Global code customizations (with version warning)
  - [ ] Add warning banner for global code overwrite
  - [ ] Style with Tailwind
  - [ ] Import Settings, Code, Palette, Menu icons from lucide-vue-next
  - [ ] Emit events: `selection-change`

- [ ] 6.10 Create SettingsTab tests
  - [ ] Create `src/components/tabs/SettingsTab.test.js`
  - [ ] Test: renders all checkboxes
  - [ ] Test: checkbox states change correctly
  - [ ] Test: emits selection-change with correct data
  - [ ] Run tests: `npm test SettingsTab.test.js`

### 7.0 Implement Page Components (States 4-6: Review, Progress, Complete)

- [ ] 7.1 Create MergeReview component
  - [ ] Create `src/components/pages/MergeReview.vue`
  - [ ] Implement template: instructions, warning banners, summary tables by category, action buttons
  - [ ] Integrate with middleware: fetch merge preview
  - [ ] Display summary sections: Screens, Data Sources, Files, App-Level Configurations
  - [ ] Use color-coded StatusBadge for each item (copy/overwrite/conflict)
  - [ ] Show conflict warnings prominently
  - [ ] Show plan limit warnings if applicable
  - [ ] Disable "Start merge" button if conflicts or limits exceeded
  - [ ] Style with Tailwind: tables, warning highlights
  - [ ] Import AlertTriangle, AlertCircle icons from lucide-vue-next
  - [ ] Emit events: `start-merge`, `edit-settings`, `cancel`

- [ ] 7.2 Create MergeReview tests
  - [ ] Create `src/components/pages/MergeReview.test.js`
  - [ ] Mock middleware preview API
  - [ ] Test: displays preview correctly
  - [ ] Test: identifies conflicts correctly
  - [ ] Test: disables start button when conflicts exist
  - [ ] Test: shows plan limit warnings
  - [ ] Test: emits events correctly
  - [ ] Run tests: `npm test MergeReview.test.js`

- [ ] 7.3 Create MergeProgress component
  - [ ] Create `src/components/pages/MergeProgress.vue`
  - [ ] Implement template: progress bar, real-time status messages list
  - [ ] Integrate with middleware: listen for merge status updates via event system
  - [ ] Display animated progress bar with percentage
  - [ ] Display scrolling list of status messages with icons (✓, ⏳, ❌)
  - [ ] Auto-scroll to latest message
  - [ ] Show item counts: "Copying files... (1 of 25)"
  - [ ] Style with Tailwind: progress bar animation, message list scrolling
  - [ ] Import Loader2, CheckCircle2, AlertCircle icons from lucide-vue-next
  - [ ] Handle merge completion transition (automatically navigate to Complete state)
  - [ ] Note: User can close overlay at any time - merge continues in background

- [ ] 7.4 Create MergeProgress tests
  - [ ] Create `src/components/pages/MergeProgress.test.js`
  - [ ] Mock middleware event system
  - [ ] Test: listens for status updates
  - [ ] Test: updates progress bar correctly
  - [ ] Test: adds status messages to list
  - [ ] Test: auto-scrolls to latest message
  - [ ] Test: handles completion correctly
  - [ ] Run tests: `npm test MergeProgress.test.js`

- [ ] 7.5 Create MergeComplete component
  - [ ] Create `src/components/pages/MergeComplete.vue`
  - [ ] Implement template: success message, summary section, issues section, next steps, action buttons
  - [ ] Integrate with middleware: fetch merge results
  - [ ] Display summary counts: screens merged, data sources merged, files merged
  - [ ] Display issues and warnings list (if any)
  - [ ] Display plan limit warnings (if applicable)
  - [ ] Show next steps guidance
  - [ ] Show previous merges list (if any)
  - [ ] Style with Tailwind: success indicators, warning highlights
  - [ ] Import CheckCircle2, AlertTriangle, ExternalLink icons from lucide-vue-next
  - [ ] Emit events: `open-app`, `view-audit-log`
  - [ ] Note: User can close overlay using Studio controls - no close button needed

- [ ] 7.6 Create MergeComplete tests
  - [ ] Create `src/components/pages/MergeComplete.test.js`
  - [ ] Mock middleware results API
  - [ ] Test: displays summary correctly
  - [ ] Test: displays issues list
  - [ ] Test: shows plan limit warnings
  - [ ] Test: emits events correctly
  - [ ] Run tests: `npm test MergeComplete.test.js`

### 8.0 Implement Application Routing and State Management

- [ ] 8.1 Update Application.vue root component
  - [ ] Update `src/Application.vue` template to use AppShell
  - [ ] Implement state management for current view/page
  - [ ] Create computed property for determining which page component to render
  - [ ] Implement navigation methods (goToDashboard, goToDestinationSelector, etc.)
  - [ ] Manage merge configuration state (selections across all tabs)
  - [ ] Integrate middleware initialization in created() hook
  - [ ] Handle app locking/unlocking lifecycle
  - [ ] Style with Tailwind

- [ ] 8.2 Add state management utilities
  - [ ] Create `src/utils/stateManager.js` for managing merge configuration state
  - [ ] Implement functions: saveSelection, getSelection, clearSelection
  - [ ] Use reactive Vue data for state storage
  - [ ] Ensure state is temporary (not persisted)

- [ ] 8.3 Create navigation flow tests
  - [ ] Create `src/Application.test.js`
  - [ ] Test: navigates through all states correctly
  - [ ] Test: locks apps when proceeding from destination selection
  - [ ] Test: unlocks apps on cancel or back
  - [ ] Test: preserves state when navigating between configure and review
  - [ ] Test: clears state on completion or cancel
  - [ ] Run tests: `npm test Application.test.js`

- [ ] 8.4 Implement error boundary handling
  - [ ] Add global error handler in Application.vue
  - [ ] Show NotificationToast for non-critical errors
  - [ ] Show error page for critical errors
  - [ ] Log errors for debugging

### 9.0 Integrate Analytics and Optional Audit Logging

- [ ] 9.1 Create analytics utility module
  - [ ] Create `src/utils/analytics.js`
  - [ ] Implement wrapper functions for `Fliplet.App.Analytics.event()`
  - [ ] Create named event functions: trackDashboardViewed, trackMergeInitiated, trackMergeCompleted, etc.
  - [ ] Add event categories: 'app_merge', 'ui_interaction', 'workflow'

- [ ] 9.2 Create optional audit logging utility module
  - [ ] Create `src/utils/auditLogging.js`
  - [ ] Implement wrapper functions for `Fliplet.App.Logs.create()` (when enabled)
  - [ ] Add feature flag: `ENABLE_AUDIT_LOGS = false` (default off)
  - [ ] Create conditional logging functions: logMergeInitiated, logMergeCompleted, logLockAcquired (only execute if flag is true)
  - [ ] Add comment: "Audit logging requires log types to be whitelisted via API. Enable by setting ENABLE_AUDIT_LOGS = true"

- [ ] 9.3 Integrate analytics into page components
  - [ ] Add analytics tracking to MergeDashboard: trackDashboardViewed on mount
  - [ ] Add analytics to DestinationSelector: trackDestinationSelected
  - [ ] Add analytics to MergeConfiguration: trackTabSwitched, trackItemsSelected
  - [ ] Add analytics to MergeReview: trackReviewViewed, trackConflictDetected
  - [ ] Add analytics to MergeProgress: trackMergeInitiated, trackMergeProgressUpdated
  - [ ] Add analytics to MergeComplete: trackMergeCompleted, trackDestinationAppOpened

- [ ] 9.4 Integrate optional audit logging into critical actions
  - [ ] Add audit logging to Application.vue: logMergeInitiated (when merge starts)
  - [ ] Add audit logging: logMergeCompleted (when merge finishes)
  - [ ] Add audit logging: logLockAcquired (when apps are locked)
  - [ ] Add audit logging: logLockReleased (when apps are unlocked)
  - [ ] Ensure all audit logs only fire if ENABLE_AUDIT_LOGS is true

- [ ] 9.5 Create analytics tests
  - [ ] Create `src/utils/analytics.test.js`
  - [ ] Mock `Fliplet.App.Analytics.event`
  - [ ] Test: each analytics function calls Fliplet API with correct parameters
  - [ ] Run tests: `npm test analytics.test.js`

- [ ] 9.6 Create audit logging tests
  - [ ] Create `src/utils/auditLogging.test.js`
  - [ ] Mock `Fliplet.App.Logs.create`
  - [ ] Test: audit logs are NOT called when ENABLE_AUDIT_LOGS is false
  - [ ] Test: audit logs ARE called when ENABLE_AUDIT_LOGS is true
  - [ ] Run tests: `npm test auditLogging.test.js`

### 10.0 Accessibility and Responsive Design Testing

- [ ] 10.1 Implement accessibility features
  - [ ] Add ARIA labels to all interactive elements (buttons, links, form controls)
  - [ ] Add ARIA live regions for dynamic content (progress updates, toasts)
  - [ ] Implement focus management (trap focus in modals, restore focus after close)
  - [ ] Ensure keyboard navigation works for all components (Tab, Enter, Escape)
  - [ ] Add skip navigation links
  - [ ] Verify color contrast ratios (4.5:1 for normal text, 3:1 for large text)

- [ ] 10.2 Create accessibility utility functions
  - [ ] Create `src/utils/accessibility.js`
  - [ ] Implement `trapFocus(element)` for modal focus management
  - [ ] Implement `restoreFocus(previousElement)` to restore focus after modal close
  - [ ] Implement `announceToScreenReader(message)` for dynamic announcements

- [ ] 10.3 Test accessibility with keyboard navigation
  - [ ] Test: Tab through all interactive elements in correct order
  - [ ] Test: Enter activates buttons and links
  - [ ] Test: Escape closes modals and overlays
  - [ ] Test: Arrow keys navigate within DataTable
  - [ ] Test: Space toggles checkboxes

- [ ] 10.4 Test responsive design at all breakpoints
  - [ ] Test mobile (320px-767px): single column, cards instead of tables, bottom action buttons
  - [ ] Test tablet (768px-1023px): two columns where appropriate, condensed tables
  - [ ] Test desktop (1024px+): full layout, all columns visible
  - [ ] Verify all components adapt correctly

- [ ] 10.5 Create accessibility tests
  - [ ] Create `src/utils/accessibility.test.js`
  - [ ] Test: trapFocus prevents focus from leaving modal
  - [ ] Test: restoreFocus returns focus to correct element
  - [ ] Test: announceToScreenReader creates live region
  - [ ] Run tests: `npm test accessibility.test.js`

### 11.0 Performance Optimization and Final Polish

- [ ] 11.1 Implement performance optimizations
  - [ ] Add lazy loading for tab components (use dynamic imports)
  - [ ] Implement virtual scrolling in DataTable for large datasets (>500 rows)
  - [ ] Add debouncing to search inputs (already done in DataTable)
  - [ ] Optimize re-renders with computed properties and watchers
  - [ ] Add loading skeletons for all async content

- [ ] 11.2 Create formatter utility functions
  - [ ] Create `src/utils/formatters.js`
  - [ ] Implement `formatDate(timestamp)` for displaying timestamps
  - [ ] Implement `formatFileSize(bytes)` for file sizes
  - [ ] Implement `formatNumber(num)` for large numbers
  - [ ] Implement `formatDuration(seconds)` for time durations
  - [ ] Implement `formatTimestamp(timestamp, format)` with options

- [ ] 11.3 Create formatter tests
  - [ ] Create `src/utils/formatters.test.js`
  - [ ] Test each formatter function with various inputs
  - [ ] Test edge cases (null, undefined, 0, negative numbers)
  - [ ] Run tests: `npm test formatters.test.js`

- [ ] 11.4 Create validator utility functions
  - [ ] Create `src/utils/validators.js`
  - [ ] Implement `validateDuplicateNames(items, field)` for detecting duplicates
  - [ ] Implement `validatePermissions(user, requiredRole)` for permission checks
  - [ ] Implement `validatePlanLimits(current, limit)` for plan limit checks

- [ ] 11.5 Create validator tests
  - [ ] Create `src/utils/validators.test.js`
  - [ ] Test each validator function
  - [ ] Test edge cases
  - [ ] Run tests: `npm test validators.test.js`

- [ ] 11.6 Conduct final integration testing
  - [ ] Test complete workflow: Dashboard → Select Destination → Configure → Review → Progress → Complete
  - [ ] Test error scenarios: network failures, validation errors, permission errors
  - [ ] Test edge cases: empty states, large datasets, slow connections
  - [ ] Verify all middleware integrations work correctly
  - [ ] Verify all analytics events fire correctly
  - [ ] Verify audit logs are disabled by default

- [ ] 11.7 Run full test suite and achieve target coverage
  - [ ] Run `npm test` for all tests
  - [ ] Run `npm run test:coverage` and verify >80% coverage
  - [ ] Fix any failing tests
  - [ ] Review coverage report and add tests for uncovered code

- [ ] 11.8 Final polish and refinement
  - [ ] Review all components for visual consistency
  - [ ] Verify all Tailwind classes are optimized (unused classes purged in production build)
  - [ ] Add loading states where missing
  - [ ] Ensure all error messages are user-friendly
  - [ ] Test in different browsers (Chrome, Firefox, Safari, Edge)
  - [ ] Perform final accessibility audit
  - [ ] Update README.md with widget documentation

---

## Implementation Notes

### Development Workflow
1. Start with `npm run watch` for continuous build during development
2. Run `npm run test:watch` in a separate terminal for continuous testing
3. Build for production with `npm run build`
4. Check test coverage with `npm run test:coverage`

### Key Integration Points
- **Middleware:** Access via `window.FlipletAppMerge.middleware`
- **Analytics:** Use `Fliplet.App.Analytics.event()` for all user interactions
- **Audit Logs:** Use `Fliplet.App.Logs.create()` only when `ENABLE_AUDIT_LOGS = true`

### Testing Strategy
- Write tests alongside components (TDD approach encouraged)
- Mock middleware API responses using files in `tests/mocks/`
- Aim for >80% code coverage
- Test all user interactions and state transitions

### Accessibility Checklist
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] All interactive elements are keyboard accessible
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Focus indicators are visible
- [ ] ARIA labels are present where needed

### Performance Targets
- Initial load: < 2 seconds
- Table rendering (500 items): < 1 second
- Search response: < 500ms
- Real-time updates: < 1 second latency

---

**Total Tasks:** 11 parent tasks, 100+ sub-tasks

**Estimated Implementation Time:** 4-6 weeks (depending on team size and experience)

**Priority Order:** Follow the numbered sequence (1.0 → 11.0) for logical dependency flow

