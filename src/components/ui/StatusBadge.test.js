const { shallowMount } = require('@vue/test-utils');
const StatusBadge = require('./StatusBadge.vue').default;

const createStub = (name) => ({
  name,
  template: '<svg />'
});

const stubs = {
  CheckCircle2: createStub('CheckCircle2'),
  AlertCircle: createStub('AlertCircle'),
  Clock: createStub('Clock'),
  Copy: createStub('Copy'),
  RefreshCw: createStub('RefreshCw')
};

const renderComponent = (props = {}) => {
  return shallowMount(StatusBadge, {
    propsData: {
      status: 'copy',
      ...props
    },
    global: {
      stubs
    }
  });
};

describe('StatusBadge', () => {
  describe('rendering', () => {
    it('renders label when provided', () => {
      const wrapper = renderComponent({ label: 'Custom Label' });

      expect(wrapper.text()).toContain('Custom Label');
    });

    it('uses default label when custom label not provided', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Copy');
    });

    it('applies success styling for copy status', () => {
      const wrapper = renderComponent();

      expect(wrapper.attributes('class')).toContain('bg-success/10');
      expect(wrapper.attributes('class')).toContain('text-success');
    });

    it('applies warning styling for overwrite status', () => {
      const wrapper = renderComponent({ status: 'overwrite' });

      expect(wrapper.attributes('class')).toContain('bg-warning/10');
      expect(wrapper.attributes('class')).toContain('text-warning');
    });
  });

  describe('icons', () => {
    it('renders Copy icon for copy status', () => {
      const wrapper = renderComponent();

      expect(wrapper.findComponent({ name: 'Copy' }).exists()).toBe(true);
    });

    it('renders RefreshCw icon for overwrite status', () => {
      const wrapper = renderComponent({ status: 'overwrite' });

      expect(wrapper.findComponent({ name: 'RefreshCw' }).exists()).toBe(true);
    });

    it('renders CheckCircle2 icon for success status', () => {
      const wrapper = renderComponent({ status: 'success' });

      expect(wrapper.findComponent({ name: 'CheckCircle2' }).exists()).toBe(true);
    });

    it('renders AlertCircle icon for error status', () => {
      const wrapper = renderComponent({ status: 'error' });

      expect(wrapper.findComponent({ name: 'AlertCircle' }).exists()).toBe(true);
    });

    it('renders Clock icon for in-progress status', () => {
      const wrapper = renderComponent({ status: 'in-progress' });

      expect(wrapper.findComponent({ name: 'Clock' }).exists()).toBe(true);
    });
  });

  describe('validator', () => {
    it('accepts valid statuses', () => {
      const { validator } = StatusBadge.props.status;

      expect(validator('copy')).toBe(true);
      expect(validator('overwrite')).toBe(true);
      expect(validator('success')).toBe(true);
      expect(validator('error')).toBe(true);
      expect(validator('in-progress')).toBe(true);
    });

    it('rejects invalid statuses', () => {
      const { validator } = StatusBadge.props.status;

      expect(validator('invalid')).toBe(false);
      expect(validator('pending')).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('sets aria-hidden on icons', () => {
      const wrapper = renderComponent({ status: 'copy' });
      const icon = wrapper.find('.h-3\\.5');

      expect(icon.attributes('aria-hidden')).toBe('true');
    });
  });
});
