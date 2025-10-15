<template>
  <AppShell
    :title="currentTitle"
    :current-step="currentStep"
    :total-steps="totalSteps"
    :show-progress="showProgress"
  >
    <template #default>
      <section
        class="space-y-6"
        data-testid="app-shell-placeholder"
      >
        <div class="rounded-lg border border-secondary bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-accent">
            Widget scaffold ready
          </h2>
          <p class="mt-2 text-sm text-accent/70">
            This is temporary sample content so you can confirm the widget boots correctly inside Fliplet.
            Use the button below to cycle through example steps. Real views will be wired in as we progress through the task list.
          </p>
          <button
            type="button"
            class="mt-4 inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            @click="goToNextSampleStep"
          >
            Next sample step
          </button>
        </div>

        <div class="rounded-lg border border-secondary bg-white p-6 shadow-sm">
          <h3 class="text-base font-semibold text-accent">
            Sample workflow
          </h3>
          <p class="mt-2 text-sm text-accent/70">
            The cards below map to the plan requirements (states 1-4). Each click advances the highlighted card so you can verify the progress bar and theming behave as expected.
          </p>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <article
              v-for="(step, index) in stubSteps"
              :key="step.id"
              class="rounded-lg border border-secondary/70 p-4 transition"
              :class="index + 1 === currentStep ? 'border-primary bg-primary/5' : 'bg-white'"
            >
              <h4 class="text-sm font-semibold text-accent">
                Step {{ index + 1 }} · {{ step.label }}
              </h4>
              <p class="mt-1 text-sm text-accent/70">
                {{ step.description }}
              </p>
            </article>
          </div>
        </div>

        <ProgressIndicator
          v-if="stubSteps.length"
          :steps="stubSteps"
          :current-step="currentStep - 1"
        />
      </section>
    </template>

    <template #actions>
      <slot name="actions" />
    </template>
  </AppShell>
</template>

<script>
import AppShell from './components/layout/AppShell.vue';
import ProgressIndicator from './components/layout/ProgressIndicator.vue';

export default {
  name: 'Application',

  components: {
    AppShell,
    ProgressIndicator
  },

  data() {
    return {
      currentStep: 1,
      stubSteps: [
        {
          id: 'state-1',
          label: 'Merge dashboard',
          description: 'Review source app prerequisites and start configuring the merge.'
        },
        {
          id: 'state-2',
          label: 'Select destination',
          description: 'Choose a destination organisation and target app.'
        },
        {
          id: 'state-3',
          label: 'Configure merge',
          description: 'Pick screens, data sources, files, and settings to include.'
        },
        {
          id: 'state-4',
          label: 'Review summary',
          description: 'Confirm selections and resolve warnings before executing the merge.'
        }
      ]
    };
  },

  computed: {
    totalSteps() {
      return this.stubSteps.length || 1;
    },

    showProgress() {
      return this.stubSteps.length > 0;
    },

    currentTitle() {
      return this.stubSteps[this.currentStep - 1]?.label || 'App merge configuration';
    }
  },

  methods: {
    goToNextSampleStep() {
      if (!this.stubSteps.length) {
        return;
      }

      const next = this.currentStep + 1;

      this.currentStep = next > this.stubSteps.length ? 1 : next;
    }
  }
};
</script>
