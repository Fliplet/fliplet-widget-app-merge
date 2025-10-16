const { shallowMount } = require('@vue/test-utils');
const MergeComplete = require('./MergeComplete.vue').default;

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
  CheckCircle2: createIconStub('CheckCircle2'),
  AlertTriangle: createIconStub('AlertTriangle'),
  ExternalLink: createIconStub('ExternalLink'),
  FileText: createIconStub('FileText'),
  Loader2: createIconStub('Loader2'),
  StatusBadge: StatusBadgeStub,
  WarningBanner: WarningBannerStub
};

const defaultResults = {
  screensCopied: 5,
  dataSourcesCopied: 3,
  filesCopied: 12,
  configurationsCopied: 2,
  issues: [],
  planLimitWarnings: []
};

const renderComponent = (resultsOverrides = {}, dataOverrides = {}) => {
  return shallowMount(MergeComplete, {
    propsData: {
      sourceAppId: 123,
      mergeId: 'merge-1'
    },
    data() {
      return {
        loading: false,
        error: null,
        results: { ...defaultResults, ...resultsOverrides },
        previousMerges: [],
        ...dataOverrides
      };
    },
    global: {
      stubs: baseStubConfig
    }
  });
};

const renderLoadingComponent = () => {
  return shallowMount(MergeComplete, {
    propsData: {
      sourceAppId: 123,
      mergeId: 'merge-1'
    },
    data() {
      return {
        loading: true,
        error: null,
        results: {
          screensCopied: 0,
          dataSourcesCopied: 0,
          filesCopied: 0,
          configurationsCopied: 0,
          issues: [],
          planLimitWarnings: []
        },
        previousMerges: []
      };
    },
    global: {
      stubs: baseStubConfig
    }
  });
};

describe('MergeComplete', () => {
  describe('rendering', () => {
    it('displays summary correctly', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Merge completed successfully');
      expect(wrapper.text()).toContain('5'); // screens
      expect(wrapper.text()).toContain('3'); // data sources
      expect(wrapper.text()).toContain('12'); // files
      expect(wrapper.text()).toContain('2'); // configurations
    });

    it('displays loading state when loading is true', () => {
      const wrapper = renderLoadingComponent();

      expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true);
    });

    it('displays error message when error present', () => {
      const wrapper = shallowMount(MergeComplete, {
        propsData: {
          sourceAppId: 123,
          mergeId: 'merge-1'
        },
        data() {
          return {
            loading: false,
            error: 'Failed to load results',
            results: defaultResults,
            previousMerges: []
          };
        },
        global: {
          stubs: baseStubConfig
        }
      });

      expect(wrapper.find('[data-testid="complete-error"]').exists()).toBe(true);
    });
  });

  describe('issues display', () => {
    it('displays issues list when issues exist', () => {
      const wrapper = renderComponent({
        issues: [
          'Issue 1: Screen contains non-copyable components',
          'Issue 2: File was overwritten'
        ]
      });

      expect(wrapper.vm.hasIssuesOrWarnings).toBe(true);
      expect(wrapper.text()).toContain('Issue 1: Screen contains non-copyable components');
      expect(wrapper.text()).toContain('Issue 2: File was overwritten');
    });

    it('hides issues section when no issues', () => {
      const wrapper = renderComponent({ issues: [] });

      expect(wrapper.vm.hasIssuesOrWarnings).toBe(false);
    });
  });

  describe('plan limit warnings', () => {
    it('shows plan limit warnings when present', () => {
      const wrapper = renderComponent({
        planLimitWarnings: ['Screens limit exceeded', 'Files limit exceeded']
      });

      expect(wrapper.vm.hasPlanLimitWarning).toBe(true);
      expect(wrapper.find('[data-testid="plan-limit-warning"]').exists()).toBe(true);
    });

    it('hides plan limit warnings when none', () => {
      const wrapper = renderComponent({ planLimitWarnings: [] });

      expect(wrapper.vm.hasPlanLimitWarning).toBe(false);
      expect(wrapper.find('[data-testid="plan-limit-warning"]').exists()).toBe(false);
    });

    it('generates correct plan limit warning message', () => {
      const wrapper = renderComponent({
        planLimitWarnings: ['Screens: 10/5', 'Files: 50/25']
      });

      expect(wrapper.vm.planLimitWarningMessage).toContain('Screens: 10/5');
      expect(wrapper.vm.planLimitWarningMessage).toContain('Files: 50/25');
    });
  });

  describe('previous merges', () => {
    it('displays previous merges when available', () => {
      const previousMerges = [
        {
          id: 1,
          completedAt: Date.now(),
          sourceAppName: 'Source App',
          targetAppName: 'Target App',
          itemsCount: 10,
          status: 'success'
        }
      ];

      const wrapper = renderComponent({}, { previousMerges });

      expect(wrapper.text()).toContain('Source App');
      expect(wrapper.text()).toContain('Target App');
      expect(wrapper.text()).toContain('10');
    });

    it('hides previous merges section when none available', () => {
      const wrapper = renderComponent({}, { previousMerges: [] });

      expect(wrapper.text()).not.toContain('Recent Merges');
    });
  });

  describe('event emissions', () => {
    it('emits open-app event when open app button clicked', () => {
      const wrapper = renderComponent();

      wrapper.find('[data-testid="open-app-button"]').trigger('click');

      expect(wrapper.emitted('open-app')).toBeTruthy();
    });

    it('emits view-audit-log event when view audit log button clicked', () => {
      const wrapper = renderComponent();

      wrapper.find('[data-testid="view-audit-log-button"]').trigger('click');

      expect(wrapper.emitted('view-audit-log')).toBeTruthy();
    });
  });

  describe('date formatting', () => {
    it('formats date correctly', () => {
      const wrapper = renderComponent();

      const timestamp = new Date('2025-01-15T10:30:00').getTime();
      const formatted = wrapper.vm.formatDate(timestamp);

      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2025');
    });
  });

  describe('status labels', () => {
    it('returns correct label for success status', () => {
      const wrapper = renderComponent();

      expect(wrapper.vm.getStatusLabel('success')).toBe('Success');
    });

    it('returns correct label for error status', () => {
      const wrapper = renderComponent();

      expect(wrapper.vm.getStatusLabel('error')).toBe('Failed');
    });

    it('returns correct label for in-progress status', () => {
      const wrapper = renderComponent();

      expect(wrapper.vm.getStatusLabel('in-progress')).toBe('In Progress');
    });

    it('returns original status if no label found', () => {
      const wrapper = renderComponent();

      expect(wrapper.vm.getStatusLabel('unknown-status')).toBe('unknown-status');
    });
  });

  describe('next steps display', () => {
    it('displays next steps section', () => {
      const wrapper = renderComponent();

      expect(wrapper.text()).toContain('Next Steps');
      expect(wrapper.text()).toContain('Review the merged items');
      expect(wrapper.text()).toContain('republish the app');
      expect(wrapper.text()).toContain('Data source changes are already live');
      expect(wrapper.text()).toContain('Check the audit log');
    });
  });
});

