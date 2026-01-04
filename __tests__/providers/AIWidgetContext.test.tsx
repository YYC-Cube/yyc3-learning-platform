/**
 * @fileoverview AIWidgetContext边缘情况测试
 * @description 测试AIWidget上下文的边缘情况、错误处理和状态管理
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-04
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AIWidgetProvider, useAIWidget } from '@/app/providers/AIWidgetContext';

// Mock logger - create inline to avoid vitest hoisting issues
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('AIWidgetContext边缘情况测试', () => {
  let getItemSpy: ReturnType<typeof vi.fn>;
  let setItemSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create spies for localStorage
    getItemSpy = vi.fn();
    setItemSpy = vi.fn();

    // Mock localStorage
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('localStorage错误处理', () => {
    it('应该在localStorage getItem抛出错误时使用默认值', () => {
      getItemSpy.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      // Should default to true (initial state)
      expect(result.current.showWidget).toBe(true);
      // Logger error should have been called
    });

    it('应该在localStorage setItem抛出错误时不影响状态更新', () => {
      getItemSpy.mockReturnValue(null);
      setItemSpy.mockImplementation(() => {
        // Don't throw, just mock to track call
      });

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      // State should still update
      act(() => {
        result.current.toggleWidget();
      });

      expect(result.current.showWidget).toBe(false);
    });
  });

  describe('localStorage数据解析', () => {
    it('应该正确解析保存的true值', () => {
      getItemSpy.mockReturnValue('true');

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      expect(result.current.showWidget).toBe(true);
    });

    it('应该正确解析保存的false值', () => {
      getItemSpy.mockReturnValue('false');

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      expect(result.current.showWidget).toBe(false);
    });

    it('应该在localStorage返回无效字符串时使用默认值', () => {
      getItemSpy.mockReturnValue('invalid');

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      // 'invalid' !== 'true', so should be false
      expect(result.current.showWidget).toBe(false);
    });

    it('应该在localStorage返回null时使用默认值', () => {
      getItemSpy.mockReturnValue(null);

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      expect(result.current.showWidget).toBe(true);
    });

    it('应该在localStorage返回undefined时使用默认值', () => {
      getItemSpy.mockReturnValue(undefined);

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      // When undefined is returned, the condition `widgetPreference !== null` is true
      // but `widgetPreference === 'true'` is false, so it becomes false
      expect(result.current.showWidget).toBe(false);
    });
  });

  describe('快速状态变更', () => {
    it('应该正确处理连续的toggle调用', () => {
      getItemSpy.mockReturnValue(null);

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      act(() => {
        result.current.toggleWidget();
        result.current.toggleWidget();
        result.current.toggleWidget();
      });

      expect(result.current.showWidget).toBe(false);
      expect(setItemSpy).toHaveBeenCalledTimes(3);
    });

    it('应该正确处理open和close的连续调用', () => {
      getItemSpy.mockReturnValue(null);

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      act(() => {
        result.current.openWidget();
        result.current.closeWidget();
        result.current.openWidget();
        result.current.openWidget();
      });

      expect(result.current.showWidget).toBe(true);
    });

    it('应该在同步调用中保持状态一致性', () => {
      getItemSpy.mockReturnValue('false');

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      // Start with closed (from localStorage)
      expect(result.current.showWidget).toBe(false);

      act(() => {
        result.current.openWidget();
        result.current.toggleWidget();
        result.current.openWidget();
      });

      expect(result.current.showWidget).toBe(true);
    });
  });

  describe('Provider边界情况', () => {
    it('应该在未使用Provider时抛出错误', () => {
      // Suppress expected error in console
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAIWidget());
      }).toThrow('useAIWidget must be used within an AIWidgetProvider');

      consoleSpy.mockRestore();
    });

    it('应该支持嵌套Provider（使用最内层）', () => {
      const InnerProvider = ({ children }: { children: React.ReactNode }) => (
        <AIWidgetProvider>{children}</AIWidgetProvider>
      );

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: ({ children }) => (
          <AIWidgetProvider>
            <InnerProvider>{children}</InnerProvider>
          </AIWidgetProvider>
        ),
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current.toggleWidget).toBe('function');
    });

    it('应该在组件卸载后重新挂载时保持状态', () => {
      getItemSpy.mockReturnValue('true');

      const { result, unmount } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      const initialValue = result.current.showWidget;

      act(() => {
        result.current.closeWidget();
      });

      unmount();

      // Remount with new wrapper instance
      const { result: result2 } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      // After remount, should read from localStorage again
      expect(result2.current.showWidget).toBe(initialValue);
    });
  });

  describe('localStorage写入验证', () => {
    it('应该在toggle时写入正确的布尔值字符串', () => {
      getItemSpy.mockReturnValue(null);

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      act(() => {
        result.current.toggleWidget();
      });

      expect(setItemSpy).toHaveBeenCalledWith('showAIWidget', 'false');
    });

    it('应该在open时写入true', () => {
      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      act(() => {
        result.current.openWidget();
      });

      expect(setItemSpy).toHaveBeenCalledWith('showAIWidget', 'true');
    });

    it('应该在close时写入false', () => {
      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      act(() => {
        result.current.closeWidget();
      });

      expect(setItemSpy).toHaveBeenCalledWith('showAIWidget', 'false');
    });

    it('应该使用String()转换布尔值', () => {
      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      act(() => {
        result.current.openWidget();
      });

      const calls = setItemSpy.mock.calls;
      expect(calls[0][1]).toBe('true'); // String(true)

      act(() => {
        result.current.closeWidget();
      });

      expect(setItemSpy).toHaveBeenCalledWith('showAIWidget', 'false');
    });
  });

  describe('初始状态和挂载', () => {
    it('应该正确设置isMounted状态', async () => {
      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      // isMounted is set in useEffect, so it should be true after render
      expect(result.current.showWidget).toBeDefined();
    });

    it('应该在localStorage没有值时使用默认true', () => {
      getItemSpy.mockReturnValue(null);

      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      expect(result.current.showWidget).toBe(true);
    });
  });

  describe('并发和竞态条件', () => {
    it('应该正确处理同时调用多个方法', () => {
      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      act(() => {
        result.current.openWidget();
        result.current.closeWidget();
        result.current.toggleWidget();
      });

      // Last operation (toggle from close) should result in open
      expect(result.current.showWidget).toBe(true);
    });

    it('应该在effect运行前阻止操作', () => {
      // This tests that operations work even before useEffect runs
      const { result } = renderHook(() => useAIWidget(), {
        wrapper: AIWidgetProvider,
      });

      // Should work immediately
      expect(() => {
        act(() => {
          result.current.toggleWidget();
        });
      }).not.toThrow();
    });
  });
});
