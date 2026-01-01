import { EventEmitter } from 'eventemitter3';
import { RateLimiter, RateLimitStrategy } from './RateLimiter';
import { ValidationUtility } from '../utils/ValidationUtility';
import { EncryptionUtility } from '../utils/EncryptionUtility';

export interface APIGuardConfig {
  enableRateLimiting: boolean;
  enableAuthentication: boolean;
  enableAuthorization: boolean;
  enableInputValidation: boolean;
  enableRequestSigning: boolean;
  enableIPWhitelist: boolean;
  enableIPBlacklist: boolean;
  rateLimitConfig?: {
    windowMs: number;
    maxRequests: number;
    strategy?: RateLimitStrategy;
  };
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  jwtSecret?: string;
  tokenExpiry?: number;
}

export interface APIRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
  ip: string;
  userAgent: string;
  timestamp: number;
  requestId: string;
}

export interface APIResponse {
  status: number;
  headers: Record<string, string>;
  body?: any;
}

export interface APIGuardResult {
  allowed: boolean;
  reason?: string;
  statusCode?: number;
  headers?: Record<string, string>;
  body?: any;
  rateLimitInfo?: {
    limit: number;
    remaining: number;
    reset: Date;
  };
}

export interface AuthContext {
  userId?: string;
  roles?: string[];
  permissions?: string[];
  token?: string;
  isAuthenticated: boolean;
}

export interface RouteConfig {
  path: string;
  method: string;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  rateLimitOverride?: {
    windowMs: number;
    maxRequests: number;
  };
  inputValidation?: {
    body?: any;
    query?: any;
  };
}

export interface SecurityEvent {
  type: 'auth_success' | 'auth_failure' | 'authz_success' | 'authz_failure' | 'rate_limit_exceeded' | 'invalid_input' | 'security_violation';
  timestamp: Date;
  request: APIRequest;
  userId?: string;
  details?: any;
}

export class APIGuard extends EventEmitter {
  private config: Required<APIGuardConfig>;
  private rateLimiter: RateLimiter;
  private routeConfigs: Map<string, RouteConfig> = new Map();
  private ipWhitelist: Set<string> = new Set();
  private ipBlacklist: Set<string> = new Set();
  private validation: ValidationUtility;
  private encryption: EncryptionUtility;
  private securityEvents: SecurityEvent[] = [];
  private maxEventHistory: number = 1000;

  constructor(config: Partial<APIGuardConfig> = {}) {
    super();

    const jwtSecret = config.jwtSecret || process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET must be provided in config or environment variables');
    }

    this.config = {
      enableRateLimiting: config.enableRateLimiting ?? true,
      enableAuthentication: config.enableAuthentication ?? true,
      enableAuthorization: config.enableAuthorization ?? true,
      enableInputValidation: config.enableInputValidation ?? true,
      enableRequestSigning: config.enableRequestSigning ?? false,
      enableIPWhitelist: config.enableIPWhitelist ?? false,
      enableIPBlacklist: config.enableIPBlacklist ?? false,
      rateLimitConfig: config.rateLimitConfig || {
        windowMs: 60000,
        maxRequests: 100,
        strategy: RateLimitStrategy.SLIDING_WINDOW
      },
      ipWhitelist: config.ipWhitelist || [],
      ipBlacklist: config.ipBlacklist || [],
      jwtSecret: jwtSecret,
      tokenExpiry: config.tokenExpiry || 3600000
    };

    this.rateLimiter = new RateLimiter(
      this.config.rateLimitConfig!,
      this.config.rateLimitConfig!.strategy
    );

    this.validation = ValidationUtility.getInstance();
    this.encryption = EncryptionUtility.getInstance({
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16
    });

    this.ipWhitelist = new Set(this.config.ipWhitelist);
    this.ipBlacklist = new Set(this.config.ipBlacklist);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.rateLimiter.on('rateLimit:exceeded', (data) => {
      this.recordSecurityEvent({
        type: 'rate_limit_exceeded',
        timestamp: new Date(),
        request: data.limit as any,
        details: { identifier: data.identifier }
      });
    });
  }

  private recordSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);

    if (this.securityEvents.length > this.maxEventHistory) {
      this.securityEvents.shift();
    }

    this.emit('security:event', event);
  }

  private getRouteKey(method: string, path: string): string {
    return `${method}:${path}`;
  }

  registerRoute(config: RouteConfig): void {
    const key = this.getRouteKey(config.method, config.path);
    this.routeConfigs.set(key, config);
    this.emit('route:registered', config);
  }

  unregisterRoute(method: string, path: string): void {
    const key = this.getRouteKey(method, path);
    this.routeConfigs.delete(key);
    this.emit('route:unregistered', { method, path });
  }

  async guard(request: APIRequest): Promise<APIGuardResult> {
    try {
      const routeKey = this.getRouteKey(request.method, request.path);
      const routeConfig = this.routeConfigs.get(routeKey);

      if (this.config.enableIPBlacklist && this.ipBlacklist.has(request.ip)) {
        return {
          allowed: false,
          reason: 'IP address is blacklisted',
          statusCode: 403
        };
      }

      if (this.config.enableIPWhitelist && this.ipWhitelist.size > 0 && !this.ipWhitelist.has(request.ip)) {
        return {
          allowed: false,
          reason: 'IP address is not whitelisted',
          statusCode: 403
        };
      }

      if (this.config.enableRateLimiting) {
        const rateLimitConfig = routeConfig?.rateLimitOverride || this.config.rateLimitConfig;
        const identifier = this.getRateLimitIdentifier(request);

        if (rateLimitConfig) {
          const rateLimiter = routeConfig?.rateLimitOverride 
            ? new RateLimiter(rateLimitConfig, (rateLimitConfig as any).strategy || RateLimitStrategy.SLIDING_WINDOW)
            : this.rateLimiter;

          const rateLimitResult = await rateLimiter.check(identifier);

          if (!rateLimitResult.allowed) {
            return {
              allowed: false,
              reason: 'Rate limit exceeded',
              statusCode: 429,
              headers: {
                'Retry-After': String(rateLimitResult.retryAfter),
                'X-RateLimit-Limit': String(rateLimitResult.limit),
                'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                'X-RateLimit-Reset': rateLimitResult.reset.toISOString()
              },
              rateLimitInfo: rateLimitResult
            };
          }

          if (routeConfig?.rateLimitOverride) {
            (rateLimiter as RateLimiter).destroy();
          }
        }
      }

      let authContext: AuthContext = {
        isAuthenticated: false
      };

      if (this.config.enableAuthentication) {
        const authResult = await this.authenticate(request);
        if (!authResult.success) {
          this.recordSecurityEvent({
            type: 'auth_failure',
            timestamp: new Date(),
            request,
            details: { reason: authResult.reason }
          });
          return {
            allowed: false,
            reason: authResult.reason,
            statusCode: 401
          };
        }
        authContext = authResult.context!;

        this.recordSecurityEvent({
          type: 'auth_success',
          timestamp: new Date(),
          request,
          userId: authContext.userId
        });
      }

      if (this.config.enableAuthorization) {
        const authzResult = await this.authorize(request, authContext, routeConfig);
        if (!authzResult.allowed) {
          this.recordSecurityEvent({
            type: 'authz_failure',
            timestamp: new Date(),
            request,
            userId: authContext.userId,
            details: { reason: authzResult.reason }
          });
          return {
            allowed: false,
            reason: authzResult.reason,
            statusCode: 403
          };
        }

        this.recordSecurityEvent({
          type: 'authz_success',
          timestamp: new Date(),
          request,
          userId: authContext.userId
        });
      }

      if (this.config.enableInputValidation && routeConfig?.inputValidation) {
        const validationResult = await this.validateInput(request, routeConfig.inputValidation);
        if (!validationResult.valid) {
          this.recordSecurityEvent({
            type: 'invalid_input',
            timestamp: new Date(),
            request,
            userId: authContext.userId,
            details: { errors: validationResult.errors }
          });
          return {
            allowed: false,
            reason: 'Invalid input',
            statusCode: 400,
            body: { errors: validationResult.errors }
          };
        }
      }

      if (this.config.enableRequestSigning) {
        const signatureValid = await this.verifyRequestSignature(request);
        if (!signatureValid) {
          return {
            allowed: false,
            reason: 'Invalid request signature',
            statusCode: 401
          };
        }
      }

      return {
        allowed: true
      };

    } catch (error) {
      this.recordSecurityEvent({
        type: 'security_violation',
        timestamp: new Date(),
        request,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return {
        allowed: false,
        reason: 'Internal security error',
        statusCode: 500
      };
    }
  }

  private getRateLimitIdentifier(request: APIRequest): string {
    const token = request.headers['authorization']?.replace('Bearer ', '');
    return token || request.ip;
  }

  private async authenticate(request: APIRequest): Promise<{ success: boolean; reason?: string; context?: AuthContext }> {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      return { success: false, reason: 'Missing authorization header' };
    }

    if (!authHeader.startsWith('Bearer ')) {
      return { success: false, reason: 'Invalid authorization header format' };
    }

    const token = authHeader.substring(7);

    try {
      const verificationResult = this.encryption.verifyJWT(token, this.config.jwtSecret);

      if (!verificationResult.valid) {
        return { success: false, reason: verificationResult.error || 'Invalid token' };
      }

      const payload = verificationResult.payload;

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return { success: false, reason: 'Token expired' };
      }

      const context: AuthContext = {
        userId: payload.userId,
        roles: payload.roles || [],
        permissions: payload.permissions || [],
        token,
        isAuthenticated: true
      };

      return { success: true, context };

    } catch (error) {
      return { success: false, reason: 'Token verification failed' };
    }
  }

  private async authorize(request: APIRequest, authContext: AuthContext, routeConfig?: RouteConfig): Promise<{ allowed: boolean; reason?: string }> {
    if (!routeConfig?.requireAuth) {
      return { allowed: true };
    }

    if (!authContext.isAuthenticated) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (routeConfig.requiredRoles && routeConfig.requiredRoles.length > 0) {
      const hasRequiredRole = routeConfig.requiredRoles.some(role => 
        authContext.roles?.includes(role)
      );

      if (!hasRequiredRole) {
        return { allowed: false, reason: 'Insufficient role permissions' };
      }
    }

    if (routeConfig.requiredPermissions && routeConfig.requiredPermissions.length > 0) {
      const hasRequiredPermission = routeConfig.requiredPermissions.some(permission =>
        authContext.permissions?.includes(permission)
      );

      if (!hasRequiredPermission) {
        return { allowed: false, reason: 'Insufficient permissions' };
      }
    }

    return { allowed: true };
  }

  private async validateInput(request: APIRequest, validationConfig: any): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];

    if (validationConfig.body && request.body) {
      const bodyValidation = this.validation.validateObject(request.body, validationConfig.body);
      if (!bodyValidation.isValid) {
        errors.push(...bodyValidation.errors);
      }
    }

    if (validationConfig.query && request.query) {
      const queryValidation = this.validation.validateObject(request.query, validationConfig.query);
      if (!queryValidation.isValid) {
        errors.push(...queryValidation.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private async verifyRequestSignature(request: APIRequest): Promise<boolean> {
    const signature = request.headers['x-signature'];
    const timestamp = request.headers['x-timestamp'];
    const body = JSON.stringify(request.body);

    if (!signature || !timestamp) {
      return false;
    }

    const timestampNum = parseInt(timestamp, 10);
    const now = Date.now();

    if (Math.abs(now - timestampNum) > 300000) {
      return false;
    }

    const expectedSignature = this.encryption.generateHMAC(
      `${request.method}:${request.path}:${timestamp}:${body}`,
      this.config.jwtSecret
    );

    return signature === expectedSignature;
  }

  generateToken(userId: string, roles: string[] = [], permissions: string[] = []): string {
    const payload = {
      userId,
      roles,
      permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + this.config.tokenExpiry) / 1000)
    };

    return this.encryption.generateJWT(payload, this.config.jwtSecret);
  }

  addIPToWhitelist(ip: string): void {
    this.ipWhitelist.add(ip);
    this.emit('ip:whitelist:added', { ip });
  }

  removeIPFromWhitelist(ip: string): void {
    this.ipWhitelist.delete(ip);
    this.emit('ip:whitelist:removed', { ip });
  }

  addIPToBlacklist(ip: string): void {
    this.ipBlacklist.add(ip);
    this.emit('ip:blacklist:added', { ip });
  }

  removeIPFromBlacklist(ip: string): void {
    this.ipBlacklist.delete(ip);
    this.emit('ip:blacklist:removed', { ip });
  }

  async getSecurityEvents(limit?: number): Promise<SecurityEvent[]> {
    return limit 
      ? this.securityEvents.slice(-limit)
      : [...this.securityEvents];
  }

  async getSecurityStats(): Promise<{
    totalEvents: number;
    authSuccess: number;
    authFailure: number;
    authzSuccess: number;
    authzFailure: number;
    rateLimitExceeded: number;
    invalidInput: number;
    securityViolations: number;
  }> {
    return {
      totalEvents: this.securityEvents.length,
      authSuccess: this.securityEvents.filter(e => e.type === 'auth_success').length,
      authFailure: this.securityEvents.filter(e => e.type === 'auth_failure').length,
      authzSuccess: this.securityEvents.filter(e => e.type === 'authz_success').length,
      authzFailure: this.securityEvents.filter(e => e.type === 'authz_failure').length,
      rateLimitExceeded: this.securityEvents.filter(e => e.type === 'rate_limit_exceeded').length,
      invalidInput: this.securityEvents.filter(e => e.type === 'invalid_input').length,
      securityViolations: this.securityEvents.filter(e => e.type === 'security_violation').length
    };
  }

  async clearSecurityEvents(): Promise<void> {
    this.securityEvents = [];
    this.emit('security:events:cleared');
  }

  async getRateLimitStats() {
    return this.rateLimiter.getStats();
  }

  destroy(): void {
    this.rateLimiter.destroy();
    this.routeConfigs.clear();
    this.ipWhitelist.clear();
    this.ipBlacklist.clear();
    this.securityEvents = [];
    this.removeAllListeners();
  }
}
