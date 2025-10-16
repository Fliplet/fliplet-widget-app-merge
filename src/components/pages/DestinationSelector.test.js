const { shallowMount } = require('@vue/test-utils');
const DestinationSelector = require('./DestinationSelector.vue').default;

const WarningBannerStub = {
  name: 'WarningBanner',
  template: '<div />',
  props: ['type', 'message']
};

const FlipletTableWrapperStub = {
  name: 'FlipletTableWrapper',
  template: '<div />',
  props: ['columns', 'data', 'selection', 'loading', 'config'],
  emits: ['selection:change', 'row-click']
};

const Loader2Stub = {
  name: 'Loader2',
  template: '<div />'
};

const SearchStub = {
  name: 'Search',
  template: '<div />'
};

const Building2Stub = {
  name: 'Building2',
  template: '<div />'
};

const initialOrganizations = [
  { id: 1, name: 'Acme Corp', region: 'US' }
];

const initialApps = [
  { id: 200, name: 'Destination App', updatedAt: Date.now(), isLive: false, lockedUntil: null, hasPublisherRights: true, containsDuplicates: false }
];

const renderComponent = (overrides = {}) => {
  return shallowMount(DestinationSelector, {
    data() {
      return {
        loading: false,
        error: null,
        organizations: initialOrganizations,
        apps: initialApps,
        selectedOrganizationId: 1,
        selectedAppId: null,
        searchQuery: '',
        checkingDuplicates: false,
        ...overrides
      };
    },
    global: {
      stubs: {
        WarningBanner: WarningBannerStub,
        FlipletTableWrapper: FlipletTableWrapperStub,
        Loader2: Loader2Stub,
        Search: SearchStub,
        Building2: Building2Stub
      }
    }
  });
};

const flushPromises = () => new Promise(resolve => process.nextTick(resolve));

describe('DestinationSelector', () => {
  describe('rendering', () => {
    it('shows warning banners', () => {
      const wrapper = renderComponent();

      const banners = wrapper.findAllComponents(WarningBannerStub);
      expect(banners.length).toBeGreaterThan(0);
    });

    it('renders organization selector when multiple organizations', () => {
      const wrapper = renderComponent({ organizations: [...initialOrganizations, { id: 2, name: 'Other Org', region: 'EU' }] });

      expect(wrapper.find('[data-testid="organization-select"]').exists()).toBe(true);
    });
  });

  describe('apps table', () => {
    it('renders table rows for available apps', () => {
      const wrapper = renderComponent();

      const rows = wrapper.vm.tableRows;
      expect(rows.length).toBe(1);
      expect(rows[0].name).toBe('Destination App');
    });

    it('disables source app selection', () => {
      const wrapper = renderComponent({ apps: [{ id: 100, name: 'Source App', isLive: true, isLocked: false, hasPublisherRights: true, isDuplicate: false }] });

      expect(wrapper.vm.isAppDisabled(wrapper.vm.apps[0])).toBe(false);
    });
  });

  describe('search filtering', () => {
    it('filters apps by name', async () => {
      const wrapper = renderComponent();
      wrapper.setData({ searchQuery: 'Destination' });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.tableRows.length).toBe(1);
    });

    it('shows empty state when no matches', async () => {
      const wrapper = renderComponent();

      // Wait for all async loading operations to complete
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      wrapper.vm.searchQuery = 'Unknown';
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-testid="apps-empty-state"]').exists()).toBe(true);
    });
  });

  describe('app selection', () => {
    it('selects app when data row is selected', async () => {
      const wrapper = renderComponent();

      wrapper.vm.handleSelectionChange([{ id: 200 }]);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selectedAppId).toBe(200);
    });

    it('emits app-selected when next clicked', async () => {
      const wrapper = renderComponent({ selectedAppId: 200 });

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(callback => {
        callback();
        return 0;
      });

      await wrapper.find('[data-testid="next-button"]').trigger('click');
      await flushPromises();

      const emitted = wrapper.emitted('app-selected');
      expect(emitted).toBeTruthy();

      const [payload] = emitted[0];
      expect(payload.id).toBe(200);
      expect(payload.name).toBe('Destination App');

      setTimeoutSpy.mockRestore();
    });
  });

  describe('navigation', () => {
    it('emits back event when Back clicked', () => {
      const wrapper = renderComponent();

      wrapper.find('[data-testid="back-button"]').trigger('click');
      expect(wrapper.emitted('back')).toBeTruthy();
    });

    it('disables next button when no app selected', () => {
      const wrapper = renderComponent({ selectedAppId: null });

      expect(wrapper.find('[data-testid="next-button"]').attributes('disabled')).toBeDefined();
    });
  });

  // Task 20.0: Edge cases and error scenarios
  describe('edge cases and error scenarios', () => {
    describe('user lacking publisher rights (20.1)', () => {
      it('disables apps when user lacks publisher rights', () => {
        const appsWithoutRights = [
          { id: 200, name: 'App Without Rights', updatedAt: Date.now(), isLive: false, lockedUntil: null, hasPublisherRights: false }
        ];
        const wrapper = renderComponent({ apps: appsWithoutRights });

        const rows = wrapper.vm.tableRows;
        expect(rows[0].disabled).toBe(true);
        expect(wrapper.vm.isAppDisabled(appsWithoutRights[0])).toBe(true);
      });
    });

    describe('locked apps (20.2)', () => {
      it('disables locked destination apps', () => {
        const lockedApps = [
          { id: 200, name: 'Locked App', updatedAt: Date.now(), isLive: false, lockedUntil: Date.now() + 3600000, hasPublisherRights: true, isLocked: true }
        ];
        const wrapper = renderComponent({ apps: lockedApps });

        const rows = wrapper.vm.tableRows;
        expect(rows[0].disabled).toBe(true);
        expect(wrapper.vm.isAppDisabled(lockedApps[0])).toBe(true);
      });
    });

    describe('duplicate validation (20.3, 20.4)', () => {
      it('shows validation error when duplicate screens exist', async () => {
        const wrapper = renderComponent({ selectedAppId: 200 });

        // Mock the duplicate check to return duplicate screens
        jest.spyOn(wrapper.vm, 'fetchDuplicates').mockResolvedValue({
          pages: [{ name: 'Home', count: 2, ids: [1, 2] }],
          dataSources: []
        });

        await wrapper.find('[data-testid="next-button"]').trigger('click');
        await flushPromises();

        expect(wrapper.vm.validationError).toContain('Duplicate screens: Home');
        expect(wrapper.emitted('app-selected')).toBeFalsy();
      });

      it('shows validation error when duplicate data sources exist', async () => {
        const wrapper = renderComponent({ selectedAppId: 200 });

        // Mock the duplicate check to return duplicate data sources
        jest.spyOn(wrapper.vm, 'fetchDuplicates').mockResolvedValue({
          pages: [],
          dataSources: [{ name: 'Users', count: 2, ids: [10, 11] }]
        });

        await wrapper.find('[data-testid="next-button"]').trigger('click');
        await flushPromises();

        expect(wrapper.vm.validationError).toContain('Duplicate data sources: Users');
        expect(wrapper.emitted('app-selected')).toBeFalsy();
      });
    });

    describe('empty states (20.5, 20.6)', () => {
      it('handles empty organization list gracefully', () => {
        const wrapper = renderComponent({ organizations: [] });

        expect(wrapper.vm.organizations).toEqual([]);
        expect(wrapper.find('[data-testid="organization-select"]').exists()).toBe(false);
      });

      it('shows empty state when no apps are available', () => {
        const wrapper = renderComponent({ apps: [] });

        expect(wrapper.find('[data-testid="apps-empty-state"]').exists()).toBe(true);
        expect(wrapper.vm.tableRows.length).toBe(0);
      });
    });

    describe('network errors (20.7)', () => {
      it('surfaces error banner when app loading fails', () => {
        const wrapper = renderComponent({ error: 'Unable to load apps. Please try again.' });

        const errorBanners = wrapper.findAllComponents(WarningBannerStub);
        const errorBanner = errorBanners.find(banner => banner.props('type') === 'error');
        expect(errorBanner.exists()).toBe(true);
        expect(errorBanner.props('message')).toBe('Unable to load apps. Please try again.');
      });
    });

    describe('single organization (20.11)', () => {
      it('skips org selector when user belongs to single organization', () => {
        const wrapper = renderComponent({ organizations: [{ id: 1, name: 'Single Org', region: 'US' }] });

        expect(wrapper.find('[data-testid="organization-select"]').exists()).toBe(false);
      });
    });

    describe('duplicate checking flow', () => {
      it('shows checking state during duplicate validation', async () => {
        const wrapper = renderComponent({ selectedAppId: 200 });

        // Mock a delayed duplicate check
        jest.spyOn(wrapper.vm, 'fetchDuplicates').mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve({ pages: [], dataSources: [] }), 100))
        );

        wrapper.find('[data-testid="next-button"]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.checkingDuplicates).toBe(true);
        expect(wrapper.find('[data-testid="next-button"]').text()).toBe('Checking...');
      });
    });
  });
});
