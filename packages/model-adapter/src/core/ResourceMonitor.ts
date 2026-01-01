import { EventEmitter } from 'events';

export interface ResourceMetrics {
  timestamp: Date;
  memory: MemoryMetrics;
  cpu: CPUMetrics;
  network: NetworkMetrics;
  system: SystemMetrics;
}

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  heapUsedPercentage: number;
  rss: number;
  external: number;
  arrayBuffers: number;
  heapUsageLimit: number;
  heapUsageLimitPercentage: number;
}

export interface CPUMetrics {
  usage: number;
  userCPUTime: number;
  systemCPUTime: number;
  loadAverage: number[];
  cpuCount: number;
  processCPUUsage: number;
}

export interface NetworkMetrics {
  bytesReceived: number;
  bytesSent: number;
  requestCount: number;
  responseCount: number;
  errorCount: number;
  averageLatency: number;
  bandwidthUsage: number;
  connectionCount: number;
}

export interface SystemMetrics {
  uptime: number;
  platform: string;
  arch: string;
  nodeVersion: string;
  totalMemory: number;
  freeMemory: number;
  freeMemoryPercentage: number;
}

export interface ResourceThresholds {
  memory: {
    warning: number;
    critical: number;
  };
  cpu: {
    warning: number;
    critical: number;
  };
  network: {
    warningLatency: number;
    criticalLatency: number;
    warningErrorRate: number;
    criticalErrorRate: number;
  };
}

export interface ResourceAlert {
  type: 'memory' | 'cpu' | 'network' | 'system';
  severity: 'warning' | 'critical';
  message: string;
  metrics: any;
  timestamp: Date;
  recommendation?: string;
}

export interface ResourceOptimization {
  type: 'memory' | 'cpu' | 'network';
  currentUsage: number;
  threshold: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
}

export interface ResourceMonitorConfig {
  collectInterval?: number;
  historySize?: number;
  thresholds?: ResourceThresholds;
  enableAlerts?: boolean;
  enableOptimization?: boolean;
}

const DEFAULT_THRESHOLDS: ResourceThresholds = {
  memory: {
    warning: 70,
    critical: 85
  },
  cpu: {
    warning: 70,
    critical: 85
  },
  network: {
    warningLatency: 500,
    criticalLatency: 1000,
    warningErrorRate: 0.05,
    criticalErrorRate: 0.1
  }
};

export class ResourceMonitor extends EventEmitter {
  private config: Required<ResourceMonitorConfig>;
  private metricsHistory: ResourceMetrics[] = [];
  private collectTimer: NodeJS.Timeout | null = null;
  private previousCPUUsage: NodeJS.CpuUsage;
  private previousCPUTime: number;
  private networkMetrics: {
    bytesReceived: number;
    bytesSent: number;
    requestCount: number;
    responseCount: number;
    errorCount: number;
    latencies: number[];
  };

  constructor(config: ResourceMonitorConfig = {}) {
    super();
    this.config = {
      collectInterval: config.collectInterval || 5000,
      historySize: config.historySize || 100,
      thresholds: config.thresholds || DEFAULT_THRESHOLDS,
      enableAlerts: config.enableAlerts !== false,
      enableOptimization: config.enableOptimization !== false
    };

    this.previousCPUUsage = process.cpuUsage();
    this.previousCPUTime = Date.now();
    this.networkMetrics = {
      bytesReceived: 0,
      bytesSent: 0,
      requestCount: 0,
      responseCount: 0,
      errorCount: 0,
      latencies: []
    };
  }

  async start(): Promise<void> {
    if (this.collectTimer) {
      return;
    }

    this.collectTimer = setInterval(async () => {
      await this.collectMetrics();
    }, this.config.collectInterval);

    await this.collectMetrics();
  }

  async stop(): Promise<void> {
    if (this.collectTimer) {
      clearInterval(this.collectTimer);
      this.collectTimer = null;
    }
  }

  private async collectMetrics(): Promise<ResourceMetrics> {
    const memoryMetrics = this.collectMemoryMetrics();
    const cpuMetrics = await this.collectCPUMetrics();
    const networkMetrics = this.collectNetworkMetrics();
    const systemMetrics = this.collectSystemMetrics();

    const metrics: ResourceMetrics = {
      timestamp: new Date(),
      memory: memoryMetrics,
      cpu: cpuMetrics,
      network: networkMetrics,
      system: systemMetrics
    };

    this.addToHistory(metrics);

    if (this.config.enableAlerts) {
      await this.checkThresholds(metrics);
    }

    this.emit('metrics:collected', metrics);

    return metrics;
  }

  private collectMemoryMetrics(): MemoryMetrics {
    const memoryUsage = process.memoryUsage();
    const heapUsageLimit = process.memoryUsage().heapUsed;

    return {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      heapUsedPercentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
      rss: memoryUsage.rss,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers,
      heapUsageLimit: heapUsageLimit,
      heapUsageLimitPercentage: (memoryUsage.heapUsed / heapUsageLimit) * 100
    };
  }

  private async collectCPUMetrics(): Promise<CPUMetrics> {
    const currentCPUUsage = process.cpuUsage(this.previousCPUUsage);
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.previousCPUTime;

    const totalCPUTime = currentCPUUsage.user + currentCPUUsage.system;
    const usage = (totalCPUTime / (elapsedTime * 1000)) * 100;

    this.previousCPUUsage = process.cpuUsage();
    this.previousCPUTime = currentTime;

    return {
      usage: Math.min(usage, 100),
      userCPUTime: currentCPUUsage.user,
      systemCPUTime: currentCPUUsage.system,
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
      cpuCount: require('os').cpus().length,
      processCPUUsage: usage
    };
  }

  private collectNetworkMetrics(): NetworkMetrics {
    const latencies = this.networkMetrics.latencies;
    const averageLatency = latencies.length > 0
      ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
      : 0;

    const errorRate = this.networkMetrics.requestCount > 0
      ? this.networkMetrics.errorCount / this.networkMetrics.requestCount
      : 0;

    return {
      bytesReceived: this.networkMetrics.bytesReceived,
      bytesSent: this.networkMetrics.bytesSent,
      requestCount: this.networkMetrics.requestCount,
      responseCount: this.networkMetrics.responseCount,
      errorCount: this.networkMetrics.errorCount,
      averageLatency,
      bandwidthUsage: this.networkMetrics.bytesReceived + this.networkMetrics.bytesSent,
      connectionCount: this.networkMetrics.requestCount
    };
  }

  private collectSystemMetrics(): SystemMetrics {
    const os = require('os');

    return {
      uptime: process.uptime(),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      freeMemoryPercentage: (os.freemem() / os.totalmem()) * 100
    };
  }

  private addToHistory(metrics: ResourceMetrics): void {
    this.metricsHistory.push(metrics);

    if (this.metricsHistory.length > this.config.historySize) {
      this.metricsHistory.shift();
    }
  }

  private async checkThresholds(metrics: ResourceMetrics): Promise<void> {
    const alerts: ResourceAlert[] = [];

    if (metrics.memory.heapUsedPercentage > this.config.thresholds.memory.critical) {
      alerts.push({
        type: 'memory',
        severity: 'critical',
        message: `内存使用率严重: ${metrics.memory.heapUsedPercentage.toFixed(2)}%`,
        metrics: metrics.memory,
        timestamp: metrics.timestamp,
        recommendation: '建议立即清理缓存、释放未使用资源或增加内存分配'
      });
    } else if (metrics.memory.heapUsedPercentage > this.config.thresholds.memory.warning) {
      alerts.push({
        type: 'memory',
        severity: 'warning',
        message: `内存使用率较高: ${metrics.memory.heapUsedPercentage.toFixed(2)}%`,
        metrics: metrics.memory,
        timestamp: metrics.timestamp,
        recommendation: '建议优化内存使用、清理缓存或考虑增加内存分配'
      });
    }

    if (metrics.cpu.usage > this.config.thresholds.cpu.critical) {
      alerts.push({
        type: 'cpu',
        severity: 'critical',
        message: `CPU使用率严重: ${metrics.cpu.usage.toFixed(2)}%`,
        metrics: metrics.cpu,
        timestamp: metrics.timestamp,
        recommendation: '建议优化CPU密集型操作、增加并发处理能力或扩展服务器资源'
      });
    } else if (metrics.cpu.usage > this.config.thresholds.cpu.warning) {
      alerts.push({
        type: 'cpu',
        severity: 'warning',
        message: `CPU使用率较高: ${metrics.cpu.usage.toFixed(2)}%`,
        metrics: metrics.cpu,
        timestamp: metrics.timestamp,
        recommendation: '建议优化CPU使用、减少不必要的计算或增加处理能力'
      });
    }

    const errorRate = metrics.network.requestCount > 0
      ? metrics.network.errorCount / metrics.network.requestCount
      : 0;

    if (errorRate > this.config.thresholds.network.criticalErrorRate) {
      alerts.push({
        type: 'network',
        severity: 'critical',
        message: `网络错误率严重: ${(errorRate * 100).toFixed(2)}%`,
        metrics: metrics.network,
        timestamp: metrics.timestamp,
        recommendation: '建议检查网络连接、优化错误处理或增加重试机制'
      });
    } else if (errorRate > this.config.thresholds.network.warningErrorRate) {
      alerts.push({
        type: 'network',
        severity: 'warning',
        message: `网络错误率较高: ${(errorRate * 100).toFixed(2)}%`,
        metrics: metrics.network,
        timestamp: metrics.timestamp,
        recommendation: '建议优化网络请求处理、增加错误监控或改进重试策略'
      });
    }

    if (metrics.network.averageLatency > this.config.thresholds.network.criticalLatency) {
      alerts.push({
        type: 'network',
        severity: 'critical',
        message: `网络延迟严重: ${metrics.network.averageLatency.toFixed(2)}ms`,
        metrics: metrics.network,
        timestamp: metrics.timestamp,
        recommendation: '建议优化网络请求、使用CDN加速或增加服务器带宽'
      });
    } else if (metrics.network.averageLatency > this.config.thresholds.network.warningLatency) {
      alerts.push({
        type: 'network',
        severity: 'warning',
        message: `网络延迟较高: ${metrics.network.averageLatency.toFixed(2)}ms`,
        metrics: metrics.network,
        timestamp: metrics.timestamp,
        recommendation: '建议优化网络请求、减少数据传输量或使用缓存'
      });
    }

    for (const alert of alerts) {
      this.emit('alert', alert);
    }
  }

  recordNetworkRequest(bytesReceived: number, bytesSent: number): void {
    this.networkMetrics.bytesReceived += bytesReceived;
    this.networkMetrics.bytesSent += bytesSent;
    this.networkMetrics.requestCount++;
  }

  recordNetworkResponse(latency: number, isError: boolean = false): void {
    this.networkMetrics.responseCount++;
    this.networkMetrics.latencies.push(latency);

    if (isError) {
      this.networkMetrics.errorCount++;
    }

    if (this.networkMetrics.latencies.length > 1000) {
      this.networkMetrics.latencies.shift();
    }
  }

  getLatestMetrics(): ResourceMetrics | null {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }

  getMetricsHistory(timeRange?: { start: Date; end: Date }): ResourceMetrics[] {
    if (!timeRange) {
      return [...this.metricsHistory];
    }

    return this.metricsHistory.filter(metrics =>
      metrics.timestamp >= timeRange.start && metrics.timestamp <= timeRange.end
    );
  }

  getAverageMetrics(duration: number = 60000): ResourceMetrics | null {
    const now = Date.now();
    const startTime = new Date(now - duration);

    const relevantMetrics = this.getMetricsHistory({ start: startTime, end: new Date() });

    if (relevantMetrics.length === 0) {
      return null;
    }

    return {
      timestamp: new Date(),
      memory: this.averageMemoryMetrics(relevantMetrics),
      cpu: this.averageCPUMetrics(relevantMetrics),
      network: this.averageNetworkMetrics(relevantMetrics),
      system: relevantMetrics[relevantMetrics.length - 1].system
    };
  }

  private averageMemoryMetrics(metrics: ResourceMetrics[]): MemoryMetrics {
    const sum = metrics.reduce((acc, m) => ({
      heapUsed: acc.heapUsed + m.memory.heapUsed,
      heapTotal: acc.heapTotal + m.memory.heapTotal,
      rss: acc.rss + m.memory.rss,
      external: acc.external + m.memory.external,
      arrayBuffers: acc.arrayBuffers + m.memory.arrayBuffers,
      heapUsageLimit: acc.heapUsageLimit + m.memory.heapUsageLimit
    }), {
      heapUsed: 0,
      heapTotal: 0,
      rss: 0,
      external: 0,
      arrayBuffers: 0,
      heapUsageLimit: 0
    });

    const count = metrics.length;
    return {
      heapUsed: sum.heapUsed / count,
      heapTotal: sum.heapTotal / count,
      heapUsedPercentage: (sum.heapUsed / sum.heapTotal) * 100,
      rss: sum.rss / count,
      external: sum.external / count,
      arrayBuffers: sum.arrayBuffers / count,
      heapUsageLimit: sum.heapUsageLimit / count,
      heapUsageLimitPercentage: (sum.heapUsed / sum.heapUsageLimit) * 100
    };
  }

  private averageCPUMetrics(metrics: ResourceMetrics[]): CPUMetrics {
    const sum = metrics.reduce((acc, m) => ({
      usage: acc.usage + m.cpu.usage,
      userCPUTime: acc.userCPUTime + m.cpu.userCPUTime,
      systemCPUTime: acc.systemCPUTime + m.cpu.systemCPUTime
    }), {
      usage: 0,
      userCPUTime: 0,
      systemCPUTime: 0
    });

    const count = metrics.length;
    const latestMetrics = metrics[metrics.length - 1];

    return {
      usage: sum.usage / count,
      userCPUTime: sum.userCPUTime / count,
      systemCPUTime: sum.systemCPUTime / count,
      loadAverage: latestMetrics.cpu.loadAverage,
      cpuCount: latestMetrics.cpu.cpuCount,
      processCPUUsage: sum.usage / count
    };
  }

  private averageNetworkMetrics(metrics: ResourceMetrics[]): NetworkMetrics {
    const sum = metrics.reduce((acc, m) => ({
      bytesReceived: acc.bytesReceived + m.network.bytesReceived,
      bytesSent: acc.bytesSent + m.network.bytesSent,
      requestCount: acc.requestCount + m.network.requestCount,
      responseCount: acc.responseCount + m.network.responseCount,
      errorCount: acc.errorCount + m.network.errorCount,
      averageLatency: acc.averageLatency + m.network.averageLatency
    }), {
      bytesReceived: 0,
      bytesSent: 0,
      requestCount: 0,
      responseCount: 0,
      errorCount: 0,
      averageLatency: 0
    });

    const count = metrics.length;
    const latestMetrics = metrics[metrics.length - 1];

    return {
      bytesReceived: sum.bytesReceived / count,
      bytesSent: sum.bytesSent / count,
      requestCount: sum.requestCount / count,
      responseCount: sum.responseCount / count,
      errorCount: sum.errorCount / count,
      averageLatency: sum.averageLatency / count,
      bandwidthUsage: (sum.bytesReceived + sum.bytesSent) / count,
      connectionCount: sum.requestCount / count
    };
  }

  generateOptimizationRecommendations(): ResourceOptimization[] {
    const latestMetrics = this.getLatestMetrics();
    if (!latestMetrics) {
      return [];
    }

    const recommendations: ResourceOptimization[] = [];

    if (latestMetrics.memory.heapUsedPercentage > this.config.thresholds.memory.warning) {
      recommendations.push({
        type: 'memory',
        currentUsage: latestMetrics.memory.heapUsedPercentage,
        threshold: this.config.thresholds.memory.warning,
        recommendation: '优化内存使用：清理未使用的对象、实现对象池、使用流式处理大文件、启用垃圾回收优化',
        priority: latestMetrics.memory.heapUsedPercentage > this.config.thresholds.memory.critical ? 'high' : 'medium',
        estimatedImpact: '可减少20-40%内存使用'
      });
    }

    if (latestMetrics.cpu.usage > this.config.thresholds.cpu.warning) {
      recommendations.push({
        type: 'cpu',
        currentUsage: latestMetrics.cpu.usage,
        threshold: this.config.thresholds.cpu.warning,
        recommendation: '优化CPU使用：使用异步处理、实现任务队列、优化算法复杂度、使用缓存减少计算',
        priority: latestMetrics.cpu.usage > this.config.thresholds.cpu.critical ? 'high' : 'medium',
        estimatedImpact: '可减少30-50%CPU使用'
      });
    }

    const errorRate = latestMetrics.network.requestCount > 0
      ? latestMetrics.network.errorCount / latestMetrics.network.requestCount
      : 0;

    if (errorRate > this.config.thresholds.network.warningErrorRate) {
      recommendations.push({
        type: 'network',
        currentUsage: errorRate * 100,
        threshold: this.config.thresholds.network.warningErrorRate * 100,
        recommendation: '优化网络请求：实现重试机制、使用连接池、优化数据传输格式、启用压缩',
        priority: errorRate > this.config.thresholds.network.criticalErrorRate ? 'high' : 'medium',
        estimatedImpact: '可减少50-70%网络错误'
      });
    }

    if (latestMetrics.network.averageLatency > this.config.thresholds.network.warningLatency) {
      recommendations.push({
        type: 'network',
        currentUsage: latestMetrics.network.averageLatency,
        threshold: this.config.thresholds.network.warningLatency,
        recommendation: '优化网络延迟：使用CDN加速、减少请求数量、实现本地缓存、优化DNS解析',
        priority: latestMetrics.network.averageLatency > this.config.thresholds.network.criticalLatency ? 'high' : 'medium',
        estimatedImpact: '可减少40-60%网络延迟'
      });
    }

    return recommendations;
  }

  getResourceReport(): {
    summary: {
      status: 'healthy' | 'warning' | 'critical';
      uptime: number;
      lastUpdate: Date;
    };
    metrics: ResourceMetrics;
    trends: {
      memory: 'increasing' | 'decreasing' | 'stable';
      cpu: 'increasing' | 'decreasing' | 'stable';
      network: 'increasing' | 'decreasing' | 'stable';
    };
    alerts: ResourceAlert[];
    recommendations: ResourceOptimization[];
  } {
    const latestMetrics = this.getLatestMetrics();
    if (!latestMetrics) {
      throw new Error('No metrics available');
    }

    const alerts: ResourceAlert[] = [];
    const recommendations = this.generateOptimizationRecommendations();

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (latestMetrics.memory.heapUsedPercentage > this.config.thresholds.memory.critical ||
        latestMetrics.cpu.usage > this.config.thresholds.cpu.critical) {
      status = 'critical';
    } else if (latestMetrics.memory.heapUsedPercentage > this.config.thresholds.memory.warning ||
               latestMetrics.cpu.usage > this.config.thresholds.cpu.warning) {
      status = 'warning';
    }

    const trends = this.calculateTrends();

    return {
      summary: {
        status,
        uptime: latestMetrics.system.uptime,
        lastUpdate: latestMetrics.timestamp
      },
      metrics: latestMetrics,
      trends,
      alerts,
      recommendations
    };
  }

  private calculateTrends(): {
    memory: 'increasing' | 'decreasing' | 'stable';
    cpu: 'increasing' | 'decreasing' | 'stable';
    network: 'increasing' | 'decreasing' | 'stable';
  } {
    if (this.metricsHistory.length < 2) {
      return {
        memory: 'stable',
        cpu: 'stable',
        network: 'stable'
      };
    }

    const recentMetrics = this.metricsHistory.slice(-10);
    const firstMetrics = recentMetrics[0];
    const lastMetrics = recentMetrics[recentMetrics.length - 1];

    const memoryTrend = lastMetrics.memory.heapUsedPercentage - firstMetrics.memory.heapUsedPercentage;
    const cpuTrend = lastMetrics.cpu.usage - firstMetrics.cpu.usage;
    const networkTrend = lastMetrics.network.bandwidthUsage - firstMetrics.network.bandwidthUsage;

    const getTrend = (value: number): 'increasing' | 'decreasing' | 'stable' => {
      if (value > 5) return 'increasing';
      if (value < -5) return 'decreasing';
      return 'stable';
    };

    return {
      memory: getTrend(memoryTrend),
      cpu: getTrend(cpuTrend),
      network: getTrend(networkTrend)
    };
  }

  updateConfig(config: Partial<ResourceMonitorConfig>): void {
    if (config.collectInterval !== undefined) {
      this.config.collectInterval = config.collectInterval;
      if (this.collectTimer) {
        this.stop();
        this.start();
      }
    }
    if (config.historySize !== undefined) {
      this.config.historySize = config.historySize;
      while (this.metricsHistory.length > this.config.historySize) {
        this.metricsHistory.shift();
      }
    }
    if (config.thresholds !== undefined) {
      this.config.thresholds = { ...this.config.thresholds, ...config.thresholds };
    }
    if (config.enableAlerts !== undefined) {
      this.config.enableAlerts = config.enableAlerts;
    }
    if (config.enableOptimization !== undefined) {
      this.config.enableOptimization = config.enableOptimization;
    }
  }

  resetNetworkMetrics(): void {
    this.networkMetrics = {
      bytesReceived: 0,
      bytesSent: 0,
      requestCount: 0,
      responseCount: 0,
      errorCount: 0,
      latencies: []
    };
  }

  async cleanup(): Promise<void> {
    await this.stop();
    this.metricsHistory = [];
    this.resetNetworkMetrics();
    this.removeAllListeners();
  }
}
