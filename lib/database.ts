/**
 * @fileoverview 数据库连接模块
 * @description 提供数据库连接池、查询执行和事务管理功能
 * @author YYC³
 * @version 2.0.0
 * @created 2025-03-17
 * @modified 2025-12-06
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */
import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg"
import { env, DB_PORT, DB_CONNECTION_LIMIT, DB_IDLE_TIMEOUT, DB_MAX_LIFETIME, DB_SSL } from "./env"
import { logger } from "./logger"

// 数据库连接配置
const dbConfig = {
  host: env.DB_HOST,
  port: DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  max: DB_CONNECTION_LIMIT,
  idleTimeoutMillis: DB_IDLE_TIMEOUT,
  maxLifetime: DB_MAX_LIFETIME,
  connectionTimeoutMillis: 5000,
  ssl: DB_SSL ? { rejectUnauthorized: false } : false,
}

// 创建连接池
let pool: Pool

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig)
  }
  return pool
}

// 执行查询
export async function query<T extends QueryResultRow = Record<string, unknown>>(sql: string, params?: Array<string | number | boolean | null>): Promise<T[]> {
  const client = await getPool().connect()
  try {
    const result: QueryResult<T> = await client.query<T>(sql, params)
    return result.rows
  } finally {
    client.release()
  }
}

// 执行事务
export async function transaction<T>(callback: (_client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getPool().connect()
    await client.query('SELECT 1')
    client.release()
    return true
  } catch (error) {
    logger.error("Database connection failed", error)
    return false
  }
}

// 关闭连接池
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
  }
}
