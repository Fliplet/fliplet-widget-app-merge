<template>
  <div
    class="space-y-6"
    data-testid="merge-dashboard"
  >
    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex items-center justify-center p-12"
      data-testid="loading-state"
    >
      <Loader2
        class="h-8 w-8 animate-spin text-primary"
        aria-hidden="true"
      />
      <span class="sr-only">Loading app details...</span>
    </div>

    <!-- Error state -->
    <WarningBanner
      v-if="error"
      type="error"
      :message="error"
      data-testid="dashboard-error"
    />

    <!-- Content -->
    <div v-if="!loading && !error">
      <!-- Source app info card -->
      <div class="rounded-lg bg-white p-6 shadow">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <div class="rounded-lg bg-primary/10 p-3">
              <FileText
                class="h-6 w-6 text-primary"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ appDetails.name }}
              </h2>
              <div class="mt-2 space-y-1 text-sm text-gray-600">
                <p>
                  <span class="font-medium">App ID:</span> {{ appDetails.id }}
                </p>
                <p>
                  <span class="font-medium">Organization:</span> {{ appDetails.organizationName }}
                </p>
                <p>
                  <span class="font-medium">Region:</span> {{ appDetails.region }}
                </p>
                <p>
                  <span class="font-medium">Last modified:</span> {{ formattedLastModified }}
                </p>
              </div>
              <div class="mt-3">
                <StatusBadge
                  :status="appDetails.isPublished ? 'success' : 'in-progress'"
                  :label="appDetails.isPublished ? 'Published' : 'Not Published'"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lock status warning (if locked) -->
      <WarningBanner
        v-if="isLocked"
        type="warning"
        message="This app is currently locked due to an ongoing merge operation. Please wait for the operation to complete."
        data-testid="lock-warning"
      />

      <!-- Prerequisites section -->
      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="text-lg font-semibold text-gray-900">
          Before you start
        </h3>
        <div class="mt-4 space-y-3">
          <WarningBanner
            type="info"
            message="Merge configuration cannot be saved. You must complete the merge in one session."
          />
          <WarningBanner
            type="warning"
            message="Data source changes go live immediately and affect published apps. Screen changes require republishing."
          />
          <WarningBanner
            type="warning"
            message="Automated rollback is unavailable. Use version control to restore screens and global code if needed."
          />
        </div>

        <div class="mt-6 flex items-start gap-3 text-sm text-gray-600">
          <AlertCircle
            class="h-5 w-5 flex-shrink-0 text-gray-400"
            aria-hidden="true"
          />
          <p>
            You must have App Publisher rights on both source and destination apps to perform a merge.
          </p>
        </div>
      </div>

      <!-- Audit log link -->
      <div class="flex justify-between">
        <button
          type="button"
          class="flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
          data-testid="view-audit-log-button"
          @click="handleViewAuditLog"
        >
          <FileText
            class="h-4 w-4"
            aria-hidden="true"
          />
          View audit log
          <ExternalLink
            class="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </button>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          data-testid="cancel-button"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canConfigureMerge"
          data-testid="configure-merge-button"
          @click="handleConfigureMerge"
        >
          Configure merge
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  FileText,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-vue-next';
import StatusBadge from '../ui/StatusBadge.vue';
import WarningBanner from '../feedback/WarningBanner.vue';

export default {
  name: 'MergeDashboard',

  components: {
    FileText,
    ExternalLink,
    AlertCircle,
    Loader2,
    StatusBadge,
    WarningBanner
  },

  emits: ['configure-merge', 'view-audit-log', 'cancel'],

  data() {
    return {
      loading: true,
      error: null,
      appDetails: {
        id: null,
        name: '',
        organizationName: '',
        region: '',
        isPublished: false,
        updatedAt: null,
        updatedBy: null,
        lockedUntil: null
      },
      hasPublisherRights: true
    };
  },

  computed: {
    isLocked() {
      return Boolean(this.appDetails.lockedUntil && this.appDetails.lockedUntil > Date.now());
    },

    canConfigureMerge() {
      return this.hasPublisherRights && !this.isLocked;
    },

    formattedLastModified() {
      if (!this.appDetails.updatedAt) {
        return 'Unknown';
      }

      const date = new Date(this.appDetails.updatedAt);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      if (this.appDetails.updatedBy) {
        return `${formattedDate} by ${this.appDetails.updatedBy}`;
      }

      return formattedDate;
    }
  },

  mounted() {
    this.loadAppDetails();
  },

  methods: {
    async loadAppDetails() {
      try {
        this.loading = true;
        this.error = null;

        // Mock data for now - will be replaced with actual API call
        // TODO: Integrate with DataService when middleware is ready
        await Promise.resolve();

        this.appDetails = {
          id: 123,
          name: 'Source App',
          organizationName: 'Acme Corp',
          region: 'EU',
          isPublished: true,
          updatedAt: '2025-01-15T10:30:00Z',
          updatedBy: 'John Smith',
          lockedUntil: null
        };

        this.hasPublisherRights = true;
      } catch (err) {
        this.error = 'Unable to load app details. Please try again.';
        console.error('Failed to load app details:', err);
      } finally {
        this.loading = false;
      }
    },

    handleConfigureMerge() {
      this.$emit('configure-merge');
    },

    handleViewAuditLog() {
      this.$emit('view-audit-log');
    },

    handleCancel() {
      this.$emit('cancel');
    }
  }
};
</script>
