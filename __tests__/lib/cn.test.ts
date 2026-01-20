/**
 * @fileoverview className合并工具测试
 * @description 测试cn函数(Tailwind CSS类名合并)
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/cn';

describe('cn - className合并工具', () => {
  describe('基本功能', () => {
    it('应该合并多个类名字符串', () => {
      expect(cn('text-red', 'font-bold')).toBe('text-red font-bold');
    });

    it('应该处理单个类名', () => {
      expect(cn('text-red')).toBe('text-red');
    });

    it('应该处理空字符串', () => {
      expect(cn('')).toBe('');
      expect(cn('text-red', '', 'font-bold')).toBe('text-red font-bold');
    });

    it('应该处理没有参数的情况', () => {
      expect(cn()).toBe('');
    });

    it('应该去除重复的类名', () => {
      expect(cn('text-red', 'text-red')).toBe('text-red');
    });
  });

  describe('Tailwind CSS类名冲突处理', () => {
    it('应该正确处理冲突的padding类', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('px-4', 'px-2')).toBe('px-2');
      expect(cn('py-4', 'py-2')).toBe('py-2');
    });

    it('应该正确处理冲突的margin类', () => {
      expect(cn('m-4', 'm-2')).toBe('m-2');
      expect(cn('mx-4', 'mx-2')).toBe('mx-2');
      expect(cn('my-4', 'my-2')).toBe('my-2');
    });

    it('应该正确处理冲突的尺寸类', () => {
      expect(cn('w-4', 'w-full')).toBe('w-full');
      expect(cn('h-4', 'h-screen')).toBe('h-screen');
      expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    });

    it('应该正确处理冲突的颜色类', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
      expect(cn('border-red-500', 'border-blue-500')).toBe('border-blue-500');
    });

    it('应该正确处理冲突的flex类', () => {
      expect(cn('flex', 'block')).toBe('block');
      expect(cn('hidden', 'block')).toBe('block');
      expect(cn('inline', 'block')).toBe('block');
    });

    it('应该保留不冲突的类', () => {
      // twMerge会重新排序类名，所以使用toMatch或包含检查
      const result = cn('p-4 m-2', 'p-2 text-red');
      expect(result).toContain('p-2');
      expect(result).toContain('m-2');
      expect(result).toContain('text-red');
      expect(result).not.toContain('p-4');

      const result2 = cn('flex text-red', 'block text-blue');
      expect(result2).toContain('block');
      expect(result2).toContain('text-blue');
      expect(result2).not.toContain('flex');
      expect(result2).not.toContain('text-red');
    });

    it('应该正确处理响应式类名冲突', () => {
      expect(cn('md:p-4 p-2', 'md:p-2')).toBe('p-2 md:p-2');
      expect(cn('sm:text-sm md:text-lg', 'md:text-base')).toBe('sm:text-sm md:text-base');
    });

    it('应该正确处理状态类名冲突', () => {
      expect(cn('hover:text-red', 'hover:text-blue')).toBe('hover:text-blue');
      expect(cn('focus:ring-2', 'focus:ring-4')).toBe('focus:ring-4');
      expect(cn('active:scale-95', 'active:scale-100')).toBe('active:scale-100');
    });
  });

  describe('条件类名处理', () => {
    it('应该处理布尔值条件', () => {
      expect(cn('text-red', false && 'text-blue', true && 'font-bold')).toBe('text-red font-bold');
      expect(cn('text-red', false, 'font-bold')).toBe('text-red font-bold');
    });

    it('应该处理null和undefined条件', () => {
      expect(cn('text-red', null, 'font-bold')).toBe('text-red font-bold');
      expect(cn('text-red', undefined, 'font-bold')).toBe('text-red font-bold');
      expect(cn('text-red', null, undefined, 'font-bold')).toBe('text-red font-bold');
    });

    it('应该处理0和false数字', () => {
      expect(cn('text-red', 0 && 'hidden')).toBe('text-red');
      expect(cn('text-red', 1 && 'visible')).toBe('text-red visible');
    });

    it('应该处理对象形式的条件类名', () => {
      expect(cn({
        'text-red': true,
        'font-bold': true,
        'hidden': false,
      })).toBe('text-red font-bold');

      expect(cn({
        'text-red': false,
        'font-bold': true,
      })).toBe('font-bold');
    });

    it('应该混合处理字符串和对象', () => {
      expect(cn('text-sm', {
        'font-bold': true,
        'hidden': false,
      }, 'text-red')).toBe('text-sm font-bold text-red');
    });

    it('应该处理数组形式的类名', () => {
      expect(cn(['text-red', 'font-bold'])).toBe('text-red font-bold');
      expect(cn(['text-red', ['font-bold', 'hidden']])).toBe('text-red font-bold hidden');
    });

    it('应该混合处理不同形式的输入', () => {
      expect(cn(
        'text-sm',
        ['text-red', { 'font-bold': true }],
        false && 'hidden',
        { 'text-blue': false }
      )).toBe('text-sm text-red font-bold');
    });
  });

  describe('动态类名处理', () => {
    it('应该正确处理动态变量', () => {
      const color = 'red';
      expect(cn(`text-${color}-500`)).toBe('text-red-500');
      expect(cn(`text-${color}-500`, 'font-bold')).toBe('text-red-500 font-bold');
    });

    it('应该处理模板字符串', () => {
      const size = 'lg';
      const color = 'blue';
      expect(cn(`text-${size}`, `bg-${color}-500`)).toBe('text-lg bg-blue-500');
    });

    it('应该处理函数返回的类名', () => {
      const getErrorClass = (hasError: boolean) => hasError ? 'text-red-500' : 'text-green-500';
      expect(cn(getErrorClass(true))).toBe('text-red-500');
      expect(cn(getErrorClass(false))).toBe('text-green-500');
    });
  });

  describe('Tailwind变体和修饰符', () => {
    it('应该正确处理前缀', () => {
      expect(cn('hover:text-red-500', 'hover:bg-blue-500')).toBe('hover:text-red-500 hover:bg-blue-500');
      expect(cn('focus:ring-2', 'focus:ring-blue-500')).toBe('focus:ring-2 focus:ring-blue-500');
    });

    it('应该正确处理响应式修饰符', () => {
      expect(cn('sm:text-sm', 'md:text-base', 'lg:text-lg')).toBe('sm:text-sm md:text-base lg:text-lg');
    });

    it('应该正确处理暗色模式', () => {
      expect(cn('text-gray-900 dark:text-gray-100')).toBe('text-gray-900 dark:text-gray-100');
      expect(cn('dark:bg-gray-800', 'dark:text-white')).toBe('dark:bg-gray-800 dark:text-white');
    });

    it('应该正确处理组合修饰符', () => {
      expect(cn('md:hover:text-red-500', 'lg:focus:bg-blue-500')).toBe('md:hover:text-red-500 lg:focus:bg-blue-500');
    });
  });

  describe('边缘情况', () => {
    it('应该处理包含空格的字符串', () => {
      expect(cn('  text-red  ')).toBe('text-red');
      expect(cn('  text-red  font-bold  ')).toBe('text-red font-bold');
    });

    it('应该处理多个连续空格', () => {
      expect(cn('text-red   font-bold')).toBe('text-red font-bold');
    });

    it('应该处理只包含空格的字符串', () => {
      expect(cn('   ')).toBe('');
      expect(cn('text-red', '   ', 'font-bold')).toBe('text-red font-bold');
    });

    it('应该处理null和undefined输入', () => {
      expect(cn(null)).toBe('');
      expect(cn(undefined)).toBe('');
      expect(cn('text-red', null, undefined, 'font-bold')).toBe('text-red font-bold');
    });

    it('应该处理数字输入', () => {
      expect(cn(0)).toBe('');
      expect(cn(1)).toBe('1');
    });
  });

  describe('实际使用场景', () => {
    it('应该正确处理按钮类名组合', () => {
      const isActive = true;
      const variant: 'primary' | 'secondary' = 'primary' as 'primary' | 'secondary';

      const buttonClass = cn(
        'px-4 py-2 rounded font-medium transition-colors',
        isActive && 'bg-blue-500 text-white',
        variant === 'primary' && 'bg-blue-600 hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 hover:bg-gray-300',
        !isActive && 'opacity-50 cursor-not-allowed'
      );

      // 检查包含所有预期的类名
      expect(buttonClass).toContain('px-4');
      expect(buttonClass).toContain('py-2');
      expect(buttonClass).toContain('rounded');
      expect(buttonClass).toContain('font-medium');
      expect(buttonClass).toContain('transition-colors');
      expect(buttonClass).toContain('bg-blue-600'); // primary覆盖了bg-blue-500
      expect(buttonClass).toContain('hover:bg-blue-700');
      expect(buttonClass).toContain('text-white');
      expect(buttonClass).not.toContain('bg-blue-500'); // 被bg-blue-600覆盖
    });

    it('应该正确处理卡片类名组合', () => {
      const isDark = false;
      const size: 'large' | 'small' = 'large' as 'large' | 'small';

      const cardClass = cn(
        'rounded-lg shadow-md p-6',
        isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
        size === 'large' && 'p-8',
        size === 'small' && 'p-4'
      );

      // p-8会覆盖p-6
      expect(cardClass).toContain('rounded-lg');
      expect(cardClass).toContain('shadow-md');
      expect(cardClass).toContain('bg-white');
      expect(cardClass).toContain('text-gray-900');
      expect(cardClass).toContain('p-8');
      expect(cardClass).not.toContain('p-6'); // 被p-8覆盖
    });

    it('应该正确处理输入框类名组合', () => {
      const hasError = false;
      const isFocused = true;

      const inputClass = cn(
        'w-full px-3 py-2 border rounded-md',
        hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500',
        isFocused && 'ring-2'
      );

      expect(inputClass).toBe('w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 ring-2');
    });

    it('应该正确处理响应式布局类名', () => {
      const layoutClass = cn(
        'grid gap-4',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3',
        'xl:grid-cols-4'
      );

      expect(layoutClass).toBe('grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
    });

    it('应该正确处理动画类名', () => {
      const isAnimating = true;
      const animationClass = cn(
        'transition-all duration-300',
        isAnimating && 'transform scale-105',
        !isAnimating && 'transform scale-100'
      );

      expect(animationClass).toBe('transition-all duration-300 transform scale-105');
    });
  });

  describe('性能和优化', () => {
    it('应该高效处理大量类名', () => {
      const classes = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = cn(...classes);

      expect(result).toBeTruthy();
      expect(result.split(' ')).toHaveLength(100);
    });

    it('应该正确处理复杂的嵌套条件', () => {
      const condition1 = true;
      const condition2 = false;
      const condition3 = true;

      const result = cn(
        'base-class',
        condition1 && 'class-1',
        condition2 && 'class-2',
        condition3 && 'class-3',
        condition1 && condition3 && 'class-1-3',
        !condition2 && 'not-class-2'
      );

      expect(result).toBe('base-class class-1 class-3 class-1-3 not-class-2');
    });
  });
});
