/**
 * 状态管理器 - 智能状态持久化与快照管理
 */

import { EventEmitter } from 'events';

// ==================== 类型定义 ====================

export interface StateSnapshot<T = any> {
  id: string;
  timestamp: number;
  version: string;
  state: T;
  metadata: SnapshotMetadata;
  checksum: string;
}

export interface SnapshotMetadata {
  createdBy: string;
  reason: string;
  tags: string[];
  persistent: boolean;
}

export interface StateManagerConfig {
  enableAutoSave: boolean;
  autoSaveIntervalMs: number;
  maxSnapshots: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  persistenceAdapter?: PersistenceAdapter;
}

export interface PersistenceAdapter {
  save(snapshot: StateSnapshot): Promise<void>;
  load(snapshotId: string): Promise<StateSnapshot | null>;
  list(): Promise<StateSnapshot[]>;
  delete(snapshotId: string): Promise<void>;
}

export interface StateHistory<T = any> {
  snapshots: StateSnapshot<T>[];
  currentIndex: number;
}

export interface StateDiff {
  path: string;
  oldValue: any;
  newValue: any;
  operation: 'add' | 'update' | 'delete';
}

// ==================== 状态管理器实现 ====================

export class StateManager<T = any> extends EventEmitter {
  private config: StateManagerConfig;
  private currentState: T;
  private history: StateHistory<T>;
  private autoSaveTimer?: NodeJS.Timeout;
  private isDirty: boolean = false;
  private version: string = '1.0.0';

  constructor(
    initialState: T,
    config: Partial<StateManagerConfig> = {}
  ) {
    super();

    this.config = {
      enableAutoSave: true,
      autoSaveIntervalMs: 5000,
      maxSnapshots: 50,
      enableCompression: false,
      enableEncryption: false,
      ...config
    };

    this.currentState = initialState;
    this.history = {
      snapshots: [],
      currentIndex: -1
    };

    // 创建初始快照
    this.createSnapshot('initialization');

    // 启动自动保存
    if (this.config.enableAutoSave) {
      this.startAutoSave();
    }
  }

  /**
   * 获取当前状态
   */
  getState(): T {
    return this.deepClone(this.currentState);
  }

  /**
   * 更新状态
   */
  setState(
    updater: Partial<T> | ((prevState: T) => T),
    options: {
      createSnapshot?: boolean;
      reason?: string;
      tags?: string[];
    } = {}
  ): void {
    const prevState = this.deepClone(this.currentState);

    // 应用更新
    if (typeof updater === 'function') {
      this.currentState = updater(this.deepClone(this.currentState));
    } else {
      this.currentState = {
        ...this.currentState,
        ...updater
      };
    }

    this.isDirty = true;

    // 计算差异
    const diff = this.calculateDiff(prevState, this.currentState);

    this.emit('state:changed', {
      prevState,
      currentState: this.currentState,
      diff
    });

    // 创建快照
    if (options.createSnapshot) {
      this.createSnapshot(
        options.reason || 'manual_update',
        options.tags
      );
    }
  }

  /**
   * 批量更新状态
   */
  batchUpdate(
    updates: Array<Partial<T> | ((prevState: T) => T)>,
    reason: string = 'batch_update'
  ): void {
    updates.forEach(update => {
      this.setState(update, { createSnapshot: false });
    });

    this.createSnapshot(reason, ['batch']);
  }

  /**
   * 创建快照
   */
  createSnapshot(
    reason: string = 'manual',
    tags: string[] = [],
    persistent: boolean = false
  ): string {
    const snapshot: StateSnapshot<T> = {
      id: this.generateSnapshotId(),
      timestamp: Date.now(),
      version: this.version,
      state: this.deepClone(this.currentState),
      metadata: {
        createdBy: 'system',
        reason,
        tags,
        persistent
      },
      checksum: this.calculateChecksum(this.currentState)
    };

    // 添加到历史
    this.history.snapshots.push(snapshot);
    this.history.currentIndex = this.history.snapshots.length - 1;

    // 限制快照数量
    if (this.history.snapshots.length > this.config.maxSnapshots) {
      // 保留持久化快照
      const persistentSnapshots = this.history.snapshots.filter(
        s => s.metadata.persistent
      );
      const nonPersistentSnapshots = this.history.snapshots.filter(
        s => !s.metadata.persistent
      );

      // 删除最旧的非持久化快照
      if (nonPersistentSnapshots.length > 0) {
        const toRemove = nonPersistentSnapshots[0];
        const index = this.history.snapshots.indexOf(toRemove);
        this.history.snapshots.splice(index, 1);
        this.history.currentIndex--;
      }
    }

    this.isDirty = false;

    this.emit('snapshot:created', snapshot);

    // 持久化快照
    if (this.config.persistenceAdapter && persistent) {
      this.config.persistenceAdapter.save(snapshot).catch(err => {
        this.emit('error', { 
          type: 'persistence_failed', 
          snapshot, 
          error: err 
        });
      });
    }

    return snapshot.id;
  }

  /**
   * 恢复快照
   */
  restoreSnapshot(snapshotId: string): boolean {
    const snapshot = this.history.snapshots.find(s => s.id === snapshotId);
    
    if (!snapshot) {
      this.emit('error', {
        type: 'snapshot_not_found',
        snapshotId
      });
      return false;
    }

    const prevState = this.currentState;
    this.currentState = this.deepClone(snapshot.state);
    this.isDirty = true;

    this.emit('state:restored', {
      snapshotId,
      prevState,
      currentState: this.currentState
    });

    return true;
  }

  /**
   * 撤销
   */
  undo(): boolean {
    if (this.history.currentIndex <= 0) {
      return false;
    }

    this.history.currentIndex--;
    const snapshot = this.history.snapshots[this.history.currentIndex];
    
    this.currentState = this.deepClone(snapshot.state);
    this.isDirty = true;

    this.emit('state:undo', {
      snapshotId: snapshot.id,
      currentState: this.currentState
    });

    return true;
  }

  /**
   * 重做
   */
  redo(): boolean {
    if (this.history.currentIndex >= this.history.snapshots.length - 1) {
      return false;
    }

    this.history.currentIndex++;
    const snapshot = this.history.snapshots[this.history.currentIndex];
    
    this.currentState = this.deepClone(snapshot.state);
    this.isDirty = true;

    this.emit('state:redo', {
      snapshotId: snapshot.id,
      currentState: this.currentState
    });

    return true;
  }

  /**
   * 获取历史记录
   */
  getHistory(): StateHistory<T> {
    return {
      snapshots: this.history.snapshots.map(s => ({ ...s })),
      currentIndex: this.history.currentIndex
    };
  }

  /**
   * 获取快照列表
   */
  getSnapshots(): StateSnapshot<T>[] {
    return this.history.snapshots.map(s => ({ ...s }));
  }

  /**
   * 获取快照
   */
  getSnapshot(snapshotId: string): StateSnapshot<T> | null {
    return this.history.snapshots.find(s => s.id === snapshotId) || null;
  }

  /**
   * 删除快照
   */
  deleteSnapshot(snapshotId: string): boolean {
    const index = this.history.snapshots.findIndex(s => s.id === snapshotId);
    
    if (index === -1) {
      return false;
    }

    // 不允许删除当前快照
    if (index === this.history.currentIndex) {
      return false;
    }

    const snapshot = this.history.snapshots[index];

    this.history.snapshots.splice(index, 1);
    
    if (index < this.history.currentIndex) {
      this.history.currentIndex--;
    }

    this.emit('snapshot:deleted', snapshot);

    return true;
  }

  /**
   * 清空历史
   */
  clearHistory(): void {
    const currentSnapshot = this.history.snapshots[this.history.currentIndex];
    
    this.history.snapshots = currentSnapshot ? [currentSnapshot] : [];
    this.history.currentIndex = 0;

    this.emit('history:cleared');
  }

  /**
   * 保存状态
   */
  async save(): Promise<void> {
    if (!this.config.persistenceAdapter) {
      throw new Error('No persistence adapter configured');
    }

    if (!this.isDirty) {
      return;
    }

    const snapshotId = this.createSnapshot('manual_save', [], true);
    const snapshot = this.getSnapshot(snapshotId)!;

    await this.config.persistenceAdapter.save(snapshot);

    this.isDirty = false;
    this.emit('state:saved', { snapshotId });
  }

  /**
   * 加载状态
   */
  async load(snapshotId: string): Promise<void> {
    if (!this.config.persistenceAdapter) {
      throw new Error('No persistence adapter configured');
    }

    const snapshot = await this.config.persistenceAdapter.load(snapshotId);

    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    // 验证校验和
    const checksum = this.calculateChecksum(snapshot.state);
    if (checksum !== snapshot.checksum) {
      throw new Error('Snapshot checksum mismatch');
    }

    this.currentState = this.deepClone(snapshot.state);
    this.history.snapshots = [snapshot];
    this.history.currentIndex = 0;
    this.isDirty = false;

    this.emit('state:loaded', { snapshot });
  }

  /**
   * 启动自动保存
   */
  private startAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      if (this.isDirty) {
        this.createSnapshot('auto_save', ['auto']);
      }
    }, this.config.autoSaveIntervalMs);
  }

  /**
   * 停止自动保存
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }

  /**
   * 计算状态差异
   */
  private calculateDiff(oldState: T, newState: T): StateDiff[] {
    const diffs: StateDiff[] = [];

    const compare = (
      oldObj: any,
      newObj: any,
      path: string = ''
    ): void => {
      // 处理对象
      if (this.isObject(oldObj) && this.isObject(newObj)) {
        const allKeys = new Set([
          ...Object.keys(oldObj),
          ...Object.keys(newObj)
        ]);

        allKeys.forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          
          if (!(key in oldObj)) {
            diffs.push({
              path: newPath,
              oldValue: undefined,
              newValue: newObj[key],
              operation: 'add'
            });
          } else if (!(key in newObj)) {
            diffs.push({
              path: newPath,
              oldValue: oldObj[key],
              newValue: undefined,
              operation: 'delete'
            });
          } else if (oldObj[key] !== newObj[key]) {
            if (this.isObject(oldObj[key]) && this.isObject(newObj[key])) {
              compare(oldObj[key], newObj[key], newPath);
            } else {
              diffs.push({
                path: newPath,
                oldValue: oldObj[key],
                newValue: newObj[key],
                operation: 'update'
              });
            }
          }
        });
      } else if (oldObj !== newObj) {
        diffs.push({
          path,
          oldValue: oldObj,
          newValue: newObj,
          operation: 'update'
        });
      }
    };

    compare(oldState, newState);
    return diffs;
  }

  /**
   * 深度克隆
   */
  private deepClone<U>(obj: U): U {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any;
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as any;
    }

    if (obj instanceof Object) {
      const cloned: any = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone((obj as any)[key]);
      });
      return cloned;
    }

    return obj;
  }

  /**
   * 判断是否为对象
   */
  private isObject(obj: any): boolean {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  }

  /**
   * 计算校验和
   */
  private calculateChecksum(state: T): string {
    const str = JSON.stringify(state);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * 生成快照ID
   */
  private generateSnapshotId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalSnapshots: number;
    currentIndex: number;
    isDirty: boolean;
    canUndo: boolean;
    canRedo: boolean;
  } {
    return {
      totalSnapshots: this.history.snapshots.length,
      currentIndex: this.history.currentIndex,
      isDirty: this.isDirty,
      canUndo: this.history.currentIndex > 0,
      canRedo: this.history.currentIndex < this.history.snapshots.length - 1
    };
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopAutoSave();
    this.removeAllListeners();
    this.history.snapshots = [];
  }
}

// ==================== 内存持久化适配器 ====================

export class MemoryPersistenceAdapter implements PersistenceAdapter {
  private storage: Map<string, StateSnapshot> = new Map();

  async save(snapshot: StateSnapshot): Promise<void> {
    this.storage.set(snapshot.id, snapshot);
  }

  async load(snapshotId: string): Promise<StateSnapshot | null> {
    return this.storage.get(snapshotId) || null;
  }

  async list(): Promise<StateSnapshot[]> {
    return Array.from(this.storage.values());
  }

  async delete(snapshotId: string): Promise<void> {
    this.storage.delete(snapshotId);
  }
}

// ==================== LocalStorage持久化适配器 ====================

export class LocalStoragePersistenceAdapter implements PersistenceAdapter {
  private prefix: string;

  constructor(prefix: string = 'state_snapshot_') {
    this.prefix = prefix;
  }

  async save(snapshot: StateSnapshot): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('localStorage not available');
    }

    const key = `${this.prefix}${snapshot.id}`;
    localStorage.setItem(key, JSON.stringify(snapshot));
  }

  async load(snapshotId: string): Promise<StateSnapshot | null> {
    if (typeof window === 'undefined') {
      throw new Error('localStorage not available');
    }

    const key = `${this.prefix}${snapshotId}`;
    const data = localStorage.getItem(key);
    
    return data ? JSON.parse(data) : null;
  }

  async list(): Promise<StateSnapshot[]> {
    if (typeof window === 'undefined') {
      throw new Error('localStorage not available');
    }

    const snapshots: StateSnapshot[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const data = localStorage.getItem(key);
        if (data) {
          snapshots.push(JSON.parse(data));
        }
      }
    }
    
    return snapshots;
  }

  async delete(snapshotId: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('localStorage not available');
    }

    const key = `${this.prefix}${snapshotId}`;
    localStorage.removeItem(key);
  }
}
