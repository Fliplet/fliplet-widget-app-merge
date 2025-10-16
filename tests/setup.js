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

if (!global.Fliplet) {
  global.Fliplet = {};
}

if (!global.Fliplet.API) {
  global.Fliplet.API = {
    request: jest.fn()
  };
}

if (!global.Fliplet.App) {
  global.Fliplet.App = {
    Analytics: {
      event: jest.fn()
    },
    Logs: {
      create: jest.fn()
    }
  };
}

if (!global.Fliplet.App.Analytics) {
  global.Fliplet.App.Analytics = {
    event: jest.fn()
  };
}

if (!global.Fliplet.App.Logs) {
  global.Fliplet.App.Logs = {
    create: jest.fn()
  };
}

if (!global.Fliplet.Env) {
  global.Fliplet.Env = {
    get: jest.fn((key) => {
      if (key === 'apiUrl') {
        return 'https://api.fliplet.test/';
      }

      return null;
    })
  };
}

if (!global.Fliplet.Navigate) {
  global.Fliplet.Navigate = {
    query: {}
  };
}

global.window.Fliplet = global.Fliplet;

beforeEach(() => {
  jest.clearAllMocks();

  if (!global.Fliplet) {
    global.Fliplet = {};
  }

  if (!global.Fliplet.API) {
    global.Fliplet.API = {
      request: jest.fn()
    };
  }

  if (!global.Fliplet.App) {
    global.Fliplet.App = {};
  }

  if (!global.Fliplet.App.Analytics) {
    global.Fliplet.App.Analytics = {
      event: jest.fn()
    };
  }

  if (!global.Fliplet.App.Logs) {
    global.Fliplet.App.Logs = {
      create: jest.fn()
    };
  }

  if (!global.Fliplet.Env) {
    global.Fliplet.Env = {
      get: jest.fn()
    };
  }

  if (!global.Fliplet.Navigate) {
    global.Fliplet.Navigate = {
      query: {}
    };
  }

  global.Fliplet.App.Analytics.event.mockClear();
  global.Fliplet.App.Logs.create.mockClear();

  global.Fliplet.Env.get.mockImplementation((key) => {
    if (key === 'apiUrl') {
      return 'https://api.fliplet.test/';
    }

    return null;
  });

  global.Fliplet.Navigate.query = {};

  if (typeof global.window === 'undefined') {
    global.window = { Fliplet: global.Fliplet };
  } else {
    global.window.Fliplet = global.Fliplet;
  }
});

