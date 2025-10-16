# Task List: Address UI Design and Integration Feedback

## Relevant Files

### UI Components
- `src/components/pages/MergeDashboard.vue` - Dashboard view showing source app info and merge history
- `src/components/pages/DestinationSelector.vue` - App selection with organization filtering
- `src/components/pages/MergeConfiguration.vue` - Main configuration container with tabs
- `src/components/tabs/ScreensTab.vue` - Screen selection with associations
- `src/components/tabs/DataSourcesTab.vue` - Data source selection with copy modes
- `src/components/tabs/FilesTab.vue` - File and folder selection
- `src/components/tabs/SettingsTab.vue` - App-level settings configuration
- `src/components/pages/MergeReview.vue` - Review merge configuration before execution
- `src/components/pages/MergeProgress.vue` - Real-time merge progress monitoring
- `src/components/pages/MergeComplete.vue` - Completion summary and next steps
- `src/Application.vue` - Root component managing workflow state

### Middleware/API Services
- `src/middleware/api/AppsApiService.js` - App-related API calls
- `src/middleware/api/PagesApiService.js` - Pages/screens API calls
- `src/middleware/api/DataSourcesApiService.js` - Data sources API calls
- `src/middleware/api/MediaApiService.js` - Files/media API calls
- `src/middleware/api/MergeApiService.js` - Merge operations API calls
- `src/middleware/api/OrganizationsApiService.js` - Organizations API calls

### Data Mapping/Utilities
- `src/middleware/utils/DataMapper.js` - Data transformation utilities (needs expansion)
- `src/utils/apiFieldMapping.js` - New: API to UI field mappings
- `src/utils/computedFields.js` - New: Computed field derivation logic

### Styling
- `src/styles/spacing.css` - New: Fix spacing consistency issues

### Notes
- Many UI components currently use mock data that needs to be replaced with actual API calls
- Field name mismatches need mapping layer (e.g., `entriesCount` → `entryCount`, `productionAppId` → `isPublished`)
- Some computed fields must be derived client-side (`isLocked`, `hasPublisherRights`, `isGlobalDependency`)
- N+1 query problem in DestinationSelector must be fixed by deferring duplicate check

## Tasks

### Phase 1: API Integration & Data Mapping

- [x] 1.0 Create API field mapping utilities
  - [x] 1.1 Create `src/utils/apiFieldMapping.js` with mapping functions for common field name mismatches
  - [x] 1.2 Add `mapAppFields()` function to handle: `productionAppId` → `isPublished` (boolean), `organizationId` → fetch org name if needed
  - [x] 1.3 Add `mapDataSourceFields()` function to handle: `entriesCount` → `entryCount`, `associatedPages` → `associatedScreens`
  - [x] 1.4 Add `mapPageFields()` function to handle: API pages → UI screens terminology
  - [x] 1.5 Add `mapMediaFields()` function to handle: separate files/folders arrays → flat array with type field
  - [x] 1.6 Create `src/utils/computedFields.js` for client-side derived fields
  - [x] 1.7 Add `isLocked(lockedUntil)` function to check if `lockedUntil > Date.now()`
  - [x] 1.8 Add `hasPublisherRights(app, currentUser)` function to check `userRoleId === 1` for matching user email
  - [x] 1.9 Add `isGlobalDependency(dataSource)` function to check if `associatedPages.length === 0`
  - [x] 1.10 Export all mapping and computed functions for use in components

- [x] 2.0 Fix DestinationSelector N+1 query performance issue
  - [x] 2.1 Remove `isDuplicate` field from mock data in DestinationSelector.vue (line 273)
  - [x] 2.2 Remove `isDuplicate` check in `isAppDisabled()` method (line 293)
  - [x] 2.3 Update `handleNext()` method to call `checkDuplicates()` for selected app only
  - [x] 2.4 Add duplicate checking logic: call `POST v1/apps/:appId/duplicates` with `items: ['pages', 'dataSources']`
  - [x] 2.5 If duplicates found, set `validationError` with message listing duplicate names
  - [x] 2.6 Add "Open app" link in validation error message (use `Fliplet.Navigate.url()` to construct app edit URL)
  - [x] 2.7 Display duplicate names in error message (e.g., "Duplicate screens: Home, Profile. Duplicate data sources: Users")
  - [x] 2.8 Only emit `app-selected` event if no duplicates found
  - [x] 2.9 Add loading state during duplicate check
  - [x] 2.10 Test with app containing duplicates to verify error message and blocking behavior

- [x] 3.0 Integrate MergeDashboard with real API data
  - [x] 3.1 Import `AppsApiService` and initialize in component
  - [x] 3.2 Replace mock data in `loadAppDetails()` with `await appsApiService.fetchApp(this.sourceAppId)`
  - [x] 3.3 Apply field mapping: use `mapAppFields()` to transform API response
  - [x] 3.4 Map `productionAppId` to `isPublished`: `isPublished: !!app.productionAppId`
  - [x] 3.5 Remove `updatedBy` field (not provided by API) - update UI to show only date
  - [x] 3.6 Fetch organization name if needed: call `OrganizationsApiService.fetchOrganization(app.organizationId)` for `organizationName`
  - [x] 3.7 Calculate `isLocked` using `computedFields.isLocked(app.lockedUntil)`
  - [x] 3.8 Fetch current user info via `GET v1/user` and store for publisher rights check
  - [x] 3.9 Calculate `hasPublisherRights` using `computedFields.hasPublisherRights(app, currentUser)`
  - [x] 3.10 Update error handling to show user-friendly messages
  - [x] 3.11 Remove mock data and TODO comments (lines 235-247)

- [x] 4.0 Integrate DestinationSelector with real API data
  - [x] 4.1 Import `AppsApiService` and `OrganizationsApiService`
  - [x] 4.2 Replace mock organizations data in `loadOrganizations()` with real API call to `organizationsApiService.fetchOrganizations()`
  - [x] 4.3 Replace mock apps data in `loadApps()` with `appsApiService.fetchApps()` using filters: `{ publisher: true, mergeable: true }`
  - [x] 4.4 Apply field mappings to each app in the list
  - [x] 4.5 Map `productionAppId` to `isLive` for display: `isLive: !!app.productionAppId`
  - [x] 4.6 Calculate `isLocked` for each app using computed field helper
  - [x] 4.7 Fetch current user and calculate `hasPublisherRights` for each app
  - [x] 4.8 Filter out source app from destination list: `apps.filter(app => app.id !== this.sourceAppId)`
  - [x] 4.9 Remove apps where user lacks publisher rights or app is locked from selectable list
  - [x] 4.10 Update `tableRows` computed property to use mapped field names
  - [x] 4.11 Remove all mock data (lines 241-275)

- [x] 5.0 Integrate ScreensTab with real API data
  - [x] 5.1 Import `PagesApiService` in ScreensTab.vue
  - [x] 5.2 Replace mock data in `loadScreens()` with `pagesApiService.fetchPages(this.sourceAppId, { include: ['associatedDS', 'associatedFiles'] })`
  - [x] 5.3 Map API field names: `associatedDS` → `associatedDataSources`, `associatedFiles` (verify naming)
  - [x] 5.4 Remove `hasNonCopyableComponents` field and related UI logic (API doesn't provide this, will show global info banner instead)
  - [x] 5.5 Update status column to remove "Limited copy support" status (line 170)
  - [x] 5.6 Verify association structure matches expected format: `[{id, name}]` for both data sources and files
  - [x] 5.7 Handle case where associations are returned as IDs only vs full objects (transform if needed)
  - [x] 5.8 Update `screenRows` computed property to handle real API data structure
  - [x] 5.9 Remove mock data and setTimeout (lines 238-278)
  - [x] 5.10 Test expandable rows and nested selection with real data

- [x] 6.0 Integrate DataSourcesTab with real API data
  - [x] 6.1 Import `DataSourcesApiService` in DataSourcesTab.vue
  - [x] 6.2 Replace mock data in `loadDataSources()` with `dataSourcesApiService.fetchDataSources(this.sourceAppId, { include: ['associatedPages', 'associatedFiles'] })`
  - [x] 6.3 Map field name: `entriesCount` (API) → `entryCount` (UI) in component data
  - [x] 6.4 Map field name: `associatedPages` → `associatedScreens` for UI consistency
  - [x] 6.5 Calculate `isGlobalDependency` using computed helper: `computedFields.isGlobalDependency(dataSource)`
  - [x] 6.6 Update status display to show "Global dependency" when `isGlobalDependency === true`
  - [x] 6.7 Verify association structures match expected format
  - [x] 6.8 Update `dataSourceRows` computed property for real API data
  - [x] 6.9 Remove mock data (lines 297-334)
  - [x] 6.10 Test copy mode dropdown and nested associations with real data

- [x] 7.0 Integrate FilesTab with real API data
  - [x] 7.1 Import `MediaApiService` in FilesTab.vue
  - [x] 7.2 Replace mock data in `loadFiles()` with `mediaApiService.fetchMedia(this.sourceAppId, { include: ['associatedPages', 'associatedDS'] })`
  - [x] 7.3 Handle response structure: API returns `{ files: [], folders: [] }` - merge into single array for UI
  - [x] 7.4 Add `type` field to each item based on source array (files vs folders)
  - [x] 7.5 Map `associatedDS` → `associatedDataSources` and `associatedPages` → `associatedScreens`
  - [x] 7.6 Remove `isGlobalLibrary` status display (API doesn't provide this field, not needed per feedback)
  - [x] 7.7 Verify folder `children` structure - flatten if needed or handle nested display
  - [x] 7.8 Update `fileRows` computed property to handle merged files/folders array
  - [x] 7.9 Remove status column display of "Global library" and "Unused" (line 194)
  - [x] 7.10 Remove mock data (lines 260-284)
  - [x] 7.11 Test folder expansion and folder options dropdown with real data

- [x] 8.0 Integrate MergeReview with real API preview endpoint
  - [x] 8.1 Import `MergeApiService` in MergeReview.vue
  - [x] 8.2 Build merge config object from Application.vue state (get selectedPages, selectedDataSources, etc.)
  - [x] 8.3 Replace mock data in `loadMergePreview()` with `mergeApiService.previewMerge(sourceAppId, mergeConfig)`
  - [x] 8.4 Parse preview response structure per `docs/05-api-tech-spec.md`
  - [x] 8.5 Map status values: verify API uses "copy" and "overwrite" (no "conflict" status exists per feedback)
  - [x] 8.6 Remove all conflict-related UI logic (lines 407-416, 42-45) - conflicts don't exist in Fliplet merge
  - [x] 8.7 Remove `hasConflicts` computed property entirely
  - [x] 8.8 Remove conflict row styling (`.bg-error/5` for conflict status)
  - [x] 8.9 Parse warnings array for each item type and display appropriately
  - [x] 8.10 Get plan limit warnings from merge status endpoint instead of preview (per feedback: check `POST /v1/apps/:sourceAppId/merge/status` for `limitWarnings`)
  - [x] 8.11 Update `canStartMerge` computed to only check plan limits (remove conflict check)
  - [x] 8.12 Update status label mapping: remove "Conflict" label (line 561)
  - [x] 8.13 Remove mock data (lines 484-545)
  - [x] 8.14 Test preview with various merge configurations

- [x] 9.0 Integrate MergeProgress with real API status polling
  - [x] 9.1 Import `MergeApiService` in MergeProgress.vue
  - [x] 9.2 Update `startMerge()` to use actual merge initiation (pass mergeId from parent)
  - [x] 9.3 Replace `simulateMergeProgress()` with real polling using `mergeApiService.getMergeStatus(sourceAppId, { mergeId })`
  - [x] 9.4 Set up polling interval at 5 seconds (per feedback, not 2 seconds)
  - [x] 9.5 Parse status response per `docs/05-api-tech-spec.md` structure
  - [x] 9.6 Map progress percentage from API response
  - [x] 9.7 Fetch logs separately via `mergeApiService.fetchMergeLogs(sourceAppId, { mergeId })`
  - [x] 9.8 Parse logs to determine current phase based on log types (per feedback: use audit log types to determine phase)
  - [x] 9.9 Map log entries to activity messages with correct status icons
  - [x] 9.10 Update `currentPhaseLabel` based on latest log type
  - [x] 9.11 Remove simulated phases array (lines 316-324)
  - [x] 9.12 Stop polling when status is "completed" or "error"
  - [x] 9.13 Pass mergeId as request body parameter, not query param (per feedback line 307)
  - [x] 9.14 Clean up polling interval on component unmount

- [x] 10.0 Integrate MergeComplete with real API results
  - [x] 10.1 Import `MergeApiService` in MergeComplete.vue
  - [x] 10.2 Accept mergeId as prop from parent component
  - [x] 10.3 Replace mock data in `loadMergeResults()` with final status call: `mergeApiService.getMergeStatus(sourceAppId, { mergeId })`
  - [x] 10.4 Parse summary counts from status response per `docs/05-api-tech-spec.md` structure
  - [x] 10.5 Map API field names to UI display names for counts
  - [x] 10.6 Extract issues/warnings from final status response
  - [x] 10.7 Extract plan limit warnings from `limitWarnings` field in status response
  - [x] 10.8 Fetch merge history: call `mergeApiService.fetchMergeLogs(sourceAppId, { types: ['app.merge.initiated'] })`
  - [x] 10.9 Parse log entries to build previousMerges array with fields: id, completedAt, sourceAppName, targetAppName, itemsCount, status
  - [x] 10.10 Extract merge IDs from log data to show recent merge operations
  - [x] 10.11 Format dates using `formatDate()` helper
  - [x] 10.12 Remove mock data (lines 338-367)
  - [x] 10.13 Test completion view with successful and failed merges

### Phase 2: UI Design Feedback Implementation

- [x] 11.0 Add merge history to MergeDashboard
  - [x] 11.1 Import `MergeApiService` in MergeDashboard.vue
  - [x] 11.2 Add `mergeHistory` data property to component
  - [x] 11.3 Create `loadMergeHistory()` method to fetch logs with type filter: `['app.merge.initiated']`
  - [x] 11.4 Parse logs to extract merge operations for the source app
  - [x] 11.5 Display merge history table in dashboard (reuse table structure from MergeComplete.vue)
  - [x] 11.6 Show columns: Date, Destination App, Items Merged, Status
  - [x] 11.7 Add click handler to view detailed merge results (navigate or show modal)
  - [x] 11.8 Handle empty state when no merge history exists
  - [x] 11.9 Add loading state for history fetch
  - [x] 11.10 Per feedback line 3: Users should see merge history when interface initially loads

- [x] 12.0 Fix visual hierarchy in SettingsTab
  - [x] 12.1 Update SettingsTab.vue to make setting names bold (currently non-bold per feedback line 17)
  - [x] 12.2 Make descriptions normal weight (currently bold, should be lighter)
  - [x] 12.3 Locate setting name display (likely in template around setting cards)
  - [x] 12.4 Add `font-semibold` or `font-bold` class to setting name element
  - [x] 12.5 Remove any bold styling from description text
  - [x] 12.6 Test visual hierarchy looks correct: names prominent, descriptions secondary
  - [x] 12.7 Verify consistent styling across all 4 setting cards

- [x] 13.0 Fix spacing/margin inconsistencies
  - [x] 13.1 Review feedback line 19: containers touching without proper spacing in MergeReview
  - [x] 13.2 Check `.space-y-6` usage in MergeReview.vue
  - [x] 13.3 Add proper spacing between "Review your merge configuration" container and "Screens" container
  - [x] 13.4 Add proper spacing around "Summary" box container
  - [x] 13.5 Ensure all child containers of `.space-y-6` have consistent margins
  - [x] 13.6 Check for any other spacing issues in MergeReview summary sections
  - [x] 13.7 Test responsive behavior to ensure spacing works on all screen sizes
  - [x] 13.8 Consider creating utility class or CSS variable for consistent container spacing

- [ ] 14.0 Add "Contains non-copyable components" info banner
  - [ ] 14.1 Remove per-screen `hasNonCopyableComponents` checking (already removed in task 5.0)
  - [ ] 14.2 Add global info banner at top of MergeConfiguration.vue or ScreensTab.vue
  - [ ] 14.3 Create banner text explaining non-copyable components (e.g., "Note: Some components like SAML2 authentication cannot be copied during merge")
  - [ ] 14.4 Add "Learn more" link in banner per feedback line 21
  - [ ] 14.5 Link should open help documentation about non-copyable components (use `Fliplet.Navigate.url()` for docs)
  - [ ] 14.6 Style as info banner (blue/informational, not warning)
  - [ ] 14.7 Make banner dismissible (use WarningBanner component with dismissable prop)
  - [ ] 14.8 Banner shows for all merges, not conditional on specific screens

- [ ] 15.0 Remove conflict status handling (conflicts don't exist in Fliplet merge)
  - [ ] 15.1 Search codebase for "conflict" status references
  - [ ] 15.2 In MergeReview.vue: remove conflict status from StatusBadge usage (line 98, 165, 233, 282)
  - [ ] 15.3 Remove conflict row highlighting: `.bg-error/5` conditional styling (lines 87, 152, 220, 268)
  - [ ] 15.4 Remove conflict warning banner and `hasConflicts` check (lines 40-45)
  - [ ] 15.5 Update `canStartMerge` computed to remove conflict validation (line 462-464)
  - [ ] 15.6 In StatusBadge.vue: remove "conflict" from status prop validation if present
  - [ ] 15.7 Update status label mapping to remove "Conflict" option (MergeReview.vue line 561)
  - [ ] 15.8 Remove any conflict-related CSS classes
  - [ ] 15.9 Update documentation/comments to clarify only "copy" and "overwrite" statuses exist
  - [ ] 15.10 Per feedback line 262-265: conflicts don't exist in Fliplet merge concept

- [ ] 16.0 Add cancel warning dialog in MergeReview
  - [ ] 16.1 Import or create ModalDialog component in MergeReview.vue
  - [ ] 16.2 Add `showCancelWarning` data property (boolean)
  - [ ] 16.3 Update `handleCancel()` method to show warning modal instead of immediately canceling
  - [ ] 16.4 Create modal dialog with warning message: "Are you sure? You will lose your merge configuration."
  - [ ] 16.5 Add two buttons in modal: "Keep Editing" and "Discard & Cancel"
  - [ ] 16.6 "Keep Editing" closes modal and stays on review page
  - [ ] 16.7 "Discard & Cancel" emits cancel event and navigates back to dashboard
  - [ ] 16.8 Emit `cancel` event only when user confirms discard
  - [ ] 16.9 Per feedback line 20: User should be warned they will lose merge configuration when canceling
  - [ ] 16.10 Test modal interaction and navigation flow

- [x] 17.0 Fix info banner positioning in MergeProgress
  - [x] 17.1 Locate info banner in MergeProgress.vue (lines 129-133): "The merge will continue even if you close this window..."
  - [x] 17.2 Per feedback line 23: message keeps getting pushed away at bottom
  - [x] 17.3 Move info banner to top of MergeProgress component (after header, before progress bar)
  - [x] 17.4 Use sticky positioning or fixed position so message stays visible
  - [x] 17.5 Alternatively, move inside header section for better visibility
  - [x] 17.6 Test with long activity logs to ensure message doesn't scroll out of view
  - [x] 17.7 Ensure message is visible when user first sees progress screen

- [x] 18.0 Remove unused status columns
  - [x] 18.1 Review feedback line 18: "status column in this screen table doesn't appear to make sense or seem to be needed"
  - [x] 18.2 Check which table this refers to (likely ScreensTab, DataSourcesTab, or FilesTab)
  - [x] 18.3 In ScreensTab.vue: evaluate if status column (line 159) is necessary
  - [x] 18.4 In DataSourcesTab.vue: evaluate if status column (line 221) is necessary
  - [x] 18.5 In FilesTab.vue: evaluate if status column (line 183) is necessary
  - [x] 18.6 Remove status column from table columns definition
  - [x] 18.7 Remove status data from row mapping
  - [x] 18.8 If status was showing "Ready", "Global dependency", etc., consider moving that info elsewhere or removing
  - [x] 18.9 Test table layout without status column
  - [x] 18.10 Verify information loss is acceptable (e.g., "Global dependency" shown elsewhere)

### Phase 3: Testing & Validation

- [x] 19.0 Add integration tests for API data flow
  - [x] 19.1 Create test file `src/components/pages/MergeDashboard.test.js`
  - [x] 19.2 Mock `AppsApiService` and `OrganizationsApiService`
  - [x] 19.3 Test MergeDashboard loads and displays app data correctly
  - [x] 19.4 Test field mappings: verify `productionAppId` → `isPublished` conversion
  - [x] 19.5 Test computed fields: verify `isLocked` and `hasPublisherRights` calculations
  - [x] 19.6 Create test file `src/components/pages/DestinationSelector.test.js`
  - [x] 19.7 Test duplicate checking only happens on "Next" click, not on initial load
  - [x] 19.8 Test validation error displays when duplicates found
  - [x] 19.9 Create test file `src/components/tabs/ScreensTab.test.js`
  - [x] 19.10 Test association data mapping and display
  - [x] 19.11 Create test file `src/components/tabs/DataSourcesTab.test.js`
  - [x] 19.12 Test `entriesCount` → `entryCount` mapping
  - [x] 19.13 Test global dependency detection (`associatedPages.length === 0`)
  - [x] 19.14 Create test file `src/components/tabs/FilesTab.test.js`
  - [x] 19.15 Test files/folders array merging
  - [x] 19.16 Create test file `src/components/pages/MergeReview.test.js`
  - [x] 19.17 Test conflict-related code is removed (should not render conflict states)
  - [x] 19.18 Test cancel warning modal appears on cancel click
  - [x] 19.19 Create test file `src/components/pages/MergeProgress.test.js`
  - [x] 19.20 Test polling mechanism with 5-second interval
  - [x] 19.21 Test mergeId passed as request body, not query param
  - [x] 19.22 Create test file `src/components/pages/MergeComplete.test.js`
  - [x] 19.23 Test merge history fetch and display
  - [x] 19.24 Run all tests: `npm test`

- [ ] 20.0 Test edge cases and error scenarios
  - [ ] 20.1 Test with user lacking publisher rights (should disable destination apps)
  - [ ] 20.2 Test with locked apps (should filter from destination list)
  - [ ] 20.3 Test with app containing duplicate pages (should show validation error)
  - [ ] 20.4 Test with app containing duplicate data sources (should show validation error)
  - [ ] 20.5 Test with empty organization list (should handle gracefully)
  - [ ] 20.6 Test with empty apps list (should show empty state)
  - [ ] 20.7 Test network errors during API calls (should show error messages)
  - [ ] 20.8 Test merge status API returns error status (should handle in progress view)
  - [ ] 20.9 Test plan limit warnings display correctly
  - [ ] 20.10 Test merge history with no previous merges (should show empty state)
  - [ ] 20.11 Test with single organization (should skip org selector)
  - [ ] 20.12 Test merge cancellation flow with warning modal
  - [ ] 20.13 Test merge progress when window is closed and reopened (polling should work)
  - [ ] 20.14 Test data source with zero entries (edge case for entryCount display)
  - [ ] 20.15 Test folder without children (edge case for folder display)

- [ ] 21.0 Validate all field mappings with actual API responses
  - [ ] 21.1 Call actual API endpoints in development environment
  - [ ] 21.2 Verify `GET v1/apps/:appId` response structure matches expectations
  - [ ] 21.3 Confirm `productionAppId` field exists and maps correctly to `isPublished`
  - [ ] 21.4 Confirm `updatedAt` exists but `updatedBy` does not (update UI accordingly)
  - [ ] 21.5 Verify `GET v1/apps/:appId/pages` with `include=associatedDS,associatedFiles` returns associations
  - [ ] 21.6 Confirm association field names: `associatedDS` and `associatedFiles`
  - [ ] 21.7 Verify `GET v1/data-sources?appId=X` returns `entriesCount` field
  - [ ] 21.8 Confirm `associatedPages` field name (not `associatedScreens`)
  - [ ] 21.9 Verify `GET v1/media?appId=X` returns separate `files` and `folders` arrays
  - [ ] 21.10 Verify `POST v1/apps/:appId/merge/preview` response structure per tech spec
  - [ ] 21.11 Confirm status values are "copy" and "overwrite" only (no "conflict")
  - [ ] 21.12 Verify `POST v1/apps/:appId/merge/status` with `mergeId` in body (not query)
  - [ ] 21.13 Confirm merge status response includes `limitWarnings` field
  - [ ] 21.14 Verify `POST v1/apps/:appId/logs` with type filter returns merge history
  - [ ] 21.15 Test with `types: ['app.merge.initiated']` to get merge IDs
  - [ ] 21.16 Verify `GET v1/user` returns user email for publisher rights check
  - [ ] 21.17 Confirm `app.users` array structure and `userRoleId` field
  - [ ] 21.18 Document any discovered field name differences in `apiFieldMapping.js`
  - [ ] 21.19 Update mapping functions if API structure differs from documentation
  - [ ] 21.20 Create validation report documenting all confirmed field mappings
