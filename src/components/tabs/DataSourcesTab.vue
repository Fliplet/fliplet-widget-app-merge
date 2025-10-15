<template>
  <div class="space-y-4">
    <div class="rounded-lg bg-warning/5 p-4">
      <div class="flex items-start gap-3">
        <AlertTriangle
          class="mt-0.5 h-5 w-5 flex-shrink-0 text-warning"
          aria-hidden="true"
        />
        <div class="text-sm text-accent/80">
          <p class="font-medium text-accent">
            Warning: Live data impact
          </p>
          <p class="mt-1">
            Selecting "Overwrite structure and data" will replace existing data in the destination app's data sources.
            Use "Structure only" to preserve existing data.
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-center">
        <div class="mb-2 text-sm text-accent/60">
          Loading data sources...
        </div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-error/30 bg-error/5 p-4"
    >
      <p class="text-sm text-error">
        {{ error }}
      </p>
    </div>

    <div v-else>
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="allSelected"
            :indeterminate.prop="someSelected"
            class="rounded border-secondary/60 text-primary focus:ring-primary"
            @change="toggleSelectAll"
          >
          <span class="text-sm text-accent">Select all data sources</span>
        </label>
        <div class="flex items-center gap-3">
          <span
            v-if="selectedIds.length > 0"
            class="text-sm text-accent/60"
          >
            {{ selectedIds.length }} of {{ dataSourceRows.length }} selected
          </span>
          <button
            v-if="selectedIds.length > 0"
            type="button"
            class="text-sm text-primary hover:text-primary/80"
            @click="setAllToStructureOnly"
          >
            Set all to structure only
          </button>
        </div>
      </div>

      <FlipletTableWrapper
        :columns="dataSourceColumns"
        :data="dataSourceRows"
        selection="multiple"
        :expandable="true"
        :loading="loading"
        :config="tableConfig"
        container-classes="rounded-lg bg-white shadow"
        @selection:change="handleTableSelectionChange"
        @expand="handleExpand"
        @row-click="handleRowClick"
      />

      <div
        v-for="source in expandedDataSources"
        :key="source.id"
        class="rounded-lg border border-secondary/50 bg-secondary/10 p-4"
      >
        <h3 class="mb-4 text-sm font-semibold text-accent">
          {{ source.name }} associations
        </h3>
        <div class="grid gap-4 md:grid-cols-2">
          <section>
            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-accent/70">
              Screens
            </h4>
            <FlipletTableWrapper
              v-if="source.associatedScreens?.length"
              :columns="associatedScreenColumns"
              :data="buildScreenRows(source)"
              selection="multiple"
              :config="associationTableConfig('screen', source.id)"
              @selection:change="rows => handleNestedSelection('screen', source.id, rows)"
            />
            <p
              v-else
              class="text-sm text-accent/50"
            >
              No associated screens
            </p>
          </section>

          <section>
            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-accent/70">
              Files
            </h4>
            <FlipletTableWrapper
              v-if="source.associatedFiles?.length"
              :columns="associatedFileColumns"
              :data="buildFileRows(source)"
              selection="multiple"
              :config="associationTableConfig('file', source.id)"
              @selection:change="rows => handleNestedSelection('file', source.id, rows)"
            />
            <p
              v-else
              class="text-sm text-accent/50"
            >
              No associated files
            </p>
          </section>
        </div>

        <div class="mt-4 max-w-xs">
          <label class="text-xs font-semibold uppercase tracking-wide text-accent/60">
            Copy mode
          </label>
          <select
            :value="getCopyMode(source.id)"
            class="mt-2 w-full rounded-lg border-secondary/60 text-sm focus:border-primary focus:ring-primary"
            @change="handleCopyModeChange(source.id, $event)"
          >
            <option value="structure">
              Structure only
            </option>
            <option value="overwrite">
              Overwrite structure and data
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="dataSourceRows.length === 0"
        class="rounded-lg border border-secondary/30 bg-secondary/10 p-8 text-center"
      >
        <p class="text-sm text-accent/60">
          No data sources found in the source app.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { AlertTriangle } from 'lucide-vue-next';
import FlipletTableWrapper from '../ui/FlipletTableWrapper.vue';

export default {
  name: 'DataSourcesTab',

  components: {
    AlertTriangle,
    FlipletTableWrapper
  },

  props: {
    sourceAppId: {
      type: Number,
      required: true
    },
    destinationAppId: {
      type: Number,
      required: true
    },
    selection: {
      type: Array,
      default: () => []
    },
    selectedScreens: {
      type: Array,
      default: () => []
    },
    selectedFiles: {
      type: Array,
      default: () => []
    }
  },

  emits: ['selection-change', 'copy-mode-change', 'toggle:screen', 'toggle:file'],

  data() {
    return {
      loading: true,
      error: null,
      dataSources: [],
      selectedIds: [],
      copyModes: {}, // Maps dataSourceId -> 'structure' | 'overwrite'
      expandedIds: [],
      nestedSelections: {}
    };
  },

  computed: {
    dataSourceColumns() {
      return [
        { key: 'name', title: 'Data source', sortable: true },
        { key: 'id', title: 'ID', sortable: false },
        { key: 'entryCount', title: 'Entries', sortable: false },
        { key: 'modified', title: 'Last modified', sortable: false },
        { key: 'status', title: 'Status', sortable: false }
      ];
    },

    dataSourceRows() {
      return this.dataSources.map(ds => ({
        id: ds.id,
        name: ds.name,
        entryCount: ds.entryCount || 0,
        modified: ds.lastModified ? this.formatDate(ds.lastModified) : 'Unknown',
        status: ds.isGlobalDependency ? 'Global dependency' : ''
      }));
    },

    associatedScreenColumns() {
      return [
        { key: 'name', title: 'Screen', sortable: false },
        { key: 'id', title: 'ID', sortable: false }
      ];
    },

    associatedFileColumns() {
      return [
        { key: 'name', title: 'File', sortable: false },
        { key: 'id', title: 'ID', sortable: false }
      ];
    },

    expandedDataSources() {
      return this.dataSources.filter(ds => this.expandedIds.includes(ds.id));
    },

    allSelected() {
      return this.dataSourceRows.length > 0 && this.selectedIds.length === this.dataSourceRows.length;
    },

    someSelected() {
      return this.selectedIds.length > 0 && this.selectedIds.length < this.dataSourceRows.length;
    },

    tableConfig() {
      return {
        selection: {
          column: true
        },
        expandable: {
          column: true,
          preload: false
        }
      };
    }
  },

  watch: {
    selection: {
      immediate: true,
      handler(newSelection) {
        if (Array.isArray(newSelection)) {
          this.selectedIds = [...newSelection];
        }
      }
    }
  },

  async mounted() {
    await this.loadDataSources();
  },

  methods: {
    async loadDataSources() {
      this.loading = true;
      this.error = null;

      try {
        await Promise.resolve();

        this.dataSources = [
          {
            id: 1,
            name: 'Users',
            lastModified: Date.now() - 86400000,
            entryCount: 150,
            isGlobalDependency: false,
            associatedScreens: [
              { id: 1, name: 'Home Screen' },
              { id: 2, name: 'Login Screen' }
            ],
            associatedFiles: []
          },
          {
            id: 2,
            name: 'Settings',
            lastModified: Date.now() - 172800000,
            entryCount: 25,
            isGlobalDependency: true,
            associatedScreens: [
              { id: 1, name: 'Home Screen' }
            ],
            associatedFiles: [
              { id: 1, name: 'config.json' }
            ]
          },
          {
            id: 3,
            name: 'Authentication',
            lastModified: Date.now() - 259200000,
            entryCount: 5,
            isGlobalDependency: false,
            associatedScreens: [
              { id: 2, name: 'Login Screen' }
            ],
            associatedFiles: []
          }
        ];

        // Initialize all copy modes to 'structure' by default
        this.dataSources.forEach(ds => {
          this.copyModes[ds.id] = 'structure';
        });
      } catch (err) {
        this.error = 'Failed to load data sources. Please try again.';
        console.error('Error loading data sources:', err);
      } finally {
        this.loading = false;
      }
    },

    isSelected(dataSourceId) {
      return this.selectedIds.includes(dataSourceId);
    },

    handleTableSelectionChange(selectedRows = []) {
      this.selectedIds = selectedRows.map(row => row.id);
      this.emitSelectionChange();
    },

    handleRowClick({ row }) {
      if (!row || typeof row.id === 'undefined') {
        return;
      }

      this.handleExpand({ row, isExpanded: !this.expandedIds.includes(row.id) });
    },

    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedIds = [];
      } else {
        this.selectedIds = this.dataSourceRows.map(row => row.id);
      }

      this.emitSelectionChange();
    },

    handleExpand({ row, isExpanded }) {
      const rowId = row?.id;

      if (typeof rowId === 'undefined') {
        return;
      }

      if (isExpanded) {
        if (!this.expandedIds.includes(rowId)) {
          this.expandedIds = [...this.expandedIds, rowId];
        }
      } else {
        this.expandedIds = this.expandedIds.filter(id => id !== rowId);
      }
    },

    getCopyMode(dataSourceId) {
      return this.copyModes[dataSourceId] || 'structure';
    },

    handleCopyModeChange(dataSourceId, event) {
      const mode = event.target.value;

      this.copyModes[dataSourceId] = mode;
      this.$emit('copy-mode-change', {
        dataSourceId,
        mode
      });
    },

    setAllToStructureOnly() {
      this.selectedIds.forEach(id => {
        this.copyModes[id] = 'structure';
      });

      // Emit all changes
      this.selectedIds.forEach(id => {
        this.$emit('copy-mode-change', {
          dataSourceId: id,
          mode: 'structure'
        });
      });
    },

    emitSelectionChange() {
      this.$emit('selection-change', this.selectedIds);
    },

    associationTableConfig(type, dataSourceId) {
      return {
        selection: {
          column: true,
          selected: this.getNestedSelection(type, dataSourceId)
        }
      };
    },

    getInitialNestedSelection(type) {
      if (type === 'screen') {
        return this.selectedScreens;
      }

      if (type === 'file') {
        return this.selectedFiles;
      }

      return [];
    },

    handleNestedSelection(type, dataSourceId, rows = []) {
      const selectedIds = rows.map(row => row.id);
      const key = `${dataSourceId}:${type}`;
      const previous = this.nestedSelections[key] || this.getInitialNestedSelection(type);

      const added = selectedIds.filter(id => !previous.includes(id));
      const removed = previous.filter(id => !selectedIds.includes(id));

      added.forEach(id => this.emitAssociationToggle(type, id, true));
      removed.forEach(id => this.emitAssociationToggle(type, id, false));

      this.nestedSelections = {
        ...this.nestedSelections,
        [key]: selectedIds
      };
    },

    getNestedSelection(type, dataSourceId) {
      const key = `${dataSourceId}:${type}`;

      if (this.nestedSelections[key]) {
        return this.nestedSelections[key];
      }

      return this.getInitialNestedSelection(type);
    },

    emitAssociationToggle(type, id, selected) {
      const eventMap = {
        screen: 'toggle:screen',
        file: 'toggle:file'
      };

      const eventName = eventMap[type];

      if (eventName) {
        this.$emit(eventName, { id, selected });
      }
    },

    buildScreenRows(dataSource) {
      return (dataSource.associatedScreens || []).map(screen => ({
        id: screen.id,
        name: screen.name
      }));
    },

    buildFileRows(dataSource) {
      return (dataSource.associatedFiles || []).map(file => ({
        id: file.id,
        name: file.name
      }));
    },

    formatDate(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  }
};
</script>
