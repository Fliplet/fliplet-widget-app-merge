# Configure Merge Screen

## Purpose

The Configure Merge screen is where users select which items to merge from the source app. It provides 4 tabs (Screens, Data Sources, Files, Settings) with detailed selection controls, dependency visualization, and merge mode options.

**User Goals**:
- Select specific screens, data sources, files, and settings to merge
- Understand dependencies between items (which screens use which data sources/files)
- Choose merge modes (all rows vs. structure only for data sources)
- Choose folder modes (folder only vs. all files)
- Review selection counts and prepare for Review screen
- Manage lock timer and extend if needed

---

## URL/Route

**Path**: `/configure-merge` or `#/configure-merge`

**Query Parameters**:
- `tab`: Optional. Active tab name (`screens`, `data-sources`, `files`, `settings`)
- Example: `#/configure-merge?tab=data-sources`

**Prerequisites**:
- User must have completed Select Destination screen
- Both source and destination apps locked in MergeState
- Lock timer active

---

## Layout Structure

### Screen Container
```
┌─────────────────────────────────────────────┐
│ Progress Indicator (Step 2 of 3)            │
├─────────────────────────────────────────────┤
│ Header: Source → Destination                │
│ Lock Timer: 14:30 remaining                 │
├─────────────────────────────────────────────┤
│ Warning: Apps Locked                        │
├─────────────────────────────────────────────┤
│ Tab Navigation                              │
│ [Screens] [Data Sources] [Files] [Settings] │
├─────────────────────────────────────────────┤
│ Tab Content Area (Dynamic)                  │
│                                             │
│ (See individual tab layouts below)          │
│                                             │
├─────────────────────────────────────────────┤
│ Selection Summary Badges                    │
│ 8 screens · 2 data sources · 5 files        │
├─────────────────────────────────────────────┤
│ Action Buttons                              │
│ [← Back]  [Cancel]  [Review & Merge →]      │
└─────────────────────────────────────────────┘
```

### 1. Header Section

**Content**:
- Source app name → Destination app name (with arrow icon)
- Lock timer: "14:30 remaining" (updates every second)
- Lock timer warning states:
  - Green: >5 minutes remaining
  - Orange: 2-5 minutes remaining (warning)
  - Red: <2 minutes remaining (urgent)
- Extend lock button (appears when <2 minutes)

**Visual**:
```
Sales Conference 2024  →  Production 2024 App

Lock expires in: 14:30  (green, clock icon)
```

**Warning state** (when <2 minutes):
```
Sales Conference 2024  →  Production 2024 App

⚠️ Lock expires in: 1:30  [Extend Lock +5 min]
```

### 2. Warning Banner

**Content**: "Apps are locked. You and other users cannot edit these apps until the merge completes or the lock expires."

**Style**: Orange background, informational (not dismissible)

### 3. Tab Navigation

**Tabs** (4 total):
1. **Screens** - Select screens to merge
2. **Data Sources** - Select data sources and modes
3. **Files** - Select files/folders and modes
4. **Settings** - Select app-level configurations

**Visual**:
```
┌─────────┬──────────────┬────────┬──────────┐
│ Screens │ Data Sources │ Files  │ Settings │
│   (8)   │     (2)      │  (5)   │   (2)    │
└─────────┴──────────────┴────────┴──────────┘
     ▲ Active (blue underline, badge count)
```

**Badge Counts**: Show number of selected items per tab

**States**:
- **Active**: Blue underline, bold text, badge visible
- **Inactive**: Gray text, badge visible (if >0 selected)
- **Keyboard**: Arrow Left/Right to switch tabs

---

## Tab 1: Screens

### Layout
```
┌─────────────────────────────────────────────┐
│ Instructions                                │
│ Select screens to merge. Matching names     │
│ will overwrite destination versions.        │
├─────────────────────────────────────────────┤
│ Table Controls                              │
│ Search: [____________]  Sort: [Last Modified▼]
│ [☑ Select All] 12 screens selected          │
├─────────────────────────────────────────────┤
│ Screens Table                               │
│ ┌──┬──────────────┬─────┬──────────┬────┐  │
│ │☑│ Screen Name  │ ID  │ Modified │ +  │  │
│ ├──┼──────────────┼─────┼──────────┼────┤  │
│ │☑│ Home         │5001 │ Dec 15   │ >  │  │ ← Expandable
│ │☑│ User List    │5002 │ Dec 14   │ v  │  │ ← Expanded
│ │  │ ├ Uses: Users DS (selected)         │  │
│ │  │ └ Uses: logo.png (selected)         │  │
│ │☑│ Profile      │5003 │ Dec 10   │ >  │  │
│ └──┴──────────────┴─────┴──────────┴────┘  │
└─────────────────────────────────────────────┘
```

### Instructions

**Text**: "Select screens to merge. Screens with matching names in the destination will be overwritten with the source version. New screens will be copied."

**Info callout**:
```
ℹ️ Version Control
Merged screens create new versions in the destination app.
You can rollback using the screen's version history.
```

### Table Controls

**Search**:
- Input box: "Search screens..."
- Searches screen name only
- Live filter (updates as user types)

**Sort**:
- Dropdown: "Sort by: Last Modified ▼"
- Options: Name (A-Z), Name (Z-A), Last Modified (Newest), Last Modified (Oldest), Screen ID

**Select All**:
- Checkbox: "Select All"
- Indeterminate state if partial selection
- Count: "12 screens selected"

### Screens Table

**Columns**:
1. **Checkbox** - Select/deselect screen
2. **Screen Name** - Name with expand/collapse icon (>)
3. **Screen ID** - Numeric ID
4. **Last Modified** - Relative time ("2 days ago") or date
5. **Expand** - Icon to show dependencies (> or v)

**Expandable Row** (Dependencies):
When row expanded, shows indented list:
- **Data Sources**: List of DSs used by screen
  - Indicator: (selected) or (not selected)
  - Click to jump to Data Sources tab with DS pre-selected
- **Files**: List of files used by screen
  - Indicator: (selected) or (not selected)
  - Click to jump to Files tab with file pre-selected

**Example Expanded Row**:
```
│☑│ User List    │5002 │ Dec 14   │ v │
│  │ Associated Items:               │
│  │ ├ 📊 Uses: Users (data source)  │ ✓ selected
│  │ ├ 📊 Uses: Settings (data source) │ ✗ not selected
│  │ ├ 📄 Uses: logo.png (file)      │ ✓ selected
│  │ └ 📄 Uses: banner.jpg (file)    │ ✓ selected
```

**Row States**:
- **Checked**: Blue checkbox, normal text
- **Unchecked**: Empty checkbox, gray text
- **Hover**: Light blue background
- **Expanded**: Blue left border (2px)

**Special Screen Handling**:
- Screens with sensitive settings (SSO, SAML): Show warning icon
  - Tooltip: "Settings will not be copied. You must reconfigure after merge."

### Component: ScreensTable

**Implementation**:
```javascript
const screensTableConfig = {
  columns: [
    {
      key: 'selected',
      type: 'checkbox',
      label: 'Select All',
      selectAll: true
    },
    {
      key: 'name',
      label: 'Screen Name',
      sortable: true,
      expandable: true,
      render: (value, row) => {
        const warningIcon = row.hasSensitiveSettings
          ? '<i class="fa fa-exclamation-triangle text-warning"></i> '
          : '';
        return `${warningIcon}${value}`;
      }
    },
    {
      key: 'id',
      label: 'Screen ID',
      sortable: true
    },
    {
      key: 'updatedAt',
      label: 'Last Modified',
      sortable: true,
      render: (value) => formatRelativeTime(value)
    }
  ],
  data: screens,
  expandable: {
    render: (row) => {
      return `
        <div class="dependencies">
          <h4>Associated Items:</h4>
          <ul>
            ${row.dataSources.map(ds => `
              <li>
                <i class="fa fa-database"></i>
                ${ds.name} (data source)
                <span class="${ds.selected ? 'text-success' : 'text-muted'}">
                  ${ds.selected ? '✓ selected' : '✗ not selected'}
                </span>
              </li>
            `).join('')}
            ${row.files.map(file => `
              <li>
                <i class="fa fa-file"></i>
                ${file.name} (file)
                <span class="${file.selected ? 'text-success' : 'text-muted'}">
                  ${file.selected ? '✓ selected' : '✗ not selected'}
                </span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
  },
  searchable: true,
  onSelectionChange: (selectedRows) => {
    MergeState.selectedScreens = selectedRows.map(r => r.id);
    updateBadgeCounts();
  }
};
```

---

## Tab 2: Data Sources

### Layout
```
┌─────────────────────────────────────────────┐
│ Instructions                                │
│ Select data sources to merge. Choose mode:  │
│ All rows or Structure only.                 │
├─────────────────────────────────────────────┤
│ Table Controls                              │
│ Search: [____________]  Sort: [Last Modified▼]
│ [☑ Select All] 2 data sources selected      │
├─────────────────────────────────────────────┤
│ Data Sources Table                          │
│ ┌──┬──────────┬────┬─────────┬──────┬────┐ │
│ │☑│ DS Name  │ ID │ Mode    │Assoc.│ +  │ │
│ ├──┼──────────┼────┼─────────┼──────┼────┤ │
│ │☑│ Users    │301 │[All rows▼]│ 3 │ >  │ │
│ │☑│ Settings │302 │[Structure▼]│ 1 │ v  │ │ ← Expanded
│ │  │ ├ Used by: Settings screen         │ │
│ │  │ └ Files: (none)                    │ │
│ │☐│ Analytics│303 │[All rows▼]│ 0 │ >  │ │
│ └──┴──────────┴────┴─────────┴──────┴────┘ │
├─────────────────────────────────────────────┤
│ ⚠️ Warning: Data source changes go live     │
│    immediately. Test thoroughly.            │
└─────────────────────────────────────────────┘
```

### Instructions

**Text**: "Select data sources to merge. Data sources with matching names will be merged with the destination. Choose whether to copy all rows or structure only."

**Info callout**:
```
ℹ️ Merge Modes
• All rows: Replaces destination data entirely (structure + data)
• Structure only: Updates columns without changing data rows

⚠️ Data source changes go live immediately and affect users.
```

### Table Controls

Same as Screens tab (Search, Sort, Select All)

### Data Sources Table

**Columns**:
1. **Checkbox** - Select/deselect
2. **DS Name** - Data source name
3. **DS ID** - Numeric ID
4. **Mode** - Dropdown: "All rows" or "Structure only"
5. **Associated** - Count of screens using this DS
6. **Expand** - Show dependencies

**Mode Dropdown**:
```
┌─────────────────┐
│ All rows      ✓ │  ← Default
│ Structure only  │
└─────────────────┘
```

**Behavior**:
- Default: "All rows" selected for all DSs
- User can change per DS individually
- Changing mode updates MergeState immediately
- Mode is stored even if DS unchecked (preserved if re-checked)

**Expandable Row**:
Shows:
- **Screens using this DS**: List of screen names with checkboxes
  - Click screen name to jump to Screens tab
- **Files referenced**: List of files in DS entries (Media API refs)
  - Click file to jump to Files tab
- **Global dependency**: Yes/No (if DS in global dependencies list)

**Example Expanded Row**:
```
│☑│ Users    │301 │[All rows▼]│ 3 │ v │
│  │ Used by:                       │
│  │ ├ User List (selected)         │
│  │ ├ Profile (selected)           │
│  │ └ Admin Dashboard (not selected) │
│  │ Files referenced in data:      │
│  │ ├ avatar1.png (selected)       │
│  │ └ avatar2.png (selected)       │
│  │ Global dependency: Yes         │
```

**Warning Indicator**:
- If DS has >1000 entries: Show warning icon
  - Tooltip: "Large dataset. Merge may take longer."

### Component: DataSourcesTable

**Implementation**:
```javascript
const dataSourcesTableConfig = {
  columns: [
    {
      key: 'selected',
      type: 'checkbox',
      label: 'Select All'
    },
    {
      key: 'name',
      label: 'DS Name',
      sortable: true,
      expandable: true
    },
    {
      key: 'id',
      label: 'DS ID',
      sortable: true
    },
    {
      key: 'mode',
      label: 'Mode',
      type: 'dropdown',
      options: [
        { value: 'all', label: 'All rows' },
        { value: 'structure', label: 'Structure only' }
      ],
      defaultValue: 'all',
      onChange: (row, value) => {
        MergeState.dataSourceModes[row.id] = value;
      }
    },
    {
      key: 'associatedScreens',
      label: 'Screens',
      render: (value) => value.length
    }
  ],
  data: dataSources,
  onSelectionChange: (selectedRows) => {
    MergeState.selectedDataSources = selectedRows.map(r => ({
      id: r.id,
      mode: MergeState.dataSourceModes[r.id] || 'all'
    }));
  }
};
```

---

## Tab 3: Files

### Layout
```
┌─────────────────────────────────────────────┐
│ Instructions                                │
│ Select files and folders to copy. Matching  │
│ names will be renamed with timestamp.       │
├─────────────────────────────────────────────┤
│ Table Controls                              │
│ Search: [____________]  View: [Tree ▼]      │
│ [☑ Select All] 5 files selected             │
├─────────────────────────────────────────────┤
│ Files Tree View                             │
│ ┌──┬───────────────┬──────┬────────┬────┐  │
│ │☑│ Name          │ Type │ Size   │Mode│  │
│ ├──┼───────────────┼──────┼────────┼────┤  │
│ │☑│ 📁 Images     │Folder│ 12 MB  │[All▼]│ ← Folder
│ │☑│   📄 logo.png │Image │ 45 KB  │    │  │
│ │☑│   📄 banner.jpg│Image│ 120 KB │    │  │
│ │☑│ 📁 Documents  │Folder│ 5 MB   │[Folder▼]│
│ │☐│   📄 guide.pdf│PDF   │ 5 MB   │    │  │
│ │☑│ 📁 Media (lib)│Folder│ 2 MB   │[All▼]│ ← Global lib
│ └──┴───────────────┴──────┴────────┴────┘  │
└─────────────────────────────────────────────┘
```

### Instructions

**Text**: "Select files and folders to copy. Files with matching names in the destination will be renamed with a timestamp (e.g., logo-replaced-2024-12-18.png)."

**Info callout**:
```
ℹ️ Folder Modes
• Folder only: Creates folder structure without files
  (Useful for form upload field references)
• All files: Copies folder and all contained files
  (Useful for image libraries)

📚 Global libraries are marked with (lib) icon.
```

### Table Controls

**Search**: Same as other tabs
**View**: Dropdown to switch between "Tree" and "List" views
**Select All**: Checkbox with file/folder count

### Files Tree View

**Structure**:
- Folders shown with folder icon (📁)
- Files shown with type-specific icons (📄 📷 📊)
- Indentation shows hierarchy
- Collapsible folders (click to expand/collapse)

**Columns**:
1. **Checkbox** - Select/deselect (folders and files independently)
2. **Name** - File/folder name with icon
3. **Type** - File type or "Folder"
4. **Size** - File/folder size
5. **Mode** - Dropdown for folders only

**Folder Mode Dropdown**:
```
┌──────────────┐
│ All files  ✓ │  ← Default
│ Folder only  │
└──────────────┘
```

**Behavior**:
- Checking folder: auto-checks all files (if "All files" mode)
- Checking folder (Folder only mode): doesn't auto-check files
- Unchecking folder: unchecks all files
- Partially checked folder: indeterminate checkbox state

**Global Library Indicator**:
- Files/folders in global libraries: marked with (lib) icon
- Tooltip: "This file is a global library dependency and will be added to destination app libraries."

**Example Tree**:
```
☑ 📁 Images (All files mode)
  ☑ 📷 logo.png         45 KB    Used by: 3 screens
  ☑ 📷 banner.jpg      120 KB    Used by: 1 screen
  ☑ 📷 icon.png         12 KB    Unused

☑ 📁 Documents (Folder only mode)
  ☐ 📄 guide.pdf         5 MB    Unused

☑ 📁 Media (lib) (All files mode)
  ☑ 📹 video.mp4         2 MB    Global library
```

### Component: FilesTreeView

**Implementation**:
```javascript
const filesTreeConfig = {
  type: 'tree',
  columns: [
    {
      key: 'selected',
      type: 'checkbox',
      cascade: (row, checked) => {
        // Auto-check children if "All files" mode
        if (row.type === 'folder' && row.mode === 'all') {
          return checked;
        }
        return null; // Don't cascade
      }
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, row) => {
        const icon = getFileIcon(row.type);
        const libBadge = row.isGlobalLibrary ? ' (lib)' : '';
        return `${icon} ${value}${libBadge}`;
      }
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true
    },
    {
      key: 'size',
      label: 'Size',
      render: (bytes) => formatFileSize(bytes)
    },
    {
      key: 'mode',
      label: 'Mode',
      type: 'dropdown',
      showIf: (row) => row.type === 'folder',
      options: [
        { value: 'all', label: 'All files' },
        { value: 'folder', label: 'Folder only' }
      ],
      defaultValue: 'all'
    }
  ],
  data: filesTree,
  expandable: true,
  onSelectionChange: (selectedNodes) => {
    MergeState.selectedFiles = selectedNodes
      .filter(n => n.type !== 'folder')
      .map(n => n.id);
    MergeState.selectedFolders = selectedNodes
      .filter(n => n.type === 'folder')
      .map(n => ({ id: n.id, mode: n.mode }));
  }
};
```

---

## Tab 4: Settings

### Layout
```
┌─────────────────────────────────────────────┐
│ Instructions                                │
│ Select app-level settings to merge. These   │
│ will overwrite destination app settings.    │
├─────────────────────────────────────────────┤
│ Settings Checklist                          │
│ ┌─────────────────────────────────────────┐ │
│ │ ☑ Merge app settings                    │ │
│ │   ├ App name, icon, slug                │ │
│ │   ├ Navigation settings                 │ │
│ │   └ Excludes: SAML, payment settings    │ │
│ │                                         │ │
│ │ ☐ Merge menu settings                   │ │
│ │   ├ Menu type and structure             │ │
│ │   └ Menu list                           │ │
│ │                                         │ │
│ │ ☐ Merge global appearance               │ │
│ │   ├ Global CSS variables                │ │
│ │   ├ Theme colors and fonts              │ │
│ │   └ Excludes: component-specific styles │ │
│ │                                         │ │
│ │ ☑ Merge global code                     │ │
│ │   ├ Global JavaScript                   │ │
│ │   ├ Global CSS                          │ │
│ │   ├ Library dependencies                │ │
│ │   └ Data source dependencies            │ │
│ │   ⚠️ Version history will be created    │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ ⚠️ Warning: App settings changes may require│
│    republishing the app to apply.           │
└─────────────────────────────────────────────┘
```

### Instructions

**Text**: "Select app-level configurations to merge. These settings will overwrite the corresponding destination app settings. Use caution with global code changes."

**Info callout**:
```
ℹ️ What's Included/Excluded
Each setting category shows what will be merged and what
will be excluded for safety or compatibility.

⚠️ Global code creates version history for rollback.
   App settings changes may require republishing the app.
```

### Settings Checklist

**Format**: Expandable checkboxes with detailed lists

**Option 1: Merge App Settings**
- **Checkbox**: Merge app settings
- **Expanded details**:
  - ✓ App name
  - ✓ App icon
  - ✓ App slug
  - ✓ Navigation settings
  - ✗ SAML/SSO settings (excluded)
  - ✗ Payment integration settings (excluded)
  - ✗ App-specific tokens (excluded)
- **Warning**: "May require republishing app"

**Option 2: Merge Menu Settings**
- **Checkbox**: Merge menu settings
- **Expanded details**:
  - ✓ Menu type (native, tabs, etc.)
  - ✓ Menu structure and items
  - ✓ Menu icons
  - ✗ Screen-specific menu overrides (excluded)

**Option 3: Merge Global Appearance**
- **Checkbox**: Merge global appearance
- **Expanded details**:
  - ✓ Global CSS custom properties
  - ✓ Theme colors
  - ✓ Font selections
  - ✓ Global spacing/sizing
  - ✗ Component-specific appearance (excluded)
  - ✗ Screen-specific styles (excluded)

**Option 4: Merge Global Code**
- **Checkbox**: Merge global code
- **Expanded details**:
  - ✓ Global JavaScript code
  - ✓ Global CSS/SCSS code
  - ✓ Library dependencies
  - ✓ Data source dependencies
  - ℹ️ Version history will be created (can rollback)
- **Warning**: "This will overwrite destination global code. Version history allows manual rollback."

### Component: SettingsChecklist

**Implementation**:
```vue
<template>
  <div class="settings-checklist">
    <div
      v-for="option in settingsOptions"
      :key="option.id"
      class="setting-option">
      <label class="setting-checkbox">
        <input
          type="checkbox"
          :checked="isChecked(option.id)"
          @change="toggleSetting(option.id)">
        <strong>{{ option.label }}</strong>
      </label>

      <div v-if="option.expanded" class="setting-details">
        <ul>
          <li
            v-for="item in option.included"
            :key="item"
            class="included">
            <i class="fa fa-check text-success"></i>
            {{ item }}
          </li>
          <li
            v-for="item in option.excluded"
            :key="item"
            class="excluded">
            <i class="fa fa-times text-muted"></i>
            {{ item }} (excluded)
          </li>
        </ul>

        <merge-alert
          v-if="option.warning"
          variant="warning"
          size="small">
          {{ option.warning }}
        </merge-alert>
      </div>

      <button
        class="expand-toggle"
        @click="toggleExpand(option.id)">
        {{ option.expanded ? 'Show less' : 'Show details' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const settingsOptions = ref([
  {
    id: 'appSettings',
    label: 'Merge app settings',
    expanded: false,
    included: [
      'App name, icon, slug',
      'Navigation settings',
      'App metadata'
    ],
    excluded: [
      'SAML/SSO settings',
      'Payment settings',
      'App-specific tokens'
    ],
    warning: 'May require republishing app to apply changes'
  },
  {
    id: 'menuSettings',
    label: 'Merge menu settings',
    expanded: false,
    included: [
      'Menu type and structure',
      'Menu items and icons'
    ],
    excluded: [
      'Screen-specific menu overrides'
    ]
  },
  {
    id: 'globalAppearance',
    label: 'Merge global appearance',
    expanded: false,
    included: [
      'Global CSS variables',
      'Theme colors and fonts',
      'Global spacing/sizing'
    ],
    excluded: [
      'Component-specific styles',
      'Screen-specific appearance'
    ]
  },
  {
    id: 'globalCode',
    label: 'Merge global code',
    expanded: false,
    included: [
      'Global JavaScript',
      'Global CSS/SCSS',
      'Library dependencies',
      'Data source dependencies'
    ],
    warning: 'Overwrites destination global code. Version history created for rollback.'
  }
]);

const toggleSetting = (id) => {
  const checked = !MergeState.settings[id];
  MergeState.settings[id] = checked;
};

const toggleExpand = (id) => {
  const option = settingsOptions.value.find(o => o.id === id);
  option.expanded = !option.expanded;
};
</script>
```

---

## Common Elements (All Tabs)

### Selection Summary Badges

**Location**: Below tab content, above action buttons

**Content**:
- Badge for each category with count
- Updates reactively as selections change
- Clicking badge navigates to that tab

**Visual**:
```
┌────────────────────────────────────────────┐
│ 8 screens · 2 data sources · 5 files ·    │
│ 2 settings                                 │
└────────────────────────────────────────────┘
```

**Badge Colors**:
- Blue background for selected items
- Gray for 0 selected

### Action Buttons

**Buttons** (3 total):
1. **Back** (← icon) - Returns to Select Destination
2. **Cancel** - Cancels merge, releases locks
3. **Review & Merge** (→ icon) - Proceeds to Review screen

**Layout**:
```
[← Back]  [Cancel]              [Review & Merge →]
(secondary) (secondary)         (primary, blue)
```

**States**:
- "Review & Merge" enabled at all times (can review with 0 selections)
- "Back" re-locks destination (confirmation modal)
- "Cancel" shows confirmation modal before releasing locks

### Lock Timer

**Display**: Clock icon + countdown (MM:SS)

**States**:
1. **Normal** (>5 min): Green text
   - "14:30 remaining"
2. **Warning** (2-5 min): Orange text
   - "⚠️ 3:45 remaining"
3. **Urgent** (<2 min): Red text, shows extend button
   - "⚠️ 1:30 remaining [Extend Lock +5 min]"

**Auto-Extend**:
- If user active (any interaction) in last 1 minute AND timer < 5 minutes:
  - Auto-extends by 1 minute
- Manual extend button: adds 5 minutes

**Expiry**:
- If timer hits 0:00:
  - Shows modal: "Lock expired. Apps unlocked. Configuration lost."
  - "Start Over" button returns to Dashboard
  - Releases locks via API

---

## Mock Data

### Screens Data
```javascript
const mockScreens = [
  {
    id: 55001,
    name: 'Home',
    updatedAt: '2024-12-15T10:00:00.000Z',
    dataSources: [
      { id: 301, name: 'Users', selected: true },
      { id: 302, name: 'Settings', selected: true }
    ],
    files: [
      { id: 1001, name: 'logo.png', selected: true },
      { id: 1002, name: 'banner.jpg', selected: true }
    ],
    hasSensitiveSettings: false
  },
  {
    id: 55002,
    name: 'User List',
    updatedAt: '2024-12-14T14:30:00.000Z',
    dataSources: [
      { id: 301, name: 'Users', selected: true }
    ],
    files: [
      { id: 1001, name: 'logo.png', selected: true }
    ],
    hasSensitiveSettings: false
  },
  {
    id: 55003,
    name: 'SSO Login',
    updatedAt: '2024-12-10T09:15:00.000Z',
    dataSources: [],
    files: [],
    hasSensitiveSettings: true
  }
];
```

### Data Sources Data
```javascript
const mockDataSources = [
  {
    id: 301,
    name: 'Users',
    entriesCount: 1250,
    updatedAt: '2024-12-15T11:00:00.000Z',
    associatedScreens: [
      { id: 55001, name: 'Home', selected: true },
      { id: 55002, name: 'User List', selected: true },
      { id: 55010, name: 'Admin Dashboard', selected: false }
    ],
    referencedFiles: [
      { id: 1010, name: 'avatar1.png', selected: true },
      { id: 1011, name: 'avatar2.png', selected: true }
    ],
    isGlobalDependency: true
  },
  {
    id: 302,
    name: 'Settings',
    entriesCount: 15,
    updatedAt: '2024-12-10T08:00:00.000Z',
    associatedScreens: [
      { id: 55001, name: 'Home', selected: true }
    ],
    referencedFiles: [],
    isGlobalDependency: false
  }
];
```

### Files Data (Tree Structure)
```javascript
const mockFilesTree = [
  {
    id: 'folder-1',
    name: 'Images',
    type: 'folder',
    size: 12582912, // 12 MB
    mode: 'all',
    isGlobalLibrary: false,
    children: [
      {
        id: 1001,
        name: 'logo.png',
        type: 'image',
        size: 46080, // 45 KB
        usedByScreens: [55001, 55002, 55003]
      },
      {
        id: 1002,
        name: 'banner.jpg',
        type: 'image',
        size: 122880, // 120 KB
        usedByScreens: [55001]
      }
    ]
  },
  {
    id: 'folder-2',
    name: 'Documents',
    type: 'folder',
    size: 5242880, // 5 MB
    mode: 'folder',
    isGlobalLibrary: false,
    children: [
      {
        id: 1003,
        name: 'guide.pdf',
        type: 'pdf',
        size: 5242880,
        usedByScreens: []
      }
    ]
  },
  {
    id: 'folder-3',
    name: 'Media',
    type: 'folder',
    size: 2097152, // 2 MB
    mode: 'all',
    isGlobalLibrary: true,
    children: [
      {
        id: 1004,
        name: 'video.mp4',
        type: 'video',
        size: 2097152,
        usedByScreens: []
      }
    ]
  }
];
```

---

## API Integration

### Fetch Screens (On Tab Load)

**Endpoint**: `GET /v1/apps/:id/screens`

**Parameters**:
- `id`: Source app ID
- `include`: `dataSources,files,dependencies`

**Example Request**:
```javascript
const screens = await MergeAPI.fetchScreens(sourceAppId, {
  include: ['dataSources', 'files', 'dependencies']
});
```

### Fetch Data Sources (On Tab Load)

**Endpoint**: `GET /v1/apps/:id/data-sources`

**Parameters**:
- `id`: Source app ID
- `include`: `associatedScreens,referencedFiles`

### Fetch Files (On Tab Load)

**Endpoint**: `GET /v1/apps/:id/files`

**Parameters**:
- `id`: Source app ID
- `include`: `folders,associatedScreens,globalLibraries`

### Extend Lock

**Endpoint**: `PATCH /v1/apps/:id/lock`

**Triggered**: When user clicks "Extend Lock" button

**Example Request**:
```javascript
const extended = await MergeAPI.extendLocks({
  sourceAppId: MergeState.sourceApp.id,
  destinationAppId: MergeState.destinationApp.id,
  extendBy: 5 * 60 * 1000 // 5 minutes
});
```

---

## User Interactions

### Tab Switching

1. User clicks "Data Sources" tab
2. Tab becomes active (blue underline)
3. Content area loads Data Sources table
4. Badge count shows selected items
5. Previous tab selections preserved in MergeState

### Selecting Items

1. User checks screen "Home"
2. Checkbox updates (visual feedback)
3. Badge count increments: "1 screen selected"
4. MergeState.selectedScreens updates
5. State persisted to MergeStorage

### Expanding Dependencies

1. User clicks expand icon (>) on "User List" screen
2. Row expands with animation
3. Shows associated data sources and files
4. Indicates which are selected (checkmark) or not (X)
5. User can click DS name to jump to Data Sources tab

### Changing Data Source Mode

1. User on Data Sources tab
2. Clicks mode dropdown for "Users" DS
3. Selects "Structure only"
4. Dropdown updates
5. MergeState.dataSourceModes['301'] = 'structure'
6. Warning appears: "Structure only mode selected. Data rows won't be copied."

### Extending Lock

1. Lock timer shows: "⚠️ 1:30 remaining"
2. User clicks "Extend Lock +5 min"
3. Button shows loading spinner
4. API call extends lock
5. Timer updates: "6:30 remaining"
6. Banner disappears

---

## Error States

### Error: Lock Expired

**Trigger**: Lock timer hits 0:00 before user proceeds

**Display** (modal):
```
┌──────────────────────────────────────┐
│ ⚠️  Lock Expired                     │
│                                      │
│ Your configuration session expired.  │
│ Apps have been unlocked and your     │
│ selections were not saved.           │
│                                      │
│ [Start Over]                         │
└──────────────────────────────────────┘
```

**Actions**: Releases locks, returns to Dashboard

### Error: API Call Failed

**Trigger**: Failed to fetch screens/DS/files

**Display**: Error alert with retry option

---

## Accessibility

### Keyboard Navigation
- Tab: Navigate between controls
- Space: Toggle checkboxes
- Enter: Expand/collapse rows
- Arrow keys: Navigate table rows

### Screen Reader
- Announces tab changes
- Announces selection counts
- Announces lock timer warnings

---

## Related Documentation

- [USER_FLOWS.md](../USER_FLOWS.md) - Complete user journey (Step 3: Configure Merge)
- [04-review-merge.md](04-review-merge.md) - Next screen
- [patterns/interaction-patterns.md](../patterns/interaction-patterns.md) - Tab and table patterns

---

**Last Updated**: December 18, 2024
**Status**: Phase 3 Complete
**Version**: 1.0
