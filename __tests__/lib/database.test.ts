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

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock client instances that will be configured in beforeEach
let mockClient: {
  query: ReturnType<typeof vi.fn>
  release: ReturnType<typeof vi.fn>
}

let mockPoolInstance: {
  connect: ReturnType<typeof vi.fn>
  end: ReturnType<typeof vi.fn>
}

// Mock the env module
vi.mock('@/lib/env', () => ({
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
}))

// Mock logger module
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

// Mocks pg library with a factory function
vi.mock('pg', () => {
  const MockPool = class {
    public connect = vi.fn()
    public end = vi.fn()

    constructor() {
      // Assigns methods from the outer scope mockPoolInstance
      if (mockPoolInstance) {
        this.connect = mockPoolInstance.connect as any
        this.end = mockPoolInstance.end as any
      }
    }
  }

  return {
    Pool: MockPool
  }
})

describe('Database Service', () => {

  beforeEach(() => {
    vi.clearAllMocks()

    // Create fresh mock client
    mockClient = {
      query: vi.fn().mockResolvedValue({ rows: [{ id: 1, name: 'Test' }] }),
      release: vi.fn().mockResolvedValue(undefined)
    }

    // Create fresh mock pool instance methods
    const connectMethod = vi.fn().mockResolvedValue(mockClient)
    const endMethod = vi.fn().mockResolvedValue(undefined)

    mockPoolInstance = {
      connect: connectMethod,
      end: endMethod
    }

    // Clear module cache to reset singleton
    vi.resetModules()
  })

  describe('getPool', () => {
    it('应该创建并返回数据库连接池的单例实例', async () => {
      const { getPool } = await import('@/lib/database')
      const pool1 = getPool()
      const pool2 = getPool()

      expect(pool1).toBe(pool2)
      expect(typeof pool1.connect).toBe('function')
      expect(typeof pool1.end).toBe('function')
    })
  })

  describe('query', () => {
    it('应该使用连接池执行查询并返回结果行', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ id: 1, name: 'Test' }] })

      const { query } = await import('@/lib/database')
      const result = await query('SELECT * FROM users WHERE id = $1', [1])

      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1])
      expect(mockClient.release).toHaveBeenCalled()
      expect(result).toEqual([{ id: 1, name: 'Test' }])
    })

    it('应该在查询失败时释放客户端连接', async () => {
      const mockError = new Error('Query failed')
      mockClient.query.mockRejectedValue(mockError)

      const { query } = await import('@/lib/database')
      await expect(query('SELECT * FROM users')).rejects.toThrow('Query failed')
      expect(mockClient.release).toHaveBeenCalled()
    })

    it('应该支持带参数的查询', async () => {
      mockClient.query.mockResolvedValue({ rows: [] })

      const { query } = await import('@/lib/database')
      await query('INSERT INTO users (name, email) VALUES ($1, $2)', ['John', 'john@example.com'])

      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email) VALUES ($1, $2)',
        ['John', 'john@example.com']
      )
      expect(mockClient.release).toHaveBeenCalled()
    })
  })

  describe('transaction', () => {
    it('应该执行事务并在成功时提交', async () => {
      mockClient.query.mockResolvedValue({ rows: [] })

      const { transaction } = await import('@/lib/database')
      const transactionResult = await transaction(async (client) => {
        await client.query('INSERT INTO users (name) VALUES ($1)', ['John'])
        await client.query('UPDATE users SET active = true WHERE name = $1', ['John'])
        return { success: true }
      })

      expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN')
      expect(mockClient.query).toHaveBeenNthCalledWith(2, 'INSERT INTO users (name) VALUES ($1)', ['John'])
      expect(mockClient.query).toHaveBeenNthCalledWith(3, 'UPDATE users SET active = true WHERE name = $1', ['John'])
      expect(mockClient.query).toHaveBeenNthCalledWith(4, 'COMMIT')
      expect(mockClient.release).toHaveBeenCalled()
      expect(transactionResult).toEqual({ success: true })
    })

    it('应该在事务失败时回滚', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // INSERT
        .mockResolvedValueOnce({ rows: [] }) // ROLLBACK

      const { transaction } = await import('@/lib/database')
      const mockError = new Error('Transaction failed')

      await expect(transaction(async (client) => {
        await client.query('INSERT INTO users (name) VALUES ($1)', ['John'])
        throw mockError
      })).rejects.toThrow('Transaction failed')

      expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN')
      expect(mockClient.query).toHaveBeenNthCalledWith(2, 'INSERT INTO users (name) VALUES ($1)', ['John'])
      expect(mockClient.query).toHaveBeenNthCalledWith(3, 'ROLLBACK')
      expect(mockClient.release).toHaveBeenCalled()
    })
  })

  describe('testConnection', () => {
    it('应该测试数据库连接并返回true如果成功', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ '?column?': 1 }] })

      const { testConnection } = await import('@/lib/database')
      const result = await testConnection()

      expect(mockClient.query).toHaveBeenCalledWith('SELECT 1')
      expect(mockClient.release).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('应该在连接失败时返回false', async () => {
      const mockError = new Error('Connection failed')
      mockClient.query.mockRejectedValue(mockError)

      const { testConnection } = await import('@/lib/database')
      const result = await testConnection()

      expect(result).toBe(false)
    })
  })

  describe('closePool', () => {
    it('应该关闭数据库连接池', async () => {
      const { getPool, closePool } = await import('@/lib/database')
      getPool()
      await closePool()

      expect(mockPoolInstance.end).toHaveBeenCalled()
    })

    it('应该在没有创建池时不抛出错误', async () => {
      // Don't call getPool, just call closePool
      const { closePool } = await import('@/lib/database')
      await expect(closePool()).resolves.not.toThrow()
    })
  })
})
