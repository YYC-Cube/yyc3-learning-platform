/**
 * @fileoverview 资源监控组件 - 实时监控系统资源使用情况
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-31
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { EventEmitter } from 'eventemitter3';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { createLogger } from '../../../../lib/logger';

const logger = createLogger('ResourceMonitor');

export interface ResourceMonitorConfig {
  monitoringInterval: number;
  historyRetentionHours: number;
  enableAlerts: boolean;
  alertThresholds: AlertThresholds;
  enablePersistence: boolean;
  persistencePath: string;
}

export interface AlertThresholds {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface ResourceMetrics {
  timestamp: number;
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  system: SystemMetrics;
}

export interface CPUMetrics {
  usage: number;
  loadAverage: number[];
  coreCount: number;
  model: string;
  speed: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  usage: number;
  swapTotal: number;
  swapUsed: number;
  swapUsage: number;
}

export interface DiskMetrics {
  total: number;
  used: number;
  free: number;
  usage: number;
  path: string;
  inodesTotal: number;
  inodesUsed: number;
  inodesFree: number;
  inodesUsage: number;
}

export interface NetworkMetrics {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  errorsIn: number;
  errorsOut: number;
  dropsIn: number;
  dropsOut: number;
  bandwidth: {
    inbound: number;
    outbound: number;
  };
}

export interface SystemMetrics {
  uptime: number;
  hostname: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  processUptime: number;
  processMemory: NodeJS.MemoryUsage;
  processCpuUsage: NodeJS.CpuUsage;
}

export interface ResourceAlert {
  type: 'cpu' | 'memory' | 'disk' | 'network';
  severity: 'warning' | 'critical';
  threshold: number;
  currentValue: number;
  timestamp: number;
  message: string;
}

export interface ResourceStatistics {
  period: {
    start: number;
    end: number;
  };
  cpu: {
    avg: number;
    max: number;
    min: number;
  };
  memory: {
    avg: number;
    max: number;
    min: number;
  };
  disk: {
    avg: number;
    max: number;
    min: number;
  };
  network: {
    avgInbound: number;
    maxInbound: number;
    avgOutbound: number;
    maxOutbound: number;
  };
}

export class ResourceMonitor extends EventEmitter {
  private config: Required<ResourceMonitorConfig>;
  private metricsHistory: ResourceMetrics[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring: boolean = false;
  private previousNetworkMetrics?: NetworkMetrics;
  private startTime: number;

  constructor(config: Partial<ResourceMonitorConfig> = {}) {
    super();

    this.config = {
      monitoringInterval: config.monitoringInterval || 5000,
      historyRetentionHours: config.historyRetentionHours || 24,
      enableAlerts: config.enableAlerts !== false,
      alertThresholds: {
        cpu: config.alertThresholds?.cpu || 80,
        memory: config.alertThresholds?.memory || 85,
        disk: config.alertThresholds?.disk || 90,
        network: config.alertThresholds?.network || 90
      },
      enablePersistence: config.enablePersistence || false,
      persistencePath: config.persistencePath || './metrics'
    };

    this.startTime = Date.now();
  }

  startMonitoring(): void {
    if (this.isMonitoring) {
      logger.warn('[ResourceMonitor] Monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.monitoringInterval);

    this.emit('monitoring:started', { interval: this.config.monitoringInterval });
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) {
      logger.warn('[ResourceMonitor] Monitoring is not running');
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.isMonitoring = false;
    this.emit('monitoring:stopped');
  }

  async collectMetrics(): Promise<ResourceMetrics> {
    const timestamp = Date.now();

    const cpu = await this.collectCPUMetrics();
    const memory = this.collectMemoryMetrics();
    const disk = await this.collectDiskMetrics();
    const network = await this.collectNetworkMetrics();
    const system = this.collectSystemMetrics();

    const metrics: ResourceMetrics = {
      timestamp,
      cpu,
      memory,
      disk,
      network,
      system
    };

    this.addToHistory(metrics);
    this.checkAlerts(metrics);
    this.emit('metrics:collected', metrics);

    return metrics;
  }

  private async collectCPUMetrics(): Promise<CPUMetrics> {
    const cpus = os.cpus();
    const usage = await this.getCPUUsage();
    const loadAverage = os.loadavg();

    return {
      usage,
      loadAverage,
      coreCount: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0
    };
  }

  private async getCPUUsage(): Promise<number> {
    const startUsage = process.cpuUsage();
    const startTime = Date.now();

    await new Promise(resolve => setTimeout(resolve, 100));

    const endUsage = process.cpuUsage(startUsage);
    const endTime = Date.now();

    const totalUsage = (endUsage.user + endUsage.system) / 1000;
    const totalTime = endTime - startTime;

    return Math.min((totalUsage / totalTime) * 100, 100);
  }

  private collectMemoryMetrics(): MemoryMetrics {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;

    return {
      total,
      used,
      free,
      usage: (used / total) * 100,
      swapTotal: 0,
      swapUsed: 0,
      swapUsage: 0
    };
  }

  private async collectDiskMetrics(): Promise<DiskMetrics> {
    try {
      const rootPath = process.platform === 'win32' ? process.env.SystemDrive || 'C:' : '/';
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      let total = 0;
      let free = 0;
      let used = 0;

      if (process.platform === 'win32') {
        const { stdout } = await execAsync(`wmic logicaldisk where "DeviceID='${rootPath}'" get size,freespace /format:list`);
        const lines = stdout.split('\n');
        const sizeLine = lines.find(line => line.startsWith('Size='));
        const freeLine = lines.find(line => line.startsWith('FreeSpace='));
        total = parseInt(sizeLine?.split('=')[1] || '0');
        free = parseInt(freeLine?.split('=')[1] || '0');
      } else {
        const { stdout } = await execAsync(`df -k ${rootPath}`);
        const lines = stdout.trim().split('\n');
        if (lines.length >= 2) {
          const parts = lines[1].split(/\s+/);
          total = parseInt(parts[1]) * 1024;
          used = parseInt(parts[2]) * 1024;
          free = parseInt(parts[3]) * 1024;
        }
      }

      if (total === 0) {
        throw new Error('Failed to get disk metrics');
      }

      return {
        total,
        used,
        free,
        usage: (used / total) * 100,
        path: rootPath,
        inodesTotal: 0,
        inodesUsed: 0,
        inodesFree: 0,
        inodesUsage: 0
      };
    } catch (error) {
      logger.error('[ResourceMonitor] Failed to collect disk metrics:', error);
      return {
        total: 0,
        used: 0,
        free: 0,
        usage: 0,
        path: '/',
        inodesTotal: 0,
        inodesUsed: 0,
        inodesFree: 0,
        inodesUsage: 0
      };
    }
  }

  private async collectNetworkMetrics(): Promise<NetworkMetrics> {
    const networkInterfaces = os.networkInterfaces();
    let bytesReceived = 0;
    let bytesSent = 0;
    let packetsReceived = 0;
    let packetsSent = 0;
    let errorsIn = 0;
    let errorsOut = 0;
    let dropsIn = 0;
    let dropsOut = 0;

    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (!interfaces) continue;

      for (const iface of interfaces) {
        if (iface.family === 'IPv4' || iface.family === 'IPv6') {
          bytesReceived += iface.address.length;
          bytesSent += iface.address.length;
        }
      }
    }

    const bandwidth = {
      inbound: 0,
      outbound: 0
    };

    if (this.previousNetworkMetrics) {
      const timeDiff = Date.now() - (this.metricsHistory[this.metricsHistory.length - 1]?.timestamp || Date.now());
      if (timeDiff > 0) {
        bandwidth.inbound = ((bytesReceived - this.previousNetworkMetrics.bytesReceived) / timeDiff) * 1000;
        bandwidth.outbound = ((bytesSent - this.previousNetworkMetrics.bytesSent) / timeDiff) * 1000;
      }
    }

    const metrics: NetworkMetrics = {
      bytesReceived,
      bytesSent,
      packetsReceived,
      packetsSent,
      errorsIn,
      errorsOut,
      dropsIn,
      dropsOut,
      bandwidth
    };

    this.previousNetworkMetrics = metrics;
    return metrics;
  }

  private collectSystemMetrics(): SystemMetrics {
    return {
      uptime: os.uptime(),
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      processUptime: process.uptime(),
      processMemory: process.memoryUsage(),
      processCpuUsage: process.cpuUsage()
    };
  }

  private addToHistory(metrics: ResourceMetrics): void {
    this.metricsHistory.push(metrics);

    const retentionTime = this.config.historyRetentionHours * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionTime;

    this.metricsHistory = this.metricsHistory.filter(m => m.timestamp >= cutoffTime);

    if (this.config.enablePersistence) {
      this.persistMetrics(metrics);
    }
  }

  private checkAlerts(metrics: ResourceMetrics): void {
    if (!this.config.enableAlerts) return;

    const alerts: ResourceAlert[] = [];

    if (metrics.cpu.usage >= this.config.alertThresholds.cpu) {
      alerts.push({
        type: 'cpu',
        severity: metrics.cpu.usage >= 95 ? 'critical' : 'warning',
        threshold: this.config.alertThresholds.cpu,
        currentValue: metrics.cpu.usage,
        timestamp: metrics.timestamp,
        message: `CPU usage ${metrics.cpu.usage.toFixed(2)}% exceeds threshold ${this.config.alertThresholds.cpu}%`
      });
    }

    if (metrics.memory.usage >= this.config.alertThresholds.memory) {
      alerts.push({
        type: 'memory',
        severity: metrics.memory.usage >= 95 ? 'critical' : 'warning',
        threshold: this.config.alertThresholds.memory,
        currentValue: metrics.memory.usage,
        timestamp: metrics.timestamp,
        message: `Memory usage ${metrics.memory.usage.toFixed(2)}% exceeds threshold ${this.config.alertThresholds.memory}%`
      });
    }

    if (metrics.disk.usage >= this.config.alertThresholds.disk) {
      alerts.push({
        type: 'disk',
        severity: metrics.disk.usage >= 95 ? 'critical' : 'warning',
        threshold: this.config.alertThresholds.disk,
        currentValue: metrics.disk.usage,
        timestamp: metrics.timestamp,
        message: `Disk usage ${metrics.disk.usage.toFixed(2)}% exceeds threshold ${this.config.alertThresholds.disk}%`
      });
    }

    if (metrics.network.bandwidth.inbound >= this.config.alertThresholds.network ||
      metrics.network.bandwidth.outbound >= this.config.alertThresholds.network) {
      alerts.push({
        type: 'network',
        severity: 'warning',
        threshold: this.config.alertThresholds.network,
        currentValue: Math.max(metrics.network.bandwidth.inbound, metrics.network.bandwidth.outbound),
        timestamp: metrics.timestamp,
        message: `Network bandwidth usage exceeds threshold ${this.config.alertThresholds.network}%`
      });
    }

    alerts.forEach(alert => {
      this.emit('alert:triggered', alert);
    });
  }

  private async persistMetrics(metrics: ResourceMetrics): Promise<void> {
    try {
      const date = new Date(metrics.timestamp);
      const filename = `metrics-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.json`;
      const filepath = path.join(this.config.persistencePath, filename);

      await fs.mkdir(path.dirname(filepath), { recursive: true });

      const data = JSON.stringify(metrics, null, 2);
      await fs.appendFile(filepath, data + '\n');
    } catch (error) {
      console.error('[ResourceMonitor] Failed to persist metrics:', error);
    }
  }

  getMetricsHistory(limit?: number): ResourceMetrics[] {
    if (limit) {
      return this.metricsHistory.slice(-limit);
    }
    return [...this.metricsHistory];
  }

  getLatestMetrics(): ResourceMetrics | null {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }

  async getStatistics(hours: number = 1): Promise<ResourceStatistics> {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    const recentMetrics = this.metricsHistory.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length === 0) {
      return this.getEmptyStatistics();
    }

    const cpuValues = recentMetrics.map(m => m.cpu.usage);
    const memoryValues = recentMetrics.map(m => m.memory.usage);
    const diskValues = recentMetrics.map(m => m.disk.usage);
    const inboundValues = recentMetrics.map(m => m.network.bandwidth.inbound);
    const outboundValues = recentMetrics.map(m => m.network.bandwidth.outbound);

    return {
      period: {
        start: recentMetrics[0].timestamp,
        end: recentMetrics[recentMetrics.length - 1].timestamp
      },
      cpu: {
        avg: this.average(cpuValues),
        max: Math.max(...cpuValues),
        min: Math.min(...cpuValues)
      },
      memory: {
        avg: this.average(memoryValues),
        max: Math.max(...memoryValues),
        min: Math.min(...memoryValues)
      },
      disk: {
        avg: this.average(diskValues),
        max: Math.max(...diskValues),
        min: Math.min(...diskValues)
      },
      network: {
        avgInbound: this.average(inboundValues),
        maxInbound: Math.max(...inboundValues),
        avgOutbound: this.average(outboundValues),
        maxOutbound: Math.max(...outboundValues)
      }
    };
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private getEmptyStatistics(): ResourceStatistics {
    return {
      period: {
        start: Date.now(),
        end: Date.now()
      },
      cpu: { avg: 0, max: 0, min: 0 },
      memory: { avg: 0, max: 0, min: 0 },
      disk: { avg: 0, max: 0, min: 0 },
      network: { avgInbound: 0, maxInbound: 0, avgOutbound: 0, maxOutbound: 0 }
    };
  }

  updateAlertThresholds(thresholds: Partial<AlertThresholds>): void {
    this.config.alertThresholds = {
      ...this.config.alertThresholds,
      ...thresholds
    };
    this.emit('thresholds:updated', this.config.alertThresholds);
  }

  clearHistory(): void {
    this.metricsHistory = [];
    this.emit('history:cleared');
  }

  getStatus(): {
    isMonitoring: boolean;
    historySize: number;
    uptime: number;
    config: ResourceMonitorConfig;
  } {
    return {
      isMonitoring: this.isMonitoring,
      historySize: this.metricsHistory.length,
      uptime: Date.now() - this.startTime,
      config: this.config
    };
  }

  destroy(): void {
    this.stopMonitoring();
    this.clearHistory();
    this.removeAllListeners();
  }
}
