# App Merge UI - Glossary

This document defines terminology used throughout the App Merge UI, bridging technical and business language.

For project context and technical details, see [README.md](README.md).

---

## A

### App
A Fliplet application containing screens, data sources, files, and settings. Apps can be merged from one to another.

*Example*: "I'm merging my Sales Conference app into the 2024 production app."

### App ID
Unique numerical identifier for a Fliplet app.

*Example*: App ID 427998 is the App Merge UI itself.

### App Publisher
User role with permission to merge apps. Required on both source and destination apps for cross-organization merges.

### App Settings
Global configuration for an app including name, icon, slug, and various app-level properties.

*Technical*: Stored in `app.settings` JSON field.

### API Middleware
(Technical) JavaScript layer (MergeAPI) that handles all API calls between the UI and backend REST endpoints.

*Example*: `MergeAPI.fetchApps(organizationId)` instead of direct fetch calls.

### ARIA
(Technical) Accessible Rich Internet Applications - attributes that make web content more accessible to people with disabilities.

*Example*: `aria-expanded="true"` on accordion buttons.

---

## C

### Composition API
(Technical) Vue.js 3's recommended way of writing components using `setup()`, `ref()`, and `computed()`.

*Contrast with*: Options API (not used in this project).

### Configure Merge
The screen where users select which screens, data sources, files, and settings to merge. Has 4 tabs.

### Conflict
A merge operation that cannot proceed due to issues like duplicate names or missing dependencies. Shown in red.

For complete color-coding details, see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#status-colors-merge-operations).

### Copy (Green)
Merge operation that creates a new item in the destination app. No existing item with that name.

For complete color-coding details, see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#status-colors-merge-operations).

---

## D

### Dashboard
Entry screen for the merge flow. Shows source app information and prerequisites.

### Data Source (DS)
Structured data table in a Fliplet app. Contains rows and columns similar to a spreadsheet.

*Technical*: Backend database table with JSON column definitions.

*Example*: "User Registration" data source with columns for Email, Name, Phone.

### Data Source Entry
A single row of data in a data source.

*Technical*: Individual record in the database table.

### Data Source Mode
Choice when merging a data source:
- **All Rows**: Copy structure + all data rows
- **Structure Only**: Copy structure without data rows (partial merge)

### Destination App
The app you're copying **to** during a merge. Will be modified with new screens/data/files.

*Contrast with*: Source App (read-only)

*Example*: "Merge source app into destination: 'Production 2024 App'."

---

## E

### Expiry (Lock)
When a lock's 10-minute reservation runs out. User is prompted to extend or lose the lock.

---

## F

### Files
Media assets (images, PDFs, videos) stored in an app's file system. Organized in folders.

### Fliplet Studio
The web-based development environment where apps are built and managed.

### Fliplet.UI.Table
(Technical) Advanced JavaScript library for creating feature-rich tables with sorting, filtering, pagination.

*Used in*: Select Destination screen, Configure Merge tabs.

### Folder Merge Mode
Choice when merging a folder:
- **Folder Only**: Create folder structure without files
- **All Files**: Copy folder + all contained files

---

## G

### Global CSS
(Technical) Stylesheet applied to all screens in the app. Contains design tokens (CSS custom properties).

*Location*: App ID 427998 > Global CSS

### Global JavaScript (Global JS)
(Technical) JavaScript code that runs on every screen. Contains Vue components, state management, API middleware.

*Location*: App ID 427998 > Global JS

### Global State
(Technical) Shared data accessible from all components via `window.MergeState`.

---

## L

### Live App
A published version of an app accessible to end users.

*Contrast with*: Test App (under development).

### Loading State
Visual feedback (spinner, skeleton) shown while waiting for data to load.

*Technical*: Typically using `ref(false)` for loading boolean.

### Lock
Temporary 10-minute reservation on a destination app preventing others from merging to it simultaneously.

*Purpose*: Prevents merge conflicts from multiple users.

*Example*: "Lock acquired: 9:30 remaining"

### Lock Timer
Countdown display showing time remaining on a lock (displayed as MM:SS).

---

## M

### Merge
The process of copying selected screens, data sources, files, and settings from a source app to a destination app.

*Duration*: Typically 2-5 minutes for standard apps.

*Example*: "Starting merge of 8 screens, 2 data sources, 1 folder..."

### Merge Complete
Final screen showing results of a merge operation (successes, errors, next steps).

### Merge Logs
Historical records of all merge operations including changes made and any errors encountered.

*Access*: Via "View Audit Log" link on Dashboard.

### Merge Operations
The four types of actions during a merge: Copy (Green), Overwrite (Orange), Conflict (Red), and Partial (Blue).

For detailed descriptions, see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#status-colors-merge-operations).

### Merge Progress
Screen showing real-time updates during merge execution with stage-by-stage status.

### MergeAPI
(Technical) Global middleware object containing all API functions.

*Usage*: `window.MergeAPI.fetchApps(orgId)`

*See*: MIDDLEWARE_GUIDELINES.md

### MergeState
(Technical) Global state management object tracking source app, destination app, selections, and lock status.

*Usage*: `window.MergeState.selectedScreens`

### MergeStorage
(Technical) Wrapper around localStorage for persisting state between sessions.

*Usage*: `window.MergeStorage.set('mergeState', data)`

---

## O

### Organization (Org)
Collection of apps and users in Fliplet. Users can be members of multiple organizations.

*Example*: "Acme Corporation" organization contains 50 apps.

### Organization Admin
User role that can configure organization settings, including which organizations can receive merged apps.

### Overwrite (Orange)
Merge operation that replaces an existing item in the destination with the source version.

For complete color-coding details, see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#status-colors-merge-operations).

---

## P

### Partial (Blue)
Data source merge mode where only the structure is copied, not the data rows.

For complete color-coding details, see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#status-colors-merge-operations).

### Permissions
Access rights determining what users can do. Merge requires App Publisher rights.

### Prerequisites
Requirements that must be met before starting a merge (shown on Dashboard).

*Example*: User has merge permission, source app has content, user is in an organization.

---

## R

### Review & Merge
Screen where users preview their selections before starting the merge. Shows summary with color-coded status indicators.

---

## S

### Screen
A page or view in a Fliplet app. Contains widgets, layouts, and settings.

*Technical*: Database record with HTML, layout, dependencies, widget instances.

*Example*: "Home" screen, "Login" screen, "Settings" screen.

### Select Destination
Second screen in merge flow where user chooses which app to merge into.

### Source App
The app you're copying **from** during a merge. Read-only (not modified).

*Contrast with*: Destination App (will be modified)

*Example*: "Merge from source app: 'Sales Conference Template'."

### Status Badge
Small colored indicator showing count or state (green/orange/red/blue pills).

*Example*: "8 screens" badge in green.

---

## T

### Tab
Navigation element in Configure Merge screen. Four tabs: Screens, Data Sources, Files, Settings.

*Technical*: Implemented with tab-panel pattern, ARIA attributes.

### Test App
An app version under development or in staging, not yet published to end users.

*Contrast with*: Live App (published).

---

## U

### UI
User Interface - the visual elements users interact with.

*Technical stack*: Vue.js 3, Bootstrap 4, Fliplet.UI.Table

---

## V

### Version Control
System that tracks changes to screens, data sources, and global code. Allows rollback to previous versions after a merge.

*Scope*: Automatic for screens and data sources, manual rollback required.

### Vue.js 3
(Technical) JavaScript framework used to build the reactive UI. Uses Composition API.

*CDN*: https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js

---

## W

### Widget
Pre-built component or functionality in Fliplet apps (chat, login, list, etc.).

*Example*: "This screen uses the Chat widget and Image Carousel widget."

### Widget Instance
Specific instance of a widget on a screen with its own configuration.

*Technical*: Referenced in screen settings as `widgetInstancesInUse`.

---

## Common Abbreviations

| Abbreviation | Full Term | Meaning |
|--------------|-----------|---------|
| API | Application Programming Interface | Backend endpoints for data operations |
| ARIA | Accessible Rich Internet Applications | Accessibility attributes |
| CTA | Call To Action | Button prompting user action |
| DS | Data Source | Structured data table |
| JS | JavaScript | Programming language |
| Org | Organization | Collection of apps and users |
| PRD | Product Requirements Document | Specification document |
| UI | User Interface | Visual elements |
| UX | User Experience | How users interact with the system |
| WCAG | Web Content Accessibility Guidelines | Accessibility standards |

---

## Screen Names (in Merge Flow Order)

1. **Dashboard** - Entry point, shows source app
2. **Select Destination** - Choose organization and destination app
3. **Configure Merge** - Select items to merge (4 tabs)
   - Screens tab
   - Data Sources tab
   - Files tab
   - Settings tab
4. **Review & Merge** - Preview selections before execution
5. **Merge Progress** - Real-time status during merge
6. **Merge Complete** - Results and next steps

---

## Merge Operation Summary

| Operation | Color | Meaning | Technical Term |
|-----------|-------|---------|----------------|
| Copy | 🟢 Green | Create new item (no conflict) | INSERT |
| Overwrite | 🟠 Orange | Replace existing item | UPDATE |
| Conflict | 🔴 Red | Cannot merge (issues detected) | BLOCKED |
| Partial | 🔵 Blue | Structure only (no data) | STRUCTURE_ONLY |

---

## Quick Reference Card

### Key Concepts
- **Merge** = Copy from source TO destination
- **Source** = Read-only (what you're copying FROM)
- **Destination** = Modified (what you're copying TO)
- **Lock** = 15-minute reservation on destination
- **Green** = Copy (no conflicts)
- **Orange** = Overwrite (replace existing)
- **Red** = Conflict (cannot merge)

### Key Objects (Technical)
- `window.MergeState` = Global state
- `window.MergeAPI` = API middleware
- `window.MergeStorage` = Persistence layer

### Key Patterns
- Always use MergeAPI for backend calls
- Always show loading/error/success states
- Always acquire lock before modifying destination
- Always persist state for recovery

---
