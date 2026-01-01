/**
 * @file 错误处理模块
 * @description 提供自定义错误类和API错误处理功能
 * @module error-handler
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { NextResponse } from "next/server"
import { logger } from "./logger"

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * 应用程序错误基类
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public metadata?: Record<string, any>,
  ) {
    super(message)
    this.name = "AppError"
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, any>
  ) {
    super(400, message, code, ErrorType.VALIDATION, metadata)
    this.name = "ValidationError"
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * 认证错误类
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, any>
  ) {
    super(401, message, code, ErrorType.AUTHENTICATION, metadata)
    this.name = "AuthenticationError"
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

/**
 * 授权错误类
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, any>
  ) {
    super(403, message, code, ErrorType.AUTHORIZATION, metadata)
    this.name = "AuthorizationError"
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }
}

/**
 * 未找到错误类
 */
export class NotFoundError extends AppError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, any>
  ) {
    super(404, message, code, ErrorType.NOT_FOUND, metadata)
    this.name = "NotFoundError"
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * 数据库错误类
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, any>
  ) {
    super(500, message, code, ErrorType.DATABASE, metadata)
    this.name = "DatabaseError"
    Object.setPrototypeOf(this, DatabaseError.prototype)
  }
}

/**
 * 外部API错误类
 */
export class ExternalApiError extends AppError {
  constructor(
    message: string,
    statusCode: number = 502,
    code?: string,
    metadata?: Record<string, any>
  ) {
    super(statusCode, message, code, ErrorType.EXTERNAL_API, metadata)
    this.name = "ExternalApiError"
    Object.setPrototypeOf(this, ExternalApiError.prototype)
  }
}

/**
 * 限流错误类
 */
export class RateLimitError extends AppError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, any>
  ) {
    super(429, message, code, ErrorType.RATE_LIMIT, metadata)
    this.name = "RateLimitError"
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

/**
 * 错误日志记录函数
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...(error instanceof AppError && {
        statusCode: error.statusCode,
        code: error.code,
        type: error.type,
        metadata: error.metadata
      })
    },
    context
  }
  
  logger.error("Error logged", logData)
}

/**
 * API错误处理函数
 */
export function handleApiError(error: unknown): NextResponse {
  logError(error, { context: "API" })

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        type: error.type,
        ...(error.metadata && { metadata: error.metadata })
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === "development" ? error.message : "服务器内部错误",
        type: ErrorType.UNKNOWN
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: "服务器内部错误",
      type: ErrorType.UNKNOWN
    },
    { status: 500 }
  )
}

/**
 * 创建API响应函数
 */
export function createApiResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  )
}