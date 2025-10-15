const stateManager = require('./stateManager');

describe('stateManager', () => {
  beforeEach(() => {
    // Clear state before each test
    stateManager.clearAllState();
  });

  describe('saveSelection', () => {
    it('saves selection for screens category', () => {
      const screens = [{ id: 1, name: 'Screen 1' }];
      stateManager.saveSelection('screens', screens);

      expect(stateManager.getSelection('screens')).toEqual(screens);
    });

    it('saves selection for dataSources category', () => {
      const dataSources = [{ id: 10, name: 'Data Source 1' }];
      stateManager.saveSelection('dataSources', dataSources);

      expect(stateManager.getSelection('dataSources')).toEqual(dataSources);
    });

    it('saves selection for files category', () => {
      const files = [{ id: 100, name: 'file.png' }];
      stateManager.saveSelection('files', files);

      expect(stateManager.getSelection('files')).toEqual(files);
    });

    it('saves selection for configurations category', () => {
      const configurations = [{ type: 'app-settings', enabled: true }];
      stateManager.saveSelection('configurations', configurations);

      expect(stateManager.getSelection('configurations')).toEqual(configurations);
    });

    it('throws error for invalid category', () => {
      expect(() => {
        stateManager.saveSelection('invalid', []);
      }).toThrow('Invalid category: invalid');
    });
  });

  describe('getSelection', () => {
    it('returns all selections when no category specified', () => {
      const screens = [{ id: 1, name: 'Screen 1' }];
      const dataSources = [{ id: 10, name: 'Data Source 1' }];

      stateManager.saveSelection('screens', screens);
      stateManager.saveSelection('dataSources', dataSources);

      const allSelections = stateManager.getSelection();

      expect(allSelections.screens).toEqual(screens);
      expect(allSelections.dataSources).toEqual(dataSources);
    });

    it('returns empty array for category with no selections', () => {
      expect(stateManager.getSelection('screens')).toEqual([]);
    });

    it('throws error for invalid category', () => {
      expect(() => {
        stateManager.getSelection('invalid');
      }).toThrow('Invalid category: invalid');
    });
  });

  describe('clearSelection', () => {
    it('clears all selections', () => {
      stateManager.saveSelection('screens', [{ id: 1, name: 'Screen 1' }]);
      stateManager.saveSelection('dataSources', [{ id: 10, name: 'Data Source 1' }]);

      stateManager.clearSelection();

      expect(stateManager.getSelection('screens')).toEqual([]);
      expect(stateManager.getSelection('dataSources')).toEqual([]);
      expect(stateManager.getSelection('files')).toEqual([]);
      expect(stateManager.getSelection('configurations')).toEqual([]);
    });
  });

  describe('destination app management', () => {
    it('sets and gets destination app', () => {
      const app = { id: 456, name: 'Destination App' };
      stateManager.setDestinationApp(app);

      expect(stateManager.getDestinationApp()).toEqual(app);
    });

    it('returns null when no destination app set', () => {
      expect(stateManager.getDestinationApp()).toBeNull();
    });
  });

  describe('apps locked status', () => {
    it('sets and gets apps locked status', () => {
      stateManager.setAppsLocked(true);
      expect(stateManager.getAppsLocked()).toBe(true);

      stateManager.setAppsLocked(false);
      expect(stateManager.getAppsLocked()).toBe(false);
    });

    it('returns false initially', () => {
      expect(stateManager.getAppsLocked()).toBe(false);
    });
  });

  describe('clearAllState', () => {
    it('clears all state including selections and destination app', () => {
      stateManager.saveSelection('screens', [{ id: 1, name: 'Screen 1' }]);
      stateManager.setDestinationApp({ id: 456, name: 'Destination App' });
      stateManager.setAppsLocked(true);

      stateManager.clearAllState();

      expect(stateManager.getSelection('screens')).toEqual([]);
      expect(stateManager.getDestinationApp()).toBeNull();
      expect(stateManager.getAppsLocked()).toBe(false);
    });
  });

  describe('getState', () => {
    it('returns a copy of the entire state', () => {
      const screens = [{ id: 1, name: 'Screen 1' }];
      const app = { id: 456, name: 'Destination App' };

      stateManager.saveSelection('screens', screens);
      stateManager.setDestinationApp(app);
      stateManager.setAppsLocked(true);

      const state = stateManager.getState();

      expect(state.mergeConfiguration.screens).toEqual(screens);
      expect(state.selectedDestinationApp).toEqual(app);
      expect(state.isAppsLocked).toBe(true);
    });
  });

  describe('state isolation', () => {
    it('maintains separate state for each category', () => {
      const screens = [{ id: 1, name: 'Screen 1' }];
      const dataSources = [{ id: 10, name: 'Data Source 1' }];

      stateManager.saveSelection('screens', screens);
      stateManager.saveSelection('dataSources', dataSources);

      expect(stateManager.getSelection('screens')).toEqual(screens);
      expect(stateManager.getSelection('dataSources')).toEqual(dataSources);
      expect(stateManager.getSelection('files')).toEqual([]);
    });

    it('overwrites previous selection for same category', () => {
      const screens1 = [{ id: 1, name: 'Screen 1' }];
      const screens2 = [{ id: 2, name: 'Screen 2' }];

      stateManager.saveSelection('screens', screens1);
      expect(stateManager.getSelection('screens')).toEqual(screens1);

      stateManager.saveSelection('screens', screens2);
      expect(stateManager.getSelection('screens')).toEqual(screens2);
    });
  });
});

