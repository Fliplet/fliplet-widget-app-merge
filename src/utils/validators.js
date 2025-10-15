// src/utils/validators.js

/**
 * Validation utility functions for data validation
 */

/**
 * Validate for duplicate names in an array of items
 * Returns array of duplicate items
 */
const validateDuplicateNames = (items, field = 'name') => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const nameCount = {};
  const duplicates = [];

  items.forEach(item => {
    const name = item[field];
    
    if (!name) {
      return;
    }

    const normalizedName = name.toLowerCase().trim();

    if (nameCount[normalizedName]) {
      nameCount[normalizedName].count++;
      nameCount[normalizedName].items.push(item);
    } else {
      nameCount[normalizedName] = {
        count: 1,
        items: [item]
      };
    }
  });

  Object.keys(nameCount).forEach(name => {
    if (nameCount[name].count > 1) {
      duplicates.push(...nameCount[name].items);
    }
  });

  return duplicates;
};

/**
 * Check if user has required permissions
 */
const validatePermissions = (user, requiredRole) => {
  if (!user) {
    return false;
  }

  if (!requiredRole) {
    return true;
  }

  // Check if user has the required role
  if (user.role === requiredRole) {
    return true;
  }

  // Check if user has permissions array
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(requiredRole);
  }

  // Check if user has roles array
  if (Array.isArray(user.roles)) {
    return user.roles.includes(requiredRole);
  }

  return false;
};

/**
 * Validate against plan limits
 * Returns object with exceeded limits
 */
const validatePlanLimits = (current, limits) => {
  if (!limits) {
    return { valid: true, exceededLimits: [] };
  }

  const exceededLimits = [];

  Object.keys(limits).forEach(key => {
    const currentValue = current[key];
    const limitValue = limits[key];

    if (currentValue !== undefined && limitValue !== undefined) {
      if (currentValue > limitValue) {
        exceededLimits.push({
          key,
          current: currentValue,
          limit: limitValue,
          excess: currentValue - limitValue
        });
      }
    }
  });

  return {
    valid: exceededLimits.length === 0,
    exceededLimits
  };
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
const validateUrl = (url) => {
  if (!url) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate required fields in an object
 * Returns array of missing fields
 */
const validateRequiredFields = (obj, requiredFields) => {
  if (!obj || !Array.isArray(requiredFields)) {
    return [];
  }

  const missingFields = [];

  requiredFields.forEach(field => {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missingFields.push(field);
    }
  });

  return missingFields;
};

/**
 * Validate string length
 */
const validateLength = (str, min = 0, max = Infinity) => {
  if (!str) {
    return min === 0;
  }

  const length = str.length;
  return length >= min && length <= max;
};

/**
 * Validate number range
 */
const validateRange = (num, min = -Infinity, max = Infinity) => {
  if (num === null || num === undefined) {
    return false;
  }

  const number = typeof num === 'number' ? num : parseFloat(num);
  
  if (isNaN(number)) {
    return false;
  }

  return number >= min && number <= max;
};

/**
 * Validate array not empty
 */
const validateNotEmpty = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * Validate phone number format
 */
const validatePhoneNumber = (phone) => {
  if (!phone) {
    return false;
  }

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid length (10 digits for US)
  return cleaned.length === 10;
};

/**
 * Validate password strength
 * Returns object with validation result and feedback
 */
const validatePasswordStrength = (password) => {
  if (!password) {
    return { valid: false, feedback: ['Password is required'] };
  }

  const feedback = [];
  let valid = true;

  // Check minimum length
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
    valid = false;
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
    valid = false;
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
    valid = false;
  }

  // Check for number
  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
    valid = false;
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
    valid = false;
  }

  return { valid, feedback };
};

/**
 * Validate that two values match
 */
const validateMatch = (value1, value2) => {
  return value1 === value2;
};

/**
 * Validate date is in valid range
 */
const validateDateRange = (date, minDate = null, maxDate = null) => {
  if (!date) {
    return false;
  }

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  if (minDate) {
    const minDateObj = new Date(minDate);
    if (dateObj < minDateObj) {
      return false;
    }
  }

  if (maxDate) {
    const maxDateObj = new Date(maxDate);
    if (dateObj > maxDateObj) {
      return false;
    }
  }

  return true;
};

module.exports = {
  validateDuplicateNames,
  validatePermissions,
  validatePlanLimits,
  validateEmail,
  validateUrl,
  validateRequiredFields,
  validateLength,
  validateRange,
  validateNotEmpty,
  validatePhoneNumber,
  validatePasswordStrength,
  validateMatch,
  validateDateRange
};

