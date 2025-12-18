# Vue Component Templates

This document provides reusable templates for creating Vue.js 3 components in the App Merge UI using the Composition API.

## Overview

All components in the App Merge UI follow these principles:
- Use Vue.js 3 Composition API
- Follow design system tokens from [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- Access global state via `MergeState`
- Make API calls through `MergeAPI` middleware
- Include proper loading and error states
- Follow accessibility best practices

## Template 1: Basic Vue Component Structure

A simple component with props and basic styling using design tokens.

```vue
<template>
  <div class="merge-component">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'MergeComponent',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.merge-component {
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  background: white;
  border: var(--border-width) solid var(--border-color);
}

h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--secondary-color);
  margin: 0 0 var(--spacing-sm) 0;
}

p {
  font-size: var(--font-size-base);
  color: var(--secondary-color);
  margin: 0;
}
</style>
```

**Key Points**:
- Uses `scoped` styles to prevent CSS leakage
- All styling uses design tokens (CSS custom properties)
- Props have explicit types and default values
- Component name uses PascalCase

## Template 2: Component with Composition API

An interactive component using Vue 3 Composition API with reactive state.

```vue
<template>
  <div class="merge-counter">
    <button @click="decrement" :disabled="count === 0">-</button>
    <span>{{ count }}</span>
    <button @click="increment" :disabled="!canIncrement">+</button>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'MergeCounter',
  props: {
    initialValue: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: Infinity
    }
  },
  emits: ['update:count'],
  setup(props, { emit }) {
    const count = ref(props.initialValue);

    const canIncrement = computed(() => count.value < props.max);

    const increment = () => {
      if (canIncrement.value) {
        count.value++;
        emit('update:count', count.value);
      }
    };

    const decrement = () => {
      if (count.value > 0) {
        count.value--;
        emit('update:count', count.value);
      }
    };

    return {
      count,
      canIncrement,
      increment,
      decrement
    };
  }
}
</script>

<style scoped>
.merge-counter {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background-color var(--transition-fast);
}

button:hover:not(:disabled) {
  background-color: #0092b3;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

span {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  min-width: 40px;
  text-align: center;
}
</style>
```

**Key Points**:
- Uses `ref()` for reactive primitive values
- Uses `computed()` for derived state
- Declares emitted events in `emits` array
- All reactive state and methods returned from `setup()`

## Template 3: Component with API Integration

A component that fetches data from the API with proper loading and error states.

```vue
<template>
  <div class="merge-app-selector">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <merge-loading-spinner />
      <p>Loading apps...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <merge-alert variant="danger">
        {{ error }}
        <button @click="retry">Retry</button>
      </merge-alert>
    </div>

    <!-- Success State -->
    <div v-else>
      <select v-model="selectedAppId" @change="handleSelection">
        <option value="">Select an app...</option>
        <option v-for="app in apps" :key="app.id" :value="app.id">
          {{ app.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'MergeAppSelector',
  props: {
    organizationId: {
      type: Number,
      required: true
    }
  },
  emits: ['app-selected'],
  setup(props, { emit }) {
    const loading = ref(false);
    const error = ref(null);
    const apps = ref([]);
    const selectedAppId = ref('');

    const fetchApps = async () => {
      loading.value = true;
      error.value = null;

      try {
        // Use MergeAPI middleware
        const response = await window.MergeAPI.getApps({
          organizationId: props.organizationId,
          includeArchived: false
        });

        apps.value = response.apps || [];
      } catch (err) {
        error.value = err.message || 'Failed to load apps';
        console.error('Error fetching apps:', err);
      } finally {
        loading.value = false;
      }
    };

    const retry = () => {
      fetchApps();
    };

    const handleSelection = () => {
      const app = apps.value.find(a => a.id === parseInt(selectedAppId.value));
      if (app) {
        emit('app-selected', app);
      }
    };

    onMounted(() => {
      fetchApps();
    });

    return {
      loading,
      error,
      apps,
      selectedAppId,
      retry,
      handleSelection
    };
  }
}
</script>

<style scoped>
.merge-app-selector {
  padding: var(--spacing-md);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
}

select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: white;
}
</style>
```

**Key Points**:
- Always show loading, error, and success states
- API calls go through `window.MergeAPI` middleware
- Errors are caught and displayed to users
- Uses `onMounted()` lifecycle hook for initial data fetch
- See [patterns/api-calls.md](patterns/api-calls.md) for more details

## Template 4: Component with Global State (MergeState)

A component that reads from the global `MergeState` object.

```vue
<template>
  <div class="merge-selection-summary">
    <h3>Selected Items</h3>
    <ul>
      <li>
        <merge-badge variant="primary">
          {{ screensCount }} screens
        </merge-badge>
      </li>
      <li>
        <merge-badge variant="success">
          {{ dataSourcesCount }} data sources
        </merge-badge>
      </li>
      <li>
        <merge-badge variant="info">
          {{ filesCount }} files
        </merge-badge>
      </li>
    </ul>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'MergeSelectionSummary',
  setup() {
    // Access global MergeState
    const mergeState = window.MergeState;

    const screensCount = computed(() => {
      return mergeState.selectedScreens?.length || 0;
    });

    const dataSourcesCount = computed(() => {
      return mergeState.selectedDataSources?.length || 0;
    });

    const filesCount = computed(() => {
      return mergeState.selectedFiles?.length || 0;
    });

    return {
      screensCount,
      dataSourcesCount,
      filesCount
    };
  }
}
</script>

<style scoped>
.merge-selection-summary {
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius);
  border: var(--border-width) solid var(--border-color);
}

h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--secondary-color);
  margin: 0 0 var(--spacing-md) 0;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

li {
  display: inline-block;
}
</style>
```

**Key Points**:
- Access global state via `window.MergeState`
- Use `computed()` for reactive access to global state
- Never replace the entire `MergeState` object
- See [GLOSSARY.md](GLOSSARY.md) for MergeState structure
- See [patterns/state-persistence.md](patterns/state-persistence.md) for persistence patterns

## Template 5: Accessible Component with Keyboard Navigation

A component with proper ARIA attributes and keyboard event handlers.

```vue
<template>
  <div
    class="merge-accordion-item"
    :class="{ 'is-expanded': isExpanded }"
  >
    <button
      type="button"
      class="accordion-trigger"
      :id="`accordion-trigger-${id}`"
      :aria-expanded="isExpanded"
      :aria-controls="`accordion-panel-${id}`"
      @click="toggle"
      @keydown.enter="toggle"
      @keydown.space.prevent="toggle"
    >
      <span>{{ title }}</span>
      <i
        class="fa"
        :class="isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"
        aria-hidden="true"
      ></i>
    </button>

    <div
      v-show="isExpanded"
      :id="`accordion-panel-${id}`"
      class="accordion-panel"
      role="region"
      :aria-labelledby="`accordion-trigger-${id}`"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'MergeAccordionItem',
  props: {
    title: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    defaultExpanded: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const isExpanded = ref(props.defaultExpanded);

    const toggle = () => {
      isExpanded.value = !isExpanded.value;
    };

    return {
      isExpanded,
      toggle
    };
  }
}
</script>

<style scoped>
.merge-accordion-item {
  margin-bottom: var(--spacing-xs);
}

.accordion-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: white;
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-align: left;
  transition: background-color var(--transition-fast);
}

.accordion-trigger:hover {
  background: #f8f9fa;
}

.accordion-trigger:focus-visible {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}

.is-expanded .accordion-trigger {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.accordion-panel {
  padding: var(--spacing-md);
  border: var(--border-width) solid var(--border-color);
  border-top: none;
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  background: white;
}
</style>
```

**Key Points**:
- Uses semantic `<button>` element for trigger
- Includes ARIA attributes (`aria-expanded`, `aria-controls`, `aria-labelledby`)
- Handles keyboard events (`@keydown.enter`, `@keydown.space`)
- Icons have `aria-hidden="true"` to hide from screen readers
- Focus indicators use `:focus-visible` for keyboard-only styling
- See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#accessibility-requirements) for accessibility standards

## Component Development Checklist

When creating a new component, ensure:

- [ ] Component name is PascalCase (e.g., `MergeButton`)
- [ ] Uses Vue 3 Composition API (not Options API)
- [ ] Props have explicit types and defaults
- [ ] Emitted events are declared in `emits` array
- [ ] All styling uses design tokens (CSS custom properties)
- [ ] Uses `scoped` styles to prevent CSS leakage
- [ ] API calls go through `MergeAPI` middleware
- [ ] Loading and error states are handled
- [ ] Accessibility attributes are included
- [ ] Keyboard navigation is supported
- [ ] Focus indicators are visible
- [ ] Component is responsive

## Related Documentation

- [AGENT_GUIDELINES.md](AGENT_GUIDELINES.md) - Development rules and patterns
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - Design tokens and specifications
- [GLOSSARY.md](GLOSSARY.md) - Terminology and data structures
- [MIDDLEWARE_GUIDELINES.md](MIDDLEWARE_GUIDELINES.md) - API integration patterns
- [patterns/README.md](patterns/README.md) - Reusable patterns index
- [templates/component-registry.md](templates/component-registry.md) - Design system components

## Common Patterns

For specific implementation patterns, see:

- [Loading States](patterns/loading-states.md)
- [Error Handling](patterns/error-handling.md)
- [API Calls](patterns/api-calls.md)
- [Lock Management](patterns/lock-management.md)
- [State Persistence](patterns/state-persistence.md)
- [Modal Dialogs](patterns/modal-dialog.md)
- [Table Selection](patterns/table-selection.md)
- [Form Validation](patterns/form-validation.md)

---

**Last Updated**: December 18, 2024
**Status**: Phase 2 Complete
**Version**: 1.0
