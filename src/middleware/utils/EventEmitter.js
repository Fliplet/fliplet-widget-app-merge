// src/middleware/utils/EventEmitter.js

/**
 * EventEmitter - Simple event system for component communication
 *
 * Provides a publish-subscribe pattern for decoupled communication between
 * middleware components and the UI layer.
 *
 * @class EventEmitter
 */
class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * Register an event listener
   *
   * @param {string} event - Event name to listen for
   * @param {Function} callback - Function to call when event is emitted
   * @returns {EventEmitter} Returns this for chaining
   *
   * @example
   * emitter.on('merge:progress', (data) => {
   *   console.log('Progress:', data.progress);
   * });
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);

    return this;
  }

  /**
   * Register a one-time event listener
   *
   * The listener will be automatically removed after it's called once.
   *
   * @param {string} event - Event name to listen for
   * @param {Function} callback - Function to call when event is emitted
   * @returns {EventEmitter} Returns this for chaining
   *
   * @example
   * emitter.once('merge:complete', (data) => {
   *   console.log('Merge completed:', data.mergeId);
   * });
   */
  once(event, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };

    return this.on(event, onceWrapper);
  }

  /**
   * Unregister an event listener
   *
   * If no callback is provided, removes all listeners for the event.
   * If callback is provided, removes only that specific listener.
   *
   * @param {string} event - Event name to stop listening for
   * @param {Function} [callback] - Specific callback to remove (optional)
   * @returns {EventEmitter} Returns this for chaining
   *
   * @example
   * // Remove all listeners for an event
   * emitter.off('merge:progress');
   *
   * // Remove specific listener
   * emitter.off('merge:progress', myCallback);
   */
  off(event, callback) {
    if (!this.events[event]) {
      return this;
    }

    // If no callback specified, remove all listeners for this event
    if (!callback) {
      delete this.events[event];

      return this;
    }

    // Remove specific callback
    this.events[event] = this.events[event].filter((cb) => cb !== callback);

    // Clean up empty event arrays
    if (this.events[event].length === 0) {
      delete this.events[event];
    }

    return this;
  }

  /**
   * Emit an event to all registered listeners
   *
   * All registered listeners will be called with the provided data.
   *
   * @param {string} event - Event name to emit
   * @param {*} data - Data to pass to listeners
   * @returns {EventEmitter} Returns this for chaining
   *
   * @example
   * emitter.emit('merge:progress', {
   *   mergeId: 123,
   *   progress: 45,
   *   stage: 'screens'
   * });
   */
  emit(event, data) {
    if (!this.events[event]) {
      return this;
    }

    // Create a copy of the listeners array to avoid issues if listeners
    // are removed during emission
    const listeners = [...this.events[event]];

    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        // Log error but don't stop other listeners from executing
        console.error(`Error in event listener for "${event}":`, error);
      }
    });

    return this;
  }

  /**
   * Remove all event listeners
   *
   * Useful for cleanup when destroying components.
   *
   * @returns {EventEmitter} Returns this for chaining
   *
   * @example
   * emitter.removeAllListeners();
   */
  removeAllListeners() {
    this.events = {};

    return this;
  }

  /**
   * Get count of listeners for an event
   *
   * @param {string} event - Event name to check
   * @returns {number} Number of listeners for the event
   *
   * @example
   * const count = emitter.listenerCount('merge:progress');
   */
  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }

  /**
   * Get list of events with listeners
   *
   * @returns {string[]} Array of event names that have listeners
   *
   * @example
   * const events = emitter.eventNames();
   * // ['merge:progress', 'merge:complete']
   */
  eventNames() {
    return Object.keys(this.events);
  }
}

export default EventEmitter;

