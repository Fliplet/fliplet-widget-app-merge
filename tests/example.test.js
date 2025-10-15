// tests/example.test.js
// Example test to verify Jest configuration is working correctly

describe('Jest Configuration', () => {
  test('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  test('should have access to Fliplet global mock', () => {
    expect(global.Fliplet).toBeDefined();
    expect(global.Fliplet.API).toBeDefined();
    expect(global.Fliplet.API.request).toBeDefined();
    expect(global.Fliplet.Env).toBeDefined();
    expect(global.Fliplet.Navigate).toBeDefined();
  });

  test('should have Fliplet.Env.get return default apiUrl', () => {
    const apiUrl = global.Fliplet.Env.get('apiUrl');

    expect(apiUrl).toBe('https://api.fliplet.test/');
  });

  test('should have Fliplet.API.request as a jest mock', () => {
    expect(jest.isMockFunction(global.Fliplet.API.request)).toBe(true);
  });

  test('should reset mocks between tests', () => {
    // This test verifies that mocks are cleared by beforeEach in setup.js
    expect(global.Fliplet.API.request).not.toHaveBeenCalled();
  });
});

