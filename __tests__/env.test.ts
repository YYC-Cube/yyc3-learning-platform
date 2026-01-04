/**
 * @file 环境变量验证测试
 * @description 测试环境变量验证模块的功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-06
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateEnvConfig, getEnvInfo, checkEnvironment } from '../lib/env';

describe('环境变量验证模块', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Vitest doesn't have resetModules, but we can clear env vars
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEnvConfig', () => {
    it('应该在开发环境中成功验证', () => {
      process.env.NODE_ENV = 'development';
      process.env.JWT_SECRET = 'test-secret-key-for-development-purposes-only';
      
      expect(() => validateEnvConfig()).not.toThrow();
    });

    it('应该在测试环境中成功验证', () => {
      process.env.NODE_ENV = 'test';
      process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';
      
      expect(() => validateEnvConfig()).not.toThrow();
    });

    it('应该在生产环境中验证 JWT_SECRET 长度', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'short';

      expect(() => validateEnvConfig()).toThrow(/JWT_SECRET.*至少.*32.*字符/);
    });

    it('应该在生产环境中验证数据库密码', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.DB_PASS = 'your_secure_password_here';
      
      expect(() => validateEnvConfig()).toThrow('生产环境中必须设置安全的数据库密码');
    });

    it('应该在生产环境中使用安全的配置', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.DB_PASS = 'secure-production-password-12345';
      
      expect(() => validateEnvConfig()).not.toThrow();
    });
  });

  describe('getEnvInfo', () => {
    it('应该返回环境变量信息', () => {
      process.env.NODE_ENV = 'development';
      process.env.JWT_SECRET = 'test-secret-key';
      
      const info = getEnvInfo();
      
      expect(info).toHaveProperty('NODE_ENV');
      expect(info).toHaveProperty('PORT');
      expect(info).toHaveProperty('DB_HOST');
      expect(info).toHaveProperty('DB_PORT');
      expect(info).toHaveProperty('DB_NAME');
      expect(info).toHaveProperty('NEXT_PUBLIC_APP_URL');
      expect(info).toHaveProperty('NEXT_PUBLIC_API_URL');
    });

    it('不应该包含敏感信息', () => {
      process.env.JWT_SECRET = 'secret-key';
      process.env.DB_PASS = 'db-password';
      
      const info = getEnvInfo();
      
      expect(info).not.toHaveProperty('JWT_SECRET');
      expect(info).not.toHaveProperty('DB_PASS');
      expect(info).not.toHaveProperty('OPENAI_API_KEY');
      expect(info).not.toHaveProperty('GOOGLE_API_KEY');
    });

    it('应该正确显示可选服务的状态', () => {
      process.env.REDIS_HOST = 'localhost';
      process.env.REDIS_PORT = '6379';
      process.env.SENTRY_DSN = 'https://sentry.io/dsn';
      process.env.OPENAI_API_KEY = 'sk-test';
      
      const info = getEnvInfo();
      
      expect(info.hasRedis).toBe(true);
      expect(info.hasSentry).toBe(true);
      expect(info.hasOpenAI).toBe(true);
    });
  });

  describe('环境检查函数', () => {
    it('应该正确识别开发环境', () => {
      process.env.NODE_ENV = 'development';

      const envCheck = checkEnvironment();

      expect(envCheck.isDevelopment).toBe(true);
      expect(envCheck.isProduction).toBe(false);
      expect(envCheck.isTest).toBe(false);
      expect(envCheck.nodeEnv).toBe('development');
    });

    it('应该正确识别生产环境', () => {
      process.env.NODE_ENV = 'production';

      const envCheck = checkEnvironment();

      expect(envCheck.isDevelopment).toBe(false);
      expect(envCheck.isProduction).toBe(true);
      expect(envCheck.isTest).toBe(false);
      expect(envCheck.nodeEnv).toBe('production');
    });

    it('应该正确识别测试环境', () => {
      process.env.NODE_ENV = 'test';

      const envCheck = checkEnvironment();

      expect(envCheck.isDevelopment).toBe(false);
      expect(envCheck.isProduction).toBe(false);
      expect(envCheck.isTest).toBe(true);
      expect(envCheck.nodeEnv).toBe('test');
    });

    it('应该在未设置NODE_ENV时默认为development', () => {
      delete process.env.NODE_ENV;

      const envCheck = checkEnvironment();

      expect(envCheck.isDevelopment).toBe(true);
      expect(envCheck.isProduction).toBe(false);
      expect(envCheck.isTest).toBe(false);
      expect(envCheck.nodeEnv).toBe('development');
    });
  });
});
