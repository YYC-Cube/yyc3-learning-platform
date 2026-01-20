/**
 * @fileoverview Tests for courses API endpoint
 * @description Tests for /api/courses endpoint
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

describe('GET /api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of courses', async () => {
    const request = new NextRequest('http://localhost:3000/api/courses');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data.courses)).toBe(true);
    expect(data.data.courses.length).toBeGreaterThan(0);
    expect(data.message).toBe("课程列表获取成功");
  });

  it('should return courses with required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/courses');
    const response = await GET(request);
    const data = await response.json();

    const firstCourse = data.data.courses[0];
    expect(firstCourse).toHaveProperty('id');
    expect(firstCourse).toHaveProperty('title');
    expect(firstCourse).toHaveProperty('description');
    expect(firstCourse).toHaveProperty('category');
    expect(firstCourse).toHaveProperty('difficulty');
  });

  it('should support category filtering via query params', async () => {
    const request = new NextRequest('http://localhost:3000/api/courses?category=ai-basics');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.courses.every(c => c.category === 'ai-basics')).toBe(true);
  });

  it('should support pagination', async () => {
    const request = new NextRequest('http://localhost:3000/api/courses?limit=2&offset=0');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.courses.length).toBeLessThanOrEqual(2);
    expect(data.data.pagination).toBeDefined();
    expect(data.data.pagination.total).toBeGreaterThan(0);
  });

  it('should include proper headers', async () => {
    const request = new Request('http://localhost:3000/api/courses');
    const response = await GET(request);

    expect(response.headers.get('Content-Type')).toContain('application/json');
  });

  it('should return correct response structure', async () => {
    const request = new Request('http://localhost:3000/api/courses');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('message');
    expect(data.data).toHaveProperty('courses');
    expect(data.data).toHaveProperty('pagination');
  });

  it('should handle error gracefully when request is invalid', async () => {
    // Create an invalid request
    const request = new Request('http://localhost:3000/api/courses?limit=invalid');

    // The API should handle this gracefully
    const response = await GET(request);
    const data = await response.json();

    // Should still return a valid response structure
    expect(data).toBeDefined();
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(500);
  });
});
