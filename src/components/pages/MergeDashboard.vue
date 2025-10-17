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

      <!-- Merge history section -->
      <div
        class="rounded-lg bg-white p-6 shadow"
        data-testid="merge-history-section"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Recent merge history
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              Review the most recent merge operations for this app.
            </p>
          </div>
          <button
            v-if="mergeHistory.length > 0"
            type="button"
            class="flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
            data-testid="view-full-history-button"
            @click="handleViewAuditLog"
          >
            View full history
            <ExternalLink
              class="h-3.5 w-3.5"
              aria-hidden="true"
            />
          </button>
        </div>

        <div
          v-if="mergeHistoryLoading"
          class="mt-4 flex items-center gap-3 text-sm text-gray-600"
          data-testid="merge-history-loading"
        >
          <Loader2
            class="h-4 w-4 animate-spin text-primary"
            aria-hidden="true"
          />
          Loading merge history...
        </div>

        <div
          v-else-if="mergeHistory.length === 0"
          class="mt-4 rounded-lg border border-dashed border-gray-200 p-6 text-center"
          data-testid="merge-history-empty"
        >
          <p class="text-sm text-gray-600">
            No merge history is available yet. Start by configuring your first merge.
          </p>
        </div>

        <div v-else class="mt-4 overflow-hidden rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr class="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th scope="col" class="px-4 py-3">
                  Date
                </th>
                <th scope="col" class="px-4 py-3">
                  Destination app
                </th>
                <th scope="col" class="px-4 py-3">
                  Items merged
                </th>
                <th scope="col" class="px-4 py-3">
                  Status
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  <span class="sr-only">View details</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr
                v-for="merge in mergeHistory"
                :key="merge.id"
                class="hover:bg-gray-50"
              >
                <td class="whitespace-nowrap px-4 py-3 text-gray-900">
                  {{ formatDate(merge.completedAt) }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-600">
                  {{ merge.destinationAppName }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-600">
                  {{ merge.itemsCount }}
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <StatusBadge
                    :status="merge.status"
                    :label="getStatusLabel(merge.status)"
                  />
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    class="flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80"
                    :data-testid="`view-merge-details-button-${merge.id}`"
                    @click="handleViewMergeResults(merge)"
                  >
                    View details
                    <ExternalLink
                      class="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
import { mapAppFields } from '../../utils/apiFieldMapping.js';
import { isLocked, hasPublisherRights } from '../../utils/computedFields.js';

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

  emits: ['configure-merge', 'view-audit-log', 'cancel', 'view-merge-results'],

  data() {
    return {
      loading: true,
      error: null,
      sourceAppId: null,
      currentUser: null,
      appDetails: {
        id: null,
        name: '',
        organizationName: '',
        region: '',
        isPublished: false,
        updatedAt: null,
        lockedUntil: null
      },
      mergeHistory: [],
      mergeHistoryLoading: false
    };
  },

  computed: {
    isLocked() {
      return isLocked(this.appDetails.lockedUntil);
    },

    hasPublisherRights() {
      if (!this.appDetails || !this.currentUser) {
        return false;
      }

      return hasPublisherRights(this.appDetails, this.currentUser);
    },

    canConfigureMerge() {
      return this.hasPublisherRights && !this.isLocked;
    },

    formattedLastModified() {
      if (!this.appDetails.updatedAt) {
        return 'Unknown';
      }

      const date = new Date(this.appDetails.updatedAt);

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    hasMergeHistory() {
      return this.mergeHistory && this.mergeHistory.length > 0;
    }
  },

  mounted() {
    // Get sourceAppId from widget instance data or URL query params
    this.sourceAppId = parseInt(window.Fliplet.Navigate.query.appId, 10);

    this.loadAppDetails();
  },

  methods: {
    async loadAppDetails() {
      try {
        this.loading = true;
        this.error = null;

        // Fetch current user for publisher rights check
        if (window.FlipletAppMerge && window.FlipletAppMerge.middleware && window.FlipletAppMerge.middleware.api) {
          const apiClient = window.FlipletAppMerge.middleware.api;

          // Fetch current user
          const userResponse = await apiClient.get('v1/user');

          this.currentUser = userResponse.user || userResponse;

          const [appData, organization, mergeHistory] = await Promise.all([
            this.fetchAppDetails(apiClient),
            this.fetchOrganization(apiClient),
            this.fetchMergeHistory(apiClient)
          ]);

          // Apply field mapping
          this.appDetails = mapAppFields(appData, { organization });

          this.mergeHistory = mergeHistory;

          // Ensure region is set
          if (!this.appDetails.region && organization) {
            this.appDetails.region = organization.region;
          }
        } else {
          // Fallback to mock data if middleware not available
          await Promise.resolve();

          this.currentUser = { email: 'user@example.com' };

          this.appDetails = {
            id: 123,
            name: 'Source App',
            organizationName: 'Acme Corp',
            region: 'EU',
            isPublished: true,
            updatedAt: '2025-01-15T10:30:00Z',
            lockedUntil: null,
            users: [
              { email: 'user@example.com', userRoleId: 1 }
            ]
          };

          this.mergeHistory = [];
        }
      } catch (err) {
        this.error = 'Unable to load app details. Please try again.';
        console.error('Failed to load app details:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchAppDetails(apiClient) {
      const response = await apiClient.get(`v1/apps/${this.sourceAppId}`);
      return response.app || response;
    },

    async fetchOrganization(apiClient) {
      if (!this.sourceAppId) {
        return null;
      }

      const appData = await this.fetchAppDetails(apiClient);

      if (!appData.organizationId) {
        return null;
      }

      const orgResponse = await apiClient.get(`v1/organizations/${appData.organizationId}`);
      return orgResponse.organization || orgResponse;
    },

    async fetchMergeHistory(apiClient) {
      try {
        this.mergeHistoryLoading = true;

        const logsResponse = await apiClient.post(`v1/apps/${this.sourceAppId}/logs`, {
          types: ['app.merge.initiated']
        });

        const logs = logsResponse.logs || logsResponse || [];

        return logs.slice(0, 5).map(log => ({
          id: log.mergeId || log.id,
          completedAt: log.createdAt || log.completedAt || Date.now(),
          destinationAppName: log.targetAppName || log.destinationAppName || 'Unknown',
          itemsCount: log.itemsCount || 0,
          status: log.status === 'error' ? 'error' : 'success'
        }));
      } catch (error) {
        console.error('Failed to fetch merge history:', error);
        return [];
      } finally {
        this.mergeHistoryLoading = false;
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
    },

    handleViewMergeResults(merge) {
      this.$emit('view-merge-results', { id: merge.id });
    },

    formatDate(timestamp) {
      if (!timestamp) {
        return 'Unknown';
      }

      const date = new Date(timestamp);

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getStatusLabel(status) {
      const labels = {
        success: 'Completed',
        error: 'Failed'
      };

      return labels[status] || status;
    }
  }
};
</script>
