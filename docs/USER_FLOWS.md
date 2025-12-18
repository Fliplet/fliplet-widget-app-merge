# App Merge UI - User Flows

This document describes complete user journeys through the App Merge feature, covering primary flows, alternative paths, error scenarios, and decision points.

For project context and technical details, see [README.md](README.md).

---

## Overview

The App Merge feature enables users to merge apps within or across Fliplet Organizations. This document maps the user's journey from initial entry to completion, including all decision points, alternative paths, and error handling.

### Journey Summary

1. **Dashboard** - Review source app and prerequisites
2. **Select Destination** - Choose organization and destination app
3. **Configure Merge** - Select screens, data sources, files, and settings (4 tabs)
4. **Review & Merge** - Preview selections and conflicts before execution
5. **Merge Progress** - Real-time status updates during execution
6. **Merge Complete** - View results and next actions

---

## Primary Flow: Normal Merge Operation

### Entry Point

**Context**: User is in Fliplet Studio viewing an app they want to merge.

**Trigger**: User clicks "App > Merge app..." from app card dropdown in Studio.

**System Action**: Opens App Merge UI in iframe overlay with `sourceAppId` query parameter.

**Result**: User lands on Dashboard screen.

---

### Step 1: Dashboard (Review Source App)

**Purpose**: Orient user, show source app details, verify prerequisites.

**What User Sees**:
- Source app name and details (ID, organization, last modified)
- Prerequisites checklist:
  - You have permission to merge
  - Source app has content to merge
  - You are a member of at least one organization
- Source app summary cards:
  - 15 screens
  - 3 data sources
  - 42 files
- Primary action: "Configure Merge" button (enabled)
- Secondary action: "View Audit Log" link

**User Actions**:
1. Reviews source app information
2. Confirms prerequisites are met (all show green checkmarks)
3. Clicks "Configure Merge" button

**System Actions**:
- Loads source app via GET `/v1/apps/:id?include=screens,dataSources,files`
- Displays counts and summary information
- Enables button only if prerequisites met

**Transition**: Navigate to Select Destination screen

**Duration**: 10-30 seconds (review time)

---

### Step 2: Select Destination App

**Purpose**: Choose organization and specific destination app for merge target.

**What User Sees**:
- Progress indicator: Step 1 of 3 - "Select destination app"
- Warning: "Progress cannot be saved. Apps will be locked after selection."
- Organization dropdown (pre-selected to user's current org if only one)
- Table of available apps in selected organization:
  - Columns: App Name, App ID, Last Modified, Live tag
  - Search box
  - Sort controls
- Apps locked for merge are shown but disabled
- "Next" button (disabled until app selected)
- "Cancel" and "X" close buttons

**User Actions**:
1. Reviews organization dropdown (already selected if only one org)
2. Uses search: types "Production" to filter apps
3. Reviews filtered table (5 apps match)
4. Clicks row to select "Production 2024 App"
5. Row highlights in blue
6. Sees warning modal: "This app will be locked for 15 minutes. You and other users won't be able to edit either app during configuration. Continue?"
7. Clicks "Continue" in modal

**System Actions**:
- Fetches user's organizations via GET `/v1/organizations`
- Fetches apps for selected org via GET `/v1/organizations/:id/apps`
- Filters out locked apps from selection (shown grayed out)
- On app selection + Continue:
  - Acquires 10-minute lock on destination app via POST `/v1/apps/:id/lock`
  - Acquires 10-minute lock on source app via POST `/v1/apps/:sourceId/lock`
  - Stores selection in MergeState
  - Starts lock countdown timer (10:00)
  - Persists state via MergeStorage

**Transition**: Navigate to Configure Merge screen (Screens tab active)

**Duration**: 30-60 seconds

**Lock Status**: Both apps now locked for 10 minutes

---

### Step 3a: Configure Merge - Screens Tab

**Purpose**: Select which screens to merge and view their dependencies.

**What User Sees**:
- Progress indicator: Step 2 of 3 - "Select items to merge"
- Lock timer in header: "9:30 remaining" (counting down)
- Source app name → Destination app name (with arrow)
- Warning: "Apps are locked. Other users cannot edit."
- Four tabs: **Screens** (active), Data Sources, Files, Settings
- Instructions: "Select screens to merge. Screens with matching names will overwrite destination versions."
- Table with screens:
  - Columns: Checkbox, Screen Name, Screen ID, Last Modified, Associated DS, Associated Files
  - All screens pre-selected by default (12 screens)
  - Expandable rows showing associations:
    - "User List" uses: "Users" data source (selected), "logo.png" file (selected)
- Search box and column sort controls
- Badge: "12 screens selected"
- Bottom actions: "Review & Merge" button, "Cancel" button

**User Actions**:
1. Reviews list of 12 screens
2. Unchecks 4 screens that aren't needed
3. Expands "User List" row to see dependencies:
   - Associated data source: "Users" (checkbox checked)
   - Associated file: "logo.png" (checkbox checked)
4. Sees badge update: "8 screens selected"
5. Clicks "Data Sources" tab

**System Actions**:
- Updates `MergeState.selectedScreens` array
- Calculates associations by analyzing screen dependencies
- Updates badge count reactively
- Persists state via MergeStorage
- Lock timer continues counting down (auto-extends if user active)

**Key Decision Point**:
- User decides which screens are needed in destination
- User sees which data sources and files are used by selected screens

**Transition**: User clicks "Data Sources" tab

**Duration**: 2-5 minutes

---

### Step 3b: Configure Merge - Data Sources Tab

**Purpose**: Select which data sources to merge and choose merge mode.

**What User Sees**:
- Data Sources tab now active (blue underline)
- Lock timer: "12:45 remaining"
- Instructions: "Data sources with matching names will be merged. Choose mode for each."
- Table with data sources:
  - Columns: Checkbox, DS Name, DS ID, Last Modified, Mode Dropdown, Associated Screens, Associated Files
  - 3 data sources shown
  - Mode dropdown for each: "All rows" or "Structure only"
  - All data sources pre-selected by default
  - Associated screens column shows count and icons (e.g., "3 screens" with tooltip listing names)
- Badge: "3 data sources selected"
- Warning: "Data source changes go live immediately and cannot be undone automatically."

**User Actions**:
1. Reviews 3 data sources
2. Unchecks "Analytics" data source (not needed)
3. For "Users" DS: keeps mode as "All rows"
4. For "Settings" DS: changes mode to "Structure only" (dropdown selection)
5. Hovers over "Users" associated screens (3) - sees tooltip: "User List, Profile, Admin Dashboard"
6. Sees badge update: "2 data sources selected"
7. Clicks "Files" tab

**System Actions**:
- Updates `MergeState.selectedDataSources` with id and mode
- Updates badge count
- Persists state
- Lock timer continues (11:30 remaining)

**Key Decision Point**:
- User chooses whether to copy data (all rows) or just structure
- User sees which screens depend on each data source

**Transition**: User clicks "Files" tab

**Duration**: 1-3 minutes

---

### Step 3c: Configure Merge - Files Tab

**Purpose**: Select which files and folders to merge.

**What User Sees**:
- Files tab now active
- Lock timer: "11:00 remaining"
- Instructions: "Select files to copy. Files with matching names will rename existing destination files with timestamp."
- Tree view of folders and files:
  - "Images" folder (checkbox)
    - Mode dropdown: "Folder only" or "All files"
    - Expand to show: logo.png, banner.jpg, icon.png
  - "Documents" folder
    - user-guide.pdf
  - "Media" folder (with library icon - global library)
    - video.mp4
- All files/folders pre-selected
- Column headers: Name, Type, Size, Added, Associated Screens, Associated DS
- Badge: "3 folders, 5 files selected"

**User Actions**:
1. Reviews folder structure
2. Unchecks "Documents" folder (not needed)
3. For "Images" folder: selects mode "All files"
4. For "Media" folder: keeps "Folder only" (form references)
5. Sees badge update: "2 folders, 4 files selected"
6. Clicks "Settings" tab

**System Actions**:
- Updates `MergeState.selectedFiles` and `MergeState.selectedFolders`
- Tracks folder modes
- Updates badge count
- Persists state
- Lock timer continues (10:15 remaining)

**Key Decision Point**:
- User chooses between copying full folders or just folder structure
- User decides which files are needed in destination

**Transition**: User clicks "Settings" tab

**Duration**: 1-2 minutes

---

### Step 3d: Configure Merge - Settings Tab

**Purpose**: Choose which app-level configurations to merge.

**What User Sees**:
- Settings tab now active
- Lock timer: "9:45 remaining"
- Instructions: "Select app-level configurations to merge. These will overwrite destination app settings."
- Checkboxes with expandable info:
  - [ ] **Merge app settings** (checkbox)
    - Expand to see: App name, icon, slug, navigation settings (excludes sensitive settings like SAML)
  - [ ] **Merge menu settings** (checkbox)
    - Expand to see: Menu type, menu list
  - [ ] **Merge global appearance settings** (checkbox)
    - Expand to see: Global CSS variables, theme colors, fonts (excludes component-specific styles)
  - [ ] **Merge global code** (checkbox)
    - Expand to see: Global JavaScript, Global CSS, library dependencies, data source dependencies
- Warning: "Global code will overwrite destination. Version history will be created for rollback."
- Warning: "App settings changes may require republishing the app."

**User Actions**:
1. Checks "Merge app settings"
2. Checks "Merge global code"
3. Leaves menu and appearance unchecked (not needed)
4. Clicks "Review & Merge" button

**System Actions**:
- Updates `MergeState.settings` object
- Persists state
- Validates all selections
- Lock timer continues (9:00 remaining)

**Transition**: Navigate to Review & Merge screen

**Duration**: 30-60 seconds

---

### Step 4: Review & Merge

**Purpose**: Preview all selections, identify conflicts, confirm before execution.

**What User Sees**:
- Progress indicator: Step 3 of 3 - "Review merge summary"
- Lock timer: "8:30 remaining"
- Summary cards for each category:

  **Screens** (8 selected)
  - 2 new screens (green badge: "COPY")
    - "New Feature Screen"
    - "Beta Dashboard"
  - 6 existing screens (orange badge: "OVERWRITE")
    - "Home"
    - "User List"
    - "Profile"
    - "Settings"
    - "About"
    - "Contact"
  - Expand to see full list with status

  **Data Sources** (2 selected)
  - 1 new DS (green badge: "COPY")
    - "Settings" (Structure only - blue badge)
  - 1 existing DS (orange badge: "OVERWRITE")
    - "Users" (All rows)

  **Files** (2 folders, 4 files)
  - All new (green badges: "COPY")
    - "Images" folder (All files mode) → logo.png, banner.jpg, icon.png
    - "Media" folder (Folder only)

  **Settings & Global Code**
  - App settings (orange badge: "OVERWRITE")
  - Global code (orange badge: "OVERWRITE")

- Total summary: "0 conflicts, 4 overwrites, 8 new items"
- Warnings:
  - "No automatic rollback. Use version history to restore manually."
  - "Data source changes go live immediately."
  - "After starting merge, you cannot cancel."
- Actions: "Start Merge" button (enabled, blue), "Edit Configuration" button (secondary)

**User Actions**:
1. Reviews all selections (takes 30-60 seconds)
2. Expands Screens card to see full list
3. Confirms no conflicts (all green or orange, no red)
4. Confirms ready to proceed
5. Clicks "Start Merge" button
6. Sees confirmation modal: "Are you sure you want to start the merge? You cannot cancel once started."
7. Clicks "Confirm" in modal

**System Actions**:
- Validates all selections
- Checks for conflicts (duplicate names, missing dependencies)
- Color-codes operations:
  - Green (COPY): New items
  - Orange (OVERWRITE): Existing items will be replaced
  - Red (CONFLICT): Issues preventing merge
  - Blue (PARTIAL): Structure-only data sources
- On "Start Merge":
  - Calls POST `/v1/merge` with full configuration
  - Locks remain active (merge overrides expiry)
  - Clears auto-extend timer

**Key Decision Point**:
- Final confirmation before irreversible merge
- User sees exactly what will happen

**Transition**: Navigate to Merge Progress screen

**Duration**: 1-2 minutes

---

### Step 5: Merge Execution (Progress)

**Purpose**: Show real-time merge progress and keep user informed.

**What User Sees**:
- Large progress indicator with stages
- Real-time status updates:

  **Stage 1: Preparing merge**
  - Status: COMPLETE (green checkmark)
  - "Validating selections..."
  - "Acquiring locks..."
  - "Creating backup snapshots..."

  **Stage 2: Merging files** (2/2)
  - Status: COMPLETE (green checkmark)
  - "Copying Images folder..."
  - "Creating Media folder..."

  **Stage 3: Merging screens** (3/8)
  - Status: IN PROGRESS (blue spinner)
  - Progress bar: 37.5%
  - "Merging screen: Home..."
  - "Copying dependencies..."
  - "Merging screen: User List..."

  **Stage 4: Merging data sources** (0/2)
  - Status: PENDING (gray)
  - "Waiting..."

  **Stage 5: Merging settings** (0/2)
  - Status: PENDING (gray)
  - "Waiting..."

  **Stage 6: Finalizing** (0%)
  - Status: PENDING (gray)

- Scrollable log panel (bottom):
  ```
  [14:32:15] Starting merge operation...
  [14:32:16] Lock acquired on source app (ID: 123456)
  [14:32:16] Lock acquired on destination app (ID: 789012)
  [14:32:18] Creating version snapshot...
  [14:32:20] Copying file: Images/logo.png
  [14:32:21] Copying file: Images/banner.jpg
  [14:32:22] Merging screen: Home (ID: 55001)
  [14:32:25] Copying dependencies for Home screen...
  [14:32:27] Merging screen: User List (ID: 55002)...
  ```

- Estimated time: "2-5 minutes remaining"
- Warning: "Do not close this window. Merge will continue in background if closed."
- No navigation buttons (blocked during merge)

**User Actions**:
- Watches progress
- Reviews log messages
- May close window (merge continues in background)

**System Actions**:
- Calls POST `/v1/merge` (initiated from Review screen)
- Backend processes merge asynchronously
- Frontend polls GET `/v1/merge/:jobId/status` every 2 seconds
- Updates progress bars, stage statuses, and log messages
- Maintains locks throughout (merge overrides expiry)
- Sends real-time updates:
  - Stage completion
  - Item counts
  - Success/error messages

**Error Handling**:
- If individual item fails: logs error, continues with remaining items
- If critical failure: stops merge, shows error screen

**Key Points**:
- User cannot cancel once started
- User can close overlay (merge continues)
- Real-time feedback builds confidence

**Transition**: When merge completes, navigate to Merge Complete screen

**Duration**: 2-5 minutes (varies by app size)

---

### Step 6: Merge Complete (Success)

**Purpose**: Confirm success, show results, guide next actions.

**What User Sees**:
- Large success icon (green checkmark)
- Heading: "Merge completed successfully!"
- Summary cards:

  **Merged Items**
  - 8 screens merged
  - 2 data sources merged
  - 4 files copied
  - 2 settings updated
  - 0 errors

  **Warnings/Notices**
  - "Data source changes are live. Test your app."
  - "App settings updated. Republish app to apply changes."

  **Next Steps** (checklist)
  - [ ] Review merged screens in destination app
  - [ ] Test data source changes
  - [ ] Republish app (if needed)
  - [ ] Review audit log

- Actions:
  - "View Destination App" (primary button, blue)
  - "View Audit Log" (secondary link)
  - "Start Another Merge" (tertiary link)
  - "Close" (X button)

- Downloadable summary: "Download Merge Report" (PDF/CSV)

**User Actions**:
1. Reviews summary (30 seconds)
2. Reads warnings about live changes
3. Clicks "View Destination App" button

**System Actions**:
- Releases lock on source app via DELETE `/v1/apps/:id/lock`
- Releases lock on destination app
- Clears MergeState and MergeStorage
- Posts message to Studio parent window: `{ action: 'openApp', appId: 789012 }`
- Studio switches to destination org (if different)
- Studio opens destination app in edit mode

**Transition**: User exits merge UI, Studio opens destination app

**Duration**: 30-60 seconds

**Result**: Merge complete, apps unlocked, user in destination app

---

## Alternative Flows

### Alt Flow 1: Selecting Different Organization

**Trigger**: User needs to merge to app in different organization.

**Divergence Point**: Step 2 (Select Destination) - Organization dropdown

**Flow**:
1. User on Select Destination screen
2. Clicks organization dropdown
3. Types "Staging" to filter organizations
4. Selects "Staging Organization" from dropdown
5. Table reloads with apps from Staging org
6. User selects destination app from new list
7. Continues as normal

**System Actions**:
- Fetches apps for newly selected org
- Filters to show only orgs user has App Publisher rights in
- Validates user has permission in both source and destination orgs

**Rejoins Primary Flow**: Step 2, after organization selected

---

### Alt Flow 2: Extending Expired Lock

**Trigger**: Lock timer drops below 2 minutes during configuration.

**Divergence Point**: Step 3 (Configure Merge) - Any tab

**What User Sees**:
- Lock timer turns orange: "1:45 remaining"
- Warning banner appears: "Lock will expire soon. Extend lock or lose progress."
- "Extend Lock by 5 Minutes" button

**User Actions**:
1. Sees warning at 1:45 remaining
2. Clicks "Extend Lock by 5 Minutes" button
3. Banner changes: "Lock extended. 6:45 remaining."
4. Continues configuration

**System Actions**:
- When timer < 2 minutes: shows warning
- On "Extend Lock" click:
  - Calls PATCH `/v1/apps/:id/lock` to extend by 5 minutes
  - Updates timer to new expiry
  - Removes warning banner

**Alternative Outcome**: User doesn't extend
- Timer hits 0:00
- Error modal: "Lock expired. Apps unlocked. Configuration lost."
- "Start Over" button returns to Dashboard
- Apps are unlocked

**Rejoins Primary Flow**: Continues from same tab if extended

---

### Alt Flow 3: Removing Conflicting Items

**Trigger**: User sees conflicts in Review screen and wants to fix.

**Divergence Point**: Step 4 (Review & Merge)

**What User Sees**:
- Review screen shows conflicts (red badges):
  - "Home" screen - CONFLICT: Missing dependency "Analytics" data source
  - "Reports" screen - CONFLICT: Duplicate name in destination (different content)

**User Actions**:
1. Reviews conflicts (2 screens with red badges)
2. Clicks "Edit Configuration" button
3. Returns to Configure Merge (Screens tab)
4. Unchecks "Home" screen (missing dependency issue)
5. Unchecks "Reports" screen (duplicate name issue)
6. Clicks "Review & Merge" again
7. Now sees: "0 conflicts, 4 overwrites, 6 new items"
8. Clicks "Start Merge"

**System Actions**:
- Preserves selections when user clicks "Edit Configuration"
- Re-validates after changes
- Allows merge when conflicts = 0

**Rejoins Primary Flow**: Step 4 (Review), now without conflicts

---

### Alt Flow 4: Partial Selection (Only Screens, No Data Sources)

**Trigger**: User wants to merge only screens without data sources.

**Divergence Point**: Step 3b (Data Sources Tab)

**User Actions**:
1. On Screens tab: selects 8 screens
2. Clicks Data Sources tab
3. Unchecks all data sources ("Unselect All")
4. Warning appears: "3 screens use unselected data sources. These screens may not work properly."
5. User accepts risk, continues
6. Skips Files tab (keeps selections)
7. On Settings tab: checks "Merge global code"
8. Clicks "Review & Merge"

**What User Sees on Review**:
- Screens: 8 selected
- Data Sources: 0 selected
- Warning: "Screens with data source dependencies may not function correctly."

**User Actions**:
9. Clicks "Start Merge" (accepts risk)
10. Merge executes normally

**Result**: Screens merged without associated data sources

**Rejoins Primary Flow**: Step 4 (Review & Merge)

---

### Alt Flow 5: Background Continuation (User Navigates Away)

**Trigger**: User closes merge overlay during merge execution.

**Divergence Point**: Step 5 (Merge Progress)

**User Actions**:
1. Merge in progress (Stage 3: Merging screens, 4/8 complete)
2. User clicks "X" to close overlay
3. Confirmation modal: "Merge is in progress. You can close this window - merge will continue in background. You'll receive a notification when complete."
4. User clicks "Close Anyway"
5. Overlay closes, user returns to Studio
6. User continues working on other tasks
7. 3 minutes later: Browser notification: "Merge complete!"
8. Studio notification bell shows: "App merge completed successfully"
9. User clicks notification
10. Merge overlay reopens, showing Step 6 (Merge Complete)

**System Actions**:
- Merge continues on backend (not interrupted)
- Sends browser push notification when complete
- Sends Studio in-app notification
- Sends email notification
- Stores completion status for retrieval

**Result**: User can multitask, gets notified when merge finishes

**Rejoins Primary Flow**: Step 6 (Merge Complete), when user returns

---

## Error Flows

### Error Flow 1: Lock Expired During Configuration

**Trigger**: User inactive for 10 minutes, lock expires before merge starts.

**Divergence Point**: Step 3 (Configure Merge) - Any tab

**What User Sees**:
- Lock timer hits 0:00
- Error modal appears:
  - Icon: Warning (orange)
  - Heading: "Lock Expired"
  - Message: "Your configuration session has expired. Apps have been unlocked and your selections were not saved."
  - Details: "Locks expire after 10 minutes of inactivity. You can extend locks before they expire."
  - Action: "Start Over" button

**User Actions**:
1. Reads error message
2. Clicks "Start Over"

**System Actions**:
- Releases locks on both apps via DELETE `/v1/apps/:id/lock`
- Clears MergeState and MergeStorage
- Returns user to Dashboard
- Apps now available for editing by others

**Recovery**:
- User must restart configuration from Step 2 (Select Destination)
- Previous selections are lost

**Prevention Tip**: System shows "Extend Lock" button when < 2 minutes remaining

---

### Error Flow 2: Lock Already Held by Another User

**Trigger**: User tries to select destination app that's already locked.

**Divergence Point**: Step 2 (Select Destination)

**What User Sees**:
- App table shows app with icon: Lock symbol
- App row is grayed out (not selectable)
- Tooltip on hover: "Locked by Alice Smith (merge in progress)"
- User tries to click anyway (click ignored)
- Info banner at top: "Some apps are unavailable because they're locked for merge operations. Locked apps will become available when the merge completes."

**User Actions**:
1. Sees desired app is locked
2. Waits or selects different app
3. If waits: refreshes table periodically
4. Eventually app becomes available (lock released)
5. Selects app and continues

**System Actions**:
- GET `/v1/organizations/:id/apps` includes lock status
- Frontend filters locked apps from selection
- Shows lock icon and owner info

**Alternative**: User selects different destination app

**Recovery**: Wait for lock to expire or be released

---

### Error Flow 3: Conflict Detected During Review

**Trigger**: System detects conflicts when user reaches Review screen.

**Divergence Point**: Step 4 (Review & Merge)

**What User Sees**:
- Review screen shows conflicts (red badges):

  **Screens** (8 selected, 2 conflicts)
  - 5 new screens (green: COPY)
  - 1 existing screen (orange: OVERWRITE)
  - 2 conflict screens (red: CONFLICT)
    - "Reports" - Duplicate name with different content
    - "Analytics" - Missing dependency: "Analytics DB" data source

  **Data Sources** (1 selected, 1 conflict)
  - 1 conflict DS (red: CONFLICT)
    - "Users" - Schema mismatch: missing "role" column in destination

- Error banner: "3 conflicts detected. Resolve conflicts before merging."
- "Start Merge" button is disabled (grayed out)
- Actions: "Edit Configuration" (enabled), "Cancel" (enabled)

**User Actions**:
1. Reviews conflicts
2. Clicks "Edit Configuration"
3. Returns to Screens tab
4. Unchecks "Reports" screen (duplicate name)
5. Goes to Data Sources tab
6. Checks "Analytics DB" data source (resolves dependency)
7. Changes "Users" DS mode to "Structure only" (avoids schema mismatch)
8. Clicks "Review & Merge" again
9. Sees: "0 conflicts" (all green/orange)
10. "Start Merge" button now enabled
11. Clicks "Start Merge"

**System Actions**:
- Validates selections when entering Review screen
- Detects conflicts:
  - Duplicate names
  - Missing dependencies
  - Schema mismatches
  - Plan/pricing limits
- Disables merge until conflicts resolved
- Re-validates after user edits

**Result**: User resolves conflicts, merge proceeds

---

### Error Flow 4: API Error During Execution

**Trigger**: Backend API call fails during merge execution.

**Divergence Point**: Step 5 (Merge Progress)

**What User Sees**:
- Merge in progress (Stage 4: Merging data sources, 1/2 complete)
- Suddenly stage status changes to ERROR (red X):

  **Stage 4: Merging data sources** (1/2)
  - Status: ERROR (red X)
  - Error message: "Failed to merge data source 'Users'. API error: 500 Internal Server Error."
  - Action buttons: "Retry", "Skip", "View Details"

- Log panel shows:
  ```
  [14:35:42] Merging data source: Users...
  [14:35:45] ERROR: API call failed: POST /v1/data-sources/copy
  [14:35:45] Error: 500 Internal Server Error
  [14:35:45] Message: Database connection timeout
  ```

**User Actions**:
1. Reads error message
2. Clicks "Retry" button

**System Actions**:
- Retries failed operation (1st attempt)
- If succeeds: continues merge
- If fails again (2nd attempt): offers "Skip" or "Abort"

**User Actions** (if retry fails):
3. Sees: "Retry failed (2/3 attempts). Skip this item or abort merge?"
4. Clicks "Skip"

**System Actions**:
- Logs skipped item
- Continues with remaining items
- Stage 4 shows: "1/2 complete (1 skipped)"

**Result**: Merge completes with partial success
- Merge Complete screen shows:
  - "Merge completed with warnings"
  - "1 data source skipped due to errors"
  - Link: "View Error Details"

**Recovery**: User can manually merge skipped items later

---

### Error Flow 5: Network Failure During Progress

**Trigger**: User's internet connection drops during merge execution.

**Divergence Point**: Step 5 (Merge Progress)

**What User Sees**:
- Merge in progress (Stage 3: Merging screens, 5/8)
- Internet disconnects
- Progress updates stop
- After 10 seconds: Banner appears:
  - Icon: Warning (orange)
  - Message: "Connection lost. Merge is continuing on server. Reconnecting..."
  - Spinner animation

**System Actions**:
- Frontend detects failed polling request
- Starts exponential backoff retry (2s, 4s, 8s, 16s)
- Merge continues on backend (unaffected)

**User Actions**:
1. Waits for reconnection
2. Internet returns after 30 seconds

**System Actions**:
- Reconnects successfully
- Fetches current merge status via GET `/v1/merge/:jobId/status`
- Updates UI to current state (Stage 5: Merging settings)
- Banner changes: "Reconnected. Merge in progress."

**Result**: Merge continues seamlessly

**Alternative**: If reconnection fails after 2 minutes:
- Error modal: "Cannot reconnect. Merge is continuing on server. You'll receive an email when complete."
- "Close" button
- User closes overlay
- Receives email notification when merge finishes

---

### Error Flow 6: Merge Fails Partway Through

**Trigger**: Critical error stops merge execution midway.

**Divergence Point**: Step 5 (Merge Progress)

**What User Sees**:
- Merge in progress (Stage 4: Merging data sources)
- Error modal appears:
  - Icon: Error (red X)
  - Heading: "Merge Failed"
  - Message: "The merge could not be completed due to a critical error."
  - Details: "Error: Destination app reached storage limit (500MB). Cannot copy files."
  - Completed:
    - 8 screens merged
    - 0 data sources merged
    - 2 files copied (out of 4)
    - 0 settings updated
  - Actions: "View Partial Results", "Rollback Changes", "Contact Support"

**User Actions**:
1. Reads error details
2. Clicks "View Partial Results"

**System Actions**:
- Stops merge execution
- Releases locks on both apps
- Creates audit log entry with failure details
- Shows Merge Complete screen with partial results

**What User Sees on Merge Complete** (partial):
- Heading: "Merge Failed (Partial Results)"
- Warning: "Some items were merged before failure. Review changes carefully."
- Summary:
  - 8 screens merged (green checkmark)
  - 0 data sources merged (red X)
  - 2/4 files copied (orange warning)
  - 0 settings updated (red X)
- Error details: "Storage limit exceeded. Upgrade plan or free up space."
- Actions:
  - "View Destination App" (to review partial changes)
  - "Rollback Screens" (manual rollback via version history)
  - "Contact Support"
  - "View Audit Log"

**User Actions**:
3. Clicks "View Destination App"
4. Reviews merged screens
5. Decides to rollback using version history
6. Goes to each screen > Version History > Restore previous version

**Recovery**:
- User must manually rollback changed items
- User must resolve storage issue before retrying
- Audit log preserves full error trace

**Result**: Partial merge with manual cleanup required

---

## User Decision Points

### Decision Point 1: Organization Selection

**Location**: Step 2 (Select Destination)

**Question**: Which organization should receive the merged app?

**Options**:
1. Same organization as source (default)
2. Different organization (if user is App Publisher in multiple orgs)

**Factors to Consider**:
- Permission level in each org (must be App Publisher)
- Destination app location
- Cross-org merge permissions (org settings)

**Impact**:
- Affects which apps appear in selection table
- May require switching orgs in Studio after merge

---

### Decision Point 2: Destination App Selection

**Location**: Step 2 (Select Destination)

**Question**: Which app should receive the merge?

**Options**:
1. Existing app (merge into current version)
2. Different app

**Factors to Consider**:
- App name and purpose (Production, Staging, Test)
- Last modified date (avoid merging into recently edited apps)
- Live status (merging into live app affects end users)
- Lock status (must not be locked)

**Impact**:
- Determines what gets overwritten vs. copied
- Affects end users if destination is live

---

### Decision Point 3: Screen Selection

**Location**: Step 3a (Configure Merge - Screens Tab)

**Question**: Which screens should be merged?

**Options**:
1. All screens (default)
2. Subset of screens

**Factors to Consider**:
- Which screens have changes to deploy
- Dependencies (data sources, files used by screens)
- Screens that will overwrite vs. copy
- Screens with sensitive content (SSO, payments)

**Impact**:
- Selected screens will overwrite matching names in destination
- Associated dependencies may need to be selected
- SSO/sensitive screens won't copy settings (must reconfigure)

---

### Decision Point 4: Data Source Mode Selection

**Location**: Step 3b (Configure Merge - Data Sources Tab)

**Question**: For each data source, copy all rows or structure only?

**Options**:
1. **All rows**: Copy structure + all data entries
2. **Structure only**: Copy column definitions without data

**Factors to Consider**:
- Sensitive data (production data should not go to test environments)
- Data volume (large datasets take longer)
- Destination environment purpose (test vs. production)
- Existing data in destination (will be overwritten)

**Impact**:
- "All rows": Replaces all data in destination DS (goes live immediately)
- "Structure only": Preserves destination data, only updates columns

**Common Scenarios**:
- Dev → Production: Structure only (don't overwrite prod data)
- Production → Dev: All rows (get realistic test data)
- Template → New App: All rows (populate empty app)

---

### Decision Point 5: File/Folder Mode Selection

**Location**: Step 3c (Configure Merge - Files Tab)

**Question**: For each folder, copy folder only or all files?

**Options**:
1. **Folder only**: Create folder structure without files
2. **All files**: Copy folder + all contained files

**Factors to Consider**:
- Folder purpose (form upload folders vs. image libraries)
- File count and size (large folders take time)
- Existing files in destination (will be renamed with timestamp)

**Impact**:
- "Folder only": Creates empty folder (useful for form field references)
- "All files": Copies all content (useful for media libraries)

**Common Scenarios**:
- Form upload folders: Folder only (just need structure)
- Image/media libraries: All files (need assets)

---

### Decision Point 6: App Settings Inclusion

**Location**: Step 3d (Configure Merge - Settings Tab)

**Question**: Which app-level settings should be merged?

**Options** (checkboxes):
1. Merge app settings (name, icon, slug, navigation)
2. Merge menu settings (menu type, menu list)
3. Merge global appearance (CSS variables, theme, fonts)
4. Merge global code (JS, CSS, dependencies)

**Factors to Consider**:
- App name/branding (may want different in each environment)
- Global code changes (will overwrite, but version history preserved)
- Menu structure differences
- Appearance customizations

**Impact**:
- App settings: May require republishing app
- Global code: Overwrites destination (version history for rollback)
- Menu: Changes navigation structure
- Appearance: Changes visual theme

**Common Scenarios**:
- Bug fix deploy: Merge global code only
- Feature deploy: Merge screens + global code
- Full clone: Merge all settings

---

### Decision Point 7: Final Confirmation

**Location**: Step 4 (Review & Merge)

**Question**: Proceed with merge or edit configuration?

**Options**:
1. Start Merge (irreversible)
2. Edit Configuration (go back to Step 3)
3. Cancel (abort merge)

**Factors to Consider**:
- Conflicts present (must be 0 to proceed)
- Number of overwrites (orange badges)
- Warnings about live changes
- Lock time remaining (enough to complete)

**Impact**:
- Start Merge: Locks remain, merge begins (cannot cancel)
- Edit: Returns to configuration (preserve selections)
- Cancel: Releases locks, clears state (start over)

**Critical Checks**:
- No conflicts (red badges)
- Understand what will overwrite
- Aware of live impact
- Have time to complete (lock not expiring soon)

---

## Summary of User Paths

### Happy Path Summary
1. Dashboard → Select Destination → Configure (4 tabs) → Review → Execute → Complete
2. Duration: 10-15 minutes total
3. Result: Successful merge, apps unlocked, user in destination app

### Most Common Alternative Paths
1. **Extend lock during configuration** (lock management)
2. **Edit configuration from Review screen** (fix issues before merge)
3. **Close overlay during merge** (background continuation)
4. **Partial selection** (only merge specific items)

### Most Common Error Paths
1. **Lock expired** (user inactive too long)
2. **Conflicts detected** (duplicate names, missing dependencies)
3. **API error during execution** (retry/skip individual items)
4. **Network failure** (auto-reconnect and continue)

---
