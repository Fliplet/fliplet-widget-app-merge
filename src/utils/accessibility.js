// src/utils/accessibility.js

/**
 * Accessibility helper functions for improved keyboard navigation and screen reader support
 */

/**
 * Trap focus within a modal or dialog element
 * Prevents Tab/Shift+Tab from focusing elements outside the specified element
 */
const trapFocus = (element) => {
  if (!element) {
    return null;
  }

  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e) => {
    const isTabPressed = e.key === 'Tab';

    if (!isTabPressed) {
      return;
    }

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Focus first focusable element
  if (firstFocusable) {
    firstFocusable.focus();
  }

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Restore focus to a previously focused element
 * Useful for returning focus after closing a modal
 */
const restoreFocus = (previousElement) => {
  if (previousElement && typeof previousElement.focus === 'function') {
    // Use setTimeout to ensure the element is ready to receive focus
    setTimeout(() => {
      previousElement.focus();
    }, 0);
  }
};

/**
 * Get the currently focused element
 * Useful for saving focus before opening a modal
 */
const getCurrentFocus = () => {
  return document.activeElement;
};

/**
 * Announce a message to screen readers using an ARIA live region
 * Creates a temporary live region if one doesn't exist
 */
const announceToScreenReader = (message, priority = 'polite') => {
  if (!message) {
    return;
  }

  // Check if live region already exists
  let liveRegion = document.getElementById('screen-reader-announcements');

  if (!liveRegion) {
    // Create live region
    liveRegion = document.createElement('div');
    liveRegion.id = 'screen-reader-announcements';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';

    // Add visually hidden styles
    Object.assign(liveRegion.style, {
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden'
    });

    document.body.appendChild(liveRegion);
  } else if (priority && priority !== liveRegion.getAttribute('aria-live')) {
    liveRegion.setAttribute('aria-live', priority);
  }

  // Update the message
  liveRegion.textContent = '';

  // Use setTimeout to ensure screen readers detect the change
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);

  // Clear the message after 3 seconds
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 3000);
};

/**
 * Set ARIA attributes on an element
 */
const setAriaAttributes = (element, attributes) => {
  if (!element || !attributes) {
    return;
  }

  Object.keys(attributes).forEach(key => {
    const ariaAttribute = key.startsWith('aria-') ? key : `aria-${key}`;
    element.setAttribute(ariaAttribute, attributes[key]);
  });
};

/**
 * Remove ARIA attributes from an element
 */
const removeAriaAttributes = (element, attributes) => {
  if (!element || !attributes) {
    return;
  }

  const attributeArray = Array.isArray(attributes) ? attributes : [attributes];

  attributeArray.forEach(key => {
    const ariaAttribute = key.startsWith('aria-') ? key : `aria-${key}`;
    element.removeAttribute(ariaAttribute);
  });
};

/**
 * Add skip navigation link
 * Allows keyboard users to skip to main content
 */
const addSkipLink = (targetId, linkText = 'Skip to main content') => {
  const existingSkipLink = document.getElementById('skip-to-main');

  if (existingSkipLink) {
    if (linkText && existingSkipLink.textContent !== linkText) {
      existingSkipLink.textContent = linkText;
    }

    return existingSkipLink;
  }

  const skipLink = document.createElement('a');
  skipLink.id = 'skip-to-main';
  skipLink.href = `#${targetId}`;
  skipLink.textContent = linkText;
  skipLink.className = 'skip-link';

  // Add skip link styles
  Object.assign(skipLink.style, {
    position: 'absolute',
    left: '-10000px',
    top: '0',
    zIndex: '9999',
    padding: '8px',
    background: '#000',
    color: '#fff',
    textDecoration: 'none'
  });

  // Show on focus
  skipLink.addEventListener('focus', () => {
    skipLink.style.left = '0';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.left = '-10000px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);

  return skipLink;
};

/**
 * Check if an element is visible to screen readers
 */
const isVisibleToScreenReader = (element) => {
  if (!element) {
    return false;
  }

  // Check if element has aria-hidden="true"
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Check if element is actually visible
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  return true;
};

/**
 * Make an element keyboard accessible
 * Adds tabindex and appropriate ARIA attributes
 */
const makeKeyboardAccessible = (element, role = 'button') => {
  if (!element) {
    return;
  }

  // Add tabindex if not already present
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '0');
  }

  // Add role if not already present
  if (!element.hasAttribute('role')) {
    element.setAttribute('role', role);
  }

  // Add keyboard event handlers
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      element.click();
    }
  };

  element.addEventListener('keypress', handleKeyPress);

  // Return cleanup function
  return () => {
    element.removeEventListener('keypress', handleKeyPress);
  };
};

module.exports = {
  trapFocus,
  restoreFocus,
  getCurrentFocus,
  announceToScreenReader,
  setAriaAttributes,
  removeAriaAttributes,
  addSkipLink,
  isVisibleToScreenReader,
  makeKeyboardAccessible
};

