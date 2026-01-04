/**
 * @fileoverview Tests for metrics API endpoint
 * @description Tests for /api/metrics endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock monitoring functions
vi.mock('@/lib/monitoring/metrics', () => ({
  formatPrometheusMetrics: vi.fn(() => `
# HELP system_uptime_seconds System uptime in seconds
# TYPE system_uptime_seconds gauge
system_uptime_seconds 3600
`),
  getAllMetrics: vi.fn(() => ({
    http_request_duration_ms: [
      { name: 'http_request_duration_ms', value: 100, timestamp: Date.now() },
    ],
  })),
  getAllCounters: vi.fn(() => [
    { name: 'http_requests_2xx', count: 100, timestamp: Date.now() },
  ]),
  getSystemMetrics: vi.fn(() => ({
    uptime: 3600,
    memory: { heapUsed: 12345678, heapTotal: 24680135 },
    cpu: { user: 1234567, system: 456789 },
    timestamp: Date.now(),
  })),
}));

describe('GET /api/metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return Prometheus format when Accept header is text/plain', async () => {
    const request = new Request('http://localhost:3000/api/metrics', {
      headers: { Accept: 'text/plain' },
    });

    const response = await GET(request);
    const text = await response.text();

    expect(response.headers.get('Content-Type')).toContain('text/plain');
    expect(text).toContain('system_uptime_seconds');
  });

  it('should return JSON format by default', async () => {
    const request = new Request('http://localhost:3000/api/metrics');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('system');
    expect(data).toHaveProperty('counters');
    expect(data).toHaveProperty('recentMetrics');
    expect(data).toHaveProperty('timestamp');
  });

  it('should include system metrics', async () => {
    const request = new Request('http://localhost:3000/api/metrics');

    const response = await GET(request);
    const data = await response.json();

    expect(data.system).toHaveProperty('uptime');
    expect(data.system).toHaveProperty('memory');
    expect(data.system).toHaveProperty('cpu');
  });

  it('should include security headers', async () => {
    const request = new Request('http://localhost:3000/api/metrics');

    const response = await GET(request);

    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
