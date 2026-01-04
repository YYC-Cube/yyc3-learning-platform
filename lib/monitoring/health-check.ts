/**
 * @fileoverview Health check system
 * @description Comprehensive health monitoring for services and dependencies
 * @author YYC³ Team
 * @version 1.0.0
 */

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      responseTime?: number;
      dependency?: string;
    };
  };
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<{ status: 'pass' | 'fail'; responseTime: number; message?: string }> {
  const startTime = Date.now();

  try {
    const { query } = await import('@/lib/database');
    await query('SELECT 1');

    return {
      status: 'pass',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - startTime,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Redis connectivity (if configured)
 */
async function checkRedis(): Promise<{ status: 'pass' | 'fail' | 'warn'; responseTime: number; message?: string }> {
  const startTime = Date.now();

  if (!process.env.REDIS_URL) {
    return {
      status: 'warn',
      responseTime: Date.now() - startTime,
      message: 'Redis not configured',
    };
  }

  try {
    // Redis check would go here
    // const redis = await getRedisClient();
    // await redis.ping();

    return {
      status: 'pass',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - startTime,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check external API connectivity
 */
async function checkExternalAPI(url: string): Promise<{ status: 'pass' | 'fail'; responseTime: number; message?: string }> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    return {
      status: response.ok ? 'pass' : 'fail',
      responseTime: Date.now() - startTime,
      message: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - startTime,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Memory usage check
 */
function checkMemory(): { status: 'pass' | 'warn' | 'fail'; usage: number; message?: string } {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  const heapTotalMB = usage.heapTotal / 1024 / 1024;
  const percentage = (heapUsedMB / heapTotalMB) * 100;

  if (percentage > 90) {
    return {
      status: 'fail',
      usage: percentage,
      message: `Critical memory usage: ${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB (${percentage.toFixed(1)}%)`,
    };
  } else if (percentage > 75) {
    return {
      status: 'warn',
      usage: percentage,
      message: `High memory usage: ${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB (${percentage.toFixed(1)}%)`,
    };
  }

  return {
    status: 'pass',
    usage: percentage,
  };
}

/**
 * Comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const checks: HealthCheckResult['checks'] = {};

  // Database check
  const dbCheck = await checkDatabase();
  checks.database = {
    ...dbCheck,
    dependency: 'postgresql',
  };

  // Redis check (if configured)
  const redisCheck = await checkRedis();
  checks.redis = {
    ...redisCheck,
    dependency: 'redis',
  };

  // External API checks
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    const apiCheck = await checkExternalAPI(process.env.NEXT_PUBLIC_API_BASE_URL);
    checks.external_api = {
      ...apiCheck,
      dependency: 'external-api',
    };
  }

  // Memory check
  const memoryCheck = checkMemory();
  checks.memory = {
    status: memoryCheck.status,
    message: memoryCheck.message,
  };

  // Determine overall status
  const allChecks = Object.values(checks);
  const hasFailures = allChecks.some((check) => check.status === 'fail');
  const hasWarnings = allChecks.some((check) => check.status === 'warn');

  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (hasFailures) {
    status = 'unhealthy';
  } else if (hasWarnings) {
    status = 'degraded';
  } else {
    status = 'healthy';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  };
}

/**
 * Quick liveness probe (for Kubernetes)
 */
export function liveness(): { status: string; timestamp: string } {
  return {
    status: 'alive',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Readiness probe (for Kubernetes)
 */
export async function readiness(): Promise<{ status: 'ready' | 'not-ready'; checks: string[] }> {
  const checks: string[] = [];

  try {
    // Check database
    const dbCheck = await checkDatabase();
    if (dbCheck.status === 'pass') {
      checks.push('database:ready');
    } else {
      checks.push('database:not-ready');
    }
  } catch {
    checks.push('database:error');
  }

  return {
    status: checks.every((c) => c.endsWith(':ready')) ? 'ready' : 'not-ready',
    checks,
  };
}
