<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        data-testid="modal-backdrop"
        @click.self="handleBackdropClick"
        @keydown.esc="handleEscapeKey"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />

        <!-- Modal -->
        <div
          ref="modalContent"
          class="relative z-10 w-full max-w-md rounded-lg bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          data-testid="modal-dialog"
        >
          <!-- Header -->
          <div class="flex items-start justify-between border-b border-gray-200 p-4">
            <h2
              :id="titleId"
              class="text-lg font-semibold text-gray-900"
            >
              {{ title }}
            </h2>
            <button
              type="button"
              class="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close dialog"
              data-testid="modal-close-button"
              @click="handleClose"
            >
              <X
                class="h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </div>

          <!-- Content -->
          <div class="p-4">
            <slot />
          </div>

          <!-- Footer with actions -->
          <div
            v-if="variant !== 'custom'"
            class="flex justify-end gap-3 border-t border-gray-200 p-4"
            data-testid="modal-footer"
          >
            <button
              v-if="variant === 'confirm' && cancelText"
              type="button"
              class="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              data-testid="modal-cancel-button"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              v-if="confirmText"
              type="button"
              class="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
              :class="confirmButtonClasses"
              data-testid="modal-confirm-button"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>

          <!-- Custom footer slot -->
          <div
            v-if="variant === 'custom' && $slots.footer"
            class="border-t border-gray-200 p-4"
            data-testid="modal-custom-footer"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { X } from 'lucide-vue-next';

export default {
  name: 'ModalDialog',

  components: {
    X
  },

  props: {
    /**
     * Show/hide modal
     */
    show: {
      type: Boolean,
      default: false
    },

    /**
     * Modal title
     */
    title: {
      type: String,
      required: true
    },

    /**
     * Confirm button text
     */
    confirmText: {
      type: String,
      default: 'OK'
    },

    /**
     * Cancel button text (only for 'confirm' variant)
     */
    cancelText: {
      type: String,
      default: 'Cancel'
    },

    /**
     * Modal variant
     * @type {'confirm'|'alert'|'custom'}
     */
    variant: {
      type: String,
      default: 'confirm',
      validator: (value) => {
        return ['confirm', 'alert', 'custom'].includes(value);
      }
    },

    /**
     * Close on backdrop click
     */
    closeOnBackdrop: {
      type: Boolean,
      default: true
    },

    /**
     * Close on ESC key
     */
    closeOnEsc: {
      type: Boolean,
      default: true
    }
  },

  emits: ['confirm', 'cancel', 'close'],

  data() {
    return {
      previouslyFocusedElement: null
    };
  },

  computed: {
    titleId() {
      return 'modal-title-' + this._.uid;
    },

    confirmButtonClasses() {
      return this.variant === 'alert' ? 'bg-error hover:bg-error/90' : '';
    }
  },

  watch: {
    show(isVisible) {
      if (isVisible) {
        this.$nextTick(() => {
          this.trapFocus();
        });
      } else {
        this.restoreFocus();
      }
    }
  },

  mounted() {
    if (this.show) {
      this.$nextTick(() => {
        this.trapFocus();
      });
    }
  },

  beforeUnmount() {
    this.restoreFocus();
  },

  methods: {
    /**
     * Handle confirm button click
     */
    handleConfirm() {
      this.$emit('confirm');
      this.$emit('close');
    },

    /**
     * Handle cancel button click
     */
    handleCancel() {
      this.$emit('cancel');
      this.$emit('close');
    },

    /**
     * Handle close button click
     */
    handleClose() {
      this.$emit('close');
    },

    /**
     * Handle backdrop click
     */
    handleBackdropClick() {
      if (this.closeOnBackdrop) {
        this.handleClose();
      }
    },

    /**
     * Handle ESC key press
     */
    handleEscapeKey() {
      if (this.closeOnEsc) {
        this.handleClose();
      }
    },

    /**
     * Trap focus within modal
     */
    trapFocus() {
      this.previouslyFocusedElement = document.activeElement;

      if (this.$refs.modalContent) {
        const focusableElements = this.$refs.modalContent.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    },

    /**
     * Restore focus to previously focused element
     */
    restoreFocus() {
      if (this.previouslyFocusedElement && this.previouslyFocusedElement.focus) {
        this.previouslyFocusedElement.focus();
      }
    }
  }
};
</script>

<style scoped>
/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active [data-testid="modal-dialog"],
.modal-leave-active [data-testid="modal-dialog"] {
  transition: transform 0.3s ease;
}

.modal-enter-from [data-testid="modal-dialog"],
.modal-leave-to [data-testid="modal-dialog"] {
  transform: scale(0.95);
}
</style>
