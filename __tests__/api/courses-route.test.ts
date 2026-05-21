/**
 * @fileoverview API路由测试 · courses-route.test.ts
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
import { GET, POST } from '@/app/api/courses/route';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3200'), options);
}

describe('GET /api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all courses with default pagination', async () => {
    const request = createRequest('/api/courses');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.courses).toBeDefined();
    expect(data.data.courses.length).toBeGreaterThan(0);
    expect(data.data.pagination).toBeDefined();
    expect(data.data.pagination.total).toBeGreaterThan(0);
  });

  it('should filter courses by category', async () => {
    const request = createRequest('/api/courses?category=基础理论');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.courses.length).toBeGreaterThan(0);
    data.data.courses.forEach((course: { category: string }) => {
      expect(course.category).toBe('基础理论');
    });
  });

  it('should return all courses when category is "all"', async () => {
    const request = createRequest('/api/courses?category=all');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.courses.length).toBeGreaterThan(0);
  });

  it('should filter courses by difficulty', async () => {
    const request = createRequest('/api/courses?difficulty=初级');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    data.data.courses.forEach((course: { difficulty: string }) => {
      expect(course.difficulty).toBe('初级');
    });
  });

  it('should return all courses when difficulty is "all"', async () => {
    const request = createRequest('/api/courses?difficulty=all');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.courses.length).toBeGreaterThan(0);
  });

  it('should search courses by title', async () => {
    const request = createRequest('/api/courses?search=AI');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.courses.length).toBeGreaterThan(0);
    const hasMatch = data.data.courses.some(
      (course: { title: string; description: string; tags: string[] }) =>
        course.title.toLowerCase().includes('ai') ||
        course.description.toLowerCase().includes('ai') ||
        course.tags.some((tag: string) => tag.toLowerCase().includes('ai'))
    );
    expect(hasMatch).toBe(true);
  });

  it('should search courses by description', async () => {
    const request = createRequest('/api/courses?search=伦理');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.courses.length).toBeGreaterThan(0);
  });

  it('should search courses by tags', async () => {
    const request = createRequest('/api/courses?search=深度学习');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should respect limit and offset for pagination', async () => {
    const request = createRequest('/api/courses?limit=2&offset=0');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.courses.length).toBeLessThanOrEqual(2);
    expect(data.data.pagination.limit).toBe(2);
    expect(data.data.pagination.offset).toBe(0);
  });

  it('should indicate hasMore when more courses exist', async () => {
    const request = createRequest('/api/courses?limit=1&offset=0');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.pagination.hasMore).toBe(true);
  });

  it('should handle combined filters', async () => {
    const request = createRequest('/api/courses?category=基础理论&difficulty=初级&search=AI');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return empty array for non-matching search', async () => {
    const request = createRequest('/api/courses?search=nonexistentcourse12345');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.courses.length).toBe(0);
  });

  it('should handle GET error gracefully', async () => {
    const request = createRequest('/api/courses');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const originalNextResponseJson = NextResponse.json;
    let callCount = 0;
    vi.spyOn(NextResponse, 'json').mockImplementation((body: unknown, init?: ResponseInit) => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Response error');
      }
      return originalNextResponseJson(body, init);
    });

    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('服务器内部错误');

    consoleSpy.mockRestore();
    vi.restoreAllMocks();
  });
});

describe('POST /api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new course successfully', async () => {
    const body = {
      title: '测试课程',
      description: '这是一个测试课程',
      category: 'test',
      difficulty: 'beginner',
      duration: '2小时',
      price: 99,
      tags: ['测试'],
      instructor: '测试讲师',
    };

    const request = createRequest('/api/courses', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('测试课程');
    expect(data.data.category).toBe('test');
    expect(data.data.price).toBe(99);
    expect(data.data.createdAt).toBeDefined();
  });

  it('should return 400 when required field is missing', async () => {
    const body = {
      title: '不完整课程',
    };

    const request = createRequest('/api/courses', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('缺少必填字段');
  });

  it('should return 400 when title is empty', async () => {
    const body = {
      title: '',
      description: '描述',
      category: 'test',
      difficulty: 'beginner',
      duration: '1小时',
      price: 0,
    };

    const request = createRequest('/api/courses', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should use default values for optional fields', async () => {
    const body = {
      title: '默认值课程',
      description: '测试默认值',
      category: 'test',
      difficulty: 'advanced',
      duration: '3小时',
      price: 199,
    };

    const request = createRequest('/api/courses', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.chapters).toBe(10);
    expect(data.data.rating).toBe(0);
    expect(data.data.studentsCount).toBe(0);
    expect(data.data.tags).toEqual([]);
    expect(data.data.instructor).toBe('系统管理员');
    expect(data.data.image).toBe('/images/default-course.png');
  });

  it('should handle POST error gracefully', async () => {
    const request = createRequest('/api/courses', {
      method: 'POST',
      body: 'invalid json{{{',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('服务器内部错误');
  });

  it('should generate course ID from title', async () => {
    const body = {
      title: 'My New AI Course',
      description: '测试ID生成',
      category: 'test',
      difficulty: 'intermediate',
      duration: '4小时',
      price: 299,
    };

    const request = createRequest('/api/courses', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.id).toBeDefined();
    expect(typeof data.data.id).toBe('string');
  });
});
