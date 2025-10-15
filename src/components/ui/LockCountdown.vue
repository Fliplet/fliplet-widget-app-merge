<template>
  <div data-testid="lock-countdown">
    <!-- Warning banner (< 5 minutes remaining) -->
    <div
      v-if="showWarningBanner && !showCriticalModal"
      class="mb-6 flex items-start gap-3 rounded-lg border border-warning bg-warning/10 p-4"
      role="alert"
      data-testid="lock-warning-banner"
    >
      <Clock
        class="h-5 w-5 flex-shrink-0 text-warning"
        aria-hidden="true"
      />
      <div class="flex-1">
        <h4 class="font-semibold text-warning">
          Lock expiring soon
        </h4>
        <p class="mt-1 text-sm text-warning/90">
          Your lock will expire in {{ formattedTimeRemaining }}. Click "Extend lock" to continue working.
        </p>
      </div>
      <button
        type="button"
        class="rounded bg-warning px-3 py-1.5 text-sm font-medium text-white transition hover:bg-warning/90"
        data-testid="extend-lock-button-banner"
        @click="handleExtendLock"
      >
        Extend lock
      </button>
    </div>

    <!-- Critical modal (< 2 minutes remaining) -->
    <Teleport
      v-if="showCriticalModal"
      to="body"
    >
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-modal-title"
        data-testid="lock-critical-modal"
        @click.self="handleExtendLock"
      >
        <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div class="flex items-start gap-3">
            <div class="rounded-full bg-error/10 p-2">
              <AlertTriangle
                class="h-6 w-6 text-error"
                aria-hidden="true"
              />
            </div>
            <div class="flex-1">
              <h3
                id="lock-modal-title"
                class="text-lg font-semibold text-error"
              >
                Lock expiring!
              </h3>
              <p class="mt-2 text-sm text-gray-700">
                Your lock will expire in <strong class="text-error">{{ formattedTimeRemaining }}</strong>.
              </p>
              <p class="mt-1 text-sm text-gray-600">
                If the lock expires, your changes will be lost and you'll need to start over.
              </p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded bg-error px-4 py-2 text-sm font-medium text-white transition hover:bg-error/90"
              data-testid="extend-lock-button-modal"
              @click="handleExtendLock"
            >
              Extend lock now
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { Clock, AlertTriangle } from 'lucide-vue-next';

export default {
  name: 'LockCountdown',

  components: {
    Clock,
    AlertTriangle
  },

  props: {
    /**
     * Timestamp when lock expires (milliseconds)
     */
    lockedUntil: {
      type: Number,
      required: true
    },

    /**
     * Callback to extend lock
     */
    onExtend: {
      type: Function,
      default: null
    }
  },

  emits: ['extend-lock', 'lock-expired'],

  data() {
    return {
      currentTime: Date.now(),
      intervalId: null
    };
  },

  computed: {
    /**
     * Time remaining in milliseconds
     */
    timeRemaining() {
      const remaining = this.lockedUntil - this.currentTime;
      return remaining > 0 ? remaining : 0;
    },

    /**
     * Time remaining in seconds
     */
    timeRemainingSeconds() {
      return Math.floor(this.timeRemaining / 1000);
    },

    /**
     * Time remaining in minutes
     */
    timeRemainingMinutes() {
      return Math.floor(this.timeRemainingSeconds / 60);
    },

    /**
     * Show warning banner when < 5 minutes remaining
     */
    showWarningBanner() {
      return this.timeRemainingMinutes < 5 && this.timeRemainingMinutes >= 2;
    },

    /**
     * Show critical modal when < 2 minutes remaining
     */
    showCriticalModal() {
      return this.timeRemainingMinutes < 2 && this.timeRemaining > 0;
    },

    /**
     * Formatted time remaining string
     */
    formattedTimeRemaining() {
      if (this.timeRemaining <= 0) {
        return '0 seconds';
      }

      const minutes = this.timeRemainingMinutes;
      const seconds = this.timeRemainingSeconds % 60;

      if (minutes > 0) {
        if (seconds > 0) {
          return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }

      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  },

  watch: {
    timeRemaining(newTime) {
      if (newTime <= 0) {
        this.handleLockExpired();
      }
    }
  },

  mounted() {
    this.startCountdown();
  },

  beforeUnmount() {
    this.stopCountdown();
  },

  methods: {
    /**
     * Start countdown timer
     */
    startCountdown() {
      this.intervalId = setInterval(() => {
        this.currentTime = Date.now();
      }, 1000);
    },

    /**
     * Stop countdown timer
     */
    stopCountdown() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    /**
     * Handle extend lock button click
     */
    handleExtendLock() {
      this.$emit('extend-lock');

      if (this.onExtend) {
        this.onExtend();
      }
    },

    /**
     * Handle lock expiration
     */
    handleLockExpired() {
      this.stopCountdown();
      this.$emit('lock-expired');
    }
  }
};
</script>
