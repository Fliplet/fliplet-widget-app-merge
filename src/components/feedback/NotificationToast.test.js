const { shallowMount } = require('@vue/test-utils');
const NotificationToast = require('./NotificationToast.vue').default;

const createIconStub = (name) => ({
  name,
  template: '<svg />'
});

const TeleportStub = {
  name: 'Teleport',
  template: '<div><slot /></div>'
};

const renderComponent = (props = {}) => {
  return shallowMount(NotificationToast, {
    propsData: props,
    global: {
      stubs: {
        CheckCircle2: createIconStub('CheckCircle2'),
        AlertCircle: createIconStub('AlertCircle'),
        AlertTriangle: createIconStub('AlertTriangle'),
        Info: createIconStub('Info'),
        X: createIconStub('X'),
        Teleport: TeleportStub
      }
    }
  });
};

describe('NotificationToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('visibility', () => {
    it('renders when show prop is true', () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test message',
        show: true
      });

      expect(wrapper.find('[data-testid="notification-toast"]').exists()).toBe(true);
    });

    it('does not render when show prop is false', () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test message',
        show: false
      });

      expect(wrapper.find('[data-testid="notification-toast"]').exists()).toBe(false);
    });
  });

  describe('toast types', () => {
    it('renders success toast with correct styling', () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Success message',
        show: true
      });

      const toast = wrapper.find('[data-testid="notification-toast"]');
      expect(toast.classes()).toContain('bg-success/10');
      expect(toast.classes()).toContain('border-success/20');
    });

    it('renders warning toast with correct styling', () => {
      const wrapper = renderComponent({
        type: 'warning',
        message: 'Warning message',
        show: true
      });

      const toast = wrapper.find('[data-testid="notification-toast"]');
      expect(toast.classes()).toContain('bg-warning/10');
      expect(toast.classes()).toContain('border-warning/20');
    });

    it('renders error toast with correct styling', () => {
      const wrapper = renderComponent({
        type: 'error',
        message: 'Error message',
        show: true
      });

      const toast = wrapper.find('[data-testid="notification-toast"]');
      expect(toast.classes()).toContain('bg-error/10');
      expect(toast.classes()).toContain('border-error/20');
    });

    it('renders info toast with correct styling', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Info message',
        show: true
      });

      const toast = wrapper.find('[data-testid="notification-toast"]');
      expect(toast.classes()).toContain('bg-primary/10');
      expect(toast.classes()).toContain('border-primary/20');
    });
  });

  describe('icons', () => {
    it('renders CheckCircle2 icon for success type', () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Success',
        show: true
      });

      const CheckCircle2Stub = createIconStub('CheckCircle2');
      expect(wrapper.findComponent(CheckCircle2Stub).exists()).toBe(true);
    });

    it('renders AlertTriangle icon for warning type', () => {
      const wrapper = renderComponent({
        type: 'warning',
        message: 'Warning',
        show: true
      });

      const AlertTriangleStub = createIconStub('AlertTriangle');
      expect(wrapper.findComponent(AlertTriangleStub).exists()).toBe(true);
    });

    it('renders AlertCircle icon for error type', () => {
      const wrapper = renderComponent({
        type: 'error',
        message: 'Error',
        show: true
      });

      const AlertCircleStub = createIconStub('AlertCircle');
      expect(wrapper.findComponent(AlertCircleStub).exists()).toBe(true);
    });

    it('renders Info icon for info type', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Info',
        show: true
      });

      const InfoStub = createIconStub('Info');
      expect(wrapper.findComponent(InfoStub).exists()).toBe(true);
    });
  });

  describe('message display', () => {
    it('displays the provided message', () => {
      const message = 'This is a test message';
      const wrapper = renderComponent({
        type: 'success',
        message,
        show: true
      });

      expect(wrapper.text()).toContain(message);
    });
  });

  describe('close button', () => {
    it('renders close button', () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test',
        show: true
      });

      expect(wrapper.find('[data-testid="toast-close-button"]').exists()).toBe(true);
    });

    it('emits close event when close button clicked', async () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test',
        show: true
      });

      await wrapper.find('[data-testid="toast-close-button"]').trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('auto-dismiss', () => {
    it('auto-dismisses after duration', async () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test',
        show: true,
        duration: 3000
      });

      jest.advanceTimersByTime(3000);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('does not auto-dismiss when duration is 0', async () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test',
        show: true,
        duration: 0
      });

      jest.advanceTimersByTime(10000);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('close')).toBeFalsy();
    });

    it('uses default duration of 5000ms', () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test',
        show: true
      });

      expect(wrapper.vm.duration).toBe(5000);
    });

    it('clears timeout on manual close', async () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test',
        show: true,
        duration: 5000
      });

      await wrapper.find('[data-testid="toast-close-button"]').trigger('click');

      jest.advanceTimersByTime(5000);
      await wrapper.vm.$nextTick();

      // Should only emit once (from manual close)
      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('clears timeout on unmount', () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test',
        show: true,
        duration: 5000
      });

      wrapper.unmount();

      expect(wrapper.vm.timeoutId).toBeNull();
    });

    it('starts auto-dismiss when show changes to true', async () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test',
        show: false,
        duration: 3000
      });

      await wrapper.setProps({ show: true });
      await wrapper.vm.$nextTick();

      jest.advanceTimersByTime(3000);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('prop validation', () => {
    it('validates type prop correctly', () => {
      const validator = NotificationToast.props.type.validator;

      expect(validator('success')).toBe(true);
      expect(validator('warning')).toBe(true);
      expect(validator('error')).toBe(true);
      expect(validator('info')).toBe(true);
      expect(validator('invalid-type')).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('sets role="alert" on toast', () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test',
        show: true
      });

      const toast = wrapper.find('[data-testid="notification-toast"]');
      expect(toast.attributes('role')).toBe('alert');
    });

    it('sets aria-label on close button', () => {
      const wrapper = renderComponent({
        type: 'success',
        message: 'Test',
        show: true
      });

      const closeButton = wrapper.find('[data-testid="toast-close-button"]');
      expect(closeButton.attributes('aria-label')).toBe('Close notification');
    });
  });
});
