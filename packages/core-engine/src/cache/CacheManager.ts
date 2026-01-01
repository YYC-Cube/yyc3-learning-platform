/**
 * @fileoverview 缓存管理组件 - 提供多级缓存策略和缓存管理功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { EventEmitter } from 'eventemitter3';
import { createLogger } from '../../../../lib/logger';

const logger = createLogger('CacheManager');

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccess: number;
  metadata?: Record<string, any>;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enablePersistence: boolean;
  persistencePath?: string;
  enableCompression: boolean;
  enableStatistics: boolean;
  enableDistributedCache: boolean;
  distributedCacheConfig?: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  hitRate: number;
  totalSets: number;
  totalDeletes: number;
  totalEvictions: number;
  currentSize: number;
  memoryUsage: number;
  avgAccessTime: number;
}

export interface CacheResult<T> {
  success: boolean;
  value?: T;
  fromCache: boolean;
  error?: string;
}

export type EvictionPolicy = 'LRU' | 'LFU' | 'FIFO' | 'TTL';

export interface CacheManagerConfig extends Partial<CacheConfig> {
  evictionPolicy?: EvictionPolicy;
}

export class CacheManager<T = any> extends EventEmitter {
  private cache: Map<string, CacheEntry<T>>;
  private config: Required<CacheConfig>;
  private evictionPolicy: EvictionPolicy;
  private cleanupInterval?: NodeJS.Timeout;
  private statistics: CacheStatistics;
  private accessTimes: Map<string, number[]>;

  constructor(config: CacheManagerConfig = {}) {
    super();

    this.cache = new Map();
    this.evictionPolicy = config.evictionPolicy || 'LRU';
    this.accessTimes = new Map();

    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 3600000,
      cleanupInterval: config.cleanupInterval || 60000,
      enablePersistence: config.enablePersistence || false,
      persistencePath: config.persistencePath || './cache',
      enableCompression: config.enableCompression || false,
      enableStatistics: config.enableStatistics !== false,
      enableDistributedCache: config.enableDistributedCache || false,
      distributedCacheConfig: config.distributedCacheConfig || {
        host: 'localhost',
        port: 6379,
        db: 0
      }
    };

    this.statistics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSets: 0,
      totalDeletes: 0,
      totalEvictions: 0,
      currentSize: 0,
      memoryUsage: 0,
      avgAccessTime: 0
    };

    this.startCleanup();
    this.loadFromPersistence();
  }

  async get(key: string): Promise<CacheResult<T>> {
    const startTime = Date.now();

    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.statistics.misses++;
        this.updateHitRate();
        this.updateAccessTime(startTime);
        return {
          success: false,
          fromCache: false,
          error: 'Key not found'
        };
      }

      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.statistics.misses++;
        this.updateHitRate();
        this.updateAccessTime(startTime);
        return {
          success: false,
          fromCache: false,
          error: 'Entry expired'
        };
      }

      entry.hits++;
      entry.lastAccess = Date.now();
      this.statistics.hits++;
      this.updateHitRate();
      this.updateAccessTime(startTime);

      this.emit('cache:hit', { key, entry });

      return {
        success: true,
        value: entry.value,
        fromCache: true
      };
    } catch (error) {
      this.updateAccessTime(startTime);
      return {
        success: false,
        fromCache: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async set(key: string, value: T, ttl?: number): Promise<CacheResult<T>> {
    try {
      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        hits: 0,
        lastAccess: Date.now()
      };

      if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
        this.evict();
      }

      this.cache.set(key, entry);
      this.statistics.totalSets++;
      this.updateStatistics();

      this.emit('cache:set', { key, entry });

      if (this.config.enablePersistence) {
        await this.saveToPersistence();
      }

      return {
        success: true,
        value,
        fromCache: false
      };
    } catch (error) {
      return {
        success: false,
        fromCache: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);

    if (deleted) {
      this.statistics.totalDeletes++;
      this.updateStatistics();
      this.emit('cache:delete', { key });

      if (this.config.enablePersistence) {
        await this.saveToPersistence();
      }
    }

    return deleted;
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.statistics.totalEvictions += size;
    this.updateStatistics();
    this.emit('cache:clear', { size });

    if (this.config.enablePersistence) {
      await this.saveToPersistence();
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    return !this.isExpired(entry);
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }

  getStatistics(): CacheStatistics {
    return { ...this.statistics };
  }

  async warmUp(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttl);
    }

    this.emit('cache:warmup', { count: entries.length });
  }

  async invalidate(pattern: string): Promise<number> {
    const regex = new RegExp(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        await this.delete(key);
        count++;
      }
    }

    this.emit('cache:invalidate', { pattern, count });
    return count;
  }

  async getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<CacheResult<T>> {
    const cached = await this.get(key);

    if (cached.success) {
      return cached;
    }

    const value = await factory();
    return await this.set(key, value, ttl);
  }

  private evict(): void {
    if (this.cache.size === 0) {
      return;
    }

    let keyToEvict: string | undefined;

    switch (this.evictionPolicy) {
      case 'LRU':
        keyToEvict = this.findLRU();
        break;
      case 'LFU':
        keyToEvict = this.findLFU();
        break;
      case 'FIFO':
        keyToEvict = this.findFIFO();
        break;
      case 'TTL':
        keyToEvict = this.findExpiring();
        break;
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
      this.statistics.totalEvictions++;
      this.updateStatistics();
      this.emit('cache:evict', { key: keyToEvict, policy: this.evictionPolicy });
    }
  }

  private findLRU(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findLFU(): string | undefined {
    let leastUsedKey: string | undefined;
    let leastHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  private findFIFO(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findExpiring(): string | undefined {
    let expiringKey: string | undefined;
    let shortestTTL = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      const remainingTTL = entry.ttl - (Date.now() - entry.timestamp);
      if (remainingTTL < shortestTTL) {
        shortestTTL = remainingTTL;
        expiringKey = key;
      }
    }

    return expiringKey;
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    let evictedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        evictedCount++;
      }
    }

    if (evictedCount > 0) {
      this.statistics.totalEvictions += evictedCount;
      this.updateStatistics();
      this.emit('cache:cleanup', { count: evictedCount });

      if (this.config.enablePersistence) {
        this.saveToPersistence();
      }
    }
  }

  private updateHitRate(): void {
    const total = this.statistics.hits + this.statistics.misses;
    this.statistics.hitRate = total > 0 ? this.statistics.hits / total : 0;
  }

  private updateStatistics(): void {
    this.statistics.currentSize = this.cache.size;
    this.statistics.memoryUsage = this.estimateMemoryUsage();
  }

  private updateAccessTime(startTime: number): void {
    const accessTime = Date.now() - startTime;
    const totalAccesses = this.statistics.hits + this.statistics.misses;
    this.statistics.avgAccessTime =
      (this.statistics.avgAccessTime * totalAccesses + accessTime) / (totalAccesses + 1);
  }

  private estimateMemoryUsage(): number {
    let total = 0;

    for (const entry of this.cache.values()) {
      const valueSize = JSON.stringify(entry.value).length * 2;
      total += valueSize;
    }

    return total;
  }

  private async saveToPersistence(): Promise<void> {
    if (!this.config.enablePersistence || !this.config.persistencePath) {
      return;
    }

    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      const cacheData = Array.from(this.cache.entries());
      const filePath = path.join(this.config.persistencePath, 'cache.json');

      await fs.mkdir(this.config.persistencePath, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(cacheData), 'utf-8');
    } catch (error) {
      logger.error('[CacheManager] Failed to save cache to persistence:', error);
    }
  }

  private async loadFromPersistence(): Promise<void> {
    if (!this.config.enablePersistence || !this.config.persistencePath) {
      return;
    }

    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      const filePath = path.join(this.config.persistencePath, 'cache.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const cacheData = JSON.parse(data);

      for (const [key, entry] of cacheData) {
        if (!this.isExpired(entry)) {
          this.cache.set(key, entry);
        }
      }

      this.updateStatistics();
      this.emit('cache:loaded', { count: this.cache.size });
    } catch (error) {
      logger.error('[CacheManager] Failed to load cache from persistence:', error);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cache.clear();
    this.accessTimes.clear();
    this.removeAllListeners();
  }
}
