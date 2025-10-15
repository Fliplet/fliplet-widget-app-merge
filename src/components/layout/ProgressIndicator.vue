<template>
  <div
    class="w-full"
    data-testid="progress-indicator"
  >
    <div class="flex items-center justify-between">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="flex flex-1 items-center"
      >
        <!-- Step indicator -->
        <div class="relative flex flex-col items-center">
          <!-- Circle with icon or number -->
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors"
            :class="getStepClasses(index)"
            :aria-current="index === currentStep ? 'step' : null"
          >
            <!-- Completed: Green checkmark -->
            <CheckCircle2
              v-if="step.completed"
              class="h-5 w-5 text-white"
              aria-hidden="true"
            />
            <!-- Current or Upcoming: Step number -->
            <span
              v-else
              class="text-sm font-semibold"
              :class="getStepTextClasses(index)"
            >
              {{ index + 1 }}
            </span>
          </div>

          <!-- Step label (hidden on mobile, visible on tablet+) -->
          <div
            class="mt-2 hidden text-xs font-medium md:block"
            :class="getStepLabelClasses(index)"
          >
            {{ step.label }}
          </div>
        </div>

        <!-- Connecting line (don't show after last step) -->
        <div
          v-if="index < steps.length - 1"
          class="mx-2 h-0.5 flex-1 transition-colors"
          :class="getConnectorClasses(index)"
          :aria-hidden="true"
        />
      </div>
    </div>

    <!-- Current step label on mobile only -->
    <div class="mt-4 text-center md:hidden">
      <p class="text-sm font-medium text-accent">
        {{ steps[currentStep]?.label }}
      </p>
    </div>
  </div>
</template>

<script>
import { CheckCircle2 } from 'lucide-vue-next';

export default {
  name: 'ProgressIndicator',

  components: {
    CheckCircle2
  },

  props: {
    /**
     * Array of step objects with label and completed status
     * @type {Array<{label: string, completed: boolean}>}
     */
    steps: {
      type: Array,
      required: true,
      validator: (steps) => {
        return steps.every(step =>
          typeof step.label === 'string' &&
          typeof step.completed === 'boolean'
        );
      }
    },

    /**
     * Current active step index (0-based)
     */
    currentStep: {
      type: Number,
      required: true,
      default: 0
    }
  },

  methods: {
    /**
     * Get Tailwind classes for step circle
     * Completed: green background with checkmark
     * Current: blue border, white background
     * Upcoming: gray border, white background
     */
    getStepClasses(index) {
      const step = this.steps[index];

      if (step.completed) {
        // Completed step: green background
        return 'border-success bg-success';
      } else if (index === this.currentStep) {
        // Current step: blue border
        return 'border-primary bg-white';
      } else {
        // Upcoming step: gray border
        return 'border-gray-300 bg-white';
      }
    },

    /**
     * Get text color classes for step number
     */
    getStepTextClasses(index) {
      if (index === this.currentStep) {
        return 'text-primary';
      } else {
        return 'text-gray-400';
      }
    },

    /**
     * Get label color classes
     */
    getStepLabelClasses(index) {
      const step = this.steps[index];

      if (step.completed) {
        return 'text-success';
      } else if (index === this.currentStep) {
        return 'text-primary';
      } else {
        return 'text-gray-400';
      }
    },

    /**
     * Get connector line classes
     * Green if previous step is completed, gray otherwise
     */
    getConnectorClasses(index) {
      const step = this.steps[index];

      if (step.completed) {
        return 'bg-success';
      } else {
        return 'bg-gray-300';
      }
    }
  }
};
</script>
