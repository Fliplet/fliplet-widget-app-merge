<template>
  <div
    class="space-y-6"
    data-testid="merge-review"
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
      <span class="sr-only">Loading merge preview...</span>
    </div>

    <!-- Error state -->
    <WarningBanner
      v-if="error"
      type="error"
      :message="error"
      data-testid="review-error"
    />

    <!-- Content -->
    <div v-if="!loading && !error">
      <div class="space-y-6">
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 class="text-lg font-semibold text-gray-900">
            Review your merge configuration
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Please review the items that will be merged. You can edit settings or proceed with the merge.
          </p>
        </div>

        <WarningBanner
          v-if="hasPlanLimitWarning"
          type="warning"
          :message="planLimitWarningMessage"
          data-testid="plan-limit-warning"
        />

        <div class="space-y-6">
          <div
            v-if="preview.screens && preview.screens.length > 0"
            class="rounded-lg border border-gray-200 bg-white p-6 shadow"
          >
            <h3 class="mb-4 text-base font-semibold text-gray-900">
              Screens ({{ preview.screens.length }})
            </h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ID
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Warnings
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr
                    v-for="screen in preview.screens"
                    :key="screen.id"
                  >
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {{ screen.name }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {{ screen.id }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3">
                      <StatusBadge
                        :status="screen.status"
                        :label="getStatusLabel(screen.status)"
                      />
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">
                      <div
                        v-if="screen.warnings && screen.warnings.length > 0"
                        class="flex items-start gap-1.5"
                      >
                        <AlertTriangle
                          class="h-4 w-4 flex-shrink-0 text-warning"
                          aria-hidden="true"
                        />
                        <span>{{ screen.warnings.join(', ') }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            v-if="preview.dataSources && preview.dataSources.length > 0"
            class="rounded-lg border border-gray-200 bg-white p-6 shadow"
          >
            <h3 class="mb-4 text-base font-semibold text-gray-900">
              Data Sources ({{ preview.dataSources.length }})
            </h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ID
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Copy Mode
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Warnings
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr
                    v-for="ds in preview.dataSources"
                    :key="ds.id"
                  >
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {{ ds.name }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {{ ds.id }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {{ ds.copyMode === 'structure-only' ? 'Structure only' : 'Structure and data' }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3">
                      <StatusBadge
                        :status="ds.status"
                        :label="getStatusLabel(ds.status)"
                      />
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">
                      <div
                        v-if="ds.warnings && ds.warnings.length > 0"
                        class="flex items-start gap-1.5"
                      >
                        <AlertTriangle
                          class="h-4 w-4 flex-shrink-0 text-warning"
                          aria-hidden="true"
                        />
                        <span>{{ ds.warnings.join(', ') }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            v-if="preview.files && preview.files.length > 0"
            class="rounded-lg border border-gray-200 bg-white p-6 shadow"
          >
            <h3 class="mb-4 text-base font-semibold text-gray-900">
              Files ({{ preview.files.length }})
            </h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Path
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Warnings
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr
                    v-for="file in preview.files"
                    :key="file.id"
                  >
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {{ file.name }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-500">
                      {{ file.path }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {{ file.type }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3">
                      <StatusBadge
                        :status="file.status"
                        :label="getStatusLabel(file.status)"
                      />
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">
                      <div
                        v-if="file.warnings && file.warnings.length > 0"
                        class="flex items-start gap-1.5"
                      >
                        <AlertTriangle
                          class="h-4 w-4 flex-shrink-0 text-warning"
                          aria-hidden="true"
                        />
                        <span>{{ file.warnings.join(', ') }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            v-if="preview.configurations && preview.configurations.length > 0"
            class="rounded-lg border border-gray-200 bg-white p-6 shadow"
          >
            <h3 class="mb-4 text-base font-semibold text-gray-900">
              App-Level Configurations ({{ preview.configurations.length }})
            </h3>
            <div class="space-y-3">
              <div
                v-for="config in preview.configurations"
                :key="config.type"
                class="flex items-center justify-between rounded border border-gray-200 p-4"
              >
                <div>
                  <p class="font-medium text-gray-900">
                    {{ config.label }}
                  </p>
                  <p
                    v-if="config.description"
                    class="mt-1 text-sm text-gray-600"
                  >
                    {{ config.description }}
                  </p>
                </div>
                <StatusBadge
                  :status="config.status"
                  :label="getStatusLabel(config.status)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-primary/5 p-6">
          <h3 class="text-base font-semibold text-gray-900">
            Summary
          </h3>
          <div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p class="text-2xl font-bold text-primary">
                {{ preview.screens?.length || 0 }}
              </p>
              <p class="text-sm text-gray-600">
                Screens
              </p>
            </div>
            <div>
              <p class="text-2xl font-bold text-primary">
                {{ preview.dataSources?.length || 0 }}
              </p>
              <p class="text-sm text-gray-600">
                Data Sources
              </p>
            </div>
            <div>
              <p class="text-2xl font-bold text-primary">
                {{ preview.files?.length || 0 }}
              </p>
              <p class="text-sm text-gray-600">
                Files
              </p>
            </div>
            <div>
              <p class="text-2xl font-bold text-primary">
                {{ preview.configurations?.length || 0 }}
              </p>
              <p class="text-sm text-gray-600">
                Configurations
              </p>
            </div>
          </div>
        </div>
      </div>

      <ModalDialog
        v-if="showCancelWarning"
        title="Discard merge configuration?"
        message="If you cancel now, you will lose your merge configuration."
        confirm-label="Discard & Cancel"
        cancel-label="Keep Editing"
        confirm-variant="danger"
        @confirm="confirmCancel"
        @cancel="dismissCancelWarning"
      />

      <!-- Actions -->
      <div class="mt-8 flex justify-between border-t border-gray-200 pt-6">
        <div class="flex gap-3">
          <button
            type="button"
            class="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            data-testid="cancel-button"
            @click="promptCancel"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            data-testid="edit-settings-button"
            @click="handleEditSettings"
          >
            Edit Settings
          </button>
        </div>
        <button
          type="button"
          class="rounded bg-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canStartMerge"
          data-testid="start-merge-button"
          @click="handleStartMerge"
        >
          Start Merge
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  AlertTriangle,
  Loader2
} from 'lucide-vue-next';
import StatusBadge from '../ui/StatusBadge.vue';
import WarningBanner from '../feedback/WarningBanner.vue';
import ModalDialog from '../feedback/ModalDialog.vue';

export default {
  name: 'MergeReview',

  components: {
    AlertTriangle,
    Loader2,
    StatusBadge,
    WarningBanner,
    ModalDialog
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
    mergeConfig: {
      type: Object,
      required: true
    }
  },

  emits: ['start-merge', 'edit-settings', 'cancel'],

  data() {
    return {
      loading: true,
      error: null,
      preview: {
        screens: [],
        dataSources: [],
        files: [],
        configurations: []
      },
      planLimits: {
        screensLimit: null,
        dataSourcesLimit: null,
        filesLimit: null
      },
      showCancelWarning: false
    };
  },

  computed: {
    /**
     * Check if plan limits are exceeded
     */
    hasPlanLimitWarning() {
      if (!this.planLimits.screensLimit && !this.planLimits.dataSourcesLimit && !this.planLimits.filesLimit) {
        return false;
      }

      const exceedsScreensLimit = this.planLimits.screensLimit &&
        this.preview.screens.length > this.planLimits.screensLimit;

      const exceedsDataSourcesLimit = this.planLimits.dataSourcesLimit &&
        this.preview.dataSources.length > this.planLimits.dataSourcesLimit;

      const exceedsFilesLimit = this.planLimits.filesLimit &&
        this.preview.files.length > this.planLimits.filesLimit;

      return exceedsScreensLimit || exceedsDataSourcesLimit || exceedsFilesLimit;
    },

    /**
     * Generate plan limit warning message
     */
    planLimitWarningMessage() {
      const warnings = [];

      if (this.planLimits.screensLimit && this.preview.screens.length > this.planLimits.screensLimit) {
        warnings.push(`Screens: ${this.preview.screens.length}/${this.planLimits.screensLimit}`);
      }

      if (this.planLimits.dataSourcesLimit && this.preview.dataSources.length > this.planLimits.dataSourcesLimit) {
        warnings.push(`Data Sources: ${this.preview.dataSources.length}/${this.planLimits.dataSourcesLimit}`);
      }

      if (this.planLimits.filesLimit && this.preview.files.length > this.planLimits.filesLimit) {
        warnings.push(`Files: ${this.preview.files.length}/${this.planLimits.filesLimit}`);
      }

      return `Plan limits exceeded: ${warnings.join(', ')}. Some items may not be merged.`;
    },

    /**
     * Check if merge can be started
     */
    canStartMerge() {
      return !this.hasPlanLimitWarning;
    }
  },

  mounted() {
    this.loadMergePreview();
  },

  methods: {
    /**
     * Load merge preview from middleware
     */
    async loadMergePreview() {
      try {
        this.loading = true;
        this.error = null;

        if (window.FlipletAppMerge && window.FlipletAppMerge.middleware && window.FlipletAppMerge.middleware.api) {
          const apiClient = window.FlipletAppMerge.middleware.api;

          // Call preview endpoint with merge config
          const response = await apiClient.post(`v1/apps/${this.sourceAppId}/merge/preview`, this.mergeConfig);

          this.preview = response.preview || response || {
            screens: [],
            dataSources: [],
            files: [],
            configurations: []
          };

          // Get plan limits from merge status endpoint
          const statusResponse = await apiClient.post(`v1/apps/${this.sourceAppId}/merge/status`, {});
          const limitWarnings = statusResponse.limitWarnings || {};

          this.planLimits = {
            screensLimit: limitWarnings.screensLimit || null,
            dataSourcesLimit: limitWarnings.dataSourcesLimit || null,
            filesLimit: limitWarnings.filesLimit || null
          };
        } else {
          // Fallback to mock data
          await Promise.resolve();

          this.preview = {
            screens: [
              {
                id: 1,
                name: 'Home Screen',
                status: 'copy',
                warnings: []
              },
              {
                id: 2,
                name: 'Profile Screen',
                status: 'overwrite',
                warnings: ['Contains non-copyable components']
              }
            ],
            dataSources: [
              {
                id: 10,
                name: 'Users',
                copyMode: 'structure-only',
                status: 'copy',
                warnings: []
              }
            ],
            files: [
              {
                id: 100,
                name: 'logo.png',
                path: '/assets/logo.png',
                type: 'image',
                status: 'copy',
                warnings: []
              }
            ],
            configurations: []
          };

          this.planLimits = {
            screensLimit: null,
            dataSourcesLimit: null,
            filesLimit: null
          };
        }
      } catch (err) {
        this.error = 'Unable to load merge preview. Please try again.';
        console.error('Failed to load merge preview:', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Get human-readable status label
     */
    getStatusLabel(status) {
      const labels = {
        copy: 'New',
        overwrite: 'Update',
        success: 'Completed',
        error: 'Error',
        'in-progress': 'In Progress'
      };

      return labels[status] || status;
    },

    /**
     * Handle start merge button click
     */
    handleStartMerge() {
      this.$emit('start-merge');
    },

    /**
     * Handle edit settings button click
     */
    handleEditSettings() {
      this.$emit('edit-settings');
    },

    /**
     * Handle cancel button click
     */
    handleCancel() {
      this.$emit('cancel');
    },

    promptCancel() {
      this.showCancelWarning = true;
    },

    dismissCancelWarning() {
      this.showCancelWarning = false;
    },

    confirmCancel() {
      this.showCancelWarning = false;
      this.$emit('cancel');
    }
  }
};
</script>

