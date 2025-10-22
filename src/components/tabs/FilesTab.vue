<template>
  <div class="space-y-4">
    <div class="rounded-lg bg-info/5 p-4">
      <p class="text-sm text-accent/80">
        Select files and folders to copy. Folder options let you choose whether to bring the folder only or folder plus contents.
      </p>
    </div>

    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-center">
        <div class="mb-2 text-sm text-accent/60">
          Loading files...
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
      <FlipletTableWrapper
        :columns="fileColumns"
        :data="fileRows"
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
        v-for="file in expandedFiles"
        :key="file.id"
        class="rounded-lg border border-secondary/50 bg-secondary/10 p-4"
      >
        <h3 class="mb-4 text-sm font-semibold text-accent">
          {{ file.name }} associations
        </h3>
        <div class="grid gap-4 md:grid-cols-2">
          <section>
            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-accent/70">
              Screens
            </h4>
            <FlipletTableWrapper
              v-if="file.associatedScreens?.length"
              :columns="associationScreenColumns"
              :data="buildScreenRows(file)"
              selection="multiple"
              :config="associationTableConfig('screen', file.id)"
              @selection:change="rows => handleNestedSelection('screen', file.id, rows)"
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
              Data sources
            </h4>
            <FlipletTableWrapper
              v-if="file.associatedDataSources?.length"
              :columns="associationDataSourceColumns"
              :data="buildDataSourceRows(file)"
              selection="multiple"
              :config="associationTableConfig('data-source', file.id)"
              @selection:change="rows => handleNestedSelection('data-source', file.id, rows)"
            />
            <p
              v-else
              class="text-sm text-accent/50"
            >
              No associated data sources
            </p>
          </section>
        </div>

        <div
          v-if="file.type === 'folder'"
          class="mt-4 max-w-xs"
        >
          <label class="text-xs font-semibold uppercase tracking-wide text-accent/60">
            Folder option
          </label>
          <select
            :value="getFolderOption(file.id)"
            class="mt-2 w-full rounded-lg border-secondary/60 text-sm focus:border-primary focus:ring-primary"
            @change="handleFolderOptionChange(file.id, $event)"
          >
            <option value="folder-only">
              Copy folder only
            </option>
            <option value="folder-with-files">
              Copy folder and files
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="fileRows.length === 0"
        class="rounded-lg border border-secondary/30 bg-secondary/10 p-8 text-center"
      >
        <p class="text-sm text-accent/60">
          No files or folders found in the source app.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import FlipletTableWrapper from '../ui/FlipletTableWrapper.vue';
import { Folder, File, Image as ImageIcon, FileText } from 'lucide-vue-next';

export default {
  name: 'FilesTab',

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
    },
    selectedScreens: {
      type: Array,
      default: () => []
    },
    selectedDataSources: {
      type: Array,
      default: () => []
    }
  },

  emits: ['selection-change', 'folder-option-change', 'toggle:screen', 'toggle:data-source'],

  data() {
    return {
      loading: true,
      error: null,
      files: [],
      selectedIds: [],
      expandedIds: [],
      nestedSelections: {},
      folderOptions: {}
    };
  },

  computed: {
    fileColumns() {
      return [
        { key: 'name', title: 'Name', sortable: true },
        { key: 'id', title: 'ID', sortable: false },
        { key: 'type', title: 'Type', sortable: false },
        { key: 'path', title: 'Path', sortable: false },
        { key: 'added', title: 'Added', sortable: false },
        { key: 'status', title: 'Status', sortable: false }
      ];
    },

    fileRows() {
      return this.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        path: file.path || '',
        added: file.addedAt ? this.formatDate(file.addedAt) : 'Unknown',
        status: file.isGlobalLibrary ? 'Global library' : file.associatedScreens?.length || file.associatedDataSources?.length ? '' : 'Unused'
      }));
    },

    associationScreenColumns() {
      return [
        { key: 'name', title: 'Screen', sortable: false },
        { key: 'id', title: 'ID', sortable: false }
      ];
    },

    associationDataSourceColumns() {
      return [
        { key: 'name', title: 'Data source', sortable: false },
        { key: 'id', title: 'ID', sortable: false }
      ];
    },

    expandedFiles() {
      return this.files.filter(file => this.expandedIds.includes(file.id));
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
    },

    allSelected() {
      return this.fileRows.length > 0 && this.selectedIds.length === this.fileRows.length;
    },

    someSelected() {
      return this.selectedIds.length > 0 && this.selectedIds.length < this.fileRows.length;
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
    await this.loadFiles();
  },

  methods: {
    async loadFiles() {
      this.loading = true;
      this.error = null;

      try {
        await Promise.resolve();

        this.files = [
          {
            id: 1,
            name: 'Floor Plan PDF',
            type: 'folder',
            path: '/assets/',
            addedAt: Date.now() - 86400000,
            isGlobalLibrary: false,
            associatedScreens: [{ id: 10, name: 'Digital Business Card' }],
            associatedDataSources: [],
            children: [
              { id: 2, name: 'logo.png', type: 'image', path: '/assets/logo.png', addedAt: Date.now() - 3600000, associatedScreens: [{ id: 10, name: 'Digital Business Card' }], associatedDataSources: [] }
            ]
          },
          {
            id: 3,
            name: 'reports.csv',
            type: 'file',
            path: '/data/reports.csv',
            addedAt: Date.now() - 172800000,
            isGlobalLibrary: false,
            associatedScreens: [],
            associatedDataSources: [{ id: 20, name: 'Sales data' }]
          }
        ];

        this.files.forEach(file => {
          if (file.type === 'folder') {
            this.folderOptions[file.id] = 'folder-only';
          }
        });
      } catch (err) {
        this.error = 'Failed to load files. Please try again.';
        console.error('Error loading files:', err);
      } finally {
        this.loading = false;
      }
    },

    handleTableSelectionChange(rows = []) {
      this.selectedIds = rows.map(row => row.id);
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
        this.selectedIds = this.fileRows.map(row => row.id);
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

    emitSelectionChange() {
      this.$emit('selection-change', this.selectedIds);
    },

    associationTableConfig(type, fileId) {
      return {
        selection: {
          column: true,
          selected: this.getNestedSelection(type, fileId)
        }
      };
    },

    getInitialNestedSelection(type) {
      if (type === 'screen') {
        return this.selectedScreens;
      }

      if (type === 'data-source') {
        return this.selectedDataSources;
      }

      return [];
    },

    handleNestedSelection(type, fileId, rows = []) {
      const selectedIds = rows.map(row => row.id);
      const key = `${fileId}:${type}`;
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

    getNestedSelection(type, fileId) {
      const key = `${fileId}:${type}`;

      if (this.nestedSelections[key]) {
        return this.nestedSelections[key];
      }

      return this.getInitialNestedSelection(type);
    },

    emitAssociationToggle(type, id, selected) {
      const eventMap = {
        screen: 'toggle:screen',
        'data-source': 'toggle:data-source'
      };

      const eventName = eventMap[type];

      if (eventName) {
        this.$emit(eventName, { id, selected });
      }
    },

    getFolderOption(fileId) {
      return this.folderOptions[fileId] || 'folder-only';
    },

    handleFolderOptionChange(fileId, event) {
      const value = event.target.value;

      this.folderOptions = {
        ...this.folderOptions,
        [fileId]: value
      };

      this.$emit('folder-option-change', {
        fileId,
        option: value
      });
    },

    buildScreenRows(file) {
      return (file.associatedScreens || []).map(screen => ({
        id: screen.id,
        name: screen.name
      }));
    },

    buildDataSourceRows(file) {
      return (file.associatedDataSources || []).map(dataSource => ({
        id: dataSource.id,
        name: dataSource.name
      }));
    },

    getFileIcon(type) {
      const map = {
        folder: Folder,
        image: ImageIcon,
        file: File
      };

      return map[type] || FileText;
    },

    formatDate(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        return 'Today';
      }

      if (diffInDays === 1) {
        return 'Yesterday';
      }

      if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      }

      return date.toLocaleDateString();
    }
  }
};
</script>
