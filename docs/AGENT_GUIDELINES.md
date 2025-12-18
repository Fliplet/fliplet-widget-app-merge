# AI Agent Guidelines for App Merge UI

This document defines rules, patterns, and constraints for AI assistants and developers working on the App Merge UI codebase.

## Project Context

For complete project context and architecture details, see [README.md](README.md).

## Component Development Rules

### 1. Always Use Vue.js 3 Composition API

```javascript
// ✅ CORRECT: Use Composition API
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'MergeComponent',
  setup() {
    const count = ref(0);
    const doubled = computed(() => count.value * 2);

    onMounted(() => {
      console.log('Component mounted');
    });

    return { count, doubled };
  }
}

// ❌ WRONG: Options API (don't use)
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    doubled() { return this.count * 2; }
  }
}
```

### 2. Follow MergeState Pattern for Global State

```javascript
// ✅ CORRECT: Access MergeState
const mergeState = window.MergeState;
const sourceApp = computed(() => mergeState.sourceApp);
mergeState.selectedScreens.push(screenId);

// ❌ WRONG: Create custom global state
window.myCustomState = { data: [] };
```

### 3. Use Design Tokens from Global CSS

Always use CSS custom properties (design tokens) instead of hardcoded values. See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for complete token reference.

```vue
<style scoped>
/* ✅ CORRECT: Use CSS custom properties */
.component {
  padding: var(--spacing-md);
  color: var(--primary-color);
  border-radius: var(--border-radius);
}

/* ❌ WRONG: Hardcoded values */
.component {
  padding: 16px;
  color: #00abd1;
  border-radius: 4px;
}
</style>
```

### 4. Never Use Fliplet.ready()

```javascript
// ✅ CORRECT: Use standard Vue lifecycle
import { onMounted } from 'vue';

setup() {
  onMounted(() => {
    // Initialize component
  });
}

// ✅ CORRECT: For non-Vue code, use DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize
});

// ❌ WRONG: Don't use Fliplet.ready()
Fliplet.ready().then(function() {
  // This is for Fliplet apps, not Vue apps
});
```

### 5. Test with Mock Data Before API Integration

```javascript
// ✅ CORRECT: Start with mock data
const mockApps = [
  { id: 123, name: 'App 1', screensCount: 10 },
  { id: 456, name: 'App 2', screensCount: 15 }
];

// Later, replace with API call
// const apps = await MergeAPI.getApps(organizationId);
```

## Naming Conventions

### Components
- **PascalCase** for component names
- Examples: `MergeButton`, `MergeCard`, `MergeAlert`

```javascript
// ✅ CORRECT
export default {
  name: 'MergeButton'
}

// ❌ WRONG
export default {
  name: 'mergeButton'  // Wrong case
  name: 'merge-button' // Wrong format
}
```

### Props
- **camelCase** for prop names
- Use descriptive names
- Provide types and defaults

```javascript
// ✅ CORRECT
props: {
  itemCount: {
    type: Number,
    required: true
  },
  showBadge: {
    type: Boolean,
    default: false
  }
}

// ❌ WRONG
props: ['item-count', 'show_badge']  // Wrong format, no types
```

### Functions
- **camelCase** for function names
- Use verb prefixes: `get`, `set`, `fetch`, `create`, `update`, `delete`

```javascript
// ✅ CORRECT
function fetchAppDetails(appId) { }
function updateSelectedScreens(screens) { }
function handleLockExpiry() { }

// ❌ WRONG
function AppDetails(appId) { }  // Noun, PascalCase
function update_screens(screens) { }  // Snake case
function lock_expiry() { }  // No verb prefix
```

### CSS Classes
- **kebab-case** with BEM-inspired structure
- Prefix with `merge-` for namespace

```css
/* ✅ CORRECT */
.merge-button { }
.merge-button--primary { }
.merge-button--disabled { }
.merge-card__header { }
.merge-card__body { }

/* ❌ WRONG */
.MergeButton { }  /* PascalCase */
.merge_button { }  /* Snake case */
.button { }  /* No namespace */
```

### Files
- Match component name
- Use `.vue` extension for components

```
✅ CORRECT:
  MergeButton.vue
  MergeCard.vue
  merge-utils.js

❌ WRONG:
  merge-button.vue  (doesn't match component name)
  MergeButton.js    (should be .vue for components)
```

## Mandatory Patterns

### 1. All API Calls Through MergeAPI Middleware

```javascript
// ✅ CORRECT: Use middleware with behavior parameters
const apps = await window.MergeAPI.fetchApps({
  organizationId: orgId,
  includeArchived: false,
  onError: (error) => {
    mergeState.setError(error.message);
  },
  onLoading: (loading) => {
    isLoading.value = loading;
  }
});

// ❌ WRONG: Direct fetch calls
const response = await fetch('/api/v1/organizations/' + orgId + '/apps');
const apps = await response.json();

// ❌ WRONG: Hardcoded Fliplet API calls
const apps = await Fliplet.API.request({
  url: 'v1/organizations/' + orgId + '/apps'
});
```

### 2. Error Boundaries for All Async Operations

```javascript
// ✅ CORRECT: Wrap async operations in try-catch
setup() {
  const loading = ref(false);
  const error = ref(null);
  const data = ref(null);

  const fetchData = async () => {
    loading.value = true;
    error.value = null;

    try {
      data.value = await MergeAPI.getData();
    } catch (err) {
      error.value = err.message || 'Failed to load data';
      console.error('Error fetching data:', err);
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, data, fetchData };
}

// ❌ WRONG: No error handling
async function fetchData() {
  data.value = await MergeAPI.getData();  // What if this fails?
}
```

### 3. Loading States for All Data Fetching

```vue
<template>
  <!-- ✅ CORRECT: Show loading, error, and data states -->
  <div class="merge-component">
    <div v-if="loading" class="loading-state">
      <merge-loading-spinner />
      <p>Loading...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <merge-alert variant="danger">
        {{ error }}
        <button @click="retry">Retry</button>
      </merge-alert>
    </div>

    <div v-else>
      <!-- Your data here -->
    </div>
  </div>
</template>

<!-- ❌ WRONG: No loading or error states -->
<template>
  <div>
    {{ data }}
  </div>
</template>
```

### 4. Lock Management for Destination App Modifications

```javascript
// ✅ CORRECT: Acquire lock before modifications
async function selectDestination(app) {
  try {
    const lock = await MergeAPI.acquireLock(app.id, 600); // 10 minutes
    mergeState.lock = lock;
    mergeState.destinationApp = app;

    // Start lock timer
    startLockTimer();
  } catch (err) {
    if (err.code === 'LOCK_HELD') {
      showError('App is locked by another user');
    }
  }
}

// ✅ CORRECT: Extend lock before expiry
function startLockTimer() {
  lockTimer = setInterval(() => {
    const timeRemaining = getLockTimeRemaining();

    if (timeRemaining < 120) { // Less than 2 minutes
      extendLock();
    }
  }, 30000); // Check every 30 seconds
}

// ❌ WRONG: Modify destination without lock
function selectDestination(app) {
  mergeState.destinationApp = app;  // No lock acquired
}
```

### 5. State Persistence via MergeStorage

```javascript
// ✅ CORRECT: Persist state for recovery
function saveState() {
  window.MergeStorage.set('mergeState', {
    sourceApp: mergeState.sourceApp,
    destinationApp: mergeState.destinationApp,
    selectedScreens: mergeState.selectedScreens,
    selectedDataSources: mergeState.selectedDataSources,
    timestamp: Date.now()
  });
}

// ✅ CORRECT: Restore state on load
onMounted(() => {
  const savedState = window.MergeStorage.get('mergeState');

  if (savedState && isStateValid(savedState)) {
    restoreState(savedState);
  }
});

// ❌ WRONG: No state persistence
// If user refreshes, all selections are lost
```

## State Management Rules

### Accessing Global State

```javascript
// ✅ CORRECT: Read from MergeState
const sourceApp = window.MergeState.sourceApp;
const selectedCount = window.MergeState.selectedScreens.length;

// ✅ CORRECT: Use computed for reactivity
import { computed } from 'vue';
const selectedCount = computed(() => {
  return window.MergeState.selectedScreens.length;
});

// ❌ WRONG: Create separate state
const myLocalSourceApp = { ...someData };  // Duplicate state
```

### Modifying Global State

```javascript
// ✅ CORRECT: Direct modification (MergeState is reactive)
window.MergeState.selectedScreens.push(screenId);
window.MergeState.destinationApp = app;

// ✅ CORRECT: Use helper methods if available
window.MergeState.setLoading('apps', true);
window.MergeState.setError('Failed to load');

// ❌ WRONG: Replace entire object (breaks reactivity)
window.MergeState = { ...newState };
```

### Component-Local State

```javascript
// ✅ CORRECT: Use ref() and reactive() for component state
import { ref, reactive } from 'vue';

setup() {
  const isExpanded = ref(false);
  const form = reactive({
    name: '',
    email: ''
  });

  return { isExpanded, form };
}

// ❌ WRONG: Use MergeState for component-specific state
window.MergeState.isAccordionExpanded = false;  // Not global concern
```

## Restrictions

### ❌ Never Bypass API Middleware

```javascript
// ❌ WRONG: Direct API calls
fetch('https://api.fliplet.com/v1/apps/123')
Fliplet.API.request({ url: 'v1/apps/123' })

// ✅ CORRECT: Use middleware
MergeAPI.fetchApp(123)
```

### ❌ Never Create New Global State Without Documentation

```javascript
// ❌ WRONG: Custom global state
window.myAppState = {};

// ✅ CORRECT: Use MergeState or document in this file
// If absolutely necessary, add to AGENT_GUIDELINES.md first
```

### ❌ Never Modify Design Tokens Without Approval

```css
/* ❌ WRONG: Override tokens */
:root {
  --primary-color: #ff0000;  /* Don't change existing tokens */
}

/* ✅ CORRECT: Use existing tokens */
.my-component {
  color: var(--primary-color);
}

/* ✅ CORRECT: Add new token (with team approval) */
:root {
  --my-new-token: #123456;  /* Document in DESIGN_SYSTEM.md */
}
```

### ❌ Never Create Inline Styles

```vue
<!-- ❌ WRONG: Inline styles -->
<div style="padding: 20px; color: blue;">

<!-- ✅ CORRECT: Use CSS classes and design tokens -->
<div class="merge-card">

<style scoped>
.merge-card {
  padding: var(--spacing-lg);
  color: var(--primary-color);
}
</style>
```

### ✅ Always Include Accessibility Attributes

```vue
<!-- ✅ CORRECT: Proper accessibility -->
<button
  type="button"
  :aria-expanded="isExpanded"
  :aria-controls="`panel-${id}`"
  @click="toggle"
>
  <span>{{ title }}</span>
  <i :class="icon" aria-hidden="true"></i>
</button>

<div
  :id="`panel-${id}`"
  v-show="isExpanded"
  role="region"
  :aria-labelledby="`button-${id}`"
>
  <slot></slot>
</div>

<!-- ❌ WRONG: No accessibility -->
<div @click="toggle">
  {{ title }}
</div>
<div v-show="isExpanded">
  <slot></slot>
</div>
```

### ✅ Always Handle Loading and Error States

See "Mandatory Patterns #3" above for examples.

### ✅ Always Document New Patterns

When introducing a new pattern:
1. Add example to `COMPONENT_TEMPLATE.md`
2. Update this file with the pattern
3. Add to `patterns/` directory if reusable
4. Update `PROJECT_STATUS.md`

## Component Structure Pattern

Standard Vue component structure:

```vue
<template>
  <div class="merge-component">
    <!-- Component markup -->
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'MergeComponent',

  props: {
    title: {
      type: String,
      required: true
    }
  },

  emits: ['update', 'close'],

  setup(props, { emit }) {
    // Reactive state
    const count = ref(0);

    // Computed properties
    const doubled = computed(() => count.value * 2);

    // Methods
    const increment = () => {
      count.value++;
      emit('update', count.value);
    };

    // Lifecycle
    onMounted(() => {
      // Initialization
    });

    // Return public interface
    return {
      count,
      doubled,
      increment
    };
  }
}
</script>

<style scoped>
.merge-component {
  padding: var(--spacing-md);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius);
}
</style>
```

## Quality Checklist

Before submitting code, verify:

- [ ] Component uses design system tokens (no hardcoded values)
- [ ] API calls go through middleware (no direct fetch)
- [ ] Loading states implemented (shows spinner or skeleton)
- [ ] Error handling implemented (try-catch with user-friendly messages)
- [ ] Accessibility attributes added (ARIA labels, roles, keyboard nav)
- [ ] Mock data provided for testing (before API integration)
- [ ] Naming conventions followed (PascalCase components, camelCase props)
- [ ] Component uses Composition API (not Options API)
- [ ] No use of Fliplet.ready() (use Vue lifecycle or DOMContentLoaded)
- [ ] State management uses MergeState (no custom global state)
- [ ] Lock management for destination modifications (acquire/extend/release)
- [ ] State persistence for recovery (save to MergeStorage)

## Testing Guidelines

### Manual Testing
1. Test with mock data first
2. Test loading states (slow network)
3. Test error states (simulate failures)
4. Test keyboard navigation
5. Test with screen reader

### Edge Cases to Test
- Empty state (no items)
- Single item
- Many items (100+)
- Network timeout
- API errors (401, 403, 404, 500)
- Lock expiry during operation
- User navigates away during async operation

## Common Mistakes to Avoid

1. **Using `this` in setup()**: Composition API doesn't use `this`
2. **Forgetting `.value`**: Refs need `.value` in `<script>`, not in `<template>`
3. **Not handling errors**: Every async operation needs try-catch
4. **Missing loading states**: Users need feedback during operations
5. **Hardcoded values**: Always use design tokens
6. **No accessibility**: Every interactive element needs proper attributes
7. **Direct API calls**: Always use MergeAPI middleware
8. **Creating global state**: Use MergeState, don't create new globals

---
