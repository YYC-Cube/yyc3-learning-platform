/**
 * @fileoverview Readiness probe endpoint
 * @description Kubernetes readiness probe - checks if the app is ready to serve traffic
 * @author YYC³ Team
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { readiness } from '@/lib/monitoring/health-check';
import { applySecurityHeadersToNextResponse } from '@/lib/security/headers';

/**
 * GET /api/health/ready - Readiness probe
 */
export async function GET() {
  const ready = await readiness();

  const statusCode = ready.status === 'ready' ? 200 : 503;

  const response = NextResponse.json(ready, { status: statusCode });
  return applySecurityHeadersToNextResponse(response);
}
