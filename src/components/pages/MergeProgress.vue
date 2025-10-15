<template>
  <div
    class="space-y-6"
    data-testid="merge-progress"
  >
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

    <!-- Info banner -->
    <WarningBanner
      type="info"
      message="The merge will continue even if you close this window. You can check the audit log for completion status."
      data-testid="info-banner"
    />
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

  emits: ['merge-complete', 'merge-error'],

  data() {
    return {
      progressPercentage: 0,
      currentPhase: 'initializing',
      messages: [],
      isComplete: false,
      hasError: false,
      eventUnsubscribe: null
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
    this.startMerge();
    this.subscribeToMergeEvents();
  },

  beforeUnmount() {
    if (this.eventUnsubscribe) {
      this.eventUnsubscribe();
    }
  },

  methods: {
    /**
     * Start the merge process
     */
    async startMerge() {
      // TODO: Integrate with middleware to start actual merge
      // For now, simulate merge progress
      this.simulateMergeProgress();
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
      this.progressPercentage = data.percentage;
      this.currentPhase = data.phase;

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
    },

    /**
     * Simulate merge progress (for testing)
     * TODO: Remove when middleware integration is complete
     */
    simulateMergeProgress() {
      const phases = [
        { phase: 'initializing', percentage: 10, message: 'Preparing merge environment', delay: 1000 },
        { phase: 'copying-screens', percentage: 30, message: 'Copying screens', count: 5, delay: 1500 },
        { phase: 'copying-datasources', percentage: 50, message: 'Copying data sources', count: 3, delay: 1500 },
        { phase: 'copying-files', percentage: 70, message: 'Copying files', count: 10, delay: 1500 },
        { phase: 'copying-configurations', percentage: 85, message: 'Copying configurations', count: 4, delay: 1000 },
        { phase: 'finalizing', percentage: 95, message: 'Finalizing merge', delay: 1000 },
        { phase: 'completed', percentage: 100, message: 'Merge completed successfully', delay: 500 }
      ];

      let currentStep = 0;

      const processNextPhase = () => {
        if (currentStep >= phases.length) {
          this.handleMergeComplete();
          return;
        }

        const phaseData = phases[currentStep];
        this.handleProgressUpdate({
          phase: phaseData.phase,
          percentage: phaseData.percentage,
          message: phaseData.message,
          status: phaseData.phase === 'completed' ? 'completed' : 'in-progress',
          currentIndex: currentStep + 1,
          count: phaseData.count || phases.length
        });

        currentStep++;
        setTimeout(processNextPhase, phaseData.delay);
      };

      // Start the simulation
      setTimeout(processNextPhase, 500);
    }
  }
};
</script>

