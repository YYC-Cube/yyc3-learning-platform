/**
 * 工具函数测试示例
 * 展示如何测试纯函数
 */

import { describe, it, expect } from 'vitest';
import { formatDate, validateEmail, calculateScore } from '@/lib/utils';

describe('formatDate', () => {
  it('should format date string correctly', () => {
    const date = new Date('2026-01-03');
    const result = formatDate(date);

    expect(result).toBe('2026-01-03');
  });

  it('should handle invalid date', () => {
    const result = formatDate(null);

    expect(result).toBe('Invalid Date');
  });

  it('should handle undefined input', () => {
    const result = formatDate(undefined);

    expect(result).toBe('Invalid Date');
  });
});

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@example.com')).toBe(true);
    expect(validateEmail('user+tag@example.co.uk')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(validateEmail('test@example.com.')).toBe(false);
    expect(validateEmail('test..email@example.com')).toBe(false);
  });
});

describe('calculateScore', () => {
  it('should calculate correct score for all correct answers', () => {
    const answers = [1, 2, 3, 4];
    const correct = [1, 2, 3, 4];

    const score = calculateScore(answers, correct);

    expect(score).toBe(100);
  });

  it('should calculate zero score for all wrong answers', () => {
    const answers = [2, 3, 4, 5];
    const correct = [1, 2, 3, 4];

    const score = calculateScore(answers, correct);

    expect(score).toBe(0);
  });

  it('should calculate partial score', () => {
    const answers = [1, 2, 5, 4];
    const correct = [1, 2, 3, 4];

    const score = calculateScore(answers, correct);

    expect(score).toBe(75);
  });

  it('should handle empty arrays', () => {
    const score = calculateScore([], []);

    expect(score).toBe(0);
  });

  it('should throw error for mismatched array lengths', () => {
    const answers = [1, 2, 3];
    const correct = [1, 2];

    expect(() => calculateScore(answers, correct)).toThrow();
  });
});
