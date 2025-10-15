const { shallowMount } = require('@vue/test-utils');
const SettingsTab = require('./SettingsTab.vue').default;

const createIconStub = (name) => ({
  name,
  template: '<svg />'
});

const WarningBannerStub = {
  name: 'WarningBanner',
  template: '<div />',
  props: ['type', 'message', 'dismissable']
};

const renderComponent = (props = {}) => {
  return shallowMount(SettingsTab, {
    propsData: {
      sourceAppId: 123,
      destinationAppId: 456,
      selection: [],
      ...props
    },
    global: {
      stubs: {
        Settings: createIconStub('Settings'),
        Menu: createIconStub('Menu'),
        Palette: createIconStub('Palette'),
        Code: createIconStub('Code'),
        AlertTriangle: createIconStub('AlertTriangle'),
        ExternalLink: createIconStub('ExternalLink'),
        WarningBanner: WarningBannerStub
      }
    }
  });
};

describe('SettingsTab', () => {
  describe('Rendering', () => {
    it('renders instructions', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Select app-level configurations to copy to the destination app');
    });

    it('renders all four settings checkboxes', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('App settings');
      expect(wrapper.text()).toContain('Menu settings');
      expect(wrapper.text()).toContain('Global appearance settings');
      expect(wrapper.text()).toContain('Global code customizations');
    });
  });

  describe('Selection Management', () => {
    it('starts with no settings selected', () => {
      const wrapper = renderComponent();

      expect(wrapper.vm.selectedSettings.appSettings).toBe(false);
      expect(wrapper.vm.selectedSettings.menuSettings).toBe(false);
      expect(wrapper.vm.selectedSettings.appearanceSettings).toBe(false);
      expect(wrapper.vm.selectedSettings.codeCustomizations).toBe(false);
    });

    it('updates selection when changed', async () => {
      const wrapper = renderComponent();

      wrapper.vm.selectedSettings.appSettings = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selectedSettings.appSettings).toBe(true);
    });

    it('emits selection-change event when selection changes', async () => {
      const wrapper = renderComponent();

      wrapper.vm.selectedSettings.appSettings = true;
      await wrapper.vm.handleSelectionChange();

      expect(wrapper.emitted('selection-change')).toBeTruthy();
      expect(wrapper.emitted('selection-change')[0][0]).toEqual(['appSettings']);
    });

    it('updates selection when prop changes', async () => {
      const wrapper = renderComponent();
      await wrapper.setProps({ selection: ['appSettings', 'menuSettings'] });

      expect(wrapper.vm.selectedSettings.appSettings).toBe(true);
      expect(wrapper.vm.selectedSettings.menuSettings).toBe(true);
      expect(wrapper.vm.selectedSettings.appearanceSettings).toBe(false);
      expect(wrapper.vm.selectedSettings.codeCustomizations).toBe(false);
    });
  });

  describe('Selection Counter', () => {
    it('shows selection count when settings are selected', async () => {
      const wrapper = renderComponent();

      wrapper.vm.selectedSettings.appSettings = true;
      wrapper.vm.selectedSettings.menuSettings = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('2 app-level settings selected');
    });

    it('uses singular form for single selection', async () => {
      const wrapper = renderComponent();

      wrapper.vm.selectedSettings.appSettings = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('1 app-level setting selected');
    });

    it('does not show counter when nothing is selected', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).not.toContain(' selected');
    });
  });

  describe('Warning Banner', () => {
    it('does not show warning banner when code customizations not selected', () => {
      const wrapper = renderComponent();

      expect(wrapper.findComponent(WarningBannerStub).exists()).toBe(false);
    });

    it('shows warning banner when code customizations are selected', async () => {
      const wrapper = renderComponent();

      wrapper.vm.selectedSettings.codeCustomizations = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent(WarningBannerStub).exists()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('selectionCount returns 0 when nothing selected', () => {
      const wrapper = renderComponent();

      expect(wrapper.vm.selectionCount).toBe(0);
    });

    it('selectionCount returns correct count', async () => {
      const wrapper = renderComponent();

      wrapper.vm.selectedSettings.appSettings = true;
      wrapper.vm.selectedSettings.menuSettings = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selectionCount).toBe(2);
    });

    it('selectionArray returns empty array when nothing selected', () => {
      const wrapper = renderComponent();

      expect(wrapper.vm.selectionArray).toEqual([]);
    });

    it('selectionArray returns correct array of selected keys', async () => {
      const wrapper = renderComponent();

      wrapper.vm.selectedSettings.appSettings = true;
      wrapper.vm.selectedSettings.codeCustomizations = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selectionArray).toEqual(['appSettings', 'codeCustomizations']);
    });
  });
});
