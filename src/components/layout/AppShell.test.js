const { shallowMount } = require('@vue/test-utils');
const AppShell = require('./AppShell.vue').default;

const LayersStub = {
  name: 'Layers',
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
  describe('rendering', () => {
    it('renders the app shell container', () => {
      const wrapper = renderComponent();

      expect(wrapper.find('[data-testid="app-shell-container"]').exists()).toBe(true);
    });

    it('renders the provided title', () => {
      const wrapper = renderComponent({ title: 'Merge title' });

      expect(wrapper.get('[data-testid="app-shell-title"]').text()).toBe('Merge title');
    });

    it('renders content slot', () => {
      const wrapper = renderComponent({}, { default: '<div data-testid="slot-content" />' });

      expect(wrapper.get('[data-testid="slot-content"]').exists()).toBe(true);
    });
  });

  describe('progress indicator', () => {
    it('shows progress indicator when showProgress is true', () => {
      const wrapper = renderComponent({ showProgress: true, currentStep: 2, totalSteps: 4 });

      expect(wrapper.get('[data-testid="app-shell-progress"]').exists()).toBe(true);
      expect(wrapper.get('[data-testid="app-shell-progress-label"]').text()).toBe('Step 2 of 4');
    });

    it('hides progress indicator when showProgress is false', () => {
      const wrapper = renderComponent({ showProgress: false });

      expect(wrapper.find('[data-testid="app-shell-progress"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="app-shell-progress-label"]').exists()).toBe(false);
    });

    it('calculates progress width correctly', () => {
      const wrapper = renderComponent({ showProgress: true, currentStep: 2, totalSteps: 4 });

      expect(wrapper.vm.progressWidth).toBe('50%');
    });

    it('shows 0% progress width when showProgress is false', () => {
      const wrapper = renderComponent({ showProgress: false, currentStep: 2, totalSteps: 4 });

      expect(wrapper.vm.progressWidth).toBe('0%');
    });

    it('shows 100% progress width when at final step', () => {
      const wrapper = renderComponent({ showProgress: true, currentStep: 4, totalSteps: 4 });

      expect(wrapper.vm.progressWidth).toBe('100%');
    });

    it('handles invalid totalSteps gracefully', () => {
      const wrapper = renderComponent({ showProgress: true, currentStep: 2, totalSteps: 0 });

      expect(wrapper.vm.progressWidth).toBe('0%');
    });
  });

  describe('actions footer', () => {
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
});

