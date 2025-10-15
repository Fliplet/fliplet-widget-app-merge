<template>
  <div class="space-y-4">
    <!-- Instructions -->
    <div class="rounded-lg bg-info/5 p-4">
      <p class="text-sm text-accent/80">
        Select app-level configurations to copy to the destination app. These settings will overwrite the corresponding settings in the destination app.
      </p>
    </div>

    <!-- Settings Checkboxes -->
    <div class="space-y-3">
      <!-- App Settings -->
      <label class="flex items-start gap-3 rounded-lg border border-secondary/50 bg-white p-4 transition-colors hover:bg-secondary/10">
        <input
          v-model="selectedSettings.appSettings"
          type="checkbox"
          class="mt-1 rounded border-secondary/60 text-primary focus:ring-primary"
          @change="handleSelectionChange"
        >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <Settings
              class="h-5 w-5 text-accent/60"
              aria-hidden="true"
            />
            <h3 class="font-medium text-accent">App settings</h3>
          </div>
          <p class="mt-1 text-sm text-accent/70">
            Copy app name, description, icon, splash screens, and other app-level settings.
          </p>
          <a
            href="#"
            class="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            @click.prevent="showSettingsDetails"
          >
            View all app settings
            <ExternalLink
              class="h-3 w-3"
              aria-hidden="true"
            />
          </a>
        </div>
      </label>

      <!-- Menu Settings -->
      <label class="flex items-start gap-3 rounded-lg border border-secondary/50 bg-white p-4 transition-colors hover:bg-secondary/10">
        <input
          v-model="selectedSettings.menuSettings"
          type="checkbox"
          class="mt-1 rounded border-secondary/60 text-primary focus:ring-primary"
          @change="handleSelectionChange"
        >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <MenuIcon
              class="h-5 w-5 text-accent/60"
              aria-hidden="true"
            />
            <h3 class="font-medium text-accent">Menu settings</h3>
          </div>
          <p class="mt-1 text-sm text-accent/70">
            Copy menu structure, items, icons, and visibility settings.
          </p>
        </div>
      </label>

      <!-- Global Appearance Settings -->
      <label class="flex items-start gap-3 rounded-lg border border-secondary/50 bg-white p-4 transition-colors hover:bg-secondary/10">
        <input
          v-model="selectedSettings.appearanceSettings"
          type="checkbox"
          class="mt-1 rounded border-secondary/60 text-primary focus:ring-primary"
          @change="handleSelectionChange"
        >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <Palette
              class="h-5 w-5 text-accent/60"
              aria-hidden="true"
            />
            <h3 class="font-medium text-accent">Global appearance settings</h3>
          </div>
          <p class="mt-1 text-sm text-accent/70">
            Copy theme colors, fonts, and global styling preferences.
          </p>
        </div>
      </label>

      <!-- Global Code Customizations -->
      <label class="flex items-start gap-3 rounded-lg border border-secondary/50 bg-white p-4 transition-colors hover:bg-secondary/10">
        <input
          v-model="selectedSettings.codeCustomizations"
          type="checkbox"
          class="mt-1 rounded border-secondary/60 text-primary focus:ring-primary"
          @change="handleSelectionChange"
        >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <CodeIcon
              class="h-5 w-5 text-accent/60"
              aria-hidden="true"
            />
            <h3 class="font-medium text-accent">Global code customizations</h3>
          </div>
          <p class="mt-1 text-sm text-accent/70">
            Copy custom JavaScript, CSS, and HTML code applied globally to the app.
          </p>
          <div
            v-if="hasVersionMismatch"
            class="mt-2 flex items-start gap-2 text-sm text-warning"
          >
            <AlertTriangle
              class="mt-0.5 h-4 w-4 flex-shrink-0"
              aria-hidden="true"
            />
            <span>Source and destination apps use different framework versions. Code may require adjustments.</span>
          </div>
        </div>
      </label>
    </div>

    <!-- Warning Banner for Code Overwrite -->
    <WarningBanner
      v-if="selectedSettings.codeCustomizations"
      type="warning"
      message="Warning: Global code customizations will completely overwrite existing code in the destination app. This cannot be undone."
      :dismissable="false"
    />

    <!-- Selection Summary -->
    <div
      v-if="selectionCount > 0"
      class="rounded-lg border border-primary/30 bg-primary/5 p-4"
    >
      <p class="text-sm text-accent">
        <span class="font-semibold">{{ selectionCount }}</span> app-level {{ selectionCount === 1 ? 'setting' : 'settings' }} selected
      </p>
    </div>
  </div>
</template>

<script>
import {
  Settings,
  Menu as MenuIcon,
  Palette,
  Code as CodeIcon,
  AlertTriangle,
  ExternalLink
} from 'lucide-vue-next';
import WarningBanner from '../feedback/WarningBanner.vue';

export default {
  name: 'SettingsTab',

  components: {
    Settings,
    MenuIcon,
    Palette,
    CodeIcon,
    AlertTriangle,
    ExternalLink,
    WarningBanner
  },

  props: {
    sourceAppId: {
      type: Number,
      required: true
    },
    destinationAppId: {
      type: Number,
      required: true
    },
    selection: {
      type: Array,
      default: () => []
    }
  },

  emits: ['selection-change'],

  data() {
    return {
      selectedSettings: {
        appSettings: false,
        menuSettings: false,
        appearanceSettings: false,
        codeCustomizations: false
      },
      hasVersionMismatch: false
    };
  },

  computed: {
    selectionCount() {
      return Object.values(this.selectedSettings).filter(Boolean).length;
    },

    selectionArray() {
      const selected = [];

      if (this.selectedSettings.appSettings) selected.push('appSettings');
      if (this.selectedSettings.menuSettings) selected.push('menuSettings');
      if (this.selectedSettings.appearanceSettings) selected.push('appearanceSettings');
      if (this.selectedSettings.codeCustomizations) selected.push('codeCustomizations');

      return selected;
    }
  },

  watch: {
    selection: {
      immediate: true,
      handler(newSelection) {
        if (Array.isArray(newSelection)) {
          // Reset all
          this.selectedSettings.appSettings = false;
          this.selectedSettings.menuSettings = false;
          this.selectedSettings.appearanceSettings = false;
          this.selectedSettings.codeCustomizations = false;

          // Set selected ones
          newSelection.forEach(key => {
            if (this.selectedSettings.hasOwnProperty(key)) {
              this.selectedSettings[key] = true;
            }
          });
        }
      }
    }
  },

  async mounted() {
    await this.checkVersionMismatch();
  },

  methods: {
    async checkVersionMismatch() {
      // TODO: Replace with actual middleware integration
      // Check if source and destination apps have different framework versions
      // const sourceVersion = await window.FlipletAppMerge.middleware.api.apps.getFrameworkVersion(this.sourceAppId);
      // const destVersion = await window.FlipletAppMerge.middleware.api.apps.getFrameworkVersion(this.destinationAppId);
      // this.hasVersionMismatch = sourceVersion !== destVersion;

      // Mock for now
      this.hasVersionMismatch = false;
    },

    handleSelectionChange() {
      this.$emit('selection-change', this.selectionArray);
    },

    showSettingsDetails() {
      // TODO: Show modal or expand section with detailed list of app settings
      alert('App settings include: name, description, icon, splash screens, orientation settings, authentication settings, and more.');
    }
  }
};
</script>
