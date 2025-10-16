const { shallowMount } = require('@vue/test-utils');
const MergeReview = require('./MergeReview.vue').default;

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

const ModalDialogStub = {
  name: 'ModalDialog',
  template: '<div class="modal-stub" />',
  props: ['title', 'message', 'confirmLabel', 'cancelLabel', 'confirmVariant']
};

const baseStubConfig = {
  AlertTriangle: createIconStub('AlertTriangle'),
  AlertCircle: createIconStub('AlertCircle'),
  Loader2: createIconStub('Loader2'),
  StatusBadge: StatusBadgeStub,
  WarningBanner: WarningBannerStub,
  ModalDialog: ModalDialogStub
};

const defaultPreview = {
  screens: [
    {
      id: 1,
      name: 'Home Screen',
      status: 'copy',
      warnings: []
    },
    {
      id: 2,
      name: 'Profile Screen',
      status: 'overwrite',
      warnings: ['Contains non-copyable components']
    }
  ],
  dataSources: [
    {
      id: 10,
      name: 'Users',
      copyMode: 'structure-only',
      status: 'copy',
      warnings: []
    }
  ],
  files: [
    {
      id: 100,
      name: 'logo.png',
      path: '/assets/logo.png',
      type: 'image',
      status: 'copy',
      warnings: []
    }
  ],
  configurations: [
    {
      type: 'app-settings',
      label: 'App Settings',
      description: 'General app configuration',
      status: 'overwrite'
    }
  ]
};

const baseProps = {
  sourceAppId: 1,
  destinationAppId: 2,
  mergeConfig: {
    destinationAppId: 2,
    destinationOrganizationId: 1,
    pageIds: [1, 2],
    dataSources: [10],
    fileIds: [100],
    folderIds: [],
    mergeAppSettings: true
  }
};

const renderComponent = (previewOverrides = {}, dataOverrides = {}) => {
  return shallowMount(MergeReview, {
    propsData: baseProps,
    data() {
      return {
        loading: false,
        error: null,
        preview: { ...defaultPreview, ...previewOverrides },
        planLimits: {
          screensLimit: null,
          dataSourcesLimit: null,
          filesLimit: null
        },
        ...dataOverrides
      };
    },
    global: {
      stubs: baseStubConfig
    }
  });
};

const renderLoadingComponent = () => {
  return shallowMount(MergeReview, {
    propsData: baseProps,
    data() {
      return {
        loading: true,
        error: null,
        preview: {
          screens: [],
          dataSources: [],
          files: [],
          configurations: []
        },
        planLimits: {
          screensLimit: null,
          dataSourcesLimit: null,
          filesLimit: null
        }
      };
    },
    global: {
      stubs: baseStubConfig
    }
  });
};

describe('MergeReview', () => {
  describe('rendering', () => {
    it('displays preview correctly', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Review your merge configuration');
      expect(wrapper.text()).toContain('Home Screen');
      expect(wrapper.text()).toContain('Profile Screen');
      expect(wrapper.text()).toContain('Users');
      expect(wrapper.text()).toContain('logo.png');
      expect(wrapper.text()).toContain('App Settings');
    });

    it('displays loading state when loading is true', () => {
      const wrapper = renderLoadingComponent();

      expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true);
    });

    it('displays error message when error present', () => {
      const wrapper = shallowMount(MergeReview, {
        propsData: baseProps,
        data() {
          return {
            loading: false,
            error: 'Failed to load preview',
            preview: {
              screens: [],
              dataSources: [],
              files: [],
              configurations: []
            },
            planLimits: {
              screensLimit: null,
              dataSourcesLimit: null,
              filesLimit: null
            }
          };
        },
        global: {
          stubs: baseStubConfig
        }
      });

      expect(wrapper.find('[data-testid="review-error"]').exists()).toBe(true);
    });
  });

  describe('plan limits', () => {
    it('shows plan limit warning when limits exceeded', () => {
      const wrapper = renderComponent({}, {
        planLimits: {
          screensLimit: 1,
          dataSourcesLimit: null,
          filesLimit: null
        }
      });

      const warningBanner = wrapper.findComponent(WarningBannerStub);

      expect(warningBanner.exists()).toBe(true);
      expect(warningBanner.props('message')).toBe('Plan limits exceeded: Screens: 2/1. Some items may not be merged.');
    });

    it('does not disable start merge button when within limits', () => {
      const wrapper = renderComponent();

      expect(wrapper.vm.canStartMerge).toBe(true);
      expect(wrapper.find('[data-testid="start-merge-button"]').attributes('disabled')).toBeUndefined();
    });

    it('disables start merge button when limits exceeded', () => {
      const wrapper = renderComponent({}, {
        planLimits: {
          screensLimit: 1,
          dataSourcesLimit: null,
          filesLimit: null
        }
      });

      expect(wrapper.vm.canStartMerge).toBe(false);
      expect(wrapper.find('[data-testid="start-merge-button"]').attributes('disabled')).toBeDefined();
    });
  });

  describe('actions', () => {
    it('emits edit-settings event when edit settings button clicked', () => {
      const wrapper = renderComponent();

      wrapper.find('[data-testid="edit-settings-button"]').trigger('click');

      expect(wrapper.emitted('edit-settings')).toBeTruthy();
    });

    it('emits start-merge event when start merge button clicked', () => {
      const wrapper = renderComponent();

      wrapper.find('[data-testid="start-merge-button"]').trigger('click');

      expect(wrapper.emitted('start-merge')).toBeTruthy();
    });

    it('shows cancel confirmation modal when cancel clicked', async () => {
      const wrapper = renderComponent();

      await wrapper.find('[data-testid="cancel-button"]').trigger('click');

      expect(wrapper.findComponent(ModalDialogStub).exists()).toBe(true);
    });

    it('hides cancel confirmation modal when keep editing selected', async () => {
      const wrapper = renderComponent();

      await wrapper.find('[data-testid="cancel-button"]').trigger('click');
      await wrapper.vm.dismissCancelWarning();

      expect(wrapper.findComponent(ModalDialogStub).exists()).toBe(false);
    });

    it('emits cancel only after confirmation', async () => {
      const wrapper = renderComponent();

      await wrapper.find('[data-testid="cancel-button"]').trigger('click');
      await wrapper.vm.confirmCancel();

      expect(wrapper.emitted('cancel')).toBeTruthy();
    });
  });

  describe('summary display', () => {
    it('displays correct summary counts', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('2'); // screens count
      expect(wrapper.text()).toContain('1'); // data sources count
      expect(wrapper.text()).toContain('1'); // files count
      expect(wrapper.text()).toContain('1'); // configurations count
    });

    it('displays summary counts for each category', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Review your merge configuration');
      expect(wrapper.text()).toContain('Summary');
      expect(wrapper.text()).toContain('Screens');
      expect(wrapper.text()).toContain('Data Sources');
      expect(wrapper.text()).toContain('Files');
      expect(wrapper.text()).toContain('Configurations');
    });
  });

  describe('status badges', () => {
    it('renders status badges for all items', () => {
      const wrapper = renderComponent();

      const badges = wrapper.findAllComponents(StatusBadgeStub);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('warnings display', () => {
    it('displays warnings for items with warnings', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Contains non-copyable components');
    });
  });
});

