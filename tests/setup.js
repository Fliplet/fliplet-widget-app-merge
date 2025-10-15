const { TextDecoder, TextEncoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

global.Vue = require('vue');
global.VueCompilerDOM = require('@vue/compiler-dom');
global.VueServerRenderer = require('@vue/server-renderer');

const dom = new JSDOM('<!doctype html><html><body></body></html>');

global.window = dom.window;
global.document = dom.window.document;
global.navigator = {
  userAgent: 'node.js'
};

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

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

beforeEach(() => {
  jest.clearAllMocks();

  global.Fliplet.Navigate.query = {};

  global.Fliplet.Env.get.mockImplementation((key) => {
    if (key === 'apiUrl') {
      return 'https://api.fliplet.test/';
    }

    return null;
  });
});

