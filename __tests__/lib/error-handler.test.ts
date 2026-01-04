/**
 * @file 错误处理模块测试
 * @description 测试error-handler.ts中的自定义错误类和错误处理函数
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-19
 * @updated 2025-12-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AppError, ValidationError, AuthenticationError, AuthorizationError,
  NotFoundError, DatabaseError, ExternalApiError, RateLimitError,
  ErrorType, logError, handleApiError, createApiResponse
} from '@/lib/error-handler';

describe('错误处理模块', () => {
  // 清除控制台错误
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('自定义错误类', () => {
    it('应该创建正确的AppError实例', () => {
      const error = new AppError(500, '测试错误', 'TEST_ERROR', ErrorType.SERVER, { test: 'data' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('测试错误');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.type).toBe(ErrorType.SERVER);
      expect(error.metadata).toEqual({ test: 'data' });
      expect(error.name).toBe('AppError');
    });

    it('应该创建正确的ValidationError实例', () => {
      const error = new ValidationError('验证失败', 'VALIDATION_ERROR', { field: 'username' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('验证失败');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.metadata).toEqual({ field: 'username' });
      expect(error.name).toBe('ValidationError');
    });

    it('应该创建正确的AuthenticationError实例', () => {
      const error = new AuthenticationError('认证失败', 'AUTH_ERROR');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('认证失败');
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.type).toBe(ErrorType.AUTHENTICATION);
      expect(error.name).toBe('AuthenticationError');
    });

    it('应该创建正确的AuthorizationError实例', () => {
      const error = new AuthorizationError('授权失败', 'AUTHZ_ERROR');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(AuthorizationError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('授权失败');
      expect(error.code).toBe('AUTHZ_ERROR');
      expect(error.type).toBe(ErrorType.AUTHORIZATION);
      expect(error.name).toBe('AuthorizationError');
    });

    it('应该创建正确的NotFoundError实例', () => {
      const error = new NotFoundError('资源不存在', 'NOT_FOUND');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('资源不存在');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.name).toBe('NotFoundError');
    });

    it('应该创建正确的DatabaseError实例', () => {
      const error = new DatabaseError('数据库错误', 'DB_ERROR', { query: 'SELECT * FROM users' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('数据库错误');
      expect(error.code).toBe('DB_ERROR');
      expect(error.type).toBe(ErrorType.DATABASE);
      expect(error.metadata).toEqual({ query: 'SELECT * FROM users' });
      expect(error.name).toBe('DatabaseError');
    });

    it('应该创建正确的ExternalApiError实例', () => {
      const error = new ExternalApiError('外部API错误', 503, 'EXT_API_ERROR');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ExternalApiError);
      expect(error.statusCode).toBe(503);
      expect(error.message).toBe('外部API错误');
      expect(error.code).toBe('EXT_API_ERROR');
      expect(error.type).toBe(ErrorType.EXTERNAL_API);
      expect(error.name).toBe('ExternalApiError');
    });

    it('应该创建正确的RateLimitError实例', () => {
      const error = new RateLimitError('请求过多', 'RATE_LIMIT', { retryAfter: '60s' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('请求过多');
      expect(error.code).toBe('RATE_LIMIT');
      expect(error.type).toBe(ErrorType.RATE_LIMIT);
      expect(error.metadata).toEqual({ retryAfter: '60s' });
      expect(error.name).toBe('RateLimitError');
    });
  });

  describe('logError函数', () => {
    it('应该正确记录普通错误', () => {
      const error = new Error('普通错误');
      const context = { module: 'test' };
      
      logError(error, context);
      
      expect(console.error).toHaveBeenCalled();
    });

    it('应该正确记录AppError错误', () => {
      const error = new AppError(500, '应用错误', 'APP_ERROR', ErrorType.SERVER);
      const context = { module: 'test' };
      
      logError(error, context);
      
      expect(console.error).toHaveBeenCalled();
    });

    it('应该正确记录非Error类型错误', () => {
      const error = '字符串错误';
      const context = { module: 'test' };
      
      logError(error, context);
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('createApiResponse函数', () => {
    it('应该创建正确的成功响应', () => {
      const data = { key: 'value' };
      const response = createApiResponse(data, 201);
      
      expect(response).toBeInstanceOf(Response);
    });

    it('应该使用默认状态码200', () => {
      const data = { key: 'value' };
      const response = createApiResponse(data);
      
      expect(response).toBeInstanceOf(Response);
    });
  });

  describe('handleApiError函数', () => {
    it('应该正确处理AppError错误', () => {
      const error = new ValidationError('验证失败', 'VALIDATION_ERROR', { field: 'username' });
      const response = handleApiError(error);
      
      expect(response).toBeInstanceOf(Response);
      expect(console.error).toHaveBeenCalled();
    });

    it('应该正确处理普通Error错误', () => {
      const error = new Error('普通错误');
      const response = handleApiError(error);
      
      expect(response).toBeInstanceOf(Response);
      expect(console.error).toHaveBeenCalled();
    });

    it('应该正确处理非Error类型错误', () => {
      const error = '字符串错误';
      const response = handleApiError(error);
      
      expect(response).toBeInstanceOf(Response);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
