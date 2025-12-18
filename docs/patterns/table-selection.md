# Table Selection Pattern

## When to Use

Implement table selection for managing multiple items:

- Selecting screens to merge
- Selecting data sources
- Selecting media files
- Choosing apps
- Any multi-item selection scenario

**Why it matters**: Tables with selection provide an efficient way for users to view, compare, and choose multiple items at once.

## Implementation

### 1. Basic Table with Checkboxes

Simple table with individual row selection:

```vue
<template>
  <div class="selection-table">
    <table class="table">
      <thead>
        <tr>
          <th width="40">
            <input
              type="checkbox"
              :checked="allSelected"
              :indeterminate.prop="someSelected"
              @change="toggleSelectAll"
            />
          </th>
          <th>Name</th>
          <th>Type</th>
          <th>Modified</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.id"
          :class="{ 'selected': isSelected(item.id) }"
        >
          <td>
            <input
              type="checkbox"
              :checked="isSelected(item.id)"
              @change="toggleSelect(item.id)"
            />
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.type }}</td>
          <td>{{ formatDate(item.updatedAt) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="selection-summary">
      <strong>{{ selectedCount }}</strong> of {{ items.length }} selected
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  emits: ['selection-changed'],
  setup(props, { emit }) {
    const selectedIds = ref([]);

    const selectedCount = computed(() => selectedIds.value.length);

    const allSelected = computed(() => {
      return props.items.length > 0 &&
             selectedIds.value.length === props.items.length;
    });

    const someSelected = computed(() => {
      return selectedIds.value.length > 0 &&
             selectedIds.value.length < props.items.length;
    });

    const isSelected = (id) => {
      return selectedIds.value.includes(id);
    };

    const toggleSelect = (id) => {
      const index = selectedIds.value.indexOf(id);

      if (index === -1) {
        selectedIds.value.push(id);
      } else {
        selectedIds.value.splice(index, 1);
      }

      emitSelection();
    };

    const toggleSelectAll = () => {
      if (allSelected.value) {
        selectedIds.value = [];
      } else {
        selectedIds.value = props.items.map(item => item.id);
      }

      emitSelection();
    };

    const emitSelection = () => {
      const selected = props.items.filter(item =>
        selectedIds.value.includes(item.id)
      );

      emit('selection-changed', selected);
    };

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString();
    };

    return {
      selectedIds,
      selectedCount,
      allSelected,
      someSelected,
      isSelected,
      toggleSelect,
      toggleSelectAll,
      formatDate
    };
  }
}
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  border-bottom: var(--border-width) solid var(--border-color-light);
}

.table thead th {
  background-color: #f8f9fa;
  font-weight: var(--font-weight-semibold);
  color: var(--secondary-color);
}

.table tbody tr.selected {
  background-color: #e7f5ff;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.selection-summary {
  padding: var(--spacing-md);
  text-align: right;
  font-size: var(--font-size-sm);
  color: var(--secondary-color);
}
</style>
```

### 2. Table with Global State Integration

Store selections in MergeState:

```vue
<template>
  <div class="screen-selection-table">
    <table class="table">
      <thead>
        <tr>
          <th width="40">
            <input
              type="checkbox"
              :checked="allSelected"
              :indeterminate.prop="someSelected"
              @change="toggleSelectAll"
              aria-label="Select all screens"
            />
          </th>
          <th>Screen Name</th>
          <th>Components</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="screen in screens"
          :key="screen.id"
          :class="{ 'selected': isSelected(screen.id) }"
        >
          <td>
            <input
              type="checkbox"
              :checked="isSelected(screen.id)"
              @change="toggleSelect(screen.id)"
              :aria-label="`Select ${screen.title}`"
            />
          </td>
          <td>
            <strong>{{ screen.title }}</strong>
            <div class="text-muted small">{{ screen.description }}</div>
          </td>
          <td>{{ screen.components?.length || 0 }}</td>
          <td>
            <merge-badge
              :variant="getStatusVariant(screen.mergeStatus)"
              size="sm"
            >
              {{ screen.mergeStatus || 'Ready' }}
            </merge-badge>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    screens: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    // Use global state for selections
    const selectedScreens = computed(() => {
      return window.MergeState.selectedScreens || [];
    });

    const selectedCount = computed(() => selectedScreens.value.length);

    const allSelected = computed(() => {
      return props.screens.length > 0 &&
             selectedScreens.value.length === props.screens.length;
    });

    const someSelected = computed(() => {
      return selectedScreens.value.length > 0 &&
             selectedScreens.value.length < props.screens.length;
    });

    const isSelected = (screenId) => {
      return selectedScreens.value.some(s => s.id === screenId);
    };

    const toggleSelect = (screenId) => {
      const screen = props.screens.find(s => s.id === screenId);
      if (!screen) return;

      const index = selectedScreens.value.findIndex(s => s.id === screenId);

      if (index === -1) {
        // Add to selection
        window.MergeState.selectedScreens.push(screen);
      } else {
        // Remove from selection
        window.MergeState.selectedScreens.splice(index, 1);
      }

      // Persist to storage
      saveSelections();
    };

    const toggleSelectAll = () => {
      if (allSelected.value) {
        window.MergeState.selectedScreens = [];
      } else {
        window.MergeState.selectedScreens = [...props.screens];
      }

      saveSelections();
    };

    const saveSelections = () => {
      window.MergeStorage.set('selectedScreens', {
        ids: window.MergeState.selectedScreens.map(s => s.id),
        timestamp: Date.now()
      });
    };

    const getStatusVariant = (status) => {
      const variants = {
        'Ready': 'success',
        'Conflict': 'danger',
        'Overwrite': 'warning',
        'Partial': 'info'
      };
      return variants[status] || 'secondary';
    };

    return {
      selectedScreens,
      selectedCount,
      allSelected,
      someSelected,
      isSelected,
      toggleSelect,
      toggleSelectAll,
      getStatusVariant
    };
  }
}
</script>
```

### 3. Table with Bulk Actions

Add actions for selected items:

```vue
<template>
  <div class="table-with-actions">
    <!-- Bulk actions toolbar -->
    <div v-if="selectedCount > 0" class="bulk-actions">
      <span class="selection-count">
        {{ selectedCount }} selected
      </span>

      <div class="actions">
        <merge-button size="sm" variant="secondary" @click="clearSelection">
          Clear
        </merge-button>
        <merge-button size="sm" variant="warning" @click="markAsPartial">
          Mark as Partial
        </merge-button>
        <merge-button size="sm" variant="danger" @click="removeSelected">
          Remove
        </merge-button>
      </div>
    </div>

    <!-- Table -->
    <table class="table">
      <!-- ... table content ... -->
    </table>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  setup() {
    const selectedCount = computed(() => {
      return window.MergeState.selectedScreens.length;
    });

    const clearSelection = () => {
      window.MergeState.selectedScreens = [];
    };

    const markAsPartial = () => {
      const confirmed = confirm(
        `Mark ${selectedCount.value} screens for partial merge (structure only)?`
      );

      if (confirmed) {
        window.MergeState.selectedScreens.forEach(screen => {
          screen.mergeMode = 'partial';
        });
      }
    };

    const removeSelected = () => {
      const confirmed = confirm(
        `Remove ${selectedCount.value} screens from merge?`
      );

      if (confirmed) {
        clearSelection();
      }
    };

    return {
      selectedCount,
      clearSelection,
      markAsPartial,
      removeSelected
    };
  }
}
</script>

<style scoped>
.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: #e7f5ff;
  border: var(--border-width) solid var(--primary-color);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
}

.selection-count {
  font-weight: var(--font-weight-semibold);
  color: var(--primary-color);
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
```

### 4. Sortable Table

Add sorting to table columns:

```vue
<template>
  <table class="table">
    <thead>
      <tr>
        <th width="40">
          <input type="checkbox" @change="toggleSelectAll" />
        </th>
        <th @click="sortBy('name')" class="sortable">
          Name
          <i :class="getSortIcon('name')"></i>
        </th>
        <th @click="sortBy('type')" class="sortable">
          Type
          <i :class="getSortIcon('type')"></i>
        </th>
        <th @click="sortBy('updatedAt')" class="sortable">
          Modified
          <i :class="getSortIcon('updatedAt')"></i>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in sortedItems" :key="item.id">
        <!-- ... row content ... -->
      </tr>
    </tbody>
  </table>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  props: {
    items: Array
  },
  setup(props) {
    const sortField = ref('name');
    const sortDirection = ref('asc');

    const sortedItems = computed(() => {
      const sorted = [...props.items].sort((a, b) => {
        const aVal = a[sortField.value];
        const bVal = b[sortField.value];

        if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
        return 0;
      });

      return sorted;
    });

    const sortBy = (field) => {
      if (sortField.value === field) {
        // Toggle direction
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        // New field, default to ascending
        sortField.value = field;
        sortDirection.value = 'asc';
      }
    };

    const getSortIcon = (field) => {
      if (sortField.value !== field) {
        return 'fa fa-sort text-muted';
      }
      return sortDirection.value === 'asc'
        ? 'fa fa-sort-up text-primary'
        : 'fa fa-sort-down text-primary';
    };

    return { sortedItems, sortBy, getSortIcon };
  }
}
</script>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #f0f0f0;
}
</style>
```

### 5. Filterable Table

Add search/filter functionality:

```vue
<template>
  <div class="filterable-table">
    <!-- Filter controls -->
    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search..."
        class="form-control"
      />

      <select v-model="filterType" class="form-control">
        <option value="">All Types</option>
        <option value="screen">Screens</option>
        <option value="dataSource">Data Sources</option>
        <option value="file">Files</option>
      </select>

      <select v-model="filterStatus" class="form-control">
        <option value="">All Statuses</option>
        <option value="ready">Ready</option>
        <option value="conflict">Conflict</option>
        <option value="overwrite">Overwrite</option>
      </select>
    </div>

    <!-- Table -->
    <table class="table">
      <tbody>
        <tr v-for="item in filteredItems" :key="item.id">
          <!-- ... row content ... -->
        </tr>
      </tbody>
    </table>

    <!-- No results message -->
    <div v-if="filteredItems.length === 0" class="no-results">
      <merge-alert variant="info">
        No items match your filters.
      </merge-alert>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  props: {
    items: Array
  },
  setup(props) {
    const searchQuery = ref('');
    const filterType = ref('');
    const filterStatus = ref('');

    const filteredItems = computed(() => {
      let filtered = props.items;

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        );
      }

      // Type filter
      if (filterType.value) {
        filtered = filtered.filter(item =>
          item.type === filterType.value
        );
      }

      // Status filter
      if (filterStatus.value) {
        filtered = filtered.filter(item =>
          item.status === filterStatus.value
        );
      }

      return filtered;
    });

    return {
      searchQuery,
      filterType,
      filterStatus,
      filteredItems
    };
  }
}
</script>

<style scoped>
.filters {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.filters .form-control {
  flex: 1;
}

.no-results {
  padding: var(--spacing-lg);
  text-align: center;
}
</style>
```

## Best Practices

### Do:
- Use checkboxes for multi-select
- Provide "Select All" functionality
- Show selection count
- Disable actions when nothing selected
- Persist selections to MergeState/Storage
- Support keyboard navigation (arrow keys, space)
- Show visual feedback on hover/selection
- Include indeterminate state for "Select All" checkbox

### Don't:
- Don't lose selections on table refresh
- Don't allow conflicting bulk actions
- Don't forget to handle empty states
- Don't make rows too small (hard to click)
- Don't forget accessibility attributes
- Don't hide the selection count

## Accessibility

### ARIA Attributes

```vue
<table role="table" aria-label="Selectable items">
  <thead role="rowgroup">
    <tr role="row">
      <th role="columnheader">
        <input
          type="checkbox"
          role="checkbox"
          :aria-checked="allSelected ? 'true' : someSelected ? 'mixed' : 'false'"
          aria-label="Select all items"
        />
      </th>
      <th role="columnheader">Name</th>
    </tr>
  </thead>
  <tbody role="rowgroup">
    <tr
      v-for="item in items"
      :key="item.id"
      role="row"
      :aria-selected="isSelected(item.id)"
    >
      <td role="cell">
        <input
          type="checkbox"
          role="checkbox"
          :aria-checked="isSelected(item.id)"
          :aria-label="`Select ${item.name}`"
        />
      </td>
      <td role="cell">{{ item.name }}</td>
    </tr>
  </tbody>
</table>
```

## Common Pitfalls

### Pitfall 1: Not Handling Indeterminate State

```javascript
// ✅ CORRECT: Use .prop modifier for indeterminate
<input
  type="checkbox"
  :indeterminate.prop="someSelected"
/>

// ❌ WRONG: Indeterminate as attribute doesn't work
<input
  type="checkbox"
  :indeterminate="someSelected"
/>
```

### Pitfall 2: Losing Selection on Re-render

```javascript
// ❌ WRONG: Local state lost on parent re-render
const selectedIds = ref([]);

// ✅ CORRECT: Use global state
const selectedIds = computed(() =>
  window.MergeState.selectedScreens.map(s => s.id)
);
```

### Pitfall 3: Not Validating Bulk Actions

```javascript
// ✅ CORRECT: Validate before bulk action
const deleteSelected = async () => {
  if (selectedCount.value === 0) {
    alert('No items selected');
    return;
  }

  const confirmed = confirm(`Delete ${selectedCount.value} items?`);
  if (!confirmed) return;

  // Proceed with deletion
};
```

## Related Patterns

- [Loading States](loading-states.md) - Show loading while fetching table data
- [Error Handling](error-handling.md) - Handle selection errors
- [State Persistence](state-persistence.md) - Save selections

## Related Documentation

- [COMPONENT_TEMPLATE.md](../COMPONENT_TEMPLATE.md) - Table component examples
- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Table styling

---

**Last Updated**: December 18, 2024
**Pattern Category**: UI Components
**Difficulty**: Intermediate
