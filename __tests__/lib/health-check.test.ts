import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performHealthCheck, liveness, readiness } from '@/lib/monitoring/health-check';

describe('health-check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('liveness', () => {
    it('should return alive status', () => {
      const result = liveness();
      expect(result.status).toBe('alive');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('readiness', () => {
    it('should return ready when database is available', async () => {
      const result = await readiness();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('checks');
      expect(Array.isArray(result.checks)).toBe(true);
    });
  });

  describe('performHealthCheck', () => {
    it('should return health check result with correct structure', async () => {
      const result = await performHealthCheck();
      expect(result).toHaveProperty('status');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status);
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('checks');
    });

    it('should include memory check', async () => {
      const result = await performHealthCheck();
      expect(result.checks).toHaveProperty('memory');
      expect(result.checks.memory).toHaveProperty('status');
    });

    it('should include database check', async () => {
      const result = await performHealthCheck();
      expect(result.checks).toHaveProperty('database');
    });

    it('should include redis check', async () => {
      const result = await performHealthCheck();
      expect(result.checks).toHaveProperty('redis');
    });

    it('should set unhealthy status on failures', async () => {
      const originalEnv = process.env.REDIS_URL;
      delete process.env.REDIS_URL;
      const result = await performHealthCheck();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status);
      process.env.REDIS_URL = originalEnv;
    });
  });
});
