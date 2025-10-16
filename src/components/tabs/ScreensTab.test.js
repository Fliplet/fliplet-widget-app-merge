const { shallowMount } = require('@vue/test-utils');
const ScreensTab = require('./ScreensTab.vue').default;

const FlipletTableWrapperStub = {
  name: 'FlipletTableWrapper',
  props: ['columns', 'data', 'selection', 'expandable', 'loading', 'config', 'containerClasses'],
  emits: ['selection:change', 'expand', 'row-click'],
  template: '<div class="fliplet-table-stub"><slot /></div>'
};

const screensFixture = [
  {
    id: 1,
    name: 'Home Screen',
    lastModified: Date.now() - 86400000,
    hasNonCopyableComponents: false,
    associatedDataSources: [
      { id: 1, name: 'Users' },
      { id: 2, name: 'Settings' }
    ],
    associatedFiles: [
      { id: 10, name: 'logo.png' },
      { id: 11, name: 'background.jpg' }
    ]
  },
  {
    id: 2,
    name: 'Login Screen',
    lastModified: Date.now() - 172800000,
    hasNonCopyableComponents: false,
    associatedDataSources: [{ id: 3, name: 'Authentication' }],
    associatedFiles: []
  }
];

const renderComponent = (props = {}) => {
  return shallowMount(ScreensTab, {
    propsData: {
      sourceAppId: 123,
      destinationAppId: 456,
      selection: [],
      ...props
    },
    global: {
      stubs: {
        FlipletTableWrapper: FlipletTableWrapperStub
      }
    }
  });
};

const setScreens = async (wrapper, overrides = {}) => {
  await wrapper.setData({
    loading: false,
    error: null,
    screens: screensFixture,
    ...overrides
  });
  await wrapper.vm.$nextTick();
};

describe('ScreensTab', () => {
  describe('Rendering', () => {
    it('renders instructions', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Select screens to copy to the destination app');
    });

    it('shows loading state while fetching screens', () => {
      const wrapper = renderComponent();

      expect(wrapper.vm.loading).toBe(true);
      expect(wrapper.text()).toContain('Loading screens...');
    });
  });

  describe('Computed data', () => {
    it('builds screen rows with aggregated counts', async () => {
      const wrapper = renderComponent();
      await setScreens(wrapper);

      const [firstRow] = wrapper.vm.screenRows;
      expect(firstRow).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Home Screen',
          dataSourceCount: 2,
          fileCount: 2
        })
      );
    });

    it('derives allSelected and someSelected flags from selection state', async () => {
      const wrapper = renderComponent();
      await setScreens(wrapper);

      expect(wrapper.vm.allSelected).toBe(false);
      expect(wrapper.vm.someSelected).toBe(false);

      await wrapper.setData({ selectedIds: [1] });
      expect(wrapper.vm.someSelected).toBe(true);

      await wrapper.setData({ selectedIds: [1, 2] });
      expect(wrapper.vm.allSelected).toBe(true);
    });
  });

  describe('Selection management', () => {
    it('syncs selection when selection prop changes', async () => {
      const wrapper = renderComponent();
      await wrapper.setProps({ selection: [1, 2] });

      expect(wrapper.vm.selectedIds).toEqual([1, 2]);
    });

    it('handles selection change emitted from Fliplet table', async () => {
      const wrapper = renderComponent();
      await setScreens(wrapper);

      const table = wrapper.findComponent({ name: 'FlipletTableWrapper' });
      table.vm.$emit('selection:change', [{ id: 1 }, { id: 2 }]);

      expect(wrapper.vm.selectedIds).toEqual([1, 2]);
      expect(wrapper.emitted('selection-change')[0][0]).toEqual([1, 2]);
    });

    it('handles bulk toggle select all logic', async () => {
      const wrapper = renderComponent();
      await setScreens(wrapper);

      wrapper.vm.toggleSelectAll();
      expect(wrapper.vm.selectedIds).toEqual([1, 2]);

      wrapper.vm.toggleSelectAll();
      expect(wrapper.vm.selectedIds).toEqual([]);
    });
  });

  describe('Expandable rows', () => {
    it('tracks expanded ids from expand events', async () => {
      const wrapper = renderComponent();
      await setScreens(wrapper);

      const table = wrapper.findComponent({ name: 'FlipletTableWrapper' });
      table.vm.$emit('expand', { row: { id: 1 }, isExpanded: true });
      expect(wrapper.vm.expandedIds).toEqual([1]);

      table.vm.$emit('expand', { row: { id: 1 }, isExpanded: false });
      expect(wrapper.vm.expandedIds).toEqual([]);
    });

    it('toggles expansion via row click events', async () => {
      const wrapper = renderComponent();
      await setScreens(wrapper);

      const table = wrapper.findComponent({ name: 'FlipletTableWrapper' });
      table.vm.$emit('row-click', { row: { id: 1 } });
      expect(wrapper.vm.expandedIds).toEqual([1]);

      table.vm.$emit('row-click', { row: { id: 1 } });
      expect(wrapper.vm.expandedIds).toEqual([]);
    });
  });

  describe('Nested association selection', () => {
    const expandScreen = async (wrapper) => {
      await setScreens(wrapper, { expandedIds: [1] });
      await wrapper.vm.$nextTick();
    };

    it('emits association toggles for nested data sources', async () => {
      const wrapper = renderComponent();
      await expandScreen(wrapper);

      const tables = wrapper.findAllComponents({ name: 'FlipletTableWrapper' });
      const dataSourceTable = tables.at(1);

      dataSourceTable.vm.$emit('selection:change', [{ id: 1 }]);

      const emitted = wrapper.emitted('toggle:data-source');
      expect(emitted[0][0]).toEqual({ id: 1, selected: true });

      const associationConfig = wrapper.vm.flipletAssociationConfig('data-source', 1);
      expect(associationConfig.selection.selected).toEqual([1]);
    });

    it('emits association toggles for nested files', async () => {
      const wrapper = renderComponent();
      await expandScreen(wrapper);

      const tables = wrapper.findAllComponents({ name: 'FlipletTableWrapper' });
      const fileTable = tables.at(2);

      fileTable.vm.$emit('selection:change', [{ id: 10 }]);

      const emitted = wrapper.emitted('toggle:file');
      expect(emitted[0][0]).toEqual({ id: 10, selected: true });
    });
  });

  describe('Error handling', () => {
    it('shows error banner when error message present', async () => {
      const wrapper = renderComponent();
      await wrapper.setData({ loading: false, error: 'Failed to load screens.' });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Failed to load screens.');
    });
  });

  describe('Date formatting', () => {
    it('formats timestamps relative to today and yesterday', () => {
      const wrapper = renderComponent();

      const today = Date.now();
      const yesterday = Date.now() - 86400000;

      expect(wrapper.vm.formatDate(today)).toBe('Today');
      expect(wrapper.vm.formatDate(yesterday)).toBe('Yesterday');
    });
  });
});
