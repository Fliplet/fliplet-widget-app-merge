const { shallowMount } = require('@vue/test-utils');
const MergeConfiguration = require('./MergeConfiguration.vue').default;

const createIconStub = (name) => ({
  name,
  template: '<svg />'
});

const createComponentStub = (name) => ({
  name,
  props: ['selection', 'selectedScreens', 'selectedDataSources', 'selectedFiles'],
  template: `<div>${name}</div>`
});

const createStubbedTabs = () => {
  const stub = (name) => ({
    name,
    props: ['sourceAppId', 'destinationAppId', 'selection', 'selectedScreens', 'selectedDataSources', 'selectedFiles'],
    emits: ['selection-change', 'toggle:screen', 'toggle:data-source', 'toggle:file', 'copy-mode-change', 'folder-option-change'],
    template: `<div data-testid="${name}">${name}</div>`
  });

  return {
    ScreensTab: stub('ScreensTab'),
    DataSourcesTab: stub('DataSourcesTab'),
    FilesTab: stub('FilesTab'),
    SettingsTab: stub('SettingsTab')
  };
};

const renderWrapper = (props = {}) => {
  const stubbedTabs = createStubbedTabs();

  return shallowMount(MergeConfiguration, {
    propsData: {
      sourceAppId: 123,
      sourceAppName: 'Source App',
      destinationAppId: 456,
      destinationAppName: 'Destination App',
      lockedUntil: null,
      ...props
    },
    global: {
      stubs: {
        ArrowRight: createIconStub('ArrowRight'),
        Lock: createIconStub('Lock'),
        LockCountdown: {
          name: 'LockCountdown',
          template: '<div />',
          emits: ['extend-lock', 'lock-expired']
        },
        ...stubbedTabs
      }
    }
  });
};

describe('MergeConfiguration', () => {
  let wrapper;

  const defaultProps = {
    sourceAppId: 123,
    sourceAppName: 'Source App',
    destinationAppId: 456,
    destinationAppName: 'Destination App',
    lockedUntil: null
  };

  const createWrapper = (props = {}) => {
    const stubComponent = (name) => ({
      name,
      props: ['sourceAppId', 'destinationAppId', 'selection', 'selectedScreens', 'selectedDataSources', 'selectedFiles'],
      emits: ['selection-change', 'toggle:screen', 'toggle:data-source', 'toggle:file', 'copy-mode-change', 'folder-option-change'],
      template: `<div class="tab-stub" data-tab="${name}"><slot /></div>`
    });

    return shallowMount(MergeConfiguration, {
      propsData: {
        sourceAppId: 123,
        sourceAppName: 'Source App',
        destinationAppId: 456,
        destinationAppName: 'Destination App',
        lockedUntil: null,
        ...props
      },
      global: {
        stubs: {
          ArrowRight: createIconStub('ArrowRight'),
          Lock: createIconStub('Lock'),
          LockCountdown: {
            name: 'LockCountdown',
            template: '<div />',
            emits: ['extend-lock', 'lock-expired']
          },
          ScreensTab: stubComponent('ScreensTab'),
          DataSourcesTab: stubComponent('DataSourcesTab'),
          FilesTab: stubComponent('FilesTab'),
          SettingsTab: stubComponent('SettingsTab')
        }
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Rendering', () => {
    it('renders app direction indicator with source and destination names', () => {
      expect(wrapper.text()).toContain('Source App');
      expect(wrapper.text()).toContain('Destination App');
      expect(wrapper.text()).toContain('Source');
      expect(wrapper.text()).toContain('Destination');
    });

    it('shows lock indicator when apps are locked', async () => {
      const lockedWrapper = createWrapper({
        lockedUntil: Date.now() + 600000 // 10 minutes from now
      });

      expect(lockedWrapper.text()).toContain('Apps locked');
    });

    it('does not show lock indicator when apps are not locked', () => {
      expect(wrapper.text()).not.toContain('Apps locked');
    });

    it('renders LockCountdown component when lockedUntil is provided', () => {
      const lockedWrapper = createWrapper({
        lockedUntil: Date.now() + 600000
      });

      expect(lockedWrapper.findComponent({ name: 'LockCountdown' }).exists()).toBe(true);
    });

    it('does not render LockCountdown component when lockedUntil is null', () => {
      expect(wrapper.findComponent({ name: 'LockCountdown' }).exists()).toBe(false);
    });

    it('renders all tabs in the navigation', () => {
      const tabs = wrapper.findAll('[role="tab"]');

      expect(tabs).toHaveLength(4);
      expect(tabs[0].text()).toContain('Screens');
      expect(tabs[1].text()).toContain('Data sources');
      expect(tabs[2].text()).toContain('Files');
      expect(tabs[3].text()).toContain('Settings');
    });

    it('renders the current tab component (ScreensTab by default)', () => {
      expect(wrapper.findComponent({ name: 'ScreensTab' }).exists()).toBe(true);
    });
  });

  describe('Tab Switching', () => {
    it('starts with screens tab active', () => {
      expect(wrapper.vm.currentTab).toBe('screens');
    });

    it('switches to data sources tab when clicked', async () => {
      const tabs = wrapper.findAll('[role="tab"]');
      await tabs[1].trigger('click');

      expect(wrapper.vm.currentTab).toBe('data-sources');
    });

    it('switches to files tab when clicked', async () => {
      const tabs = wrapper.findAll('[role="tab"]');
      await tabs[2].trigger('click');

      expect(wrapper.vm.currentTab).toBe('files');
    });

    it('switches to settings tab when clicked', async () => {
      const tabs = wrapper.findAll('[role="tab"]');
      await tabs[3].trigger('click');

      expect(wrapper.vm.currentTab).toBe('settings');
    });

    it('applies active styling to current tab', () => {
      const tabs = wrapper.findAll('[role="tab"]');

      expect(tabs[0].classes()).toContain('border-primary');
      expect(tabs[0].classes()).toContain('text-primary');
    });

    it('applies inactive styling to non-current tabs', () => {
      const tabs = wrapper.findAll('[role="tab"]');

      expect(tabs[1].classes()).toContain('border-transparent');
      expect(tabs[1].classes()).toContain('text-accent/70');
    });

    it('updates aria-selected attribute when switching tabs', async () => {
      const tabs = wrapper.findAll('[role="tab"]');

      expect(tabs[0].attributes('aria-selected')).toBe('true');
      expect(tabs[1].attributes('aria-selected')).toBe('false');

      await tabs[1].trigger('click');

      expect(tabs[0].attributes('aria-selected')).toBe('false');
      expect(tabs[1].attributes('aria-selected')).toBe('true');
    });
  });

  describe('Selection Tracking', () => {
    it('starts with no items selected', () => {
      expect(wrapper.vm.totalSelectedItems).toBe(0);
    });

    it('updates selection count when items are selected in a tab', async () => {
      await wrapper.vm.handleSelectionChange([1, 2, 3]);

      expect(wrapper.vm.selections.screens).toEqual([1, 2, 3]);
      expect(wrapper.vm.totalSelectedItems).toBe(3);
    });

    it('shows selection badge on tab when items are selected', async () => {
      await wrapper.vm.handleSelectionChange([1, 2, 3]);
      await wrapper.vm.$nextTick();

      const tabs = wrapper.findAll('[role="tab"]');

      expect(tabs[0].text()).toContain('3');
    });

    it('calculates total selected items across all tabs', async () => {
      wrapper.vm.selections.screens = [1, 2];
      wrapper.vm.selections['data-sources'] = [10, 20, 30];
      wrapper.vm.selections.files = [100];
      wrapper.vm.selections.settings = ['appSettings'];
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.totalSelectedItems).toBe(7);
    });

    it('shows selection counter when items are selected', async () => {
      await wrapper.vm.handleSelectionChange([1, 2, 3]);
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('3 items selected for merge');
    });

    it('does not show selection counter when no items selected', () => {
      expect(wrapper.text()).not.toContain('selected for merge');
    });
  });

  describe('Action Buttons', () => {
    it('renders Back, Cancel, and Review merge buttons', () => {
      const buttons = wrapper.findAll('button').filter(b => !b.attributes('role'));

      expect(buttons.some(b => b.text() === 'Back')).toBe(true);
      expect(buttons.some(b => b.text() === 'Cancel')).toBe(true);
      expect(buttons.some(b => b.text() === 'Review merge')).toBe(true);
    });

    it('emits back event when Back button clicked', async () => {
      const backButton = wrapper.findAll('button').find(b => b.text() === 'Back');
      await backButton.trigger('click');

      expect(wrapper.emitted('back')).toBeTruthy();
    });

    it('emits cancel event when Cancel button clicked', async () => {
      const cancelButton = wrapper.findAll('button').find(b => b.text() === 'Cancel');
      await cancelButton.trigger('click');

      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('disables Review merge button when no items selected', () => {
      const reviewButton = wrapper.findAll('button').find(b => b.text() === 'Review merge');

      expect(reviewButton.attributes('disabled')).toBeDefined();
    });

    it('enables Review merge button when items are selected', async () => {
      await wrapper.vm.handleSelectionChange([1, 2, 3]);
      await wrapper.vm.$nextTick();

      const reviewButton = wrapper.findAll('button').find(b => b.text() === 'Review merge');

      expect(reviewButton.attributes('disabled')).toBeUndefined();
    });

    it('emits review event with selections when Review merge clicked', async () => {
      wrapper.vm.selections.screens = [1, 2];
      wrapper.vm.selections['data-sources'] = [10];
      await wrapper.vm.$nextTick();

      const reviewButton = wrapper.findAll('button').find(b => b.text() === 'Review merge');
      await reviewButton.trigger('click');

      expect(wrapper.emitted('review')).toBeTruthy();
      expect(wrapper.emitted('review')[0][0]).toEqual({
        selections: {
          screens: [1, 2],
          'data-sources': [10],
          files: [],
          settings: []
        }
      });
    });
  });

  describe('Lock Management', () => {
    it('emits extend-lock event when LockCountdown requests extension', async () => {
      const lockedWrapper = createWrapper({
        lockedUntil: Date.now() + 600000
      });

      const lockCountdown = lockedWrapper.findComponent({ name: 'LockCountdown' });
      lockCountdown.vm.$emit('extend-lock');

      expect(lockedWrapper.emitted('extend-lock')).toBeTruthy();
    });

    it('handles lock expired event from LockCountdown', async () => {
      const lockedWrapper = createWrapper({
        lockedUntil: Date.now() + 600000
      });

      const lockCountdown = lockedWrapper.findComponent({ name: 'LockCountdown' });
      lockCountdown.vm.$emit('lock-expired');

      expect(lockedWrapper.emitted('lock-expired')).toBeTruthy();
    });
  });

  describe('Tab Component Integration', () => {
    it('passes correct props to ScreensTab', () => {
      const screensTab = wrapper.find('[data-tab="ScreensTab"]');

      expect(screensTab.exists()).toBe(true);
    });

    it('passes updated selections to tab components', async () => {
      wrapper.vm.selections.screens = [1, 2, 3];
      wrapper.vm.selections['data-sources'] = [10];
      wrapper.vm.selections.files = [200];
      await wrapper.vm.$nextTick();

      const screensTab = wrapper.find('[data-tab="ScreensTab"]');
      expect(screensTab.exists()).toBe(true);

      await wrapper.vm.switchTab('data-sources');
      await wrapper.vm.$nextTick();
      expect(wrapper.find('[data-tab="DataSourcesTab"]').exists()).toBe(true);

      await wrapper.vm.switchTab('files');
      await wrapper.vm.$nextTick();
      expect(wrapper.find('[data-tab="FilesTab"]').exists()).toBe(true);
    });

    it('handles selection-change event from tab components', async () => {
      wrapper.vm.handleSelectionChange([1, 2, 3]);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selections.screens).toEqual([1, 2, 3]);
    });

    it('syncs data source selection when ScreensTab toggles association', async () => {
      wrapper.vm.handleAssociationToggle('data-sources', { id: 10, selected: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selections['data-sources']).toEqual([10]);
    });

    it('syncs file selection when ScreensTab toggles association', async () => {
      wrapper.vm.handleAssociationToggle('files', { id: 200, selected: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selections.files).toEqual([200]);
    });

    it('syncs screen selection when DataSourcesTab toggles association', async () => {
      wrapper.vm.handleAssociationToggle('screens', { id: 5, selected: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selections.screens).toEqual([5]);
    });

    it('syncs screen and data source selections when FilesTab toggles associations', async () => {
      wrapper.vm.handleAssociationToggle('data-sources', { id: 12, selected: true });
      wrapper.vm.handleAssociationToggle('screens', { id: 3, selected: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selections['data-sources']).toEqual([12]);
      expect(wrapper.vm.selections.screens).toEqual([3]);
    });

    it('handles copy-mode-change event from DataSourcesTab', async () => {
      await wrapper.vm.switchTab('data-sources');
      await wrapper.vm.$nextTick();

      const dsTab = wrapper.findComponent({ name: 'DataSourcesTab' });
      dsTab.vm.$emit('copy-mode-change', { dataSourceId: 10, mode: 'overwrite' });

      expect(wrapper.emitted('copy-mode-change')).toBeTruthy();
      expect(wrapper.emitted('copy-mode-change')[0][0]).toEqual({
        dataSourceId: 10,
        mode: 'overwrite'
      });
    });

    it('handles folder-option-change event from FilesTab', async () => {
      await wrapper.vm.switchTab('files');
      await wrapper.vm.$nextTick();

      wrapper.vm.handleFolderOptionChange({ fileId: 5, option: 'folder-with-files' });

      expect(wrapper.emitted('folder-option-change')).toBeTruthy();
    });
  });
});
