/**
 * @fileoverview 性能监控组件
 * @description 实现前端性能指标追踪和监控，包括FCP、LCP、FID、CLS等核心指标
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

interface PerformanceMonitorProps {
  /** 是否启用监控 */
  enabled?: boolean;
  /** 采样率 (0-1) */
  sampleRate?: number;
  /** 自定义指标上报回调 */
  onMetricReport?: (metric: PerformanceMetric) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  sampleRate = 1.0,
  onMetricReport,
}) => {
  const pathname = usePathname();
  const isSampled = useRef<boolean>(Math.random() < sampleRate);
  const metricsReported = useRef<Set<string>>(new Set());

  // 上报指标
  const reportMetric = (name: string, value: number) => {
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
  };

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

    // 检查PerformanceObserver支持
    if ('PerformanceObserver' in window) {
      // 监控Paint指标 (FCP, LCP)
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          reportMetric(entry.name, entry.startTime);
        });
      });

      paintObserver.observe({ entryTypes: ['paint'] });

      // 监控Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        reportMetric('LCP', lastEntry.startTime);
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // 监控First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          reportMetric('FID', entry.processingStart - entry.startTime);
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });

      // 监控Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            const currentCls = entry.value;
            reportMetric('CLS', currentCls);
          }
        });
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // 清理函数
      return () => {
        paintObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }

    // 监控TTFB
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.requestStart;
      reportMetric('TTFB', ttfb);
    }

    // 监控资源加载时间
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          reportMetric(`${entry.initiatorType}_load_time`, entry.duration);
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    return () => resourceObserver.disconnect();
  }, [enabled, pathname]);

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
  }, [enabled]);

  return null;
};

export default PerformanceMonitor;