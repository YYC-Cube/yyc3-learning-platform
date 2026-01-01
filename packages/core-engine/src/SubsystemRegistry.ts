/**
 * 子系统注册表 - 插件化架构管理
 */

import { EventEmitter } from 'events';

// ==================== 类型定义 ====================

export enum SubsystemStatus {
  UNREGISTERED = 'unregistered',
  REGISTERED = 'registered',
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
  DISABLED = 'disabled'
}

export enum SubsystemCategory {
  CORE = 'core',
  EXTENSION = 'extension',
  INTEGRATION = 'integration',
  TOOL = 'tool',
  MIDDLEWARE = 'middleware'
}

export interface Subsystem {
  id: string;
  name: string;
  version: string;
  category: SubsystemCategory;
  description: string;
  dependencies: string[];
  capabilities: string[];
  config: SubsystemConfig;
  lifecycle: SubsystemLifecycle;
  metadata: SubsystemMetadata;
}

export interface SubsystemConfig {
  enabled: boolean;
  autoStart: boolean;
  priority: number;
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  resources: {
    maxMemoryMb?: number;
    maxCpu?: number;
  };
}

export interface SubsystemLifecycle {
  initialize?: () => Promise<void>;
  start?: () => Promise<void>;
  stop?: () => Promise<void>;
  pause?: () => Promise<void>;
  resume?: () => Promise<void>;
  destroy?: () => Promise<void>;
  healthCheck?: () => Promise<HealthCheckResult>;
}

export interface HealthCheckResult {
  healthy: boolean;
  message?: string;
  details?: Record<string, any>;
}

export interface SubsystemMetadata {
  author: string;
  license: string;
  repository?: string;
  documentation?: string;
  tags: string[];
  installDate: number;
  lastUpdate: number;
}

export interface RegisteredSubsystem {
  subsystem: Subsystem;
  status: SubsystemStatus;
  instance: any;
  startTime?: number;
  errorCount: number;
  lastError?: Error;
  healthStatus?: HealthCheckResult;
}

export interface RegistryConfig {
  enableHealthCheck: boolean;
  healthCheckIntervalMs: number;
  enableDependencyCheck: boolean;
  enableAutoRecovery: boolean;
  maxErrorsBeforeDisable: number;
}

export interface RegistryMetrics {
  totalSubsystems: number;
  activeSubsystems: number;
  errorSubsystems: number;
  disabledSubsystems: number;
  averageStartTime: number;
}

// ==================== 子系统注册表实现 ====================

export class SubsystemRegistry extends EventEmitter {
  private config: RegistryConfig;
  private subsystems: Map<string, RegisteredSubsystem> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();
  private metrics: RegistryMetrics;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: Partial<RegistryConfig> = {}) {
    super();

    this.config = {
      enableHealthCheck: true,
      healthCheckIntervalMs: 30000,
      enableDependencyCheck: true,
      enableAutoRecovery: true,
      maxErrorsBeforeDisable: 3,
      ...config
    };

    this.metrics = {
      totalSubsystems: 0,
      activeSubsystems: 0,
      errorSubsystems: 0,
      disabledSubsystems: 0,
      averageStartTime: 0
    };

    if (this.config.enableHealthCheck) {
      this.startHealthCheck();
    }
  }

  /**
   * 注册子系统
   */
  async register(
    subsystem: Subsystem,
    instance: any
  ): Promise<void> {
    // 验证依赖
    if (this.config.enableDependencyCheck) {
      await this.validateDependencies(subsystem);
    }

    // 检查重复注册
    if (this.subsystems.has(subsystem.id)) {
      throw new Error(`Subsystem already registered: ${subsystem.id}`);
    }

    const registered: RegisteredSubsystem = {
      subsystem,
      status: SubsystemStatus.REGISTERED,
      instance,
      errorCount: 0
    };

    this.subsystems.set(subsystem.id, registered);
    this.updateDependencyGraph(subsystem);

    this.metrics.totalSubsystems++;

    this.emit('subsystem:registered', registered);

    // 自动启动
    if (subsystem.config.autoStart) {
      await this.start(subsystem.id);
    }
  }

  /**
   * 注销子系统
   */
  async unregister(subsystemId: string): Promise<void> {
    const registered = this.subsystems.get(subsystemId);
    
    if (!registered) {
      throw new Error(`Subsystem not found: ${subsystemId}`);
    }

    // 停止子系统
    if (registered.status === SubsystemStatus.ACTIVE) {
      await this.stop(subsystemId);
    }

    // 销毁子系统
    if (registered.subsystem.lifecycle.destroy) {
      await registered.subsystem.lifecycle.destroy();
    }

    this.subsystems.delete(subsystemId);
    this.dependencyGraph.delete(subsystemId);

    this.metrics.totalSubsystems--;

    this.emit('subsystem:unregistered', registered);
  }

  /**
   * 启动子系统
   */
  async start(subsystemId: string): Promise<void> {
    const registered = this.subsystems.get(subsystemId);
    
    if (!registered) {
      throw new Error(`Subsystem not found: ${subsystemId}`);
    }

    if (registered.status === SubsystemStatus.ACTIVE) {
      return;
    }

    try {
      registered.status = SubsystemStatus.INITIALIZING;
      this.emit('subsystem:starting', registered);

      const startTime = Date.now();

      // 启动依赖
      await this.startDependencies(registered.subsystem);

      // 初始化
      if (registered.subsystem.lifecycle.initialize) {
        await this.executeWithTimeout(
          registered.subsystem.lifecycle.initialize(),
          registered.subsystem.config.timeout
        );
      }

      // 启动
      if (registered.subsystem.lifecycle.start) {
        await this.executeWithTimeout(
          registered.subsystem.lifecycle.start(),
          registered.subsystem.config.timeout
        );
      }

      registered.status = SubsystemStatus.ACTIVE;
      registered.startTime = Date.now();
      registered.errorCount = 0;

      this.metrics.activeSubsystems++;
      
      const duration = Date.now() - startTime;
      this.updateAverageStartTime(duration);

      this.emit('subsystem:started', registered);

    } catch (error: any) {
      registered.status = SubsystemStatus.ERROR;
      registered.errorCount++;
      registered.lastError = error;

      this.metrics.errorSubsystems++;

      this.emit('subsystem:error', {
        registered,
        error
      });

      // 自动禁用
      if (registered.errorCount >= this.config.maxErrorsBeforeDisable) {
        await this.disable(subsystemId);
      }

      throw error;
    }
  }

  /**
   * 停止子系统
   */
  async stop(subsystemId: string): Promise<void> {
    const registered = this.subsystems.get(subsystemId);
    
    if (!registered) {
      throw new Error(`Subsystem not found: ${subsystemId}`);
    }

    if (registered.status !== SubsystemStatus.ACTIVE) {
      return;
    }

    try {
      // 停止依赖此子系统的其他子系统
      await this.stopDependents(subsystemId);

      // 停止子系统
      if (registered.subsystem.lifecycle.stop) {
        await this.executeWithTimeout(
          registered.subsystem.lifecycle.stop(),
          registered.subsystem.config.timeout
        );
      }

      registered.status = SubsystemStatus.REGISTERED;
      this.metrics.activeSubsystems--;

      this.emit('subsystem:stopped', registered);

    } catch (error: any) {
      registered.lastError = error;
      this.emit('subsystem:error', {
        registered,
        error
      });
      throw error;
    }
  }

  /**
   * 暂停子系统
   */
  async pause(subsystemId: string): Promise<void> {
    const registered = this.subsystems.get(subsystemId);
    
    if (!registered) {
      throw new Error(`Subsystem not found: ${subsystemId}`);
    }

    if (registered.subsystem.lifecycle.pause) {
      await registered.subsystem.lifecycle.pause();
      registered.status = SubsystemStatus.PAUSED;
      this.emit('subsystem:paused', registered);
    }
  }

  /**
   * 恢复子系统
   */
  async resume(subsystemId: string): Promise<void> {
    const registered = this.subsystems.get(subsystemId);
    
    if (!registered) {
      throw new Error(`Subsystem not found: ${subsystemId}`);
    }

    if (registered.subsystem.lifecycle.resume) {
      await registered.subsystem.lifecycle.resume();
      registered.status = SubsystemStatus.ACTIVE;
      this.emit('subsystem:resumed', registered);
    }
  }

  /**
   * 禁用子系统
   */
  async disable(subsystemId: string): Promise<void> {
    const registered = this.subsystems.get(subsystemId);
    
    if (!registered) {
      throw new Error(`Subsystem not found: ${subsystemId}`);
    }

    if (registered.status === SubsystemStatus.ACTIVE) {
      await this.stop(subsystemId);
    }

    registered.status = SubsystemStatus.DISABLED;
    this.metrics.disabledSubsystems++;

    this.emit('subsystem:disabled', registered);
  }

  /**
   * 启用子系统
   */
  async enable(subsystemId: string): Promise<void> {
    const registered = this.subsystems.get(subsystemId);
    
    if (!registered) {
      throw new Error(`Subsystem not found: ${subsystemId}`);
    }

    if (registered.status === SubsystemStatus.DISABLED) {
      registered.status = SubsystemStatus.REGISTERED;
      this.metrics.disabledSubsystems--;
      this.emit('subsystem:enabled', registered);

      if (registered.subsystem.config.autoStart) {
        await this.start(subsystemId);
      }
    }
  }

  /**
   * 获取子系统
   */
  get(subsystemId: string): RegisteredSubsystem | null {
    return this.subsystems.get(subsystemId) || null;
  }

  /**
   * 获取子系统实例
   */
  getInstance<T = any>(subsystemId: string): T | null {
    const registered = this.subsystems.get(subsystemId);
    return registered ? registered.instance : null;
  }

  /**
   * 获取所有子系统
   */
  getAll(filter?: {
    status?: SubsystemStatus;
    category?: SubsystemCategory;
  }): RegisteredSubsystem[] {
    let subsystems = Array.from(this.subsystems.values());

    if (filter?.status) {
      subsystems = subsystems.filter(s => s.status === filter.status);
    }

    if (filter?.category) {
      subsystems = subsystems.filter(
        s => s.subsystem.category === filter.category
      );
    }

    return subsystems;
  }

  /**
   * 验证依赖
   */
  private async validateDependencies(subsystem: Subsystem): Promise<void> {
    for (const depId of subsystem.dependencies) {
      if (!this.subsystems.has(depId)) {
        throw new Error(
          `Dependency not found: ${depId} required by ${subsystem.id}`
        );
      }
    }
  }

  /**
   * 启动依赖
   */
  private async startDependencies(subsystem: Subsystem): Promise<void> {
    for (const depId of subsystem.dependencies) {
      const dep = this.subsystems.get(depId);
      
      if (dep && dep.status !== SubsystemStatus.ACTIVE) {
        await this.start(depId);
      }
    }
  }

  /**
   * 停止依赖此子系统的其他子系统
   */
  private async stopDependents(subsystemId: string): Promise<void> {
    const dependents = this.findDependents(subsystemId);
    
    for (const depId of dependents) {
      await this.stop(depId);
    }
  }

  /**
   * 查找依赖此子系统的其他子系统
   */
  private findDependents(subsystemId: string): string[] {
    const dependents: string[] = [];

    for (const [id, registered] of this.subsystems.entries()) {
      if (registered.subsystem.dependencies.includes(subsystemId)) {
        dependents.push(id);
      }
    }

    return dependents;
  }

  /**
   * 更新依赖图
   */
  private updateDependencyGraph(subsystem: Subsystem): void {
    this.dependencyGraph.set(
      subsystem.id,
      new Set(subsystem.dependencies)
    );
  }

  /**
   * 执行健康检查
   */
  private async performHealthCheck(): Promise<void> {
    for (const [id, registered] of this.subsystems.entries()) {
      if (
        registered.status === SubsystemStatus.ACTIVE &&
        registered.subsystem.lifecycle.healthCheck
      ) {
        try {
          const result = await registered.subsystem.lifecycle.healthCheck();
          registered.healthStatus = result;

          if (!result.healthy) {
            this.emit('subsystem:unhealthy', {
              registered,
              result
            });

            // 自动恢复
            if (this.config.enableAutoRecovery) {
              await this.recoverSubsystem(id);
            }
          }
        } catch (error: any) {
          registered.lastError = error;
          this.emit('subsystem:healthcheck-failed', {
            registered,
            error
          });
        }
      }
    }
  }

  /**
   * 恢复子系统
   */
  private async recoverSubsystem(subsystemId: string): Promise<void> {
    try {
      await this.stop(subsystemId);
      await this.start(subsystemId);
      
      this.emit('subsystem:recovered', subsystemId);
    } catch (error: any) {
      this.emit('subsystem:recovery-failed', {
        subsystemId,
        error
      });
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckIntervalMs);
  }

  /**
   * 停止健康检查
   */
  stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * 带超时执行
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  }

  /**
   * 更新平均启动时间
   */
  private updateAverageStartTime(startTime: number): void {
    const total = this.metrics.activeSubsystems;
    this.metrics.averageStartTime = 
      (this.metrics.averageStartTime * (total - 1) + startTime) / total;
  }

  /**
   * 获取指标
   */
  getMetrics(): RegistryMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取依赖图
   */
  getDependencyGraph(): Map<string, Set<string>> {
    return new Map(this.dependencyGraph);
  }

  /**
   * 销毁
   */
  async destroy(): Promise<void> {
    this.stopHealthCheck();

    // 停止所有子系统
    for (const id of this.subsystems.keys()) {
      await this.unregister(id);
    }

    this.removeAllListeners();
  }
}

// ==================== 单例导出 ====================

export const subsystemRegistry = new SubsystemRegistry();
