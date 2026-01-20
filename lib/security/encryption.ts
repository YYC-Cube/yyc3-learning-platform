/**
 * @fileoverview 加密工具模块
 * @description 提供数据加密、解密、哈希等安全功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-02-04
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * 从密码生成密钥
 * @param password 密码
 * @param salt 盐值
 * @returns 密钥
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * 加密数据
 * @param plaintext 明文
 * @param password 密码
 * @returns 加密后的数据（Base64编码）
 */
export function encrypt(plaintext: string, password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  const combined = Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, 'hex')
  ]);
  
  return combined.toString('base64');
}

/**
 * 解密数据
 * @param ciphertext 密文（Base64编码）
 * @param password 密码
 * @returns 解密后的明文
 * @throws 解密失败时抛出错误
 */
export function decrypt(ciphertext: string, password: string): string {
  const combined = Buffer.from(ciphertext, 'base64');
  
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const key = deriveKey(password, salt);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
}

/**
 * 生成哈希值
 * @param data 数据
 * @param algorithm 哈希算法（默认：sha256）
 * @returns 哈希值（十六进制）
 */
export function hash(data: string, algorithm: string = 'sha256'): string {
  return crypto.createHash(algorithm).update(data).digest('hex');
}

/**
 * 生成随机盐值
 * @param length 盐值长度（默认：64）
 * @returns 随机盐值（Base64编码）
 */
export function generateSalt(length: number = SALT_LENGTH): string {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * 验证哈希值
 * @param data 原始数据
 * @param hashValue 哈希值
 * @param algorithm 哈希算法（默认：sha256）
 * @returns 是否匹配
 */
export function verifyHash(data: string, hashValue: string, algorithm: string = 'sha256'): boolean {
  const computedHash = hash(data, algorithm);
  return computedHash === hashValue;
}

/**
 * 生成随机字符串
 * @param length 长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成UUID v4
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * 对密码进行哈希处理（使用bcrypt）
 * @param password 明文密码
 * @param saltRounds 盐值轮数（默认：10）
 * @returns 哈希后的密码
 */
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 哈希后的密码
 * @returns 是否匹配
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 敏感数据脱敏
 * @param data 原始数据
 * @param maskChar 掩码字符（默认：*）
 * @param visibleStart 开头可见字符数（默认：2）
 * @param visibleEnd 结尾可见字符数（默认：2）
 * @returns 脱敏后的数据
 */
export function maskSensitiveData(
  data: string,
  maskChar: string = '*',
  visibleStart: number = 2,
  visibleEnd: number = 2
): string {
  if (data.length <= visibleStart + visibleEnd) {
    return maskChar.repeat(data.length);
  }
  
  const start = data.substring(0, visibleStart);
  const end = data.substring(data.length - visibleEnd);
  const middle = maskChar.repeat(data.length - visibleStart - visibleEnd);
  
  return start + middle + end;
}

/**
 * 邮箱脱敏
 * @param email 邮箱地址
 * @returns 脱敏后的邮箱
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  const maskedUsername = maskSensitiveData(username, '*', 2, 0);
  return `${maskedUsername}@${domain}`;
}

/**
 * 手机号脱敏
 * @param phone 手机号
 * @returns 脱敏后的手机号
 */
export function maskPhone(phone: string): string {
  return maskSensitiveData(phone, '*', 3, 4);
}

/**
 * 身份证号脱敏
 * @param idCard 身份证号
 * @returns 脱敏后的身份证号
 */
export function maskIdCard(idCard: string): string {
  return maskSensitiveData(idCard, '*', 3, 4);
}

/**
 * 生成HMAC签名
 * @param data 数据
 * @param secret 密钥
 * @param algorithm 算法（默认：sha256）
 * @returns 签名（十六进制）
 */
export function generateHMAC(data: string, secret: string, algorithm: string = 'sha256'): string {
  return crypto.createHmac(algorithm, secret).update(data).digest('hex');
}

/**
 * 验证HMAC签名
 * @param data 数据
 * @param signature 签名
 * @param secret 密钥
 * @param algorithm 算法（默认：sha256）
 * @returns 是否匹配
 */
export function verifyHMAC(data: string, signature: string, secret: string, algorithm: string = 'sha256'): boolean {
  const computedSignature = generateHMAC(data, secret, algorithm);
  return computedSignature === signature;
}
