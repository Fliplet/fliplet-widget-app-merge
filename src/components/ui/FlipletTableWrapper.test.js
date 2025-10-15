const { shallowMount } = require('@vue/test-utils');
const FlipletTableWrapper = require('./FlipletTableWrapper.vue').default;

const Loader2Stub = {
  name: 'Loader2',
  template: '<svg />'
};

// Mock Fliplet.UI.Table
class MockFlipletTable {
  constructor(element, options) {
    this.element = element;
    this.options = options;
    this.data = options.data || [];
    this.destroyed = false;
  }

  setData(data) {
    this.data = data;
  }

  destroy() {
    this.destroyed = true;
  }

  clearSelection() {
    if (this.options.onSelectionChange) {
      this.options.onSelectionChange([]);
    }
  }

  selectRow(index) {
    // Simulate row selection
  }

  deselectRow(index) {
    // Simulate row deselection
  }

  refresh() {
    // Simulate refresh
  }
}

const renderComponent = (props = {}) => {
  return shallowMount(FlipletTableWrapper, {
    propsData: props,
    global: {
      stubs: {
        Loader2: Loader2Stub
      }
    }
  });
};

describe('FlipletTableWrapper', () => {
  const sampleColumns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'id', title: 'ID', sortable: false }
  ];

  const sampleData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ];

  beforeEach(() => {
    // Set up mock Fliplet.UI.Table
    global.window = {
      Fliplet: {
        UI: {
          Table: MockFlipletTable
        }
      }
    };
  });

  afterEach(() => {
    delete global.window;
  });

  it('renders loading state when loading prop is true', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      loading: true
    });

    expect(wrapper.find('[data-testid="fliplet-table-wrapper"]').exists()).toBe(true);
    expect(wrapper.findComponent(Loader2Stub).exists()).toBe(true);
  });

  it('hides loading state when loading is false', async () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      loading: false
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(Loader2Stub).exists()).toBe(false);
  });

  it('passes columns and data to Fliplet.UI.Table', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData
    });

    expect(wrapper.vm.flipletTable).toBeDefined();
    expect(wrapper.vm.flipletTable.options.columns).toHaveLength(2);
    expect(wrapper.vm.flipletTable.options.data).toEqual(sampleData);
  });

  it('passes search option to Fliplet table', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      searchable: true
    });

    expect(wrapper.vm.flipletTable.options.search).toBe(true);
  });

  it('passes pagination option to Fliplet table', () => {
    const paginationConfig = { pageSize: 10, showPageSizeSelector: true };
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      pagination: paginationConfig
    });

    expect(wrapper.vm.flipletTable.options.pagination).toEqual(paginationConfig);
  });

  it('passes selection option to Fliplet table', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      selection: 'multiple'
    });

    expect(wrapper.vm.flipletTable.options.selection).toBe('multiple');
  });

  it('emits selection:change event when Fliplet table selection changes', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      selection: 'multiple'
    });

    const selectedRows = [{ id: 1, name: 'Item 1' }];
    wrapper.vm.handleSelectionChange(selectedRows);

    expect(wrapper.emitted('selection:change')).toBeTruthy();
    expect(wrapper.emitted('selection:change')[0]).toEqual([selectedRows]);
  });

  it('emits row-click event when row is clicked', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData
    });

    const row = { id: 1, name: 'Item 1' };
    const event = new Event('click');
    wrapper.vm.handleRowClick(row, 0, event);

    expect(wrapper.emitted('row-click')).toBeTruthy();
    expect(wrapper.emitted('row-click')[0][0].row).toEqual(row);
    expect(wrapper.emitted('row-click')[0][0].index).toBe(0);
  });

  it('emits sort:change event when column is sorted', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData
    });

    wrapper.vm.handleSort('name', 'asc');

    expect(wrapper.emitted('sort:change')).toBeTruthy();
    expect(wrapper.emitted('sort:change')[0]).toEqual([{ column: 'name', direction: 'asc' }]);
  });

  it('emits pagination:change event when page changes', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      pagination: { pageSize: 10 }
    });

    wrapper.vm.handlePaginationChange(2, 10);

    expect(wrapper.emitted('pagination:change')).toBeTruthy();
    expect(wrapper.emitted('pagination:change')[0]).toEqual([{ page: 2, pageSize: 10 }]);
  });

  it('emits search event when search query changes', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      searchable: true
    });

    wrapper.vm.handleSearch('test query');

    expect(wrapper.emitted('search')).toBeTruthy();
    expect(wrapper.emitted('search')[0]).toEqual(['test query']);
  });

  it('emits expand event when row is expanded', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      expandable: true
    });

    const row = { id: 1, name: 'Item 1' };
    wrapper.vm.handleExpand(row, 0, true);

    expect(wrapper.emitted('expand')).toBeTruthy();
    expect(wrapper.emitted('expand')[0]).toEqual([{ row, index: 0, isExpanded: true }]);
  });

  it('emits expand event with isExpanded false when row is collapsed', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      expandable: true
    });

    const row = { id: 1, name: 'Item 1' };
    wrapper.vm.handleExpand(row, 0, false);

    expect(wrapper.emitted('expand')).toBeTruthy();
    expect(wrapper.emitted('expand')[0]).toEqual([{ row, index: 0, isExpanded: false }]);
  });

  it('updates Fliplet table data when data prop changes', async () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData
    });

    const newData = [{ id: 4, name: 'Item 4' }];
    await wrapper.setProps({ data: newData });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.flipletTable.data).toEqual(newData);
  });

  it('destroys Fliplet table instance on unmount', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData
    });

    const tableInstance = wrapper.vm.flipletTable;
    wrapper.unmount();

    expect(tableInstance.destroyed).toBe(true);
  });

  it('provides clearSelection method', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      selection: 'multiple'
    });

    wrapper.vm.handleSelectionChange([{ id: 1 }]);
    wrapper.vm.clearSelection();

    expect(wrapper.vm.selectedRows).toEqual([]);
  });

  it('provides getSelectedRows method', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      selection: 'multiple'
    });

    const selectedRows = [{ id: 1, name: 'Item 1' }];
    wrapper.vm.handleSelectionChange(selectedRows);

    expect(wrapper.vm.getSelectedRows()).toEqual(selectedRows);
  });

  it('applies custom container classes', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      containerClasses: 'custom-class-1 custom-class-2'
    });

    const container = wrapper.find('[data-testid="fliplet-table-wrapper"]');
    expect(container.classes()).toContain('custom-class-1');
    expect(container.classes()).toContain('custom-class-2');
  });

  it('reinitializes table when columns change', async () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData
    });

    const firstInstance = wrapper.vm.flipletTable;

    const newColumns = [
      { key: 'name', title: 'Name' },
      { key: 'description', title: 'Description' }
    ];

    await wrapper.setProps({ columns: newColumns });
    await wrapper.vm.$nextTick();

    expect(firstInstance.destroyed).toBe(true);
    expect(wrapper.vm.flipletTable).not.toBe(firstInstance);
  });
});
