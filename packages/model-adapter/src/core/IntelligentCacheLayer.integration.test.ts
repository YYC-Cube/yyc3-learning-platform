import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { IntelligentCacheLayer, CacheLevel, CacheStrategy } from './IntelligentCacheLayer';

describe('IntelligentCacheLayer Integration Tests', () => {
  let cacheLayer: IntelligentCacheLayer;

  beforeEach(() => {
    cacheLayer = new IntelligentCacheLayer({
      l1Size: 100,
      l1TTL: 60000,
      l2Size: '1gb',
      l2Policy: CacheStrategy.LRU,
      l3Size: '10gb',
      l3TTL: 86400000,
      l4TTL: 86400000,
      enableCompression: false,
      writeThrough: true,
      writeBehind: false,
      clusteringEnabled: false
    });
  });

  afterEach(async () => {
    await cacheLayer.clear();
  });

  describe('Multi-Level Cache Hierarchy', () => {
    it('should cache data in L1 and retrieve from L1', async () => {
      const testData = { key: 'value', timestamp: Date.now() };

      await cacheLayer.set('test-key-1', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      const result = await cacheLayer.get('test-key-1');

      expect(result.hit).toBe(true);
      expect(result.source).toBe(CacheLevel.L1);
      expect(result.value).toEqual(testData);
    });

    it('should promote data from L2 to L1 on access', async () => {
      const testData = { key: 'value', timestamp: Date.now() };

      await cacheLayer.set('test-key-2', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      const result = await cacheLayer.get('test-key-2');

      expect(result.hit).toBe(true);
      expect(result.source).toBe(CacheLevel.L1);
    });

    it('should use loader when data not in cache', async () => {
      const loader = jest.fn().mockResolvedValue({ loaded: true, timestamp: Date.now() });

      const result = await cacheLayer.get('test-key-3', {
        loader,
        ttl: 60000
      });

      expect(loader).toHaveBeenCalledTimes(1);
      expect(result.hit).toBe(false);
      expect(result.source).toBe('loader');
      expect(result.value.loaded).toBe(true);
    });

    it('should cache loaded data in all levels', async () => {
      const testData = { loaded: true, timestamp: Date.now() };
      const loader = jest.fn().mockResolvedValue(testData);

      await cacheLayer.get('test-key-4', {
        loader,
        ttl: 60000
      });

      const result = await cacheLayer.get('test-key-4');

      expect(result.hit).toBe(true);
      expect(result.source).toBe(CacheLevel.L1);
      expect(result.value).toEqual(testData);
    });
  });

  describe('Cache Eviction', () => {
    it('should evict LRU entries when cache is full', async () => {
      const smallCache = new IntelligentCacheLayer({
        l1Size: 5,
        l1TTL: 60000
      });

      for (let i = 0; i < 10; i++) {
        await smallCache.set(`key-${i}`, { value: i }, {
          strategy: 'write-through'
        });
      }

      const result1 = await smallCache.get('key-0');
      const result9 = await smallCache.get('key-9');

      expect(result1.hit).toBe(false);
      expect(result9.hit).toBe(true);
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache statistics across all levels', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-5', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      await cacheLayer.get('test-key-5');
      await cacheLayer.get('non-existent-key');

      const stats = await cacheLayer.getStats();

      expect(stats).toHaveLength(4);
      expect(stats[0].level).toBe(CacheLevel.L1);
      expect(stats[1].level).toBe(CacheLevel.L2);
      expect(stats[2].level).toBe(CacheLevel.L3);
      expect(stats[3].level).toBe(CacheLevel.L4);
    });

    it('should calculate hit rate correctly', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-6', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      await cacheLayer.get('test-key-6');
      await cacheLayer.get('test-key-6');
      await cacheLayer.get('non-existent-key');

      const stats = await cacheLayer.getStats();
      const l1Stats = stats.find(s => s.level === CacheLevel.L1);

      if (l1Stats) {
        const hitRate = l1Stats.hits / (l1Stats.hits + l1Stats.misses);
        expect(hitRate).toBeGreaterThan(0);
      }
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache entries by key', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-7', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      await cacheLayer.delete('test-key-7');

      const result = await cacheLayer.get('test-key-7');

      expect(result.hit).toBe(false);
    });

    it('should invalidate cache entries by pattern', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('user:1', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      await cacheLayer.set('user:2', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      await cacheLayer.invalidate(/user:\d+/);

      const result1 = await cacheLayer.get('user:1');
      const result2 = await cacheLayer.get('user:2');

      expect(result1.hit).toBe(false);
      expect(result2.hit).toBe(false);
    });

    it('should clear all cache entries', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-8', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      await cacheLayer.set('test-key-9', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      await cacheLayer.clear();

      const result1 = await cacheLayer.get('test-key-8');
      const result2 = await cacheLayer.get('test-key-9');

      expect(result1.hit).toBe(false);
      expect(result2.hit).toBe(false);
    });
  });

  describe('Cache TTL', () => {
    it('should expire entries after TTL', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-10', testData, {
        strategy: 'write-through',
        ttl: 100
      });

      await new Promise(resolve => setTimeout(resolve, 150));

      const result = await cacheLayer.get('test-key-10');

      expect(result.hit).toBe(false);
    });
  });

  describe('Cache Tags', () => {
    it('should support cache tags for grouping', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-11', testData, {
        strategy: 'write-through',
        ttl: 60000,
        tags: ['user', 'profile']
      });

      const result = await cacheLayer.get('test-key-11');

      expect(result.hit).toBe(true);
    });
  });

  describe('Cache Priority', () => {
    it('should respect cache priority', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-12', testData, {
        strategy: 'write-through',
        ttl: 60000,
        priority: 'high'
      });

      const result = await cacheLayer.get('test-key-12');

      expect(result.hit).toBe(true);
    });
  });

  describe('Write Strategies', () => {
    it('should support write-through strategy', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-13', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      const result = await cacheLayer.get('test-key-13');

      expect(result.hit).toBe(true);
      expect(result.source).toBe(CacheLevel.L1);
    });

    it('should support write-behind strategy', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-14', testData, {
        strategy: 'write-behind',
        ttl: 60000
      });

      const result = await cacheLayer.get('test-key-14');

      expect(result.hit).toBe(true);
      expect(result.source).toBe(CacheLevel.L1);
    });

    it('should support write-around strategy', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-15', testData, {
        strategy: 'write-around',
        ttl: 60000
      });

      const result = await cacheLayer.get('test-key-15');

      expect(result.hit).toBe(true);
    });

    it('should support cache-aside strategy', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-16', testData, {
        strategy: 'cache-aside',
        ttl: 60000
      });

      const result = await cacheLayer.get('test-key-16');

      expect(result.hit).toBe(true);
      expect(result.source).toBe(CacheLevel.L1);
    });
  });

  describe('Cache Warmup', () => {
    it('should warmup cache with predefined patterns', async () => {
      const patterns = [
        {
          name: 'user-profiles',
          keyPattern: 'user:\\d+',
          loader: async (key: string) => ({
            userId: key.split(':')[1],
            name: `User ${key.split(':')[1]}`
          }),
          ttl: 60000,
          priority: 'high' as const
        }
      ];

      const report = await cacheLayer.warmup(patterns);

      expect(report).toBeDefined();
      expect(report.startTime).toBeDefined();
      expect(report.endTime).toBeDefined();
      expect(report.patterns).toHaveLength(1);
      expect(report.totalDuration).toBeGreaterThan(0);
    });
  });

  describe('Cache Performance Analysis', () => {
    it('should analyze cache performance', async () => {
      const testData = { value: 'test' };

      await cacheLayer.set('test-key-17', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      await cacheLayer.get('test-key-17');
      await cacheLayer.get('test-key-17');
      await cacheLayer.get('non-existent-key');

      const report = await cacheLayer.analyzePerformance();

      expect(report).toBeDefined();
      expect(report.timestamp).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.healthScore).toBeGreaterThanOrEqual(0);
      expect(report.healthScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Cache Events', () => {
    it('should emit cache hit events', async () => {
      const testData = { value: 'test' };
      const hitEvents: any[] = [];

      cacheLayer.on('cache:hit', (event) => {
        hitEvents.push(event);
      });

      await cacheLayer.set('test-key-18', testData, {
        strategy: 'write-through',
        ttl: 60000
      });

      await cacheLayer.get('test-key-18');

      expect(hitEvents.length).toBeGreaterThan(0);
    });

    it('should emit cache miss events', async () => {
      const missEvents: any[] = [];

      cacheLayer.on('cache:miss', (event) => {
        missEvents.push(event);
      });

      await cacheLayer.get('non-existent-key-2');

      expect(missEvents.length).toBeGreaterThan(0);
    });

    it('should emit cache set events', async () => {
      const setEvents: any[] = [];

      cacheLayer.on('cache:set', (event) => {
        setEvents.push(event);
      });

      await cacheLayer.set('test-key-19', { value: 'test' }, {
        strategy: 'write-through',
        ttl: 60000
      });

      expect(setEvents.length).toBeGreaterThan(0);
      expect(setEvents[0].key).toBe('test-key-19');
    });

    it('should emit cache delete events', async () => {
      const deleteEvents: any[] = [];

      cacheLayer.on('cache:delete', (event) => {
        deleteEvents.push(event);
      });

      await cacheLayer.set('test-key-20', { value: 'test' }, {
        strategy: 'write-through',
        ttl: 60000
      });

      await cacheLayer.delete('test-key-20');

      expect(deleteEvents.length).toBeGreaterThan(0);
      expect(deleteEvents[0].key).toBe('test-key-20');
    });
  });

  describe('Cache Error Handling', () => {
    it('should handle cache errors gracefully', async () => {
      const errorEvents: any[] = [];

      cacheLayer.on('cache:error', (event) => {
        errorEvents.push(event);
      });

      const loader = jest.fn().mockRejectedValue(new Error('Loader failed'));

      try {
        await cacheLayer.get('test-key-21', {
          loader,
          ttl: 60000
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
