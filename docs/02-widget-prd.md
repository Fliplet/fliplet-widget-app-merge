# App Merge Widget - Product Requirements Document

> **Note:** This document describes the product requirements specifically for the App Merge UI widget. For the complete App Merge project requirements including backend APIs, version control, and Studio integration, see [01-prd.md](./01-prd.md).

## Executive Summary

### Project Context

The App Merge feature enables Fliplet Studio users to merge apps within their Organisation or across Organisations. This includes consolidating app components, data, and configurations into a unified app while leveraging Fliplet's existing version control capabilities.

### Widget Purpose

This widget provides the **user interface** for configuring, initiating, and monitoring app merge operations. It is accessed from Fliplet Studio via the "App > Merge app..." menu option and presents a multi-step workflow for users to:

1. View merge dashboard and app status
2. Select destination app and organisation
3. Configure merge settings (screens, data sources, files, app-level configurations)
4. Review merge summary and initiate the merge
5. Monitor real-time merge progress and view results

## Widget Scope

### In Scope

This widget is responsible for:

1. **Merge Dashboard UI**
   - Display source app information
   - Show merge prerequisites and warnings
   - Provide access to audit log
   - Display merge status and history

2. **Destination Selection Interface**
   - Organisation selector with search
   - App list with filtering and search
   - Display app metadata (ID, last modified, live status)
   - Validate destination selection

3. **Merge Configuration UI**
   - Multi-tab interface (Screens, Data Sources, Files, Settings & Global Code)
   - Tabular data display with search, sort, filter capabilities
   - Item selection with bulk actions
   - Display associations between screens, data sources, and files
   - Show configuration options (data structure only, folder vs. files, etc.)
   - Real-time validation and warnings

4. **Review & Summary Screen**
   - Display complete merge configuration
   - Highlight items to be overwritten, copied, or with conflicts
   - Show warnings (rollback limitations, live impact, etc.)
   - Calculate and display counts

5. **Merge Progress Monitoring**
   - Real-time status updates
   - Progress indicators
   - Success/failure messages
   - Error reporting with actionable information
   - Completion summary

6. **App Locking Indicators**
   - Display lock status
   - Show lock countdown warnings
   - Provide lock extension UI

7. **Client-Side Validation**
   - Duplicate name detection
   - Permission checks
   - Plan/pricing limit warnings
   - Form validation

8. **State Management**
   - Manage multi-step configuration flow
   - Handle temporary state (not persisted)
   - Navigate between steps
   - Cancel and exit flows

### Out of Scope

This widget does NOT implement:

- **Backend/API Implementation**
  - REST API endpoints
  - Merge execution logic
  - Data source/file/screen copying
  - App locking mechanisms

- **Studio Integration**
  - Menu item registration
  - App card dropdown integration
  - Studio navigation
  - Organisation switching

- **Version Control Features**
  - Global code versioning
  - Screen version history
  - Data source version history
  - Rollback functionality

- **Permissions & Security**
  - Permission validation (consumes from API)
  - Organisation access controls
  - SSO/authentication

- **Backend Data Management**
  - App settings updates
  - Data source operations
  - File operations
  - Screen CRUD

- **Notifications**
  - Email notifications
  - Studio notifications
  - Push notifications

## Functional Requirements

### 1. Merge Dashboard

**Requirements:**
- Display source app information: name, ID, organisation, region, published status, last modified timestamp and user
- Show clear instructions for merge prerequisites (check for duplicates, rename items)
- Warn that merge configuration cannot be saved
- Provide link to app audit log
- Show merge status if merge is in progress or recently completed
- Display "Configure merge" CTA

**Validation:**
- Only show for users with App Publisher rights
- Display lock status if app is currently locked

### 2. Step 1: Select Destination App

**Requirements:**
- Display 3-step progress indicator
- Show warning that progress cannot be saved until merge is initiated
- Notify that source and destination apps will be locked upon proceeding
- Organisation dropdown with search (if user belongs to multiple orgs)
  - Display: organisation title, ID, region
  - Default to source app's organisation
- App list for selected organisation
  - Columns: app name, app ID, last modified, live tag
  - Search functionality
  - Sort by name, last modified
  - Exclude locked apps
  - Exclude source app
- "Next" and "Cancel" CTAs
- Close overlay option

**Validation:**
- User must have App Publisher rights on selected destination app
- Selected app must not be locked
- Selected app cannot be the source app
- Destination app must not have duplicate screen or data source names

### 3. Step 2: Configure Merge Settings

#### General Requirements
- Display source → destination app direction clearly
- Show warning that apps are now locked
- Provide tabs: Screens, Data Sources, Files, Settings & Global Code
- Display count of selected items for each category
- "Review merge settings" CTA showing total selected items
- "Back" and "Cancel" CTAs

#### Tabular UI Requirements (All Tabs)

Based on the [Tabular UI Library specification](./01-prd.md#tabular-ui-library):

- **Clear Column Headings:** Label each column appropriately
- **Pagination:**
  - Configurable page sizes including "Show all"
  - Handle large datasets efficiently
- **Global Search:** Filter across relevant columns by keyword
- **Sorting:** Ascending/descending by columns, proper numerical sorting
- **Responsive Design:** Adapt to screen sizes (fewer columns, horizontal scroll on mobile)
- **Loading Indicators:** Show visual feedback during data loading/filtering
- **Bulk Actions:** Select all, select/deselect individual items
- **Partial Selection:** Clear UI when some items in a category are selected
- **Custom UI in Cells:** Support dropdowns and custom controls
- **Nested Tables:** Expand rows to show associated items (e.g., data sources for a screen)
- **Rich Event Handling:** Row click, double-click, selection change, sort change, page change

This is currently available as Fliplet.UI.Table() by adding the `fliplet-table` dependency to `widget.json`. The documentation can be found at https://developers.fliplet.com/API/fliplet-table.html

#### Screens Tab

**Requirements:**
- Display instructions about screen merging (matching names, version control)
- Table columns:
  - Checkbox (select all / individual)
  - Screen name (sortable)
  - Screen ID
  - Preview icon
  - Last modified timestamp (sortable)
  - Associated data sources (expandable nested view)
  - Associated files (expandable nested view)
- Show count of selected screens
- Display which associated assets are selected/not selected
- Show warnings for screens with components that cannot be copied (e.g., SSO settings)

**Validation:**
- Cannot proceed if duplicate screen names exist in destination

#### Data Sources Tab

**Requirements:**
- Display instructions about data source merging (name matching, immediate impact)
- Table columns:
  - Checkbox (select all / individual)
  - Data source name (sortable)
  - Data source ID
  - Last modified timestamp (sortable)
  - Number of entries
  - Data structure only toggle (select all / individual)
  - Associated screens count (expandable nested view)
  - Associated files count (expandable nested view)
  - Global dependency indicator (yes/no)
- Show count of selected data sources
- Show count of entries per data source
- Display which associated assets are selected/not selected
- Warn about immediate live impact

**Options:**
- **Data structure only** mode: Copy columns without data
- **Overwrite structure and data** mode: Replace both columns and data

**Validation:**
- Cannot proceed if duplicate data source names exist in destination
- Only standard data sources (no data source type) are selectable
- Warn if data source is in global dependencies

#### Files Tab

**Requirements:**
- Display instructions about file merging (name matching, replacement behavior)
- Table columns:
  - Checkbox (select all / individual)
  - File/folder name (sortable)
  - Folder path (sortable)
  - File type (sortable)
  - Added timestamp (sortable)
  - File ID
  - Preview icon
  - Associated screens count (expandable nested view)
  - Associated data sources count (expandable nested view)
  - Global library indicator
- Show count of selected files
- Display which associated assets are selected/not selected
- Show unused files indicator

**Options for folders:**
- **Copy folder only:** Copy folder without files (useful for form references)
- **Copy folder and files:** Copy folder with all content including subfolders (useful for LFD)

**Validation:**
- Warn that duplicate file names will cause destination file to be renamed with timestamp

#### Settings & Global Code Tab

**Requirements:**
- Display instructions about app-level configurations and version control

**Checkboxes with descriptions:**
1. **App settings**
   - Display which settings will be copied (reference to settings review doc)
   - Warn about settings excluded for safety

2. **Menu settings**
   - Specify that menu type and menu list will be copied

3. **Global appearance settings**
   - Specify that all global appearance settings and associated media will be copied
   - Clarify that individual widget appearance settings are excluded

4. **Global code customizations**
   - Global CSS: All code will be copied
   - Global JS: All code will be copied
   - Warn that a version will be created for rollback

### 4. Step 3: Review Merge Summary

**Requirements:**
- Display instructions and merge duration estimate (under 5 minutes)
- Show table of all selected items with color-coded indicators:
  - Items to be overwritten (in destination)
  - Items to be copied (new items)
  - Items with conflicts (duplicate names)
- Display by category:
  - Screens: name, ID, total count
  - Data sources: name, ID, total count, entry count or "structure only"
  - Files: name, ID, total count
  - Settings & Global Code: list of selected options
- Show warnings:
  - Automated rollback unavailable
  - Data sources go live immediately
  - Merge cannot be cancelled once started
  - Plan/pricing limits may be exceeded (if applicable)
- "Start merge" and "Edit merge settings" CTAs

**Validation:**
- Block merge if duplicate names exist (show clear error)
- Block merge if plan/pricing limits exceeded
- Confirm user acknowledgement of warnings

### 5. Merge Progress & Completion

**During Merge:**
- Display progress bar with estimated time
- Show real-time status messages:
  - Type of item being merged (screen, data source, file, etc.)
  - Success/failure indicators for each item
  - Error messages with details
- Allow closing overlay (merge continues in background)
- Prevent cancellation once merge has started
- Display "Merge in progress" status

**After Merge Completion:**
- Show completion summary:
  - Number of screens merged
  - Number of data sources merged
  - Number of files merged
  - List of settings/global code applied
  - Highlight conflicts/errors
  - Display plan/pricing limit warnings if limits exceeded
- Provide "Open app" CTA
- Link to detailed audit log
- Show list of previous merges (if any)

**Error Handling:**
- Display clear error messages
- Provide actionable guidance (e.g., retry, skip)
- Log all errors for audit trail

### 6. App Locking UI

**Requirements:**
- Display lock status prominently when apps are locked
- Show lock countdown when less than 5 minutes remain
- Show warning when less than 2 minutes remain
- Provide "Extend lock" button (adds 5 minutes)
- Auto-unlock if user navigates away or closes overlay
- Prevent selection of locked apps in destination picker

### 7. Client-Side Validation

**Requirements:**
- Validate no duplicate screen names in source or destination
- Validate no duplicate data source names in source or destination
- Check user has App Publisher rights on both apps
- Validate destination app is not the source app
- Validate destination app is not locked
- Validate organisation permissions allow merge
- Warn if plan/pricing limits will be exceeded
- Show clear, actionable error messages

### 8. Responsive Design

**Requirements:**
- Adapt layout for different screen sizes
- Use horizontal scrolling for tables on small screens
- Stack columns vertically on mobile
- Maintain usability on tablet and desktop
- Ensure touch-friendly controls

### 9. Accessibility

**Requirements:**
- Keyboard navigation support
- Screen reader compatibility
- ARIA labels for interactive elements
- Focus management
- Color contrast compliance

## User Stories (Widget-Specific)

### General
1. As a user, I want to see clear instructions at each step of the merge process so I understand what actions are required.
2. As a user, I want to see real-time progress of the app merge, including what's being merged and whether each step succeeded or failed.
3. As a user, I want to be notified if there are duplicate screen or data source names before starting a merge so I can fix them.
4. As a user, I want to receive clear error messages identifying duplicate items when a merge is blocked.
5. As a user, I want to understand which app-level configurations will be copied during a merge so I can make informed decisions.

### Navigation
1. As a user, I want to navigate between merge configuration steps easily and see my progress.
2. As a user, I want to go back and edit my selections before confirming the merge.
3. As a user, I want to cancel the merge configuration at any time before clicking "Start merge."
4. As a user, I expect that if I close the overlay before starting the merge, no progress will be saved.

### Selection & Configuration
1. As a user, I want to search and filter screens, data sources, and files to quickly find items to merge.
2. As a user, I want to select/deselect items individually or in bulk.
3. As a user, when selecting items to merge, I want to see associated files, screens, and data sources so I understand dependencies.
4. As a user, I want to see which screens or components reference each file so I can understand the impact of including/excluding them.
5. As a user, I want to easily identify unused files during merge preparation.
6. As a user, I want to choose whether to copy just the data source structure or both structure and data.
7. As a user, I want to see clear labels and tooltips explaining configuration options.

### Warnings & Validation
1. As a user, I want the merge process to block if duplicate names exist with clear error messages.
2. As a user, I want to be warned that data source changes go live immediately.
3. As a user, I must be made aware that the merge could disrupt users currently accessing the app.
4. As a user, I want to know if the merge will exceed plan/pricing limits before I start.
5. As a user, I want to be warned that apps will be locked during merge configuration.

### Progress & Completion
1. As a user, I want to see a progress bar and status messages during the merge.
2. As a user, I want to receive a final message confirming successful merge completion.
3. As a user, I want to review merge logs showing everything completed and any issues/errors.
4. As a user, I want to open the destination app immediately after merge completion.

## Dependencies

### REST APIs (Consumed by Widget)

This widget depends on the following API endpoints (implementation is outside widget scope):

1. **App List API**
   - Get apps for an organisation
   - Filter by permissions
   - Return app metadata

2. **App Details API**
   - Get app details (screens, data sources, files)
   - Get app settings
   - Get lock status

3. **Organisation API**
   - Get user organisations
   - Get organisation permissions

4. **Merge Validation API**
   - Validate duplicate names
   - Validate permissions
   - Check plan/pricing limits

5. **Merge Configuration API**
   - Submit merge configuration
   - Initiate merge

6. **Merge Status API**
   - Get real-time merge progress
   - Get merge results
   - Get merge history

7. **App Lock API**
   - Lock/unlock apps
   - Extend lock duration
   - Get lock status

8. **Audit Log API**
   - Get merge audit logs

### Fliplet Studio Integration

- Widget loaded via Studio menu ("App > Merge app...")
- Studio provides app context (source app ID)
- Studio handles organisation switching
- Studio provides authentication context

### Browser Requirements

- Modern browser with ES6+ support
- WebSocket or long-polling for real-time updates
- Local storage for temporary state

## Technical Constraints

### Performance
- Merge configuration UI must load in under 2 seconds
- Table rendering must handle 1000+ items efficiently
- Search/filter must respond in under 500ms
- Progress updates must display within 1 second of backend event

### State Management
- Configuration state is temporary and not persisted
- Lock extends automatically while user is active
- Auto-unlock on navigation away or close

### Compatibility
- Must work in Fliplet Studio iFrame context
- Must support Fliplet's existing UI framework (if any)
- Must integrate with Fliplet's notification system

## Success Metrics

### User Experience
- Users can configure a merge in under 10 minutes
- Less than 5% of merge configurations abandoned before completion
- Error messages result in successful resolution >80% of the time

### Performance
- Page load time < 2 seconds
- Table rendering for 500 items < 1 second
- Real-time updates latency < 1 second

### Usability
- 90% of users can complete merge without assistance
- Less than 10% of merges blocked by validation errors

## Future Enhancements

These are potential future features outside the current scope:

1. **Save Merge Templates** - Allow users to save and reuse merge configurations
2. **Scheduled Merges** - Schedule merges for future execution
3. **Merge Preview** - Show detailed diff of changes before merge
4. **Advanced Filtering** - More sophisticated search and filter options
5. **Batch Operations** - Configure multiple merges at once
6. **Mobile Optimization** - Dedicated mobile UI for merge monitoring
