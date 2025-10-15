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

const baseStubConfig = {
  AlertTriangle: createIconStub('AlertTriangle'),
  AlertCircle: createIconStub('AlertCircle'),
  Loader2: createIconStub('Loader2'),
  StatusBadge: StatusBadgeStub,
  WarningBanner: WarningBannerStub
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

const renderComponent = (previewOverrides = {}, dataOverrides = {}) => {
  return shallowMount(MergeReview, {
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

  describe('conflict detection', () => {
    it('identifies conflicts correctly', () => {
      const conflictPreview = {
        screens: [
          {
            id: 1,
            name: 'Screen 1',
            status: 'conflict',
            warnings: ['Duplicate name']
          }
        ],
        dataSources: [],
        files: [],
        configurations: []
      };

      const wrapper = renderComponent(conflictPreview);

      expect(wrapper.vm.hasConflicts).toBe(true);
      expect(wrapper.find('[data-testid="conflicts-warning"]').exists()).toBe(true);
    });

    it('shows no conflicts when all items are copy or overwrite', () => {
      const wrapper = renderComponent();

      expect(wrapper.vm.hasConflicts).toBe(false);
      expect(wrapper.find('[data-testid="conflicts-warning"]').exists()).toBe(false);
    });

    it('disables start button when conflicts exist', () => {
      const conflictPreview = {
        screens: [
          {
            id: 1,
            name: 'Screen 1',
            status: 'conflict',
            warnings: ['Duplicate name']
          }
        ],
        dataSources: [],
        files: [],
        configurations: []
      };

      const wrapper = renderComponent(conflictPreview);

      expect(wrapper.vm.canStartMerge).toBe(false);

      const button = wrapper.find('[data-testid="start-merge-button"]');
      expect(button.attributes('disabled')).toBeDefined();
    });
  });

  describe('plan limit warnings', () => {
    it('shows plan limit warnings when limits exceeded', () => {
      const wrapper = renderComponent({}, {
        planLimits: {
          screensLimit: 1,
          dataSourcesLimit: null,
          filesLimit: null
        }
      });

      expect(wrapper.vm.hasPlanLimitWarning).toBe(true);
      expect(wrapper.find('[data-testid="plan-limit-warning"]').exists()).toBe(true);
    });

    it('shows no warnings when limits not exceeded', () => {
      const wrapper = renderComponent({}, {
        planLimits: {
          screensLimit: 10,
          dataSourcesLimit: 10,
          filesLimit: 10
        }
      });

      expect(wrapper.vm.hasPlanLimitWarning).toBe(false);
      expect(wrapper.find('[data-testid="plan-limit-warning"]').exists()).toBe(false);
    });

    it('disables start button when plan limits exceeded', () => {
      const wrapper = renderComponent({}, {
        planLimits: {
          screensLimit: 1,
          dataSourcesLimit: null,
          filesLimit: null
        }
      });

      expect(wrapper.vm.canStartMerge).toBe(false);

      const button = wrapper.find('[data-testid="start-merge-button"]');
      expect(button.attributes('disabled')).toBeDefined();
    });
  });

  describe('event emissions', () => {
    it('emits start-merge event when start merge button clicked', () => {
      const wrapper = renderComponent();

      wrapper.find('[data-testid="start-merge-button"]').trigger('click');

      expect(wrapper.emitted('start-merge')).toBeTruthy();
    });

    it('emits edit-settings event when edit settings button clicked', () => {
      const wrapper = renderComponent();

      wrapper.find('[data-testid="edit-settings-button"]').trigger('click');

      expect(wrapper.emitted('edit-settings')).toBeTruthy();
    });

    it('emits cancel event when cancel button clicked', () => {
      const wrapper = renderComponent();

      wrapper.find('[data-testid="cancel-button"]').trigger('click');

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

