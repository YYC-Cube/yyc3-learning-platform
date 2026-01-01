/**
 * @fileoverview 数据库连接模块单元测试
 * @description 测试数据库连接池、查询执行和事务管理功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-03-17
 * @modified 2025-03-17
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { getPool, query, transaction, testConnection, closePool } from '@/lib/database';
import { env } from '@/lib/env';

// Mock the env module
jest.mock('@/lib/env', () => ({
  env: {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USER: 'testuser',
    DB_PASS: 'testpass',
    DB_NAME: 'testdb',
    DB_SSL: 'false',
    DB_CONNECTION_LIMIT: '5',
    DB_IDLE_TIMEOUT: '30000',
    DB_MAX_LIFETIME: '600000'
  },
  DB_PORT: 5432,
  DB_CONNECTION_LIMIT: 5,
  DB_IDLE_TIMEOUT: 30000,
  DB_MAX_LIFETIME: 600000,
  DB_SSL: false
}));

// Mock the pg library
const mockClient = {
  query: jest.fn().mockResolvedValue({ rows: [{ id: 1, name: 'Test' }] }),
  release: jest.fn().mockResolvedValue(undefined),
  connect: jest.fn().mockResolvedValue(undefined)
};

const mockPool = {
  connect: jest.fn().mockResolvedValue(mockClient),
  end: jest.fn().mockResolvedValue(undefined)
};

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => mockPool),
  PoolClient: jest.fn(),
  QueryResult: jest.fn().mockImplementation(() => ({ rows: [] }))
}));

// 辅助函数：获取当前mock的client
function getMockClient() {
  return mockClient;
}

describe('Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 确保每个测试都有干净的mock状态
    const mockClient = getMockClient();
    mockClient.query.mockResolvedValue({ rows: [{ id: 1, name: 'Test' }] });
    mockClient.release.mockResolvedValue(undefined);
  });

  describe('getPool', () => {
    it('应该创建并返回数据库连接池的单例实例', () => {
      const pool1 = getPool();
      const pool2 = getPool();

      expect(pool1).toBe(pool2);
      expect(Pool).toHaveBeenCalledTimes(1);
      expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
        host: env.DB_HOST,
        port: expect.any(Number),
        user: env.DB_USER,
        password: env.DB_PASS,
        database: env.DB_NAME
      }));
    });
  });

  describe('query', () => {
    it('应该使用连接池执行查询并返回结果行', async () => {
      const mockClient = getMockClient();
      mockClient.query.mockResolvedValue({ rows: [{ id: 1, name: 'Test' }] });

      const result = await query('SELECT * FROM users WHERE id = $1', [1]);

      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1, name: 'Test' }]);
    });

    it('应该在查询失败时释放客户端连接', async () => {
      const mockClient = getMockClient();
      const mockError = new Error('Query failed');
      mockClient.query.mockRejectedValue(mockError);

      await expect(query('SELECT * FROM users')).rejects.toThrow('Query failed');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('应该支持带参数的查询', async () => {
      const mockClient = getMockClient();
      mockClient.query.mockResolvedValue({ rows: [] });

      await query('INSERT INTO users (name, email) VALUES ($1, $2)', ['John', 'john@example.com']);

      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email) VALUES ($1, $2)',
        ['John', 'john@example.com']
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('transaction', () => {
    it('应该执行事务并在成功时提交', async () => {
      const mockClient = getMockClient();
      mockClient.query.mockResolvedValue({ rows: [] });

      const transactionResult = await transaction(async (client) => {
        await client.query('INSERT INTO users (name) VALUES ($1)', ['John']);
        await client.query('UPDATE users SET active = true WHERE name = $1', ['John']);
        return { success: true };
      });

      expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockClient.query).toHaveBeenNthCalledWith(2, 'INSERT INTO users (name) VALUES ($1)', ['John']);
      expect(mockClient.query).toHaveBeenNthCalledWith(3, 'UPDATE users SET active = true WHERE name = $1', ['John']);
      expect(mockClient.query).toHaveBeenNthCalledWith(4, 'COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(transactionResult).toEqual({ success: true });
    });

    it('应该在事务失败时回滚', async () => {
      const mockClient = getMockClient();
      mockClient.query.mockResolvedValue({ rows: [] });
      const mockError = new Error('Transaction failed');

      await expect(transaction(async (client) => {
        await client.query('INSERT INTO users (name) VALUES ($1)', ['John']);
        throw mockError;
      })).rejects.toThrow('Transaction failed');

      expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockClient.query).toHaveBeenNthCalledWith(2, 'INSERT INTO users (name) VALUES ($1)', ['John']);
      expect(mockClient.query).toHaveBeenNthCalledWith(3, 'ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('testConnection', () => {
    it('应该测试数据库连接并返回true如果成功', async () => {
      const mockClient = getMockClient();
      mockClient.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });

      const result = await testConnection();

      expect(mockClient.query).toHaveBeenCalledWith('SELECT 1');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该在连接失败时返回false', async () => {
      const mockClient = getMockClient();
      const mockError = new Error('Connection failed');
      mockClient.query.mockRejectedValue(mockError);

      const result = await testConnection();

      expect(result).toBe(false);
    });
  });

  describe('closePool', () => {
    it('应该关闭数据库连接池', async () => {
      const pool = getPool();
      const mockEnd = pool.end as jest.MockedFunction<typeof pool.end>;

      await closePool();

      expect(mockEnd).toHaveBeenCalled();
    });

    it('应该在没有创建池时不抛出错误', async () => {
      // Reset the pool singleton
      (global as any).pool = undefined;
      
      await expect(closePool()).resolves.not.toThrow();
    });
  });
});
