/**
 * @fileoverview Mock for Next.js next/server module
 * @description Provides mocked implementations for NextResponse and other Next.js server utilities
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

class MockNextResponse extends Response {
  constructor(body, init = {}) {
    super(body, init);
    this._data = body;
  }

  static json(data, init = {}) {
    const response = new MockNextResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
    response._data = data;
    return response;
  }

  static redirect(url, init = {}) {
    const response = new MockNextResponse(null, {
      ...init,
      status: init.status || 307,
      headers: {
        Location: url,
        ...init.headers,
      },
    });
    response.url = url;
    return response;
  }

  async json() {
    return this._data || JSON.parse(await super.text());
  }

  async text() {
    return super.text();
  }

  clone() {
    const cloned = new MockNextResponse(this.body, {
      status: this.status,
      headers: this.headers,
      statusText: this.statusText,
    });
    cloned._data = this._data;
    return cloned;
  }
}

class MockNextRequest {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init.method || 'GET';
    this.headers = init.headers || {};
    this.body = init.body;
    this.cache = init.cache || 'default';
    this.credentials = init.credentials || 'same-origin';
    this.integrity = init.integrity || '';
    this.keepalive = init.keepalive || false;
    this.mode = init.mode || 'cors';
    this.redirect = init.redirect || 'follow';
    this.referrer = init.referrer || '';
    this.referrerPolicy = init.referrerPolicy || '';
    this._data = init.body;
  }

  async json() {
    return this._data ? JSON.parse(this._data) : {};
  }

  async text() {
    return this._data || '';
  }

  async blob() {
    return new Blob([this._data]);
  }

  async arrayBuffer() {
    return new TextEncoder().encode(this._data).buffer;
  }

  clone() {
    return new MockNextRequest(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
      cache: this.cache,
      credentials: this.credentials,
      integrity: this.integrity,
      keepalive: this.keepalive,
      mode: this.mode,
      redirect: this.redirect,
      referrer: this.referrer,
      referrerPolicy: this.referrerPolicy,
    });
  }
}

class MockHeaders {
  constructor(init = {}) {
    this._headers = {};
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }

  append(name, value) {
    const existing = this._headers[name.toLowerCase()];
    if (existing) {
      this._headers[name.toLowerCase()] = `${existing}, ${value}`;
    } else {
      this._headers[name.toLowerCase()] = value;
    }
  }

  delete(name) {
    delete this._headers[name.toLowerCase()];
  }

  get(name) {
    return this._headers[name.toLowerCase()] || null;
  }

  has(name) {
    return name.toLowerCase() in this._headers;
  }

  set(name, value) {
    this._headers[name.toLowerCase()] = value;
  }

  forEach(callback, thisArg) {
    Object.entries(this._headers).forEach(([name, value]) => {
      callback.call(thisArg, value, name, this);
    });
  }

  *entries() {
    for (const [name, value] of Object.entries(this._headers)) {
      yield [name, value];
    }
  }

  *keys() {
    for (const name of Object.keys(this._headers)) {
      yield name;
    }
  }

  *values() {
    for (const value of Object.values(this._headers)) {
      yield value;
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}

module.exports = {
  NextResponse: MockNextResponse,
  NextRequest: MockNextRequest,
  headers: MockHeaders,
};