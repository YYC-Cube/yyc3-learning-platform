/**
 * @fileoverview 测试相关类型定义
 * @description 为测试文件提供统一的类型定义，避免使用 any
 */

import { ReactNode, ComponentType } from 'react'
import { ImageProps } from 'next/image'
import { vi } from 'vitest'

// ============================================
// 组件 Props 类型
// ============================================

export interface ResponsiveLayoutProps {
  children: ReactNode
  title?: string
  user: {
    name: string
    avatar?: string
    level?: string
  }
}

export interface BrandHeaderProps {
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
}

export interface BottomNavProps {
  currentPath?: string
}

export interface ExamQuestionProps {
  question: {
    id: number | string
    type: 'single' | 'multiple' | 'essay' | 'boolean'
    content: string
    options?: string[]
    points?: number
  }
  answer: string | string[] | null
  onAnswerChange: (answer: string | string[]) => void
}

export interface EnhancedExamLayoutProps {
  exam: {
    id: string
    title: string
    duration: number
    totalPoints: number
  }
  questions: ExamQuestionProps['question'][]
  currentQuestionIndex: number
  userAnswers: Record<string, string | string[] | null>
  onAnswerChange: (questionIndex: number, answer: string | string[]) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  timeRemaining: number
}

export interface ExamResultAnalysisProps {
  results: {
    score: number
    totalPoints: number
    passed: boolean
    timeSpent: number
    questionResults: QuestionResult[]
  }
  questions: ExamQuestionProps['question'][]
  onRetry?: () => void
}

export interface QuestionResult {
  question: ExamQuestionProps['question']
  userAnswer: string | string[] | null
  correctAnswer: string | string[] | null
  isCorrect: boolean
  points: number
}

// ============================================
// Next.js 组件 Mock 类型
// ============================================

export interface MockNextImageProps extends Partial<Omit<ImageProps, 'src'>> {
  src: string | { src: string }
  alt: string
  priority?: boolean
}

export interface MockNextLinkProps {
  children: ReactNode
  href: string
  onClick?: (e: React.MouseEvent) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  className?: string
  'aria-current'?: string
  'aria-label'?: string
  [key: string]: unknown
}

export interface MockNextRouter {
  push: (href: string) => void
  replace: (href: string) => void
  prefetch: (href: string) => void
  back: () => void
  forward: () => void
  refresh: () => void
}

// ============================================
// 测试 Mock 类型
// ============================================

export interface MockLocalStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  clear: () => void
  removeItem: (key: string) => void
  length?: number
  key?: (index: number) => string | null
}

export interface MockFetchResponse {
  json: () => Promise<unknown>
  text: () => Promise<string>
  status: number
  ok: boolean
  headers: {
    get: (name: string) => string | null
  }
}

export interface MockLogger {
  info: (message: string, data?: unknown) => void
  error: (message: string, error?: Error) => void
  warn: (message: string, data?: unknown) => void
  debug: (message: string, data?: unknown) => void
}

// ============================================
// 数据库 Mock 类型
// ============================================

export interface MockPoolClient {
  query: ReturnType<typeof vi.fn>
  release: ReturnType<typeof vi.fn>
  connect: ReturnType<typeof vi.fn>
}

export interface MockPool {
  connect: ReturnType<typeof vi.fn>
  end: ReturnType<typeof vi.fn>
  query?: ReturnType<typeof vi.fn>
}

// ============================================
// API 测试类型
// ============================================

export interface ApiRequestContext {
  request: Request
  params?: Record<string, string>
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface MockApiCall {
  method: string
  endpoint: string
  body?: unknown
  headers?: Record<string, string>
}

// ============================================
// JWT 和认证类型
// ============================================

export interface JWTPayload {
  id: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface TokenUserInfo {
  id: number | string
  email: string
  role: string
}

// ============================================
// 环境变量类型
// ============================================

export interface TestEnvConfig {
  NODE_ENV: 'development' | 'production' | 'test'
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  BCRYPT_ROUNDS: number
  DB_HOST: string
  DB_PORT: string
  DB_USER: string
  DB_PASS: string
  DB_NAME: string
  DB_SSL: string
  DB_CONNECTION_LIMIT: string
  DB_IDLE_TIMEOUT: string
  DB_MAX_LIFETIME: string
}

// ============================================
// 用户数据类型
// ============================================

export interface MockUser {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'student' | 'teacher' | 'admin'
  level?: string
  learningStats?: {
    totalCourses: number
    completedCourses: number
    totalPoints: number
    streak: number
  }
  enrolledCourses?: Array<{
    id: string
    title: string
    progress: number
  }>
}

// ============================================
// 类型守卫
// ============================================

export function isMockError(obj: unknown): obj is Error {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    typeof (obj as Error).message === 'string'
  )
}

export function isMockFetchResponse(obj: unknown): obj is MockFetchResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'json' in obj &&
    'status' in obj &&
    'ok' in obj
  )
}

// ============================================
// Mock 工厂函数类型
// ============================================

export type MockFactory<T> = () => Mocked<T>

export type Mocked<T> = {
  [P in keyof T]: T[P] extends (...args: infer A) => infer R
    ? ReturnType<typeof vi.fn> & ((...args: A) => R)
    : T[P]
} & {
  _isMock: true
}

// ============================================
// Vitest 扩展类型
// ============================================

declare module 'vitest' {
  export interface Matchers<R, T = any> {
    toBeValidHttpResponse(): R
    toHaveValidPagination(): R
    toBeAuthenticated(): R
  }
}
