<template>
  <div
    ref="tableContainer"
    class="fliplet-table-wrapper"
    :class="containerClasses"
    data-testid="fliplet-table-wrapper"
  >
    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex items-center justify-center p-8"
    >
      <Loader2
        class="h-8 w-8 animate-spin text-primary"
        aria-hidden="true"
      />
      <span class="sr-only">Loading table data...</span>
    </div>

    <!-- Table will be rendered here by Fliplet.UI.Table -->
    <div
      v-show="!loading"
      ref="tableElement"
      class="fliplet-table-element"
    />
  </div>
</template>

<script>
import { Loader2 } from 'lucide-vue-next';

export default {
  name: 'FlipletTableWrapper',

  components: {
    Loader2
  },

  props: {
    /**
     * Table columns configuration
     * @type {Array<{key: string, title: string, sortable?: boolean, render?: Function}>}
     */
    columns: {
      type: Array,
      required: true
    },

    /**
     * Table data rows
     */
    data: {
      type: Array,
      required: true
    },

    /**
     * Enable row selection
     * Values: false, 'single', 'multiple'
     */
    selection: {
      type: [Boolean, String],
      default: false
    },

    /**
     * Enable expandable rows
     */
    expandable: {
      type: Boolean,
      default: false
    },

    /**
     * Pagination configuration
     * @type {false | {pageSize: number, showPageSizeSelector: boolean}}
     */
    pagination: {
      type: [Boolean, Object],
      default: false
    },

    /**
     * Enable search functionality
     */
    searchable: {
      type: Boolean,
      default: false
    },

    /**
     * Unique state key for persisting table state
     */
    stateKey: {
      type: String,
      default: null
    },

    /**
     * Loading state
     */
    loading: {
      type: Boolean,
      default: false
    },

    /**
     * Additional configuration options for Fliplet.UI.Table
     */
    config: {
      type: Object,
      default: () => ({})
    },

    /**
     * Custom CSS classes for container
     */
    containerClasses: {
      type: [String, Array, Object],
      default: ''
    }
  },

  emits: [
    'error',
    'selection:change',
    'row-click',
    'sort:change',
    'pagination:change',
    'search',
    'expand'
  ],

  data() {
    return {
      flipletTable: null,
      selectedRows: []
    };
  },

  watch: {
    data: {
      handler(newData) {
        if (this.flipletTable && !this.loading) {
          this.updateTableData(newData);
        }
      },
      deep: true
    },

    columns: {
      handler() {
        if (this.flipletTable) {
          // Reinitialize table if columns change
          this.destroyTable();
          this.$nextTick(() => {
            this.initializeTable();
          });
        }
      },
      deep: true
    },

    loading(isLoading) {
      if (!isLoading && !this.flipletTable) {
        this.$nextTick(() => {
          this.initializeTable();
        });
      }
    }
  },

  mounted() {
    if (!this.loading) {
      this.initializeTable();
    }
  },

  beforeUnmount() {
    this.destroyTable();
  },

  methods: {
    /**
     * Initialize Fliplet.UI.Table instance
     */
    initializeTable() {
      if (!window.Fliplet || !window.Fliplet.UI || !window.Fliplet.UI.Table) {
        console.error('Fliplet.UI.Table is not available');
        return;
      }

      if (!this.$refs.tableElement) {
        return;
      }

      const options = {
        columns: this.buildColumns(),
        data: this.data,
        selection: this.selection,
        expandable: this.expandable,
        pagination: this.pagination,
        search: this.searchable,
        stateKey: this.stateKey,
        ...this.config
      };

      // Add event callbacks
      if (this.selection) {
        options.onSelectionChange = this.handleSelectionChange;
      }

      if (options.onRowClick !== false) {
        options.onRowClick = this.handleRowClick;
      }

      if (options.onSort !== false) {
        options.onSort = this.handleSort;
      }

      if (this.pagination) {
        options.onPaginationChange = this.handlePaginationChange;
      }

      if (this.searchable) {
        options.onSearch = this.handleSearch;
      }

      if (this.expandable) {
        options.onExpand = this.handleExpand;
      }

      try {
        this.flipletTable = new window.Fliplet.UI.Table(this.$refs.tableElement, options);
      } catch (error) {
        console.error('Failed to initialize Fliplet.UI.Table:', error);
        this.$emit('error', error);
      }
    },

    /**
     * Build columns configuration with custom renderers
     */
    buildColumns() {
      return this.columns.map(column => {
        const col = { ...column };

        // If column has a slot name, create a render function
        if (this.$slots[column.key]) {
          col.render = (value, row, index) => {
            // For now, return the value - actual slot rendering would need Fliplet API support
            return value;
          };
        }

        return col;
      });
    },

    /**
     * Update table data
     */
    updateTableData(newData) {
      if (this.flipletTable && this.flipletTable.setData) {
        this.flipletTable.setData(newData);
      }
    },

    /**
     * Destroy table instance
     */
    destroyTable() {
      if (this.flipletTable) {
        if (typeof this.flipletTable.destroy === 'function') {
          this.flipletTable.destroy();
        }
        this.flipletTable = null;
      }
    },

    /**
     * Event handlers that bridge Fliplet events to Vue
     */
    handleSelectionChange(selectedRows) {
      this.selectedRows = selectedRows;
      this.$emit('selection:change', selectedRows);
    },

    handleRowClick(row, index, event) {
      this.$emit('row-click', { row, index, event });
    },

    handleSort(column, direction) {
      this.$emit('sort:change', { column, direction });
    },

    handlePaginationChange(page, pageSize) {
      this.$emit('pagination:change', { page, pageSize });
    },

    handleSearch(query) {
      this.$emit('search', query);
    },

    handleExpand(row, index, isExpanded) {
      this.$emit('expand', { row, index, isExpanded });
    },

    /**
     * Public methods for external control
     */
    getSelectedRows() {
      return this.selectedRows;
    },

    clearSelection() {
      if (this.flipletTable && this.flipletTable.clearSelection) {
        this.flipletTable.clearSelection();
      }
    },

    selectRow(index) {
      if (this.flipletTable && this.flipletTable.selectRow) {
        this.flipletTable.selectRow(index);
      }
    },

    deselectRow(index) {
      if (this.flipletTable && this.flipletTable.deselectRow) {
        this.flipletTable.deselectRow(index);
      }
    },

    refresh() {
      if (this.flipletTable && this.flipletTable.refresh) {
        this.flipletTable.refresh();
      }
    }
  }
};
</script>
