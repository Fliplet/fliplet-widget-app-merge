const validators = require('./validators');

describe('validators', () => {
  describe('validateDuplicateNames', () => {
    it('returns empty array for empty input', () => {
      expect(validators.validateDuplicateNames([])).toEqual([]);
    });

    it('returns empty array for non-array input', () => {
      expect(validators.validateDuplicateNames(null)).toEqual([]);
    });

    it('detects duplicate names', () => {
      const items = [
        { id: 1, name: 'Test' },
        { id: 2, name: 'test' }, // Case insensitive duplicate
        { id: 3, name: 'Unique' }
      ];

      const duplicates = validators.validateDuplicateNames(items);
      
      expect(duplicates.length).toBe(2);
      expect(duplicates).toContainEqual({ id: 1, name: 'Test' });
      expect(duplicates).toContainEqual({ id: 2, name: 'test' });
    });

    it('uses custom field', () => {
      const items = [
        { id: 1, title: 'Test' },
        { id: 2, title: 'Test' },
        { id: 3, title: 'Unique' }
      ];

      const duplicates = validators.validateDuplicateNames(items, 'title');
      
      expect(duplicates.length).toBe(2);
    });

    it('ignores items with missing field', () => {
      const items = [
        { id: 1, name: 'Test' },
        { id: 2 }, // Missing name
        { id: 3, name: 'Test' }
      ];

      const duplicates = validators.validateDuplicateNames(items);
      
      expect(duplicates.length).toBe(2);
    });

    it('trims whitespace when comparing', () => {
      const items = [
        { id: 1, name: 'Test ' },
        { id: 2, name: ' Test' }
      ];

      const duplicates = validators.validateDuplicateNames(items);
      
      expect(duplicates.length).toBe(2);
    });
  });

  describe('validatePermissions', () => {
    it('returns false if user is null', () => {
      expect(validators.validatePermissions(null, 'publisher')).toBe(false);
    });

    it('returns true if no required role', () => {
      const user = { role: 'viewer' };
      expect(validators.validatePermissions(user, null)).toBe(true);
    });

    it('validates user role', () => {
      const user = { role: 'publisher' };
      expect(validators.validatePermissions(user, 'publisher')).toBe(true);
      expect(validators.validatePermissions(user, 'admin')).toBe(false);
    });

    it('validates permissions array', () => {
      const user = { permissions: ['read', 'write', 'publish'] };
      expect(validators.validatePermissions(user, 'publish')).toBe(true);
      expect(validators.validatePermissions(user, 'admin')).toBe(false);
    });

    it('validates roles array', () => {
      const user = { roles: ['viewer', 'publisher'] };
      expect(validators.validatePermissions(user, 'publisher')).toBe(true);
      expect(validators.validatePermissions(user, 'admin')).toBe(false);
    });
  });

  describe('validatePlanLimits', () => {
    it('returns valid for no limits', () => {
      const result = validators.validatePlanLimits({ screens: 10 }, null);
      
      expect(result.valid).toBe(true);
      expect(result.exceededLimits).toEqual([]);
    });

    it('detects exceeded limits', () => {
      const current = { screens: 15, dataSources: 5 };
      const limits = { screens: 10, dataSources: 10 };

      const result = validators.validatePlanLimits(current, limits);
      
      expect(result.valid).toBe(false);
      expect(result.exceededLimits).toHaveLength(1);
      expect(result.exceededLimits[0]).toEqual({
        key: 'screens',
        current: 15,
        limit: 10,
        excess: 5
      });
    });

    it('returns valid when within limits', () => {
      const current = { screens: 5, dataSources: 5 };
      const limits = { screens: 10, dataSources: 10 };

      const result = validators.validatePlanLimits(current, limits);
      
      expect(result.valid).toBe(true);
      expect(result.exceededLimits).toEqual([]);
    });

    it('ignores undefined values', () => {
      const current = { screens: 5 };
      const limits = { screens: 10, dataSources: 10 };

      const result = validators.validatePlanLimits(current, limits);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('validates correct email', () => {
      expect(validators.validateEmail('test@example.com')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(validators.validateEmail('invalid')).toBe(false);
      expect(validators.validateEmail('test@')).toBe(false);
      expect(validators.validateEmail('@example.com')).toBe(false);
      expect(validators.validateEmail('test @example.com')).toBe(false);
    });

    it('returns false for null', () => {
      expect(validators.validateEmail(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(validators.validateEmail(undefined)).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('validates correct URL', () => {
      expect(validators.validateUrl('https://example.com')).toBe(true);
      expect(validators.validateUrl('http://example.com')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(validators.validateUrl('invalid')).toBe(false);
      expect(validators.validateUrl('example.com')).toBe(false);
    });

    it('returns false for null', () => {
      expect(validators.validateUrl(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(validators.validateUrl(undefined)).toBe(false);
    });
  });

  describe('validateRequiredFields', () => {
    it('returns empty array when all fields present', () => {
      const obj = { name: 'Test', email: 'test@example.com', age: 25 };
      const required = ['name', 'email', 'age'];

      expect(validators.validateRequiredFields(obj, required)).toEqual([]);
    });

    it('detects missing fields', () => {
      const obj = { name: 'Test' };
      const required = ['name', 'email', 'age'];

      const missing = validators.validateRequiredFields(obj, required);
      
      expect(missing).toEqual(['email', 'age']);
    });

    it('treats null as missing', () => {
      const obj = { name: 'Test', email: null };
      const required = ['name', 'email'];

      const missing = validators.validateRequiredFields(obj, required);
      
      expect(missing).toEqual(['email']);
    });

    it('treats empty string as missing', () => {
      const obj = { name: 'Test', email: '' };
      const required = ['name', 'email'];

      const missing = validators.validateRequiredFields(obj, required);
      
      expect(missing).toEqual(['email']);
    });

    it('returns empty array for null object', () => {
      expect(validators.validateRequiredFields(null, ['name'])).toEqual([]);
    });

    it('returns empty array for non-array required fields', () => {
      expect(validators.validateRequiredFields({ name: 'Test' }, null)).toEqual([]);
    });
  });

  describe('validateLength', () => {
    it('validates string within range', () => {
      expect(validators.validateLength('test', 1, 10)).toBe(true);
    });

    it('rejects string too short', () => {
      expect(validators.validateLength('ab', 3, 10)).toBe(false);
    });

    it('rejects string too long', () => {
      expect(validators.validateLength('very long string', 1, 5)).toBe(false);
    });

    it('handles empty string with min 0', () => {
      expect(validators.validateLength('', 0, 10)).toBe(true);
    });

    it('rejects null with min > 0', () => {
      expect(validators.validateLength(null, 1, 10)).toBe(false);
    });

    it('accepts null with min 0', () => {
      expect(validators.validateLength(null, 0, 10)).toBe(true);
    });
  });

  describe('validateRange', () => {
    it('validates number within range', () => {
      expect(validators.validateRange(5, 1, 10)).toBe(true);
    });

    it('rejects number below min', () => {
      expect(validators.validateRange(0, 1, 10)).toBe(false);
    });

    it('rejects number above max', () => {
      expect(validators.validateRange(11, 1, 10)).toBe(false);
    });

    it('handles string numbers', () => {
      expect(validators.validateRange('5', 1, 10)).toBe(true);
    });

    it('returns false for null', () => {
      expect(validators.validateRange(null, 1, 10)).toBe(false);
    });

    it('returns false for invalid string', () => {
      expect(validators.validateRange('invalid', 1, 10)).toBe(false);
    });
  });

  describe('validateNotEmpty', () => {
    it('returns true for non-empty array', () => {
      expect(validators.validateNotEmpty([1, 2, 3])).toBe(true);
    });

    it('returns false for empty array', () => {
      expect(validators.validateNotEmpty([])).toBe(false);
    });

    it('returns false for non-array', () => {
      expect(validators.validateNotEmpty(null)).toBe(false);
      expect(validators.validateNotEmpty('string')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('validates 10-digit US phone number', () => {
      expect(validators.validatePhoneNumber('1234567890')).toBe(true);
    });

    it('validates formatted phone number', () => {
      expect(validators.validatePhoneNumber('(123) 456-7890')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(validators.validatePhoneNumber('123456')).toBe(false);
      expect(validators.validatePhoneNumber('12345678901')).toBe(false);
    });

    it('returns false for null', () => {
      expect(validators.validatePhoneNumber(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(validators.validatePhoneNumber(undefined)).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('validates strong password', () => {
      const result = validators.validatePasswordStrength('Password123!');
      
      expect(result.valid).toBe(true);
      expect(result.feedback).toEqual([]);
    });

    it('rejects password too short', () => {
      const result = validators.validatePasswordStrength('Pwd1!');
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must be at least 8 characters long');
    });

    it('requires uppercase letter', () => {
      const result = validators.validatePasswordStrength('password123!');
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one uppercase letter');
    });

    it('requires lowercase letter', () => {
      const result = validators.validatePasswordStrength('PASSWORD123!');
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one lowercase letter');
    });

    it('requires number', () => {
      const result = validators.validatePasswordStrength('Password!');
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one number');
    });

    it('requires special character', () => {
      const result = validators.validatePasswordStrength('Password123');
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one special character');
    });

    it('returns feedback for empty password', () => {
      const result = validators.validatePasswordStrength('');
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password is required');
    });
  });

  describe('validateMatch', () => {
    it('returns true for matching values', () => {
      expect(validators.validateMatch('test', 'test')).toBe(true);
      expect(validators.validateMatch(123, 123)).toBe(true);
    });

    it('returns false for non-matching values', () => {
      expect(validators.validateMatch('test', 'Test')).toBe(false);
      expect(validators.validateMatch(123, 456)).toBe(false);
    });

    it('uses strict equality', () => {
      expect(validators.validateMatch(123, '123')).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('validates date within range', () => {
      const date = new Date('2025-06-15');
      const minDate = new Date('2025-01-01');
      const maxDate = new Date('2025-12-31');

      expect(validators.validateDateRange(date, minDate, maxDate)).toBe(true);
    });

    it('rejects date before min', () => {
      const date = new Date('2024-12-31');
      const minDate = new Date('2025-01-01');

      expect(validators.validateDateRange(date, minDate, null)).toBe(false);
    });

    it('rejects date after max', () => {
      const date = new Date('2026-01-01');
      const maxDate = new Date('2025-12-31');

      expect(validators.validateDateRange(date, null, maxDate)).toBe(false);
    });

    it('validates with no min/max', () => {
      const date = new Date('2025-06-15');
      expect(validators.validateDateRange(date, null, null)).toBe(true);
    });

    it('returns false for invalid date', () => {
      expect(validators.validateDateRange('invalid', null, null)).toBe(false);
    });

    it('returns false for null', () => {
      expect(validators.validateDateRange(null, null, null)).toBe(false);
    });
  });
});

