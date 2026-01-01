import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { RateLimiter, RateLimitStrategy } from './RateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  const defaultConfig = {
    windowMs: 60000,
    maxRequests: 10
  };

  beforeEach(() => {
    rateLimiter = new RateLimiter(defaultConfig);
  });

  afterEach(() => {
    rateLimiter.destroy();
  });

  describe('constructor', () => {
    it('should create a rate limiter with default configuration', () => {
      expect(rateLimiter).toBeDefined();
    });

    it('should create a rate limiter with custom configuration', () => {
      const customLimiter = new RateLimiter({
        windowMs: 30000,
        maxRequests: 5
      });
      expect(customLimiter).toBeDefined();
      customLimiter.destroy();
    });

    it('should create a rate limiter with specified strategy', () => {
      const slidingWindowLimiter = new RateLimiter(
        defaultConfig,
        RateLimitStrategy.SLIDING_WINDOW
      );
      expect(slidingWindowLimiter).toBeDefined();
      slidingWindowLimiter.destroy();
    });
  });

  describe('check', () => {
    it('should allow requests within limit', async () => {
      const result = await rateLimiter.check('user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.limit).toBe(10);
    });

    it('should block requests exceeding limit', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.check('user1');
      }

      const result = await rateLimiter.check('user1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should handle different identifiers independently', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.check('user1');
      }

      const user2Result = await rateLimiter.check('user2');
      expect(user2Result.allowed).toBe(true);
      expect(user2Result.remaining).toBe(9);
    });

    it('should skip successful requests when configured', async () => {
      const skipSuccessLimiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        skipSuccessfulRequests: true
      });

      for (let i = 0; i < 10; i++) {
        const result = await skipSuccessLimiter.check('user1', true);
        expect(result.allowed).toBe(true);
      }

      const failedResult = await skipSuccessLimiter.check('user1', false);
      expect(failedResult.allowed).toBe(true);

      skipSuccessLimiter.destroy();
    });

    it('should skip failed requests when configured', async () => {
      const skipFailedLimiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        skipFailedRequests: true
      });

      for (let i = 0; i < 10; i++) {
        const result = await skipFailedLimiter.check('user1', false);
        expect(result.allowed).toBe(true);
      }

      const successResult = await skipFailedLimiter.check('user1', true);
      expect(successResult.allowed).toBe(true);

      skipFailedLimiter.destroy();
    });

    it('should use custom key generator', async () => {
      const customKeyLimiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        keyGenerator: (id: string) => `prefix:${id}`
      });

      const result1 = await customKeyLimiter.check('user1');
      expect(result1.allowed).toBe(true);

      const result2 = await customKeyLimiter.check('user1');
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);

      customKeyLimiter.destroy();
    });
  });

  describe('reset', () => {
    it('should reset rate limit for specific identifier', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.check('user1');
      }

      await rateLimiter.reset('user1');

      const result = await rateLimiter.check('user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should reset all rate limits', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.check('user1');
        await rateLimiter.check('user2');
      }

      await rateLimiter.resetAll();

      const result1 = await rateLimiter.check('user1');
      const result2 = await rateLimiter.check('user2');

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.check('user1');
      }
      await rateLimiter.check('user1');

      for (let i = 0; i < 5; i++) {
        await rateLimiter.check('user2');
      }

      const stats = await rateLimiter.getStats();

      expect(stats.totalRequests).toBe(16);
      expect(stats.blockedRequests).toBe(1);
      expect(stats.allowedRequests).toBe(15);
      expect(stats.topViolators.length).toBeGreaterThan(0);
      expect(stats.topViolators[0].identifier).toBe('user1');
    });

    it('should return empty stats when no requests made', async () => {
      const stats = await rateLimiter.getStats();

      expect(stats.totalRequests).toBe(0);
      expect(stats.blockedRequests).toBe(0);
      expect(stats.allowedRequests).toBe(0);
      expect(stats.topViolators).toHaveLength(0);
    });
  });

  describe('getCurrentUsage', () => {
    it('should return current usage for identifier', async () => {
      await rateLimiter.check('user1');
      await rateLimiter.check('user1');

      const usage = await rateLimiter.getCurrentUsage('user1');

      expect(usage).toBeDefined();
      expect(usage!.count).toBe(2);
    });

    it('should return null for non-existent identifier', async () => {
      const usage = await rateLimiter.getCurrentUsage('nonexistent');
      expect(usage).toBeNull();
    });
  });

  describe('isAllowed', () => {
    it('should return true when within limit', async () => {
      const allowed = await rateLimiter.isAllowed('user1');
      expect(allowed).toBe(true);
    });

    it('should return false when exceeding limit', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.check('user1');
      }

      const allowed = await rateLimiter.isAllowed('user1');
      expect(allowed).toBe(false);
    });
  });

  describe('getRemaining', () => {
    it('should return remaining requests', async () => {
      const remaining = await rateLimiter.getRemaining('user1');
      expect(remaining).toBe(9);
    });

    it('should return 0 when limit exceeded', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.check('user1');
      }

      const remaining = await rateLimiter.getRemaining('user1');
      expect(remaining).toBe(0);
    });
  });

  describe('getResetTime', () => {
    it('should return reset time for identifier', async () => {
      await rateLimiter.check('user1');

      const resetTime = await rateLimiter.getResetTime('user1');
      expect(resetTime).toBeInstanceOf(Date);
      expect(resetTime!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null for non-existent identifier', async () => {
      const resetTime = await rateLimiter.getResetTime('nonexistent');
      expect(resetTime).toBeNull();
    });
  });

  describe('setLimit', () => {
    it('should update limit for identifier', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.check('user1');
      }

      await rateLimiter.setLimit('user1', 15);

      const result = await rateLimiter.check('user1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('setWindow', () => {
    it('should update window for identifier', async () => {
      await rateLimiter.check('user1');

      const originalResetTime = await rateLimiter.getResetTime('user1');
      await rateLimiter.setWindow('user1', 120000);

      const newResetTime = await rateLimiter.getResetTime('user1');
      expect(newResetTime!.getTime()).toBeGreaterThan(originalResetTime!.getTime());
    });
  });

  describe('setStrategy', () => {
    it('should change rate limiting strategy', async () => {
      await rateLimiter.setStrategy(RateLimitStrategy.TOKEN_BUCKET);
      expect(rateLimiter).toBeDefined();
    });
  });

  describe('setConfig', () => {
    it('should update configuration', async () => {
      await rateLimiter.setConfig({
        windowMs: 120000,
        maxRequests: 20
      });

      const result = await rateLimiter.check('user1');
      expect(result.limit).toBe(20);
    });
  });

  describe('RateLimitStrategy', () => {
    describe('FIXED_WINDOW', () => {
      it('should use fixed window strategy', async () => {
        const fixedLimiter = new RateLimiter(
          defaultConfig,
          RateLimitStrategy.FIXED_WINDOW
        );

        for (let i = 0; i < 10; i++) {
          const result = await fixedLimiter.check('user1');
          expect(result.allowed).toBe(true);
        }

        const blockedResult = await fixedLimiter.check('user1');
        expect(blockedResult.allowed).toBe(false);

        fixedLimiter.destroy();
      });
    });

    describe('SLIDING_WINDOW', () => {
      it('should use sliding window strategy', async () => {
        const slidingLimiter = new RateLimiter(
          defaultConfig,
          RateLimitStrategy.SLIDING_WINDOW
        );

        for (let i = 0; i < 10; i++) {
          const result = await slidingLimiter.check('user1');
          expect(result.allowed).toBe(true);
        }

        const blockedResult = await slidingLimiter.check('user1');
        expect(blockedResult.allowed).toBe(false);

        slidingLimiter.destroy();
      });
    });

    describe('TOKEN_BUCKET', () => {
      it('should use token bucket strategy', async () => {
        const tokenBucketLimiter = new RateLimiter(
          defaultConfig,
          RateLimitStrategy.TOKEN_BUCKET
        );

        for (let i = 0; i < 10; i++) {
          const result = await tokenBucketLimiter.check('user1');
          expect(result.allowed).toBe(true);
        }

        const blockedResult = await tokenBucketLimiter.check('user1');
        expect(blockedResult.allowed).toBe(false);

        tokenBucketLimiter.destroy();
      });
    });

    describe('LEAKY_BUCKET', () => {
      it('should use leaky bucket strategy', async () => {
        const leakyBucketLimiter = new RateLimiter(
          defaultConfig,
          RateLimitStrategy.LEAKY_BUCKET
        );

        for (let i = 0; i < 10; i++) {
          const result = await leakyBucketLimiter.check('user1');
          expect(result.allowed).toBe(true);
        }

        const blockedResult = await leakyBucketLimiter.check('user1');
        expect(blockedResult.allowed).toBe(false);

        leakyBucketLimiter.destroy();
      });
    });
  });

  describe('events', () => {
    it('should emit rateLimit:exceeded event', async () => {
      const handler = jest.fn();
      rateLimiter.on('rateLimit:exceeded', handler);

      for (let i = 0; i < 11; i++) {
        await rateLimiter.check('user1');
      }

      expect(handler).toHaveBeenCalled();
    });

    it('should emit rateLimit:checked event', async () => {
      const handler = jest.fn();
      rateLimiter.on('rateLimit:checked', handler);

      await rateLimiter.check('user1');

      expect(handler).toHaveBeenCalled();
    });

    it('should emit rateLimit:reset event', async () => {
      const handler = jest.fn();
      rateLimiter.on('rateLimit:reset', handler);

      await rateLimiter.reset('user1');

      expect(handler).toHaveBeenCalled();
    });

    it('should emit rateLimit:resetAll event', async () => {
      const handler = jest.fn();
      rateLimiter.on('rateLimit:resetAll', handler);

      await rateLimiter.resetAll();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should clean up expired entries', async () => {
      const shortWindowLimiter = new RateLimiter({
        windowMs: 100,
        maxRequests: 5
      });

      await shortWindowLimiter.check('user1');

      await new Promise(resolve => setTimeout(resolve, 150));

      const usage = await shortWindowLimiter.getCurrentUsage('user1');
      expect(usage).toBeNull();

      shortWindowLimiter.destroy();
    });
  });
});
