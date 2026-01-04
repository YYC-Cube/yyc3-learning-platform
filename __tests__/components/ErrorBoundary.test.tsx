/**
 * @file ErrorBoundary组件测试
 * @description 测试ErrorBoundary组件的错误捕获和处理功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-19
 * @updated 2025-12-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// 模拟一个会抛出错误的组件
const ErrorThrowingComponent = () => {
  throw new Error('Test error');
};

// 模拟一个有条件抛出错误的组件
const ConditionalErrorComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Conditional test error');
  }
  return <div>正常组件</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // 清除控制台错误
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该渲染子组件正常内容', () => {
    render(
      <ErrorBoundary>
        <div>正常内容</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('正常内容')).toBeInTheDocument();
  });

  it('应该捕获子组件抛出的错误并显示错误界面', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    // 应该显示错误标题
    expect(screen.getByText('应用发生错误')).toBeInTheDocument();

    // 应该显示错误信息
    expect(screen.getByText('Test error')).toBeInTheDocument();

    // 应该显示重新加载按钮
    expect(screen.getByText('重新加载应用')).toBeInTheDocument();

    // 应该显示返回上一页按钮
    expect(screen.getByText('返回上一页')).toBeInTheDocument();
  });

  it('应该使用自定义的fallback组件', () => {
    const CustomFallback = () => <div>自定义错误界面</div>;

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    // 应该显示自定义错误界面
    expect(screen.getByText('自定义错误界面')).toBeInTheDocument();
  });

  it('应该在重新加载按钮点击时刷新页面', () => {
    // 使用 Object.defineProperty 来 mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    // 点击重新加载按钮
    fireEvent.click(screen.getByText('重新加载应用'));

    // 应该调用reload方法
    expect(mockReload).toHaveBeenCalled();

    // 清理
    delete (window as Partial<Window>).location;
  });

  it('应该在返回上一页按钮点击时调用history.back', () => {
    // 使用 Object.defineProperty 来 mock window.history.back
    const mockBack = vi.fn();
    Object.defineProperty(window, 'history', {
      value: { back: mockBack },
      writable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    // 点击返回上一页按钮
    fireEvent.click(screen.getByText('返回上一页'));

    // 应该调用back方法
    expect(mockBack).toHaveBeenCalled();

    // 清理
    delete (window as Partial<Window>).history;
  });

  it('应该记录错误信息到控制台', () => {
    const consoleSpy = vi.spyOn(console, 'error');

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    // 应该调用console.error
    expect(consoleSpy).toHaveBeenCalled();
  });
});
