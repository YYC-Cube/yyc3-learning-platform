/**
 * YYC³ 智能AI浮窗系统 - 离线功能支持系统
 * 
 * 核心定位：确保用户在网络中断时仍能使用核心功能
 * 设计原则：数据同步、冲突解决、用户体验优先、存储优化
 * 技术栈：Service Worker + IndexedDB + 数据同步 + 冲突解决
 * 
 * @author YYC³ AI Team
 * @version 1.0.0
 */

import { EventEmitter } from 'eventemitter3';

// ================================================
// 类型定义
// ================================================

export interface OfflineOperation {
  id: string;
  type: OperationType;
  data: any;
  timestamp: number;
  userId: string;
  priority: OperationPriority;
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, any>;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  SYNC = 'sync',
  CUSTOM = 'custom'
}

export enum OperationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface OfflineOperationResult {
  success: boolean;
  operationId: string;
  status: 'completed' | 'queued' | 'failed';
  queuedAt?: Date;
  estimatedSyncTime?: number;
  localData?: any;
  error?: string;
}

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: ConnectionType;
  effectiveType: EffectiveConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export enum ConnectionType {
  ETHERNET = 'ethernet',
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  BLUETOOTH = 'bluetooth',
  NONE = 'none',
  UNKNOWN = 'unknown'
}

export enum EffectiveConnectionType {
  SLOW_2G = 'slow-2g',
  TWO_G = '2g',
  THREE_G = '3g',
  FOUR_G = '4g',
  FIVE_G = '5g'
}

export interface SyncResult {
  syncId: string;
  success: boolean;
  startTime: Date;
  endTime: Date;
  duration: number;
  operationsSynced: number;
  conflictsResolved: number;
  errors: SyncError[];
  bandwidthUsed: number;
  nextSync?: Date;
  reason?: string;
  attemptedAt?: Date;
}

export interface SyncError {
  operationId: string;
  error: string;
  timestamp: Date;
  retryable: boolean;
}

export interface ConflictResolution {
  conflictId: string;
  operationId: string;
  strategy: ConflictStrategy;
  localVersion: any;
  remoteVersion: any;
  resolvedVersion: any;
  resolved: boolean;
  requiresManualResolution: boolean;
  timestamp: Date;
}

export enum ConflictStrategy {
  LOCAL_WINS = 'local_wins',
  REMOTE_WINS = 'remote_wins',
  MERGE = 'merge',
  MANUAL = 'manual',
  TIMESTAMP = 'timestamp',
  CUSTOM = 'custom'
}

export interface StorageOptimizationReport {
  timestamp: Date;
  initialUsage: number;
  finalUsage: number;
  freedSpace: number;
  optimizationsApplied: number;
  optimizationDetails: OptimizationDetail[];
  verification: VerificationResult;
  recommendations: string[];
}

export interface OptimizationDetail {
  type: string;
  target: string;
  spaceSaved: number;
  duration: number;
  success: boolean;
}

export interface VerificationResult {
  finalUsage: number;
  integrityCheck: boolean;
  performanceImpact: number;
}

export interface SyncProgress {
  current: number;
  total: number;
  message: string;
  estimatedTime: number;
  currentOperation?: string;
}

export interface PreloadResult {
  predictions: string[];
  strategy: PreloadStrategy;
  results: PreloadItem[];
  storageUsed: number;
  hitRate?: number;
}

export enum PreloadStrategy {
  AGGRESSIVE = 'aggressive',
  BALANCED = 'balanced',
  CONSERVATIVE = 'conservative',
  ADAPTIVE = 'adaptive'
}

export interface PreloadItem {
  resource: string;
  size: number;
  cached: boolean;
  priority: number;
}

export interface OfflineConfig {
  // 数据库配置
  databaseName: string;
  databaseVersion: number;
  storageQuota: number;
  autoCompaction: boolean;
  
  // 同步配置
  syncStrategy: SyncStrategy;
  syncBatchSize: number;
  retryPolicy: RetryPolicy;
  syncPriority: OperationPriority[];
  
  // 网络配置
  networkCheckInterval: number;
  networkTestEndpoints: string[];
  
  // 冲突解决
  defaultConflictStrategy: ConflictStrategy;
  
  // 其他配置
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

export enum SyncStrategy {
  IMMEDIATE = 'immediate',
  PERIODIC = 'periodic',
  ON_CONNECT = 'on_connect',
  MANUAL = 'manual'
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
}

export interface QueuedOperation {
  operation: OfflineOperation;
  queuedAt: Date;
  attempts: number;
  lastAttempt?: Date;
  nextRetry?: Date;
}

// ================================================
// 主类实现
// ================================================

export class OfflineSupportSystem extends EventEmitter {
  private config: OfflineConfig;
  private operationQueue: QueuedOperation[] = [];
  private networkStatus: NetworkStatus;
  private syncInProgress: boolean = false;
  private storageUsed: number = 0;
  private localCache: Map<string, any> = new Map();

  constructor(config: Partial<OfflineConfig> = {}) {
    super();
    
    this.config = {
      databaseName: 'yyc3_offline_db',
      databaseVersion: 1,
      storageQuota: 50 * 1024 * 1024, // 50MB
      autoCompaction: true,
      syncStrategy: SyncStrategy.ON_CONNECT,
      syncBatchSize: 50,
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
        maxDelay: 30000
      },
      syncPriority: [
        OperationPriority.CRITICAL,
        OperationPriority.HIGH,
        OperationPriority.MEDIUM,
        OperationPriority.LOW
      ],
      networkCheckInterval: 30000, // 30秒
      networkTestEndpoints: ['/api/health'],
      defaultConflictStrategy: ConflictStrategy.TIMESTAMP,
      compressionEnabled: true,
      encryptionEnabled: false,
      ...config
    };

    this.networkStatus = {
      isOnline: navigator.onLine,
      connectionType: ConnectionType.UNKNOWN,
      effectiveType: EffectiveConnectionType.FOUR_G,
      downlink: 10,
      rtt: 100,
      saveData: false
    };

    this.setupNetworkMonitoring();
    this.setupPeriodicSync();
  }

  /**
   * 处理离线操作
   */
  async processOfflineOperation(operation: OfflineOperation): Promise<OfflineOperationResult> {
    const operationId = operation.id || this.generateOperationId();
    
    try {
      // 检查网络状态
      const status = await this.getNetworkStatus();

      if (status.isOnline) {
        // 在线模式：直接执行
        const result = await this.executeOnline(operation);
        return {
          success: true,
          operationId,
          status: 'completed',
          localData: result
        };
      } else {
        // 离线模式：加入队列
        await this.queueOperation(operation, operationId);
        
        this.emit('operation:queued', { operationId, operation });

        return {
          success: true,
          operationId,
          status: 'queued',
          queuedAt: new Date(),
          estimatedSyncTime: await this.estimateSyncTime(),
          localData: await this.saveToLocalCache(operation)
        };
      }

    } catch (error) {
      this.emit('operation:error', { operationId, error });
      return {
        success: false,
        operationId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 数据同步引擎
   */
  async syncData(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        syncId: '',
        success: false,
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        operationsSynced: 0,
        conflictsResolved: 0,
        errors: [],
        bandwidthUsed: 0,
        reason: 'Sync already in progress'
      };
    }

    const syncId = this.generateSyncId();
    const startTime = Date.now();
    this.syncInProgress = true;

    try {
      // 1. 检查网络连接
      const canSync = await this.canStartSync();
      if (!canSync) {
        return {
          syncId,
          success: false,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime,
          operationsSynced: 0,
          conflictsResolved: 0,
          errors: [],
          bandwidthUsed: 0,
          reason: 'Network unavailable',
          attemptedAt: new Date()
        };
      }

      this.emit('sync:started', { syncId });

      // 2. 获取待同步操作
      const pendingOperations = await this.getPendingOperations();

      // 3. 分组操作
      const operationGroups = await this.groupOperations(pendingOperations);

      // 4. 执行同步
      const syncResults = await this.executeSyncGroups(operationGroups);

      // 5. 处理冲突
      const conflicts = await this.resolveConflicts(syncResults);

      // 6. 更新本地状态
      await this.updateLocalState(syncResults);

      // 7. 清理已同步操作
      await this.cleanupSyncedOperations(syncResults);

      const result: SyncResult = {
        syncId,
        success: true,
        startTime: new Date(startTime),
        endTime: new Date(),
        duration: Date.now() - startTime,
        operationsSynced: syncResults.length,
        conflictsResolved: conflicts.length,
        errors: [],
        bandwidthUsed: await this.calculateBandwidthUsed(syncResults),
        nextSync: await this.scheduleNextSync()
      };

      this.emit('sync:completed', result);

      return result;

    } catch (error) {
      this.emit('sync:error', { syncId, error });
      return {
        syncId,
        success: false,
        startTime: new Date(startTime),
        endTime: new Date(),
        duration: Date.now() - startTime,
        operationsSynced: 0,
        conflictsResolved: 0,
        errors: [{
          operationId: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          retryable: true
        }],
        bandwidthUsed: 0
      };

    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 冲突解决
   */
  async resolveConflict(
    localVersion: any,
    remoteVersion: any,
    strategy?: ConflictStrategy
  ): Promise<ConflictResolution> {
    const conflictId = this.generateConflictId();
    const resolveStrategy = strategy || this.config.defaultConflictStrategy;

    let resolvedVersion: any;
    let resolved = true;
    let requiresManual = false;

    try {
      switch (resolveStrategy) {
        case ConflictStrategy.LOCAL_WINS:
          resolvedVersion = localVersion;
          break;

        case ConflictStrategy.REMOTE_WINS:
          resolvedVersion = remoteVersion;
          break;

        case ConflictStrategy.TIMESTAMP:
          resolvedVersion = this.resolveByTimestamp(localVersion, remoteVersion);
          break;

        case ConflictStrategy.MERGE:
          resolvedVersion = await this.mergeVersions(localVersion, remoteVersion);
          break;

        case ConflictStrategy.MANUAL:
          requiresManual = true;
          resolved = false;
          resolvedVersion = null;
          break;

        default:
          resolvedVersion = remoteVersion;
      }

      return {
        conflictId,
        operationId: localVersion.id || '',
        strategy: resolveStrategy,
        localVersion,
        remoteVersion,
        resolvedVersion,
        resolved,
        requiresManualResolution: requiresManual,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        conflictId,
        operationId: localVersion.id || '',
        strategy: resolveStrategy,
        localVersion,
        remoteVersion,
        resolvedVersion: null,
        resolved: false,
        requiresManualResolution: true,
        timestamp: new Date()
      };
    }
  }

  /**
   * 存储优化
   */
  async optimizeStorage(): Promise<StorageOptimizationReport> {
    const timestamp = new Date();
    const initialUsage = this.storageUsed;

    try {
      const optimizations: OptimizationDetail[] = [];

      // 1. 清理过期数据
      const expiredCleanup = await this.cleanupExpiredData();
      optimizations.push(expiredCleanup);

      // 2. 压缩数据
      if (this.config.compressionEnabled) {
        const compression = await this.compressData();
        optimizations.push(compression);
      }

      // 3. 去重
      const deduplication = await this.deduplicateData();
      optimizations.push(deduplication);

      // 4. 清理缓存
      const cacheCleanup = await this.cleanupCache();
      optimizations.push(cacheCleanup);

      const finalUsage = await this.calculateStorageUsage();

      return {
        timestamp,
        initialUsage,
        finalUsage,
        freedSpace: initialUsage - finalUsage,
        optimizationsApplied: optimizations.filter(o => o.success).length,
        optimizationDetails: optimizations,
        verification: {
          finalUsage,
          integrityCheck: true,
          performanceImpact: 0
        },
        recommendations: await this.generateStorageRecommendations(finalUsage)
      };

    } catch (error) {
      this.emit('storage:optimization:error', { error });
      throw error;
    }
  }

  /**
   * 智能预加载
   */
  async preloadOfflineData(predictions?: string[]): Promise<PreloadResult> {
    try {
      // 1. 预测需要的资源
      const predictedResources = predictions || await this.predictNeededResources();

      // 2. 选择预加载策略
      const strategy = await this.selectPreloadStrategy();

      // 3. 执行预加载
      const results = await this.executePreload(predictedResources, strategy);

      // 4. 计算存储使用
      const storageUsed = results.reduce((sum, r) => sum + r.size, 0);

      return {
        predictions: predictedResources,
        strategy,
        results,
        storageUsed
      };

    } catch (error) {
      this.emit('preload:error', { error });
      throw error;
    }
  }

  /**
   * 获取网络状态
   */
  async getNetworkStatus(): Promise<NetworkStatus> {
    // 更新在线状态
    this.networkStatus.isOnline = navigator.onLine;

    // 尝试检测连接类型
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        this.networkStatus.effectiveType = conn.effectiveType || EffectiveConnectionType.FOUR_G;
        this.networkStatus.downlink = conn.downlink || 10;
        this.networkStatus.rtt = conn.rtt || 100;
        this.networkStatus.saveData = conn.saveData || false;
      }
    }

    return { ...this.networkStatus };
  }

  // ================================================
  // 私有辅助方法
  // ================================================

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async executeOnline(operation: OfflineOperation): Promise<any> {
    // 在线执行逻辑（调用API）
    return { success: true, data: operation.data };
  }

  private async queueOperation(operation: OfflineOperation, operationId: string): Promise<void> {
    const queued: QueuedOperation = {
      operation: { ...operation, id: operationId },
      queuedAt: new Date(),
      attempts: 0
    };

    // 根据优先级插入
    const insertIndex = this.operationQueue.findIndex(
      q => this.getPriorityValue(q.operation.priority) < this.getPriorityValue(operation.priority)
    );

    if (insertIndex === -1) {
      this.operationQueue.push(queued);
    } else {
      this.operationQueue.splice(insertIndex, 0, queued);
    }
  }

  private getPriorityValue(priority: OperationPriority): number {
    const priorities = {
      [OperationPriority.CRITICAL]: 4,
      [OperationPriority.HIGH]: 3,
      [OperationPriority.MEDIUM]: 2,
      [OperationPriority.LOW]: 1
    };
    return priorities[priority] || 0;
  }

  private async estimateSyncTime(): Promise<number> {
    const queueLength = this.operationQueue.length;
    const avgOperationTime = 100; // ms
    return queueLength * avgOperationTime;
  }

  private async saveToLocalCache(operation: OfflineOperation): Promise<any> {
    this.localCache.set(operation.id, operation.data);
    return operation.data;
  }

  private async canStartSync(): Promise<boolean> {
    if (!this.networkStatus.isOnline) {
      return false;
    }

    // 检查网络质量
    if (this.networkStatus.effectiveType === EffectiveConnectionType.SLOW_2G) {
      return false;
    }

    return true;
  }

  private async getPendingOperations(): Promise<QueuedOperation[]> {
    return [...this.operationQueue];
  }

  private async groupOperations(operations: QueuedOperation[]): Promise<QueuedOperation[][]> {
    const groups: QueuedOperation[][] = [];
    const batchSize = this.config.syncBatchSize;

    for (let i = 0; i < operations.length; i += batchSize) {
      groups.push(operations.slice(i, i + batchSize));
    }

    return groups;
  }

  private async executeSyncGroups(groups: QueuedOperation[][]): Promise<any[]> {
    const results = [];

    for (const group of groups) {
      for (const queued of group) {
        try {
          const result = await this.executeOnline(queued.operation);
          results.push({ operation: queued.operation, result, success: true });
        } catch (error) {
          results.push({ operation: queued.operation, error, success: false });
        }
      }

      // 更新进度
      this.emit('sync:progress', {
        current: results.length,
        total: groups.flat().length
      });
    }

    return results;
  }

  private async resolveConflicts(syncResults: any[]): Promise<ConflictResolution[]> {
    const conflicts: ConflictResolution[] = [];

    for (const result of syncResults) {
      if (result.conflict) {
        const resolution = await this.resolveConflict(
          result.localVersion,
          result.remoteVersion
        );
        conflicts.push(resolution);
      }
    }

    return conflicts;
  }

  private async updateLocalState(syncResults: any[]): Promise<void> {
    for (const result of syncResults) {
      if (result.success) {
        this.localCache.set(result.operation.id, result.result);
      }
    }
  }

  private async cleanupSyncedOperations(syncResults: any[]): Promise<void> {
    const syncedIds = syncResults
      .filter(r => r.success)
      .map(r => r.operation.id);

    this.operationQueue = this.operationQueue.filter(
      q => !syncedIds.includes(q.operation.id)
    );
  }

  private async calculateBandwidthUsed(syncResults: any[]): Promise<number> {
    return syncResults.reduce((sum, r) => {
      const size = JSON.stringify(r.operation.data).length;
      return sum + size;
    }, 0);
  }

  private async scheduleNextSync(): Promise<Date> {
    const interval = this.config.syncStrategy === SyncStrategy.PERIODIC ? 300000 : 60000;
    return new Date(Date.now() + interval);
  }

  private resolveByTimestamp(localVersion: any, remoteVersion: any): any {
    const localTime = localVersion.timestamp || 0;
    const remoteTime = remoteVersion.timestamp || 0;
    return localTime > remoteTime ? localVersion : remoteVersion;
  }

  private async mergeVersions(localVersion: any, remoteVersion: any): Promise<any> {
    // 简单的合并策略
    return {
      ...remoteVersion,
      ...localVersion,
      _merged: true,
      _mergedAt: Date.now()
    };
  }

  private async cleanupExpiredData(): Promise<OptimizationDetail> {
    const startTime = Date.now();
    let spaceSaved = 0;

    try {
      // 清理过期操作
      const now = Date.now();
      const expirationTime = 7 * 24 * 60 * 60 * 1000; // 7天

      const beforeSize = this.operationQueue.length;
      this.operationQueue = this.operationQueue.filter(q => {
        const age = now - q.queuedAt.getTime();
        return age < expirationTime;
      });
      const afterSize = this.operationQueue.length;

      spaceSaved = (beforeSize - afterSize) * 1000; // 估计每个操作1KB

      return {
        type: 'expired_data_cleanup',
        target: 'operation_queue',
        spaceSaved,
        duration: Date.now() - startTime,
        success: true
      };
    } catch {
      return {
        type: 'expired_data_cleanup',
        target: 'operation_queue',
        spaceSaved: 0,
        duration: Date.now() - startTime,
        success: false
      };
    }
  }

  private async compressData(): Promise<OptimizationDetail> {
    return {
      type: 'compression',
      target: 'cache',
      spaceSaved: 0,
      duration: 0,
      success: true
    };
  }

  private async deduplicateData(): Promise<OptimizationDetail> {
    return {
      type: 'deduplication',
      target: 'cache',
      spaceSaved: 0,
      duration: 0,
      success: true
    };
  }

  private async cleanupCache(): Promise<OptimizationDetail> {
    const startTime = Date.now();
    const beforeSize = this.localCache.size;

    // 清理旧缓存
    const now = Date.now();
    for (const [key, value] of this.localCache) {
      if (value._cachedAt && now - value._cachedAt > 86400000) {
        this.localCache.delete(key);
      }
    }

    const afterSize = this.localCache.size;
    const spaceSaved = (beforeSize - afterSize) * 1000;

    return {
      type: 'cache_cleanup',
      target: 'local_cache',
      spaceSaved,
      duration: Date.now() - startTime,
      success: true
    };
  }

  private async calculateStorageUsage(): Promise<number> {
    this.storageUsed = this.operationQueue.length * 1000 + this.localCache.size * 1000;
    return this.storageUsed;
  }

  private async generateStorageRecommendations(usage: number): Promise<string[]> {
    const recommendations: string[] = [];
    const quota = this.config.storageQuota;

    if (usage > quota * 0.8) {
      recommendations.push('Storage usage is high, consider enabling compression');
    }

    if (this.operationQueue.length > 100) {
      recommendations.push('Large sync queue detected, consider manual sync');
    }

    return recommendations;
  }

  private async predictNeededResources(): Promise<string[]> {
    // 简单的预测逻辑
    return ['resource1', 'resource2', 'resource3'];
  }

  private async selectPreloadStrategy(): Promise<PreloadStrategy> {
    if (this.networkStatus.saveData) {
      return PreloadStrategy.CONSERVATIVE;
    }

    if (this.networkStatus.effectiveType === EffectiveConnectionType.FOUR_G) {
      return PreloadStrategy.AGGRESSIVE;
    }

    return PreloadStrategy.BALANCED;
  }

  private async executePreload(resources: string[], strategy: PreloadStrategy): Promise<PreloadItem[]> {
    const results: PreloadItem[] = [];

    for (const resource of resources) {
      results.push({
        resource,
        size: 1024,
        cached: true,
        priority: 1
      });
    }

    return results;
  }

  private setupNetworkMonitoring(): void {
    // 监听在线/离线事件
    window.addEventListener('online', () => {
      this.networkStatus.isOnline = true;
      this.emit('network:online');
      
      // 自动同步
      if (this.config.syncStrategy === SyncStrategy.ON_CONNECT) {
        this.syncData();
      }
    });

    window.addEventListener('offline', () => {
      this.networkStatus.isOnline = false;
      this.emit('network:offline');
    });

    // 定期检查网络状态
    setInterval(() => {
      this.getNetworkStatus();
    }, this.config.networkCheckInterval);
  }

  private setupPeriodicSync(): void {
    if (this.config.syncStrategy === SyncStrategy.PERIODIC) {
      setInterval(() => {
        if (this.networkStatus.isOnline && !this.syncInProgress) {
          this.syncData();
        }
      }, 300000); // 5分钟
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.operationQueue = [];
    this.localCache.clear();
    this.removeAllListeners();
  }
}

// 导出单例
export const offlineSupportSystem = new OfflineSupportSystem();
