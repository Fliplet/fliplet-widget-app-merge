<template>
  <div
    class="space-y-6"
    data-testid="destination-selector"
  >
    <!-- Warning banners -->
    <WarningBanner
      type="warning"
      message="Progress cannot be saved until merge is initiated. If you close this window, you'll need to start over."
    />

    <WarningBanner
      type="info"
      message="Selected apps will be locked after proceeding to prevent concurrent modifications."
    />

    <!-- Organization selector (if user belongs to multiple orgs) -->
    <div
      v-if="organizations.length > 1"
      class="rounded-lg bg-white p-6 shadow"
    >
      <label
        for="organization-select"
        class="block text-sm font-medium text-gray-700"
      >
        <Building2
          class="mr-2 inline h-4 w-4"
          aria-hidden="true"
        />
        Organization
      </label>
      <select
        id="organization-select"
        v-model="selectedOrganizationId"
        class="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        data-testid="organization-select"
        @change="handleOrganizationChange"
      >
        <option
          v-for="org in organizations"
          :key="org.id"
          :value="org.id"
        >
          {{ org.name }} ({{ org.region }})
        </option>
      </select>
    </div>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex items-center justify-center rounded-lg bg-white p-12 shadow"
      data-testid="loading-state"
    >
      <Loader2
        class="h-8 w-8 animate-spin text-primary"
        aria-hidden="true"
      />
      <span class="sr-only">Loading apps...</span>
    </div>

    <!-- Error state -->
    <WarningBanner
      v-if="error"
      type="error"
      :message="error"
      data-testid="selector-error"
    />

    <!-- Apps list -->
    <div
      v-if="!loading && !error"
      class="rounded-lg bg-white p-6 shadow"
    >
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          Select destination app
        </h3>

        <!-- Search box -->
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search apps..."
            class="rounded-md border-gray-300 pl-10 pr-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
            data-testid="search-input"
          >
        </div>
      </div>

      <!-- Validation error -->
      <WarningBanner
        v-if="validationError"
        type="error"
        :message="validationError"
        class="mb-4"
        data-testid="validation-error"
      />

      <FlipletTableWrapper
        :columns="tableColumns"
        :data="tableRows"
        selection="single"
        :loading="loading"
        :config="tableConfig"
        container-classes="rounded-lg border border-gray-200"
        @selection:change="handleSelectionChange"
        @row-click="handleRowClick"
      />

      <div
        v-if="tableRows.length === 0"
        class="py-12 text-center"
        data-testid="apps-empty-state"
      >
        <p class="text-sm text-gray-500">
          {{ searchQuery ? 'No apps match your search' : 'No mergeable apps available in this organization' }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <button
        type="button"
        class="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        data-testid="back-button"
        @click="handleBack"
      >
        Back
      </button>
      <button
        type="button"
        class="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!selectedAppId || validationError"
        data-testid="next-button"
        @click="handleNext"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script>
import {
  Building2,
  Search,
  Loader2
} from 'lucide-vue-next';
import WarningBanner from '../feedback/WarningBanner.vue';
import FlipletTableWrapper from '../ui/FlipletTableWrapper.vue';

export default {
  name: 'DestinationSelector',

  components: {
    Building2,
    Search,
    Loader2,
    WarningBanner,
    FlipletTableWrapper
  },

  emits: ['app-selected', 'back', 'cancel'],

  data() {
    return {
      loading: true,
      error: null,
      organizations: [],
      selectedOrganizationId: null,
      apps: [],
      selectedAppId: null,
      searchQuery: '',
      validationError: null,
      sourceAppId: 123
    };
  },

  computed: {
    tableColumns() {
      return [
        { key: 'name', title: 'Name', sortable: true },
        { key: 'id', title: 'ID', sortable: true },
        { key: 'lastModified', title: 'Last Modified', sortable: true },
        { key: 'status', title: 'Status', sortable: false }
      ];
    },

    tableRows() {
      return this.filteredApps.map(app => ({
        id: app.id,
        name: app.name,
        lastModified: this.formatDate(app.updatedAt),
        status: app.isLive ? 'Live' : 'Draft',
        disabled: this.isAppDisabled(app),
        raw: app
      }));
    },

    tableConfig() {
      return {
        selection: {
          column: true,
          disabled: row => row.disabled
        }
      };
    },

    filteredApps() {
      let filtered = this.apps;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(app =>
          app.name.toLowerCase().includes(query) ||
          app.id.toString().includes(query)
        );
      }

      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  },

  mounted() {
    this.loadOrganizations();
  },

  methods: {
    async loadOrganizations() {
      try {
        this.loading = true;
        this.error = null;

        await Promise.resolve();

        this.organizations = [
          { id: 1, name: 'Acme Corp', region: 'EU' }
        ];

        this.selectedOrganizationId = this.organizations[0].id;
        await this.loadApps();
      } catch (err) {
        this.error = 'Unable to load organizations. Please try again.';
        console.error('Failed to load organizations:', err);
      } finally {
        this.loading = false;
      }
    },

    async loadApps() {
      try {
        this.loading = true;
        this.error = null;

        await Promise.resolve();

        this.apps = [
          {
            id: 200,
            name: 'Partner Retreat',
            organizationId: 1,
            updatedAt: Date.now() - 86400000,
            isLive: true,
            isLocked: false,
            hasPublisherRights: true,
            isDuplicate: false
          },
          {
            id: 201,
            name: 'Partner Retreat (Staging)',
            organizationId: 1,
            updatedAt: Date.now() - 172800000,
            isLive: false,
            isLocked: false,
            hasPublisherRights: true,
            isDuplicate: false
          },
          {
            id: 202,
            name: 'Conference App 2025',
            organizationId: 1,
            updatedAt: Date.now() - 259200000,
            isLive: true,
            isLocked: false,
            hasPublisherRights: true,
            isDuplicate: false
          },
          {
            id: 203,
            name: 'Event Management System',
            organizationId: 1,
            updatedAt: Date.now() - 345600000,
            isLive: true,
            isLocked: false,
            hasPublisherRights: true,
            isDuplicate: false
          }
        ];

        this.apps = this.apps.filter(app => app.id !== this.sourceAppId);
      } catch (err) {
        this.error = 'Unable to load apps. Please try again.';
        console.error('Failed to load apps:', err);
      } finally {
        this.loading = false;
      }
    },

    handleOrganizationChange() {
      this.selectedAppId = null;
      this.validationError = null;
      this.loadApps();
    },

    isAppDisabled(app) {
      return app.isLocked || !app.hasPublisherRights || app.isDuplicate;
    },

    handleSelectionChange(rows = []) {
      const selected = rows[0];

      if (!selected) {
        this.selectedAppId = null;
        return;
      }

      const app = this.apps.find(item => item.id === selected.id);

      if (app) {
        this.handleAppSelect(app);
      }
    },

    handleRowClick({ row }) {
      const app = this.apps.find(item => item.id === row.id);

      if (app) {
        this.handleAppSelect(app);
      }
    },

    handleAppSelect(app) {
      if (this.isAppDisabled(app)) {
        return;
      }

      this.selectedAppId = app.id;
      this.validationError = null;

      if (app.isDuplicate) {
        this.validationError = `Cannot select "${app.name}" because it contains duplicate screen or data source names. Please rename these items first.`;
        this.selectedAppId = null;
      }
    },

    handleBack() {
      this.$emit('back');
    },

    formatDate(dateValue) {
      if (!dateValue) {
        return 'Unknown';
      }

      const date = new Date(dateValue);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    handleNext() {
      if (!this.selectedAppId) {
        return;
      }

      const app = this.apps.find(item => item.id === this.selectedAppId);

      if (app) {
        this.$emit('app-selected', app);
      }
    }
  }
};
</script>
