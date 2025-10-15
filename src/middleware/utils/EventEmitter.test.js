// src/middleware/utils/EventEmitter.test.js

const EventEmitter = require('./EventEmitter');

describe('EventEmitter', () => {
  let emitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('on()', () => {
    test('should register an event listener', () => {
      const callback = jest.fn();

      emitter.on('test-event', callback);

      expect(emitter.listenerCount('test-event')).toBe(1);
    });

    test('should allow multiple listeners for the same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on('test-event', callback1);
      emitter.on('test-event', callback2);

      expect(emitter.listenerCount('test-event')).toBe(2);
    });

    test('should throw TypeError if callback is not a function', () => {
      expect(() => {
        emitter.on('test-event', 'not-a-function');
      }).toThrow(TypeError);
      expect(() => {
        emitter.on('test-event', 'not-a-function');
      }).toThrow('Callback must be a function');
    });

    test('should return this for chaining', () => {
      const callback = jest.fn();
      const result = emitter.on('test-event', callback);

      expect(result).toBe(emitter);
    });
  });

  describe('once()', () => {
    test('should register a one-time listener', () => {
      const callback = jest.fn();

      emitter.once('test-event', callback);

      // Should have one listener initially
      expect(emitter.listenerCount('test-event')).toBe(1);

      // Emit first time - callback should be called
      emitter.emit('test-event', { value: 1 });
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ value: 1 });

      // Emit second time - callback should not be called again
      emitter.emit('test-event', { value: 2 });
      expect(callback).toHaveBeenCalledTimes(1);

      // Listener should be removed after first call
      expect(emitter.listenerCount('test-event')).toBe(0);
    });

    test('should throw TypeError if callback is not a function', () => {
      expect(() => {
        emitter.once('test-event', null);
      }).toThrow(TypeError);
    });

    test('should return this for chaining', () => {
      const callback = jest.fn();
      const result = emitter.once('test-event', callback);

      expect(result).toBe(emitter);
    });
  });

  describe('off()', () => {
    test('should remove specific listener', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on('test-event', callback1);
      emitter.on('test-event', callback2);

      emitter.off('test-event', callback1);

      expect(emitter.listenerCount('test-event')).toBe(1);

      emitter.emit('test-event', { value: 1 });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    test('should remove all listeners if no callback specified', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on('test-event', callback1);
      emitter.on('test-event', callback2);

      emitter.off('test-event');

      expect(emitter.listenerCount('test-event')).toBe(0);
    });

    test('should handle removing listener for non-existent event', () => {
      const callback = jest.fn();

      expect(() => {
        emitter.off('non-existent', callback);
      }).not.toThrow();
    });

    test('should return this for chaining', () => {
      const callback = jest.fn();

      emitter.on('test-event', callback);
      const result = emitter.off('test-event', callback);

      expect(result).toBe(emitter);
    });
  });

  describe('emit()', () => {
    test('should call all registered listeners with data', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const data = { value: 42 };

      emitter.on('test-event', callback1);
      emitter.on('test-event', callback2);

      emitter.emit('test-event', data);

      expect(callback1).toHaveBeenCalledWith(data);
      expect(callback2).toHaveBeenCalledWith(data);
    });

    test('should handle emitting event with no listeners', () => {
      expect(() => {
        emitter.emit('non-existent', { value: 1 });
      }).not.toThrow();
    });

    test('should catch errors in listeners without stopping other listeners', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Listener error');
      });
      const successCallback = jest.fn();

      // Mock console.error to verify error is logged
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      emitter.on('test-event', errorCallback);
      emitter.on('test-event', successCallback);

      emitter.emit('test-event', { value: 1 });

      // Both callbacks should have been called
      expect(errorCallback).toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalled();

      // Error should have been logged
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    test('should return this for chaining', () => {
      const callback = jest.fn();

      emitter.on('test-event', callback);
      const result = emitter.emit('test-event', {});

      expect(result).toBe(emitter);
    });

    test('should handle listeners that remove themselves during emit', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn(() => {
        emitter.off('test-event', callback2);
      });
      const callback3 = jest.fn();

      emitter.on('test-event', callback1);
      emitter.on('test-event', callback2);
      emitter.on('test-event', callback3);

      emitter.emit('test-event', { value: 1 });

      // All callbacks should be called on first emit
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);

      // On second emit, callback2 should not be called
      emitter.emit('test-event', { value: 2 });

      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeAllListeners()', () => {
    test('should remove all listeners for all events', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on('event1', callback1);
      emitter.on('event2', callback2);

      expect(emitter.eventNames()).toHaveLength(2);

      emitter.removeAllListeners();

      expect(emitter.eventNames()).toHaveLength(0);
      expect(emitter.listenerCount('event1')).toBe(0);
      expect(emitter.listenerCount('event2')).toBe(0);
    });

    test('should return this for chaining', () => {
      const result = emitter.removeAllListeners();

      expect(result).toBe(emitter);
    });
  });

  describe('listenerCount()', () => {
    test('should return correct count of listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      expect(emitter.listenerCount('test-event')).toBe(0);

      emitter.on('test-event', callback1);
      expect(emitter.listenerCount('test-event')).toBe(1);

      emitter.on('test-event', callback2);
      expect(emitter.listenerCount('test-event')).toBe(2);

      emitter.off('test-event', callback1);
      expect(emitter.listenerCount('test-event')).toBe(1);
    });

    test('should return 0 for non-existent event', () => {
      expect(emitter.listenerCount('non-existent')).toBe(0);
    });
  });

  describe('eventNames()', () => {
    test('should return array of event names with listeners', () => {
      const callback = jest.fn();

      emitter.on('event1', callback);
      emitter.on('event2', callback);
      emitter.on('event3', callback);

      const eventNames = emitter.eventNames();

      expect(eventNames).toHaveLength(3);
      expect(eventNames).toContain('event1');
      expect(eventNames).toContain('event2');
      expect(eventNames).toContain('event3');
    });

    test('should return empty array when no listeners', () => {
      expect(emitter.eventNames()).toEqual([]);
    });

    test('should not include events with no listeners after removal', () => {
      const callback = jest.fn();

      emitter.on('event1', callback);
      emitter.on('event2', callback);

      emitter.off('event1');

      const eventNames = emitter.eventNames();

      expect(eventNames).toHaveLength(1);
      expect(eventNames).toContain('event2');
      expect(eventNames).not.toContain('event1');
    });
  });

  describe('chaining', () => {
    test('should allow method chaining', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      emitter
        .on('event1', callback1)
        .on('event2', callback2)
        .once('event3', callback3)
        .emit('event1', { value: 1 })
        .emit('event2', { value: 2 });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
});

