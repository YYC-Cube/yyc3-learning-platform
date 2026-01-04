/**
 * @fileoverview Tests for localStorage wrapper
 * @description Tests for storage utility functions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { storage } from './storage';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return null when window is undefined', () => {
      // @ts-ignore - testing SSR case
      delete global.window;
      const result = storage.get('key');
      expect(result).toBeNull();
      // Restore window
      global.window = { localStorage: localStorageMock } as any;
    });

    it('should return null for non-existent key', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = storage.get('non-existent');
      expect(result).toBeNull();
    });

    it('should parse and return stored value', () => {
      const value = { foo: 'bar' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(value));
      const result = storage.get('key');
      expect(result).toEqual(value);
    });

    it('should return null on parse error', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      const result = storage.get('key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should not throw when window is undefined', () => {
      // @ts-ignore
      delete global.window;
      expect(() => storage.set('key', 'value')).not.toThrow();
      global.window = { localStorage: localStorageMock } as any;
    });

    it('should stringify and store value', () => {
      const value = { foo: 'bar' };
      storage.set('key', value);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('key', JSON.stringify(value));
    });

    it('should handle setItem errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      expect(() => storage.set('key', 'value')).not.toThrow();
    });
  });

  describe('remove', () => {
    it('should not throw when window is undefined', () => {
      // @ts-ignore
      delete global.window;
      expect(() => storage.remove('key')).not.toThrow();
      global.window = { localStorage: localStorageMock } as any;
    });

    it('should remove item from storage', () => {
      storage.remove('key');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('key');
    });

    it('should handle removeItem errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Remove failed');
      });
      expect(() => storage.remove('key')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should not throw when window is undefined', () => {
      // @ts-ignore
      delete global.window;
      expect(() => storage.clear()).not.toThrow();
      global.window = { localStorage: localStorageMock } as any;
    });

    it('should clear all items', () => {
      storage.clear();
      expect(localStorageMock.clear).toHaveBeenCalled();
    });

    it('should handle clear errors gracefully', () => {
      localStorageMock.clear.mockImplementation(() => {
        throw new Error('Clear failed');
      });
      expect(() => storage.clear()).not.toThrow();
    });
  });
});
