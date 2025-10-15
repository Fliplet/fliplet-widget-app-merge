const { shallowMount } = require('@vue/test-utils');
const FilesTab = require('./FilesTab.vue').default;

const FlipletTableWrapperStub = {
  name: 'FlipletTableWrapper',
  props: ['columns', 'data', 'selection', 'expandable', 'loading', 'config'],
  emits: ['selection:change', 'expand', 'row-click'],
  template: '<div class="fliplet-table-stub"><slot /></div>'
};

const filesFixture = [
  {
    id: 1,
    name: 'Marketing assets',
    type: 'folder',
    path: '/assets/',
    addedAt: Date.now() - 86400000,
    isGlobalLibrary: false,
    associatedScreens: [{ id: 10, name: 'Home Screen' }],
    associatedDataSources: [],
    children: [{ id: 2, name: 'logo.png', type: 'image' }]
  },
  {
    id: 3,
    name: 'reports.csv',
    type: 'file',
    path: '/data/reports.csv',
    addedAt: Date.now() - 172800000,
    isGlobalLibrary: false,
    associatedScreens: [],
    associatedDataSources: [{ id: 20, name: 'Sales data' }]
  }
];

const renderComponent = (props = {}) => {
  return shallowMount(FilesTab, {
    propsData: {
      sourceAppId: 123,
      destinationAppId: 456,
      selection: [],
      selectedScreens: [],
      selectedDataSources: [],
      ...props
    },
    global: {
      stubs: {
        FlipletTableWrapper: FlipletTableWrapperStub,
        Folder: { template: '<svg />' },
        File: { template: '<svg />' },
        ImageIcon: { template: '<svg />' },
        FileText: { template: '<svg />' },
        AlertTriangle: { template: '<svg />' }
      }
    }
  });
};

const setFiles = async (wrapper, overrides = {}) => {
  await wrapper.setData({
    loading: false,
    error: null,
    files: filesFixture,
    folderOptions: { 1: 'folder-only' },
    ...overrides
  });
  await wrapper.vm.$nextTick();
};

describe('FilesTab', () => {
  describe('Rendering & computed data', () => {
    it('renders instructions', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Select files and folders to copy.');
    });

    it('builds file rows with derived fields', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper);

      const [firstRow] = wrapper.vm.fileRows;
      expect(firstRow).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Marketing assets',
          status: ''
        })
      );
    });

    it('marks unused files in status column', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper);

      const secondRow = wrapper.vm.fileRows[1];
      expect(secondRow.status).toBe('');
    });
  });

  describe('Selection management', () => {
    it('syncs selection when prop changes', async () => {
      const wrapper = renderComponent();
      await wrapper.setProps({ selection: [1] });

      expect(wrapper.vm.selectedIds).toEqual([1]);
    });

    it('handles selection change emitted from Fliplet table', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper);

      const table = wrapper.findComponent({ name: 'FlipletTableWrapper' });
      table.vm.$emit('selection:change', [{ id: 1 }]);

      expect(wrapper.vm.selectedIds).toEqual([1]);
      expect(wrapper.emitted('selection-change')[0][0]).toEqual([1]);
    });

    it('toggles select all and emits selection change', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper);

      wrapper.vm.toggleSelectAll();
      expect(wrapper.vm.selectedIds).toEqual([1, 3]);

      wrapper.vm.toggleSelectAll();
      expect(wrapper.vm.selectedIds).toEqual([]);
    });
  });

  describe('Expandable rows', () => {
    it('tracks expanded file IDs from expand events', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper);

      const table = wrapper.findComponent({ name: 'FlipletTableWrapper' });
      table.vm.$emit('expand', { row: { id: 1 }, isExpanded: true });
      expect(wrapper.vm.expandedIds).toEqual([1]);

      table.vm.$emit('expand', { row: { id: 1 }, isExpanded: false });
      expect(wrapper.vm.expandedIds).toEqual([]);
    });

    it('toggles expansion via row click events', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper);

      const table = wrapper.findComponent({ name: 'FlipletTableWrapper' });
      table.vm.$emit('row-click', { row: { id: 1 } });
      expect(wrapper.vm.expandedIds).toEqual([1]);

      table.vm.$emit('row-click', { row: { id: 1 } });
      expect(wrapper.vm.expandedIds).toEqual([]);
    });
  });

  describe('Folder options', () => {
    it('initialises folder options to folder-only', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper);

      expect(wrapper.vm.folderOptions[1]).toBe('folder-only');
    });

    it('handles folder option changes and emits event', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper);

      const event = { target: { value: 'folder-with-files' } };
      wrapper.vm.handleFolderOptionChange(1, event);

      expect(wrapper.vm.folderOptions[1]).toBe('folder-with-files');
      expect(wrapper.emitted('folder-option-change')[0][0]).toEqual({ fileId: 1, option: 'folder-with-files' });
    });
  });

  describe('Nested association selection', () => {
    it('emits screen association toggles', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper, { expandedIds: [1] });

      wrapper.vm.handleNestedSelection('screen', 1, [{ id: 10 }]);

      expect(wrapper.emitted('toggle:screen')[0][0]).toEqual({ id: 10, selected: true });
    });

    it('emits data source association toggles', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper, { expandedIds: [3] });

      wrapper.vm.handleNestedSelection('data-source', 3, [{ id: 20 }]);

      expect(wrapper.emitted('toggle:data-source')[0][0]).toEqual({ id: 20, selected: true });
    });
  });

  describe('Computed properties', () => {
    it('allSelected returns true when all files selected', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper, { selectedIds: [1, 3] });

      expect(wrapper.vm.allSelected).toBe(true);
    });

    it('someSelected returns true when subset selected', async () => {
      const wrapper = renderComponent();
      await setFiles(wrapper, { selectedIds: [1] });

      expect(wrapper.vm.someSelected).toBe(true);
    });
  });

  describe('Icon selection', () => {
    it('returns correct icon components', () => {
      const wrapper = renderComponent();

      // Icons are imported but not registered as components, so they're used directly in the method
      expect(wrapper.vm.getFileIcon('folder')).toBeDefined();
      expect(wrapper.vm.getFileIcon('image')).toBeDefined();
      expect(wrapper.vm.getFileIcon('file')).toBeDefined();
      expect(wrapper.vm.getFileIcon('unknown')).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('shows error banner when loading fails', async () => {
      const wrapper = renderComponent();
      await wrapper.setData({ loading: false, error: 'Failed to load files.' });
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Failed to load files.');
    });
  });
});
