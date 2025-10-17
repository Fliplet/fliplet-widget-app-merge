<template>
  <AppShell
    :title="currentPageTitle"
    :current-step="currentStep"
    :total-steps="totalSteps"
    :show-progress="showProgress"
  >
    <template #default>
      <!-- Dashboard view -->
      <MergeDashboard
        v-if="currentView === 'dashboard'"
        @configure-merge="goToDestinationSelector"
        @view-audit-log="handleViewAuditLog"
        @cancel="handleCancel"
      />

      <!-- Destination Selector view -->
      <DestinationSelector
        v-if="currentView === 'destination-selector'"
        @app-selected="handleDestinationSelected"
        @back="goToDashboard"
        @cancel="handleCancel"
      />

      <!-- Merge configuration view -->
      <MergeConfiguration
        v-if="currentView === 'configuration' && selectedDestinationApp"
        :source-app-id="sourceApp.id"
        :source-app-name="sourceApp.name"
        :destination-app-id="selectedDestinationApp.id"
        :destination-app-name="selectedDestinationApp.name"
        @review="handleReview"
        @back="goToDestinationSelector"
        @cancel="handleCancel"
        @extend-lock="handleExtendLock"
      />

      <!-- Merge Review view -->
      <MergeReview
        v-if="currentView === 'review'"
        @start-merge="handleStartMerge"
        @edit-settings="goToConfiguration"
        @cancel="handleCancel"
      />

      <!-- Merge Progress view -->
      <MergeProgress
        v-if="currentView === 'progress'"
        :source-app-id="sourceApp.id"
        :merge-id="mergeId"
        @merge-complete="handleMergeComplete"
        @merge-error="handleMergeError"
      />

      <!-- Merge Complete view -->
      <MergeComplete
        v-if="currentView === 'complete'"
        @open-app="handleOpenApp"
        @view-audit-log="handleViewAuditLog"
      />
    </template>

    <template #actions>
      <slot name="actions" />
    </template>
  </AppShell>
</template>

<script>
import AppShell from './components/layout/AppShell.vue';
import MergeDashboard from './components/pages/MergeDashboard.vue';
import DestinationSelector from './components/pages/DestinationSelector.vue';
import MergeConfiguration from './components/pages/MergeConfiguration.vue';
import MergeReview from './components/pages/MergeReview.vue';
import MergeProgress from './components/pages/MergeProgress.vue';
import MergeComplete from './components/pages/MergeComplete.vue';

export default {
  name: 'Application',

  components: {
    AppShell,
    MergeDashboard,
    DestinationSelector,
    MergeConfiguration,
    MergeReview,
    MergeProgress,
    MergeComplete
  },

  data() {
    return {
      currentView: 'dashboard',
      currentStep: 0,
      totalSteps: 5,
      selectedDestinationApp: null,
      sourceApp: {
        id: 123,
        name: 'Source App'
      },
      mergeConfiguration: {
        screens: [],
        dataSources: [],
        files: [],
        configurations: []
      },
      isAppsLocked: false,
      globalError: null,
      mergeId: null
    };
  },

  computed: {
    showProgress() {
      return ['destination-selector', 'configuration', 'review', 'progress'].includes(this.currentView);
    },

    currentPageTitle() {
      const titles = {
        'dashboard': 'Merge Dashboard',
        'destination-selector': 'Select Destination App',
        'configuration': 'Configure Merge Settings',
        'review': 'Review Merge Summary',
        'progress': 'Merge in Progress',
        'complete': 'Merge Complete'
      };
      return titles[this.currentView] || 'App Merge';
    }
  },

  created() {
    // Initialize middleware when component is created
    this.initializeMiddleware();
  },

  beforeUnmount() {
    // Clean up: unlock apps if they are locked
    if (this.isAppsLocked) {
      this.unlockApps();
    }
  },

  errorCaptured(err, instance, info) {
    // Global error handler for child components
    console.error('Error captured in Application:', err);
    console.error('Error info:', info);

    this.handleGlobalError(err);

    // Return false to prevent error from propagating further
    return false;
  },

  methods: {
    /**
     * Initialize middleware
     */
    initializeMiddleware() {
      // TODO: Initialize middleware when ready
      // if (window.FlipletAppMerge && window.FlipletAppMerge.middleware) {
      //   console.log('Middleware initialized');
      // }
    },

    /**
     * Navigate to dashboard
     */
    goToDashboard() {
      this.currentView = 'dashboard';
      this.currentStep = 0;
      this.clearState();
    },

    /**
     * Navigate to destination selector
     */
    goToDestinationSelector() {
      this.currentView = 'destination-selector';
      this.currentStep = 1;
    },

    /**
     * Navigate to configuration
     */
    goToConfiguration() {
      this.currentView = 'configuration';
      this.currentStep = 2;
    },

    /**
     * Navigate to review
     */
    goToReview() {
      this.currentView = 'review';
      this.currentStep = 3;
    },

    /**
     * Navigate to progress
     */
    goToProgress() {
      this.currentView = 'progress';
      this.currentStep = 4;
    },

    /**
     * Navigate to complete
     */
    goToComplete() {
      this.currentView = 'complete';
      this.currentStep = 5;
    },

    /**
     * Handle destination app selection
     */
    async handleDestinationSelected(app) {
      this.selectedDestinationApp = app;

      // Lock both apps before proceeding
      await this.lockApps();

      this.currentView = 'configuration';
      this.currentStep = 2;
    },

    /**
     * Handle review navigation with selections
     */
    handleReview(selections) {
      // Save merge configuration
      this.mergeConfiguration = selections;

      // Navigate to review
      this.goToReview();
    },

    /**
     * Handle start merge
     */
    async handleStartMerge() {
      // Generate a unique merge ID
      this.mergeId = `merge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Navigate to progress view
      this.goToProgress();

      // TODO: Trigger merge via middleware
      // await window.FlipletAppMerge.middleware.controllers.mergeExecution.startMerge({
      //   sourceAppId: this.sourceApp.id,
      //   targetAppId: this.selectedDestinationApp.id,
      //   configuration: this.mergeConfiguration
      // });
    },

    /**
     * Handle merge completion
     */
    handleMergeComplete() {
      // Unlock apps
      this.unlockApps();

      // Navigate to complete view
      this.goToComplete();
    },

    /**
     * Handle merge error
     */
    handleMergeError(error) {
      console.error('Merge error:', error);

      // Unlock apps
      this.unlockApps();

      // TODO: Show error notification
      // For now, go back to dashboard
      this.goToDashboard();
    },

    /**
     * Handle lock extension
     */
    async handleExtendLock() {
      try {
        // TODO: Integrate with middleware to extend lock
        // await window.FlipletAppMerge.middleware.controllers.appLock.extendLock({
        //   sourceAppId: this.sourceApp.id,
        //   targetAppId: this.selectedDestinationApp.id
        // });

        console.log('Lock extended');
      } catch (error) {
        console.error('Failed to extend lock:', error);
      }
    },

    /**
     * Handle open destination app
     */
    handleOpenApp() {
      if (this.selectedDestinationApp) {
        // TODO: Open app in Studio
        // window.Fliplet.Studio.emit('navigate', {
        //   appId: this.selectedDestinationApp.id
        // });

        console.log('Opening app:', this.selectedDestinationApp.id);
      }
    },

    /**
     * Handle view audit log
     */
    handleViewAuditLog() {
      // TODO: Open audit log in new window or tab
      // const auditLogUrl = `https://studio.fliplet.com/apps/${this.sourceApp.id}/audit-log`;
      // window.open(auditLogUrl, '_blank');

      console.log('View audit log');
    },

    /**
     * Handle cancel
     */
    async handleCancel() {
      // Unlock apps if locked
      if (this.isAppsLocked) {
        await this.unlockApps();
      }

      // Clear state
      this.clearState();

      // TODO: Close overlay via Studio API
      // window.Fliplet.Studio.emit('overlay-close');

      console.log('Cancel merge');
    },

    /**
     * Lock both source and destination apps
     */
    async lockApps() {
      try {
        // TODO: Integrate with middleware to lock apps
        // await window.FlipletAppMerge.middleware.controllers.appLock.lockApps({
        //   sourceAppId: this.sourceApp.id,
        //   targetAppId: this.selectedDestinationApp.id
        // });

        this.isAppsLocked = true;
        console.log('Apps locked');
      } catch (error) {
        console.error('Failed to lock apps:', error);
        throw error;
      }
    },

    /**
     * Unlock both source and destination apps
     */
    async unlockApps() {
      try {
        // TODO: Integrate with middleware to unlock apps
        // await window.FlipletAppMerge.middleware.controllers.appLock.unlockApps({
        //   sourceAppId: this.sourceApp.id,
        //   targetAppId: this.selectedDestinationApp.id
        // });

        this.isAppsLocked = false;
        console.log('Apps unlocked');
      } catch (error) {
        console.error('Failed to unlock apps:', error);
      }
    },

    /**
     * Clear merge state
     */
    clearState() {
      this.selectedDestinationApp = null;
      this.mergeConfiguration = {
        screens: [],
        dataSources: [],
        files: [],
        configurations: []
      };
      this.isAppsLocked = false;
      this.mergeId = null;
    },

    /**
     * Handle global errors
     */
    handleGlobalError(error) {
      // Determine error severity
      const isCritical = this.isCriticalError(error);

      if (isCritical) {
        // Critical error - show error page
        this.globalError = {
          message: error.message || 'A critical error occurred',
          isCritical: true
        };

        // Navigate to dashboard
        this.goToDashboard();
      } else {
        // Non-critical error - show toast notification
        // TODO: Integrate with NotificationToast component when implemented globally
        console.warn('Non-critical error:', error.message);

        this.globalError = {
          message: error.message || 'An error occurred',
          isCritical: false
        };

        // Clear error after 5 seconds
        setTimeout(() => {
          this.globalError = null;
        }, 5000);
      }

      // Log error for debugging
      this.logError(error);
    },

    /**
     * Determine if error is critical
     */
    isCriticalError(error) {
      // Add logic to determine if error is critical
      // For now, treat API errors and network errors as critical
      const criticalErrors = [
        'NetworkError',
        'AuthenticationError',
        'PermissionError'
      ];

      return criticalErrors.some(criticalError => {
        return error.name === criticalError || error.message.includes(criticalError);
      });
    },

    /**
     * Log error for debugging
     */
    logError(error) {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        currentView: this.currentView,
        sourceApp: this.sourceApp.id,
        destinationApp: this.selectedDestinationApp?.id
      };

      console.error('Error log:', errorLog);

      // TODO: Send to monitoring service if available
      // if (window.FlipletMonitoring) {
      //   window.FlipletMonitoring.logError(errorLog);
      // }
    }
  }
};
</script>
