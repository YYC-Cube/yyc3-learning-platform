/**
 * @fileoverview Rate limiter for API endpoints
 * @description Prevents brute force attacks and API abuse
 * @author YYC³ Team
 * @version 1.0.0
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store (for production, use Redis)
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Key generator function (default: IP-based) */
  keyGenerator?: (request: Request) => string;
}

/**
 * Check if request should be rate limited
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired records
  if (record && now > record.resetTime) {
    rateLimitStore.delete(identifier);
  }

  const currentRecord = rateLimitStore.get(identifier) || {
    count: 0,
    resetTime: now + config.windowMs,
  };

  if (currentRecord.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentRecord.resetTime,
    };
  }

  currentRecord.count++;
  rateLimitStore.set(identifier, currentRecord);

  return {
    allowed: true,
    remaining: config.limit - currentRecord.count,
    resetTime: currentRecord.resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Try various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a default
  return 'unknown';
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  /** Strict rate limit for authentication endpoints */
  auth: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  /** Moderate rate limit for API endpoints */
  api: {
    limit: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  /** Lenient rate limit for public endpoints */
  public: {
    limit: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Create a rate limit response
 */
export function createRateLimitResponse(resetTime: number): Response {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  );
}
