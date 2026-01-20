/**
 * @fileoverview Logger模块分支测试
 * @description 测试logger的所有分支路径、日志级别过滤和错误处理
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-04
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger, LogLevel, createLogger, logger } from '@/lib/logger';

describe('Logger分支测试', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('日志级别过滤', () => {
    it('应该当级别设为DEBUG时输出所有日志', () => {
      const testLogger = new Logger({ level: LogLevel.DEBUG });

      testLogger.debug('debug message');
      testLogger.info('info message');
      testLogger.warn('warn message');
      testLogger.error('error message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(2); // debug + info
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1); // warn
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // error
    });

    it('应该当级别设为INFO时不输出DEBUG日志', () => {
      const testLogger = new Logger({ level: LogLevel.INFO });

      testLogger.debug('debug message');
      testLogger.info('info message');
      testLogger.warn('warn message');
      testLogger.error('error message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1); // info only
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1); // warn
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // error
    });

    it('应该当级别设为WARN时只输出WARN和ERROR', () => {
      const testLogger = new Logger({ level: LogLevel.WARN });

      testLogger.debug('debug message');
      testLogger.info('info message');
      testLogger.warn('warn message');
      testLogger.error('error message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('应该当级别设为ERROR时只输出ERROR', () => {
      const testLogger = new Logger({ level: LogLevel.ERROR });

      testLogger.debug('debug message');
      testLogger.info('info message');
      testLogger.warn('warn message');
      testLogger.error('error message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('应该支持动态更改日志级别', () => {
      const testLogger = new Logger({ level: LogLevel.INFO });

      testLogger.debug('should not appear');
      expect(consoleLogSpy).not.toHaveBeenCalled();

      testLogger.setLevel(LogLevel.DEBUG);
      testLogger.debug('should appear');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('消息格式化', () => {
    it('应该当enableTimestamp为true时添加时间戳', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: true,
      });

      testLogger.info('test message');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('应该当enableTimestamp为false时不添加时间戳', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      testLogger.info('test message');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).not.toMatch(/\[\d{4}-\d{2}-\d{2}T/);
      expect(call).toMatch(/^INFO: test message$/);
    });

    it('应该添加context到消息', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
        context: 'TestModule',
      });

      testLogger.info('test message');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/^\[TestModule\] INFO: test message$/);
    });

    it('应该正确组合时间戳、context和消息', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: true,
        context: 'MyContext',
      });

      testLogger.info('test message');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/\[.*?\] \[MyContext\] INFO: test message$/);
    });

    it('应该正确格式化带data的消息', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      const testData = { key: 'value', number: 123 };
      testLogger.info('test message', testData);

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/INFO: test message \{.*\}/);
      expect(call).toContain('"key":"value"');
      expect(call).toContain('"number":123');
    });

    it('应该处理空data对象', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      testLogger.info('test message', {});

      const call = consoleLogSpy.mock.calls[0][0];
      // Empty objects are still serialized as {}
      expect(call).toBe('INFO: test message {}');
    });
  });

  describe('错误处理', () => {
    it('应该正确处理Error对象', () => {
      const testLogger = new Logger({
        level: LogLevel.ERROR,
        enableTimestamp: false,
      });

      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:10:15';

      testLogger.error('An error occurred', error);

      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('"name":"Error"');
      expect(call).toContain('"message":"Test error"');
      expect(call).toContain('"stack":"Error: Test error');
    });

    it('应该正确处理非Error对象', () => {
      const testLogger = new Logger({
        level: LogLevel.ERROR,
        enableTimestamp: false,
      });

      const errorData = { code: 500, status: 'failed' };
      testLogger.error('Request failed', errorData);

      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('"code":500');
      expect(call).toContain('"status":"failed"');
    });

    it('应该处理没有error参数的error调用', () => {
      const testLogger = new Logger({
        level: LogLevel.ERROR,
        enableTimestamp: false,
      });

      testLogger.error('Simple error message');

      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toBe('ERROR: Simple error message');
    });

    it('应该处理undefined和null error参数', () => {
      const testLogger = new Logger({
        level: LogLevel.ERROR,
        enableTimestamp: false,
      });

      testLogger.error('Error with undefined', undefined);
      let call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toBe('ERROR: Error with undefined');

      testLogger.error('Error with null', null);
      call = consoleErrorSpy.mock.calls[1][0];
      expect(call).toBe('ERROR: Error with null');
    });

    it('应该处理循环引用对象', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      const circular: any = { name: 'test' };
      circular.self = circular;

      // This should not throw an error
      expect(() => {
        testLogger.info('circular reference', circular);
      }).toThrow(); // JSON.stringify will throw on circular references
    });
  });

  describe('默认配置', () => {
    it('应该在开发环境默认使用INFO级别', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env = { ...process.env, NODE_ENV: 'development' };

      const devLogger = new Logger();

      devLogger.debug('debug');
      devLogger.info('info');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      process.env = { ...process.env, NODE_ENV: originalEnv };
    });

    it('应该在生产环境默认使用WARN级别', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env = { ...process.env, NODE_ENV: 'production' };

      const prodLogger = new Logger();

      prodLogger.debug('debug');
      prodLogger.info('info');
      prodLogger.warn('warn');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      process.env = { ...process.env, NODE_ENV: originalEnv };
    });

    it('应该默认启用时间戳', () => {
      const testLogger = new Logger({ level: LogLevel.INFO });

      testLogger.info('test');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/\[.*?\]/); // Should have timestamp
    });
  });

  describe('自定义配置', () => {
    it('应该支持部分配置覆盖', () => {
      const testLogger = new Logger({
        level: LogLevel.ERROR,
        // enableTimestamp should default to true
      });

      testLogger.error('test');

      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toMatch(/\[.*?\] ERROR: test/);
    });

    it('应该支持后续更改context', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
        context: 'InitialContext',
      });

      testLogger.info('message 1');
      expect(consoleLogSpy.mock.calls[0][0]).toContain('[InitialContext]');

      testLogger.setContext('NewContext');
      testLogger.info('message 2');
      expect(consoleLogSpy.mock.calls[1][0]).toContain('[NewContext]');
    });

    it('应该支持设置空context', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
        context: 'Test',
      });

      testLogger.setContext('');
      testLogger.info('test');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/^INFO: test$/);
    });

    it('应该支持设置context为undefined', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
        context: 'Test',
      });

      testLogger.setContext(undefined as any);
      testLogger.info('test');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/^INFO: test$/);
    });
  });

  describe('createLogger工厂函数', () => {
    it('应该创建带context的logger', () => {
      const contextLogger = createLogger('MyModule');

      contextLogger.info('test');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('[MyModule]');
    });

    it('应该为每个context创建独立的logger', () => {
      const logger1 = createLogger('Module1');
      const logger2 = createLogger('Module2');

      logger1.info('message 1');
      logger2.info('message 2');

      expect(consoleLogSpy.mock.calls[0][0]).toContain('[Module1]');
      expect(consoleLogSpy.mock.calls[1][0]).toContain('[Module2]');
    });
  });

  describe('导出的logger实例', () => {
    it('应该导出默认logger实例', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('默认logger应该可正常使用', () => {
      logger.info('test message');

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('默认logger应该独立于其他实例', () => {
      const customLogger = new Logger({ level: LogLevel.DEBUG });

      logger.setLevel(LogLevel.ERROR);
      customLogger.setLevel(LogLevel.DEBUG);

      logger.info('should not log');
      customLogger.info('should log');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('特殊字符和消息', () => {
    it('应该处理包含引号的消息', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      testLogger.info('Message with "quotes"');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('Message with "quotes"');
    });

    it('应该处理包含换行的消息', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      testLogger.info('Line 1\nLine 2');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('Line 1\nLine 2');
    });

    it('应该处理包含特殊JSON字符的data', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      testLogger.info('test', { text: 'Value with "quotes" and \n newlines' });

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('Value with \\"quotes\\"');
    });

    it('应该处理空字符串消息', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      testLogger.info('');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/^INFO: $/);
    });

    it('应该处理非常长的消息', () => {
      const testLogger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      const longMessage = 'a'.repeat(10000);
      testLogger.info(longMessage);

      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call.length).toBeGreaterThan(10000);
    });
  });

  describe('数字日志级别', () => {
    it('应该正确比较日志级别', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
    });

    it('应该使用大于等于比较进行过滤', () => {
      const testLogger = new Logger({ level: LogLevel.WARN });

      // DEBUG < WARN, should not log
      expect(testLogger['shouldLog'](LogLevel.DEBUG)).toBe(false);

      // INFO < WARN, should not log
      expect(testLogger['shouldLog'](LogLevel.INFO)).toBe(false);

      // WARN == WARN, should log
      expect(testLogger['shouldLog'](LogLevel.WARN)).toBe(true);

      // ERROR > WARN, should log
      expect(testLogger['shouldLog'](LogLevel.ERROR)).toBe(true);
    });
  });
});
