<template>
  <div class="space-y-4">
    <!-- Instructions -->
    <div class="rounded-lg bg-info/5 p-4">
      <p class="text-sm text-accent/80">
        Select screens to copy to the destination app. Associated data sources and files will be shown for each screen.
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-center">
        <div class="mb-2 text-sm text-accent/60">
          Loading screens...
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="rounded-lg border border-error/30 bg-error/5 p-4"
    >
      <p class="text-sm text-error">
        {{ error }}
      </p>
    </div>

    <!-- Screens Table -->
    <div v-else>
      <!-- Screens List -->
      <FlipletTableWrapper
        :columns="screenColumns"
        :data="screenRows"
        selection="multiple"
        :expandable="true"
        :loading="loading"
        :config="flipletConfig"
        container-classes="rounded-lg bg-white shadow"
        @selection:change="handleTableSelectionChange"
        @expand="handleExpand"
        @row-click="handleRowClick"
      />

      <div
        v-for="screen in expandedScreens"
        :key="screen.id"
        class="rounded-lg border border-secondary/50 bg-secondary/10 p-4"
      >
        <h3 class="mb-4 text-sm font-semibold text-accent">
          {{ screen.name }} associations
        </h3>
        <div class="grid gap-4 md:grid-cols-2">
          <section>
            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-accent/70">
              Data sources
            </h4>
            <FlipletTableWrapper
              v-if="screen.associatedDataSources?.length"
              :columns="associationDataSourceColumns"
              :data="buildDataSourceRows(screen)"
              selection="multiple"
              :expandable="false"
              :config="flipletAssociationConfig('data-source', screen.id)"
              @selection:change="rows => handleNestedSelection('data-source', screen.id, rows)"
            />
            <p
              v-else
              class="text-sm text-accent/50"
            >
              No associated data sources
            </p>
          </section>

          <section>
            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-accent/70">
              Files
            </h4>
            <FlipletTableWrapper
              v-if="screen.associatedFiles?.length"
              :columns="associationFileColumns"
              :data="buildFileRows(screen)"
              selection="multiple"
              :expandable="false"
              :config="flipletAssociationConfig('file', screen.id)"
              @selection:change="rows => handleNestedSelection('file', screen.id, rows)"
            />
            <p
              v-else
              class="text-sm text-accent/50"
            >
              No associated files
            </p>
          </section>
        </div>
      </div>

      <div
        v-if="screenRows.length === 0"
        class="rounded-lg border border-secondary/30 bg-secondary/10 p-8 text-center"
      >
        <p class="text-sm text-accent/60">
          No screens found in the source app.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import FlipletTableWrapper from '../ui/FlipletTableWrapper.vue';

export default {
  name: 'ScreensTab',

  components: {
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
    }
  },

  emits: ['selection-change', 'toggle:screen', 'toggle:data-source', 'toggle:file'],

  data() {
    return {
      loading: true,
      error: null,
      screens: [],
      selectedIds: [],
      expandedIds: [],
      nestedSelections: {}
    };
  },

  computed: {
    screenColumns() {
      return [
        { key: 'name', title: 'Screen', sortable: true },
        { key: 'id', title: 'ID', sortable: false },
        { key: 'dataSourceCount', title: 'Data sources', sortable: false },
        { key: 'fileCount', title: 'Files', sortable: false },
        { key: 'lastModified', title: 'Last modified', sortable: true },
        { key: 'status', title: 'Status', sortable: false }
      ];
    },

    screenRows() {
      return this.screens.map(screen => ({
        id: screen.id,
        name: screen.name,
        dataSourceCount: screen.associatedDataSources?.length || 0,
        fileCount: screen.associatedFiles?.length || 0,
        lastModified: screen.lastModified ? this.formatDate(screen.lastModified) : 'Unknown',
        status: screen.hasNonCopyableComponents ? 'Limited copy support' : 'Ready'
      }));
    },

    associationDataSourceColumns() {
      return [
        { key: 'name', title: 'Data source', sortable: false },
        { key: 'id', title: 'ID', sortable: false }
      ];
    },

    associationFileColumns() {
      return [
        { key: 'name', title: 'File', sortable: false },
        { key: 'id', title: 'ID', sortable: false }
      ];
    },

    expandedScreens() {
      return this.screens.filter(screen => this.expandedIds.includes(screen.id));
    },

    allSelected() {
      return this.screenRows.length > 0 && this.selectedIds.length === this.screenRows.length;
    },

    someSelected() {
      return this.selectedIds.length > 0 && this.selectedIds.length < this.screenRows.length;
    },

    flipletConfig() {
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
    await this.loadScreens();
  },

  methods: {
    async loadScreens() {
      this.loading = true;
      this.error = null;

      try {
        // TODO: Replace with actual middleware integration
        // const screens = await window.FlipletAppMerge.middleware.api.screens.fetchScreens(this.sourceAppId);

        // Mock data for now
        await new Promise(resolve => setTimeout(resolve, 400));

        this.screens = [
          {
            id: 1,
            name: 'Digital Business Card',
            lastModified: Date.now() - 86400000,
            hasNonCopyableComponents: false,
            associatedDataSources: [
              { id: 1, name: 'Users' },
              { id: 2, name: 'Speaker Contact Info' }
            ],
            associatedFiles: [
              { id: 1, name: 'logo.png' },
              { id: 2, name: 'background.jpg' }
            ]
          },
          {
            id: 2,
            name: 'Floor Plan',
            lastModified: Date.now() - 172800000,
            hasNonCopyableComponents: false,
            associatedDataSources: [
              { id: 3, name: 'Floor Plan Assignments' }
            ],
            associatedFiles: []
          },
          {
            id: 3,
            name: 'Dashboard',
            lastModified: Date.now() - 259200000,
            hasNonCopyableComponents: true,
            associatedDataSources: [
              { id: 4, name: 'Analytics' },
              { id: 5, name: 'Reports' }
            ],
            associatedFiles: [
              { id: 3, name: 'chart.js' }
            ]
          }
        ];
      } catch (err) {
        this.error = 'Failed to load screens. Please try again.';
        console.error('Error loading screens:', err);
      } finally {
        this.loading = false;
      }
    },

    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedIds = [];
      } else {
        this.selectedIds = this.screenRows.map(row => row.id);
      }

      this.emitSelectionChange();
    },

    emitSelectionChange() {
      this.$emit('selection-change', this.selectedIds);
    },

    flipletAssociationConfig(type, screenId) {
      return {
        selection: {
          column: true,
          selected: this.getNestedSelection(type, screenId)
        }
      };
    },

    handleTableSelectionChange(rows = []) {
      this.selectedIds = rows.map(row => row.id);
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

    handleRowClick({ row }) {
      if (!row || typeof row.id === 'undefined') {
        return;
      }

      this.handleExpand({ row, isExpanded: !this.expandedIds.includes(row.id) });
    },

    handleNestedSelection(type, screenId, rows = []) {
      const selectedIds = rows.map(row => row.id);
      const key = `${screenId}:${type}`;
      const previous = this.nestedSelections[key] || [];

      const added = selectedIds.filter(id => !previous.includes(id));
      const removed = previous.filter(id => !selectedIds.includes(id));

      added.forEach(id => this.emitAssociationToggle(type, id, true));
      removed.forEach(id => this.emitAssociationToggle(type, id, false));

      this.nestedSelections = {
        ...this.nestedSelections,
        [key]: selectedIds
      };
    },

    emitAssociationToggle(type, id, selected) {
      const eventMap = {
        'data-source': 'toggle:data-source',
        file: 'toggle:file'
      };

      const eventName = eventMap[type];

      if (eventName) {
        this.$emit(eventName, { id, selected });
      }
    },

    buildDataSourceRows(screen) {
      return (screen.associatedDataSources || []).map(dataSource => ({
        id: dataSource.id,
        name: dataSource.name
      }));
    },

    buildFileRows(screen) {
      return (screen.associatedFiles || []).map(file => ({
        id: file.id,
        name: file.name
      }));
    },

    getNestedSelection(type, screenId) {
      const key = `${screenId}:${type}`;

      return this.nestedSelections[key] || [];
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
