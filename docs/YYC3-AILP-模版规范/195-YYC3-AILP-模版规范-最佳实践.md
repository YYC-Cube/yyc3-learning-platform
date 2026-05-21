# YYC³ 最佳实践指南

> **_YanYuCloudCube_**
> **标语**：言启象限 | 语枢未来
> **_Words Initiate Quadrants, Language Serves as Core for the Future_**
> **标语**：万象归元于云枢 | 深栈智启新纪元
> **_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 📋 文档信息

| 属性         | 内容                      |
| ------------ | ------------------------- |
| **文档标题** | YYC³ 最佳实践指南         |
| **文档版本** | v1.0.0                    |
| **创建时间** | 2025-12-31                |
| **适用范围** | YYC³ 团队所有项目和开发者 |

---

## 📚 目录

- [认证与授权](#认证与授权)
- [错误处理](#错误处理)
- [性能优化](#性能优化)
- [安全防护](#安全防护)
- [监控与日志](#监控与日志)
- [测试策略](#测试策略)
- [代码规范](#代码规范)
- [部署策略](#部署策略)

---

## 🔐 认证与授权

### 1. JWT令牌管理

#### ✅ 推荐做法

```typescript
import { EncryptionUtility } from '@yyc3/core-engine';

class AuthManager {
  private static instance: AuthManager;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async login(email: string, password: string): Promise<void> {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    this.token = data.data.token;
    this.tokenExpiry = Date.now() + data.data.expiresIn * 1000;

    const encryptionUtility = EncryptionUtility.getInstance();
    const encryptedToken = await encryptionUtility.encrypt(this.token);
    localStorage.setItem('yyc3_token', encryptedToken);
  }

  async getToken(): Promise<string> {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      await this.refreshToken();
    }
    return this.token;
  }

  private async refreshToken(): Promise<void> {
    const encryptionUtility = EncryptionUtility.getInstance();
    const encryptedToken = localStorage.getItem('yyc3_token');

    if (encryptedToken) {
      const decryptedToken = await encryptionUtility.decrypt(encryptedToken);
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${decryptedToken}`,
        },
      });

      const data = await response.json();
      this.token = data.data.token;
      this.tokenExpiry = Date.now() + data.data.expiresIn * 1000;
    }
  }

  logout(): void {
    this.token = null;
    this.tokenExpiry = 0;
    localStorage.removeItem('yyc3_token');
  }
}
```

#### ❌ 避免的做法

```typescript
// ❌ 不要在本地存储明文令牌
localStorage.setItem('token', token);

// ❌ 不要在URL中传递敏感信息
fetch(`/api/v1/data?token=${token}`);

// ❌ 不要忽略令牌过期
if (!token) {
  throw new Error('未登录');
}
```

### 2. 权限控制

```typescript
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

class PermissionManager {
  private static permissions: Map<UserRole, Set<string>> = new Map([
    [UserRole.ADMIN, new Set(['read', 'write', 'delete', 'admin'])],
    [UserRole.USER, new Set(['read', 'write'])],
    [UserRole.GUEST, new Set(['read'])],
  ]);

  static hasPermission(role: UserRole, action: string): boolean {
    return this.permissions.get(role)?.has(action) ?? false;
  }

  static checkPermission(role: UserRole, action: string): void {
    if (!this.hasPermission(role, action)) {
      throw new Error(`权限不足: ${role} 无法执行 ${action}`);
    }
  }
}
```

---

## 🛠️ 错误处理

### 1. 统一错误处理

```typescript
enum ErrorCode {
  AUTHENTICATION_FAILED = 'AUTH_001',
  AUTHORIZATION_FAILED = 'AUTH_002',
  RATE_LIMIT_EXCEEDED = 'RATE_001',
  VALIDATION_ERROR = 'VAL_001',
  INTERNAL_ERROR = 'INT_001',
}

class YYC3Error extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'YYC3Error';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

class ErrorHandler {
  static handle(error: unknown): YYC3Error {
    if (error instanceof YYC3Error) {
      return error;
    }

    if (error instanceof Error) {
      return new YYC3Error(ErrorCode.INTERNAL_ERROR, error.message);
    }

    return new YYC3Error(ErrorCode.INTERNAL_ERROR, '未知错误');
  }

  static async handleAsync<T>(fn: () => Promise<T>): Promise<[T | null, YYC3Error | null]> {
    try {
      const result = await fn();
      return [result, null];
    } catch (error) {
      return [null, this.handle(error)];
    }
  }
}
```

### 2. API请求错误处理

```typescript
class APIClient {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        switch (response.status) {
          case 401:
            throw new YYC3Error(ErrorCode.AUTHENTICATION_FAILED, '认证失败，请重新登录', errorData);
          case 403:
            throw new YYC3Error(ErrorCode.AUTHORIZATION_FAILED, '权限不足', errorData);
          case 429:
            throw new YYC3Error(
              ErrorCode.RATE_LIMIT_EXCEEDED,
              '请求过于频繁，请稍后再试',
              errorData
            );
          case 400:
            throw new YYC3Error(ErrorCode.VALIDATION_ERROR, '请求参数错误', errorData);
          default:
            throw new YYC3Error(
              ErrorCode.INTERNAL_ERROR,
              `请求失败: ${response.status}`,
              errorData
            );
        }
      }

      return response.json();
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }
}
```

---

## ⚡ 性能优化

### 1. 缓存策略

```typescript
import { IntelligentCacheLayer } from '@yyc3/model-adapter';

class CacheManager {
  private static cache: IntelligentCacheLayer;

  static async initialize() {
    this.cache = new IntelligentCacheLayer({
      maxSize: 1000,
      ttl: 60000,
      strategy: 'lru',
    });
  }

  static async get<T>(key: string): Promise<T | null> {
    const result = await this.cache.get(key);
    return result ? (result as T) : null;
  }

  static async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cache.set(key, value, ttl);
  }

  static async invalidate(pattern: string): Promise<void> {
    await this.cache.invalidate(pattern);
  }
}
```

### 2. 请求批处理

```typescript
class BatchRequestManager {
  private queue: Array<{
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private processing: boolean = false;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 10);
      const results = await Promise.allSettled(batch.map((item) => item.request()));

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          batch[index].resolve(result.value);
        } else {
          batch[index].reject(result.reason);
        }
      });
    }

    this.processing = false;
  }
}
```

### 3. 防抖与节流

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

---

## 🔒 安全防护

### 1. 输入验证

```typescript
import { ValidationUtility } from '@yyc3/core-engine';

class InputValidator {
  private static validator = ValidationUtility.getInstance();

  static async validateEmail(email: string): Promise<boolean> {
    return this.validator.validateEmail(email);
  }

  static async validatePassword(password: string): Promise<boolean> {
    return this.validator.validatePassword(password);
  }

  static async sanitizeInput(input: string): Promise<string> {
    return this.validator.sanitizeInput(input);
  }

  static async validateURL(url: string): Promise<boolean> {
    return this.validator.validateURL(url);
  }
}
```

### 2. 数据加密

```typescript
import { EncryptionUtility } from '@yyc3/core-engine';

class DataSecurity {
  private static encryption = EncryptionUtility.getInstance();

  static async encryptSensitiveData(data: string): Promise<string> {
    return this.encryption.encrypt(data);
  }

  static async decryptSensitiveData(encrypted: string): Promise<string> {
    return this.encryption.decrypt(encrypted);
  }

  static async hashPassword(password: string): Promise<string> {
    return this.encryption.hash(password);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.encryption.verify(password, hash);
  }

  static generateSecureToken(): string {
    return this.encryption.generateSecureToken();
  }
}
```

### 3. 速率限制

```typescript
import { RateLimiter, RateLimitStrategy } from '@yyc3/core-engine';

class RateLimitManager {
  private static limiter = new RateLimiter({
    maxRequests: 100,
    windowMs: 60000,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
  });

  static async checkRateLimit(identifier: string): Promise<boolean> {
    const result = await this.limiter.check(identifier);
    return result.allowed;
  }

  static async getRemainingRequests(identifier: string): Promise<number> {
    const result = await this.limiter.check(identifier);
    return result.remaining;
  }

  static async getResetTime(identifier: string): Promise<number> {
    const result = await this.limiter.check(identifier);
    return result.resetTime;
  }
}
```

---

## 📊 监控与日志

### 1. 日志管理

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

class Logger {
  private static formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  static debug(message: string, meta?: any): void {
    console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
  }

  static info(message: string, meta?: any): void {
    console.info(this.formatMessage(LogLevel.INFO, message, meta));
  }

  static warn(message: string, meta?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  static error(message: string, meta?: any): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, meta));
  }
}
```

### 2. 性能监控

```typescript
import { ResourceMonitor } from '@yyc3/model-adapter';

class PerformanceMonitor {
  private static monitor = new ResourceMonitor();

  static async startMonitoring(): Promise<void> {
    await this.monitor.start();
  }

  static async stopMonitoring(): Promise<void> {
    await this.monitor.stop();
  }

  static async getMetrics(): Promise<any> {
    return this.monitor.getMetrics();
  }

  static async measurePerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const result = await fn();
      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;

      Logger.info('性能指标', {
        name,
        duration: endTime - startTime,
        memoryUsed: endMemory - startMemory,
      });

      return result;
    } catch (error) {
      Logger.error('性能监控错误', { name, error });
      throw error;
    }
  }
}
```

---

## 🧪 测试策略

### 1. 单元测试

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

describe('AuthManager', () => {
  let authManager: AuthManager;

  beforeEach(() => {
    authManager = AuthManager.getInstance();
  });

  afterEach(() => {
    authManager.logout();
  });

  it('应该成功登录', async () => {
    await authManager.login('user@example.com', 'password');
    const token = await authManager.getToken();
    expect(token).toBeTruthy();
  });

  it('应该正确处理令牌过期', async () => {
    await authManager.login('user@example.com', 'password');
    const token1 = await authManager.getToken();
    const token2 = await authManager.getToken();
    expect(token1).toBe(token2);
  });
});
```

### 2. 集成测试

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

describe('API集成测试', () => {
  let apiClient: APIClient;
  let authToken: string;

  beforeAll(async () => {
    apiClient = new APIClient();
    const response = await apiClient.login('user@example.com', 'password');
    authToken = response.data.token;
  });

  afterAll(async () => {
    await apiClient.logout();
  });

  it('应该成功获取推理结果', async () => {
    const result = await apiClient.reason({
      context: '测试推理',
      constraints: [],
      objectives: [],
    });

    expect(result.success).toBe(true);
    expect(result.data.result).toBeDefined();
  });
});
```

---

## 📝 代码规范

### 1. TypeScript规范

```typescript
// ✅ 使用明确的类型
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ✅ 使用枚举
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// ✅ 使用泛型
class Repository<T> {
  private items: Map<string, T> = new Map();

  async save(id: string, item: T): Promise<void> {
    this.items.set(id, item);
  }

  async find(id: string): Promise<T | null> {
    return this.items.get(id) ?? null;
  }
}

// ✅ 使用async/await
async function fetchData(): Promise<User> {
  const response = await fetch('/api/user');
  const data = await response.json();
  return data;
}
```

### 2. 命名规范

```typescript
// ✅ 类名使用PascalCase
class UserManager {}

// ✅ 接口名使用PascalCase，以I开头
interface IUserManager {}

// ✅ 函数和变量使用camelCase
function getUserData() {}
const userName = 'John';

// ✅ 常量使用UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// ✅ 私有成员使用下划线前缀
class MyClass {
  private _privateField: string;
}
```

---

## 🚀 部署策略

### 1. 环境配置

```typescript
interface EnvironmentConfig {
  apiUrl: string;
  apiKey: string;
  maxRetries: number;
  timeout: number;
}

class ConfigManager {
  private static configs: Map<string, EnvironmentConfig> = new Map([
    [
      'development',
      {
        apiUrl: 'http://localhost:3200',
        apiKey: process.env.DEV_API_KEY || '',
        maxRetries: 3,
        timeout: 5000,
      },
    ],
    [
      'staging',
      {
        apiUrl: 'https://staging-api.yyc3.com',
        apiKey: process.env.STAGING_API_KEY || '',
        maxRetries: 3,
        timeout: 5000,
      },
    ],
    [
      'production',
      {
        apiUrl: 'https://api.yyc3.com',
        apiKey: process.env.PROD_API_KEY || '',
        maxRetries: 5,
        timeout: 10000,
      },
    ],
  ]);

  static getConfig(): EnvironmentConfig {
    const env = process.env.NODE_ENV || 'development';
    return this.configs.get(env) || this.configs.get('development')!;
  }
}
```

### 2. Docker部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3200

CMD ["node", "dist/index.js"]
```

---

## 📄 文档标尾 (Footer)

> 「**_YanYuCloudCube_**」
> 「**_<admin@0379.email>_**」
> 「**_Words Initiate Quadrants, Language Serves as Core for the Future_**」
> 「**_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**」
