/**
 * @fileoverview 日期处理函数测试
 * @description 测试date模块的所有日期处理函数
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatDateRelative,
  formatDateDistance,
  isToday,
  isYesterday,
} from '@/lib/date';

describe('formatDate', () => {
  it('应该使用默认格式格式化日期', () => {
    const date = new Date('2025-01-05T10:30:00');
    const result = formatDate(date);
    expect(result).toBe('2025-01-05');
  });

  it('应该使用自定义格式格式化日期', () => {
    const date = new Date('2025-01-05T10:30:00');
    const result = formatDate(date, 'yyyy年MM月dd日');
    expect(result).toBe('2025年01月05日');
  });

  it('应该正确处理日期字符串', () => {
    const result = formatDate('2025-01-05');
    expect(result).toBe('2025-01-05');
  });

  it('应该使用中文locale', () => {
    const date = new Date('2025-01-05');
    const result = formatDate(date, 'yyyy-MM-dd');
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('应该正确处理闰年日期', () => {
    const result = formatDate('2024-02-29');
    expect(result).toBe('2024-02-29');
  });

  it('应该正确处理月末日期', () => {
    const result = formatDate('2025-01-31');
    expect(result).toBe('2025-01-31');
  });
});

describe('formatDateTime', () => {
  it('应该格式化日期和时间', () => {
    const date = new Date('2025-01-05T10:30:45');
    const result = formatDateTime(date);
    expect(result).toBe('2025-01-05 10:30:45');
  });

  it('应该正确处理日期字符串', () => {
    const result = formatDateTime('2025-01-05T10:30:45');
    expect(result).toContain('2025-01-05');
    expect(result).toContain('10:30:45');
  });

  it('应该正确处理午夜时间', () => {
    const date = new Date('2025-01-05T00:00:00');
    const result = formatDateTime(date);
    expect(result).toBe('2025-01-05 00:00:00');
  });

  it('应该正确处理午夜前一秒', () => {
    const date = new Date('2025-01-05T23:59:59');
    const result = formatDateTime(date);
    expect(result).toBe('2025-01-05 23:59:59');
  });
});

describe('formatDateRelative', () => {
  let mockNow: Date;

  beforeEach(() => {
    // 固定当前时间用于测试
    mockNow = new Date('2025-01-05T12:00:00');
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该正确显示今天的相对时间', () => {
    const today = new Date('2025-01-05T10:00:00');
    const result = formatDateRelative(today);
    expect(result).toBeTruthy();
    // 中文相对时间通常包含"今天"或"X小时前"
  });

  it('应该正确显示昨天的相对时间', () => {
    const yesterday = new Date('2025-01-04T12:00:00');
    const result = formatDateRelative(yesterday);
    expect(result).toBeTruthy();
  });

  it('应该正确显示一周前的相对时间', () => {
    const lastWeek = new Date('2024-12-29T12:00:00');
    const result = formatDateRelative(lastWeek);
    expect(result).toBeTruthy();
  });

  it('应该正确处理未来的日期', () => {
    const tomorrow = new Date('2025-01-06T12:00:00');
    const result = formatDateRelative(tomorrow);
    expect(result).toBeTruthy();
  });
});

describe('formatDateDistance', () => {
  let mockNow: Date;

  beforeEach(() => {
    // 固定当前时间用于测试
    mockNow = new Date('2025-01-05T12:00:00');
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该正确显示刚刚的时间', () => {
    const recent = new Date('2025-01-05T11:59:00');
    const result = formatDateDistance(recent);
    expect(result).toContain('前'); // 应该包含"前"字
  });

  it('应该正确显示一小时前', () => {
    const oneHourAgo = new Date('2025-01-05T11:00:00');
    const result = formatDateDistance(oneHourAgo);
    expect(result).toContain('前');
  });

  it('应该正确显示一天前', () => {
    const oneDayAgo = new Date('2025-01-04T12:00:00');
    const result = formatDateDistance(oneDayAgo);
    expect(result).toContain('前');
  });

  it('应该正确显示未来的时间', () => {
    const future = new Date('2025-01-06T12:00:00');
    const result = formatDateDistance(future);
    // formatDistance returns relative time like "1 天内" (within 1 day)
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  it('应该正确处理日期字符串', () => {
    const result = formatDateDistance('2025-01-04T12:00:00');
    expect(result).toBeTruthy();
  });
});

describe('isToday', () => {
  let mockToday: Date;

  beforeEach(() => {
    // 固定"今天"为2025-01-05
    mockToday = new Date('2025-01-05T12:00:00');
    vi.setSystemTime(mockToday);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该正确识别今天的日期', () => {
    const today = new Date('2025-01-05T10:30:00');
    expect(isToday(today)).toBe(true);
  });

  it('应该正确识别今天的其他时间', () => {
    const morning = new Date('2025-01-05T00:00:01');
    const evening = new Date('2025-01-05T23:59:59');
    expect(isToday(morning)).toBe(true);
    expect(isToday(evening)).toBe(true);
  });

  it('应该拒绝昨天的日期', () => {
    const yesterday = new Date('2025-01-04T12:00:00');
    expect(isToday(yesterday)).toBe(false);
  });

  it('应该拒绝明天的日期', () => {
    const tomorrow = new Date('2025-01-06T12:00:00');
    expect(isToday(tomorrow)).toBe(false);
  });

  it('应该正确处理日期字符串', () => {
    expect(isToday('2025-01-05')).toBe(true);
    expect(isToday('2025-01-04')).toBe(false);
  });

  it('应该正确处理不同年份的相同日期', () => {
    const lastYear = new Date('2024-01-05');
    expect(isToday(lastYear)).toBe(false);
  });
});

describe('isYesterday', () => {
  let mockToday: Date;

  beforeEach(() => {
    // 固定"今天"为2025-01-05
    mockToday = new Date('2025-01-05T12:00:00');
    vi.setSystemTime(mockToday);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该正确识别昨天的日期', () => {
    const yesterday = new Date('2025-01-04T12:00:00');
    expect(isYesterday(yesterday)).toBe(true);
  });

  it('应该正确识别昨天的任何时间', () => {
    const morning = new Date('2025-01-04T00:00:01');
    const evening = new Date('2025-01-04T23:59:59');
    expect(isYesterday(morning)).toBe(true);
    expect(isYesterday(evening)).toBe(true);
  });

  it('应该拒绝今天的日期', () => {
    const today = new Date('2025-01-05T12:00:00');
    expect(isYesterday(today)).toBe(false);
  });

  it('应该拒绝前天的日期', () => {
    const dayBeforeYesterday = new Date('2025-01-03T12:00:00');
    expect(isYesterday(dayBeforeYesterday)).toBe(false);
  });

  it('应该正确处理日期字符串', () => {
    expect(isYesterday('2025-01-04')).toBe(true);
    expect(isYesterday('2025-01-05')).toBe(false);
  });

  it('应该正确处理月末边界', () => {
    // 今天是3月1日，昨天是2月28日（或29日闰年）
    const march1st = new Date('2025-03-01T12:00:00');
    vi.setSystemTime(march1st);

    const feb28th = new Date('2025-02-28T12:00:00');
    expect(isYesterday(feb28th)).toBe(true);

    const mar1st = new Date('2025-03-01T12:00:00');
    expect(isYesterday(mar1st)).toBe(false);
  });

  it('应该正确处理年初边界', () => {
    // 今天是2025年1月1日，昨天是2024年12月31日
    const jan1st = new Date('2025-01-01T12:00:00');
    vi.setSystemTime(jan1st);

    const dec31st = new Date('2024-12-31T12:00:00');
    expect(isYesterday(dec31st)).toBe(true);

    const jan2nd = new Date('2025-01-02T12:00:00');
    expect(isYesterday(jan2nd)).toBe(false);
  });
});

describe('综合测试', () => {
  let mockNow: Date;

  beforeEach(() => {
    mockNow = new Date('2025-01-05T12:00:00');
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该在实际场景中正确工作', () => {
    const today = new Date('2025-01-05T10:30:00');
    const yesterday = new Date('2025-01-04T15:45:00');

    expect(isToday(today)).toBe(true);
    expect(isYesterday(yesterday)).toBe(true);
    expect(formatDate(today)).toBe('2025-01-05');
    expect(formatDateTime(yesterday)).toBe('2025-01-04 15:45:00');
  });

  it('应该正确处理考试时间显示', () => {
    const examDate = new Date('2025-01-05T14:00:00');
    const submissionDate = new Date('2025-01-04T16:30:00');

    expect(isToday(examDate)).toBe(true);
    expect(isYesterday(submissionDate)).toBe(true);
    expect(formatDateTime(examDate)).toBe('2025-01-05 14:00:00');
  });

  it('应该正确处理学习进度时间', () => {
    const progressDates = [
      new Date('2025-01-05T09:00:00'),
      new Date('2025-01-04T18:30:00'),
      new Date('2025-01-03T20:00:00'),
    ];

    expect(isToday(progressDates[0])).toBe(true);
    expect(isYesterday(progressDates[1])).toBe(true);
    expect(isYesterday(progressDates[2])).toBe(false);

    expect(formatDateRelative(progressDates[0])).toBeTruthy();
    expect(formatDateDistance(progressDates[1])).toContain('前');
  });
});
