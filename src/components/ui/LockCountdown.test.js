const { shallowMount } = require('@vue/test-utils');
const LockCountdown = require('./LockCountdown.vue').default;

const ClockStub = {
  name: 'Clock',
  template: '<svg />'
};

const AlertTriangleStub = {
  name: 'AlertTriangle',
  template: '<svg />'
};

const TeleportStub = {
  name: 'Teleport',
  template: '<div><slot /></div>'
};

const renderComponent = (props = {}) => {
  return shallowMount(LockCountdown, {
    propsData: props,
    global: {
      stubs: {
        Clock: ClockStub,
        AlertTriangle: AlertTriangleStub,
        Teleport: TeleportStub
      }
    }
  });
};

describe('LockCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('time calculations', () => {
    it('calculates time remaining correctly', () => {
      const now = Date.now();
      const lockedUntil = now + (10 * 60 * 1000); // 10 minutes from now

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.vm.timeRemainingMinutes).toBe(10);
    });

    it('calculates seconds correctly', () => {
      const now = Date.now();
      const lockedUntil = now + (125 * 1000); // 125 seconds

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.vm.timeRemainingMinutes).toBe(2);
      expect(wrapper.vm.timeRemainingSeconds % 60).toBe(5);
    });

    it('returns 0 when lock has expired', () => {
      const now = Date.now();
      const lockedUntil = now - (5 * 60 * 1000); // 5 minutes ago

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.vm.timeRemaining).toBe(0);
    });
  });

  describe('warning banner', () => {
    it('shows warning banner when < 5 minutes remaining', () => {
      const now = Date.now();
      const lockedUntil = now + (4 * 60 * 1000); // 4 minutes

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.find('[data-testid="lock-warning-banner"]').exists()).toBe(true);
    });

    it('hides warning banner when >= 5 minutes remaining', () => {
      const now = Date.now();
      const lockedUntil = now + (6 * 60 * 1000); // 6 minutes

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.find('[data-testid="lock-warning-banner"]').exists()).toBe(false);
    });

    it('hides warning banner when < 2 minutes (modal shown instead)', () => {
      const now = Date.now();
      const lockedUntil = now + (1 * 60 * 1000); // 1 minute

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.find('[data-testid="lock-warning-banner"]').exists()).toBe(false);
    });

    it('has extend lock button in banner', () => {
      const now = Date.now();
      const lockedUntil = now + (4 * 60 * 1000); // 4 minutes

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.find('[data-testid="extend-lock-button-banner"]').exists()).toBe(true);
    });
  });

  describe('critical modal', () => {
    it('shows critical modal when < 2 minutes remaining', () => {
      const now = Date.now();
      const lockedUntil = now + (1 * 60 * 1000); // 1 minute

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.find('[data-testid="lock-critical-modal"]').exists()).toBe(true);
    });

    it('hides critical modal when >= 2 minutes remaining', () => {
      const now = Date.now();
      const lockedUntil = now + (3 * 60 * 1000); // 3 minutes

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.find('[data-testid="lock-critical-modal"]').exists()).toBe(false);
    });

    it('has extend lock button in modal', () => {
      const now = Date.now();
      const lockedUntil = now + (1 * 60 * 1000); // 1 minute

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.find('[data-testid="extend-lock-button-modal"]').exists()).toBe(true);
    });

    it('sets correct ARIA attributes on modal', () => {
      const now = Date.now();
      const lockedUntil = now + (1 * 60 * 1000); // 1 minute

      const wrapper = renderComponent({ lockedUntil });

      const modal = wrapper.find('[data-testid="lock-critical-modal"]');
      expect(modal.attributes('role')).toBe('dialog');
      expect(modal.attributes('aria-modal')).toBe('true');
      expect(modal.attributes('aria-labelledby')).toBe('lock-modal-title');
    });
  });

  describe('time formatting', () => {
    it('formats minutes and seconds correctly', () => {
      const now = Date.now();
      const lockedUntil = now + (2 * 60 * 1000) + (30 * 1000); // 2 minutes 30 seconds

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.vm.formattedTimeRemaining).toBe('2 minutes 30 seconds');
    });

    it('formats single minute correctly', () => {
      const now = Date.now();
      const lockedUntil = now + (1 * 60 * 1000) + (15 * 1000); // 1 minute 15 seconds

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.vm.formattedTimeRemaining).toBe('1 minute 15 seconds');
    });

    it('formats seconds only when < 1 minute', () => {
      const now = Date.now();
      const lockedUntil = now + (45 * 1000); // 45 seconds

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.vm.formattedTimeRemaining).toBe('45 seconds');
    });

    it('formats single second correctly', () => {
      const now = Date.now();
      const lockedUntil = now + 1000; // 1 second

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.vm.formattedTimeRemaining).toBe('1 second');
    });

    it('formats minutes without seconds', () => {
      const now = Date.now();
      const lockedUntil = now + (3 * 60 * 1000); // Exactly 3 minutes

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.vm.formattedTimeRemaining).toBe('3 minutes');
    });
  });

  describe('events', () => {
    it('emits extend-lock when banner button clicked', async () => {
      const now = Date.now();
      const lockedUntil = now + (4 * 60 * 1000); // 4 minutes

      const wrapper = renderComponent({ lockedUntil });

      await wrapper.find('[data-testid="extend-lock-button-banner"]').trigger('click');

      expect(wrapper.emitted('extend-lock')).toBeTruthy();
    });

    it('emits extend-lock when modal button clicked', async () => {
      const now = Date.now();
      const lockedUntil = now + (1 * 60 * 1000); // 1 minute

      const wrapper = renderComponent({ lockedUntil });

      await wrapper.find('[data-testid="extend-lock-button-modal"]').trigger('click');

      expect(wrapper.emitted('extend-lock')).toBeTruthy();
    });

    it('calls onExtend callback when provided', async () => {
      const now = Date.now();
      const lockedUntil = now + (4 * 60 * 1000); // 4 minutes
      const onExtend = jest.fn();

      const wrapper = renderComponent({ lockedUntil, onExtend });

      await wrapper.find('[data-testid="extend-lock-button-banner"]').trigger('click');

      expect(onExtend).toHaveBeenCalled();
    });

    it('emits lock-expired when time reaches 0', async () => {
      const now = Date.now();
      const lockedUntil = now + 2000; // 2 seconds

      const wrapper = renderComponent({ lockedUntil });

      // Fast-forward time
      jest.advanceTimersByTime(3000);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('lock-expired')).toBeTruthy();
    });
  });

  describe('countdown timer', () => {
    it('starts countdown on mount', () => {
      const now = Date.now();
      const lockedUntil = now + (5 * 60 * 1000); // 5 minutes

      const wrapper = renderComponent({ lockedUntil });

      expect(wrapper.vm.intervalId).not.toBeNull();
    });

    it('updates current time every second', async () => {
      const now = Date.now();
      const lockedUntil = now + (5 * 60 * 1000); // 5 minutes

      const wrapper = renderComponent({ lockedUntil });

      const initialTime = wrapper.vm.currentTime;

      jest.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentTime).toBeGreaterThan(initialTime);
    });

    it('clears interval on unmount', () => {
      const now = Date.now();
      const lockedUntil = now + (5 * 60 * 1000); // 5 minutes

      const wrapper = renderComponent({ lockedUntil });

      const intervalId = wrapper.vm.intervalId;
      wrapper.unmount();

      expect(wrapper.vm.intervalId).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('sets role="alert" on warning banner', () => {
      const now = Date.now();
      const lockedUntil = now + (4 * 60 * 1000); // 4 minutes

      const wrapper = renderComponent({ lockedUntil });

      const banner = wrapper.find('[data-testid="lock-warning-banner"]');
      expect(banner.attributes('role')).toBe('alert');
    });
  });
});
