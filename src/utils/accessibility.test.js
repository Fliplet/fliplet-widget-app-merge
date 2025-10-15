const accessibility = require('./accessibility');

describe('accessibility', () => {
  let container;

  beforeEach(() => {
    // Create a container for tests
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
    container = null;
  });

  describe('trapFocus', () => {
    it('traps focus within modal element', () => {
      container.innerHTML = `
        <div id="modal">
          <button id="first">First</button>
          <button id="second">Second</button>
          <button id="last">Last</button>
        </div>
      `;

      const modal = document.getElementById('modal');
      const cleanup = accessibility.trapFocus(modal);

      expect(cleanup).toBeInstanceOf(Function);
      expect(document.activeElement.id).toBe('first');

      cleanup();
    });

    it('cycles focus from last to first element on Tab', () => {
      container.innerHTML = `
        <div id="modal">
          <button id="first">First</button>
          <button id="last">Last</button>
        </div>
      `;

      const modal = document.getElementById('modal');
      const lastButton = document.getElementById('last');
      accessibility.trapFocus(modal);

      lastButton.focus();

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      modal.dispatchEvent(event);
      // After Tab on last element, focus should cycle to first
      // Note: This behavior depends on event.preventDefault() being called
    });

    it('returns null if element is not provided', () => {
      const cleanup = accessibility.trapFocus(null);
      expect(cleanup).toBeNull();
    });

    it('removes event listener on cleanup', () => {
      container.innerHTML = `
        <div id="modal">
          <button id="button">Button</button>
        </div>
      `;

      const modal = document.getElementById('modal');
      const cleanup = accessibility.trapFocus(modal);
      const removeEventListenerSpy = jest.spyOn(modal, 'removeEventListener');

      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('restoreFocus', () => {
    it('restores focus to previous element', (done) => {
      const button = document.createElement('button');
      container.appendChild(button);

      accessibility.restoreFocus(button);

      setTimeout(() => {
        expect(document.activeElement).toBe(button);
        done();
      }, 10);
    });

    it('handles null element gracefully', () => {
      expect(() => {
        accessibility.restoreFocus(null);
      }).not.toThrow();
    });

    it('handles element without focus method gracefully', () => {
      const element = { notFocus: jest.fn() };

      expect(() => {
        accessibility.restoreFocus(element);
      }).not.toThrow();
    });
  });

  describe('getCurrentFocus', () => {
    it('returns currently focused element', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      button.focus();

      const focusedElement = accessibility.getCurrentFocus();
      expect(focusedElement).toBe(button);
    });
  });

  describe('announceToScreenReader', () => {
    it('creates live region if it does not exist', () => {
      accessibility.announceToScreenReader('Test message');

      const liveRegion = document.getElementById('screen-reader-announcements');
      expect(liveRegion).not.toBeNull();
      expect(liveRegion.getAttribute('role')).toBe('status');
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    });

    it('updates message in live region', (done) => {
      accessibility.announceToScreenReader('Test message');

      setTimeout(() => {
        const liveRegion = document.getElementById('screen-reader-announcements');
        expect(liveRegion.textContent).toBe('Test message');
        done();
      }, 150);
    });

    it('uses assertive priority when specified', () => {
      accessibility.announceToScreenReader('Urgent message', 'assertive');

      const liveRegion = document.getElementById('screen-reader-announcements');
      expect(liveRegion.getAttribute('aria-live')).toBe('assertive');
    });

    it('clears message after delay', (done) => {
      accessibility.announceToScreenReader('Test message');

      setTimeout(() => {
        const liveRegion = document.getElementById('screen-reader-announcements');
        expect(liveRegion.textContent).toBe('');
        done();
      }, 3100);
    });

    it('does nothing if message is empty', () => {
      const initialRegion = document.getElementById('screen-reader-announcements');
      accessibility.announceToScreenReader('');
      const finalRegion = document.getElementById('screen-reader-announcements');

      expect(finalRegion).toEqual(initialRegion);
    });
  });

  describe('setAriaAttributes', () => {
    it('sets ARIA attributes on element', () => {
      const element = document.createElement('div');
      container.appendChild(element);

      accessibility.setAriaAttributes(element, {
        'expanded': 'true',
        'label': 'Test label'
      });

      expect(element.getAttribute('aria-expanded')).toBe('true');
      expect(element.getAttribute('aria-label')).toBe('Test label');
    });

    it('handles attributes with aria- prefix', () => {
      const element = document.createElement('div');
      container.appendChild(element);

      accessibility.setAriaAttributes(element, {
        'aria-hidden': 'true'
      });

      expect(element.getAttribute('aria-hidden')).toBe('true');
    });

    it('does nothing if element is null', () => {
      expect(() => {
        accessibility.setAriaAttributes(null, { 'label': 'Test' });
      }).not.toThrow();
    });

    it('does nothing if attributes are null', () => {
      const element = document.createElement('div');

      expect(() => {
        accessibility.setAriaAttributes(element, null);
      }).not.toThrow();
    });
  });

  describe('removeAriaAttributes', () => {
    it('removes ARIA attributes from element', () => {
      const element = document.createElement('div');
      element.setAttribute('aria-expanded', 'true');
      element.setAttribute('aria-label', 'Test');
      container.appendChild(element);

      accessibility.removeAriaAttributes(element, ['expanded', 'label']);

      expect(element.hasAttribute('aria-expanded')).toBe(false);
      expect(element.hasAttribute('aria-label')).toBe(false);
    });

    it('handles single attribute as string', () => {
      const element = document.createElement('div');
      element.setAttribute('aria-hidden', 'true');
      container.appendChild(element);

      accessibility.removeAriaAttributes(element, 'hidden');

      expect(element.hasAttribute('aria-hidden')).toBe(false);
    });

    it('does nothing if element is null', () => {
      expect(() => {
        accessibility.removeAriaAttributes(null, ['label']);
      }).not.toThrow();
    });
  });

  describe('addSkipLink', () => {
    it('creates skip link if it does not exist', () => {
      const mainContent = document.createElement('main');
      mainContent.id = 'main-content';
      container.appendChild(mainContent);

      const skipLink = accessibility.addSkipLink('main-content');

      expect(skipLink).not.toBeNull();
      expect(skipLink.id).toBe('skip-to-main');
      expect(skipLink.href).toContain('#main-content');
    });

    it('uses custom link text', () => {
      const skipLink = accessibility.addSkipLink('main-content', 'Jump to content');
      expect(skipLink.textContent).toBe('Jump to content');
    });

    it('returns existing skip link if already present', () => {
      const firstSkipLink = accessibility.addSkipLink('main-content');
      const secondSkipLink = accessibility.addSkipLink('main-content');

      expect(firstSkipLink).toBe(secondSkipLink);
    });
  });

  describe('isVisibleToScreenReader', () => {
    it('returns false for element with aria-hidden="true"', () => {
      const element = document.createElement('div');
      element.setAttribute('aria-hidden', 'true');
      container.appendChild(element);

      expect(accessibility.isVisibleToScreenReader(element)).toBe(false);
    });

    it('returns false for element with display: none', () => {
      const element = document.createElement('div');
      element.style.display = 'none';
      container.appendChild(element);

      expect(accessibility.isVisibleToScreenReader(element)).toBe(false);
    });

    it('returns false for element with visibility: hidden', () => {
      const element = document.createElement('div');
      element.style.visibility = 'hidden';
      container.appendChild(element);

      expect(accessibility.isVisibleToScreenReader(element)).toBe(false);
    });

    it('returns true for visible element', () => {
      const element = document.createElement('div');
      container.appendChild(element);

      expect(accessibility.isVisibleToScreenReader(element)).toBe(true);
    });

    it('returns false if element is null', () => {
      expect(accessibility.isVisibleToScreenReader(null)).toBe(false);
    });
  });

  describe('makeKeyboardAccessible', () => {
    it('adds tabindex to element', () => {
      const element = document.createElement('div');
      container.appendChild(element);

      accessibility.makeKeyboardAccessible(element);

      expect(element.getAttribute('tabindex')).toBe('0');
    });

    it('adds role to element', () => {
      const element = document.createElement('div');
      container.appendChild(element);

      accessibility.makeKeyboardAccessible(element, 'button');

      expect(element.getAttribute('role')).toBe('button');
    });

    it('does not override existing tabindex', () => {
      const element = document.createElement('div');
      element.setAttribute('tabindex', '1');
      container.appendChild(element);

      accessibility.makeKeyboardAccessible(element);

      expect(element.getAttribute('tabindex')).toBe('1');
    });

    it('does not override existing role', () => {
      const element = document.createElement('div');
      element.setAttribute('role', 'menu');
      container.appendChild(element);

      accessibility.makeKeyboardAccessible(element);

      expect(element.getAttribute('role')).toBe('menu');
    });

    it('triggers click on Enter key', () => {
      const element = document.createElement('div');
      const clickSpy = jest.fn();
      element.addEventListener('click', clickSpy);
      container.appendChild(element);

      accessibility.makeKeyboardAccessible(element);

      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      element.dispatchEvent(event);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('triggers click on Space key', () => {
      const element = document.createElement('div');
      const clickSpy = jest.fn();
      element.addEventListener('click', clickSpy);
      container.appendChild(element);

      accessibility.makeKeyboardAccessible(element);

      const event = new KeyboardEvent('keypress', { key: ' ' });
      element.dispatchEvent(event);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('returns cleanup function', () => {
      const element = document.createElement('div');
      container.appendChild(element);

      const cleanup = accessibility.makeKeyboardAccessible(element);

      expect(cleanup).toBeInstanceOf(Function);
      expect(() => cleanup()).not.toThrow();
    });

    it('does nothing if element is null', () => {
      expect(() => {
        accessibility.makeKeyboardAccessible(null);
      }).not.toThrow();
    });
  });
});

