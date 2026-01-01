import { EventEmitter } from 'events';

export enum CacheLevel {
  L1 = 'memory',
  L2 = 'shared',
  L3 = 'persistent',
  L4 = 'remote'
}

export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  ARC = 'arc',
  MRU = 'mru',
  FIFO = 'fifo',
  TTL = 'ttl',
  HYBRID = 'hybrid'
}

export interface CacheMetadata {
  createdAt: Date;
  ttl?: number;
  expiresAt?: Date;
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
  dependencies?: string[];
  version?: number;
  size?: number;
  accessCount?: number;
  lastAccessedAt?: Date;
  frequency?: number;
  compressed?: boolean;
  originalSize?: number;
}

export interface CacheResult<T> {
  value: T;
  hit: boolean;
  source: CacheLevel | 'loader' | 'none';
  metadata: {
    loadTime: number;
    size: number;
    timestamp: Date;
  };
}

export interface CacheGetOptions {
  loader?: () => Promise<any>;
  ttl?: number;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}

export interface CacheSetOptions {
  strategy?: 'write-through' | 'write-behind' | 'write-around' | 'cache-aside';
  ttl?: number;
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
  dependencies?: string[];
  invalidate?: boolean;
}

export interface CacheStats {
  level: CacheLevel;
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  evictions: number;
  avgLatency: number;
  memoryUsage: number;
  p50Latency?: number;
  p95Latency?: number;
  p99Latency?: number;
}

export interface WarmupPattern {
  name: string;
  keyPattern: string | RegExp;
  loader: (key: string) => Promise<any>;
  ttl?: number;
  priority?: 'high' | 'medium' | 'low';
}

export interface WarmupReport {
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  patterns: Array<{
    pattern: string;
    keysAttempted: number;
    keysWarmed: number;
    totalSize: number;
    duration: number;
  }>;
  results: Record<string, Array<{ key: string; success: boolean; size?: number; error?: string }>>;
  analysis?: any;
}

export interface EvictionResult {
  level: CacheLevel;
  evictedCount: number;
  freedSpace: number;
  timestamp: Date;
  candidates?: any[];
}

export interface ConsistencyCheck {
  consistent: boolean;
  latestVersion?: any;
  timeDrift?: number;
  requiredSync?: boolean;
  resolvedVersion?: any;
  synchronizedData?: any;
}

export interface CacheConfig {
  l1Size?: number;
  l1TTL?: number;
  l2Size?: string;
  l2Policy?: CacheStrategy;
  l3Size?: string;
  l3TTL?: number;
  l4TTL?: number;
  persistentPath?: string;
  redisConfig?: any;
  cdnProvider?: string;
  cdnBucket?: string;
  cdnRegion?: string;
  edgeLocations?: string[];
  prefetchThreshold?: number;
  writeThrough?: boolean;
  writeBehind?: boolean;
  clusteringEnabled?: boolean;
  enableCompression?: boolean;
  writeBufferSize?: number;
}

export interface CachePerformanceReport {
  timestamp: Date;
  metrics: any;
  bottlenecks: any[];
  recommendations: any[];
  forecast: any;
  healthScore: number;
  autoOptimizationPlan?: any;
}

interface LRUNode {
  key: string;
  value: any;
  metadata: CacheMetadata;
  prev: LRUNode | null;
  next: LRUNode | null;
}

class OptimizedLRUCache extends EventEmitter {
  private cache: Map<string, LRUNode>;
  private head: LRUNode | null;
  private tail: LRUNode | null;
  private config: any;
  private hits: number;
  private misses: number;
  private evictions: number;
  private latencies: number[];

  constructor(config: any) {
    super();
    this.cache = new Map();
    this.config = config;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.latencies = [];
    this.head = null;
    this.tail = null;
  }

  async get<T>(key: string): Promise<any> {
    const startTime = Date.now();
    const node = this.cache.get(key);

    if (!node) {
      this.misses++;
      this.recordLatency(Date.now() - startTime);
      return { hit: false, value: null, metadata: {} };
    }

    if (node.metadata.expiresAt && node.metadata.expiresAt < new Date()) {
      this.deleteNode(node);
      this.misses++;
      this.recordLatency(Date.now() - startTime);
      return { hit: false, value: null, metadata: {} };
    }

    this.moveToHead(node);
    node.metadata.accessCount = (node.metadata.accessCount || 0) + 1;
    node.metadata.frequency = (node.metadata.frequency || 0) + 1;
    node.metadata.lastAccessedAt = new Date();

    this.hits++;
    this.recordLatency(Date.now() - startTime);
    return { hit: true, value: node.value, metadata: node.metadata };
  }

  async set(key: string, value: any, metadata: CacheMetadata): Promise<void> {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      existingNode.value = value;
      existingNode.metadata = { ...metadata, accessCount: existingNode.metadata.accessCount || 0 };
      this.moveToHead(existingNode);
      return;
    }

    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const newNode: LRUNode = {
      key,
      value,
      metadata,
      prev: null,
      next: null
    };

    this.cache.set(key, newNode);
    this.addToHead(newNode);
  }

  async delete(key: string): Promise<void> {
    const node = this.cache.get(key);
    if (node) {
      this.deleteNode(node);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.latencies = [];
  }

  async getStats(): Promise<CacheStats> {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    const sortedLatencies = [...this.latencies].sort((a, b) => a - b);
    const p50 = this.getPercentile(sortedLatencies, 50);
    const p95 = this.getPercentile(sortedLatencies, 95);
    const p99 = this.getPercentile(sortedLatencies, 99);

    return {
      level: CacheLevel.L1,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      size: this.cache.size,
      maxSize: this.config.maxSize,
      evictions: this.evictions,
      avgLatency: this.latencies.length > 0 ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length : 0,
      memoryUsage: this.calculateMemoryUsage(),
      p50Latency: p50,
      p95Latency: p95,
      p99Latency: p99
    };
  }

  async findKeys(pattern: string | RegExp): Promise<string[]> {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  private moveToHead(node: LRUNode): void {
    this.deleteNode(node);
    this.addToHead(node);
  }

  private addToHead(node: LRUNode): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private deleteNode(node: LRUNode): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private evictLRU(): void {
    if (this.tail) {
      this.cache.delete(this.tail.key);
      this.deleteNode(this.tail);
      this.evictions++;
    }
  }

  private recordLatency(latency: number): void {
    this.latencies.push(latency);
    if (this.latencies.length > 1000) {
      this.latencies.shift();
    }
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0;
    for (const node of this.cache.values()) {
      totalSize += node.metadata.size || 0;
    }
    return totalSize;
  }
}

class OptimizedLFUCache extends EventEmitter {
  private cache: Map<string, LRUNode>;
  private frequencyMap: Map<number, LRUNode[]>;
  private minFrequency: number;
  private config: any;
  private hits: number;
  private misses: number;
  private evictions: number;
  private latencies: number[];

  constructor(config: any) {
    super();
    this.cache = new Map();
    this.frequencyMap = new Map();
    this.minFrequency = 0;
    this.config = config;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.latencies = [];
  }

  async get<T>(key: string): Promise<any> {
    const startTime = Date.now();
    const node = this.cache.get(key);

    if (!node) {
      this.misses++;
      this.recordLatency(Date.now() - startTime);
      return { hit: false, value: null, metadata: {} };
    }

    if (node.metadata.expiresAt && node.metadata.expiresAt < new Date()) {
      this.deleteNode(node);
      this.misses++;
      this.recordLatency(Date.now() - startTime);
      return { hit: false, value: null, metadata: {} };
    }

    this.updateFrequency(node);
    node.metadata.accessCount = (node.metadata.accessCount || 0) + 1;
    node.metadata.lastAccessedAt = new Date();

    this.hits++;
    this.recordLatency(Date.now() - startTime);
    return { hit: true, value: node.value, metadata: node.metadata };
  }

  async set(key: string, value: any, metadata: CacheMetadata): Promise<void> {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      existingNode.value = value;
      existingNode.metadata = { ...metadata, accessCount: existingNode.metadata.accessCount || 0 };
      this.updateFrequency(existingNode);
      return;
    }

    if (this.cache.size >= this.config.maxSize) {
      this.evictLFU();
    }

    const newNode: LRUNode = {
      key,
      value,
      metadata: { ...metadata, frequency: 1 },
      prev: null,
      next: null
    };

    this.cache.set(key, newNode);
    this.addToFrequencyMap(1, newNode);
    this.minFrequency = 1;
  }

  async delete(key: string): Promise<void> {
    const node = this.cache.get(key);
    if (node) {
      this.deleteNode(node);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.frequencyMap.clear();
    this.minFrequency = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.latencies = [];
  }

  async getStats(): Promise<CacheStats> {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    const sortedLatencies = [...this.latencies].sort((a, b) => a - b);
    const p50 = this.getPercentile(sortedLatencies, 50);
    const p95 = this.getPercentile(sortedLatencies, 95);
    const p99 = this.getPercentile(sortedLatencies, 99);

    return {
      level: CacheLevel.L2,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      size: this.cache.size,
      maxSize: this.config.maxSize,
      evictions: this.evictions,
      avgLatency: this.latencies.length > 0 ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length : 0,
      memoryUsage: this.calculateMemoryUsage(),
      p50Latency: p50,
      p95Latency: p95,
      p99Latency: p99
    };
  }

  async findKeys(pattern: string | RegExp): Promise<string[]> {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  private updateFrequency(node: LRUNode): void {
    const oldFreq = node.metadata.frequency || 1;
    const newFreq = oldFreq + 1;

    this.removeFromFrequencyMap(oldFreq, node);
    this.addToFrequencyMap(newFreq, node);
    node.metadata.frequency = newFreq;

    if (this.frequencyMap.get(oldFreq)?.length === 0) {
      this.frequencyMap.delete(oldFreq);
      if (this.minFrequency === oldFreq) {
        this.minFrequency = newFreq;
      }
    }
  }

  private addToFrequencyMap(frequency: number, node: LRUNode): void {
    if (!this.frequencyMap.has(frequency)) {
      this.frequencyMap.set(frequency, []);
    }
    this.frequencyMap.get(frequency)!.push(node);
  }

  private removeFromFrequencyMap(frequency: number, node: LRUNode): void {
    const nodes = this.frequencyMap.get(frequency);
    if (nodes) {
      const index = nodes.indexOf(node);
      if (index > -1) {
        nodes.splice(index, 1);
      }
    }
  }

  private evictLFU(): void {
    const nodes = this.frequencyMap.get(this.minFrequency);
    if (nodes && nodes.length > 0) {
      const node = nodes.shift()!;
      this.cache.delete(node.key);
      this.evictions++;
    }
  }

  private deleteNode(node: LRUNode): void {
    const frequency = node.metadata.frequency || 1;
    this.removeFromFrequencyMap(frequency, node);
    this.cache.delete(node.key);
  }

  private recordLatency(latency: number): void {
    this.latencies.push(latency);
    if (this.latencies.length > 1000) {
      this.latencies.shift();
    }
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0;
    for (const node of this.cache.values()) {
      totalSize += node.metadata.size || 0;
    }
    return totalSize;
  }
}

export class OptimizedIntelligentCacheLayer extends EventEmitter {
  private l1Cache: OptimizedLRUCache;
  private l2Cache: OptimizedLFUCache;
  private l3Cache: OptimizedLRUCache;
  private l4Cache: OptimizedLRUCache;
  private config: CacheConfig;
  private batchOperations: Map<string, Promise<any>>;

  constructor(config: CacheConfig = {}) {
    super();
    this.config = config;
    this.batchOperations = new Map();
    this.initializeCaches(config);
  }

  private initializeCaches(config: CacheConfig): void {
    this.l1Cache = new OptimizedLRUCache({
      maxSize: config.l1Size || 1000,
      strategy: CacheStrategy.LRU,
      ttl: config.l1TTL || 60000,
      enableCompression: config.enableCompression || false,
      serialization: 'json'
    });

    this.l2Cache = new OptimizedLFUCache({
      type: 'memory',
      connection: config.redisConfig,
      maxMemory: config.l2Size || '1gb',
      policy: config.l2Policy || CacheStrategy.LFU,
      clustering: config.clusteringEnabled || false
    });

    this.l3Cache = new OptimizedLRUCache({
      storageEngine: 'memory',
      path: config.persistentPath || './cache',
      maxSize: config.l3Size || '10gb',
      compression: config.enableCompression ? 'gzip' : 'none',
      writeBuffer: config.writeBufferSize || 1024 * 1024
    });

    this.l4Cache = new OptimizedLRUCache({
      provider: config.cdnProvider || 'memory',
      bucket: config.cdnBucket || 'default',
      region: config.cdnRegion || 'us-east-1',
      ttl: config.l4TTL || 86400000,
      edgeLocations: config.edgeLocations || []
    });
  }

  async get<T>(key: string, options: CacheGetOptions = {}): Promise<CacheResult<T>> {
    const startTime = Date.now();
    const traceId = this.generateTraceId();

    try {
      let result = await this.l1Cache.get<T>(key);
      if (result.hit) {
        this.recordHit('L1', traceId);
        return this.wrapResult(result, CacheLevel.L1, Date.now() - startTime);
      }

      result = await this.l2Cache.get<T>(key);
      if (result.hit) {
        await this.l1Cache.set(key, result.value, result.metadata);
        this.recordHit('L2', traceId);
        return this.wrapResult(result, CacheLevel.L2, Date.now() - startTime);
      }

      result = await this.l3Cache.get<T>(key);
      if (result.hit) {
        await Promise.all([
          this.l1Cache.set(key, result.value, result.metadata),
          this.l2Cache.set(key, result.value, result.metadata)
        ]);
        this.recordHit('L3', traceId);
        return this.wrapResult(result, CacheLevel.L3, Date.now() - startTime);
      }

      result = await this.l4Cache.get<T>(key);
      if (result.hit) {
        await Promise.all([
          this.l1Cache.set(key, result.value, result.metadata),
          this.l2Cache.set(key, result.value, result.metadata),
          this.l3Cache.set(key, result.value, result.metadata)
        ]);
        this.recordHit('L4', traceId);
        return this.wrapResult(result, CacheLevel.L4, Date.now() - startTime);
      }

      if (options.loader) {
        const data = await options.loader();
        await this.set(key, data, options);
        this.recordMiss(traceId);
        return {
          value: data,
          hit: false,
          source: 'loader',
          metadata: {
            loadTime: Date.now() - startTime,
            size: this.calculateSize(data),
            timestamp: new Date()
          }
        };
      }

      this.recordMiss(traceId);
      return {
        value: null as any,
        hit: false,
        source: 'none',
        metadata: {
          missTime: Date.now() - startTime,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return await this.handleCacheError<T>(error, key, options, traceId);
    }
  }

  async getBatch<T>(keys: string[], options: CacheGetOptions = {}): Promise<Map<string, CacheResult<T>>> {
    const results = new Map<string, CacheResult<T>>();
    const promises = keys.map(async key => {
      const result = await this.get<T>(key, options);
      results.set(key, result);
    });

    await Promise.all(promises);
    return results;
  }

  async set<T>(key: string, value: T, options: CacheSetOptions = {}): Promise<void> {
    const metadata: CacheMetadata = {
      createdAt: new Date(),
      ttl: options.ttl,
      expiresAt: options.ttl ? new Date(Date.now() + options.ttl) : undefined,
      tags: options.tags,
      priority: options.priority || 'medium',
      dependencies: options.dependencies,
      version: 1,
      size: this.calculateSize(value),
      accessCount: 0,
      lastAccessedAt: new Date(),
      frequency: 0
    };

    switch (options.strategy || 'write-through') {
      case 'write-through':
        await Promise.all([
          this.l1Cache.set(key, value, metadata),
          this.l2Cache.set(key, value, metadata),
          this.l3Cache.set(key, value, metadata),
          this.l4Cache.set(key, value, metadata)
        ]);
        break;

      case 'write-behind':
        await this.l1Cache.set(key, value, metadata);
        this.queueBackgroundWrite(key, value, metadata);
        break;

      case 'write-around':
        await this.l2Cache.set(key, value, metadata);
        await this.l3Cache.set(key, value, metadata);
        if (options.invalidate) {
          await this.invalidate(key);
        }
        break;

      case 'cache-aside':
        await this.l1Cache.set(key, value, metadata);
        break;

      default:
        await Promise.all([
          this.l1Cache.set(key, value, metadata),
          this.l2Cache.set(key, value, metadata)
        ]);
    }

    this.emit('cache:set', { key, metadata });
  }

  async setBatch<T>(entries: Map<string, T>, options: CacheSetOptions = {}): Promise<void> {
    const promises = Array.from(entries.entries()).map(async ([key, value]) => {
      await this.set(key, value, options);
    });

    await Promise.all(promises);
  }

  async delete(key: string): Promise<void> {
    await Promise.all([
      this.l1Cache.delete(key),
      this.l2Cache.delete(key),
      this.l3Cache.delete(key),
      this.l4Cache.delete(key)
    ]);
    this.emit('cache:delete', { key });
  }

  async deleteBatch(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.delete(key)));
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.l1Cache.clear(),
      this.l2Cache.clear(),
      this.l3Cache.clear(),
      this.l4Cache.clear()
    ]);
    this.emit('cache:clear');
  }

  async invalidate(pattern: string | RegExp): Promise<void> {
    const keys = await this.findKeys(pattern);
    await Promise.all(keys.map(key => this.delete(key)));
  }

  async warmup(patterns: WarmupPattern[]): Promise<WarmupReport> {
    const report: WarmupReport = {
      startTime: new Date(),
      patterns: [],
      results: {}
    };

    for (const pattern of patterns) {
      const patternStart = Date.now();
      const keysToWarm = await this.identifyKeysForWarmup(pattern);

      const warmupPromises = keysToWarm.map(async key => {
        try {
          const data = await pattern.loader(key);
          await this.set(key, data, {
            strategy: 'write-through',
            ttl: pattern.ttl,
            priority: pattern.priority || 'medium'
          });
          return { key, success: true, size: this.calculateSize(data) };
        } catch (error) {
          return { key, success: false, error: (error as Error).message };
        }
      });

      const results = await Promise.all(warmupPromises);

      report.patterns.push({
        pattern: pattern.name,
        keysAttempted: keysToWarm.length,
        keysWarmed: results.filter(r => r.success).length,
        totalSize: results.reduce((sum, r) => sum + (r.size || 0), 0),
        duration: Date.now() - patternStart
      });

      report.results[pattern.name] = results;
    }

    report.endTime = new Date();
    report.totalDuration = report.endTime.getTime() - report.startTime.getTime();

    return report;
  }

  async getStats(): Promise<CacheStats[]> {
    return Promise.all([
      this.l1Cache.getStats(),
      this.l2Cache.getStats(),
      this.l3Cache.getStats(),
      this.l4Cache.getStats()
    ]);
  }

  async analyzePerformance(): Promise<CachePerformanceReport> {
    const stats = await this.getStats();
    const totalHits = stats.reduce((sum, s) => sum + s.hits, 0);
    const totalMisses = stats.reduce((sum, s) => sum + s.misses, 0);
    const totalRequests = totalHits + totalMisses;
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;

    const bottlenecks: any[] = [];
    const recommendations: any[] = [];

    if (stats[0].hitRate < 0.8) {
      bottlenecks.push({
        level: 'L1',
        issue: 'Low hit rate',
        severity: 'high',
        currentValue: stats[0].hitRate,
        targetValue: 0.8
      });
      recommendations.push({
        level: 'L1',
        action: 'Increase L1 cache size',
        reason: 'Current hit rate is below 80%',
        priority: 'high'
      });
    }

    if (stats[0].avgLatency > 10) {
      bottlenecks.push({
        level: 'L1',
        issue: 'High latency',
        severity: 'medium',
        currentValue: stats[0].avgLatency,
        targetValue: 10
      });
      recommendations.push({
        level: 'L1',
        action: 'Optimize cache access patterns',
        reason: 'Average latency exceeds 10ms',
        priority: 'medium'
      });
    }

    return {
      timestamp: new Date(),
      metrics: {
        totalHits,
        totalMisses,
        hitRate,
        totalSize: stats.reduce((sum, s) => sum + s.size, 0),
        totalMemoryUsage: stats.reduce((sum, s) => sum + s.memoryUsage, 0),
        avgLatency: stats.reduce((sum, s) => sum + s.avgLatency, 0) / stats.length
      },
      bottlenecks,
      recommendations,
      forecast: {
        projectedHitRate: hitRate * 1.1,
        projectedLatency: stats[0].avgLatency * 0.9
      },
      healthScore: hitRate * 100
    };
  }

  private wrapResult<T>(result: any, source: CacheLevel, loadTime: number): CacheResult<T> {
    return {
      value: result.value,
      hit: true,
      source,
      metadata: {
        loadTime,
        size: result.metadata?.size || 0,
        timestamp: new Date()
      }
    };
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private recordHit(level: string, traceId: string): void {
    this.emit('cache:hit', { level, traceId });
  }

  private recordMiss(traceId: string): void {
    this.emit('cache:miss', { traceId });
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private async handleCacheError<T>(error: any, key: string, options: CacheGetOptions, traceId: string): Promise<CacheResult<T>> {
    this.emit('cache:error', { error, key, traceId });

    if (options.loader) {
      try {
        const data = await options.loader();
        return {
          value: data,
          hit: false,
          source: 'loader',
          metadata: {
            loadTime: 0,
            size: this.calculateSize(data),
            timestamp: new Date()
          }
        };
      } catch (loaderError) {
        throw loaderError;
      }
    }

    throw error;
  }

  private queueBackgroundWrite(key: string, value: any, metadata: CacheMetadata): void {
    setImmediate(async () => {
      try {
        await Promise.all([
          this.l2Cache.set(key, value, metadata),
          this.l3Cache.set(key, value, metadata),
          this.l4Cache.set(key, value, metadata)
        ]);
      } catch (error) {
        this.emit('cache:background-write-error', { error, key });
      }
    });
  }

  private async findKeys(pattern: string | RegExp): Promise<string[]> {
    const l1Keys = await this.l1Cache.findKeys(pattern);
    const l2Keys = await this.l2Cache.findKeys(pattern);
    const l3Keys = await this.l3Cache.findKeys(pattern);
    const l4Keys = await this.l4Cache.findKeys(pattern);

    return [...new Set([...l1Keys, ...l2Keys, ...l3Keys, ...l4Keys])];
  }

  private async identifyKeysForWarmup(pattern: WarmupPattern): Promise<string[]> {
    return [`key_1`, `key_2`, `key_3`];
  }
}
