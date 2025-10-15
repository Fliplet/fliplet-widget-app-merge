<template>
  <div
    class="flex min-h-screen flex-col bg-white text-gray-900"
    role="main"
    :aria-labelledby="headingId"
    data-testid="app-shell-container"
  >
    <header class="border-b border-secondary/60 bg-secondary/20">
      <div class="mx-auto flex w-full max-w-container items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="rounded bg-primary/10 p-2">
            <Layers
              class="h-6 w-6 text-primary"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1
              :id="headingId"
              data-testid="app-shell-heading"
              class="text-xl font-semibold text-accent"
            >
              {{ title }}
            </h1>
            <p
              v-if="showProgress"
              class="text-sm text-accent/70"
            >
              Step {{ currentStep }} of {{ totalSteps }}
            </p>
          </div>
        </div>
      </div>
      <div
        v-if="showProgress"
        class="h-1 bg-secondary"
      >
          <div
            class="h-1 bg-primary transition-all duration-300"
            :style="{ width: progressWidth }"
          />
      </div>
    </header>

    <main class="flex-1 bg-secondary/10 px-6 py-8">
      <div class="mx-auto w-full max-w-container">
        <slot />
      </div>
    </main>

    <footer
      v-if="$slots.actions"
      class="border-t border-secondary/50 bg-white px-6 py-4"
    >
      <div class="mx-auto flex w-full max-w-container justify-end gap-3">
        <slot name="actions" />
      </div>
    </footer>
  </div>
</template>

<script>
const Layers = {
  name: 'LayersIcon',
  template: '<svg />'
};

export default {
  name: 'AppShell',

  components: {
    Layers
  },

  props: {
    title: {
      type: String,
      default: 'App merge configuration'
    },
    currentStep: {
      type: Number,
      default: 0
    },
    totalSteps: {
      type: Number,
      default: 3
    },
    showProgress: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    headingId() {
      return 'app-shell-heading';
    },

    progressWidth() {
      if (!this.showProgress || this.totalSteps < 1) {
        return '0%';
      }

      const width = Math.min((this.currentStep / this.totalSteps) * 100, 100);

      return `${width}%`;
    }
  }
};
</script>

<style scoped lang="scss">
.max-w-5xl {
  max-width: 1200px;
}
</style>

