const { shallowMount } = require('@vue/test-utils');
const FlipletTableWrapper = require('./FlipletTableWrapper.vue').default;

const Loader2Stub = {
  name: 'Loader2',
  template: '<svg />'
};

// Mock Fliplet.UI.Table matching actual API
class MockFlipletTable {
  constructor(options) {
    this.options = options;
    this.data = options.data || [];
    this.selection = [];
    this.destroyed = false;
    this._events = {};
  }

  on(eventName, handler) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(handler);
  }

  off(eventName, handler) {
    if (!this._events[eventName]) {
      return;
    }
    const index = this._events[eventName].indexOf(handler);
    if (index > -1) {
      this._events[eventName].splice(index, 1);
    }
  }

  fire(eventName, detail) {
    if (!this._events[eventName]) {
      return;
    }
    this._events[eventName].forEach(function(handler) {
      handler(detail);
    });
  }

  setData(data) {
    this.data = data;
  }

  destroy() {
    this.destroyed = true;
  }

  deselectAll() {
    this.selection = [];
    this.fire('selection:change', {
      selected: [],
      deselected: [],
      source: 'api'
    });
  }

  selectRow(rowData) {
    const row = this.data.find(r => r.id === rowData.id);
    if (row && this.selection.indexOf(row) === -1) {
      this.selection.push(row);
      this.fire('selection:change', {
        selected: this.selection,
        deselected: [],
        source: 'api'
      });
    }
  }

  deselectRow(rowData) {
    const row = this.data.find(r => r.id === rowData.id);
    const index = this.selection.indexOf(row);
    if (index > -1) {
      this.selection.splice(index, 1);
      this.fire('selection:change', {
        selected: this.selection,
        deselected: [row],
        source: 'api'
      });
    }
  }

  selectAll() {
    this.selection = this.data.slice();
    this.fire('selection:change', {
      selected: this.selection,
      deselected: [],
      source: 'api'
    });
  }

  getSelectedRows() {
    return this.selection;
  }

  getCurrentPageData() {
    return this.data;
  }

  renderBody() {
    // Simulate re-render
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
    // Columns are mapped from key/title to field/name
    expect(wrapper.vm.flipletTable.options.columns[0].field).toBe('name');
    expect(wrapper.vm.flipletTable.options.columns[0].name).toBe('Name');
    expect(wrapper.vm.flipletTable.options.data).toEqual(sampleData);
  });

  it('passes searchable option to Fliplet table', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      searchable: true
    });

    expect(wrapper.vm.flipletTable.options.searchable).toBe(true);
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

    expect(wrapper.vm.flipletTable.options.selection).toEqual({
      enabled: true,
      multiple: true,
      rowClickEnabled: true
    });
  });

  it('emits selection:change event when Fliplet table selection changes', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      selection: 'multiple'
    });

    const selectedRows = [{ id: 1, name: 'Item 1' }];
    // Fliplet.UI.Table passes { selected, deselected, source }
    wrapper.vm.handleSelectionChange({
      selected: selectedRows,
      deselected: [],
      source: 'row-click'
    });

    expect(wrapper.emitted('selection:change')).toBeTruthy();
    expect(wrapper.emitted('selection:change')[0]).toEqual([selectedRows]);
  });

  it('emits search event when search query changes', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      searchable: true
    });

    // Fliplet.UI.Table passes { term, data }
    wrapper.vm.handleSearch({
      term: 'test query',
      data: sampleData
    });

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
    // Fliplet.UI.Table passes { row, rowEl, contentEl }
    wrapper.vm.handleExpandComplete({
      row,
      rowEl: document.createElement('div'),
      contentEl: document.createElement('div')
    });

    expect(wrapper.emitted('expand')).toBeTruthy();
    expect(wrapper.emitted('expand')[0][0].row).toEqual(row);
    expect(wrapper.emitted('expand')[0][0].isExpanded).toBe(true);
  });

  it('emits expand event with isExpanded false when row is collapsed', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      expandable: true
    });

    const row = { id: 1, name: 'Item 1' };
    // Fliplet.UI.Table passes { row, rowEl }
    wrapper.vm.handleCollapseComplete({
      row,
      rowEl: document.createElement('div')
    });

    expect(wrapper.emitted('expand')).toBeTruthy();
    expect(wrapper.emitted('expand')[0][0].row).toEqual(row);
    expect(wrapper.emitted('expand')[0][0].isExpanded).toBe(false);
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
    expect(tableInstance.destroyed).toBe(false);

    wrapper.unmount();

    expect(tableInstance.destroyed).toBe(true);
  });

  it('provides clearSelection method', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      selection: 'multiple'
    });

    // Trigger selection through the mock API
    wrapper.vm.flipletTable.selectRow({ id: 1 });
    expect(wrapper.vm.selectedRows.length).toBeGreaterThan(0);

    wrapper.vm.clearSelection();

    expect(wrapper.vm.selectedRows).toEqual([]);
  });

  it('provides getSelectedRows method', () => {
    const wrapper = renderComponent({
      columns: sampleColumns,
      data: sampleData,
      selection: 'multiple'
    });

    // Trigger selection through the mock API
    wrapper.vm.flipletTable.selectRow({ id: 1 });

    expect(wrapper.vm.getSelectedRows()).toEqual([{ id: 1, name: 'Item 1' }]);
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
