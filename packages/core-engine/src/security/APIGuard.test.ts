import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { APIGuard } from './APIGuard';
import { RateLimitStrategy } from './RateLimiter';

describe('APIGuard', () => {
  let apiGuard: APIGuard;
  const defaultConfig = {
    jwtSecret: 'test-secret-key-for-testing',
    tokenExpiry: 3600000
  };

  beforeEach(() => {
    apiGuard = new APIGuard(defaultConfig);
  });

  afterEach(() => {
    apiGuard.destroy();
  });

  describe('constructor', () => {
    it('should create an API guard with default configuration', () => {
      expect(apiGuard).toBeDefined();
    });

    it('should create an API guard with custom configuration', () => {
      const customGuard = new APIGuard({
        jwtSecret: 'custom-secret',
        enableRateLimiting: false,
        enableAuthentication: false
      });
      expect(customGuard).toBeDefined();
      customGuard.destroy();
    });
  });

  describe('registerRoute', () => {
    it('should register a route configuration', () => {
      apiGuard.registerRoute({
        path: '/api/test',
        method: 'GET',
        requireAuth: true,
        requiredRoles: ['admin']
      });

      const result = await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: {},
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Missing authorization header');
    });
  });

  describe('unregisterRoute', () => {
    it('should unregister a route', () => {
      apiGuard.registerRoute({
        path: '/api/test',
        method: 'GET',
        requireAuth: true
      });

      apiGuard.unregisterRoute('GET', '/api/test');

      const result = await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: {},
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(true);
    });
  });

  describe('guard', () => {
    it('should allow request without authentication when disabled', async () => {
      const noAuthGuard = new APIGuard({
        ...defaultConfig,
        enableAuthentication: false
      });

      const result = await noAuthGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: {},
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(true);

      noAuthGuard.destroy();
    });

    it('should reject request with blacklisted IP', async () => {
      apiGuard.addIPToBlacklist('192.168.1.1');

      const result = await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: {},
        ip: '192.168.1.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('IP address is blacklisted');
      expect(result.statusCode).toBe(403);
    });

    it('should reject request not in whitelist when whitelist enabled', async () => {
      const whitelistGuard = new APIGuard({
        ...defaultConfig,
        enableIPWhitelist: true,
        ipWhitelist: ['192.168.1.1']
      });

      const result = await whitelistGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: {},
        ip: '192.168.1.2',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('IP address is not whitelisted');

      whitelistGuard.destroy();
    });

    it('should allow request from whitelisted IP', async () => {
      const whitelistGuard = new APIGuard({
        ...defaultConfig,
        enableIPWhitelist: true,
        ipWhitelist: ['192.168.1.1']
      });

      const result = await whitelistGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: {},
        ip: '192.168.1.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(true);

      whitelistGuard.destroy();
    });

    it('should reject request with missing authorization header', async () => {
      const result = await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: {},
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Missing authorization header');
      expect(result.statusCode).toBe(401);
    });

    it('should reject request with invalid authorization header format', async () => {
      const result = await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: { authorization: 'InvalidFormat token123' },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Invalid authorization header format');
    });

    it('should allow request with valid token', async () => {
      const token = apiGuard.generateToken('user123', ['user'], ['read']);

      const result = await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: { authorization: `Bearer ${token}` },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(true);
    });

    it('should reject request with invalid token', async () => {
      const result = await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: { authorization: 'Bearer invalid-token' },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(false);
      expect(result.statusCode).toBe(401);
    });

    it('should enforce role-based authorization', async () => {
      apiGuard.registerRoute({
        path: '/api/admin',
        method: 'GET',
        requireAuth: true,
        requiredRoles: ['admin']
      });

      const userToken = apiGuard.generateToken('user123', ['user'], ['read']);

      const result = await apiGuard.guard({
        method: 'GET',
        path: '/api/admin',
        headers: { authorization: `Bearer ${userToken}` },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Insufficient role permissions');
    });

    it('should allow request with required role', async () => {
      apiGuard.registerRoute({
        path: '/api/admin',
        method: 'GET',
        requireAuth: true,
        requiredRoles: ['admin']
      });

      const adminToken = apiGuard.generateToken('admin123', ['admin'], ['read', 'write']);

      const result = await apiGuard.guard({
        method: 'GET',
        path: '/api/admin',
        headers: { authorization: `Bearer ${adminToken}` },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(true);
    });

    it('should enforce permission-based authorization', async () => {
      apiGuard.registerRoute({
        path: '/api/write',
        method: 'POST',
        requireAuth: true,
        requiredPermissions: ['write']
      });

      const readToken = apiGuard.generateToken('user123', ['user'], ['read']);

      const result = await apiGuard.guard({
        method: 'POST',
        path: '/api/write',
        headers: { authorization: `Bearer ${readToken}` },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Insufficient permissions');
    });

    it('should allow request with required permission', async () => {
      apiGuard.registerRoute({
        path: '/api/write',
        method: 'POST',
        requireAuth: true,
        requiredPermissions: ['write']
      });

      const writeToken = apiGuard.generateToken('user123', ['user'], ['read', 'write']);

      const result = await apiGuard.guard({
        method: 'POST',
        path: '/api/write',
        headers: { authorization: `Bearer ${writeToken}` },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(true);
    });

    it('should validate input when configured', async () => {
      apiGuard.registerRoute({
        path: '/api/users',
        method: 'POST',
        inputValidation: {
          body: {
            name: { type: 'string', required: true },
            email: { type: 'email', required: true }
          }
        }
      });

      const token = apiGuard.generateToken('user123', ['user'], ['write']);

      const result = await apiGuard.guard({
        method: 'POST',
        path: '/api/users',
        headers: { authorization: `Bearer ${token}` },
        body: { name: '', email: 'invalid-email' },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.body?.errors).toBeDefined();
    });

    it('should allow valid input', async () => {
      apiGuard.registerRoute({
        path: '/api/users',
        method: 'POST',
        inputValidation: {
          body: {
            name: { type: 'string', required: true },
            email: { type: 'email', required: true }
          }
        }
      });

      const token = apiGuard.generateToken('user123', ['user'], ['write']);

      const result = await apiGuard.guard({
        method: 'POST',
        path: '/api/users',
        headers: { authorization: `Bearer ${token}` },
        body: { name: 'John Doe', email: 'john@example.com' },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(result.allowed).toBe(true);
    });

    it('should enforce rate limiting', async () => {
      const rateLimitedGuard = new APIGuard({
        ...defaultConfig,
        enableAuthentication: false,
        rateLimitConfig: {
          windowMs: 60000,
          maxRequests: 5,
          strategy: RateLimitStrategy.SLIDING_WINDOW
        }
      });

      const request = {
        method: 'GET',
        path: '/api/test',
        headers: {},
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      };

      for (let i = 0; i < 5; i++) {
        const result = await rateLimitedGuard.guard(request);
        expect(result.allowed).toBe(true);
      }

      const blockedResult = await rateLimitedGuard.guard(request);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.statusCode).toBe(429);
      expect(blockedResult.headers?.['Retry-After']).toBeDefined();

      rateLimitedGuard.destroy();
    });
  });

  describe('generateToken', () => {
    it('should generate a valid token', () => {
      const token = apiGuard.generateToken('user123', ['user'], ['read']);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate token with custom roles and permissions', () => {
      const token = apiGuard.generateToken('admin123', ['admin', 'user'], ['read', 'write', 'delete']);
      expect(token).toBeDefined();
    });
  });

  describe('IP whitelist/blacklist', () => {
    it('should add IP to whitelist', () => {
      apiGuard.addIPToWhitelist('192.168.1.1');
      expect(apiGuard['ipWhitelist'].has('192.168.1.1')).toBe(true);
    });

    it('should remove IP from whitelist', () => {
      apiGuard.addIPToWhitelist('192.168.1.1');
      apiGuard.removeIPFromWhitelist('192.168.1.1');
      expect(apiGuard['ipWhitelist'].has('192.168.1.1')).toBe(false);
    });

    it('should add IP to blacklist', () => {
      apiGuard.addIPToBlacklist('192.168.1.1');
      expect(apiGuard['ipBlacklist'].has('192.168.1.1')).toBe(true);
    });

    it('should remove IP from blacklist', () => {
      apiGuard.addIPToBlacklist('192.168.1.1');
      apiGuard.removeIPFromBlacklist('192.168.1.1');
      expect(apiGuard['ipBlacklist'].has('192.168.1.1')).toBe(false);
    });
  });

  describe('getSecurityEvents', () => {
    it('should return security events', async () => {
      const token = apiGuard.generateToken('user123', ['user'], ['read']);

      await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: { authorization: `Bearer ${token}` },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      const events = await apiGuard.getSecurityEvents();
      expect(events.length).toBeGreaterThan(0);
    });

    it('should return limited security events', async () => {
      const token = apiGuard.generateToken('user123', ['user'], ['read']);

      await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: { authorization: `Bearer ${token}` },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      const events = await apiGuard.getSecurityEvents(1);
      expect(events.length).toBe(1);
    });
  });

  describe('getSecurityStats', () => {
    it('should return security statistics', async () => {
      const stats = await apiGuard.getSecurityStats();

      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('authSuccess');
      expect(stats).toHaveProperty('authFailure');
      expect(stats).toHaveProperty('authzSuccess');
      expect(stats).toHaveProperty('authzFailure');
      expect(stats).toHaveProperty('rateLimitExceeded');
      expect(stats).toHaveProperty('invalidInput');
      expect(stats).toHaveProperty('securityViolations');
    });

    it('should track authentication success', async () => {
      const token = apiGuard.generateToken('user123', ['user'], ['read']);

      await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: { authorization: `Bearer ${token}` },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      const stats = await apiGuard.getSecurityStats();
      expect(stats.authSuccess).toBeGreaterThan(0);
    });

    it('should track authentication failure', async () => {
      await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: {},
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      const stats = await apiGuard.getSecurityStats();
      expect(stats.authFailure).toBeGreaterThan(0);
    });
  });

  describe('clearSecurityEvents', () => {
    it('should clear security events', async () => {
      const token = apiGuard.generateToken('user123', ['user'], ['read']);

      await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: { authorization: `Bearer ${token}` },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      await apiGuard.clearSecurityEvents();

      const events = await apiGuard.getSecurityEvents();
      expect(events.length).toBe(0);
    });
  });

  describe('getRateLimitStats', () => {
    it('should return rate limit statistics', async () => {
      const stats = await apiGuard.getRateLimitStats();

      expect(stats).toHaveProperty('totalRequests');
      expect(stats).toHaveProperty('blockedRequests');
      expect(stats).toHaveProperty('allowedRequests');
      expect(stats).toHaveProperty('topViolators');
      expect(stats).toHaveProperty('averageRequestsPerWindow');
    });
  });

  describe('events', () => {
    it('should emit security:event', async () => {
      const handler = jest.fn();
      apiGuard.on('security:event', handler);

      const token = apiGuard.generateToken('user123', ['user'], ['read']);

      await apiGuard.guard({
        method: 'GET',
        path: '/api/test',
        headers: { authorization: `Bearer ${token}` },
        ip: '127.0.0.1',
        userAgent: 'test',
        timestamp: Date.now(),
        requestId: 'test-123'
      });

      expect(handler).toHaveBeenCalled();
    });

    it('should emit route:registered', () => {
      const handler = jest.fn();
      apiGuard.on('route:registered', handler);

      apiGuard.registerRoute({
        path: '/api/test',
        method: 'GET',
        requireAuth: true
      });

      expect(handler).toHaveBeenCalled();
    });

    it('should emit route:unregistered', () => {
      const handler = jest.fn();
      apiGuard.on('route:unregistered', handler);

      apiGuard.unregisterRoute('GET', '/api/test');

      expect(handler).toHaveBeenCalled();
    });
  });
});
