/**
 * @fileoverview 认证服务单元测试
 * @description 测试用户认证相关的核心功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-03-17
 * @modified 2025-03-17
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateToken, verifyToken, hashPassword, verifyPassword, getTokenFromHeader } from '@/lib/auth'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from '@/lib/env'
import type { JWTPayload, TokenUserInfo } from '../types/test-types'

// Mock the env module
vi.mock('@/lib/env', () => ({
  env: {
    JWT_SECRET: 'your-32-character-jwt-secret-key-here-abc123',
    JWT_EXPIRES_IN: '7d',
    BCRYPT_ROUNDS: 10
  }
}))

// Mock dependencies
vi.mock('jsonwebtoken')
vi.mock('bcryptjs')

// Create typed mock functions
const createMockJwtSign = () => vi.fn<() => string>()
const createMockJwtVerify = () => vi.fn<() => JWTPayload>()
const createMockBcryptHash = () => vi.fn<() => Promise<string>>()
const createMockBcryptCompare = () => vi.fn<() => Promise<boolean>>()

// Mock implementations
const mockJwtSign = createMockJwtSign()
const mockJwtVerify = createMockJwtVerify()
const mockBcryptHash = createMockBcryptHash()
const mockBcryptCompare = createMockBcryptCompare()

// Set up mocks before importing
beforeEach(() => {
  // Clear all mocks
  vi.clearAllMocks()

  // Reset mock implementations
  mockJwtSign.mockReset()
  mockJwtVerify.mockReset()
  mockBcryptHash.mockReset()
  mockBcryptCompare.mockReset()

  // Setup default return values
  mockJwtSign.mockReturnValue('test-token')
  mockJwtVerify.mockReturnValue({ id: '1', email: 'test@example.com', role: 'user' } as JWTPayload)
  mockBcryptHash.mockResolvedValue('hashed-password')
  mockBcryptCompare.mockResolvedValue(true)

  // Assign to module exports
  ;(jwt.sign as typeof jwt.sign) = mockJwtSign as unknown as typeof jwt.sign
  ;(jwt.verify as typeof jwt.verify) = mockJwtVerify as unknown as typeof jwt.verify
  ;(bcrypt.hash as typeof bcrypt.hash) = mockBcryptHash as unknown as typeof bcrypt.hash
  ;(bcrypt.compare as typeof bcrypt.compare) = mockBcryptCompare as unknown as typeof bcrypt.compare
})

describe('Authentication Service', () => {
  describe('generateToken', () => {
    it('应该使用正确的参数生成JWT令牌', () => {
      const user: TokenUserInfo = { id: 1, email: 'test@example.com', role: 'user' }
      const token = generateToken(user)

      expect(mockJwtSign).toHaveBeenCalledWith(
        {
          id: '1',
          email: 'test@example.com',
          role: 'user'
        },
        'your-32-character-jwt-secret-key-here-abc123',
        { expiresIn: '7d' }
      )
      expect(token).toBe('test-token')
    })

    it('当JWT_SECRET为空时应该抛出错误', () => {
      const originalSecret = env.JWT_SECRET
      ;(env as { JWT_SECRET?: string }).JWT_SECRET = ''

      const user: TokenUserInfo = { id: 1, email: 'test@example.com', role: 'user' }
      expect(() => generateToken(user)).toThrow('JWT_SECRET must be a non-empty string')

      // Restore original secret
      ;(env as { JWT_SECRET?: string }).JWT_SECRET = originalSecret
    })

    it('应该将number类型的id转换为string', () => {
      const user: TokenUserInfo = { id: 123, email: 'test@example.com', role: 'user' }
      generateToken(user)

      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({ id: '123' }),
        expect.any(String),
        expect.any(Object)
      )
    })

    it('应该支持string类型的id', () => {
      const user: TokenUserInfo = { id: 'user-123', email: 'test@example.com', role: 'user' }
      generateToken(user)

      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-123' }),
        expect.any(String),
        expect.any(Object)
      )
    })
  })

  describe('verifyToken', () => {
    it('应该验证有效令牌并返回解码后的payload', () => {
      const decodedPayload: JWTPayload = { id: '1', email: 'test@example.com', role: 'user' }
      mockJwtVerify.mockReturnValue(decodedPayload)

      const result = verifyToken('valid-token')

      expect(mockJwtVerify).toHaveBeenCalledWith('valid-token', 'your-32-character-jwt-secret-key-here-abc123')
      expect(result).toEqual(decodedPayload)
    })

    it('应该返回null验证无效令牌', () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = verifyToken('invalid-token')

      expect(result).toBeNull()
    })
  })

  describe('hashPassword', () => {
    it('应该使用bcrypt正确哈希密码', async () => {
      mockBcryptHash.mockResolvedValue('hashed-password')

      const result = await hashPassword('password123')

      expect(mockBcryptHash).toHaveBeenCalledWith('password123', 10)
      expect(result).toBe('hashed-password')
    })
  })

  describe('verifyPassword', () => {
    it('应该验证正确的密码', async () => {
      mockBcryptCompare.mockResolvedValue(true)

      const result = await verifyPassword('password123', 'hashed-password')

      expect(mockBcryptCompare).toHaveBeenCalledWith('password123', 'hashed-password')
      expect(result).toBe(true)
    })

    it('应该拒绝错误的密码', async () => {
      mockBcryptCompare.mockResolvedValue(false)

      const result = await verifyPassword('wrong-password', 'hashed-password')

      expect(mockBcryptCompare).toHaveBeenCalledWith('wrong-password', 'hashed-password')
      expect(result).toBe(false)
    })
  })

  describe('getTokenFromHeader', () => {
    it('应该从Bearer头中提取令牌', () => {
      const result = getTokenFromHeader('Bearer valid-token-123')
      expect(result).toBe('valid-token-123')
    })

    it('应该在没有Bearer前缀时返回null', () => {
      const result = getTokenFromHeader('valid-token-123')
      expect(result).toBeNull()
    })

    it('应该在头为空时返回null', () => {
      const result = getTokenFromHeader('')
      expect(result).toBeNull()
    })

    it('应该在头未定义时返回null', () => {
      const result = getTokenFromHeader(undefined)
      expect(result).toBeNull()
    })

    it('应该在Bearer前缀后没有令牌时返回空字符串', () => {
      const result = getTokenFromHeader('Bearer ')
      expect(result).toBe('')
    })
  })
})
