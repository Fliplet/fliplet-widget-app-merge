const { shallowMount } = require('@vue/test-utils');
const MergeDashboard = require('./MergeDashboard.vue').default;

const createIconStub = (name) => ({
  name,
  template: '<svg />'
});

const StatusBadgeStub = {
  name: 'StatusBadge',
  template: '<span />',
  props: ['status', 'label']
};

const WarningBannerStub = {
  name: 'WarningBanner',
  template: '<div />',
  props: ['type', 'message']
};

const baseStubConfig = {
  FileText: createIconStub('FileText'),
  ExternalLink: createIconStub('ExternalLink'),
  AlertCircle: createIconStub('AlertCircle'),
  Loader2: createIconStub('Loader2'),
  StatusBadge: StatusBadgeStub,
  WarningBanner: WarningBannerStub
};

const defaultAppDetails = {
  id: 123,
  name: 'Source App',
  organizationName: 'Acme Corp',
  organizationId: 1,
  isPublished: true,
  lastPublishedAt: Date.now() - 86400000,
  lastPublishedBy: 'John Smith',
  lockedUntil: null,
  lockOwner: null
};

const renderComponent = (overrides = {}) => {
  return shallowMount(MergeDashboard, {
    data() {
      return {
        loading: false,
        error: null,
        appDetails: { ...defaultAppDetails, ...overrides }
      };
    },
    global: {
      stubs: baseStubConfig
    }
  });
};

const renderLoadingComponent = () => {
  return shallowMount(MergeDashboard, {
    data() {
      return {
        loading: true,
        error: null,
        appDetails: null
      };
    },
    global: {
      stubs: baseStubConfig
    }
  });
};

describe('MergeDashboard', () => {
  describe('rendering', () => {
    it('displays app details when loading is complete', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Source App');
      expect(wrapper.text()).toContain('123');
      expect(wrapper.text()).toContain('Acme Corp');
    });

    it('displays loading state when loading is true', () => {
      const wrapper = renderLoadingComponent();

      expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true);
    });

    it('displays error message when error present', () => {
      const wrapper = shallowMount(MergeDashboard, {
        data() {
          return {
            loading: false,
            error: 'Failed to load',
            appDetails: null
          };
        },
        global: {
          stubs: baseStubConfig
        }
      });

      expect(wrapper.find('[data-testid="dashboard-error"]').exists()).toBe(true);
    });
  });

  describe('publish status', () => {
    it('renders status badge using StatusBadge component', () => {
      const wrapper = renderComponent();
      const badge = wrapper.findComponent(StatusBadgeStub);

      expect(badge.exists()).toBe(true);
      expect(badge.props('status')).toBe('success');
    });
  });

  describe('lock state', () => {
    it('shows lock warning when lockedUntil present', () => {
      const wrapper = renderComponent({ lockedUntil: Date.now() + 600000 });

      expect(wrapper.vm.isLocked).toBe(true);
      expect(wrapper.find('[data-testid="lock-warning"]').exists()).toBe(true);
    });

    it('hides lock warning when no lock present', () => {
      const wrapper = renderComponent({ lockedUntil: null });

      expect(wrapper.vm.isLocked).toBe(false);
      expect(wrapper.find('[data-testid="lock-warning"]').exists()).toBe(false);
    });
  });

  describe('configure merge button', () => {
    it('enables button when user has rights and app unlocked', () => {
      const wrapper = renderComponent({ lockedUntil: null });
      wrapper.setData({ hasPublisherRights: true });

      const button = wrapper.find('[data-testid="configure-merge-button"]');
      expect(button.attributes('disabled')).toBeUndefined();
    });

    it('disables button when app locked', () => {
      const wrapper = renderComponent({ lockedUntil: Date.now() + 600000 });
      wrapper.setData({ hasPublisherRights: true });

      const button = wrapper.find('[data-testid="configure-merge-button"]');
      expect(button.attributes('disabled')).toBeDefined();
    });

    it('disables button when user lacks publisher rights', async () => {
      const wrapper = renderComponent();
      await wrapper.vm.$nextTick();
      await wrapper.setData({ hasPublisherRights: false });

      const button = wrapper.find('[data-testid="configure-merge-button"]');
      expect(wrapper.vm.canConfigureMerge).toBe(false);
      expect(button.attributes('disabled')).toBeDefined();
    });

    it('emits configure-merge event on click', () => {
      const wrapper = renderComponent();
      wrapper.setData({ hasPublisherRights: true });

      wrapper.find('[data-testid="configure-merge-button"]').trigger('click');

      expect(wrapper.emitted('configure-merge')).toBeTruthy();
    });
  });

  describe('audit and cancel actions', () => {
    it('renders audit log button', () => {
      const wrapper = renderComponent();

      expect(wrapper.find('[data-testid="view-audit-log-button"]').exists()).toBe(true);
    });

    it('emits view-audit-log when audit log clicked', () => {
      const wrapper = renderComponent();

      wrapper.find('[data-testid="view-audit-log-button"]').trigger('click');

      expect(wrapper.emitted('view-audit-log')).toBeTruthy();
    });

    it('renders cancel button and emits cancel event', () => {
      const wrapper = renderComponent();

      const cancelButton = wrapper.find('[data-testid="cancel-button"]');
      expect(cancelButton.exists()).toBe(true);

      cancelButton.trigger('click');
      expect(wrapper.emitted('cancel')).toBeTruthy();
    });
  });

  describe('warning banners', () => {
    it('renders prerequisite banners using WarningBanner component', () => {
      const wrapper = renderComponent();

      const banners = wrapper.findAllComponents(WarningBannerStub);
      expect(banners.length).toBeGreaterThan(0);
    });
  });

  describe('computed properties', () => {
    it('computes canConfigureMerge based on rights and lock state', () => {
      const wrapper = renderComponent({ lockedUntil: null });

      wrapper.setData({ hasPublisherRights: true });
      expect(wrapper.vm.canConfigureMerge).toBe(true);

      wrapper.setData({ hasPublisherRights: false });
      expect(wrapper.vm.canConfigureMerge).toBe(false);

      wrapper.setData({ hasPublisherRights: true, appDetails: { ...defaultAppDetails, lockedUntil: Date.now() + 600000 } });
      expect(wrapper.vm.canConfigureMerge).toBe(false);
    });
  });
});
