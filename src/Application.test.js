const { shallowMount } = require('@vue/test-utils');
const Application = require('./Application.vue').default;

const createStub = (name, props = []) => ({
  name,
  template: `<div data-test="${name}" />`,
  props
});

describe('Application', () => {
  const createWrapper = () => {
    return shallowMount(Application, {
      global: {
        stubs: {
          AppShell: {
            name: 'AppShell',
            template: '<div><slot /></div>'
          },
          MergeDashboard: createStub('MergeDashboard'),
          DestinationSelector: createStub('DestinationSelector'),
          MergeConfiguration: createStub('MergeConfiguration', [
            'sourceAppId',
            'sourceAppName',
            'destinationAppId',
            'destinationAppName'
          ]),
          MergeReview: createStub('MergeReview'),
          MergeProgress: createStub('MergeProgress'),
          MergeComplete: createStub('MergeComplete')
        }
      }
    });
  };

  describe('initial state', () => {
    it('starts on dashboard view', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.currentView).toBe('dashboard');
      expect(wrapper.vm.currentStep).toBe(0);
    });

    it('renders dashboard component initially', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-test="MergeDashboard"]').exists()).toBe(true);
    });

    it('has no destination app selected initially', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.selectedDestinationApp).toBeNull();
    });

    it('apps are not locked initially', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.isAppsLocked).toBe(false);
    });
  });

  describe('navigation flow', () => {
    it('navigates from dashboard to destination selector', async () => {
      const wrapper = createWrapper();

      wrapper.vm.goToDestinationSelector();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentView).toBe('destination-selector');
      expect(wrapper.vm.currentStep).toBe(1);
      expect(wrapper.find('[data-test="DestinationSelector"]').exists()).toBe(true);
    });

    it('navigates from destination selector to configuration after app selection', async () => {
      const wrapper = createWrapper();
      const destinationApp = { id: 456, name: 'Destination App' };

      await wrapper.vm.handleDestinationSelected(destinationApp);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentView).toBe('configuration');
      expect(wrapper.vm.currentStep).toBe(2);
      expect(wrapper.vm.selectedDestinationApp).toEqual(destinationApp);
      expect(wrapper.find('[data-test="MergeConfiguration"]').exists()).toBe(true);
    });

    it('navigates from configuration to review', async () => {
      const wrapper = createWrapper();
      const selections = {
        screens: [{ id: 1, name: 'Screen 1' }],
        dataSources: [],
        files: [],
        configurations: []
      };

      wrapper.vm.handleReview(selections);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentView).toBe('review');
      expect(wrapper.vm.currentStep).toBe(3);
      expect(wrapper.vm.mergeConfiguration).toEqual(selections);
      expect(wrapper.find('[data-test="MergeReview"]').exists()).toBe(true);
    });

    it('navigates from review to progress when merge starts', async () => {
      const wrapper = createWrapper();

      await wrapper.vm.handleStartMerge();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentView).toBe('progress');
      expect(wrapper.vm.currentStep).toBe(4);
      expect(wrapper.find('[data-test="MergeProgress"]').exists()).toBe(true);
    });

    it('navigates from progress to complete when merge finishes', async () => {
      const wrapper = createWrapper();

      await wrapper.vm.handleMergeComplete();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentView).toBe('complete');
      expect(wrapper.vm.currentStep).toBe(5);
      expect(wrapper.find('[data-test="MergeComplete"]').exists()).toBe(true);
    });

    it('navigates back to dashboard from destination selector', async () => {
      const wrapper = createWrapper();
      wrapper.vm.goToDestinationSelector();
      await wrapper.vm.$nextTick();

      wrapper.vm.goToDashboard();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentView).toBe('dashboard');
      expect(wrapper.vm.currentStep).toBe(0);
    });

    it('navigates back to configuration from review', async () => {
      const wrapper = createWrapper();
      wrapper.vm.goToReview();
      await wrapper.vm.$nextTick();

      wrapper.vm.goToConfiguration();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentView).toBe('configuration');
      expect(wrapper.vm.currentStep).toBe(2);
    });
  });

  describe('app locking', () => {
    it('locks apps when proceeding from destination selection', async () => {
      const wrapper = createWrapper();
      const destinationApp = { id: 456, name: 'Destination App' };

      await wrapper.vm.handleDestinationSelected(destinationApp);

      expect(wrapper.vm.isAppsLocked).toBe(true);
    });

    it('unlocks apps on merge completion', async () => {
      const wrapper = createWrapper();
      wrapper.vm.isAppsLocked = true;

      await wrapper.vm.handleMergeComplete();

      expect(wrapper.vm.isAppsLocked).toBe(false);
    });

    it('unlocks apps on merge error', async () => {
      const wrapper = createWrapper();
      wrapper.vm.isAppsLocked = true;

      await wrapper.vm.handleMergeError({ message: 'Test error' });

      expect(wrapper.vm.isAppsLocked).toBe(false);
    });

    it('unlocks apps on cancel', async () => {
      const wrapper = createWrapper();
      wrapper.vm.isAppsLocked = true;

      await wrapper.vm.handleCancel();

      expect(wrapper.vm.isAppsLocked).toBe(false);
    });
  });

  describe('state management', () => {
    it('preserves merge configuration when navigating between configure and review', async () => {
      const wrapper = createWrapper();
      const selections = {
        screens: [{ id: 1, name: 'Screen 1' }],
        dataSources: [{ id: 10, name: 'DS 1' }],
        files: [],
        configurations: []
      };

      wrapper.vm.handleReview(selections);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.mergeConfiguration).toEqual(selections);

      wrapper.vm.goToConfiguration();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.mergeConfiguration).toEqual(selections);
    });

    it('clears state on completion', async () => {
      const wrapper = createWrapper();
      wrapper.vm.selectedDestinationApp = { id: 456, name: 'Destination App' };
      wrapper.vm.mergeConfiguration = {
        screens: [{ id: 1, name: 'Screen 1' }],
        dataSources: [],
        files: [],
        configurations: []
      };

      await wrapper.vm.handleMergeComplete();
      await wrapper.vm.goToDashboard();

      expect(wrapper.vm.selectedDestinationApp).toBeNull();
      expect(wrapper.vm.mergeConfiguration.screens).toEqual([]);
    });

    it('clears state on cancel', async () => {
      const wrapper = createWrapper();
      wrapper.vm.selectedDestinationApp = { id: 456, name: 'Destination App' };
      wrapper.vm.mergeConfiguration = {
        screens: [{ id: 1, name: 'Screen 1' }],
        dataSources: [],
        files: [],
        configurations: []
      };

      await wrapper.vm.handleCancel();

      expect(wrapper.vm.selectedDestinationApp).toBeNull();
      expect(wrapper.vm.mergeConfiguration.screens).toEqual([]);
      expect(wrapper.vm.isAppsLocked).toBe(false);
    });
  });

  describe('error handling', () => {
    it('returns to dashboard on merge error', async () => {
      const wrapper = createWrapper();
      wrapper.vm.currentView = 'progress';

      await wrapper.vm.handleMergeError({ message: 'Test error' });

      expect(wrapper.vm.currentView).toBe('dashboard');
    });

    it('unlocks apps before returning to dashboard on error', async () => {
      const wrapper = createWrapper();
      wrapper.vm.isAppsLocked = true;
      wrapper.vm.currentView = 'progress';

      await wrapper.vm.handleMergeError({ message: 'Test error' });

      expect(wrapper.vm.isAppsLocked).toBe(false);
    });
  });

  describe('computed properties', () => {
    it('shows progress for appropriate views', () => {
      const wrapper = createWrapper();

      wrapper.vm.currentView = 'dashboard';
      expect(wrapper.vm.showProgress).toBe(false);

      wrapper.vm.currentView = 'destination-selector';
      expect(wrapper.vm.showProgress).toBe(true);

      wrapper.vm.currentView = 'configuration';
      expect(wrapper.vm.showProgress).toBe(true);

      wrapper.vm.currentView = 'review';
      expect(wrapper.vm.showProgress).toBe(true);

      wrapper.vm.currentView = 'progress';
      expect(wrapper.vm.showProgress).toBe(true);

      wrapper.vm.currentView = 'complete';
      expect(wrapper.vm.showProgress).toBe(false);
    });

    it('returns correct page titles', () => {
      const wrapper = createWrapper();

      wrapper.vm.currentView = 'dashboard';
      expect(wrapper.vm.currentPageTitle).toBe('Merge Dashboard');

      wrapper.vm.currentView = 'destination-selector';
      expect(wrapper.vm.currentPageTitle).toBe('Select Destination App');

      wrapper.vm.currentView = 'configuration';
      expect(wrapper.vm.currentPageTitle).toBe('Configure Merge Settings');

      wrapper.vm.currentView = 'review';
      expect(wrapper.vm.currentPageTitle).toBe('Review Merge Summary');

      wrapper.vm.currentView = 'progress';
      expect(wrapper.vm.currentPageTitle).toBe('Merge in Progress');

      wrapper.vm.currentView = 'complete';
      expect(wrapper.vm.currentPageTitle).toBe('Merge Complete');
    });
  });

  describe('lifecycle', () => {
    it('initializes middleware on creation', () => {
      const initSpy = jest.spyOn(Application.methods, 'initializeMiddleware');
      const wrapper = createWrapper();

      expect(initSpy).toHaveBeenCalled();
      initSpy.mockRestore();
    });

    it('unlocks apps on unmount if locked', async () => {
      const wrapper = createWrapper();
      const unlockSpy = jest.spyOn(wrapper.vm, 'unlockApps');
      wrapper.vm.isAppsLocked = true;

      wrapper.unmount();

      expect(unlockSpy).toHaveBeenCalled();
    });

    it('does not call unlock on unmount if apps not locked', async () => {
      const wrapper = createWrapper();
      const unlockSpy = jest.spyOn(wrapper.vm, 'unlockApps');
      wrapper.vm.isAppsLocked = false;

      wrapper.unmount();

      expect(unlockSpy).not.toHaveBeenCalled();
    });
  });
});

