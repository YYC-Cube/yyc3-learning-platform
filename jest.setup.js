/**
 * @fileoverview Jest setup file
 * @description 全局测试环境配置，包括polyfills和mocks
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// Polyfill for Web Fetch API
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Polyfill for Request and Response
if (typeof Request === 'undefined') {
  global.Request = require('node-fetch').Request;
}

if (typeof Response === 'undefined') {
  global.Response = require('node-fetch').Response;
}

// Polyfill for ReadableStream
if (typeof ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}

// Polyfill for TextEncoder and TextDecoder
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Polyfill for WebSocket
if (typeof WebSocket === 'undefined') {
  global.WebSocket = class MockWebSocket {
    constructor(url) {
      this.url = url;
      this.readyState = 0;
      this.onopen = null;
      this.onmessage = null;
      this.onerror = null;
      this.onclose = null;
    }
    
    send(data) {}
    close() {}
    addEventListener(type, listener) {}
    removeEventListener(type, listener) {}
  };
}

// Mock NextResponse for Next.js API routes
global.NextResponse = {
  json: jest.fn((data, init = {}) => {
    return {
      status: init.status || 200,
      headers: init.headers || {},
      json: async () => data,
      text: async () => JSON.stringify(data),
    };
  }),
  redirect: jest.fn((url, init = {}) => {
    return {
      status: init.status || 307,
      headers: init.headers || {},
      url,
    };
  }),
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock requestAnimationFrame
global.requestAnimationFrame = callback => setTimeout(callback, 0);
global.cancelAnimationFrame = id => clearTimeout(id);

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
