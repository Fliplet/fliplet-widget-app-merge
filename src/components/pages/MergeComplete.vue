<template>
  <div
    class="space-y-6"
    data-testid="merge-complete"
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
      <span class="sr-only">Loading merge results...</span>
    </div>

    <!-- Error state -->
    <WarningBanner
      v-if="error"
      type="error"
      :message="error"
      data-testid="complete-error"
    />

    <!-- Content -->
    <div v-if="!loading && !error">
      <!-- Success message -->
      <div class="rounded-lg bg-success/10 p-6 shadow">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <CheckCircle2
              class="h-8 w-8 text-success"
              aria-hidden="true"
            />
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-900">
              Merge completed successfully
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              Your items have been successfully merged to the destination app.
            </p>
          </div>
        </div>
      </div>

      <!-- Summary section -->
      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="mb-4 text-base font-semibold text-gray-900">
          Merge Summary
        </h3>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="rounded-lg bg-primary/5 p-4">
            <p class="text-2xl font-bold text-primary">
              {{ results.screensCopied || 0 }}
            </p>
            <p class="mt-1 text-sm text-gray-600">
              Screens
            </p>
          </div>
          <div class="rounded-lg bg-primary/5 p-4">
            <p class="text-2xl font-bold text-primary">
              {{ results.dataSourcesCopied || 0 }}
            </p>
            <p class="mt-1 text-sm text-gray-600">
              Data Sources
            </p>
          </div>
          <div class="rounded-lg bg-primary/5 p-4">
            <p class="text-2xl font-bold text-primary">
              {{ results.filesCopied || 0 }}
            </p>
            <p class="mt-1 text-sm text-gray-600">
              Files
            </p>
          </div>
          <div class="rounded-lg bg-primary/5 p-4">
            <p class="text-2xl font-bold text-primary">
              {{ results.configurationsCopied || 0 }}
            </p>
            <p class="mt-1 text-sm text-gray-600">
              Configurations
            </p>
          </div>
        </div>
      </div>

      <!-- Issues and warnings section -->
      <div
        v-if="hasIssuesOrWarnings"
        class="rounded-lg bg-white p-6 shadow"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle
            class="h-5 w-5 flex-shrink-0 text-warning"
            aria-hidden="true"
          />
          <div class="flex-1">
            <h3 class="text-base font-semibold text-gray-900">
              Issues and Warnings
            </h3>
            <div class="mt-3 space-y-2">
              <div
                v-for="(issue, index) in results.issues"
                :key="index"
                class="flex items-start gap-2 text-sm text-gray-600"
              >
                <span class="font-medium">•</span>
                <span>{{ issue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plan limit warnings -->
      <WarningBanner
        v-if="hasPlanLimitWarning"
        type="warning"
        :message="planLimitWarningMessage"
        data-testid="plan-limit-warning"
      />

      <!-- Next steps section -->
      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="mb-4 text-base font-semibold text-gray-900">
          Next Steps
        </h3>
        <div class="space-y-3 text-sm text-gray-600">
          <div class="flex items-start gap-3">
            <span class="font-semibold text-gray-900">1.</span>
            <p>
              Review the merged items in the destination app to ensure everything copied correctly.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="font-semibold text-gray-900">2.</span>
            <p>
              If screens were merged, you'll need to republish the app for changes to go live.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="font-semibold text-gray-900">3.</span>
            <p>
              Data source changes are already live in published apps.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="font-semibold text-gray-900">4.</span>
            <p>
              Check the audit log for detailed information about this merge operation.
            </p>
          </div>
        </div>
      </div>

      <!-- Previous merges section -->
      <div
        v-if="previousMerges && previousMerges.length > 0"
        class="rounded-lg bg-white p-6 shadow"
      >
        <h3 class="mb-4 text-base font-semibold text-gray-900">
          Recent Merges
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  From App
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  To App
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Items Merged
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="merge in previousMerges"
                :key="merge.id"
              >
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                  {{ formatDate(merge.completedAt) }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {{ merge.sourceAppName }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {{ merge.targetAppName }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {{ merge.itemsCount }}
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <StatusBadge
                    :status="merge.status"
                    :label="getStatusLabel(merge.status)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between">
        <button
          type="button"
          class="flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          data-testid="view-audit-log-button"
          @click="handleViewAuditLog"
        >
          <FileText
            class="h-4 w-4"
            aria-hidden="true"
          />
          View Audit Log
          <ExternalLink
            class="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded bg-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          data-testid="open-app-button"
          @click="handleOpenApp"
        >
          Open Destination App
          <ExternalLink
            class="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FileText,
  Loader2
} from 'lucide-vue-next';
import StatusBadge from '../ui/StatusBadge.vue';
import WarningBanner from '../feedback/WarningBanner.vue';

export default {
  name: 'MergeComplete',

  components: {
    CheckCircle2,
    AlertTriangle,
    ExternalLink,
    FileText,
    Loader2,
    StatusBadge,
    WarningBanner
  },

  props: {
    sourceAppId: {
      type: Number,
      required: true
    },
    mergeId: {
      type: [Number, String],
      required: true
    }
  },

  emits: ['open-app', 'view-audit-log'],

  data() {
    return {
      loading: true,
      error: null,
      results: {
        screensCopied: 0,
        dataSourcesCopied: 0,
        filesCopied: 0,
        configurationsCopied: 0,
        issues: [],
        planLimitWarnings: []
      },
      previousMerges: []
    };
  },

  computed: {
    /**
     * Check if there are any issues or warnings
     */
    hasIssuesOrWarnings() {
      return this.results.issues && this.results.issues.length > 0;
    },

    /**
     * Check if there are plan limit warnings
     */
    hasPlanLimitWarning() {
      return this.results.planLimitWarnings && this.results.planLimitWarnings.length > 0;
    },

    /**
     * Generate plan limit warning message
     */
    planLimitWarningMessage() {
      if (!this.results.planLimitWarnings || this.results.planLimitWarnings.length === 0) {
        return '';
      }

      return `Plan limits: ${this.results.planLimitWarnings.join(', ')}`;
    }
  },

  mounted() {
    this.loadMergeResults();
  },

  methods: {
    /**
     * Load merge results from middleware
     */
    async loadMergeResults() {
      try {
        this.loading = true;
        this.error = null;

        if (window.FlipletAppMerge && window.FlipletAppMerge.middleware && window.FlipletAppMerge.middleware.api) {
          const apiClient = window.FlipletAppMerge.middleware.api;

          // Fetch final merge status with results
          const statusResponse = await apiClient.post(`v1/apps/${this.sourceAppId}/merge/status`, {
            mergeId: this.mergeId
          });

          // Parse summary counts from response
          this.results = {
            screensCopied: statusResponse.summary?.screensCopied || 0,
            dataSourcesCopied: statusResponse.summary?.dataSourcesCopied || 0,
            filesCopied: statusResponse.summary?.filesCopied || 0,
            configurationsCopied: statusResponse.summary?.configurationsCopied || 0,
            issues: statusResponse.issues || statusResponse.warnings || [],
            planLimitWarnings: statusResponse.limitWarnings ? Object.values(statusResponse.limitWarnings) : []
          };

          // Fetch merge history from audit logs
          const logsResponse = await apiClient.post(`v1/apps/${this.sourceAppId}/logs`, {
            types: ['app.merge.initiated']
          });

          const logs = logsResponse.logs || logsResponse || [];

          // Parse logs to build previousMerges array
          this.previousMerges = logs.slice(0, 5).map(log => ({
            id: log.mergeId || log.id,
            completedAt: log.createdAt || Date.now(),
            sourceAppName: log.sourceAppName || 'Unknown',
            targetAppName: log.targetAppName || log.destinationAppName || 'Unknown',
            itemsCount: log.itemsCount || 0,
            status: log.status === 'error' ? 'error' : 'success'
          }));
        } else {
          // Fallback to mock data
          await Promise.resolve();

          this.results = {
            screensCopied: 5,
            dataSourcesCopied: 3,
            filesCopied: 12,
            configurationsCopied: 2,
            issues: [],
            planLimitWarnings: []
          };

          this.previousMerges = [];
        }
      } catch (err) {
        this.error = 'Unable to load merge results. Please try again.';
        console.error('Failed to load merge results:', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Format date for display
     */
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    /**
     * Get human-readable status label
     */
    getStatusLabel(status) {
      const labels = {
        'success': 'Success',
        'error': 'Failed',
        'in-progress': 'In Progress'
      };

      return labels[status] || status;
    },

    /**
     * Handle open app button click
     */
    handleOpenApp() {
      this.$emit('open-app');
    },

    /**
     * Handle view audit log button click
     */
    handleViewAuditLog() {
      this.$emit('view-audit-log');
    }
  }
};
</script>

