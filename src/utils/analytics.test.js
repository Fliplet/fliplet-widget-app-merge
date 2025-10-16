const analytics = require('./analytics');

describe('analytics', () => {
  let mockFlipletAnalytics;

  beforeEach(() => {
    mockFlipletAnalytics = jest.fn();

    if (!global.Fliplet) {
      global.Fliplet = {
        App: {
          Analytics: {
            event: mockFlipletAnalytics
          }
        }
      };
    } else {
      global.Fliplet.App = global.Fliplet.App || {};
      global.Fliplet.App.Analytics = global.Fliplet.App.Analytics || {};
      global.Fliplet.App.Analytics.event = mockFlipletAnalytics;
    }

    if (global.window) {
      global.window.Fliplet = global.Fliplet;
    }

    globalThis.Fliplet = global.Fliplet;

    analytics.setAnalyticsEnabled(true);
  });

  afterEach(() => {
    jest.clearAllMocks();

    if (global.window && global.window.Fliplet) {
      delete global.window.Fliplet;
    }

    delete globalThis.Fliplet;
  });

  describe('trackEvent', () => {
    it('calls Fliplet.App.Analytics.event with correct parameters', () => {
      analytics.trackEvent('test_category', 'test_action', 'test_label', 123);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: 'test_category',
        action: 'test_action',
        label: 'test_label',
        value: 123
      });
    });

    it('handles missing Fliplet API gracefully', () => {
      delete global.window;

      expect(() => {
        analytics.trackEvent('test_category', 'test_action');
      }).not.toThrow();
    });

    it('handles disabled analytics gracefully', () => {
      analytics.setAnalyticsEnabled(false);

      analytics.trackEvent('test_category', 'test_action');

      expect(mockFlipletAnalytics).not.toHaveBeenCalled();
    });

    it('handles errors gracefully', () => {
      mockFlipletAnalytics.mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(() => {
        analytics.trackEvent('test_category', 'test_action');
      }).not.toThrow();
    });
  });

  describe('trackDashboardViewed', () => {
    it('tracks dashboard viewed with correct parameters', () => {
      analytics.trackDashboardViewed(123);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.APP_MERGE,
        action: 'dashboard_viewed',
        label: 'App 123',
        value: 123
      });
    });
  });

  describe('trackDestinationSelected', () => {
    it('tracks destination selected with correct parameters', () => {
      analytics.trackDestinationSelected(123, 456);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.APP_MERGE,
        action: 'destination_selected',
        label: 'From 123 to 456',
        value: 456
      });
    });
  });

  describe('trackTabSwitched', () => {
    it('tracks tab switched with correct parameters', () => {
      analytics.trackTabSwitched('screens');

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.UI_INTERACTION,
        action: 'tab_switched',
        label: 'screens',
        value: null
      });
    });
  });

  describe('trackItemsSelected', () => {
    it('tracks items selected with correct parameters', () => {
      analytics.trackItemsSelected('screens', 5);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.APP_MERGE,
        action: 'items_selected',
        label: 'screens',
        value: 5
      });
    });
  });

  describe('trackReviewViewed', () => {
    it('tracks review viewed with correct parameters', () => {
      analytics.trackReviewViewed(123, 456, 10);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.APP_MERGE,
        action: 'review_viewed',
        label: 'From 123 to 456',
        value: 10
      });
    });
  });

  describe('trackConflictDetected', () => {
    it('tracks conflict detected with correct parameters', () => {
      analytics.trackConflictDetected('duplicate_name', 2);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.APP_MERGE,
        action: 'conflict_detected',
        label: 'duplicate_name',
        value: 2
      });
    });
  });

  describe('trackMergeInitiated', () => {
    it('tracks merge initiated with correct parameters', () => {
      analytics.trackMergeInitiated(123, 456, 10);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.WORKFLOW,
        action: 'merge_initiated',
        label: 'From 123 to 456',
        value: 10
      });
    });
  });

  describe('trackMergeProgressUpdated', () => {
    it('tracks merge progress updated with correct parameters', () => {
      analytics.trackMergeProgressUpdated('copying-screens', 50);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.APP_MERGE,
        action: 'merge_progress_updated',
        label: 'copying-screens',
        value: 50
      });
    });
  });

  describe('trackMergeCompleted', () => {
    it('tracks merge completed with correct parameters', () => {
      analytics.trackMergeCompleted(123, 456, 30, 10);

      expect(mockFlipletAnalytics).toHaveBeenCalledTimes(2);

      expect(mockFlipletAnalytics).toHaveBeenNthCalledWith(1, {
        category: analytics.EVENT_CATEGORIES.WORKFLOW,
        action: 'merge_completed',
        label: 'From 123 to 456',
        value: 30
      });

      expect(mockFlipletAnalytics).toHaveBeenNthCalledWith(2, {
        category: analytics.EVENT_CATEGORIES.APP_MERGE,
        action: 'merge_completed_items',
        label: 'From 123 to 456',
        value: 10
      });
    });
  });

  describe('trackMergeFailed', () => {
    it('tracks merge failed with correct parameters', () => {
      analytics.trackMergeFailed(123, 456, 'Network error');

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.WORKFLOW,
        action: 'merge_failed',
        label: 'From 123 to 456: Network error',
        value: null
      });
    });
  });

  describe('trackDestinationAppOpened', () => {
    it('tracks destination app opened with correct parameters', () => {
      analytics.trackDestinationAppOpened(456);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.UI_INTERACTION,
        action: 'destination_app_opened',
        label: 'App 456',
        value: 456
      });
    });
  });

  describe('trackAuditLogViewed', () => {
    it('tracks audit log viewed with correct parameters', () => {
      analytics.trackAuditLogViewed(123);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.UI_INTERACTION,
        action: 'audit_log_viewed',
        label: 'App 123',
        value: 123
      });
    });
  });

  describe('trackMergeCancelled', () => {
    it('tracks merge cancelled with correct parameters', () => {
      analytics.trackMergeCancelled('configuration');

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.WORKFLOW,
        action: 'merge_cancelled',
        label: 'configuration',
        value: null
      });
    });
  });

  describe('trackLockExtended', () => {
    it('tracks lock extended with correct parameters', () => {
      analytics.trackLockExtended(123, 456);

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.APP_MERGE,
        action: 'lock_extended',
        label: 'From 123 to 456',
        value: null
      });
    });
  });

  describe('trackButtonClick', () => {
    it('tracks button click with correct parameters', () => {
      analytics.trackButtonClick('Configure Merge', 'dashboard');

      expect(mockFlipletAnalytics).toHaveBeenCalledWith({
        category: analytics.EVENT_CATEGORIES.UI_INTERACTION,
        action: 'button_click',
        label: 'Configure Merge - dashboard',
        value: null
      });
    });
  });
});

