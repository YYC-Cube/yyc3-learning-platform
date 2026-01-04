/**
 * @fileoverview Tests for format utility functions
 * @description Tests for formatting time, dates, scores, and numbers
 */

import { describe, it, expect } from 'vitest';
import { formatTime, formatDate, formatScore, formatPercentage, formatNumber } from './format';

describe('formatTime', () => {
  it('should format seconds correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(59)).toBe('0:59');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(3599)).toBe('59:59');
  });

  it('should format hours correctly', () => {
    expect(formatTime(3600)).toBe('1:00:00');
    expect(formatTime(3661)).toBe('1:01:01');
    expect(formatTime(7325)).toBe('2:02:05');
  });

  it('should handle large values', () => {
    expect(formatTime(86400)).toBe('24:00:00');
  });
});

describe('formatDate', () => {
  it('should format Date object', () => {
    const date = new Date('2026-01-03');
    const result = formatDate(date);
    expect(result).toContain('2026');
    expect(result).toContain('1');
    expect(result).toContain('3');
  });

  it('should format date string', () => {
    const result = formatDate('2026-01-03');
    expect(result).toContain('2026');
  });

  it('should handle invalid dates gracefully', () => {
    const result = formatDate('invalid');
    expect(result).toContain('Invalid Date');
  });
});

describe('formatScore', () => {
  it('should format score correctly', () => {
    expect(formatScore(85, 100)).toBe('85/100 (85%)');
    expect(formatScore(50, 100)).toBe('50/100 (50%)');
    expect(formatScore(100, 100)).toBe('100/100 (100%)');
  });

  it('should round percentages correctly', () => {
    expect(formatScore(83, 100)).toBe('83/100 (83%)');
    expect(formatScore(84.5, 100)).toBe('84.5/100 (85%)');
    expect(formatScore(84.4, 100)).toBe('84.4/100 (84%)');
  });

  it('should handle zero scores', () => {
    expect(formatScore(0, 100)).toBe('0/100 (0%)');
  });
});

describe('formatPercentage', () => {
  it('should format percentage with default decimals', () => {
    expect(formatPercentage(50)).toBe('50%');
    expect(formatPercentage(75.5)).toBe('76%');
    expect(formatPercentage(99.9)).toBe('100%');
  });

  it('should format percentage with custom decimals', () => {
    expect(formatPercentage(50.123, 2)).toBe('50.12%');
    expect(formatPercentage(75.567, 1)).toBe('75.6%');
    expect(formatPercentage(99.999, 3)).toBe('99.999%'); // toFixed doesn't round up at this precision
  });

  it('should handle edge cases', () => {
    expect(formatPercentage(0)).toBe('0%');
    expect(formatPercentage(100)).toBe('100%');
  });
});

describe('formatNumber', () => {
  it('should format numbers with Chinese locale', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(1234567.89)).toBe('1,234,567.89');
  });

  it('should handle small numbers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(999)).toBe('999');
  });
});
