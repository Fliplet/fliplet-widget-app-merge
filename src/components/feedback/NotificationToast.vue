<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border shadow-lg transition-all"
      :class="toastClasses"
      role="alert"
      data-testid="notification-toast"
    >
      <component
        :is="iconComponent"
        class="h-5 w-5 flex-shrink-0"
        :class="iconClasses"
        aria-hidden="true"
      />

      <div class="flex-1 py-0.5">
        <p
          class="text-sm font-medium"
          :class="textClasses"
        >
          {{ message }}
        </p>
      </div>

      <button
        type="button"
        class="rounded p-1 transition hover:bg-black/5"
        :class="closeButtonClasses"
        data-testid="toast-close-button"
        aria-label="Close notification"
        @click="handleClose"
      >
        <X
          class="h-4 w-4"
          aria-hidden="true"
        />
      </button>
    </div>
  </Teleport>
</template>

<script>
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-vue-next';

export default {
  name: 'NotificationToast',

  components: {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    X
  },

  props: {
    /**
     * Toast type
     * @type {'success'|'warning'|'error'|'info'}
     */
    type: {
      type: String,
      required: true,
      validator: (value) => {
        return ['success', 'warning', 'error', 'info'].includes(value);
      }
    },

    /**
     * Toast message text
     */
    message: {
      type: String,
      required: true
    },

    /**
     * Auto-dismiss duration in milliseconds (0 to disable)
     */
    duration: {
      type: Number,
      default: 5000
    },

    /**
     * Show/hide toast
     */
    show: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close'],

  data() {
    return {
      timeoutId: null
    };
  },

  computed: {
    /**
     * Get icon component based on type
     */
    iconComponent() {
      const icons = {
        'success': 'CheckCircle2',
        'warning': 'AlertTriangle',
        'error': 'AlertCircle',
        'info': 'Info'
      };
      return icons[this.type];
    },

    /**
     * Get toast container classes
     */
    toastClasses() {
      const classes = {
        'success': 'border-success/20 bg-success/10',
        'warning': 'border-warning/20 bg-warning/10',
        'error': 'border-error/20 bg-error/10',
        'info': 'border-primary/20 bg-primary/10'
      };
      return ['p-4', classes[this.type]];
    },

    /**
     * Get icon classes
     */
    iconClasses() {
      const classes = {
        'success': 'text-success',
        'warning': 'text-warning',
        'error': 'text-error',
        'info': 'text-primary'
      };
      return classes[this.type];
    },

    /**
     * Get text classes
     */
    textClasses() {
      const classes = {
        'success': 'text-success',
        'warning': 'text-warning',
        'error': 'text-error',
        'info': 'text-primary'
      };
      return classes[this.type];
    },

    /**
     * Get close button classes
     */
    closeButtonClasses() {
      const classes = {
        'success': 'text-success',
        'warning': 'text-warning',
        'error': 'text-error',
        'info': 'text-primary'
      };
      return classes[this.type];
    }
  },

  watch: {
    show(isVisible) {
      if (isVisible) {
        this.startAutoDismiss();
      } else {
        this.clearAutoDismiss();
      }
    }
  },

  mounted() {
    if (this.show) {
      this.startAutoDismiss();
    }
  },

  beforeUnmount() {
    this.clearAutoDismiss();
  },

  methods: {
    /**
     * Start auto-dismiss timer
     */
    startAutoDismiss() {
      if (this.duration > 0) {
        this.timeoutId = setTimeout(() => {
          this.handleClose();
        }, this.duration);
      }
    },

    /**
     * Clear auto-dismiss timer
     */
    clearAutoDismiss() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    },

    /**
     * Handle close button click
     */
    handleClose() {
      this.clearAutoDismiss();
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
/* Slide-in animation */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

[data-testid="notification-toast"] {
  animation: slideIn 0.3s ease-out;
}
</style>
