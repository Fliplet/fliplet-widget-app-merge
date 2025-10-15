const { shallowMount } = require('@vue/test-utils');
const WarningBanner = require('./WarningBanner.vue').default;

const createIconStub = (name) => ({
  name,
  template: '<svg />'
});

const renderComponent = (props = {}) => {
  return shallowMount(WarningBanner, {
    propsData: props,
    global: {
      stubs: {
        AlertTriangle: createIconStub('AlertTriangle'),
        AlertCircle: createIconStub('AlertCircle'),
        Info: createIconStub('Info'),
        X: createIconStub('X')
      }
    }
  });
};

describe('WarningBanner', () => {
  describe('banner types', () => {
    it('renders info banner with correct styling', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Information message'
      });

      const banner = wrapper.find('[data-testid="warning-banner-info"]');
      expect(banner.exists()).toBe(true);
      expect(banner.classes()).toContain('border-primary');
      expect(banner.classes()).toContain('bg-primary/10');
    });

    it('renders warning banner with correct styling', () => {
      const wrapper = renderComponent({
        type: 'warning',
        message: 'Warning message'
      });

      const banner = wrapper.find('[data-testid="warning-banner-warning"]');
      expect(banner.exists()).toBe(true);
      expect(banner.classes()).toContain('border-warning');
      expect(banner.classes()).toContain('bg-warning/10');
    });

    it('renders error banner with correct styling', () => {
      const wrapper = renderComponent({
        type: 'error',
        message: 'Error message'
      });

      const banner = wrapper.find('[data-testid="warning-banner-error"]');
      expect(banner.exists()).toBe(true);
      expect(banner.classes()).toContain('border-error');
      expect(banner.classes()).toContain('bg-error/10');
    });
  });

  describe('icons', () => {
    it('renders Info icon for info type', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Info'
      });

      const InfoStub = createIconStub('Info');
      expect(wrapper.findComponent(InfoStub).exists()).toBe(true);
    });

    it('renders AlertTriangle icon for warning type', () => {
      const wrapper = renderComponent({
        type: 'warning',
        message: 'Warning'
      });

      const AlertTriangleStub = createIconStub('AlertTriangle');
      expect(wrapper.findComponent(AlertTriangleStub).exists()).toBe(true);
    });

    it('renders AlertCircle icon for error type', () => {
      const wrapper = renderComponent({
        type: 'error',
        message: 'Error'
      });

      const AlertCircleStub = createIconStub('AlertCircle');
      expect(wrapper.findComponent(AlertCircleStub).exists()).toBe(true);
    });
  });

  describe('message display', () => {
    it('displays the provided message', () => {
      const message = 'This is a test banner message';
      const wrapper = renderComponent({
        type: 'info',
        message
      });

      expect(wrapper.text()).toContain(message);
    });
  });

  describe('dismiss button', () => {
    it('shows dismiss button when dismissable is true', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test',
        dismissable: true
      });

      expect(wrapper.find('[data-testid="banner-dismiss-button"]').exists()).toBe(true);
    });

    it('hides dismiss button when dismissable is false', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test',
        dismissable: false
      });

      expect(wrapper.find('[data-testid="banner-dismiss-button"]').exists()).toBe(false);
    });

    it('emits dismiss event when dismiss button clicked', async () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test',
        dismissable: true
      });

      await wrapper.find('[data-testid="banner-dismiss-button"]').trigger('click');

      expect(wrapper.emitted('dismiss')).toBeTruthy();
    });

    it('sets aria-label on dismiss button', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test',
        dismissable: true
      });

      const dismissButton = wrapper.find('[data-testid="banner-dismiss-button"]');
      expect(dismissButton.attributes('aria-label')).toBe('Dismiss banner');
    });
  });

  describe('action button', () => {
    it('shows action button when actionLabel is provided', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test',
        actionLabel: 'View details'
      });

      expect(wrapper.find('[data-testid="banner-action-button"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="banner-action-button"]').text()).toBe('View details');
    });

    it('hides action button when actionLabel is not provided', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test'
      });

      expect(wrapper.find('[data-testid="banner-action-button"]').exists()).toBe(false);
    });

    it('emits action event when action button clicked', async () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test',
        actionLabel: 'Take action'
      });

      await wrapper.find('[data-testid="banner-action-button"]').trigger('click');

      expect(wrapper.emitted('action')).toBeTruthy();
    });
  });

  describe('prop validation', () => {
    it('validates type prop correctly', () => {
      const validator = WarningBanner.props.type.validator;

      expect(validator('info')).toBe(true);
      expect(validator('warning')).toBe(true);
      expect(validator('error')).toBe(true);
      expect(validator('invalid-type')).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('sets role="alert" on banner', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test'
      });

      const banner = wrapper.find('[data-testid="warning-banner-info"]');
      expect(banner.attributes('role')).toBe('alert');
    });

    it('sets aria-hidden on icons', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test'
      });

      const icon = wrapper.find('.h-5');
      expect(icon.attributes('aria-hidden')).toBe('true');
    });
  });

  describe('default props', () => {
    it('uses default dismissable of false', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test'
      });

      expect(wrapper.vm.dismissable).toBe(false);
    });

    it('uses default actionLabel of null', () => {
      const wrapper = renderComponent({
        type: 'info',
        message: 'Test'
      });

      expect(wrapper.vm.actionLabel).toBeNull();
    });
  });

  describe('combined features', () => {
    it('can show both dismiss and action buttons', () => {
      const wrapper = renderComponent({
        type: 'warning',
        message: 'Test message',
        dismissable: true,
        actionLabel: 'Fix now'
      });

      expect(wrapper.find('[data-testid="banner-dismiss-button"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="banner-action-button"]').exists()).toBe(true);
    });
  });
});
