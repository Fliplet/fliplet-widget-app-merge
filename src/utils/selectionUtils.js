// src/utils/selectionUtils.js

/**
 * Calculate the difference between two selection arrays
 * @param {Array} current - Current selection IDs
 * @param {Array} previous - Previous selection IDs
 * @returns {{added: Array, removed: Array}} Object with added and removed IDs
 */
export function calculateSelectionDiff(current, previous) {
  const added = current.filter(id => !previous.includes(id));
  const removed = previous.filter(id => !current.includes(id));

  return { added, removed };
}

/**
 * Map rows to their IDs
 * @param {Array} rows - Array of row objects
 * @returns {Array} Array of IDs
 */
export function mapRowsToIds(rows = []) {
  return rows.map(row => row.id);
}

/**
 * Process nested selection changes and emit toggle events
 * @param {Object} params - Parameters object
 * @param {Array} params.selectedRows - Currently selected rows
 * @param {Array} params.previousSelection - Previous selection IDs
 * @param {Function} params.onToggle - Callback for each toggle (id, selected)
 * @returns {{selectedIds: Array, added: Array, removed: Array}} Selection state
 */
export function processNestedSelectionChange({
  selectedRows = [],
  previousSelection = [],
  onToggle
}) {
  const selectedIds = mapRowsToIds(selectedRows);
  const { added, removed } = calculateSelectionDiff(selectedIds, previousSelection);

  if (onToggle && typeof onToggle === 'function') {
    added.forEach(id => onToggle(id, true));
    removed.forEach(id => onToggle(id, false));
  }

  return {
    selectedIds,
    added,
    removed
  };
}

