<template>
  <div
    class="flex items-start gap-3 rounded-lg border-l-4 p-4"
    :class="bannerClasses"
    role="alert"
    :data-testid="`warning-banner-${type}`"
  >
    <component
      :is="iconComponent"
      class="h-5 w-5 flex-shrink-0"
      :class="iconClasses"
      aria-hidden="true"
    />

    <div class="flex-1">
      <p
        class="text-sm"
        :class="textClasses"
      >
        {{ message }}
      </p>

      <button
        v-if="actionLabel"
        type="button"
        class="mt-2 text-sm font-medium underline transition hover:no-underline"
        :class="actionClasses"
        data-testid="banner-action-button"
        @click="handleAction"
      >
        {{ actionLabel }}
      </button>
    </div>

    <button
      v-if="dismissable"
      type="button"
      class="rounded p-1 transition hover:bg-black/5"
      :class="dismissButtonClasses"
      aria-label="Dismiss banner"
      data-testid="banner-dismiss-button"
      @click="handleDismiss"
    >
      <X
        class="h-4 w-4"
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<script>
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X
} from 'lucide-vue-next';

export default {
  name: 'WarningBanner',

  components: {
    AlertTriangle,
    AlertCircle,
    Info,
    X
  },

  props: {
    /**
     * Banner type
     * @type {'info'|'warning'|'error'}
     */
    type: {
      type: String,
      required: true,
      validator: (value) => {
        return ['info', 'warning', 'error'].includes(value);
      }
    },

    /**
     * Banner message text
     */
    message: {
      type: String,
      required: true
    },

    /**
     * Allow banner to be dismissed
     */
    dismissable: {
      type: Boolean,
      default: false
    },

    /**
     * Optional action button label
     */
    actionLabel: {
      type: String,
      default: null
    }
  },

  emits: ['dismiss', 'action'],

  computed: {
    /**
     * Get icon component based on type
     */
    iconComponent() {
      const icons = {
        'info': 'Info',
        'warning': 'AlertTriangle',
        'error': 'AlertCircle'
      };
      return icons[this.type];
    },

    /**
     * Get banner container classes
     */
    bannerClasses() {
      const classes = {
        'info': 'border-primary bg-primary/10',
        'warning': 'border-warning bg-warning/10',
        'error': 'border-error bg-error/10'
      };
      return classes[this.type];
    },

    /**
     * Get icon classes
     */
    iconClasses() {
      const classes = {
        'info': 'text-primary',
        'warning': 'text-warning',
        'error': 'text-error'
      };
      return classes[this.type];
    },

    /**
     * Get text classes
     */
    textClasses() {
      const classes = {
        'info': 'text-primary',
        'warning': 'text-warning',
        'error': 'text-error'
      };
      return classes[this.type];
    },

    /**
     * Get action button classes
     */
    actionClasses() {
      const classes = {
        'info': 'text-primary hover:text-primary/80',
        'warning': 'text-warning hover:text-warning/80',
        'error': 'text-error hover:text-error/80'
      };
      return classes[this.type];
    },

    /**
     * Get dismiss button classes
     */
    dismissButtonClasses() {
      const classes = {
        'info': 'text-primary',
        'warning': 'text-warning',
        'error': 'text-error'
      };
      return classes[this.type];
    }
  },

  methods: {
    /**
     * Handle dismiss button click
     */
    handleDismiss() {
      this.$emit('dismiss');
    },

    /**
     * Handle action button click
     */
    handleAction() {
      this.$emit('action');
    }
  }
};
</script>
