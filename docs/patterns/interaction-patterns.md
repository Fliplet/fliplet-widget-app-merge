# App Merge UI - Interaction Patterns

This document defines reusable UI interaction patterns used throughout the App Merge feature. These patterns ensure consistency, accessibility, and intuitive user experience.

---

## Overview

The App Merge UI uses several core interaction patterns:
1. **Tab Navigation** - Switch between content sections
2. **Expandable Table Rows** - Show/hide item dependencies
3. **Selection with Counts** - Multi-select with live count badges
4. **Lock Timer Countdown** - Real-time timer with auto-extend
5. **Progress Updates** - Real-time status polling and display
6. **Modal Confirmations** - User confirmation dialogs
7. **Collapsible Sections** - Expand/collapse content cards

---

## Pattern 1: Tab Navigation

### Use Cases
- Configure Merge screen (4 tabs: Screens, Data Sources, Files, Settings)
- Any multi-section interface requiring organized content

### Visual Structure
```
┌───────────────────────────────────────┐
│ [Tab 1] [Tab 2] [Tab 3] [Tab 4]      │
│   (8)     (2)     (5)     (2)         │  ← Badge counts
└───────────────────────────────────────┘
     ▲ Active (blue underline)

┌───────────────────────────────────────┐
│ Tab 1 Content                         │
│                                       │
│ (Dynamic content based on active tab) │
└───────────────────────────────────────┘
```

### Behavior

**Keyboard Navigation**:
- Tab key: Move focus to tab list
- Arrow Left/Right: Navigate between tabs
- Enter/Space: Activate focused tab
- Tab key again: Move focus into tab content

**Mouse Navigation**:
- Click tab to activate
- Hover shows tooltip (if tab has description)

**State Management**:
- Active tab highlighted (blue underline, bold text)
- Inactive tabs grayed out
- Badge counts updated reactively
- Tab state persists in URL query parameter (`?tab=screens`)
- Switching tabs preserves selections in other tabs

**Badge Display**:
- Shows count of selected items per tab
- Hidden if count is 0
- Updates in real-time as selections change
- Color: Blue for selected items

### Implementation

**HTML Structure**:
```html
<div class="tab-navigation" role="tablist">
  <button
    role="tab"
    :id="`tab-${tab.id}`"
    :aria-selected="isActive(tab.id)"
    :aria-controls="`panel-${tab.id}`"
    :tabindex="isActive(tab.id) ? 0 : -1"
    @click="activateTab(tab.id)"
    @keydown="handleTabKeydown">
    {{ tab.label }}
    <span v-if="tab.count > 0" class="tab-badge">
      {{ tab.count }}
    </span>
  </button>
</div>

<div
  :id="`panel-${activeTab}`"
  role="tabpanel"
  :aria-labelledby="`tab-${activeTab}`">
  <!-- Tab content -->
</div>
```

**CSS**:
```css
.tab-navigation {
  display: flex;
  border-bottom: 2px solid var(--border-color);
  gap: var(--spacing-sm);
}

button[role="tab"] {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: transparent;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: var(--font-size-base);
  color: var(--info-color);
  transition: all var(--transition-fast);
}

button[role="tab"][aria-selected="true"] {
  border-bottom-color: var(--primary-color);
  color: var(--primary-color);
  font-weight: var(--font-weight-semibold);
}

button[role="tab"]:hover {
  color: var(--secondary-color);
}

button[role="tab"]:focus-visible {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}

.tab-badge {
  display: inline-block;
  margin-left: var(--spacing-xs);
  padding: 2px 8px;
  background: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}
```

**JavaScript**:
```javascript
const activateTab = (tabId) => {
  // Update active tab
  activeTab.value = tabId;

  // Update URL query parameter
  const url = new URL(window.location);
  url.searchParams.set('tab', tabId);
  window.history.pushState({}, '', url);

  // Update ARIA attributes
  updateARIA();
};

const handleTabKeydown = (event) => {
  const tabs = ['screens', 'dataSources', 'files', 'settings'];
  const currentIndex = tabs.indexOf(activeTab.value);

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      activateTab(tabs[prevIndex]);
      break;
    case 'ArrowRight':
      event.preventDefault();
      const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      activateTab(tabs[nextIndex]);
      break;
  }
};
```

---

## Pattern 2: Expandable Table Rows

### Use Cases
- Screens tab: Show associated data sources and files
- Data Sources tab: Show associated screens and files
- Any table where items have hierarchical details

### Visual Structure
```
┌──┬──────────────┬──────┬────┐
│☑ │ Screen Name  │ ID   │ >  │  ← Collapsed
├──┼──────────────┼──────┼────┤
│☑ │ User List    │ 5002 │ v  │  ← Expanded
│  │ Associated Items:        │
│  │ ├ 📊 Users (data source) │  ✓ selected
│  │ ├ 📄 logo.png (file)     │  ✓ selected
│  │ └ 📄 banner.jpg (file)   │  ✓ selected
└──┴──────────────┴──────┴────┘
```

### Behavior

**Expand/Collapse**:
- Click row expand icon (> or v) to toggle
- Click anywhere in row also toggles (except checkbox)
- Animated expand/collapse (slide down/up)
- Icon rotates: > (collapsed) → v (expanded)

**Keyboard Navigation**:
- Arrow Up/Down: Navigate rows
- Enter: Toggle expand/collapse
- Tab: Navigate within expanded content
- Escape: Collapse if expanded

**Visual Indicators**:
- Expanded row has blue left border (4px)
- Expanded content indented
- Dependency status icons (✓ selected, ✗ not selected)

**Clickable Links**:
- Clicking data source name jumps to Data Sources tab
- Clicking file name jumps to Files tab
- Pre-selects clicked item in destination tab

### Implementation

**HTML Structure**:
```html
<tr :class="{ expanded: row.expanded }" @click="toggleRow(row)">
  <td><input type="checkbox" @click.stop /></td>
  <td>{{ row.name }}</td>
  <td>{{ row.id }}</td>
  <td>
    <i :class="row.expanded ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"></i>
  </td>
</tr>

<tr v-if="row.expanded" class="expanded-content">
  <td colspan="4">
    <div class="dependencies">
      <h4>Associated Items:</h4>
      <ul>
        <li v-for="ds in row.dataSources" :key="ds.id">
          <i class="fa fa-database"></i>
          <a @click="jumpToTab('dataSources', ds.id)">
            {{ ds.name }} (data source)
          </a>
          <span :class="ds.selected ? 'text-success' : 'text-muted'">
            {{ ds.selected ? '✓ selected' : '✗ not selected' }}
          </span>
        </li>
      </ul>
    </div>
  </td>
</tr>
```

**CSS**:
```css
tr.expanded {
  border-left: 4px solid var(--primary-color);
}

.expanded-content td {
  padding: var(--spacing-md);
  background: #f9f9f9;
}

.expanded-content .dependencies {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dependencies ul {
  list-style: none;
  padding-left: var(--spacing-lg);
}

.dependencies li {
  padding: var(--spacing-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.dependencies a {
  color: var(--primary-color);
  text-decoration: underline;
  cursor: pointer;
}
```

---

## Pattern 3: Selection with Counts

### Use Cases
- Multi-select tables with live count display
- Badge showing number of selected items
- "Select All" / "Deselect All" functionality

### Visual Structure
```
┌────────────────────────────────────┐
│ [☑ Select All]  8 screens selected │  ← Header with count badge
├────────────────────────────────────┤
│ ☑ Screen 1                         │
│ ☑ Screen 2                         │
│ ☐ Screen 3                         │
│ ☑ Screen 4                         │
└────────────────────────────────────┘
```

### Behavior

**Select All Checkbox**:
- Unchecked: No items selected
- Checked: All items selected
- Indeterminate: Partial selection (some items selected)

**Count Badge**:
- Updates in real-time as selections change
- Format: "X items selected" or "0 items selected"
- Different wording for different contexts:
  - "8 screens selected"
  - "2 data sources selected"
  - "5 files selected"

**Selection Logic**:
```javascript
const selectAll = (checked) => {
  items.value.forEach(item => {
    item.selected = checked;
  });
  updateCount();
};

const updateCount = () => {
  const selectedCount = items.value.filter(i => i.selected).length;
  count.value = selectedCount;

  // Update "Select All" checkbox state
  if (selectedCount === 0) {
    selectAllState.value = false;
    selectAllIndeterminate.value = false;
  } else if (selectedCount === items.value.length) {
    selectAllState.value = true;
    selectAllIndeterminate.value = false;
  } else {
    selectAllState.value = false;
    selectAllIndeterminate.value = true; // Partial selection
  }

  // Update badge display
  badgeText.value = `${selectedCount} ${label} selected`;
};
```

### Implementation

**HTML**:
```html
<div class="selection-header">
  <label>
    <input
      type="checkbox"
      :checked="selectAllState"
      :indeterminate="selectAllIndeterminate"
      @change="selectAll($event.target.checked)" />
    Select All
  </label>
  <span class="selection-badge">{{ badgeText }}</span>
</div>
```

**CSS**:
```css
.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: #f5f5f5;
  border-bottom: 1px solid var(--border-color);
}

.selection-badge {
  padding: 4px 12px;
  background: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
```

---

## Pattern 4: Lock Timer Countdown

### Use Cases
- Configure Merge screen: Show lock expiry time
- Any interface with time-limited locks

### Visual Structure
```
Lock expires in: 14:30  (green, normal)
Lock expires in: ⚠️ 3:45  (orange, warning)
Lock expires in: ⚠️ 1:30 [Extend Lock +5 min]  (red, urgent)
```

### Behavior

**Timer States**:
1. **Normal** (>5 minutes):
   - Green text
   - Clock icon
   - No warnings
2. **Warning** (2-5 minutes):
   - Orange text
   - Warning icon
   - Auto-extends if user active
3. **Urgent** (<2 minutes):
   - Red text
   - Warning icon
   - Shows "Extend Lock" button
   - User must take action

**Auto-Extend Logic**:
```javascript
const checkAutoExtend = () => {
  const remaining = lockExpiry.value - Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  const oneMinute = 1 * 60 * 1000;

  // If < 5 min remaining AND user was active in last minute
  if (remaining < fiveMinutes && lastUserActivity > Date.now() - oneMinute) {
    // Auto-extend by 1 minute
    extendLock(oneMinute);
  }
};

// Track user activity
document.addEventListener('mousedown', () => {
  lastUserActivity = Date.now();
});
document.addEventListener('keydown', () => {
  lastUserActivity = Date.now();
});
```

**Manual Extend**:
```javascript
const extendLock = async (duration = 5 * 60 * 1000) => {
  try {
    const result = await MergeAPI.extendLocks({
      sourceAppId: MergeState.sourceApp.id,
      destinationAppId: MergeState.destinationApp.id,
      extendBy: duration
    });

    lockExpiry.value = new Date(result.expiresAt).getTime();
    showSuccessMessage('Lock extended by 5 minutes');
  } catch (error) {
    showErrorMessage('Failed to extend lock');
  }
};
```

### Implementation

**HTML**:
```html
<div :class="['lock-timer', timerClass]">
  <i :class="timerIcon"></i>
  <span>Lock expires in: {{ formatTime(remaining) }}</span>
  <button
    v-if="remaining < urgentThreshold"
    @click="extendLock()"
    class="extend-btn">
    Extend Lock +5 min
  </button>
</div>
```

**JavaScript**:
```javascript
const formatTime = (milliseconds) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const timerClass = computed(() => {
  if (remaining.value < urgentThreshold) return 'urgent';
  if (remaining.value < warningThreshold) return 'warning';
  return 'normal';
});

const timerIcon = computed(() => {
  if (remaining.value < urgentThreshold) return 'fa fa-exclamation-triangle';
  if (remaining.value < warningThreshold) return 'fa fa-exclamation-triangle';
  return 'fa fa-clock';
});

// Update every second
const updateTimer = () => {
  remaining.value = lockExpiry.value - Date.now();

  if (remaining.value <= 0) {
    handleExpiry();
  }
};

setInterval(updateTimer, 1000);
```

**CSS**:
```css
.lock-timer {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
}

.lock-timer.normal {
  background: #f0fff4;
  color: var(--success-color);
}

.lock-timer.warning {
  background: #fffbeb;
  color: var(--warning-color);
}

.lock-timer.urgent {
  background: #fff5f5;
  color: var(--danger-color);
}

.extend-btn {
  padding: 4px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--font-size-sm);
}
```

---

## Pattern 5: Progress Updates

### Use Cases
- Merge Progress screen: Real-time polling of merge status
- Any long-running operation requiring user feedback

### Visual Structure
```
⏳ Stage 3: Merging screens (In Progress)
━━━━━━━━━━━━━━━━     37% (3/8 screens)
Currently: Merging screen "User List"...
```

### Behavior

**Polling Strategy**:
- Poll every 2 seconds during active operation
- Exponential backoff on errors (2s, 4s, 8s, 16s)
- Stop polling when status is 'complete' or 'failed'

**Progress Indicators**:
- Progress bars for each stage
- Overall progress bar
- Real-time log messages (auto-scroll)
- Estimated time remaining

**Implementation**:
```javascript
const startPolling = (jobId) => {
  const poll = async () => {
    try {
      const status = await MergeAPI.getMergeStatus(jobId);

      // Update UI
      updateProgress(status);

      // Check if complete
      if (status.status === 'complete' || status.status === 'failed') {
        stopPolling();
        navigateToComplete();
      }
    } catch (error) {
      handlePollError(error);
    }
  };

  // Poll every 2 seconds
  pollInterval.value = setInterval(poll, 2000);

  // Initial poll
  poll();
};

const stopPolling = () => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value);
    pollInterval.value = null;
  }
};

const handlePollError = (error) => {
  retryCount.value++;

  // Exponential backoff: 2s, 4s, 8s, 16s, max 30s
  const backoff = Math.min(2000 * Math.pow(2, retryCount.value), 30000);

  // Show "Connection lost" message
  showConnectionWarning();

  // Retry with backoff
  setTimeout(() => {
    if (retryCount.value < 5) {
      poll();
    } else {
      showFatalError('Cannot connect to server. Merge may still be in progress.');
    }
  }, backoff);
};
```

---

## Pattern 6: Modal Confirmations

### Use Cases
- Confirm before starting merge
- Confirm before canceling merge
- Confirm before extending lock
- Any destructive or important action

### Visual Structure
```
┌────────────────────────────────┐
│ Confirm Merge              [X] │
├────────────────────────────────┤
│                                │
│ Are you sure you want to start │
│ the merge? You cannot cancel   │
│ once started.                  │
│                                │
│ Summary:                       │
│ • 8 screens                    │
│ • 2 data sources               │
│ • 5 files                      │
│                                │
│ Estimated time: 2-5 minutes    │
│                                │
│ [Cancel]      [Confirm Merge]  │
└────────────────────────────────┘
```

### Behavior

**Modal States**:
- **Open**: Semi-transparent backdrop, modal centered
- **Loading**: Shows spinner, buttons disabled
- **Closed**: Removed from DOM

**Focus Management**:
- Focus trapped within modal when open
- First element focused on open (usually primary button or close X)
- Escape key closes modal (unless loading)
- Clicking backdrop closes modal (unless confirmRequired)

**Button Hierarchy**:
- **Primary action**: Right-aligned, blue, bold
- **Secondary/Cancel**: Left-aligned, gray outline
- **Close X**: Top-right corner

### Implementation

**HTML**:
```html
<div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal">
  <div
    class="modal-dialog"
    role="dialog"
    aria-labelledby="modal-title"
    aria-modal="true">
    <div class="modal-header">
      <h2 id="modal-title">{{ title }}</h2>
      <button
        class="close-btn"
        @click="closeModal"
        :disabled="loading"
        aria-label="Close">
        <i class="fa fa-times"></i>
      </button>
    </div>

    <div class="modal-body">
      <p>{{ message }}</p>
      <slot></slot> <!-- Custom content -->
    </div>

    <div class="modal-footer">
      <merge-button
        variant="secondary"
        @click="closeModal"
        :disabled="loading">
        {{ cancelText }}
      </merge-button>
      <merge-button
        variant="primary"
        @click="confirmAction"
        :loading="loading">
        {{ confirmText }}
      </merge-button>
    </div>
  </div>
</div>
```

**JavaScript**:
```javascript
const openModal = () => {
  modalOpen.value = true;

  // Trap focus
  nextTick(() => {
    const focusable = modalDialog.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable.value = focusable[0];
    lastFocusable.value = focusable[focusable.length - 1];

    // Focus first element
    firstFocusable.value?.focus();
  });

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  if (loading.value) return; // Prevent close while loading

  modalOpen.value = false;
  document.body.style.overflow = '';
};

// Handle Escape key
const handleKeydown = (event) => {
  if (event.key === 'Escape' && !loading.value) {
    closeModal();
  }

  // Trap focus within modal
  if (event.key === 'Tab') {
    if (event.shiftKey && document.activeElement === firstFocusable.value) {
      event.preventDefault();
      lastFocusable.value?.focus();
    } else if (!event.shiftKey && document.activeElement === lastFocusable.value) {
      event.preventDefault();
      firstFocusable.value?.focus();
    }
  }
};
```

**CSS**:
```css
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
  animation: fadeIn 0.2s;
}

.modal-dialog {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
  z-index: var(--z-modal);
  animation: slideUp 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}
```

---

## Pattern 7: Collapsible Sections

### Use Cases
- Review & Merge screen: Expandable item lists
- Merge Complete screen: Detailed results sections
- Settings tab: Expandable setting details

### Visual Structure
```
┌────────────────────────────────┐
│ ▶ Screens (8 selected)         │  ← Collapsed
└────────────────────────────────┘

┌────────────────────────────────┐
│ ▼ Screens (8 selected)         │  ← Expanded
│ ├ 2 new screens (COPY)         │
│ │  - New Feature Screen        │
│ │  - Beta Dashboard            │
│ ├ 6 existing (OVERWRITE)       │
│ │  - Home                      │
│ │  - User List                 │
│ │  ...                         │
└────────────────────────────────┘
```

### Behavior

**Toggle**:
- Click anywhere in header to toggle
- Keyboard: Enter/Space to toggle
- Animated expand/collapse (slide animation)
- Icon rotates: ▶ (collapsed) → ▼ (expanded)

**Default State**:
- First section expanded by default
- Others collapsed
- User preference can override

### Implementation

**HTML**:
```html
<merge-card class="collapsible-section">
  <div
    class="section-header"
    @click="toggleExpand"
    @keydown.enter="toggleExpand"
    @keydown.space.prevent="toggleExpand"
    role="button"
    :aria-expanded="expanded"
    tabindex="0">
    <i :class="expanded ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"></i>
    <h3>{{ title }} ({{ count }} selected)</h3>
  </div>

  <div v-if="expanded" class="section-content">
    <slot></slot> <!-- Content goes here -->
  </div>
</merge-card>
```

**CSS**:
```css
.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-fast);
}

.section-header:hover {
  background: #f9f9f9;
}

.section-header:focus-visible {
  outline: 3px solid var(--primary-color);
  outline-offset: -3px;
}

.section-header i {
  transition: transform var(--transition-base);
}

.section-content {
  padding: var(--spacing-md);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0);
  }
}
```

---

## Accessibility Summary

All patterns follow these accessibility principles:

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Focus Indicators**: Clear visual focus states (3px blue outline)
3. **ARIA Attributes**: Proper roles, states, and labels
4. **Screen Reader Support**: Meaningful announcements and live regions
5. **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
6. **Semantic HTML**: Proper heading hierarchy and element usage

---

## Related Documentation

- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Visual design tokens and components
- [USER_FLOWS.md](../USER_FLOWS.md) - Complete user journeys
- [AGENT_GUIDELINES.md](../AGENT_GUIDELINES.md) - Development best practices
- [screens/](../screens/) - Screen-specific implementations

---

**Last Updated**: December 18, 2024
**Status**: Phase 3 Complete
**Version**: 1.0
