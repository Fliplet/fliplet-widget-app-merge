// src/middleware/core/StateManager.test.js

const StateManager = require('./StateManager');

describe('StateManager', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe('constructor', () => {
    test('should initialize with complete state structure', () => {
      const state = stateManager.getState();

      expect(state).toHaveProperty('mergeConfiguration');
      expect(state).toHaveProperty('lockStatus');
      expect(state).toHaveProperty('mergeStatus');
      expect(state).toHaveProperty('validationState');
      expect(state).toHaveProperty('cache');
    });

    test('should initialize merge status as not_started', () => {
      const status = stateManager.getState('mergeStatus.status');

      expect(status).toBe('not_started');
    });

    test('should initialize with empty selected resources', () => {
      expect(stateManager.getState('mergeConfiguration.selectedPages')).toEqual([]);
      expect(stateManager.getState('mergeConfiguration.selectedDataSources')).toEqual([]);
      expect(stateManager.getState('mergeConfiguration.selectedFiles')).toEqual([]);
    });
  });

  describe('getState()', () => {
    test('should return entire state when no path provided', () => {
      const state = stateManager.getState();

      expect(state).toHaveProperty('mergeConfiguration');
      expect(state).toHaveProperty('mergeStatus');
    });

    test('should return value at simple path', () => {
      stateManager.setState('mergeStatus.status', 'in_progress');

      const status = stateManager.getState('mergeStatus.status');

      expect(status).toBe('in_progress');
    });

    test('should return value at nested path', () => {
      stateManager.setState('mergeConfiguration.sourceApp.id', 123);

      const appId = stateManager.getState('mergeConfiguration.sourceApp.id');

      expect(appId).toBe(123);
    });

    test('should return undefined for non-existent path', () => {
      const value = stateManager.getState('non.existent.path');

      expect(value).toBeUndefined();
    });

    test('should return deep clone to prevent mutations', () => {
      const sourceApp = stateManager.getState('mergeConfiguration.sourceApp');

      sourceApp.id = 999;

      const sourceAppAgain = stateManager.getState('mergeConfiguration.sourceApp');

      expect(sourceAppAgain.id).toBeNull();
    });
  });

  describe('setState()', () => {
    test('should set value at simple path', () => {
      stateManager.setState('mergeStatus.progress', 50);

      expect(stateManager.getState('mergeStatus.progress')).toBe(50);
    });

    test('should set value at nested path', () => {
      stateManager.setState('mergeConfiguration.sourceApp.id', 456);

      expect(stateManager.getState('mergeConfiguration.sourceApp.id')).toBe(456);
    });

    test('should emit state:change event', () => {
      const callback = jest.fn();

      stateManager.on('state:change', callback);
      stateManager.setState('mergeStatus.progress', 75);

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'mergeStatus.progress',
          newValue: 75
        })
      );
    });

    test('should include old value in change event', () => {
      stateManager.setState('mergeStatus.progress', 25);

      const callback = jest.fn();

      stateManager.on('state:change', callback);
      stateManager.setState('mergeStatus.progress', 50);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          oldValue: 25,
          newValue: 50
        })
      );
    });

    test('should return this for chaining', () => {
      const result = stateManager.setState('mergeStatus.progress', 30);

      expect(result).toBe(stateManager);
    });

    test('should handle setting array values', () => {
      const pages = [{ id: 1, name: 'Page 1' }, { id: 2, name: 'Page 2' }];

      stateManager.setState('mergeConfiguration.selectedPages', pages);

      expect(stateManager.getState('mergeConfiguration.selectedPages')).toEqual(pages);
    });

    test('should handle setting object values', () => {
      const sourceApp = { id: 123, name: 'Test App', organizationId: 456 };

      stateManager.setState('mergeConfiguration.sourceApp', sourceApp);

      expect(stateManager.getState('mergeConfiguration.sourceApp')).toMatchObject(sourceApp);
    });
  });

  describe('clearState()', () => {
    test('should reset all state to initial values', () => {
      stateManager.setState('mergeStatus.status', 'completed');
      stateManager.setState('mergeConfiguration.sourceApp.id', 123);
      stateManager.setState('mergeStatus.progress', 100);

      stateManager.clearState();

      expect(stateManager.getState('mergeStatus.status')).toBe('not_started');
      expect(stateManager.getState('mergeConfiguration.sourceApp.id')).toBeNull();
      expect(stateManager.getState('mergeStatus.progress')).toBe(0);
    });

    test('should emit state:cleared event', () => {
      const callback = jest.fn();

      stateManager.on('state:cleared', callback);
      stateManager.clearState();

      expect(callback).toHaveBeenCalled();
    });

    test('should return this for chaining', () => {
      const result = stateManager.clearState();

      expect(result).toBe(stateManager);
    });
  });

  describe('validateStateTransition()', () => {
    test('should allow valid transitions', () => {
      const validTransitions = [
        ['not_started', 'destination_selected'],
        ['destination_selected', 'configuring_resources'],
        ['configuring_resources', 'reviewing_preview'],
        ['reviewing_preview', 'merge_in_progress'],
        ['merge_in_progress', 'completed']
      ];

      validTransitions.forEach(([from, to]) => {
        expect(stateManager.validateStateTransition(from, to)).toBe(true);
      });
    });

    test('should allow cancellation from any state', () => {
      const states = [
        'not_started',
        'destination_selected',
        'configuring_resources',
        'reviewing_preview',
        'merge_in_progress'
      ];

      states.forEach((state) => {
        expect(stateManager.validateStateTransition(state, 'cancelled')).toBe(true);
      });
    });

    test('should allow resetting to not_started from terminal states', () => {
      expect(stateManager.validateStateTransition('completed', 'not_started')).toBe(true);
      expect(stateManager.validateStateTransition('error', 'not_started')).toBe(true);
      expect(stateManager.validateStateTransition('cancelled', 'not_started')).toBe(true);
    });

    test('should disallow invalid transitions', () => {
      const invalidTransitions = [
        ['not_started', 'completed'],
        ['destination_selected', 'merge_in_progress'],
        ['completed', 'in_progress'],
        ['not_started', 'reviewing_preview']
      ];

      invalidTransitions.forEach(([from, to]) => {
        expect(stateManager.validateStateTransition(from, to)).toBe(false);
      });
    });

    test('should return false for unknown states', () => {
      expect(stateManager.validateStateTransition('unknown_state', 'not_started')).toBe(false);
    });
  });

  describe('getCurrentStatus()', () => {
    test('should return current merge status', () => {
      expect(stateManager.getCurrentStatus()).toBe('not_started');

      stateManager.setState('mergeStatus.status', 'in_progress');

      expect(stateManager.getCurrentStatus()).toBe('in_progress');
    });
  });

  describe('updateMergeStatus()', () => {
    test('should update status when transition is valid', () => {
      const result = stateManager.updateMergeStatus('destination_selected');

      expect(result).toBe(true);
      expect(stateManager.getCurrentStatus()).toBe('destination_selected');
    });

    test('should not update status when transition is invalid', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = stateManager.updateMergeStatus('completed');

      expect(result).toBe(false);
      expect(stateManager.getCurrentStatus()).toBe('not_started');
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    test('should update additional data fields', () => {
      stateManager.updateMergeStatus('destination_selected');
      stateManager.updateMergeStatus('configuring_resources');
      stateManager.updateMergeStatus('reviewing_preview');
      stateManager.updateMergeStatus('merge_in_progress', {
        currentStage: 'screens',
        progress: 45,
        mergeId: 123
      });

      expect(stateManager.getState('mergeStatus.currentStage')).toBe('screens');
      expect(stateManager.getState('mergeStatus.progress')).toBe(45);
      expect(stateManager.getState('mergeStatus.mergeId')).toBe(123);
    });

    test('should emit merge:status:change event', () => {
      const callback = jest.fn();

      stateManager.on('merge:status:change', callback);
      stateManager.updateMergeStatus('destination_selected');

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'not_started',
          to: 'destination_selected'
        })
      );
    });
  });

  describe('event subscription', () => {
    test('on() should subscribe to events', () => {
      const callback = jest.fn();

      stateManager.on('state:change', callback);
      stateManager.setState('mergeStatus.progress', 10);

      expect(callback).toHaveBeenCalled();
    });

    test('off() should unsubscribe from events', () => {
      const callback = jest.fn();

      stateManager.on('state:change', callback);
      stateManager.off('state:change', callback);
      stateManager.setState('mergeStatus.progress', 20);

      expect(callback).not.toHaveBeenCalled();
    });

    test('once() should subscribe to events once', () => {
      const callback = jest.fn();

      stateManager.once('state:change', callback);
      stateManager.setState('mergeStatus.progress', 30);
      stateManager.setState('mergeStatus.progress', 40);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should support method chaining for event methods', () => {
      const callback = jest.fn();

      const result = stateManager
        .on('state:change', callback)
        .off('state:change', callback)
        .once('state:cleared', callback);

      expect(result).toBe(stateManager);
    });
  });

  describe('validation error management', () => {
    test('getValidationErrors() should return empty array initially', () => {
      expect(stateManager.getValidationErrors()).toEqual([]);
    });

    test('addValidationError() should add error to list', () => {
      const error = { field: 'sourceApp', message: 'Required field', type: 'required' };

      stateManager.addValidationError(error);

      const errors = stateManager.getValidationErrors();

      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject(error);
      expect(errors[0]).toHaveProperty('timestamp');
    });

    test('addValidationError() should set hasErrors flag', () => {
      stateManager.addValidationError({ field: 'test', message: 'Error', type: 'validation' });

      expect(stateManager.getState('validationState.hasErrors')).toBe(true);
    });

    test('clearValidationErrors() should remove all errors', () => {
      stateManager.addValidationError({ field: 'field1', message: 'Error 1', type: 'validation' });
      stateManager.addValidationError({ field: 'field2', message: 'Error 2', type: 'validation' });

      stateManager.clearValidationErrors();

      expect(stateManager.getValidationErrors()).toEqual([]);
      expect(stateManager.getState('validationState.hasErrors')).toBe(false);
    });

    test('should support method chaining for validation methods', () => {
      const result = stateManager
        .addValidationError({ field: 'test', message: 'Error', type: 'validation' })
        .clearValidationErrors();

      expect(result).toBe(stateManager);
    });
  });
});

