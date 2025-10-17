<template>
  <div
    class="space-y-6"
    data-testid="merge-progress"
  >
    <!-- Info banner (sticky) -->
    <div class="sticky top-0 z-10">
      <WarningBanner
        type="info"
        message="The merge will continue even if you close this window. You can check the audit log for completion status."
        data-testid="info-banner"
      />
    </div>

    <div class="space-y-6">
      <!-- Header -->
      <div class="rounded-lg bg-white p-6 shadow">
        <h2 class="text-lg font-semibold text-gray-900">
          Merge in progress
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Please wait while your merge is being processed. You can safely close this window - the merge will continue in the background.
        </p>
      </div>

      <!-- Progress bar -->
      <div class="rounded-lg bg-white p-6 shadow">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">
            Progress
          </span>
          <span class="text-sm font-semibold text-primary">
            {{ progressPercentage }}%
          </span>
        </div>

        <div class="relative h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            class="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
            :style="{ width: progressPercentage + '%' }"
            role="progressbar"
            :aria-valuenow="progressPercentage"
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        <div class="mt-3 text-sm text-gray-600">
          {{ currentPhaseLabel }}
        </div>
      </div>

      <!-- Status messages list -->
      <div class="rounded-lg bg-white shadow">
        <div class="border-b border-gray-200 px-6 py-4">
          <h3 class="text-base font-semibold text-gray-900">
            Activity Log
          </h3>
        </div>

        <div
          ref="messagesList"
          class="max-h-96 overflow-y-auto p-6"
          data-testid="messages-list"
        >
          <div
            v-if="messages.length === 0"
            class="text-center text-sm text-gray-500"
          >
            Preparing merge...
          </div>

          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="flex items-start gap-3"
              :data-testid="`message-${index}`"
            >
              <!-- Status icon -->
              <div class="flex-shrink-0 pt-0.5">
                <CheckCircle2
                  v-if="message.status === 'completed'"
                  class="h-5 w-5 text-success"
                  aria-hidden="true"
                />
                <Loader2
                  v-else-if="message.status === 'in-progress'"
                  class="h-5 w-5 animate-spin text-primary"
                  aria-hidden="true"
                />
                <AlertCircle
                  v-else-if="message.status === 'error'"
                  class="h-5 w-5 text-error"
                  aria-hidden="true"
                />
                <Clock
                  v-else
                  class="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>

              <!-- Message content -->
              <div class="flex-1 pt-0.5">
                <p
                  class="text-sm"
                  :class="{
                    'text-gray-900': message.status === 'completed',
                    'text-primary font-medium': message.status === 'in-progress',
                    'text-error': message.status === 'error',
                    'text-gray-600': !message.status || message.status === 'pending'
                  }"
                >
                  {{ message.text }}
                  <span
                    v-if="message.count"
                    class="text-gray-500"
                  >
                    ({{ message.currentIndex }} of {{ message.count }})
                  </span>
                </p>
                <p
                  v-if="message.timestamp"
                  class="mt-0.5 text-xs text-gray-500"
                >
                  {{ formatTimestamp(message.timestamp) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-vue-next';
import WarningBanner from '../feedback/WarningBanner.vue';

export default {
  name: 'MergeProgress',

  components: {
    CheckCircle2,
    AlertCircle,
    Loader2,
    Clock,
    WarningBanner
  },

  inject: ['middleware'],

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
    },
    mergeId: {
      type: [Number, String],
      required: true
    }
  },

  emits: ['merge-complete', 'merge-error'],


  data() {
    return {
      progressPercentage: 0,
      currentPhase: 'initializing',
      messages: [],
      isComplete: false,
      hasError: false,
      eventUnsubscribe: null,
      pollingInterval: null
    };
  },

  computed: {
    /**
     * Get human-readable label for current phase
     */
    currentPhaseLabel() {
      const labels = {
        'initializing': 'Initializing merge...',
        'copying-screens': 'Copying screens...',
        'copying-datasources': 'Copying data sources...',
        'copying-files': 'Copying files...',
        'copying-configurations': 'Copying configurations...',
        'finalizing': 'Finalizing merge...',
        'completed': 'Merge completed successfully',
        'error': 'Merge encountered an error'
      };

      return labels[this.currentPhase] || 'Processing...';
    }
  },

  mounted() {
    console.log('[MergeProgress] Component mounted');
    console.log('[MergeProgress] Props:', {
      sourceAppId: this.sourceAppId,
      mergeId: this.mergeId
    });
    console.log('[MergeProgress] Middleware:', this.middleware);
    console.log('[MergeProgress] ApiClient:', this.middleware?.core?.apiClient);
    console.log('[MergeProgress] ApiClient.get type:', typeof this.middleware?.core?.apiClient?.get);

    this.startMerge();
    this.subscribeToMergeEvents();
  },

  beforeUnmount() {
    if (this.eventUnsubscribe) {
      this.eventUnsubscribe();
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  },

  methods: {
    /**
     * Get merge configuration in API payload format
     */
    getMergeConfiguration() {
      // The mergeConfig contains a selections object with the actual data
      const selections = this.mergeConfig.selections || {};

      // Debug: Log the selections to understand the data structure
      console.log('[MergeProgress] Merge config selections:', selections);
      console.log('[MergeProgress] Data sources selection:', selections['data-sources']);

      return {
        destinationOrganizationId: this.destinationApp.organizationId,
        fileIds: selections.files || [],
        folderIds: [], // TODO: Handle folder selections when implemented
        mergeAppSettings: selections.settings?.includes('appSettings') || false,
        mergeAppMenuSettings: selections.settings?.includes('menuSettings') || false,
        mergeAppearanceSettings: selections.settings?.includes('appearanceSettings') || false,
        mergeGlobalCode: selections.settings?.includes('globalCode') || false,
        pageIds: selections.screens || [],
        dataSources: (selections['data-sources'] || []).map(ds => {
          // Handle both object format and primitive ID format
          if (typeof ds === 'object' && ds.id) {
            return {
              id: ds.id,
              structureOnly: ds.structureOnly || true
            };
          } else {
            // If it's just an ID (primitive), create object with default structureOnly
            return {
              id: ds,
              structureOnly: true // Default to structure-only
            };
          }
        }),
        customDataSourcesInUse: selections.customDataSourcesInUse || []
      };
    },

    /**
     * Start the merge process
     */
    async startMerge() {
      console.log('[MergeProgress] Starting merge...');

      if (this.middleware && this.middleware.core && this.middleware.core.apiClient) {
        const apiClient = this.middleware.core.apiClient;
        console.log('[MergeProgress] Middleware API available, initiating merge...');

        try {
          // Get the merge configuration from the parent component
          const mergeConfig = this.getMergeConfiguration();

          // Debug: Log the API payload
          console.log('[MergeProgress] API payload:', mergeConfig);

          const response = await apiClient.post(`v1/apps/${this.sourceAppId}/merge`, {
            destinationAppId: this.destinationAppId,
            destinationOrganizationId: mergeConfig.destinationOrganizationId,
            fileIds: mergeConfig.fileIds || [],
            folderIds: mergeConfig.folderIds || [],
            mergeAppSettings: mergeConfig.mergeAppSettings || false,
            mergeAppMenuSettings: mergeConfig.mergeAppMenuSettings || false,
            mergeAppearanceSettings: mergeConfig.mergeAppearanceSettings || false,
            mergeGlobalCode: mergeConfig.mergeGlobalCode || false,
            pageIds: mergeConfig.pageIds || [],
            dataSources: mergeConfig.dataSources || [],
            customDataSourcesInUse: mergeConfig.customDataSourcesInUse || []
          });
          console.log('[MergeProgress] Merge initiated successfully:', response);
        } catch (error) {
          console.error('[MergeProgress] Failed to start merge:', error);
          this.handleMergeError(error);
          return;
        }
      } else {
        console.warn('[MergeProgress] Middleware API not available - merge cannot start');
        this.handleMergeError({ message: 'Merge service is not available. Please ensure the middleware is properly loaded.' });
        return;
      }

      console.log('[MergeProgress] Starting polling...');
      this.pollMergeStatus();
      this.pollingInterval = setInterval(() => {
        this.pollMergeStatus();
      }, 5000);
    },

    /**
     * Poll merge status from API
     */
    async pollMergeStatus() {
      console.log('[MergeProgress] Polling merge status...');

      if (this.isComplete || this.hasError) {
        console.log('[MergeProgress] Merge already complete or has error, stopping poll');
        if (this.pollingInterval) {
          clearInterval(this.pollingInterval);
        }

        return;
      }

      try {
        let statusResponse = null;
        let logsResponse = null;

        if (this.middleware && this.middleware.core && this.middleware.core.apiClient) {
          const apiClient = this.middleware.core.apiClient;

          // Get merge status
          console.log('[MergeProgress] Fetching merge status...');
          statusResponse = await apiClient.post(`v1/apps/${this.sourceAppId}/merge/status`, {
            mergeId: this.mergeId
          });
          console.log('[MergeProgress] Status response:', statusResponse);

          // Get merge logs
          console.log('[MergeProgress] Fetching merge logs...');
          logsResponse = await apiClient.post(`v1/apps/${this.sourceAppId}/logs`, {
            where: {
              type: {
                $iLike: '%app.merge%'
              },
              data: {
                $contains: {
                  mergeId: this.mergeId
                }
              }
            }
          });
          console.log('[MergeProgress] Logs response:', logsResponse);
        } else {
          console.warn('[MergeProgress] Middleware API not available during poll');
        }

        if (!statusResponse) {
          console.warn('[MergeProgress] No status response received');
          return;
        }

        this.progressPercentage = statusResponse.progress || statusResponse.percentage || 0;
        this.currentPhase = statusResponse.phase || this.currentPhase;
        console.log('[MergeProgress] Updated progress:', this.progressPercentage, 'phase:', this.currentPhase);

        const logs = logsResponse?.logs || logsResponse || [];

        if (logs.length > 0) {
          const latestLog = logs[logs.length - 1];
          this.currentPhase = this.determinePhaseFromLogType(latestLog.type);

          logs.forEach(log => {
            const existingMessage = this.messages.find(m => m.logId === log.id);

            if (!existingMessage) {
              this.addMessage({
                logId: log.id,
                text: log.message || this.getDefaultMessageForType(log.type),
                status: this.getStatusFromLogType(log.type),
                timestamp: log.createdAt || Date.now()
              });
            }
          });
        }

        this.handleProgressUpdate(statusResponse);

        if (statusResponse.status === 'completed') {
          console.log('[MergeProgress] Merge completed!');
          this.handleMergeComplete();
        } else if (statusResponse.status === 'error' || statusResponse.status === 'failed') {
          console.error('[MergeProgress] Merge failed:', statusResponse.error);
          this.handleMergeError({ message: statusResponse.error || 'Merge failed' });
        }
      } catch (err) {
        console.error('[MergeProgress] Failed to poll merge status:', err);
      }
    },

    /**
     * Determine phase from audit log type
     */
    determinePhaseFromLogType(logType) {
      const phaseMap = {
        'app.merge.initiated': 'initializing',
        'app.merge.page.copy': 'copying-screens',
        'app.merge.datasource.copy': 'copying-datasources',
        'app.merge.file.copy': 'copying-files',
        'app.merge.config.copy': 'copying-configurations',
        'app.merge.finalize': 'finalizing',
        'app.merge.completed': 'completed',
        'app.merge.error': 'error'
      };

      return phaseMap[logType] || this.currentPhase;
    },

    /**
     * Get status from log type
     */
    getStatusFromLogType(logType) {
      if (logType.includes('error') || logType.includes('failed')) {
        return 'error';
      }

      if (logType.includes('completed')) {
        return 'completed';
      }

      return 'in-progress';
    },

    /**
     * Get default message for log type
     */
    getDefaultMessageForType(logType) {
      const messages = {
        'app.merge.initiated': 'Merge initiated',
        'app.merge.page.copy': 'Copying screen',
        'app.merge.datasource.copy': 'Copying data source',
        'app.merge.file.copy': 'Copying file',
        'app.merge.config.copy': 'Copying configuration',
        'app.merge.finalize': 'Finalizing merge',
        'app.merge.completed': 'Merge completed successfully',
        'app.merge.error': 'An error occurred'
      };

      return messages[logType] || 'Processing';
    },

    /**
     * Subscribe to merge status events from middleware
     */
    subscribeToMergeEvents() {
      // TODO: Integrate with middleware event system
      // window.FlipletAppMerge.middleware.events.on('merge:progress', this.handleProgressUpdate);
      // window.FlipletAppMerge.middleware.events.on('merge:complete', this.handleMergeComplete);
      // window.FlipletAppMerge.middleware.events.on('merge:error', this.handleMergeError);

      // Store unsubscribe function for cleanup
      // this.eventUnsubscribe = () => {
      //   window.FlipletAppMerge.middleware.events.off('merge:progress', this.handleProgressUpdate);
      //   window.FlipletAppMerge.middleware.events.off('merge:complete', this.handleMergeComplete);
      //   window.FlipletAppMerge.middleware.events.off('merge:error', this.handleMergeError);
      // };
    },

    /**
     * Handle progress update from middleware
     */
    handleProgressUpdate(data) {
      this.progressPercentage = data.progress || data.percentage || this.progressPercentage;
      this.currentPhase = data.phase || this.currentPhase;

      if (data.message) {
        this.addMessage({
          text: data.message,
          status: data.status || 'in-progress',
          timestamp: Date.now(),
          currentIndex: data.currentIndex,
          count: data.count
        });
      }
    },

    /**
     * Handle merge completion
     */
    handleMergeComplete() {
      this.progressPercentage = 100;
      this.currentPhase = 'completed';
      this.isComplete = true;

      this.addMessage({
        text: 'Merge completed successfully',
        status: 'completed',
        timestamp: Date.now()
      });

      this.$emit('merge-complete');
    },

    /**
     * Handle merge error
     */
    handleMergeError(error) {
      this.currentPhase = 'error';
      this.hasError = true;

      this.addMessage({
        text: error.message || 'An error occurred during the merge',
        status: 'error',
        timestamp: Date.now()
      });

      this.$emit('merge-error', error);
    },

    /**
     * Add a message to the list
     */
    addMessage(message) {
      this.messages.push(message);

      this.$nextTick(() => {
        this.scrollToLatestMessage();
      });
    },

    /**
     * Auto-scroll to the latest message
     */
    scrollToLatestMessage() {
      if (this.$refs.messagesList) {
        this.$refs.messagesList.scrollTop = this.$refs.messagesList.scrollHeight;
      }
    },

    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  }
};
</script>

