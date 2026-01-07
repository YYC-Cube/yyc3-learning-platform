/**
 * @fileoverview 格式化工具函数测试
 * @description 测试format模块的所有格式化函数
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatTime,
  formatDate,
  formatScore,
  formatPercentage,
  formatNumber,
} from '@/lib/format';

describe('formatTime', () => {
  it('应该正确格式化秒数（只有分钟和秒）', () => {
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(125)).toBe('2:05');
    expect(formatTime(59)).toBe('0:59');
  });

  it('应该正确格式化秒数（包含小时）', () => {
    expect(formatTime(3661)).toBe('1:01:01');
    expect(formatTime(7200)).toBe('2:00:00');
    expect(formatTime(3600)).toBe('1:00:00');
  });

  it('应该正确格式化零秒', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('应该正确格式化较大的秒数', () => {
    expect(formatTime(86400)).toBe('24:00:00'); // 24小时
    expect(formatTime(3665)).toBe('1:01:05');
  });

  it('应该正确处理边界值', () => {
    expect(formatTime(1)).toBe('0:01');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(3599)).toBe('59:59');
  });
});

describe('formatDate', () => {
  it('应该正确格式化日期对象', () => {
    const date = new Date('2025-01-05');
    const result = formatDate(date);
    expect(result).toContain('2025');
    expect(result).toContain('1');
    expect(result).toContain('5');
  });

  it('应该正确格式化日期字符串', () => {
    const result = formatDate('2025-01-05');
    expect(result).toContain('2025');
    expect(result).toContain('1');
  });

  it('应该使用中文格式', () => {
    const date = new Date('2025-01-05');
    const result = formatDate(date);
    // 中文的月份通常是"1月"格式
    expect(result).toMatch(/年.*月.*日/);
  });

  it('应该正确处理闰年日期', () => {
    const result = formatDate('2024-02-29');
    expect(result).toContain('2024');
    expect(result).toContain('2');
    expect(result).toContain('29');
  });
});

describe('formatScore', () => {
  it('应该正确格式化分数和百分比', () => {
    expect(formatScore(80, 100)).toBe('80/100 (80%)');
    expect(formatScore(50, 100)).toBe('50/100 (50%)');
    expect(formatScore(100, 100)).toBe('100/100 (100%)');
  });

  it('应该正确四舍五入百分比', () => {
    expect(formatScore(83, 100)).toBe('83/100 (83%)');
    expect(formatScore(67, 100)).toBe('67/100 (67%)');
    expect(formatScore(33, 100)).toBe('33/100 (33%)');
  });

  it('应该处理不同的总分', () => {
    expect(formatScore(8, 10)).toBe('8/10 (80%)');
    expect(formatScore(45, 50)).toBe('45/50 (90%)');
    expect(formatScore(15, 20)).toBe('15/20 (75%)');
  });

  it('应该处理零分', () => {
    expect(formatScore(0, 100)).toBe('0/100 (0%)');
  });

  it('应该处理非整数结果', () => {
    expect(formatScore(1, 3)).toBe('1/3 (33%)');
    expect(formatScore(2, 3)).toBe('2/3 (67%)');
  });
});

describe('formatPercentage', () => {
  it('应该正确格式化百分比（默认无小数）', () => {
    expect(formatPercentage(50.5)).toBe('51%');
    expect(formatPercentage(33.33)).toBe('33%');
    expect(formatPercentage(66.67)).toBe('67%');
  });

  it('应该正确格式化百分比（指定小数位数）', () => {
    expect(formatPercentage(50.5, 1)).toBe('50.5%');
    expect(formatPercentage(33.333, 2)).toBe('33.33%');
    expect(formatPercentage(66.6667, 3)).toBe('66.667%');
  });

  it('应该处理零百分比', () => {
    expect(formatPercentage(0)).toBe('0%');
    expect(formatPercentage(0.5)).toBe('1%');
  });

  it('应该处理100%以上', () => {
    expect(formatPercentage(100)).toBe('100%');
    expect(formatPercentage(150.5)).toBe('151%');
  });

  it('应该处理小数值', () => {
    expect(formatPercentage(0.123, 2)).toBe('0.12%');
    expect(formatPercentage(0.001, 3)).toBe('0.001%');
  });
});

describe('formatNumber', () => {
  it('应该正确格式化整数', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(1000000000)).toBe('1,000,000,000');
  });

  it('应该正确格式化小数', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber(1234567.89)).toBe('1,234,567.89');
  });

  it('应该处理负数', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
    expect(formatNumber(-1234567.89)).toBe('-1,234,567.89');
  });

  it('应该处理零', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('应该处理小于1000的数字', () => {
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(99)).toBe('99');
    expect(formatNumber(9)).toBe('9');
  });

  it('应该使用中文千位分隔符', () => {
    // 中文环境使用逗号作为千位分隔符
    const result = formatNumber(1234567890);
    expect(result).toContain(',');
  });
});

describe('综合测试', () => {
  it('应该正确组合使用多个格式化函数', () => {
    const score = formatScore(85, 100);
    const time = formatTime(5430); // 1:30:30
    const percentage = formatPercentage(85.5, 1);

    expect(score).toBe('85/100 (85%)');
    expect(time).toBe('1:30:30');
    expect(percentage).toBe('85.5%');
  });

  it('应该在实际场景中正确工作', () => {
    // 考试结果展示
    const examScore = formatScore(92, 100);
    const examTime = formatTime(2700); // 45分钟
    const examDate = formatDate('2025-01-05');

    expect(examScore).toContain('92');
    expect(examTime).toBe('45:00');
    expect(examDate).toContain('2025');
  });
});
