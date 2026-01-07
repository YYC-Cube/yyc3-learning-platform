/**
 * @file 客户端错误处理模块
 * @description 客户端安全的错误处理功能
 * @module error-handler.client
 * @author YYC³
 * @version 1.0.0
 */

import { logger } from "./logger";

/**
 * 客户端安全的错误记录函数
 */
export function logError(
  message: string,
  error?: Error | unknown,
  context?: Record<string, any>
): void {
  logger.error(message, {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context
  });
}

/**
 * 获取用户友好的错误消息
 */
export function getUserMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return '发生了未知错误，请稍后重试';
}

/**
 * 判断是否为网络错误
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'TypeError' ||
      error.message.includes('Network request failed') ||
      error.message.includes('fetch')
    );
  }
  return false;
}
