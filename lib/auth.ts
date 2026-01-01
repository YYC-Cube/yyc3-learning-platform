/**
 * @fileoverview 用户认证模块
 * @description 处理用户登录、注册、权限验证等核心功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-03-17
 * @modified 2025-03-17
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */
import type { User } from "../types/user"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { env } from "./env"
import type { StringValue } from "ms"

// 生成JWT令牌（支持 string 或 number 类型的 id）
export function generateToken(user: { id: string | number; email: string; role: string }): string {
  // 确保JWT_SECRET是字符串类型，并且不能为空
  if (typeof env.JWT_SECRET !== 'string' || env.JWT_SECRET.trim() === '') {
    throw new Error('JWT_SECRET must be a non-empty string');
  }
  
  // 确保JWT_SECRET是字符串类型
  const secret = env.JWT_SECRET as string;
  
  // 确保expiresIn是正确的类型
  const expiresIn = typeof env.JWT_EXPIRES_IN === 'string' || typeof env.JWT_EXPIRES_IN === 'number' 
    ? env.JWT_EXPIRES_IN as StringValue | number
    : '1d' as StringValue;
  
  return jwt.sign(
    {
      id: String(user.id),  // 将 id 转换为字符串以保持 JWT payload 一致性
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn },
  )
}

// 验证JWT令牌
export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, env.JWT_SECRET as string) as { id: string; email: string; role: string }
  } catch {
    return null
  }
}

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS)
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// 从请求头获取token
export function getTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}
