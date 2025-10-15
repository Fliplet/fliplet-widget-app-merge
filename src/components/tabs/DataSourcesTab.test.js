const { shallowMount } = require('@vue/test-utils');
const DataSourcesTab = require('./DataSourcesTab.vue').default;

const FlipletTableWrapperStub = {
  name: 'FlipletTableWrapper',
  props: ['columns', 'data', 'selection', 'expandable', 'loading', 'config'],
  emits: ['selection:change', 'expand', 'row-click'],
  template: '<div class="fliplet-table-stub"><slot /></div>'
};

const dataSourcesFixture = [
  {
    id: 1,
    name: 'Users',
    lastModified: Date.now() - 86400000,
    entryCount: 150,
    isGlobalDependency: false,
    associatedScreens: [
      { id: 10, name: 'Home' },
      { id: 11, name: 'Profile' }
    ],
    associatedFiles: [{ id: 200, name: 'users.json' }]
  },
  {
    id: 2,
    name: 'Settings',
    lastModified: Date.now() - 172800000,
    entryCount: 20,
    isGlobalDependency: true,
    associatedScreens: [],
    associatedFiles: []
  },
  {
    id: 3,
    name: 'Logs',
    lastModified: Date.now() - 3600000,
    entryCount: 50,
    isGlobalDependency: false,
    associatedScreens: [{ id: 12, name: 'Dashboard' }],
    associatedFiles: [{ id: 300, name: 'logs.json' }]
  }
];

const renderComponent = (props = {}) => {
  return shallowMount(DataSourcesTab, {
    propsData: {
      sourceAppId: 123,
      destinationAppId: 456,
      selection: [],
      selectedScreens: [],
      selectedFiles: [],
      ...props
    },
    global: {
      stubs: {
        Database: { template: '<svg />' },
        Star: { template: '<svg />' },
        Eye: { template: '<svg />' },
        AlertTriangle: { template: '<svg />' },
        FlipletTableWrapper: FlipletTableWrapperStub
      }
    }
  });
};

const setDataSources = async (wrapper, overrides = {}) => {
  await wrapper.setData({
    loading: false,
    error: null,
    dataSources: dataSourcesFixture,
    copyModes: { 1: 'structure', 2: 'structure' },
    ...overrides
  });
  await wrapper.vm.$nextTick();
};

describe('DataSourcesTab', () => {
  describe('Rendering & computed data', () => {
    it('renders live data warning', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Warning: Live data impact');
    });

    it('builds dataSourceRows with derived fields', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      const [firstRow] = wrapper.vm.dataSourceRows;
      expect(firstRow).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Users',
          entryCount: 150,
          status: ''
        })
      );
    });

    it('flags global dependencies in status column', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      const secondRow = wrapper.vm.dataSourceRows[1];
      expect(secondRow.status).toBe('Global dependency');
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
      await setDataSources(wrapper);

      const table = wrapper.findComponent({ name: 'FlipletTableWrapper' });
      table.vm.$emit('selection:change', [{ id: 1 }]);

      expect(wrapper.vm.selectedIds).toEqual([1]);
      expect(wrapper.emitted('selection-change')[0][0]).toEqual([1]);
    });

    it('toggles select all and emits selection change', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      wrapper.vm.toggleSelectAll();
      expect(wrapper.vm.selectedIds).toEqual([1, 2, 3]);

      wrapper.vm.toggleSelectAll();
      expect(wrapper.vm.selectedIds).toEqual([]);
    });
  });

  describe('Expandable rows', () => {
    it('tracks expanded data source IDs', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      const table = wrapper.findComponent({ name: 'FlipletTableWrapper' });
      table.vm.$emit('expand', { row: { id: 1 }, isExpanded: true });
      expect(wrapper.vm.expandedIds).toEqual([1]);

      table.vm.$emit('expand', { row: { id: 1 }, isExpanded: false });
      expect(wrapper.vm.expandedIds).toEqual([]);
    });

    it('toggles expansion via row click events', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      const table = wrapper.findComponent({ name: 'FlipletTableWrapper' });
      table.vm.$emit('row-click', { row: { id: 1 } });
      expect(wrapper.vm.expandedIds).toEqual([1]);

      table.vm.$emit('row-click', { row: { id: 1 } });
      expect(wrapper.vm.expandedIds).toEqual([]);
    });
  });

  describe('Copy mode management', () => {
    it('defaults copy modes to structure only', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      expect(wrapper.vm.copyModes).toMatchObject({ 1: 'structure', 2: 'structure', 3: 'structure' });
    });

    it('handles copy mode change and emits event', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      const event = { target: { value: 'overwrite' } };
      wrapper.vm.handleCopyModeChange(1, event);

      expect(wrapper.vm.copyModes[1]).toBe('overwrite');
      expect(wrapper.emitted('copy-mode-change')[0][0]).toEqual({ dataSourceId: 1, mode: 'overwrite' });
    });

    it('sets all selected data sources to structure only', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper, { selectedIds: [1, 2], copyModes: { 1: 'overwrite', 2: 'overwrite' } });

      wrapper.vm.setAllToStructureOnly();

      expect(wrapper.vm.copyModes[1]).toBe('structure');
      expect(wrapper.vm.copyModes[2]).toBe('structure');
      expect(wrapper.emitted('copy-mode-change')).toHaveLength(2);
    });
  });

  describe('Nested association selection', () => {
    const expandDataSource = async (wrapper) => {
      await setDataSources(wrapper, { expandedIds: [1] });
      await wrapper.vm.$nextTick();
    };

    it('emits screen association toggles', async () => {
      const wrapper = renderComponent();
      await expandDataSource(wrapper);

      const tables = wrapper.findAllComponents({ name: 'FlipletTableWrapper' });
      const screenTable = tables.at(1);

      screenTable.vm.$emit('selection:change', [{ id: 10 }]);

      expect(wrapper.emitted('toggle:screen')[0][0]).toEqual({ id: 10, selected: true });
    });

    it('emits file association toggles', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      wrapper.vm.handleNestedSelection('file', 1, [{ id: 200 }]);

      expect(wrapper.emitted('toggle:file')[0][0]).toEqual({ id: 200, selected: true });
    });

    it('provides initial selections from props', async () => {
      const wrapper = renderComponent({ selectedScreens: [11], selectedFiles: [200] });
      await expandDataSource(wrapper);

      const screenRows = wrapper.vm.buildScreenRows(dataSourcesFixture[0]);
      const fileRows = wrapper.vm.buildFileRows(dataSourcesFixture[0]);

      const selectedScreen = screenRows.find(row => row.id === 11);
      const selectedFile = fileRows.find(row => row.id === 200);

      if (selectedScreen) {
        expect(wrapper.vm.getNestedSelection('screen', dataSourcesFixture[0].id)).toContain(selectedScreen.id);
      }

      if (selectedFile) {
        expect(wrapper.vm.getNestedSelection('file', dataSourcesFixture[0].id)).toContain(selectedFile.id);
      }
    });
  });

  describe('Error handling', () => {
    it('shows error banner when loading fails', async () => {
      const wrapper = renderComponent();
      await wrapper.setData({ loading: false, error: 'Failed to load data sources.' });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Failed to load data sources.');
    });
  });
});
