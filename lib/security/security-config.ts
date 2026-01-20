/**
 * @fileoverview 安全配置模块
 * @description 提供统一的安全配置和策略管理
 * @author YYC³
 * @version 2.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

/**
 * 安全配置接口
 */
export interface SecurityConfig {
  /** 应用安全配置 */
  app: {
    /** 是否启用安全头 */
    enableSecurityHeaders: boolean;
    /** 是否启用CSP */
    enableCSP: boolean;
    /** 是否启用HSTS */
    enableHSTS: boolean;
    /** 是否启用速率限制 */
    enableRateLimiting: boolean;
    /** 是否启用输入验证 */
    enableInputValidation: boolean;
  };

  /** 认证安全配置 */
  auth: {
    /** JWT密钥最小长度 */
    jwtSecretMinLength: number;
    /** JWT过期时间 */
    jwtExpiresIn: string;
    /** 密码最小长度 */
    passwordMinLength: number;
    /** 密码复杂度要求 */
    passwordComplexity: {
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    /** 会话超时时间（分钟） */
    sessionTimeout: number;
    /** 最大登录尝试次数 */
    maxLoginAttempts: number;
    /** 登录锁定时间（分钟） */
    loginLockoutDuration: number;
  };

  /** 数据库安全配置 */
  database: {
    /** 连接池最大连接数 */
    maxConnections: number;
    /** 连接超时时间（毫秒） */
    connectionTimeout: number;
    /** 查询超时时间（毫秒） */
    queryTimeout: number;
    /** 是否启用SSL */
    enableSSL: boolean;
    /** 是否启用连接池 */
    enableConnectionPool: boolean;
  };

  /** API安全配置 */
  api: {
    /** API速率限制 */
    rateLimit: {
      /** 每分钟最大请求数 */
      windowMs: number;
      /** 最大请求数 */
      max: number;
      /** 是否启用IP白名单 */
      enableIpWhitelist: boolean;
      /** IP白名单 */
      ipWhitelist: string[];
    };
    /** CORS配置 */
    cors: {
      /** 允许的来源 */
      allowedOrigins: string[];
      /** 允许的方法 */
      allowedMethods: string[];
      /** 允许的头部 */
      allowedHeaders: string[];
      /** 是否允许凭证 */
      allowCredentials: boolean;
    };
  };

  /** 日志和监控配置 */
  monitoring: {
    /** 是否启用安全审计日志 */
    enableAuditLog: boolean;
    /** 是否启用性能监控 */
    enablePerformanceMonitoring: boolean;
    /** 是否启用错误监控 */
    enableErrorMonitoring: boolean;
    /** 日志保留天数 */
    logRetentionDays: number;
  };
}

/**
 * 默认安全配置
 */
export const defaultSecurityConfig: SecurityConfig = {
  app: {
    enableSecurityHeaders: true,
    enableCSP: true,
    enableHSTS: true,
    enableRateLimiting: true,
    enableInputValidation: true,
  },

  auth: {
    jwtSecretMinLength: 32,
    jwtExpiresIn: '7d',
    passwordMinLength: 8,
    passwordComplexity: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
    },
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    loginLockoutDuration: 15,
  },

  database: {
    maxConnections: 20,
    connectionTimeout: 30000,
    queryTimeout: 30000,
    enableSSL: true,
    enableConnectionPool: true,
  },

  api: {
    rateLimit: {
      windowMs: 60000, // 1分钟
      max: 100, // 最大100个请求
      enableIpWhitelist: false,
      ipWhitelist: [],
    },
    cors: {
      allowedOrigins: ['http://localhost:3000', 'http://localhost:3491'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      allowCredentials: true,
    },
  },

  monitoring: {
    enableAuditLog: true,
    enablePerformanceMonitoring: true,
    enableErrorMonitoring: true,
    logRetentionDays: 30,
  },
};

/**
 * 生产环境安全配置
 */
export const productionSecurityConfig: SecurityConfig = {
  ...defaultSecurityConfig,
  app: {
    ...defaultSecurityConfig.app,
    enableHSTS: true,
  },
  auth: {
    ...defaultSecurityConfig.auth,
    jwtSecretMinLength: 64,
    passwordMinLength: 12,
  },
  api: {
    ...defaultSecurityConfig.api,
    rateLimit: {
      ...defaultSecurityConfig.api.rateLimit,
      max: 50, // 生产环境限制更严格
      enableIpWhitelist: true,
      ipWhitelist: ['127.0.0.1'], // 生产环境IP白名单
    },
    cors: {
      ...defaultSecurityConfig.api.cors,
      allowedOrigins: ['https://yyc3-learning-platform.com'], // 生产环境域名
      allowCredentials: false, // 生产环境禁用凭证
    },
  },
};

/**
 * 获取当前环境的安全配置
 */
export function getSecurityConfig(): SecurityConfig {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return productionSecurityConfig;
    case 'test':
      return {
        ...defaultSecurityConfig,
        app: {
          ...defaultSecurityConfig.app,
          enableRateLimiting: false, // 测试环境禁用速率限制
        },
      };
    default:
      return defaultSecurityConfig;
  }
}

/**
 * 验证安全配置
 */
export function validateSecurityConfig(config: SecurityConfig): string[] {
  const errors: string[] = [];

  // 验证JWT密钥长度
  if (config.auth.jwtSecretMinLength < 32) {
    errors.push('JWT密钥长度至少需要32个字符');
  }

  // 验证密码复杂度
  if (config.auth.passwordMinLength < 8) {
    errors.push('密码最小长度至少需要8个字符');
  }

  // 验证数据库配置
  if (config.database.maxConnections < 1) {
    errors.push('数据库最大连接数必须大于0');
  }

  // 验证API速率限制
  if (config.api.rateLimit.max < 1) {
    errors.push('API速率限制最大请求数必须大于0');
  }

  return errors;
}
