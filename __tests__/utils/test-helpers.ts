/**
 * 测试辅助工具函数
 * 提供常用的测试工具方法
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';

/**
 * 自定义渲染函数，包含默认的Providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // TODO: 添加必要的Providers (Theme, Auth等)
  return render(ui, options);
}

/**
 * 等待异步操作完成
 */
export async function wait(ms: number = 0): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 等待条件满足
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    await wait(interval);
  }
}

/**
 * Mock localStorage
 */
export function createMockLocalStorage() {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

/**
 * 创建Mock API响应
 */
export function createMockResponse<T>(data: T, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    data,
  };
}

/**
 * Mock Fetch API
 */
export function mockFetch(response: any, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
    headers: new Headers(),
    redirected: false,
    statusText: status === 200 ? 'OK' : 'Error',
    type: 'basic' as ResponseType,
    url: 'http://localhost',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    text: vi.fn(),
  } as unknown as Response);
}

/**
 * 生成随机测试数据
 */
export const testDataGenerator = {
  user: (overrides = {}) => ({
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'student',
    ...overrides,
  }),

  course: (overrides = {}) => ({
    id: 'course-1',
    title: 'Test Course',
    description: 'Test Description',
    instructor: 'Test Instructor',
    duration: 60,
    ...overrides,
  }),

  exam: (overrides = {}) => ({
    id: 'exam-1',
    title: 'Test Exam',
    duration: 60,
    totalQuestions: 10,
    passingScore: 60,
    ...overrides,
  }),

  question: (overrides = {}) => ({
    id: 'q-1',
    type: 'single-choice',
    text: 'Test Question',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    points: 10,
    ...overrides,
  }),
};

/**
 * 清理所有Mocks
 */
export function clearAllMocks() {
  vi.clearAllMocks();
  vi.resetAllMocks();
}
