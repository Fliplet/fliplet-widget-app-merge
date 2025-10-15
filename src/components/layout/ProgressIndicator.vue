<template>
  <div
    class="rounded-lg border border-secondary bg-white p-6 shadow-sm"
    data-testid="progress-indicator"
  >
    <h3 class="text-base font-semibold text-accent">
      Progress
    </h3>

    <div class="mt-4">
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex flex-1 items-center"
        >
          <!-- Step circle -->
          <div class="relative flex flex-col items-center">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition"
              :class="getStepCircleClasses(index)"
            >
              <span
                class="text-sm font-semibold"
                :class="getStepTextClasses(index)"
              >
                {{ index + 1 }}
              </span>
            </div>
            <div class="mt-2 hidden text-xs text-accent/70 md:block">
              {{ step.label }}
            </div>
          </div>

          <!-- Connector line (don't show after last step) -->
          <div
            v-if="index < steps.length - 1"
            class="h-0.5 flex-1 transition"
            :class="index < currentStep ? 'bg-primary' : 'bg-secondary'"
          />
        </div>
      </div>

      <!-- Mobile step label -->
      <div class="mt-4 text-center md:hidden">
        <p class="text-sm font-medium text-accent">
          {{ steps[currentStep]?.label }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressIndicator',

  props: {
    steps: {
      type: Array,
      required: true,
      validator: (steps) => {
        return steps.every(step => step.id && step.label);
      }
    },
    currentStep: {
      type: Number,
      required: true,
      default: 0
    }
  },

  methods: {
    getStepCircleClasses(index) {
      if (index < this.currentStep) {
        return 'border-primary bg-primary';
      } else if (index === this.currentStep) {
        return 'border-primary bg-white';
      } else {
        return 'border-secondary bg-white';
      }
    },

    getStepTextClasses(index) {
      if (index < this.currentStep) {
        return 'text-white';
      } else if (index === this.currentStep) {
        return 'text-primary';
      } else {
        return 'text-accent/50';
      }
    }
  }
};
</script>
