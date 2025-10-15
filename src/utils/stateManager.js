// src/utils/stateManager.js

/**
 * Simple state manager for merge configuration
 * Note: State is temporary and not persisted
 */

const state = {
  mergeConfiguration: {
    screens: [],
    dataSources: [],
    files: [],
    configurations: []
  },
  selectedDestinationApp: null,
  isAppsLocked: false
};

/**
 * Save selection for a specific category
 */
const saveSelection = (category, items) => {
  if (!['screens', 'dataSources', 'files', 'configurations'].includes(category)) {
    throw new Error(`Invalid category: ${category}`);
  }

  state.mergeConfiguration[category] = items;
};

/**
 * Get selection for a specific category
 */
const getSelection = (category) => {
  if (!category) {
    return state.mergeConfiguration;
  }

  if (!['screens', 'dataSources', 'files', 'configurations'].includes(category)) {
    throw new Error(`Invalid category: ${category}`);
  }

  return state.mergeConfiguration[category];
};

/**
 * Clear all selections
 */
const clearSelection = () => {
  state.mergeConfiguration = {
    screens: [],
    dataSources: [],
    files: [],
    configurations: []
  };
};

/**
 * Save destination app
 */
const setDestinationApp = (app) => {
  state.selectedDestinationApp = app;
};

/**
 * Get destination app
 */
const getDestinationApp = () => {
  return state.selectedDestinationApp;
};

/**
 * Set apps locked status
 */
const setAppsLocked = (locked) => {
  state.isAppsLocked = locked;
};

/**
 * Get apps locked status
 */
const getAppsLocked = () => {
  return state.isAppsLocked;
};

/**
 * Clear all state
 */
const clearAllState = () => {
  clearSelection();
  state.selectedDestinationApp = null;
  state.isAppsLocked = false;
};

/**
 * Get entire state (for debugging)
 */
const getState = () => {
  return { ...state };
};

module.exports = {
  saveSelection,
  getSelection,
  clearSelection,
  setDestinationApp,
  getDestinationApp,
  setAppsLocked,
  getAppsLocked,
  clearAllState,
  getState
};

