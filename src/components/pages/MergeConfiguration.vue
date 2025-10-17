<template>
  <div class="space-y-6">
    <WarningBanner
      type="info"
      message="Some components such as SAML2 authentication or certain integrations cannot be copied during a merge."
      :dismissable="false"
    >
      <template #actions>
        <button
          type="button"
          class="text-sm font-medium text-primary hover:text-primary/80"
          @click="handleNonCopyablesHelp"
        >
          Learn more
        </button>
      </template>
    </WarningBanner>

    <!-- App Direction Indicator -->
    <div class="rounded-lg border border-secondary/50 bg-secondary/10 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="text-center">
            <p class="text-sm font-medium text-accent">
              {{ sourceAppName }}
            </p>
            <p class="text-xs text-accent/60">
              Source
            </p>
          </div>
          <ArrowRight
            class="h-5 w-5 text-primary"
            aria-hidden="true"
          />
          <div class="text-center">
            <p class="text-sm font-medium text-accent">
              {{ destinationAppName }}
            </p>
            <p class="text-xs text-accent/60">
              Destination
            </p>
          </div>
        </div>
        <div
          v-if="lockedUntil"
          class="flex items-center gap-2 text-sm text-warning"
        >
          <Lock
            class="h-4 w-4"
            aria-hidden="true"
          />
          <span>Apps locked</span>
        </div>
      </div>
    </div>

    <!-- Lock Countdown Warning -->
    <LockCountdown
      v-if="lockedUntil"
      :locked-until="lockedUntil"
      @extend-lock="handleExtendLock"
      @lock-expired="handleLockExpired"
    />

    <!-- Tab Navigation -->
    <div
      class="border-b border-secondary"
      role="tablist"
      aria-label="Configuration tabs"
    >
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :aria-selected="currentTab === tab.id"
          :aria-controls="`${tab.id}-panel`"
          :class="[
            'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
            currentTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-accent/70 hover:border-accent/30 hover:text-accent'
          ]"
          role="tab"
          @click="switchTab(tab.id)"
        >
          {{ tab.label }}
          <span
            v-if="getSelectionCount(tab.id) > 0"
            :class="[
              'ml-2 rounded-full px-2 py-0.5 text-xs',
              currentTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'bg-secondary text-accent/70'
            ]"
          >
            {{ getSelectionCount(tab.id) }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div
      :id="`${currentTab}-panel`"
      role="tabpanel"
      :aria-labelledby="`${currentTab}-tab`"
      class="py-4"
    >
      <component
        :is="currentTabComponent"
        :source-app-id="sourceAppId"
        :destination-app-id="destinationAppId"
        :selection="selections[currentTab]"
        :selected-screens="selections.screens"
        :selected-data-sources="selections['data-sources']"
        :selected-files="selections.files"
        @selection-change="handleSelectionChange"
        @copy-mode-change="handleCopyModeChange"
        @folder-option-change="handleFolderOptionChange"
        @toggle:screen="handleAssociationToggle('screens', $event)"
        @toggle:data-source="handleAssociationToggle('data-sources', $event)"
        @toggle:file="handleAssociationToggle('files', $event)"
      />
    </div>

    <!-- Selected Items Counter -->
    <div
      v-if="totalSelectedItems > 0"
      class="rounded-lg border border-primary/30 bg-primary/5 p-4"
    >
      <p class="text-sm text-accent">
        <span class="font-semibold">{{ totalSelectedItems }}</span> item{{ totalSelectedItems === 1 ? '' : 's' }} selected for merge
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between gap-3 border-t border-secondary/50 pt-6">
      <button
        type="button"
        class="rounded-lg border border-secondary px-6 py-2 text-sm font-medium text-accent transition-colors hover:bg-secondary/20"
        @click="handleBack"
      >
        Back
      </button>
      <div class="flex gap-3">
        <button
          type="button"
          class="rounded-lg border border-secondary px-6 py-2 text-sm font-medium text-accent transition-colors hover:bg-secondary/20"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="totalSelectedItems === 0"
          :class="[
            'rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors',
            totalSelectedItems > 0
              ? 'bg-primary hover:bg-primary/90'
              : 'cursor-not-allowed bg-secondary/50 text-accent/40'
          ]"
          @click="handleReview"
        >
          Review merge
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowRight, Lock } from 'lucide-vue-next';
import LockCountdown from '../ui/LockCountdown.vue';
import ScreensTab from '../tabs/ScreensTab.vue';
import DataSourcesTab from '../tabs/DataSourcesTab.vue';
import FilesTab from '../tabs/FilesTab.vue';
import SettingsTab from '../tabs/SettingsTab.vue';
import WarningBanner from '../feedback/WarningBanner.vue';

export default {
  name: 'MergeConfiguration',

  components: {
    ArrowRight,
    Lock,
    LockCountdown,
    WarningBanner,
    ScreensTab,
    DataSourcesTab,
    FilesTab,
    SettingsTab
  },

  props: {
    sourceAppId: {
      type: Number,
      required: true
    },
    sourceAppName: {
      type: String,
      required: true
    },
    destinationAppId: {
      type: Number,
      required: true
    },
    destinationAppName: {
      type: String,
      required: true
    },
    lockedUntil: {
      type: Number,
      default: null
    },
    initialSelections: {
      type: Object,
      default: () => ({
        screens: [],
        'data-sources': [],
        files: [],
        settings: []
      })
    }
  },

  emits: ['review', 'back', 'cancel', 'extend-lock', 'lock-expired', 'copy-mode-change', 'folder-option-change'],

  data() {
    return {
      currentTab: 'screens',
      tabs: [
        { id: 'screens', label: 'Screens' },
        { id: 'data-sources', label: 'Data sources' },
        { id: 'files', label: 'Files' },
        { id: 'settings', label: 'Settings' }
      ],
      selections: {
        screens: [...this.initialSelections.screens],
        'data-sources': [...this.initialSelections['data-sources']],
        files: [...this.initialSelections.files],
        settings: [...this.initialSelections.settings]
      }
    };
  },

  computed: {
    currentTabComponent() {
      const componentMap = {
        screens: 'ScreensTab',
        'data-sources': 'DataSourcesTab',
        files: 'FilesTab',
        settings: 'SettingsTab'
      };

      return componentMap[this.currentTab];
    },

    totalSelectedItems() {
      return Object.values(this.selections).reduce((total, selection) => {
        if (Array.isArray(selection)) {
          return total + selection.length;
        }

        return total;
      }, 0);
    }
  },

  methods: {
    switchTab(tabId) {
      this.currentTab = tabId;
    },

    getSelectionCount(tabId) {
      const selection = this.selections[tabId];

      if (Array.isArray(selection)) {
        return selection.length;
      }

      return 0;
    },

    handleSelectionChange(selection) {
      this.selections[this.currentTab] = Array.isArray(selection)
        ? [...selection]
        : selection;
    },

    handleCopyModeChange(payload) {
      // Handle copy mode changes for data sources
      // This will be used to track which data sources should copy structure only vs full data
      this.$emit('copy-mode-change', payload);
    },

    handleFolderOptionChange(payload) {
      // Handle folder option changes for files
      // This will be used to track which folders should copy folder only vs folder + files
      this.$emit('folder-option-change', payload);
    },

    handleAssociationToggle(collection, { id, selected }) {
      if (!Array.isArray(this.selections[collection])) {
        this.selections[collection] = [];
      }

      const set = new Set(this.selections[collection]);

      if (selected) {
        set.add(id);
      } else {
        set.delete(id);
      }

      this.selections[collection] = [...set];
    },

    handleExtendLock() {
      this.$emit('extend-lock');
    },

    handleLockExpired() {
      // Lock expired - user should be notified and potentially returned to dashboard
      this.$emit('lock-expired');
    },

    handleBack() {
      this.$emit('back');
    },

    handleCancel() {
      this.$emit('cancel');
    },

    handleReview() {
      if (this.totalSelectedItems > 0) {
        this.$emit('review', {
          selections: this.selections
        });
      }
    },

    handleNonCopyablesHelp() {
      if (window.Fliplet && window.Fliplet.Navigate && typeof window.Fliplet.Navigate.url === 'function') {
        window.Fliplet.Navigate.url('https://help.fliplet.com/article/non-copyable-components');
      }
    }
  }
};
</script>
