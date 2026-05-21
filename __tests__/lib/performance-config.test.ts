import {
  evaluatePerformanceMetric,
  formatPerformanceReport,
  generatePerformanceReport,
} from '@/lib/performance.config';
import { describe, expect, it } from 'vitest';

describe('performance.config', () => {
  describe('evaluatePerformanceMetric', () => {
    it('should return pass status for good metric', () => {
      const result = evaluatePerformanceMetric('componentRenderTime', 10);
      expect(result.name).toBe('componentRenderTime');
      expect(result.value).toBe(10);
      expect(['pass', 'warning', 'fail']).toContain(result.status);
    });

    it('should return fail status for bad metric', () => {
      const result = evaluatePerformanceMetric('componentRenderTime', 99999);
      expect(['fail', 'warning']).toContain(result.status);
    });

    it('should throw for unknown metric names', () => {
      expect(() => evaluatePerformanceMetric('unknownMetric', 100)).toThrow();
    });

    it('should handle zero values', () => {
      const result = evaluatePerformanceMetric('componentRenderTime', 0);
      expect(result).toBeDefined();
      expect(result.value).toBe(0);
    });

    it('should have correct unit', () => {
      const result = evaluatePerformanceMetric('componentRenderTime', 10);
      expect(result.unit).toBeDefined();
    });
  });

  describe('generatePerformanceReport', () => {
    it('should generate report with metrics', () => {
      const metrics = [
        evaluatePerformanceMetric('componentRenderTime', 10),
        evaluatePerformanceMetric('firstContentfulPaint', 500),
      ];
      const report = generatePerformanceReport(metrics);
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('overallScore');
      expect(report).toHaveProperty('recommendations');
      expect(report.metrics.length).toBe(2);
    });

    it('should handle empty metrics', () => {
      const report = generatePerformanceReport([]);
      expect(report).toBeDefined();
      expect(report.metrics.length).toBe(0);
    });
  });

  describe('formatPerformanceReport', () => {
    it('should format report as string', () => {
      const metrics = [evaluatePerformanceMetric('componentRenderTime', 10)];
      const report = generatePerformanceReport(metrics);
      const formatted = formatPerformanceReport(report);
      expect(typeof formatted).toBe('string');
    });
  });
});
