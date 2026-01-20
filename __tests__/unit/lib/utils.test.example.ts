/**
 * 工具函数测试示例
 * 展示如何测试纯函数
 */

import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz');
    expect(result).toBe('foo baz');
  });

  it('should handle undefined and null', () => {
    const result = cn('foo', undefined, null, 'bar');
    expect(result).toBe('foo bar');
  });
});
