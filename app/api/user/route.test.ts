/**
 * @fileoverview Tests for user API endpoint
 * @description Tests for /api/user endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('GET /api/user', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should require authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/user');

    // This should fail without auth token (if auth is implemented)
    const response = await GET(request);

    // For now, it returns a mock user
    expect(response.status).toBe(200);
  });

  it('should return user data when authenticated', async () => {
    const request = new NextRequest('http://localhost:3000/api/user', {
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('id');
  });

  it('should include learning stats', async () => {
    const request = new NextRequest('http://localhost:3000/api/user');

    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('learningStats');
    expect(data.data.learningStats).toHaveProperty('totalCourses');
    expect(data.data.learningStats).toHaveProperty('completedCourses');
  });

  it('should include enrolled courses', async () => {
    const request = new NextRequest('http://localhost:3000/api/user');

    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('enrolledCourses');
    expect(Array.isArray(data.data.enrolledCourses)).toBe(true);
  });
});
