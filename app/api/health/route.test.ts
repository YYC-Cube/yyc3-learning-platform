/**
 * @fileoverview Tests for health check API endpoint
 * @description Tests for /api/health endpoint
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';

// Mock the health check functions
vi.mock('@/lib/monitoring/health-check', () => ({
  performHealthCheck: vi.fn(() => Promise.resolve({
    status: 'healthy',
    timestamp: '2026-01-03T10:00:00.000Z',
    uptime: 3600,
    checks: {
      database: { status: 'pass', responseTime: 10 },
      memory: { status: 'pass' },
    },
  })),
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return health status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('checks');
  });

  it('should include security headers', async () => {
    const response = await GET();

    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
  });

  it('should return 503 when unhealthy', async () => {
    const { performHealthCheck } = await import('@/lib/monitoring/health-check');
    vi.mocked(performHealthCheck).mockResolvedValueOnce({
      status: 'unhealthy',
      timestamp: '2026-01-03T10:00:00.000Z',
      uptime: 3600,
      checks: {
        database: { status: 'fail', responseTime: 5000, message: 'Connection failed' },
      },
    });

    const response = await GET();
    expect(response.status).toBe(503);

    const data = await response.json();
    expect(data.status).toBe('unhealthy');
  });
});
