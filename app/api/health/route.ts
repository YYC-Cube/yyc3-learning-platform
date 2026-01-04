/**
 * @fileoverview Health check API endpoint
 * @description Provides detailed health status of the application
 * @author YYC³ Team
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { performHealthCheck, liveness, readiness } from '@/lib/monitoring/health-check';
import { applySecurityHeadersToNextResponse } from '@/lib/security/headers';

/**
 * GET /api/health - Detailed health check
 */
export async function GET() {
  const health = await performHealthCheck();

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  const response = NextResponse.json(health, { status: statusCode });
  return applySecurityHeadersToNextResponse(response);
}
