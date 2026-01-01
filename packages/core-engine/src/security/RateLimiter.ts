import { EventEmitter } from 'eventemitter3';
import { createLogger } from '../../../../lib/logger';

const logger = createLogger('RateLimiter');

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
  handler?: (identifier: string, limit: RateLimitResult) => void;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  windowStart: number;
  maxRequests?: number;
  lastRefillTime?: number;
}

export interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  topViolators: Array<{ identifier: string; violations: number }>;
  averageRequestsPerWindow: number;
}

export enum RateLimitStrategy {
  FIXED_WINDOW = 'fixed_window',
  SLIDING_WINDOW = 'sliding_window',
  TOKEN_BUCKET = 'token_bucket',
  LEAKY_BUCKET = 'leaky_bucket'
}

export class RateLimiter extends EventEmitter {
  private config: Required<RateLimitConfig>;
  private store: Map<string, RateLimitEntry> = new Map();
  private stats: Map<string, { total: number; blocked: number; allowed: number }> = new Map();
  private strategy: RateLimitStrategy;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: RateLimitConfig, strategy: RateLimitStrategy = RateLimitStrategy.SLIDING_WINDOW) {
    super();
    
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      keyGenerator: config.keyGenerator || ((id: string) => id),
      handler: config.handler || this.defaultHandler
    };

    this.strategy = strategy;
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, Math.min(this.config.windowMs, 60000));

    this.setupEventHandlers();
  }

  private defaultHandler = (identifier: string, limit: RateLimitResult): void => {
    this.emit('rateLimit:exceeded', { identifier, limit });
  };

  private setupEventHandlers(): void {
    this.on('rateLimit:exceeded', (data) => {
      logger.warn(`Rate limit exceeded for ${data.identifier}: ${data.limit.remaining}/${data.limit.limit} remaining`);
    });
  }

  private generateKey(identifier: string): string {
    return this.config.keyGenerator(identifier);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.store.delete(key);
    }

    if (keysToDelete.length > 0) {
      this.emit('rateLimit:cleanup', { cleanedEntries: keysToDelete.length });
    }
  }

  private updateStats(identifier: string, allowed: boolean): void {
    if (!this.stats.has(identifier)) {
      this.stats.set(identifier, { total: 0, blocked: 0, allowed: 0 });
    }

    const stat = this.stats.get(identifier)!;
    stat.total++;
    if (allowed) {
      stat.allowed++;
    } else {
      stat.blocked++;
    }
  }

  async check(identifier: string, success?: boolean): Promise<RateLimitResult> {
    const key = this.generateKey(identifier);
    const now = Date.now();
    let entry = this.store.get(key);

    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        windowStart: now
      };
      this.store.set(key, entry);
    }

    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + this.config.windowMs;
      entry.windowStart = now;
    }

    const maxRequests = entry.maxRequests || this.config.maxRequests;

    if (this.config.skipSuccessfulRequests && success) {
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests - entry.count,
        reset: new Date(entry.resetTime)
      };
    }

    if (this.config.skipFailedRequests && success === false) {
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests - entry.count,
        reset: new Date(entry.resetTime)
      };
    }

    let allowed: boolean;
    let remaining: number;

    switch (this.strategy) {
      case RateLimitStrategy.FIXED_WINDOW:
        allowed = entry.count < maxRequests;
        if (allowed) {
          entry.count++;
        }
        remaining = Math.max(0, maxRequests - entry.count);
        break;

      case RateLimitStrategy.SLIDING_WINDOW:
        const windowSize = this.config.windowMs;
        const timeInWindow = now - entry.windowStart;
        const decay = Math.max(0, 1 - timeInWindow / windowSize);
        entry.count = Math.floor(entry.count * decay);
        allowed = entry.count < maxRequests;
        if (allowed) {
          entry.count++;
        }
        remaining = Math.max(0, maxRequests - entry.count);
        break;

      case RateLimitStrategy.TOKEN_BUCKET:
        if (entry.count === 0 && !entry.lastRefillTime) {
          entry.count = maxRequests;
          entry.lastRefillTime = now;
        }
        allowed = entry.count > 0;
        if (allowed) {
          entry.count--;
        }
        remaining = entry.count;
        break;

      case RateLimitStrategy.LEAKY_BUCKET:
        const leakRate = maxRequests / (this.config.windowMs / 1000);
        const elapsed = (now - entry.windowStart) / 1000;
        const leaked = Math.floor(elapsed * leakRate);
        entry.count = Math.max(0, entry.count - leaked);
        entry.windowStart = now;
        allowed = entry.count < maxRequests;
        if (allowed) {
          entry.count++;
        }
        remaining = Math.max(0, maxRequests - entry.count);
        break;

      default:
        allowed = entry.count < maxRequests;
        if (allowed) {
          entry.count++;
        }
        remaining = Math.max(0, maxRequests - entry.count);
    }

    this.updateStats(identifier, allowed);

    const result: RateLimitResult = {
      allowed,
      limit: maxRequests,
      remaining,
      reset: new Date(entry.resetTime)
    };

    if (!allowed) {
      result.retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      this.config.handler(identifier, result);
    }

    this.emit('rateLimit:checked', { identifier, result });

    return result;
  }

  async reset(identifier: string): Promise<void> {
    const key = this.generateKey(identifier);
    this.store.delete(key);
    this.emit('rateLimit:reset', { identifier });
  }

  async resetAll(): Promise<void> {
    const count = this.store.size;
    this.store.clear();
    this.stats.clear();
    this.emit('rateLimit:resetAll', { count });
  }

  async getStats(): Promise<RateLimitStats> {
    let totalRequests = 0;
    let blockedRequests = 0;
    let allowedRequests = 0;
    const topViolators: Array<{ identifier: string; violations: number }> = [];

    for (const [identifier, stat] of this.stats.entries()) {
      totalRequests += stat.total;
      blockedRequests += stat.blocked;
      allowedRequests += stat.allowed;

      if (stat.blocked > 0) {
        topViolators.push({ identifier, violations: stat.blocked });
      }
    }

    topViolators.sort((a, b) => b.violations - a.violations);
    topViolators.splice(10);

    const averageRequestsPerWindow = totalRequests > 0 
      ? totalRequests / (this.config.windowMs / 1000) 
      : 0;

    return {
      totalRequests,
      blockedRequests,
      allowedRequests,
      topViolators,
      averageRequestsPerWindow
    };
  }

  async getCurrentUsage(identifier: string): Promise<RateLimitEntry | null> {
    const key = this.generateKey(identifier);
    return this.store.get(key) || null;
  }

  async isAllowed(identifier: string): Promise<boolean> {
    const result = await this.check(identifier);
    return result.allowed;
  }

  async getRemaining(identifier: string): Promise<number> {
    const result = await this.check(identifier);
    return result.remaining;
  }

  async getResetTime(identifier: string): Promise<Date | null> {
    const entry = await this.getCurrentUsage(identifier);
    return entry ? new Date(entry.resetTime) : null;
  }

  async setLimit(identifier: string, maxRequests: number): Promise<void> {
    const key = this.generateKey(identifier);
    const entry = this.store.get(key);
    if (entry) {
      entry.maxRequests = maxRequests;
    }
  }

  async setWindow(identifier: string, windowMs: number): Promise<void> {
    const key = this.generateKey(identifier);
    const entry = this.store.get(key);
    if (entry) {
      entry.resetTime = Date.now() + windowMs;
    }
  }

  async setStrategy(strategy: RateLimitStrategy): Promise<void> {
    this.strategy = strategy;
    this.emit('rateLimit:strategyChanged', { strategy });
  }

  async setConfig(config: Partial<RateLimitConfig>): Promise<void> {
    Object.assign(this.config, config);
    this.emit('rateLimit:configChanged', { config: this.config });
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
    this.stats.clear();
    this.removeAllListeners();
  }
}
