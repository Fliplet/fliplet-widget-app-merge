const { shallowMount } = require('@vue/test-utils');
const StatusBadge = require('./StatusBadge.vue').default;

const createIconStub = (name) => ({
  name,
  template: '<svg />'
});

const renderComponent = (props = {}) => {
  return shallowMount(StatusBadge, {
    propsData: props,
    global: {
      stubs: {
        CheckCircle2: createIconStub('CheckCircle2'),
        AlertCircle: createIconStub('AlertCircle'),
        Clock: createIconStub('Clock'),
        Copy: createIconStub('Copy'),
        RefreshCw: createIconStub('RefreshCw')
      }
    }
  });
};

describe('StatusBadge', () => {
  describe('status variants', () => {
    it('renders copy status with correct styling', () => {
      const wrapper = renderComponent({ status: 'copy' });

      expect(wrapper.find('[data-testid="status-badge-copy"]').exists()).toBe(true);
      expect(wrapper.classes()).toContain('bg-success/10');
      expect(wrapper.classes()).toContain('text-success');
      expect(wrapper.text()).toBe('Copy');
    });

    it('renders overwrite status with correct styling', () => {
      const wrapper = renderComponent({ status: 'overwrite' });

      expect(wrapper.find('[data-testid="status-badge-overwrite"]').exists()).toBe(true);
      expect(wrapper.classes()).toContain('bg-warning/10');
      expect(wrapper.classes()).toContain('text-warning');
      expect(wrapper.text()).toBe('Overwrite');
    });

    it('renders conflict status with correct styling', () => {
      const wrapper = renderComponent({ status: 'conflict' });

      expect(wrapper.find('[data-testid="status-badge-conflict"]').exists()).toBe(true);
      expect(wrapper.classes()).toContain('bg-error/10');
      expect(wrapper.classes()).toContain('text-error');
      expect(wrapper.text()).toBe('Conflict');
    });

    it('renders success status with correct styling', () => {
      const wrapper = renderComponent({ status: 'success' });

      expect(wrapper.find('[data-testid="status-badge-success"]').exists()).toBe(true);
      expect(wrapper.classes()).toContain('bg-success/10');
      expect(wrapper.classes()).toContain('text-success');
      expect(wrapper.text()).toBe('Success');
    });

    it('renders error status with correct styling', () => {
      const wrapper = renderComponent({ status: 'error' });

      expect(wrapper.find('[data-testid="status-badge-error"]').exists()).toBe(true);
      expect(wrapper.classes()).toContain('bg-error/10');
      expect(wrapper.classes()).toContain('text-error');
      expect(wrapper.text()).toBe('Error');
    });

    it('renders in-progress status with correct styling', () => {
      const wrapper = renderComponent({ status: 'in-progress' });

      expect(wrapper.find('[data-testid="status-badge-in-progress"]').exists()).toBe(true);
      expect(wrapper.classes()).toContain('bg-primary/10');
      expect(wrapper.classes()).toContain('text-primary');
      expect(wrapper.text()).toBe('In Progress');
    });
  });

  describe('icons', () => {
    it('renders Copy icon for copy status', () => {
      const wrapper = renderComponent({ status: 'copy' });
      const CopyStub = createIconStub('Copy');

      expect(wrapper.findComponent(CopyStub).exists()).toBe(true);
    });

    it('renders RefreshCw icon for overwrite status', () => {
      const wrapper = renderComponent({ status: 'overwrite' });
      const RefreshCwStub = createIconStub('RefreshCw');

      expect(wrapper.findComponent(RefreshCwStub).exists()).toBe(true);
    });

    it('renders AlertCircle icon for conflict status', () => {
      const wrapper = renderComponent({ status: 'conflict' });
      const AlertCircleStub = createIconStub('AlertCircle');

      expect(wrapper.findComponent(AlertCircleStub).exists()).toBe(true);
    });

    it('renders CheckCircle2 icon for success status', () => {
      const wrapper = renderComponent({ status: 'success' });
      const CheckCircle2Stub = createIconStub('CheckCircle2');

      expect(wrapper.findComponent(CheckCircle2Stub).exists()).toBe(true);
    });

    it('renders AlertCircle icon for error status', () => {
      const wrapper = renderComponent({ status: 'error' });
      const AlertCircleStub = createIconStub('AlertCircle');

      expect(wrapper.findComponent(AlertCircleStub).exists()).toBe(true);
    });

    it('renders Clock icon for in-progress status', () => {
      const wrapper = renderComponent({ status: 'in-progress' });
      const ClockStub = createIconStub('Clock');

      expect(wrapper.findComponent(ClockStub).exists()).toBe(true);
    });
  });

  describe('custom labels', () => {
    it('displays custom label when provided', () => {
      const wrapper = renderComponent({
        status: 'copy',
        label: 'Will be copied'
      });

      expect(wrapper.text()).toBe('Will be copied');
    });

    it('displays default label when no custom label provided', () => {
      const wrapper = renderComponent({ status: 'overwrite' });

      expect(wrapper.text()).toBe('Overwrite');
    });

    it('prefers custom label over default', () => {
      const wrapper = renderComponent({
        status: 'conflict',
        label: 'Duplicate detected'
      });

      expect(wrapper.text()).toBe('Duplicate detected');
      expect(wrapper.text()).not.toBe('Conflict');
    });
  });

  describe('prop validation', () => {
    it('validates status prop correctly', () => {
      const validator = StatusBadge.props.status.validator;

      expect(validator('copy')).toBe(true);
      expect(validator('overwrite')).toBe(true);
      expect(validator('conflict')).toBe(true);
      expect(validator('success')).toBe(true);
      expect(validator('error')).toBe(true);
      expect(validator('in-progress')).toBe(true);
      expect(validator('invalid-status')).toBe(false);
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
