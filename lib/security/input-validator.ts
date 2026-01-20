/**
 * @fileoverview 输入验证工具模块
 * @description 提供输入验证、清理和过滤功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-02-04
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

/**
 * 验证配置
 */
export interface ValidationConfig {
  /** 最大长度 */
  maxLength?: number;
  /** 最小长度 */
  minLength?: number;
  /** 允许的正则表达式 */
  pattern?: RegExp;
  /** 是否允许空值 */
  allowEmpty?: boolean;
  /** 自定义验证函数 */
  customValidator?: (value: string) => boolean;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误消息 */
  error?: string;
}

/**
 * 验证字符串
 * @param value 待验证的值
 * @param config 验证配置
 * @returns 验证结果
 */
export function validateString(value: string, config: ValidationConfig = {}): ValidationResult {
  const { maxLength, minLength, pattern, allowEmpty = false, customValidator } = config;
  
  if (!value && !allowEmpty) {
    return { valid: false, error: '值不能为空' };
  }
  
  if (value && minLength && value.length < minLength) {
    return { valid: false, error: `长度不能少于${minLength}个字符` };
  }
  
  if (value && maxLength && value.length > maxLength) {
    return { valid: false, error: `长度不能超过${maxLength}个字符` };
  }
  
  if (value && pattern && !pattern.test(value)) {
    return { valid: false, error: '格式不正确' };
  }
  
  if (value && customValidator && !customValidator(value)) {
    return { valid: false, error: '自定义验证失败' };
  }
  
  return { valid: true };
}

/**
 * 验证邮箱地址
 * @param email 邮箱地址
 * @returns 验证结果
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateString(email, { pattern: emailRegex, allowEmpty: false });
}

/**
 * 验证URL
 * @param url URL地址
 * @returns 验证结果
 */
export function validateURL(url: string): ValidationResult {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'URL格式不正确' };
  }
}

/**
 * 验证手机号（中国大陆）
 * @param phone 手机号
 * @returns 验证结果
 */
export function validatePhone(phone: string): ValidationResult {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return validateString(phone, { pattern: phoneRegex, allowEmpty: false });
}

/**
 * 验证身份证号（中国大陆）
 * @param idCard 身份证号
 * @returns 验证结果
 */
export function validateIdCard(idCard: string): ValidationResult {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  return validateString(idCard, { pattern: idCardRegex, allowEmpty: false });
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 验证结果
 */
export function validatePasswordStrength(password: string): ValidationResult {
  if (password.length < 8) {
    return { valid: false, error: '密码长度至少8位' };
  }
  
  let strength = 0;
  
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength < 3) {
    return { valid: false, error: '密码必须包含大小写字母、数字和特殊字符中的至少三种' };
  }
  
  return { valid: true };
}

/**
 * 清理HTML内容（防止XSS攻击）
 * @param html HTML内容
 * @returns 清理后的内容
 */
export function sanitizeHTML(html: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
  };
  
  const reg = /[&<>"'/]/gi;
  return html.replace(reg, (match) => map[match]);
}

/**
 * 清理SQL查询参数（防止SQL注入）
 * @param input 输入内容
 * @returns 清理后的内容
 */
export function sanitizeSQL(input: string): string {
  return input.replace(/['";\\]/g, '');
}

/**
 * 清理文件名
 * @param filename 文件名
 * @returns 清理后的文件名
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '');
}

/**
 * 清理路径（防止路径遍历攻击）
 * @param path 路径
 * @returns 清理后的路径
 */
export function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, '')
    .replace(/\/+/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

/**
 * 验证数字范围
 * @param value 数值
 * @param min 最小值
 * @param max 最大值
 * @returns 验证结果
 */
export function validateNumberRange(value: number, min: number, max: number): ValidationResult {
  if (isNaN(value)) {
    return { valid: false, error: '不是有效的数字' };
  }
  
  if (value < min || value > max) {
    return { valid: false, error: `数值必须在${min}到${max}之间` };
  }
  
  return { valid: true };
}

/**
 * 验证数组长度
 * @param array 数组
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @returns 验证结果
 */
export function validateArrayLength<T>(array: T[], minLength: number, maxLength: number): ValidationResult {
  if (array.length < minLength) {
    return { valid: false, error: `数组长度不能少于${minLength}` };
  }
  
  if (array.length > maxLength) {
    return { valid: false, error: `数组长度不能超过${maxLength}` };
  }
  
  return { valid: true };
}

/**
 * 验证对象属性
 * @param obj 对象
 * @param requiredProps 必需属性列表
 * @returns 验证结果
 */
export function validateObjectProps(obj: Record<string, any>, requiredProps: string[]): ValidationResult {
  const missingProps = requiredProps.filter(prop => !(prop in obj));
  
  if (missingProps.length > 0) {
    return { valid: false, error: `缺少必需属性: ${missingProps.join(', ')}` };
  }
  
  return { valid: true };
}

/**
 * 验证JSON格式
 * @param json JSON字符串
 * @returns 验证结果
 */
export function validateJSON(json: string): ValidationResult {
  try {
    JSON.parse(json);
    return { valid: true };
  } catch {
    return { valid: false, error: 'JSON格式不正确' };
  }
}

/**
 * 验证日期格式
 * @param date 日期字符串
 * @returns 验证结果
 */
export function validateDate(date: string): ValidationResult {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return validateString(date, { pattern: dateRegex, allowEmpty: false });
}

/**
 * 验证时间格式
 * @param time 时间字符串
 * @returns 验证结果
 */
export function validateTime(time: string): ValidationResult {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return validateString(time, { pattern: timeRegex, allowEmpty: false });
}

/**
 * 验证日期时间格式
 * @param datetime 日期时间字符串
 * @returns 验证结果
 */
export function validateDateTime(datetime: string): ValidationResult {
  const datetimeRegex = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d{3})?Z?$/;
  return validateString(datetime, { pattern: datetimeRegex, allowEmpty: false });
}

/**
 * 验证IP地址
 * @param ip IP地址
 * @returns 验证结果
 */
export function validateIP(ip: string): ValidationResult {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) {
    return { valid: true };
  }
  
  return { valid: false, error: 'IP地址格式不正确' };
}

/**
 * 验证端口号
 * @param port 端口号
 * @returns 验证结果
 */
export function validatePort(port: number): ValidationResult {
  return validateNumberRange(port, 1, 65535);
}

/**
 * 验证用户名
 * @param username 用户名
 * @returns 验证结果
 */
export function validateUsername(username: string): ValidationResult {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return validateString(username, { pattern: usernameRegex, allowEmpty: false });
}

/**
 * 验证文件大小
 * @param size 文件大小（字节）
 * @param maxSize 最大大小（字节）
 * @returns 验证结果
 */
export function validateFileSize(size: number, maxSize: number): ValidationResult {
  if (size > maxSize) {
    return { valid: false, error: `文件大小不能超过${maxSize}字节` };
  }
  
  return { valid: true };
}

/**
 * 验证文件类型
 * @param filename 文件名
 * @param allowedTypes 允许的类型列表
 * @returns 验证结果
 */
export function validateFileType(filename: string, allowedTypes: string[]): ValidationResult {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (!ext || !allowedTypes.includes(ext)) {
    return { valid: false, error: `不支持的文件类型` };
  }
  
  return { valid: true };
}

/**
 * 批量验证
 * @param data 数据对象
 * @param validators 验证器映射
 * @returns 验证结果映射
 */
export function validateBatch(
  data: Record<string, any>,
  validators: Record<string, (value: any) => ValidationResult>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  
  for (const [key, validator] of Object.entries(validators)) {
    results[key] = validator(data[key]);
  }
  
  return results;
}

/**
 * 检查批量验证是否全部通过
 * @param results 验证结果映射
 * @returns 是否全部通过
 */
export function isAllValid(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).every(result => result.valid);
}
