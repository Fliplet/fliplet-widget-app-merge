const { shallowMount } = require('@vue/test-utils');
const DataSourcesTab = require('./DataSourcesTab.vue').default;

const createIconStub = (name) => ({
  name,
  template: '<svg />'
});

const FlipletTableWrapperStub = {
  name: 'FlipletTableWrapper',
  props: ['rows', 'columns', 'config'],
  emits: ['selection-change', 'selection:change'],
  template: '<div class="fliplet-table-wrapper"><slot /></div>'
};

const baseStubConfig = {
  AlertTriangle: createIconStub('AlertTriangle'),
  FlipletTableWrapper: FlipletTableWrapperStub
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

const renderComponent = () => {
  return shallowMount(DataSourcesTab, {
    propsData: {
      sourceAppId: 1,
      destinationAppId: 2,
      selection: [],
      selectedScreens: [],
      selectedFiles: []
    },
    global: {
      stubs: baseStubConfig
    }
  });
};

const setDataSources = async (wrapper) => {
  wrapper.setData({ loading: true });

  const mapped = dataSourcesFixture.map((ds) => ({
    id: ds.id,
    name: ds.name,
    entryCount: ds.entryCount,
    lastModified: ds.lastModified,
    associatedScreens: ds.associatedScreens,
    associatedFiles: ds.associatedFiles
  }));

  await wrapper.setData({
    loading: false,
    dataSources: mapped,
    selectedIds: mapped.map(ds => ds.id),
    copyModes: mapped.reduce((acc, ds) => {
      acc[ds.id] = 'structure';
      return acc;
    }, {}),
    expandedIds: [],
    nestedSelections: {}
  });
};

describe('DataSourcesTab', () => {
  describe('Rendering & computed data', () => {
    it('renders live data warning', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Warning: Live data impact');
    });

    it('maps data sources into table rows with normalized fields', () => {
      const wrapper = renderComponent();
      wrapper.setData({ dataSources: dataSourcesFixture });

      const rows = wrapper.vm.dataSourceRows;

      expect(rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, name: 'Users' }),
          expect.objectContaining({ id: 2, name: 'Settings' })
        ])
      );
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
      expect(wrapper.vm.selectedIds.length).toBeGreaterThan(0);

      wrapper.vm.toggleSelectAll();
      expect(wrapper.vm.selectedIds).toEqual([]);
    });
  });

  describe('Expandable rows', () => {
    it('tracks expanded data source IDs', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      wrapper.vm.handleExpand({ row: { id: 1 }, isExpanded: true });
      expect(wrapper.vm.expandedIds).toEqual([1]);

      wrapper.vm.handleExpand({ row: { id: 1 }, isExpanded: false });
      expect(wrapper.vm.expandedIds).toEqual([]);
    });

    it('handles expand toggles without warnings', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      wrapper.vm.handleExpand({ row: { id: 1 }, isExpanded: true });
      expect(wrapper.vm.expandedIds).toEqual([1]);

      wrapper.vm.handleExpand({ row: { id: 1 }, isExpanded: false });
      expect(wrapper.vm.expandedIds).toEqual([]);
    });

    it('handles row click toggles without warnings', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      wrapper.vm.handleRowClick({ row: { id: 1 } });
      expect(wrapper.vm.expandedIds).toEqual([1]);

      wrapper.vm.handleRowClick({ row: { id: 1 } });
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

      wrapper.vm.handleCopyModeChange(1, { target: { value: 'overwrite' } });

      expect(wrapper.vm.copyModes[1]).toBe('overwrite');
      expect(wrapper.emitted('copy-mode-change')[0][0]).toEqual({ dataSourceId: 1, mode: 'overwrite' });
    });

    it('sets all selected data sources to structure only', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      wrapper.vm.setAllToStructureOnly();

      expect(wrapper.vm.copyModes[1]).toBe('structure');
      expect(wrapper.vm.copyModes[2]).toBe('structure');
      expect(wrapper.vm.copyModes[3]).toBe('structure');
    });
  });

  describe('Nested association selection', () => {
    const expandDataSource = async (wrapper) => {
      await setDataSources(wrapper, { expandedIds: [1] });
      await wrapper.vm.$nextTick();
    };

    it('emits screen association toggles', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      wrapper.vm.handleScreenToggle({ id: 10, selected: true });

      expect(wrapper.emitted('toggle:screen')[0][0]).toEqual({ id: 10, selected: true });
    });

    it('emits file association toggles', async () => {
      const wrapper = renderComponent();
      await setDataSources(wrapper);

      wrapper.vm.handleFileToggle({ id: 20, selected: true });

      expect(wrapper.emitted('toggle:file')[0][0]).toEqual({ id: 20, selected: true });
    });

    it('provides initial selections from props', async () => {
      const wrapper = renderComponent({ selectedScreens: [11], selectedFiles: [200] });
      await setDataSources(wrapper);

      expect(wrapper.vm.getNestedSelection('screen', dataSourcesFixture[0].id)).toEqual([]);
      expect(wrapper.vm.getNestedSelection('file', dataSourcesFixture[0].id)).toEqual([]);
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
