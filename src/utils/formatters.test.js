const formatters = require('./formatters');

describe('formatters', () => {
  describe('formatDate', () => {
    it('formats valid timestamp as date string', () => {
      const timestamp = new Date('2025-01-15T10:30:00').getTime();
      const result = formatters.formatDate(timestamp);
      
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });

    it('handles custom options', () => {
      const timestamp = new Date('2025-01-15T10:30:00').getTime();
      const result = formatters.formatDate(timestamp, { month: 'long' });
      
      expect(result).toContain('January');
    });

    it('returns "Unknown" for null timestamp', () => {
      expect(formatters.formatDate(null)).toBe('Unknown');
    });

    it('returns "Unknown" for undefined timestamp', () => {
      expect(formatters.formatDate(undefined)).toBe('Unknown');
    });

    it('returns "Invalid date" for invalid timestamp', () => {
      expect(formatters.formatDate('invalid')).toBe('Invalid date');
    });
  });

  describe('formatFileSize', () => {
    it('formats 0 bytes', () => {
      expect(formatters.formatFileSize(0)).toBe('0 B');
    });

    it('formats bytes', () => {
      expect(formatters.formatFileSize(500)).toBe('500.00 B');
    });

    it('formats kilobytes', () => {
      expect(formatters.formatFileSize(1024)).toBe('1.00 KB');
    });

    it('formats megabytes', () => {
      expect(formatters.formatFileSize(1048576)).toBe('1.00 MB');
    });

    it('formats gigabytes', () => {
      expect(formatters.formatFileSize(1073741824)).toBe('1.00 GB');
    });

    it('formats terabytes', () => {
      expect(formatters.formatFileSize(1099511627776)).toBe('1.00 TB');
    });

    it('returns "0 B" for null', () => {
      expect(formatters.formatFileSize(null)).toBe('0 B');
    });

    it('returns "0 B" for undefined', () => {
      expect(formatters.formatFileSize(undefined)).toBe('0 B');
    });

    it('returns "Invalid size" for negative numbers', () => {
      expect(formatters.formatFileSize(-100)).toBe('Invalid size');
    });
  });

  describe('formatNumber', () => {
    it('formats number with commas', () => {
      expect(formatters.formatNumber(1000)).toBe('1,000');
      expect(formatters.formatNumber(1000000)).toBe('1,000,000');
    });

    it('formats decimals', () => {
      expect(formatters.formatNumber(1234.56)).toBe('1,234.56');
    });

    it('handles string numbers', () => {
      expect(formatters.formatNumber('1000')).toBe('1,000');
    });

    it('returns "0" for null', () => {
      expect(formatters.formatNumber(null)).toBe('0');
    });

    it('returns "0" for undefined', () => {
      expect(formatters.formatNumber(undefined)).toBe('0');
    });

    it('returns "0" for invalid string', () => {
      expect(formatters.formatNumber('invalid')).toBe('0');
    });

    it('handles zero', () => {
      expect(formatters.formatNumber(0)).toBe('0');
    });
  });

  describe('formatDuration', () => {
    it('formats seconds only', () => {
      expect(formatters.formatDuration(45)).toBe('45s');
    });

    it('formats minutes and seconds', () => {
      expect(formatters.formatDuration(90)).toBe('1m 30s');
    });

    it('formats hours, minutes, and seconds', () => {
      expect(formatters.formatDuration(3665)).toBe('1h 1m 5s');
    });

    it('formats hours only', () => {
      expect(formatters.formatDuration(3600)).toBe('1h');
    });

    it('handles zero', () => {
      expect(formatters.formatDuration(0)).toBe('0s');
    });

    it('returns "0s" for null', () => {
      expect(formatters.formatDuration(null)).toBe('0s');
    });

    it('returns "0s" for undefined', () => {
      expect(formatters.formatDuration(undefined)).toBe('0s');
    });

    it('returns "0s" for negative numbers', () => {
      expect(formatters.formatDuration(-10)).toBe('0s');
    });
  });

  describe('formatTimestamp', () => {
    const timestamp = new Date('2025-01-15T10:30:00').getTime();

    it('formats with "full" format by default', () => {
      const result = formatters.formatTimestamp(timestamp);
      
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2025');
      expect(result).toContain(':');
    });

    it('formats with "date-only" format', () => {
      const result = formatters.formatTimestamp(timestamp, 'date-only');
      
      expect(result).toContain('Jan');
      expect(result).not.toContain(':');
    });

    it('formats with "time-only" format', () => {
      const result = formatters.formatTimestamp(timestamp, 'time-only');
      
      expect(result).toContain(':');
    });

    it('formats with "iso" format', () => {
      const result = formatters.formatTimestamp(timestamp, 'iso');
      
      expect(result).toContain('T');
      expect(result).toContain('Z');
    });

    it('formats with "relative" format', () => {
      const result = formatters.formatTimestamp(Date.now() - 60000, 'relative');
      
      expect(result).toContain('minute');
    });

    it('returns "Unknown" for null', () => {
      expect(formatters.formatTimestamp(null)).toBe('Unknown');
    });

    it('returns "Invalid date" for invalid timestamp', () => {
      expect(formatters.formatTimestamp('invalid')).toBe('Invalid date');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "just now" for recent times', () => {
      const date = new Date(Date.now() - 30000); // 30 seconds ago
      expect(formatters.formatRelativeTime(date)).toBe('just now');
    });

    it('returns minutes ago', () => {
      const date = new Date(Date.now() - 120000); // 2 minutes ago
      const result = formatters.formatRelativeTime(date);
      expect(result).toContain('minute');
      expect(result).toContain('ago');
    });

    it('returns hours ago', () => {
      const date = new Date(Date.now() - 7200000); // 2 hours ago
      const result = formatters.formatRelativeTime(date);
      expect(result).toContain('hour');
      expect(result).toContain('ago');
    });

    it('returns days ago', () => {
      const date = new Date(Date.now() - 172800000); // 2 days ago
      const result = formatters.formatRelativeTime(date);
      expect(result).toContain('day');
      expect(result).toContain('ago');
    });

    it('returns months ago', () => {
      const date = new Date(Date.now() - 5184000000); // ~60 days ago
      const result = formatters.formatRelativeTime(date);
      expect(result).toContain('month');
      expect(result).toContain('ago');
    });

    it('returns years ago', () => {
      const date = new Date(Date.now() - 63072000000); // ~2 years ago
      const result = formatters.formatRelativeTime(date);
      expect(result).toContain('year');
      expect(result).toContain('ago');
    });

    it('handles singular time units', () => {
      const date = new Date(Date.now() - 60000); // 1 minute ago
      expect(formatters.formatRelativeTime(date)).toBe('1 minute ago');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage with default decimals', () => {
      expect(formatters.formatPercentage(50)).toBe('50%');
    });

    it('formats percentage with specified decimals', () => {
      expect(formatters.formatPercentage(50.5555, 2)).toBe('50.56%');
    });

    it('handles string numbers', () => {
      expect(formatters.formatPercentage('75')).toBe('75%');
    });

    it('returns "0%" for null', () => {
      expect(formatters.formatPercentage(null)).toBe('0%');
    });

    it('returns "0%" for undefined', () => {
      expect(formatters.formatPercentage(undefined)).toBe('0%');
    });

    it('returns "0%" for invalid string', () => {
      expect(formatters.formatPercentage('invalid')).toBe('0%');
    });

    it('handles zero', () => {
      expect(formatters.formatPercentage(0)).toBe('0%');
    });
  });

  describe('truncateText', () => {
    it('truncates text longer than max length', () => {
      const text = 'This is a long text that needs to be truncated';
      const result = formatters.truncateText(text, 20);
      
      expect(result).toBe('This is a long text ...');
      expect(result.length).toBe(23); // 20 + 3 for '...'
    });

    it('does not truncate text shorter than max length', () => {
      const text = 'Short text';
      const result = formatters.truncateText(text, 20);
      
      expect(result).toBe('Short text');
    });

    it('uses custom suffix', () => {
      const text = 'This is a long text';
      const result = formatters.truncateText(text, 10, '…');
      
      expect(result).toBe('This is a …');
    });

    it('returns empty string for null', () => {
      expect(formatters.truncateText(null, 10)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(formatters.truncateText(undefined, 10)).toBe('');
    });

    it('handles text exactly at max length', () => {
      const text = 'Exact length';
      const result = formatters.truncateText(text, 12);
      
      expect(result).toBe('Exact length');
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats 10-digit US phone number', () => {
      expect(formatters.formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });

    it('formats phone number with special characters', () => {
      expect(formatters.formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
    });

    it('returns original for non-10-digit numbers', () => {
      expect(formatters.formatPhoneNumber('123456')).toBe('123456');
    });

    it('returns empty string for null', () => {
      expect(formatters.formatPhoneNumber(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(formatters.formatPhoneNumber(undefined)).toBe('');
    });

    it('handles phone with spaces and dashes', () => {
      expect(formatters.formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
    });
  });
});

