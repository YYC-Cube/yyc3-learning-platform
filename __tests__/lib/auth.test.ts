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

import { generateToken, verifyToken, hashPassword, verifyPassword, getTokenFromHeader } from '@/lib/auth'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from '@/lib/env'

// Mock the env module
jest.mock('@/lib/env', () => ({
  env: {
    JWT_SECRET: 'your-32-character-jwt-secret-key-here-abc123',
    JWT_EXPIRES_IN: '7d',
    BCRYPT_ROUNDS: 10
  }
}));

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Authentication Service', () => {
  describe('generateToken', () => {
    it('应该使用正确的参数生成JWT令牌', () => {
      const mockSign = jwt.sign as jest.MockedFunction<typeof jwt.sign>;
      mockSign.mockReturnValue('test-token');

      const user = { id: 1, email: 'test@example.com', role: 'user' };
      const token = generateToken(user);

      expect(mockSign).toHaveBeenCalledWith(
        {
          id: '1',
          email: 'test@example.com',
          role: 'user'
        },
        'your-32-character-jwt-secret-key-here-abc123',
        { expiresIn: '7d' }
      );
      expect(token).toBe('test-token');
    });

    it('当JWT_SECRET为空时应该抛出错误', () => {
      const originalSecret = env.JWT_SECRET;
      (env as any).JWT_SECRET = '';

      const user = { id: 1, email: 'test@example.com', role: 'user' };
      expect(() => generateToken(user)).toThrow('JWT_SECRET must be a non-empty string');

      // Restore original secret
      (env as any).JWT_SECRET = originalSecret;
    });

    it('应该将number类型的id转换为string', () => {
      const mockSign = jwt.sign as jest.MockedFunction<typeof jwt.sign>;
      mockSign.mockReturnValue('test-token');

      const user = { id: 123, email: 'test@example.com', role: 'user' };
      generateToken(user);

      expect(mockSign).toHaveBeenCalledWith(
        expect.objectContaining({ id: '123' }),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('应该支持string类型的id', () => {
      const mockSign = jwt.sign as jest.MockedFunction<typeof jwt.sign>;
      mockSign.mockReturnValue('test-token');

      const user = { id: 'user-123', email: 'test@example.com', role: 'user' };
      generateToken(user);

      expect(mockSign).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-123' }),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('verifyToken', () => {
    it('应该验证有效令牌并返回解码后的payload', () => {
      const mockVerify = jwt.verify as jest.MockedFunction<typeof jwt.verify>;
      const decodedPayload = { id: '1', email: 'test@example.com', role: 'user' };
      mockVerify.mockReturnValue(decodedPayload);

      const result = verifyToken('valid-token');

      expect(mockVerify).toHaveBeenCalledWith('valid-token', 'your-32-character-jwt-secret-key-here-abc123');
      expect(result).toEqual(decodedPayload);
    });

    it('应该返回null验证无效令牌', () => {
      const mockVerify = jwt.verify as jest.MockedFunction<typeof jwt.verify>;
      mockVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('应该使用bcrypt正确哈希密码', async () => {
      const mockHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
      mockHash.mockResolvedValue('hashed-password');

      const result = await hashPassword('password123');

      expect(mockHash).toHaveBeenCalledWith('password123', 10);
      expect(result).toBe('hashed-password');
    });
  });

  describe('verifyPassword', () => {
    it('应该验证正确的密码', async () => {
      const mockCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;
      mockCompare.mockResolvedValue(true);

      const result = await verifyPassword('password123', 'hashed-password');

      expect(mockCompare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).toBe(true);
    });

    it('应该拒绝错误的密码', async () => {
      const mockCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;
      mockCompare.mockResolvedValue(false);

      const result = await verifyPassword('wrong-password', 'hashed-password');

      expect(mockCompare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
      expect(result).toBe(false);
    });
  });

  describe('getTokenFromHeader', () => {
    it('应该从Bearer头中提取令牌', () => {
      const result = getTokenFromHeader('Bearer valid-token-123');
      expect(result).toBe('valid-token-123');
    });

    it('应该在没有Bearer前缀时返回null', () => {
      const result = getTokenFromHeader('valid-token-123');
      expect(result).toBeNull();
    });

    it('应该在头为空时返回null', () => {
      const result = getTokenFromHeader('');
      expect(result).toBeNull();
    });

    it('应该在头未定义时返回null', () => {
      const result = getTokenFromHeader(undefined);
      expect(result).toBeNull();
    });

    it('应该在Bearer前缀后没有令牌时返回空字符串', () => {
      const result = getTokenFromHeader('Bearer ');
      expect(result).toBe('');
    });
  });
});
