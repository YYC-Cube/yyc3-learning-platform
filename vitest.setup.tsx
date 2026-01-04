/**
 * Vitest 全局设置文件
 * 在所有测试运行前执行
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { vi, afterEach, expect } from 'vitest'
import type { MockLocalStorage, MockFetchResponse, MockNextImageProps } from './__tests__/types/test-types'

// ============================================
// 类型声明
// ============================================

declare global {
  interface Window {
    localStorage: MockLocalStorage
  }

  // Extend Vitest's test context type
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    interface TestContext {
      mockUser: {
        id: string
        email: string
        name: string
        role: string
      }
    }
  }
}

// ============================================
// 测试配置
// ============================================

// 每个测试后自动清理
afterEach(() => {
  cleanup()
})

// 设置测试超时
vi.setConfig({
  testTimeout: process.env.CI ? 10000 : 5000,
  hookTimeout: 10000,
})

// ============================================
// Next.js 全局 Mocks
// ============================================

// 全局Mock: Next.js路由
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// 全局Mock: Next.js图片
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    priority,
    ...props
  }: MockNextImageProps) => {
    // Using img tag for mock - Image component is not available in test environment
    /* eslint-disable */
    return (
      <img
        src={typeof src === 'string' ? src : src.src}
        alt={alt}
        width={width}
        height={height}
        {...props}
      />
    )
    /* eslint-enable */
  },
}))

// 全局Mock: next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
    systemTheme: 'light',
    resolvedTheme: 'light',
  })),
}))

// ============================================
// 环境变量设置
// ============================================

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/api'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
// eslint-disable-next-line @typescript-eslint/naming-convention
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only' // cspell:disable-line
process.env.NEXTAUTH_URL = 'http://localhost:3000' // cspell:disable-line
process.env.JWT_SECRET = 'test-jwt-secret-key-32-characters-long'

// Set NODE_ENV to test (cast to allow assignment to read-only property)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(process.env as any).NODE_ENV = 'test'

// ============================================
// 全局测试工具函数
// ============================================

global.testUtils = {
  /**
   * 等待异步操作完成
   */
  async wait(ms: number = 0): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms))
  },

  /**
   * 等待条件满足
   */
  async waitFor(
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now()
    while (!condition()) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for condition')
      }
      await this.wait(interval)
    }
  },

  /**
   * 创建Mock响应
   */
  createMockResponse<T = unknown>(data: T, status = 200): MockFetchResponse {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data),
      headers: {
        get: (name: string) => {
          const headers: Record<string, string> = {
            'content-type': 'application/json',
          }
          return headers[name.toLowerCase()] || null
        },
      },
    }
  },

  /**
   * Mock API请求
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockApi<T = unknown>(endpoint: string, response: T): void {
    // Cast to any to avoid type conflicts with Bun's extended fetch interface
    global.fetch = vi.fn().mockResolvedValue(this.createMockResponse(response)) as any
  },

  /**
   * 重置所有 mocks
   */
  resetAllMocks(): void {
    vi.clearAllMocks()
    vi.resetAllMocks()
  },
}

// ============================================
// localStorage Mock
// ============================================

const createLocalStorageMock = (): MockLocalStorage => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string): string | null => {
      return store[key] ?? null
    },
    setItem: (key: string, value: string): void => {
      store[key] = value.toString()
    },
    clear: (): void => {
      store = {}
    },
    removeItem: (key: string): void => {
      delete store[key]
    },
    get length(): number {
      return Object.keys(store).length
    },
    key: (index: number): string | null => {
      return Object.keys(store)[index] ?? null
    },
  }
}

// 设置全局 localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: createLocalStorageMock(),
  writable: true,
})

// ============================================
// 控制台输出优化
// ============================================

if (process.env.NODE_ENV === 'test') {
  // 只在测试失败时输出console.error
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    const hasErrorOrWarning = args.some((arg) => {
      if (typeof arg === 'string') {
        return arg.includes('Warning:') || arg.includes('Error:')
      }
      if (arg instanceof Error) {
        return true
      }
      return false
    })
    if (hasErrorOrWarning) {
      originalError(...args)
    }
  }

  // 减少 console.log 的噪音
  const originalLog = console.log
  console.log = (...args: unknown[]) => {
    const hasImportantMessage = args.some((arg) => {
      if (typeof arg === 'string') {
        return arg.includes('✅') || arg.includes('❌') || arg.includes('⚠️')
      }
      return false
    })
    if (hasImportantMessage) {
      originalLog(...args)
    }
  }
}

// ============================================
// 自定义 matchers
// ============================================

expect.extend({
  toBeValidHttpResponse(received: MockFetchResponse) {
    const pass = received.ok && typeof received.status === 'number'
    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to be valid`
          : `Expected response to have ok status and valid status code`,
    }
  },

  toHaveValidPagination(received: { page?: number; limit?: number; total?: number }) {
    const pass =
      typeof received.page === 'number' &&
      typeof received.limit === 'number' &&
      typeof received.total === 'number'

    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to have valid pagination`
          : `Expected response to have page, limit, and total properties`,
    }
  },
})

console.log('✅ Vitest setup completed')
