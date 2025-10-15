const { shallowMount } = require('@vue/test-utils');
const DestinationSelector = require('./DestinationSelector.vue').default;

const WarningBannerStub = {
  name: 'WarningBanner',
  template: '<div />',
  props: ['type', 'message']
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
        ...overrides
      };
    },
    global: {
      stubs: {
        WarningBanner: WarningBannerStub
      }
    }
  });
};

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

      await wrapper.find('[data-testid="next-button"]').trigger('click');

      expect(wrapper.emitted('app-selected')[0][0]).toEqual(initialApps[0]);
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
});
