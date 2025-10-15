// src/utils/selectionUtils.test.js

const {
  calculateSelectionDiff,
  mapRowsToIds,
  processNestedSelectionChange
} = require('./selectionUtils');

describe('selectionUtils', () => {
  describe('calculateSelectionDiff', () => {
    it('returns added items when current has new items', () => {
      const current = [1, 2, 3];
      const previous = [1, 2];

      const result = calculateSelectionDiff(current, previous);

      expect(result.added).toEqual([3]);
      expect(result.removed).toEqual([]);
    });

    it('returns removed items when previous has items not in current', () => {
      const current = [1, 2];
      const previous = [1, 2, 3];

      const result = calculateSelectionDiff(current, previous);

      expect(result.added).toEqual([]);
      expect(result.removed).toEqual([3]);
    });

    it('returns both added and removed when selections differ', () => {
      const current = [1, 3, 4];
      const previous = [1, 2];

      const result = calculateSelectionDiff(current, previous);

      expect(result.added).toEqual([3, 4]);
      expect(result.removed).toEqual([2]);
    });

    it('returns empty arrays when selections are identical', () => {
      const current = [1, 2, 3];
      const previous = [1, 2, 3];

      const result = calculateSelectionDiff(current, previous);

      expect(result.added).toEqual([]);
      expect(result.removed).toEqual([]);
    });

    it('handles empty arrays', () => {
      const result1 = calculateSelectionDiff([], [1, 2]);
      expect(result1.added).toEqual([]);
      expect(result1.removed).toEqual([1, 2]);

      const result2 = calculateSelectionDiff([1, 2], []);
      expect(result2.added).toEqual([1, 2]);
      expect(result2.removed).toEqual([]);

      const result3 = calculateSelectionDiff([], []);
      expect(result3.added).toEqual([]);
      expect(result3.removed).toEqual([]);
    });
  });

  describe('mapRowsToIds', () => {
    it('extracts IDs from row objects', () => {
      const rows = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ];

      const result = mapRowsToIds(rows);

      expect(result).toEqual([1, 2, 3]);
    });

    it('handles empty array', () => {
      const result = mapRowsToIds([]);

      expect(result).toEqual([]);
    });

    it('handles undefined input', () => {
      const result = mapRowsToIds();

      expect(result).toEqual([]);
    });

    it('works with string IDs', () => {
      const rows = [
        { id: 'abc', name: 'Item 1' },
        { id: 'def', name: 'Item 2' }
      ];

      const result = mapRowsToIds(rows);

      expect(result).toEqual(['abc', 'def']);
    });
  });

  describe('processNestedSelectionChange', () => {
    it('processes selection change and calls onToggle for added items', () => {
      const onToggle = jest.fn();
      const selectedRows = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ];
      const previousSelection = [1, 2];

      const result = processNestedSelectionChange({
        selectedRows,
        previousSelection,
        onToggle
      });

      expect(result.selectedIds).toEqual([1, 2, 3]);
      expect(result.added).toEqual([3]);
      expect(result.removed).toEqual([]);
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledWith(3, true);
    });

    it('processes selection change and calls onToggle for removed items', () => {
      const onToggle = jest.fn();
      const selectedRows = [
        { id: 1, name: 'Item 1' }
      ];
      const previousSelection = [1, 2, 3];

      const result = processNestedSelectionChange({
        selectedRows,
        previousSelection,
        onToggle
      });

      expect(result.selectedIds).toEqual([1]);
      expect(result.added).toEqual([]);
      expect(result.removed).toEqual([2, 3]);
      expect(onToggle).toHaveBeenCalledTimes(2);
      expect(onToggle).toHaveBeenCalledWith(2, false);
      expect(onToggle).toHaveBeenCalledWith(3, false);
    });

    it('processes selection change with both added and removed', () => {
      const onToggle = jest.fn();
      const selectedRows = [
        { id: 1, name: 'Item 1' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' }
      ];
      const previousSelection = [1, 2];

      const result = processNestedSelectionChange({
        selectedRows,
        previousSelection,
        onToggle
      });

      expect(result.selectedIds).toEqual([1, 3, 4]);
      expect(result.added).toEqual([3, 4]);
      expect(result.removed).toEqual([2]);
      expect(onToggle).toHaveBeenCalledTimes(3);
      expect(onToggle).toHaveBeenCalledWith(3, true);
      expect(onToggle).toHaveBeenCalledWith(4, true);
      expect(onToggle).toHaveBeenCalledWith(2, false);
    });

    it('works without onToggle callback', () => {
      const selectedRows = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      const previousSelection = [1];

      const result = processNestedSelectionChange({
        selectedRows,
        previousSelection
      });

      expect(result.selectedIds).toEqual([1, 2]);
      expect(result.added).toEqual([2]);
      expect(result.removed).toEqual([]);
    });

    it('handles empty selections', () => {
      const onToggle = jest.fn();

      const result = processNestedSelectionChange({
        selectedRows: [],
        previousSelection: [],
        onToggle
      });

      expect(result.selectedIds).toEqual([]);
      expect(result.added).toEqual([]);
      expect(result.removed).toEqual([]);
      expect(onToggle).not.toHaveBeenCalled();
    });
  });
});

