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
     * Accepts both Vue-style (key, title) and Fliplet-style (field, name) properties
     * @type {Array<{field: string, name: string, sortable?: boolean, render?: Function}>}
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
        target: this.$refs.tableElement,
        columns: this.buildColumns(),
        data: this.data,
        searchable: this.searchable, // Fixed: was 'search'
        stateKey: this.stateKey,
        ...this.config
      };

      // Configure selection if enabled
      if (this.selection) {
        options.selection = {
          enabled: true,
          multiple: this.selection === 'multiple',
          rowClickEnabled: true,
          ...((this.config.selection || {}))
        };
      }

      // Configure pagination if enabled
      if (this.pagination) {
        if (typeof this.pagination === 'object') {
          options.pagination = this.pagination;
        } else {
          options.pagination = { pageSize: 10 };
        }
      }

      // Configure expandable if enabled
      if (this.expandable) {
        const self = this;
        options.expandable = {
          enabled: true,
          onExpand: function(rowData) {
            // Return content for expanded row
            // In practice, this would need to be provided via config
            if (self.config.expandable && self.config.expandable.onExpand) {
              return self.config.expandable.onExpand(rowData);
            }
            return '<div>Expanded content</div>';
          },
          ...(this.config.expandable || {})
        };
      }

      try {
        this.flipletTable = new window.Fliplet.UI.Table(options);

        // Register event listeners using .on() method
        if (this.selection) {
          this.flipletTable.on('selection:change', this.handleSelectionChange);
        }

        if (this.searchable) {
          this.flipletTable.on('search:change', this.handleSearch);
        }

        if (this.expandable) {
          this.flipletTable.on('expand:complete', this.handleExpandComplete);
          this.flipletTable.on('collapse:complete', this.handleCollapseComplete);
        }
      } catch (error) {
        console.error('Failed to initialize Fliplet.UI.Table:', error);
        this.$emit('error', error);
      }
    },

    /**
     * Build columns configuration with custom renderers
     * Maps Vue-style (key, title) to Fliplet-style (field, name) if needed
     */
    buildColumns() {
      return this.columns.map(column => {
        const col = { ...column };

        // Map Vue-style properties to Fliplet-style if present
        if (column.key && !column.field) {
          col.field = column.key;
          delete col.key;
        }
        if (column.title && !column.name) {
          col.name = column.title;
          delete col.title;
        }

        // If column has a slot name, create a render function
        const fieldName = col.field || column.key;
        if (fieldName && this.$slots[fieldName]) {
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
        // Unregister event listeners
        if (this.flipletTable.off) {
          if (this.selection) {
            this.flipletTable.off('selection:change', this.handleSelectionChange);
          }
          if (this.searchable) {
            this.flipletTable.off('search:change', this.handleSearch);
          }
          if (this.expandable) {
            this.flipletTable.off('expand:complete', this.handleExpandComplete);
            this.flipletTable.off('collapse:complete', this.handleCollapseComplete);
          }
        }

        // Destroy table instance
        if (typeof this.flipletTable.destroy === 'function') {
          this.flipletTable.destroy();
        }
        this.flipletTable = null;
      }
    },

    /**
     * Event handlers that bridge Fliplet events to Vue
     */
    handleSelectionChange(detail) {
      // Fliplet.UI.Table passes { selected, deselected, source }
      this.selectedRows = detail.selected || [];
      this.$emit('selection:change', this.selectedRows);
    },

    handleSearch(detail) {
      // Fliplet.UI.Table passes { term, data }
      this.$emit('search', detail.term);
    },

    handleExpandComplete(detail) {
      // Fliplet.UI.Table passes { row, rowEl, contentEl }
      this.$emit('expand', {
        row: detail.row,
        index: this.getCurrentPageData().indexOf(detail.row),
        isExpanded: true
      });
    },

    handleCollapseComplete(detail) {
      // Fliplet.UI.Table passes { row, rowEl }
      this.$emit('expand', {
        row: detail.row,
        index: this.getCurrentPageData().indexOf(detail.row),
        isExpanded: false
      });
    },

    /**
     * Get current page data from table
     */
    getCurrentPageData() {
      if (this.flipletTable && this.flipletTable.getCurrentPageData) {
        return this.flipletTable.getCurrentPageData();
      }
      return this.data;
    },

    /**
     * Public methods for external control
     */
    getSelectedRows() {
      if (this.flipletTable && this.flipletTable.getSelectedRows) {
        return this.flipletTable.getSelectedRows();
      }
      return this.selectedRows;
    },

    clearSelection() {
      // Fliplet.UI.Table uses deselectAll(), not clearSelection()
      if (this.flipletTable && this.flipletTable.deselectAll) {
        this.flipletTable.deselectAll();
      }
    },

    selectRow(rowData) {
      // Accepts row data object or partial object with properties to match
      if (this.flipletTable && this.flipletTable.selectRow) {
        this.flipletTable.selectRow(rowData);
      }
    },

    deselectRow(rowData) {
      // Accepts row data object or partial object with properties to match
      if (this.flipletTable && this.flipletTable.deselectRow) {
        this.flipletTable.deselectRow(rowData);
      }
    },

    selectAll() {
      if (this.flipletTable && this.flipletTable.selectAll) {
        this.flipletTable.selectAll();
      }
    },

    refresh() {
      // Re-render the table body
      if (this.flipletTable && this.flipletTable.renderBody) {
        this.flipletTable.renderBody();
      }
    }
  }
};
</script>
