/**
 * @fileoverview 性能监控组件
 * @description 实现前端性能指标追踪和监控，包括FCP、LCP、FID、CLS等核心指标
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2026-01-21
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  unit?: string;
  status?: 'pass' | 'fail' | 'warning';
  threshold?: number;
}

interface PerformanceMonitorProps {
  /** 是否启用监控 */
  enabled?: boolean;
  /** 采样率 (0-1) */
  sampleRate?: number;
  /** 自定义指标上报回调 */
  onMetricReport?: (metric: PerformanceMetric) => void;
}

interface PerformanceThreshold {
  name: string;
  threshold: number;
  unit: string;
  critical: boolean;
}

const PERFORMANCE_THRESHOLDS: PerformanceThreshold[] = [
  { name: 'componentRenderTime', threshold: 40, unit: 'ms', critical: true },
  { name: 'firstContentfulPaint', threshold: 1800, unit: 'ms', critical: true },
  { name: 'largestContentfulPaint', threshold: 2500, unit: 'ms', critical: true },
  { name: 'interactionToNextPaint', threshold: 200, unit: 'ms', critical: true },
  { name: 'cumulativeLayoutShift', threshold: 0.1, unit: '', critical: true },
  { name: 'timeToInteractive', threshold: 3800, unit: 'ms', critical: true },
  { name: 'totalBlockingTime', threshold: 300, unit: 'ms', critical: true },
  { name: 'cacheHitRate', threshold: 90, unit: '%', critical: false },
  { name: 'databaseQueryTime', threshold: 100, unit: 'ms', critical: true },
  { name: 'apiResponseTime', threshold: 200, unit: 'ms', critical: true },
];

function evaluatePerformanceMetric(name: string, value: number): PerformanceMetric {
  const threshold = PERFORMANCE_THRESHOLDS.find(t => t.name === name);
  
  if (!threshold) {
    return {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname,
    };
  }

  let status: 'pass' | 'fail' | 'warning';
  
  if (threshold.critical) {
    status = value <= threshold.threshold ? 'pass' : 'fail';
  } else {
    if (value >= threshold.threshold) {
      status = 'pass';
    } else if (value >= threshold.threshold * 0.8) {
      status = 'warning';
    } else {
      status = 'fail';
    }
  }

  return {
    name,
    value,
    timestamp: Date.now(),
    url: window.location.pathname,
    unit: threshold.unit,
    status,
    threshold: threshold.threshold,
  };
}

const logger = {
  error: (message: string, error: any) => {
    console.error(`[PerformanceMonitor] ${message}`, error);
  },
  warn: (message: string) => {
    console.warn(`[PerformanceMonitor] ${message}`);
  },
  info: (message: string) => {
    console.info(`[PerformanceMonitor] ${message}`);
  },
};

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  sampleRate = 1.0,
  onMetricReport,
}) => {
  const pathname = usePathname();
  const isSampled = useRef<boolean>(Math.random() < sampleRate);
  const metricsReported = useRef<Set<string>>(new Set());

  // 上报指标
  const reportMetric = useCallback((name: string, value: number) => {
    if (!enabled || !isSampled.current) return;
    if (metricsReported.current.has(name)) return;

    metricsReported.current.add(name);

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: pathname,
    };

    // 调用自定义回调
    if (onMetricReport) {
      onMetricReport(metric);
    }

    // 发送到监控服务
    sendToMonitoringService(metric);
  }, [enabled, pathname, onMetricReport]);

  // 发送指标到监控服务
  const sendToMonitoringService = async (metric: PerformanceMetric) => {
    try {
      // 使用Navigator.sendBeacon发送性能指标
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/performance', JSON.stringify(metric));
      } else {
        // 降级方案
        await fetch('/api/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
          keepalive: true,
        });
      }
    } catch (error) {
      // 静默处理，不影响用户体验
      logger.error('性能指标上报失败', error);
    }
  };

  // 初始化性能监控
  useEffect(() => {
    if (!enabled || !isSampled.current) return;

    // 重置已上报指标集合
    metricsReported.current.clear();

    // 使用web-vitals库监控核心Web Vitals
    onCLS((metric) => {
      const evaluatedMetric = evaluatePerformanceMetric('cumulativeLayoutShift', metric.value);
      reportMetric(evaluatedMetric.name, evaluatedMetric.value);
    });

    onFCP((metric) => {
      const evaluatedMetric = evaluatePerformanceMetric('firstContentfulPaint', metric.value);
      reportMetric(evaluatedMetric.name, evaluatedMetric.value);
    });

    onINP((metric) => {
      const evaluatedMetric = evaluatePerformanceMetric('interactionToNextPaint', metric.value);
      reportMetric(evaluatedMetric.name, evaluatedMetric.value);
    });

    onLCP((metric) => {
      const evaluatedMetric = evaluatePerformanceMetric('largestContentfulPaint', metric.value);
      reportMetric(evaluatedMetric.name, evaluatedMetric.value);
    });

    onTTFB((metric) => {
      reportMetric('timeToFirstByte', metric.value);
    });

    // 监控资源加载时间
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as any;
          reportMetric(`${resourceEntry.initiatorType}_load_time`, entry.duration);
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    return () => resourceObserver.disconnect();
  }, [enabled, pathname, reportMetric]);

  // 页面卸载时报告页面停留时间
  useEffect(() => {
    const startTime = Date.now();

    const handleUnload = () => {
      if (!enabled || !isSampled.current) return;
      
      const pageDuration = Date.now() - startTime;
      reportMetric('page_duration', pageDuration);
    };

    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, [enabled, reportMetric]);

  return null;
};

export default PerformanceMonitor;