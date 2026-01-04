/**
 * @fileoverview Liveness probe endpoint
 * @description Kubernetes liveness probe - checks if the app is running
 * @author YYC³ Team
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { liveness } from '@/lib/monitoring/health-check';
import { applySecurityHeadersToNextResponse } from '@/lib/security/headers';

/**
 * GET /api/health/live - Liveness probe
 */
export async function GET() {
  const live = liveness();

  const response = NextResponse.json(live, { status: 200 });
  return applySecurityHeadersToNextResponse(response);
}
