import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ResourceMonitor, ResourceMonitorConfig, ResourceMetrics } from './ResourceMonitor';

describe('ResourceMonitor', () => {
  let monitor: ResourceMonitor;
  const mockConfig: ResourceMonitorConfig = {
    collectInterval: 100,
    historySize: 10,
    enableAlerts: true,
    enableOptimization: true
  };

  beforeEach(() => {
    monitor = new ResourceMonitor(mockConfig);
  });

  afterEach(async () => {
    await monitor.cleanup();
  });

  describe('Initialization', () => {
    test('should initialize with default config', () => {
      const defaultMonitor = new ResourceMonitor();
      expect(defaultMonitor).toBeDefined();
    });

    test('should initialize with custom config', () => {
      expect(monitor).toBeDefined();
    });

    test('should have correct initial state', () => {
      const latestMetrics = monitor.getLatestMetrics();
      expect(latestMetrics).toBeNull();
    });
  });

  describe('Metrics Collection', () => {
    test('should start and stop monitoring', async () => {
      await monitor.start();
      expect(monitor.getLatestMetrics()).not.toBeNull();

      await monitor.stop();
    });

    test('should collect metrics on interval', async () => {
      await monitor.start();

      await new Promise(resolve => setTimeout(resolve, 250));

      const latestMetrics = monitor.getLatestMetrics();
      expect(latestMetrics).toBeDefined();
      expect(latestMetrics?.timestamp).toBeInstanceOf(Date);

      await monitor.stop();
    });

    test('should collect memory metrics', async () => {
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      const metrics = monitor.getLatestMetrics();
      expect(metrics?.memory).toBeDefined();
      expect(metrics?.memory.heapUsed).toBeGreaterThan(0);
      expect(metrics?.memory.heapTotal).toBeGreaterThan(0);
      expect(metrics?.memory.heapUsedPercentage).toBeGreaterThan(0);
      expect(metrics?.memory.heapUsedPercentage).toBeLessThanOrEqual(100);
      expect(metrics?.memory.rss).toBeGreaterThan(0);

      await monitor.stop();
    });

    test('should collect CPU metrics', async () => {
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      const metrics = monitor.getLatestMetrics();
      expect(metrics?.cpu).toBeDefined();
      expect(metrics?.cpu.usage).toBeGreaterThanOrEqual(0);
      expect(metrics?.cpu.usage).toBeLessThanOrEqual(100);
      expect(metrics?.cpu.cpuCount).toBeGreaterThan(0);
      expect(metrics?.cpu.loadAverage).toBeInstanceOf(Array);

      await monitor.stop();
    });

    test('should collect network metrics', async () => {
      await monitor.start();

      monitor.recordNetworkRequest(1024, 512);
      monitor.recordNetworkResponse(100, false);
      monitor.recordNetworkResponse(200, true);

      await new Promise(resolve => setTimeout(resolve, 150));

      const metrics = monitor.getLatestMetrics();
      expect(metrics?.network).toBeDefined();
      expect(metrics?.network.bytesReceived).toBeGreaterThan(0);
      expect(metrics?.network.bytesSent).toBeGreaterThan(0);
      expect(metrics?.network.requestCount).toBeGreaterThan(0);
      expect(metrics?.network.responseCount).toBeGreaterThan(0);
      expect(metrics?.network.errorCount).toBe(1);

      await monitor.stop();
    });

    test('should collect system metrics', async () => {
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      const metrics = monitor.getLatestMetrics();
      expect(metrics?.system).toBeDefined();
      expect(metrics?.system.uptime).toBeGreaterThan(0);
      expect(metrics?.system.platform).toBeDefined();
      expect(metrics?.system.arch).toBeDefined();
      expect(metrics?.system.nodeVersion).toBeDefined();
      expect(metrics?.system.totalMemory).toBeGreaterThan(0);
      expect(metrics?.system.freeMemory).toBeGreaterThan(0);

      await monitor.stop();
    });
  });

  describe('Network Metrics Recording', () => {
    test('should record network request', () => {
      monitor.recordNetworkRequest(1024, 512);

      const metrics = monitor.getLatestMetrics();
      expect(metrics).toBeNull();
    });

    test('should record network response', () => {
      monitor.recordNetworkResponse(100, false);
      monitor.recordNetworkResponse(200, true);

      const metrics = monitor.getLatestMetrics();
      expect(metrics).toBeNull();
    });

    test('should track error count', async () => {
      await monitor.start();

      monitor.recordNetworkRequest(1024, 512);
      monitor.recordNetworkResponse(100, false);
      monitor.recordNetworkResponse(200, true);
      monitor.recordNetworkResponse(150, true);

      await new Promise(resolve => setTimeout(resolve, 150));

      const metrics = monitor.getLatestMetrics();
      expect(metrics?.network.errorCount).toBe(2);

      await monitor.stop();
    });

    test('should calculate average latency', async () => {
      await monitor.start();

      monitor.recordNetworkRequest(1024, 512);
      monitor.recordNetworkResponse(100, false);
      monitor.recordNetworkResponse(200, false);
      monitor.recordNetworkResponse(300, false);

      await new Promise(resolve => setTimeout(resolve, 150));

      const metrics = monitor.getLatestMetrics();
      expect(metrics?.network.averageLatency).toBe(200);

      await monitor.stop();
    });
  });

  describe('Metrics History', () => {
    test('should maintain metrics history', async () => {
      await monitor.start();

      await new Promise(resolve => setTimeout(resolve, 350));

      const history = monitor.getMetricsHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history.length).toBeLessThanOrEqual(mockConfig.historySize!);

      await monitor.stop();
    });

    test('should filter metrics by time range', async () => {
      await monitor.start();

      await new Promise(resolve => setTimeout(resolve, 350));

      const now = new Date();
      const fiveSecondsAgo = new Date(now.getTime() - 5000);

      const filteredHistory = monitor.getMetricsHistory({
        start: fiveSecondsAgo,
        end: now
      });

      expect(filteredHistory.length).toBeGreaterThan(0);
      filteredHistory.forEach(metrics => {
        expect(metrics.timestamp.getTime()).toBeGreaterThanOrEqual(fiveSecondsAgo.getTime());
        expect(metrics.timestamp.getTime()).toBeLessThanOrEqual(now.getTime());
      });

      await monitor.stop();
    });

    test('should limit history size', async () => {
      const smallConfig: ResourceMonitorConfig = {
        collectInterval: 50,
        historySize: 5
      };
      const smallMonitor = new ResourceMonitor(smallConfig);

      await smallMonitor.start();
      await new Promise(resolve => setTimeout(resolve, 500));

      const history = smallMonitor.getMetricsHistory();
      expect(history.length).toBeLessThanOrEqual(5);

      await smallMonitor.cleanup();
    });
  });

  describe('Average Metrics', () => {
    test('should calculate average metrics', async () => {
      await monitor.start();

      await new Promise(resolve => setTimeout(resolve, 350));

      const averageMetrics = monitor.getAverageMetrics(300);
      expect(averageMetrics).toBeDefined();
      expect(averageMetrics?.memory).toBeDefined();
      expect(averageMetrics?.cpu).toBeDefined();
      expect(averageMetrics?.network).toBeDefined();
      expect(averageMetrics?.system).toBeDefined();

      await monitor.stop();
    });

    test('should return null for average when no metrics', () => {
      const averageMetrics = monitor.getAverageMetrics(1000);
      expect(averageMetrics).toBeNull();
    });
  });

  describe('Alerts', () => {
    test('should emit alert when memory exceeds warning threshold', async () => {
      const alertSpy = vi.fn();
      monitor.on('alert', alertSpy);

      monitor.updateConfig({
        thresholds: {
          memory: { warning: 0, critical: 100 },
          cpu: { warning: 100, critical: 100 },
          network: {
            warningLatency: 10000,
            criticalLatency: 20000,
            warningErrorRate: 1,
            criticalErrorRate: 1
          }
        }
      });

      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(alertSpy).toHaveBeenCalled();
      const alert = alertSpy.mock.calls[0][0];
      expect(alert.type).toBe('memory');
      expect(alert.severity).toBe('warning');

      await monitor.stop();
    });

    test('should emit alert when CPU exceeds critical threshold', async () => {
      const alertSpy = vi.fn();
      monitor.on('alert', alertSpy);

      monitor.updateConfig({
        thresholds: {
          memory: { warning: 100, critical: 100 },
          cpu: { warning: 0, critical: 0 },
          network: {
            warningLatency: 10000,
            criticalLatency: 20000,
            warningErrorRate: 1,
            criticalErrorRate: 1
          }
        }
      });

      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(alertSpy).toHaveBeenCalled();
      const alert = alertSpy.mock.calls[0][0];
      expect(alert.type).toBe('cpu');
      expect(alert.severity).toBe('critical');

      await monitor.stop();
    });

    test('should emit alert when network latency is high', async () => {
      const alertSpy = jest.fn();
      monitor.on('alert', alertSpy);

      monitor.updateConfig({
        thresholds: {
          memory: { warning: 100, critical: 100 },
          cpu: { warning: 100, critical: 100 },
          network: {
            warningLatency: 50,
            criticalLatency: 100,
            warningErrorRate: 1,
            criticalErrorRate: 1
          }
        }
      });

      await monitor.start();

      monitor.recordNetworkRequest(1024, 512);
      monitor.recordNetworkResponse(200, false);
      monitor.recordNetworkResponse(300, false);

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(alertSpy).toHaveBeenCalled();
      const alert = alertSpy.mock.calls.find((call: any) => call[0].type === 'network');
      expect(alert).toBeDefined();

      await monitor.stop();
    });

    test('should emit alert when network error rate is high', async () => {
      const alertSpy = vi.fn();
      monitor.on('alert', alertSpy);

      monitor.updateConfig({
        thresholds: {
          memory: { warning: 100, critical: 100 },
          cpu: { warning: 100, critical: 100 },
          network: {
            warningLatency: 10000,
            criticalLatency: 20000,
            warningErrorRate: 0,
            criticalErrorRate: 0
          }
        }
      });

      await monitor.start();

      monitor.recordNetworkRequest(1024, 512);
      monitor.recordNetworkResponse(100, true);
      monitor.recordNetworkResponse(200, true);

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(alertSpy).toHaveBeenCalled();
      const alert = alertSpy.mock.calls.find((call: any) => call[0].type === 'network');
      expect(alert).toBeDefined();

      await monitor.stop();
    });

    test('should not emit alerts when disabled', async () => {
      const alertSpy = jest.fn();
      monitor.on('alert', alertSpy);

      monitor.updateConfig({
        enableAlerts: false,
        thresholds: {
          memory: { warning: 0, critical: 100 },
          cpu: { warning: 100, critical: 100 },
          network: {
            warningLatency: 10000,
            criticalLatency: 20000,
            warningErrorRate: 1,
            criticalErrorRate: 1
          }
        }
      });

      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(alertSpy).not.toHaveBeenCalled();

      await monitor.stop();
    });
  });

  describe('Optimization Recommendations', () => {
    test('should generate memory optimization recommendations', async () => {
      monitor.updateConfig({
        thresholds: {
          memory: { warning: 0, critical: 100 },
          cpu: { warning: 100, critical: 100 },
          network: {
            warningLatency: 10000,
            criticalLatency: 20000,
            warningErrorRate: 1,
            criticalErrorRate: 1
          }
        }
      });

      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      const recommendations = monitor.generateOptimizationRecommendations();
      const memoryRec = recommendations.find(r => r.type === 'memory');
      expect(memoryRec).toBeDefined();
      expect(memoryRec?.recommendation).toContain('内存');

      await monitor.stop();
    });

    test('should generate CPU optimization recommendations', async () => {
      monitor.updateConfig({
        thresholds: {
          memory: { warning: 100, critical: 100 },
          cpu: { warning: 0, critical: 100 },
          network: {
            warningLatency: 10000,
            criticalLatency: 20000,
            warningErrorRate: 1,
            criticalErrorRate: 1
          }
        }
      });

      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      const recommendations = monitor.generateOptimizationRecommendations();
      const cpuRec = recommendations.find(r => r.type === 'cpu');
      expect(cpuRec).toBeDefined();
      expect(cpuRec?.recommendation).toContain('CPU');

      await monitor.stop();
    });

    test('should generate network optimization recommendations', async () => {
      monitor.updateConfig({
        thresholds: {
          memory: { warning: 100, critical: 100 },
          cpu: { warning: 100, critical: 100 },
          network: {
            warningLatency: 50,
            criticalLatency: 100,
            warningErrorRate: 1,
            criticalErrorRate: 1
          }
        }
      });

      await monitor.start();

      monitor.recordNetworkRequest(1024, 512);
      monitor.recordNetworkResponse(200, false);
      monitor.recordNetworkResponse(300, false);

      await new Promise(resolve => setTimeout(resolve, 150));

      const recommendations = monitor.generateOptimizationRecommendations();
      const networkRec = recommendations.find(r => r.type === 'network');
      expect(networkRec).toBeDefined();

      await monitor.stop();
    });

    test('should return empty recommendations when no thresholds exceeded', async () => {
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      const recommendations = monitor.generateOptimizationRecommendations();
      expect(recommendations).toHaveLength(0);

      await monitor.stop();
    });
  });

  describe('Resource Report', () => {
    test('should generate resource report', async () => {
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      const report = monitor.getResourceReport();
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.alerts).toBeDefined();
      expect(report.recommendations).toBeDefined();

      await monitor.stop();
    });

    test('should have correct status in report', async () => {
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      const report = monitor.getResourceReport();
      expect(['healthy', 'warning', 'critical']).toContain(report.summary.status);

      await monitor.stop();
    });

    test('should throw error when no metrics available', () => {
      expect(() => monitor.getResourceReport()).toThrow('No metrics available');
    });
  });

  describe('Trend Calculation', () => {
    test('should calculate stable trends when insufficient data', async () => {
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      const report = monitor.getResourceReport();
      expect(report.trends.memory).toBe('stable');
      expect(report.trends.cpu).toBe('stable');
      expect(report.trends.network).toBe('stable');

      await monitor.stop();
    });

    test('should calculate trends over time', async () => {
      await monitor.start();

      await new Promise(resolve => setTimeout(resolve, 350));

      const report = monitor.getResourceReport();
      expect(['increasing', 'decreasing', 'stable']).toContain(report.trends.memory);
      expect(['increasing', 'decreasing', 'stable']).toContain(report.trends.cpu);
      expect(['increasing', 'decreasing', 'stable']).toContain(report.trends.network);

      await monitor.stop();
    });
  });

  describe('Config Updates', () => {
    test('should update collect interval', async () => {
      await monitor.start();

      const originalInterval = monitor['config'].collectInterval;
      monitor.updateConfig({ collectInterval: 200 });
      expect(monitor['config'].collectInterval).toBe(200);

      await monitor.stop();
    });

    test('should update history size', () => {
      monitor.updateConfig({ historySize: 20 });
      expect(monitor['config'].historySize).toBe(20);
    });

    test('should update thresholds', () => {
      monitor.updateConfig({
        thresholds: {
          memory: { warning: 80, critical: 90 },
          cpu: { warning: 80, critical: 90 },
          network: {
            warningLatency: 500,
            criticalLatency: 1000,
            warningErrorRate: 0.05,
            criticalErrorRate: 0.1
          }
        }
      });

      expect(monitor['config'].thresholds.memory.warning).toBe(80);
      expect(monitor['config'].thresholds.memory.critical).toBe(90);
    });

    test('should update alert settings', () => {
      monitor.updateConfig({ enableAlerts: false });
      expect(monitor['config'].enableAlerts).toBe(false);

      monitor.updateConfig({ enableAlerts: true });
      expect(monitor['config'].enableAlerts).toBe(true);
    });

    test('should update optimization settings', () => {
      monitor.updateConfig({ enableOptimization: false });
      expect(monitor['config'].enableOptimization).toBe(false);

      monitor.updateConfig({ enableOptimization: true });
      expect(monitor['config'].enableOptimization).toBe(true);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup monitor', async () => {
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      await monitor.cleanup();

      expect(monitor.getLatestMetrics()).toBeNull();
      expect(monitor.getMetricsHistory()).toHaveLength(0);
    });

    test('should remove all event listeners on cleanup', async () => {
      const alertSpy = vi.fn();
      monitor.on('alert', alertSpy);

      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      await monitor.cleanup();

      monitor.emit('alert', { type: 'test' });
      expect(alertSpy).not.toHaveBeenCalled();
    });
  });

  describe('Events', () => {
    test('should emit metrics:collected event', async () => {
      const metricsSpy = vi.fn();
      monitor.on('metrics:collected', metricsSpy);

      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(metricsSpy).toHaveBeenCalled();
      const metrics = metricsSpy.mock.calls[0][0];
      expect(metrics).toBeInstanceOf(Object);
      expect(metrics.timestamp).toBeInstanceOf(Date);

      await monitor.stop();
    });
  });

  describe('Edge Cases', () => {
    test('should handle multiple start calls', async () => {
      await monitor.start();
      await monitor.start();

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(monitor.getLatestMetrics()).not.toBeNull();

      await monitor.stop();
    });

    test('should handle multiple stop calls', async () => {
      await monitor.start();
      await monitor.stop();
      await monitor.stop();

      expect(monitor.getLatestMetrics()).not.toBeNull();
    });

    test('should handle network metrics with no data', async () => {
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 150));

      const metrics = monitor.getLatestMetrics();
      expect(metrics?.network.requestCount).toBe(0);
      expect(metrics?.network.averageLatency).toBe(0);

      await monitor.stop();
    });

    test('should reset network metrics', async () => {
      await monitor.start();

      monitor.recordNetworkRequest(1024, 512);
      monitor.recordNetworkResponse(100, false);

      await new Promise(resolve => setTimeout(resolve, 150));

      monitor.resetNetworkMetrics();

      await new Promise(resolve => setTimeout(resolve, 150));

      const metrics = monitor.getLatestMetrics();
      expect(metrics?.network.requestCount).toBe(0);
      expect(metrics?.network.responseCount).toBe(0);

      await monitor.stop();
    });
  });
});
