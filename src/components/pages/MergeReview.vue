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
    <div v-if="error" class="space-y-6">
      <WarningBanner
        type="error"
        :message="error"
        data-testid="review-error"
      />

      <!-- Back button for error state -->
      <div class="flex justify-between">
        <button
          type="button"
          class="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          data-testid="back-button-error"
          @click="handleBack"
        >
          Back
        </button>
      </div>
    </div>

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
            data-testid="edit-settings-button"
            @click="handleEditSettings"
          >
            Back
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

  inject: ['middleware'],

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
    destinationApp: {
      type: Object,
      required: true
    },
    mergeConfig: {
      type: Object,
      required: true
    }
  },

  emits: ['start-merge', 'edit-settings', 'cancel', 'back'],

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
     * Transform merge configuration to API payload format
     */
    transformMergeConfigToApiPayload() {
      // The mergeConfig contains a selections object with the actual data
      const selections = this.mergeConfig.selections || {};

      // Debug: Log the actual data structure
      console.log('MergeReview - mergeConfig:', this.mergeConfig);
      console.log('MergeReview - selections:', selections);
      console.log('MergeReview - settings array:', selections.settings);

      return {
        destinationAppId: this.destinationAppId,
        destinationOrganizationId: this.destinationApp.organizationId,
        region: this.destinationApp.region || 'eu',
        fileIds: selections.files || [],
        folderIds: [], // TODO: Handle folder selections when implemented
        mergeAppSettings: selections.settings?.includes('appSettings') || false,
        mergeAppMenuSettings: selections.settings?.includes('menuSettings') || false,
        mergeAppearanceSettings: selections.settings?.includes('appearanceSettings') || false,
        mergeGlobalCode: selections.settings?.includes('globalCode') || false,
        pageIds: selections.screens || [],
        dataSources: (selections['data-sources'] || []).map(ds => ({
          id: ds.id || ds, // Handle both object and primitive ID
          scope: ds.scope || 'structure'
        })),
        customDataSourcesInUse: selections.customDataSourcesInUse || []
      };
    },

    /**
     * Transform API response to component preview format
     */
    transformApiResponseToPreview(response) {
      // Handle both direct response and nested preview object
      const data = response.preview || response || {};

      // Debug: Log the API response data
      console.log('MergeReview - API response data:', data);
      console.log('MergeReview - mergeAppMenuSettings:', data.mergeAppMenuSettings);

      // Transform pages data
      const screens = [];
      if (data.pages) {
        // Add copied pages
        if (data.pages.copied && Array.isArray(data.pages.copied)) {
          screens.push(...data.pages.copied.map(page => ({
            id: page.id,
            name: page.title || page.name,
            status: 'copy',
            warnings: []
          })));
        }
        // Add overwritten pages
        if (data.pages.overwritten && Array.isArray(data.pages.overwritten)) {
          screens.push(...data.pages.overwritten.map(page => ({
            id: page.id,
            name: page.title || page.name,
            status: 'overwrite',
            warnings: []
          })));
        }
      }

      // Transform data sources data
      const dataSources = [];
      if (data.dataSources) {
        // Add copied data sources
        if (data.dataSources.copied && Array.isArray(data.dataSources.copied)) {
          dataSources.push(...data.dataSources.copied.map(ds => ({
            id: ds.id,
            name: ds.name,
            copyMode: 'structure-only', // Default to structure-only
            status: 'copy',
            warnings: []
          })));
        }
        // Add overwritten data sources
        if (data.dataSources.overwritten && Array.isArray(data.dataSources.overwritten)) {
          dataSources.push(...data.dataSources.overwritten.map(ds => ({
            id: ds.id,
            name: ds.name,
            copyMode: 'structure-only', // Default to structure-only
            status: 'overwrite',
            warnings: []
          })));
        }
      }

      // Transform files data
      const files = [];
      if (data.files) {
        // Add copied files
        if (data.files.copied && Array.isArray(data.files.copied)) {
          files.push(...data.files.copied.map(file => ({
            id: file.id,
            name: file.name,
            path: file.path || '/',
            type: file.type || 'file',
            status: 'copy',
            warnings: []
          })));
        }
        // Add overwritten files
        if (data.files.overwritten && Array.isArray(data.files.overwritten)) {
          files.push(...data.files.overwritten.map(file => ({
            id: file.id,
            name: file.name,
            path: file.path || '/',
            type: file.type || 'file',
            status: 'overwrite',
            warnings: []
          })));
        }
      }

      // Transform configuration settings
      const configurations = [];
      if (data.mergeAppSettings) {
        configurations.push({
          type: 'appSettings',
          label: 'App Settings',
          description: 'Global app configuration and settings',
          status: 'copy'
        });
      }
      if (data.mergeAppMenuSettings) {
        configurations.push({
          type: 'menuSettings',
          label: 'Menu Settings',
          description: 'App navigation menu configuration',
          status: 'copy'
        });
      }
      if (data.mergeAppearanceSettings) {
        configurations.push({
          type: 'appearanceSettings',
          label: 'Appearance Settings',
          description: 'Visual styling and theme settings',
          status: 'copy'
        });
      }
      if (data.mergeGlobalCode) {
        configurations.push({
          type: 'globalCode',
          label: 'Global Code',
          description: 'Custom JavaScript, CSS, and HTML',
          status: 'copy'
        });
      }

      return {
        screens,
        dataSources,
        files,
        configurations
      };
    },

    /**
     * Load merge preview from middleware
     */
    async loadMergePreview() {
      try {
        this.loading = true;
        this.error = null;

        // Validate required props
        if (!this.sourceAppId) {
          throw new Error('Source app ID is required to load merge preview');
        }

        if (!this.destinationAppId) {
          throw new Error('Destination app ID is required to load merge preview');
        }

        if (!this.destinationApp || !this.destinationApp.organizationId) {
          throw new Error('Destination organization ID is required to load merge preview');
        }

        if (this.middleware && this.middleware.core && this.middleware.core.apiClient) {
          const apiClient = this.middleware.core.apiClient;

          // Transform merge config to API payload format
          const apiPayload = this.transformMergeConfigToApiPayload();

          // Debug: Log the payload being sent
          console.log('Merge Preview API Payload:', JSON.stringify(apiPayload, null, 2));

          // Call preview endpoint with merge config
          const response = await apiClient.post(`v1/apps/${this.sourceAppId}/merge/preview`, apiPayload);

          // Transform the API response to match the component's expected format
          this.preview = this.transformApiResponseToPreview(response);

          // Debug: Log the transformed preview data
          console.log('MergeReview - Transformed preview:', this.preview);

          // Get plan limits from merge status endpoint
          // Note: This endpoint requires a mergeId, but we don't have one yet for preview
          // We'll skip this for now and handle plan limits differently
          // const statusResponse = await apiClient.post(`v1/apps/${this.sourceAppId}/merge/status`, { mergeId: null });
          // const limitWarnings = statusResponse.limitWarnings || {};

          this.planLimits = {
            screensLimit: null,
            dataSourcesLimit: null,
            filesLimit: null
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
        // Extract error message using Fliplet.parseError
        this.error = Fliplet.parseError(err) || 'Unable to load merge preview. Please try again.';
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
    },

    /**
     * Handle back button click
     */
    handleBack() {
      this.$emit('back');
    }
  }
};
</script>

