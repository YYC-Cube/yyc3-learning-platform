/**
 * @file 环境变量验证模块
 * @description 使用Zod验证所有环境变量，确保类型安全和配置完整性
 * @module env
 * @author YYC³
 * @version 2.0.0
 * @created 2025-03-17
 * @updated 2025-12-06
 */
import dotenv from 'dotenv';
import { z } from 'zod';
import { ValidationError } from './error-handler';

// 加载.env文件
dotenv.config();

// 定义环境变量模式
const envSchema = z.object({
  // 应用基本配置
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL 必须是有效的URL").optional().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL 必须是有效的URL").optional().default('http://localhost:3000/api'),
  
  // 数据库配置
  DB_HOST: z.string().min(1, "DB_HOST 不能为空").optional().default('localhost'),
  DB_PORT: z.string().regex(/^[0-9]+$/, "DB_PORT 必须是数字").optional().default('5432'),
  DB_USER: z.string().min(1, "DB_USER 不能为空").optional().default('postgres'),
  DB_PASS: z.string().min(1, "DB_PASS 不能为空").optional().default(''),
  DB_NAME: z.string().min(1, "DB_NAME 不能为空").optional().default('ai_learning'),
  DB_SSL: z.string().regex(/^(true|false)$/, "DB_SSL 必须是 true 或 false").optional().default('false'),
  DB_CONNECTION_LIMIT: z.string().regex(/^[0-9]+$/, "DB_CONNECTION_LIMIT 必须是数字").optional().default('10'),
  DB_IDLE_TIMEOUT: z.string().regex(/^[0-9]+$/, "DB_IDLE_TIMEOUT 必须是数字").optional().default('30000'),
  DB_MAX_LIFETIME: z.string().regex(/^[0-9]+$/, "DB_MAX_LIFETIME 必须是数字").optional().default('600000'),
  
  // 数据库连接字符串（可选，如果提供则验证格式）
  DATABASE_URL: z.string().url("DATABASE_URL 必须是有效的数据库连接URL").optional(),
  
  // JWT配置
  JWT_SECRET: z.string().min(32, "JWT_SECRET 至少需要32个字符").optional(),
  JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, "JWT_EXPIRES_IN 格式不正确，例如: 7d, 1h, 30m").optional().default('7d'),
  
  // BCrypt配置
  BCRYPT_ROUNDS: z.string().regex(/^[0-9]+$/, "BCRYPT_ROUNDS 必须是数字").optional().default('10'),
  
  // 应用配置
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    errorMap: () => ({ message: "NODE_ENV 必须是 development, production 或 test" })
  }).optional().default('development'),
  PORT: z.string().regex(/^[0-9]+$/, "PORT 必须是数字").default('3000'),
  
  // 可选：Redis 配置
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().regex(/^[0-9]+$/, "REDIS_PORT 必须是数字").optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // 可选：日志配置
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error'], {
    errorMap: () => ({ message: "LOG_LEVEL 必须是 debug, info, warn 或 error" })
  }).optional(),
  LOG_FILE_PATH: z.string().optional(),
  
  // 可选：监控配置
  SENTRY_DSN: z.string().url("SENTRY_DSN 必须是有效的URL").optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  
  // 可选：第三方 API 密钥
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY 不能为空").optional(),
  GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY 不能为空").optional(),
});

// 验证环境变量
function validateEnv(): z.infer<typeof envSchema> {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      
      throw new ValidationError(
        '环境变量验证失败',
        'ENV_VALIDATION_ERROR',
        { errors }
      );
    }
    throw error;
  }
}

// 解析环境变量
export const env = validateEnv();

// 将端口转换为数字以便在应用中使用
export const PORT = parseInt(env.PORT, 10);
export const DB_PORT = parseInt(env.DB_PORT, 10);
export const BCRYPT_ROUNDS = parseInt(env.BCRYPT_ROUNDS, 10);
export const DB_CONNECTION_LIMIT = parseInt(env.DB_CONNECTION_LIMIT, 10);
export const DB_IDLE_TIMEOUT = parseInt(env.DB_IDLE_TIMEOUT, 10);
export const DB_MAX_LIFETIME = parseInt(env.DB_MAX_LIFETIME, 10);
export const DB_SSL = env.DB_SSL.toLowerCase() === 'true';

// 检查是否为生产环境
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// 获取数据库连接字符串（优先使用 DATABASE_URL，否则从其他配置构建）
export function getDatabaseUrl(): string {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }
  
  const sslMode = DB_SSL ? '?sslmode=require' : '';
  return `postgresql://${env.DB_USER}:${env.DB_PASS}@${env.DB_HOST}:${DB_PORT}/${env.DB_NAME}${sslMode}`;
}

// 验证必需的环境变量
export function validateRequiredEnvVars(): void {
  const requiredVars: { key: string; name: string }[] = [];

  const currentEnv = envSchema.parse(process.env);

  if (!currentEnv.JWT_SECRET) {
    requiredVars.push({ key: 'JWT_SECRET', name: 'JWT密钥' });
  }

  if (requiredVars.length > 0) {
    const missingVars = requiredVars.map(v => v.name).join('、');
    throw new ValidationError(
      `缺少必需的环境变量: ${missingVars}`,
      'MISSING_REQUIRED_ENV_VARS',
      { missingVars: requiredVars }
    );
  }
}

// 验证环境变量配置（在应用启动时调用）
export function validateEnvConfig(): void {
  // 使用safeParse来获取环境变量，避免Zod验证失败
  const parseResult = envSchema.safeParse(process.env);

  if (!parseResult.success) {
    // Zod验证失败，构建错误消息
    const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    throw new ValidationError(
      '环境变量配置验证失败: ' + errorMessages.join(', '),
      'ENV_CONFIG_VALIDATION_ERROR',
      { errors: parseResult.error.errors }
    );
  }

  const currentEnv = parseResult.data;

  try {
    validateRequiredEnvVars();

    // 在生产环境中进行额外的验证
    const nodeEnv = currentEnv.NODE_ENV || 'development';
    if (nodeEnv === 'production') {
      if (!currentEnv.JWT_SECRET || currentEnv.JWT_SECRET.length < 32) {
        throw new ValidationError(
          '生产环境中 JWT_SECRET 必须至少32个字符',
          'INSECURE_JWT_SECRET'
        );
      }

      if (!currentEnv.DB_PASS || currentEnv.DB_PASS.length < 16 || currentEnv.DB_PASS === 'your_secure_password_here') {
        throw new ValidationError(
          '生产环境中必须设置安全的数据库密码',
          'INSECURE_DB_PASSWORD'
        );
      }
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(
      '环境变量配置验证失败',
      'ENV_CONFIG_VALIDATION_ERROR',
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
}

// 动态检查当前环境类型（运行时评估）
export function checkEnvironment(): {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  nodeEnv: string;
} {
  const currentEnv = envSchema.parse(process.env);
  const nodeEnv = currentEnv.NODE_ENV || 'development';

  return {
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    nodeEnv
  };
}

// 导出环境变量配置信息（用于调试，生产环境中不包含敏感信息）
export function getEnvInfo(): Record<string, any> {
  // 使用safeParse避免验证失败，尽力获取可用的环境信息
  const parseResult = envSchema.safeParse(process.env);

  if (!parseResult.success) {
    // 如果验证失败，返回基本信息
    return {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: parseInt(process.env.PORT || '3000', 10),
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
      DB_NAME: process.env.DB_NAME || 'ai_learning',
      DB_SSL: (process.env.DB_SSL || 'false').toLowerCase() === 'true',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
      BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
      hasRedis: !!(process.env.REDIS_HOST && process.env.REDIS_PORT),
      hasSentry: !!process.env.SENTRY_DSN,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasGoogleAPI: !!process.env.GOOGLE_API_KEY,
      _validationError: '部分环境变量验证失败',
    };
  }

  const currentEnv = parseResult.data;
  const port = parseInt(currentEnv.PORT || '3000', 10);
  const dbPort = parseInt(currentEnv.DB_PORT || '5432', 10);
  const bcryptRounds = parseInt(currentEnv.BCRYPT_ROUNDS || '10', 10);
  const dbConnectionLimit = parseInt(currentEnv.DB_CONNECTION_LIMIT || '10', 10);
  const dbIdleTimeout = parseInt(currentEnv.DB_IDLE_TIMEOUT || '30000', 10);
  const dbMaxLifetime = parseInt(currentEnv.DB_MAX_LIFETIME || '600000', 10);
  const dbSsl = (currentEnv.DB_SSL || 'false').toLowerCase() === 'true';

  return {
    NODE_ENV: currentEnv.NODE_ENV,
    PORT: port,
    DB_HOST: currentEnv.DB_HOST,
    DB_PORT: dbPort,
    DB_NAME: currentEnv.DB_NAME,
    DB_SSL: dbSsl,
    DB_CONNECTION_LIMIT: dbConnectionLimit,
    NEXT_PUBLIC_APP_URL: currentEnv.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: currentEnv.NEXT_PUBLIC_API_URL,
    JWT_EXPIRES_IN: currentEnv.JWT_EXPIRES_IN,
    BCRYPT_ROUNDS: bcryptRounds,
    hasRedis: !!(currentEnv.REDIS_HOST && currentEnv.REDIS_PORT),
    hasSentry: !!currentEnv.SENTRY_DSN,
    hasOpenAI: !!currentEnv.OPENAI_API_KEY,
    hasGoogleAPI: !!currentEnv.GOOGLE_API_KEY,
  };
}
