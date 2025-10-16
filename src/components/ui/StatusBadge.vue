<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    :class="badgeClasses"
    :data-testid="`status-badge-${status}`"
  >
    <component
      :is="iconComponent"
      v-if="iconComponent"
      class="h-3.5 w-3.5"
      aria-hidden="true"
    />
    <span>{{ displayLabel }}</span>
  </span>
</template>

<script>
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  RefreshCw
} from 'lucide-vue-next';

export default {
  name: 'StatusBadge',

  components: {
    CheckCircle2,
    AlertCircle,
    Clock,
    Copy,
    RefreshCw
  },

  props: {
    /**
     * Status type
     * @type {'copy'|'overwrite'|'success'|'error'|'in-progress'}
     */
    status: {
      type: String,
      required: true,
      validator: (value) => {
        return ['copy', 'overwrite', 'success', 'error', 'in-progress'].includes(value);
      }
    },

    /**
     * Custom label text (optional)
     */
    label: {
      type: String,
      default: null
    }
  },

  computed: {
    /**
     * Get Tailwind classes based on status
     */
    badgeClasses() {
      const classes = {
        'copy': 'bg-success/10 text-success border border-success/20',
        'overwrite': 'bg-warning/10 text-warning border border-warning/20',
        'success': 'bg-success/10 text-success border border-success/20',
        'error': 'bg-error/10 text-error border border-error/20',
        'in-progress': 'bg-primary/10 text-primary border border-primary/20'
      };

      return classes[this.status] || '';
    },

    /**
     * Get icon component based on status
     */
    iconComponent() {
      const icons = {
        'copy': 'Copy',
        'overwrite': 'RefreshCw',
        'success': 'CheckCircle2',
        'error': 'AlertCircle',
        'in-progress': 'Clock'
      };

      return icons[this.status] || null;
    },

    /**
     * Get display label (custom or default)
     */
    displayLabel() {
      if (this.label) {
        return this.label;
      }

      const defaultLabels = {
        copy: 'Copy',
        overwrite: 'Overwrite',
        success: 'Success',
        error: 'Error',
        'in-progress': 'In Progress'
      };

      return defaultLabels[this.status] || this.status;
    }
  }
};
</script>
