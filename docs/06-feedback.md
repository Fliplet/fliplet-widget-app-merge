# UI Design Feedback

- Users should be able to see the merge history for the source app when the interface initially loads.
- They will navigate back to this dashboard screen after starting a merge to see the progress.
- Instead of showing a final step to monitor progress, users should return to the dashboard.
- Users should also be able to review the merge logs.
- To start a new merge, users need to select a destination app, which indicates whether it is live or not published.
- If users belong to multiple organizations, they should first select one organization to see the corresponding apps.
- If the selected app contains multiple duplicated item names (data source names or screen names), users cannot continue.
- Users will be informed about the duplicates and shown the specific duplicated names.
- To proceed, users must rename the duplicated items through a link labeled "open app."
- When configuring Emerge and selecting screens, users should see the number of related data sources and files.
- Users should be able to utilize nested tables for related data sources and files to select which ones to include in the merge.
- The table already includes Select All and Select None checkboxes, so there shouldn't be any need outside the table to include select all `dataSources`.
- When selecting each `dataSource`, if a `dataSource` is selected, there should be a column that shows a dropdown where the user can choose to either copy columns and data or copy columns only, with no data.
- It is important to indicate that for app settings, menu settings, and theme appearance settings, these actions cannot be undone after the merge is completed.
- The settings designs currently show the setting names in a non-bold font, whereas the descriptions are in bold, which creates quite a mismatch in visual hierarchy.
- The status column in this screen table doesn't appear to make sense or seem to be needed.
- Each child of `.space-y-6` creates a space between the content via a margin. However, there are containers that don't have such a margin/space in between, which creates a visual glitch, e.g. the Review your merge configuration is in a boxed container but is directly touching the Screens container in Review Merge Summary. The "Summary" box is also touch the containers around them, creating a visual design error.
- User should be able to click Cancel in the Review Merge Summary state to go back to the dashboard in the beginning. However, the user should be warned first that they will lose the merge configuration.
- "Contains non-copyable components" should include a link for users to learn more.
- Settings are always overwritten, so there's no differentiation between "New" and "Update"
- The "The merge will continue even if you close this window. You can check the audit log for completion status." message is at the bottom, which means the message keeps getting pushed away.

# Integration Feedback

## Overview

This section documents the cross-reference analysis between the UI implementation and the middleware/REST API to verify compatibility and identify any gaps or required adjustments.

## Summary of Findings

### ✅ Well-Supported Features
- Basic CRUD operations for apps, pages, data sources, and files
- App locking mechanism for merge operations
- Merge initiation and status checking
- Pagination and filtering capabilities
- Field selection for optimized queries

### ⚠️ Areas Requiring Attention
1. **Field name mismatches** between UI and API
2. **Association data** availability and structure
3. **Computed fields** (e.g., hasPublisherRights, isDuplicate) not returned by API
4. **Plan limit validation** implementation details
5. **Real-time progress monitoring** structure
6. **Audit log and merge history** retrieval

---

## Component-by-Component Analysis

### 1. MergeDashboard.vue

**UI Data Requirements:**
```javascript
{
  id, name, organizationName, region,
  isPublished, updatedAt, updatedBy, lockedUntil
}
```

**API Endpoint:** `GET v1/apps/:appId`

**Questions:**
- ❓ Does the app object include `organizationName` or only `organizationId`?
  - **Answer**: Only `organizationId` is returned, UI will need to fetch organization details via `GET v1/organizations/:id` if it's actually necessary
- ❓ Does the response include `isPublished`, `updatedAt`, and `updatedBy` fields?
  - **Answer**: Response includes `productionAppId`, which if it isn't null, then the app is published. It does include `updatedAt`, but not `updatedBy`. The UI should be fixed accordingly.

**Status:** 🟡 Minor adjustments may be needed

---

### 2. DestinationSelector.vue

**UI Data Requirements:**
```javascript
{
  id, name, organizationId, updatedAt,
  isLive, isLocked, hasPublisherRights, isDuplicate
}
```

**API Endpoints:**
- `GET v1/apps?publisher=true&mergeable=true`
- `POST v1/apps/:appId/duplicates`

**Issues Identified:**
1. **Performance Issue - N+1 Queries:**
   - UI expects `isDuplicate` field on each app in the list (line 273, 293-294 in DestinationSelector.vue)
   - API requires a separate POST request to check duplicates for each app
   - **Impact**: If there are 50 apps, this would require 50+ API calls

   **Recommended Solution (No API Changes):**
   - ✅ UI should only check duplicates for the **selected** app when user clicks "Next"
   - ✅ Show validation error at that point if duplicates exist
   - Remove the `isDuplicate` pre-filtering from the app list
   - This matches feedback item #9: "Users will be informed about the duplicates... To proceed, users must rename the duplicated items through a link labeled 'open app'"

2. **Field Name Mismatch:**
   - UI uses `isLive` (line 201)
   - API likely returns `isPublished`
   - **Answer**: See above about `productionAppId`

3. **Computed Fields:**
   - `hasPublisherRights`: The `GET v1/apps/:appId` endpoint returns a `user` property where the `userRoleId` of 1 means they are a publisher. Path: `app.users[0].userRoleId`. `0` might not be the right index. Check which of the user's email matches the current user via `GET v1/user`. The user's email can be found at path `user.email`.
   - `isLocked`: Derived from `lockedUntil`
   - **Recommendation**: UI should derive these from available fields

**Status:** 🔴 Requires UI changes to avoid N+1 queries

---

### 3. ScreensTab.vue

**UI Data Requirements:**
```javascript
{
  id, name, lastModified, hasNonCopyableComponents,
  associatedDataSources: [{id, name}],
  associatedFiles: [{id, name}]
}
```

**API Endpoint:** `GET v1/apps/:appId/pages?include=associatedDS,associatedFiles`

**Questions:**
- ❓ Does the API return `associatedDataSources` and `associatedFiles` when `include` parameter is used?
  - **API Service** (PagesApiService.js:30) supports `include` with values 'associatedDS' and 'associatedFiles'
  - **Answer**: Yes, it includes the number of associated data sources and files

- ❓ What is `hasNonCopyableComponents` and how is it determined?
  - UI displays "Limited copy support" status for screens with non-copyable components (line 170)
  - UI feedback item #21 mentions "Contains non-copyable components" should include a learn more link
  - **Action**: That's certain components such a SAML2, but API won't be providing this level of detail so we only need to inform people about this at a global level as information. There's no need to check whether it applies to the app or page.

- ❓ Terminology: Does the API use "pages" or "screens"?
  - **API uses**: `/pages` endpoints
  - **UI uses**: "screens" terminology throughout
  - **Recommendation**: "Screens" are used as a user-facing terminology for "pages"

**Status:** 🟡 Need to verify association structure

---

### 4. DataSourcesTab.vue

**UI Data Requirements:**
```javascript
{
  id, name, lastModified, entryCount, isGlobalDependency,
  associatedScreens: [{id, name}],
  associatedFiles: [{id, name}]
}
```

**API Endpoint:** `GET v1/data-sources?appId=X&include=...`

**Questions:**
- ❓ What `include` options are available for data sources?
  - API Service (DataSourcesApiService.js:29) mentions include parameter but doesn't specify values
  - **Answer**: Yes. See @docs/05-api-tech-spec.md

- ❓ Does the API return `entryCount` (number of rows) for each data source?
  - UI displays this in the table (line 229: `entryCount: ds.entryCount || 0`)
  - **Answer**: Yes it's returned as "entriesCount". See @docs/05-api-tech-spec.md

- ❓ Does the API return `isGlobalDependency` field?
  - UI displays "Global dependency" status (line 231)
  - API Service supports filtering by `hasGlobalDependency` (line 84)
  - **Answer**: No, but if `associatedPages` (which is expected to be a list of page objects) is an empty array, then it's assumed to be a global dependency

- ❓ Terminology: `associatedScreens` or `associatedPages`?
  - **Answer**: associatedPages

**Status:** 🟡 Need to verify field names and association structure

---

### 5. FilesTab.vue

**UI Data Requirements:**
```javascript
{
  id, name, type, path, addedAt, isGlobalLibrary,
  associatedScreens: [{id, name}],
  associatedDataSources: [{id, name}],
  children: [] // for folders
}
```

**API Endpoint:** `GET v1/media?appId=X&include=...`

**Questions:**
- ❓ What `include` options are available for media/files?
  - API Service (MediaApiService.js) mentions include but doesn't specify supported values
  - **Answer**: `associatedPages,associatedDS`

- ❓ Does the API return `isGlobalLibrary` field?
  - UI displays "Global library" status (line 194)
  - **Answer**: No. Maybe we don't need it in the UI.

- ❓ Are folder `children` included automatically or via a parameter?
  - UI expects nested children for folders (line 270-272)
  - **Action**: Verify how folder hierarchies are returned

- ❓ Does the API return separate `files` and `folders` arrays?
  - API Service comments suggest "Object with files and folders arrays" (from exploration)
  - UI expects a flat array with type differentiation
  - **Answer**: Yes, separate files and folders arrays

**Status:** 🟡 Need to verify response structure

---

### 6. SettingsTab.vue

**UI Data Requirements:**
- Four boolean flags for app-level settings (no API call needed)
- Framework version comparison for warnings

**Questions:**
- ❓ How do we get framework version for both source and destination apps?
  - UI needs to show "framework version mismatch warning" (feedback item #17)
  - **Answer**: No

**Status:** 🟡 Minor - need framework version field

---

### 7. MergeReview.vue

**UI Data Requirements:**
```javascript
{
  screens: [{ id, name, status, warnings[] }],
  dataSources: [{ id, name, copyMode, status, warnings[] }],
  files: [{ id, name, path, type, status, warnings[] }],
  configurations: [{ type, label, description, status }]
}
```

**API Endpoint:** `POST v1/apps/:appId/merge/preview`

**Critical Questions:**
- ❓ What does the merge preview endpoint return?
  - UI expects detailed analysis with status (copy/overwrite/conflict) for each item
  - UI expects warnings array per item
  - **This is a critical endpoint** - needs detailed specification
  - **Answer**: See @docs/05-api-tech-spec.md

- ❓ Does the preview validate plan limits?
  - UI expects `planLimits` data (lines 395-399, 421-456)
  - **Answer**: When checking the merge status with `POST /v1/apps/:sourceAppId/merge/status` that's where you'll see `limitWarnings` to understand if any limits have been breached. See @docs/05-api-tech-spec.md

- ❓ How are conflicts detected?
  - UI shows conflict badges and blocks merge if conflicts exist (line 407, 415)
  - **Action**: Clarify conflict detection logic (name collisions? other?)

- ❓ Status values: Are they "copy", "overwrite", "conflict"?
  - UI uses these statuses (line 557-564)
  - **Answer**: There won't be any conflicts. Conflicts only exist in the notion of merge for tools like GitHub because there's a notion of timeline in branches. This doesn't exist as a concept in Fliplet, so whichever one that is being merged over is either copied or overwritten. There is no sense of conflict in Fliplet's merge feature.

**Status:** 🔴 Critical - need complete preview endpoint specification

---

### 8. MergeProgress.vue

**UI Data Requirements:**
```javascript
{
  percentage: 0-100,
  phase: 'initializing' | 'copying-screens' | etc,
  logs: [{
    status: 'completed' | 'in-progress' | 'error' | 'pending',
    text: string,
    count: number,
    currentIndex: number,
    timestamp: number
  }]
}
```

**API Endpoint:** `POST v1/apps/:appId/merge/status?mergeId=X`

**Questions:**
- ❓ What is the structure of the merge status response?
  - **Answer**: See @docs/05-api-tech-spec.md

- ❓ Does the response include a `logs` array with the above structure?
  - UI displays activity log with icons for each status (lines 68-123)
  - **Answer**: See @docs/05-api-tech-spec.md for `POST /v1/apps/:appId/logs`

- ❓ What are the possible `phase` values?
  - UI expects: initializing, copying-screens, copying-datasources, copying-files, copying-configurations, finalizing, completed, error (lines 175-187)
  - **Action**: See list of audit logs in @docs/05-api-tech-spec.md which will help determine what phase it is in

- ❓ Is this polling-based (UI polls every X seconds)?
  - Current middleware has polling with 2-second interval
  - UI simulates this with mock data (lines 315-350)
  - **Answer**: Yes, polling based every 5 seconds

- `mergeId` is expected as part of the request body, not a query parameter

**Status:** 🟡 Need response schema specification

---

### 9. MergeComplete.vue

**UI Data Requirements:**
```javascript
{
  results: {
    screensCopied: number,
    dataSourcesCopied: number,
    filesCopied: number,
    configurationsCopied: number,
    issues: [string],
    planLimitWarnings: [string]
  },
  previousMerges: [{
    id, completedAt, sourceAppName,
    targetAppName, itemsCount, status
  }]
}
```

**API Endpoints:**
- Final status from `POST v1/apps/:appId/merge/status`
- Logs from `POST v1/apps/:appId/logs`

**Questions:**
- ❓ Does the final merge status include summary counts?
  - UI displays counts for items copied (lines 55-87)
  - **Answer**: See @docs/05-api-tech-spec.md for the detailed response structure for pages, data sources and files

- ❓ How do we get "Recent Merges" history?
  - UI displays a table of previous merges (lines 160-215)
  - **Option 1**: Use logs endpoint with filtering
  - **Option 2**: Need a dedicated merge history endpoint
  - **Answer**: Option 1 `POST /v1/apps/:appId/logs` and filter by `app.merge.initiated` log type, which will allow you to read the app merge IDs

- ❓ What does the logs endpoint return?
  - API: `POST v1/apps/:appId/logs` with mergeId filter
  - **Answer**: See @docs/05-api-tech-spec.md

**Status:** 🟡 Need merge history solution

---

## Data Mapping Issues

### Field Name Mismatches

| UI Field | Possible API Field | Component | Status |
|----------|-------------------|-----------|---------|
| `organizationName` | `organizationId` only? | MergeDashboard | ❓ Verify |
| `isLive` | `isPublished` | DestinationSelector | ❓ Verify |
| `updatedBy` | exists? | MergeDashboard | ❓ Verify |
| `associatedScreens` | `associatedPages`? | DataSourcesTab, FilesTab | ❓ Verify |
| `associatedDataSources` | `associatedDS`? | ScreensTab | ✅ Likely OK |

---

## Missing Computed Fields

These fields are expected by the UI but not returned by the API:

| Field | Component | Current Handling | Recommendation |
|-------|-----------|------------------|----------------|
| `hasPublisherRights` | DestinationSelector | Hardcoded in mock | ✅ Derive from user permissions client-side OR add to API |
| `isDuplicate` | DestinationSelector | Needs per-app check | ✅ Check only on selected app (UI change) |
| `isLocked` | DestinationSelector, MergeDashboard | Derived from `lockedUntil`? | ✅ Derive: `lockedUntil > Date.now()` |
| `hasNonCopyableComponents` | ScreensTab | Unknown source | ❓ Verify if API provides this |

---

## Performance Considerations

### N+1 Query Problem
**Location**: DestinationSelector.vue

**Issue**: UI expects `isDuplicate` for each app in the list, requiring:
- 1 query to fetch apps
- N queries to check duplicates for each app

**Solution (No API changes needed):**
1. Remove `isDuplicate` from initial app list display
2. Check duplicates only when user selects an app and clicks "Next"
3. Display validation error if duplicates found, with link to "open app"
4. This aligns with feedback item #9-11

**Implementation Change:**
```javascript
// BEFORE: Check duplicates for all apps (N+1 queries)
apps.forEach(app => {
  app.isDuplicate = await checkDuplicates(app.id);
});

// AFTER: Check only for selected app
async handleNext() {
  const duplicates = await checkDuplicates(this.selectedAppId);
  if (duplicates.pages.length || duplicates.dataSources.length) {
    this.validationError = `Cannot select "${app.name}" because it contains duplicate screen or data source names. Please rename these items first.`;
    return;
  }
  this.$emit('app-selected', app);
}
```

---

## Critical Missing Specifications

These API endpoint responses need complete documentation:

### 1. **Merge Preview Endpoint** 🔴 HIGH PRIORITY
`POST v1/apps/:appId/merge/preview`

**Need to document:**
- Complete response schema
- How conflicts are detected and reported
- How plan limits are validated
- Status value conventions (copy, overwrite, conflict)
- Warnings structure and types

**Used by**: MergeReview.vue (blocking merge if issues found)

### 2. **Merge Status Endpoint** 🟡 MEDIUM PRIORITY
`POST v1/apps/:appId/merge/status`

**Need to document:**
- Response schema with progress data
- Logs array structure
- Phase naming conventions
- Final result summary structure

**Used by**: MergeProgress.vue, MergeComplete.vue

### 3. **Merge History** 🟡 MEDIUM PRIORITY

**Need to clarify:**
- How to retrieve list of recent merges for an app or organization
- Is this via the logs endpoint or a dedicated endpoint?
- What fields are available?

**Used by**: MergeComplete.vue

---

## Recommendations

### For UI Changes (No API Changes Needed)

1. **✅ DestinationSelector Performance Fix**
   - Change duplicate checking to happen only for selected app
   - Remove isDuplicate from initial list filtering
   - Show validation error with "open app" link when duplicates detected

2. **✅ Derive Computed Fields Client-Side**
   - `isLocked`: Check if `lockedUntil > Date.now()`
   - `hasPublisherRights`: Check from user's role/permissions data

3. **✅ Add Field Name Mappings**
   - Map API field names to UI field names where they differ
   - Example: `isPublished` → `isLive`, `organizationId` → fetch organization name if needed

### For API Clarification (No Changes, Just Documentation)

1. **📋 Document Complete Response Schemas** for:
   - Merge preview endpoint
   - Merge status endpoint
   - Apps endpoint (all fields)
   - Pages/Data Sources/Media endpoints with associations

2. **📋 Confirm Field Names** that the UI is expecting (see mapping table above)

3. **📋 Clarify Merge History** retrieval approach

### For Potential API Enhancements (If Absolutely Necessary)

These would improve UX but are NOT required if the above clarifications show alternative approaches:

1. **Organization Name in App Object** (Optional)
   - Add `organizationName` to app response to avoid extra lookup
   - Alternative: UI can fetch organization separately

2. **Batch Duplicate Checking** (Optional)
   - `POST v1/apps/duplicates` accepting array of app IDs
   - Alternative: UI only checks selected app (recommended above)

3. **Merge History Endpoint** (If logs endpoint insufficient)
   - `GET v1/apps/:appId/merge-history`
   - Alternative: Filter logs endpoint by merge type

---

## Next Steps

1. ✅ **Backend Team**: Review this document and provide:
   - Confirmation of field names and structures
   - Complete API response schemas for critical endpoints (preview, status, history)
   - Clarification on any unknowns marked with ❓

2. ✅ **Frontend Team**: Based on backend responses:
   - Implement DestinationSelector performance fix (remove N+1 queries)
   - Add field mappings where needed
   - Update mock data to match actual API structures

3. ✅ **Both Teams**: Schedule integration testing session to verify all interactions work as expected
