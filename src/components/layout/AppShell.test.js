 const { shallowMount } = require('@vue/test-utils');
const AppShell = require('./AppShell.vue').default;

const LayersStub = {
  name: 'LayersIcon',
  template: '<svg />'
};

const renderComponent = (props = {}, slots = {}) => {
  return shallowMount(AppShell, {
    propsData: props,
    slots,
    global: {
      stubs: {
        Layers: LayersStub
      }
    }
  });
};

describe('AppShell', () => {
  it('renders the provided title', () => {
    const wrapper = renderComponent({ title: 'Merge title' });

    expect(wrapper.get('[data-testid="app-shell-title"]').text()).toBe('Merge title');
  });

  it('shows progress indicator when showProgress is true', () => {
    const wrapper = renderComponent({ showProgress: true, currentStep: 2, totalSteps: 4 });

    expect(wrapper.get('[data-testid="app-shell-progress"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="app-shell-progress-label"]').text()).toBe('Step 2 of 4');
  });

  it('hides progress indicator when showProgress is false', () => {
    const wrapper = renderComponent({ showProgress: false });

    expect(wrapper.find('[data-testid="app-shell-progress"]').exists()).toBe(false);
  });

  it('renders content slot', () => {
    const wrapper = renderComponent({}, { default: '<div data-testid="slot-content" />' });

    expect(wrapper.get('[data-testid="slot-content"]').exists()).toBe(true);
  });

  it('renders actions slot when provided', () => {
    const wrapper = renderComponent({}, { actions: '<button data-testid="action-btn" />' });

    expect(wrapper.get('[data-testid="action-btn"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="app-shell-actions"]').exists()).toBe(true);
  });

  it('does not render footer when no actions slot provided', () => {
    const wrapper = renderComponent();

    expect(wrapper.find('[data-testid="app-shell-actions"]').exists()).toBe(false);
  });
});

