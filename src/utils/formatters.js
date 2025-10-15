// src/utils/formatters.js

/**
 * Formatting utility functions for consistent data display
 */

/**
 * Format a timestamp as a date string
 */
const formatDate = (timestamp, options = {}) => {
  if (!timestamp) {
    return 'Unknown';
  }

  try {
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a file size in bytes to a human-readable string
 */
const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined) {
    return '0 B';
  }

  if (bytes === 0) {
    return '0 B';
  }

  if (bytes < 0) {
    return 'Invalid size';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i >= units.length) {
    return `${(bytes / Math.pow(k, units.length - 1)).toFixed(2)} ${units[units.length - 1]}`;
  }

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
};

/**
 * Format a large number with commas for thousands
 */
const formatNumber = (num) => {
  if (num === null || num === undefined) {
    return '0';
  }

  if (typeof num !== 'number') {
    const parsed = parseFloat(num);
    
    if (isNaN(parsed)) {
      return '0';
    }
    
    num = parsed;
  }

  return num.toLocaleString('en-US');
};

/**
 * Format a duration in seconds to a human-readable string
 */
const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined || seconds < 0) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
};

/**
 * Format a timestamp with more options
 */
const formatTimestamp = (timestamp, format = 'full') => {
  if (!timestamp) {
    return 'Unknown';
  }

  try {
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    switch (format) {
      case 'full':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      
      case 'date-only':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      
      case 'time-only':
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      
      case 'iso':
        return date.toISOString();
      
      case 'relative':
        return formatRelativeTime(date);
      
      default:
        return date.toLocaleString('en-US');
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Format a percentage
 */
const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) {
    return '0%';
  }

  const num = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(num)) {
    return '0%';
  }

  return `${num.toFixed(decimals)}%`;
};

/**
 * Truncate text to a maximum length
 */
const truncateText = (text, maxLength, suffix = '...') => {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + suffix;
};

/**
 * Format a phone number
 */
const formatPhoneNumber = (phone) => {
  if (!phone) {
    return '';
  }

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }

  // Return original if not a valid length
  return phone;
};

module.exports = {
  formatDate,
  formatFileSize,
  formatNumber,
  formatDuration,
  formatTimestamp,
  formatRelativeTime,
  formatPercentage,
  truncateText,
  formatPhoneNumber
};

