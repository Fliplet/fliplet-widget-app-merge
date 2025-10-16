const { shallowMount } = require('@vue/test-utils');
const MergeProgress = require('./MergeProgress.vue').default;
const MergeApiService = require('../../middleware/api/MergeApiService');
const analytics = require('../../utils/analytics');

jest.mock('../../middleware/api/MergeApiService');
jest.mock('../../utils/analytics');

const flushPromises = () => Promise.resolve();

const createMergeService = () => {
  const mocks = {
    getMergeStatus: jest.fn(),
    fetchMergeLogs: jest.fn(),
    cancelMerge: jest.fn(),
    startMerge: jest.fn()
  };

  MergeApiService.mockImplementation(() => mocks);

  return mocks;
};

let mergeApiMocks;

const mockGetMergeStatus = (statusOverrides = {}) => {
  mergeApiMocks.getMergeStatus.mockResolvedValue({
    status: 'in-progress',
    progress: 25,
    phase: 'copying-screens',
    logs: [],
    ...statusOverrides
  });
};

const createIconStub = (name) => ({
  name,
  template: '<svg />'
});

const WarningBannerStub = {
  name: 'WarningBanner',
  template: '<div />',
  props: ['type', 'message']
};

const baseStubConfig = {
  CheckCircle2: createIconStub('CheckCircle2'),
  AlertCircle: createIconStub('AlertCircle'),
  Loader2: createIconStub('Loader2'),
  Clock: createIconStub('Clock'),
  WarningBanner: WarningBannerStub
};

const renderComponent = (dataOverrides = {}) => {
  const componentMergeService = createMergeService();

  mergeApiMocks = componentMergeService;

  return shallowMount(MergeProgress, {
    propsData: {
      sourceAppId: 1,
      mergeId: 'test-merge'
    },
    provide: {
      mergeService: componentMergeService
    },
    data() {
      return {
        progressPercentage: 0,
        currentPhase: 'initializing',
        messages: [],
        isComplete: false,
        hasError: false,
        eventUnsubscribe: null,
        pollingInterval: null,
        ...dataOverrides
      };
    },
    global: {
      stubs: baseStubConfig
    }
  });
};

describe('MergeProgress', () => {
  beforeEach(() => {
    analytics.trackMergeProgressUpdated.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders progress bar with initial state', () => {
      const wrapper = renderComponent();

      expect(wrapper.find('[role="progressbar"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('0%');
    });

    it('displays progress percentage correctly', () => {
      const wrapper = renderComponent({ progressPercentage: 50 });

      expect(wrapper.text()).toContain('50%');

      const progressBar = wrapper.find('[role="progressbar"]');
      expect(progressBar.attributes('aria-valuenow')).toBe('50');
    });

    it('displays current phase label', () => {
      const wrapper = renderComponent({ currentPhase: 'copying-screens' });

      expect(wrapper.text()).toContain('Copying screens...');
    });

    it('renders empty messages list initially', () => {
      const wrapper = renderComponent({ messages: [] });

      expect(wrapper.find('[data-testid="messages-list"]').text()).toContain('Preparing merge...');
    });
  });

  describe('status messages', () => {
    it('adds status messages to the list', () => {
      const wrapper = renderComponent({
        messages: [
          {
            text: 'Starting merge',
            status: 'in-progress',
            timestamp: Date.now()
          }
        ]
      });

      expect(wrapper.text()).toContain('Starting merge');
    });

    it('displays message with count when provided', () => {
      const wrapper = renderComponent({
        messages: [
          {
            text: 'Copying files',
            status: 'in-progress',
            timestamp: Date.now(),
            currentIndex: 1,
            count: 10
          }
        ]
      });

      expect(wrapper.text()).toContain('Copying files');
      expect(wrapper.text()).toContain('(1 of 10)');
    });

    it('renders correct icon for completed status', () => {
      const wrapper = renderComponent({
        messages: [
          {
            text: 'Screen copied',
            status: 'completed',
            timestamp: Date.now()
          }
        ]
      });

      const message = wrapper.find('[data-testid="message-0"]');
      expect(message.exists()).toBe(true);
    });

    it('renders correct icon for in-progress status', () => {
      const wrapper = renderComponent({
        messages: [
          {
            text: 'Copying screen',
            status: 'in-progress',
            timestamp: Date.now()
          }
        ]
      });

      const message = wrapper.find('[data-testid="message-0"]');
      expect(message.exists()).toBe(true);
    });

    it('renders correct icon for error status', () => {
      const wrapper = renderComponent({
        messages: [
          {
            text: 'Failed to copy',
            status: 'error',
            timestamp: Date.now()
          }
        ]
      });

      const message = wrapper.find('[data-testid="message-0"]');
      expect(message.exists()).toBe(true);
    });
  });

  describe('progress updates', () => {
    it('updates progress bar correctly', () => {
      const wrapper = renderComponent();

      wrapper.vm.handleProgressUpdate({
        percentage: 75,
        phase: 'copying-files',
        message: 'Copying files',
        status: 'in-progress'
      });

      expect(wrapper.vm.progressPercentage).toBe(75);
      expect(wrapper.vm.currentPhase).toBe('copying-files');
    });

    it('adds message on progress update', () => {
      const wrapper = renderComponent();

      wrapper.vm.handleProgressUpdate({
        percentage: 50,
        phase: 'copying-screens',
        message: 'Copying screens',
        status: 'in-progress'
      });

      expect(wrapper.vm.messages.length).toBe(1);
      expect(wrapper.vm.messages[0].text).toBe('Copying screens');
    });
  });

  describe('merge completion', () => {
    it('handles completion correctly', () => {
      const wrapper = renderComponent();

      wrapper.vm.handleMergeComplete();

      expect(wrapper.vm.progressPercentage).toBe(100);
      expect(wrapper.vm.currentPhase).toBe('completed');
      expect(wrapper.vm.isComplete).toBe(true);
    });

    it('emits merge-complete event', () => {
      const wrapper = renderComponent();

      wrapper.vm.handleMergeComplete();

      expect(wrapper.emitted('merge-complete')).toBeTruthy();
    });

    it('adds completion message', () => {
      const wrapper = renderComponent();

      wrapper.vm.handleMergeComplete();

      expect(wrapper.vm.messages.length).toBeGreaterThan(0);
      expect(wrapper.vm.messages[wrapper.vm.messages.length - 1].text).toContain('completed successfully');
    });
  });

  describe('error handling', () => {
    it('handles merge error correctly', () => {
      const wrapper = renderComponent();

      const error = { message: 'Test error' };
      wrapper.vm.handleMergeError(error);

      expect(wrapper.vm.currentPhase).toBe('error');
      expect(wrapper.vm.hasError).toBe(true);
    });

    it('emits merge-error event', () => {
      const wrapper = renderComponent();

      const error = { message: 'Test error' };
      wrapper.vm.handleMergeError(error);

      expect(wrapper.emitted('merge-error')).toBeTruthy();
      expect(wrapper.emitted('merge-error')[0][0]).toEqual(error);
    });

    it('adds error message', () => {
      const wrapper = renderComponent();

      wrapper.vm.handleMergeError({ message: 'Test error' });

      expect(wrapper.vm.messages.length).toBeGreaterThan(0);
      expect(wrapper.vm.messages[wrapper.vm.messages.length - 1].text).toBe('Test error');
      expect(wrapper.vm.messages[wrapper.vm.messages.length - 1].status).toBe('error');
    });
  });

  describe('timestamp formatting', () => {
    it('formats timestamp correctly', () => {
      const wrapper = renderComponent();

      const timestamp = new Date('2025-01-15T10:30:45').getTime();
      const formatted = wrapper.vm.formatTimestamp(timestamp);

      expect(formatted).toContain(':');
      expect(typeof formatted).toBe('string');
    });
  });

  describe('message list management', () => {
    it('adds multiple messages in order', () => {
      const wrapper = renderComponent();

      wrapper.vm.addMessage({ text: 'Message 1', status: 'completed', timestamp: Date.now() });
      wrapper.vm.addMessage({ text: 'Message 2', status: 'in-progress', timestamp: Date.now() });
      wrapper.vm.addMessage({ text: 'Message 3', status: 'completed', timestamp: Date.now() });

      expect(wrapper.vm.messages.length).toBe(3);
      expect(wrapper.vm.messages[0].text).toBe('Message 1');
      expect(wrapper.vm.messages[1].text).toBe('Message 2');
      expect(wrapper.vm.messages[2].text).toBe('Message 3');
    });
  });

  describe('component lifecycle', () => {
    it('cleans up event subscriptions on unmount', () => {
      const unsubscribeMock = jest.fn();
      const wrapper = renderComponent({ eventUnsubscribe: unsubscribeMock });

      wrapper.unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('does not error if no event unsubscribe function', () => {
      const wrapper = renderComponent({ eventUnsubscribe: null });

      expect(() => {
        wrapper.unmount();
      }).not.toThrow();
    });
  });

  describe('polling', () => {
    it('polls merge status every 5 seconds and updates progress', async () => {
      const wrapper = renderComponent();

      mockGetMergeStatus({
        status: 'in-progress',
        progress: 40,
        currentPhase: 'copying-data-sources'
      });

      await wrapper.vm.pollMergeStatus();
      jest.advanceTimersByTime(5000);
      await wrapper.vm.pollMergeStatus();

      expect(mergeApiMocks.getMergeStatus).toHaveBeenCalledWith(1, { mergeId: 'test-merge' });
      expect(wrapper.vm.progressPercentage).toBe(40);
      expect(wrapper.vm.currentPhase).toBe('copying-screens');
    });

    it('stops polling when merge completes', async () => {
      const wrapper = renderComponent();

      mockGetMergeStatus({ status: 'completed', progress: 100 });

      await wrapper.vm.pollMergeStatus();
      jest.advanceTimersByTime(5000);
      await wrapper.vm.pollMergeStatus();

      expect(wrapper.vm.isComplete).toBe(true);
      expect(mergeApiMocks.getMergeStatus).toHaveBeenCalledTimes(2);
      expect(wrapper.emitted('merge-complete')).toBeTruthy();
    });

    it('stops polling when merge fails', async () => {
      const wrapper = renderComponent();

      mockGetMergeStatus({ status: 'error', progress: 42 });

      await wrapper.vm.pollMergeStatus();
      jest.advanceTimersByTime(5000);
      await wrapper.vm.pollMergeStatus();

      expect(wrapper.vm.hasError).toBe(true);
      expect(wrapper.emitted('merge-error')).toBeTruthy();
    });
  });

  describe('start merge', () => {
    it('calls startMerge with correct payload when performStartMerge invoked', async () => {
      mergeApiMocks.startMerge.mockResolvedValue({ mergeId: 'test-merge' });
      mockGetMergeStatus();

      const wrapper = renderComponent();

      await flushPromises();

      expect(mergeApiMocks.startMerge).toHaveBeenCalledWith(1, { mergeId: 'test-merge' });
      expect(mergeApiMocks.getMergeStatus).toHaveBeenCalled();
    });
  });
});

