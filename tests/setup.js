// tests/setup.js
// Global test setup with Fliplet API mocks

/**
 * Mock Fliplet global object for testing
 * This setup runs before each test file
 */
global.Fliplet = {
  API: {
    request: jest.fn()
  },
  Env: {
    get: jest.fn((key) => {
      if (key === 'apiUrl') {
        return 'https://api.fliplet.test/';
      }

      return null;
    })
  },
  Navigate: {
    query: {}
  }
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();

  // Reset Navigate.query to empty object
  global.Fliplet.Navigate.query = {};

  // Reset default API URL
  global.Fliplet.Env.get.mockImplementation((key) => {
    if (key === 'apiUrl') {
      return 'https://api.fliplet.test/';
    }

    return null;
  });
});

