/**
 * @fileoverview Metrics API endpoint
 * @description Exposes application metrics in Prometheus format
 * @author YYC³ Team
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { formatPrometheusMetrics, getAllMetrics, getAllCounters, getSystemMetrics } from '@/lib/monitoring/metrics';
import { applySecurityHeadersToNextResponse } from '@/lib/security/headers';

/**
 * GET /api/metrics - Prometheus metrics endpoint
 */
export async function GET(request: Request) {
  const acceptHeader = request.headers.get('accept');

  // Return Prometheus format if requested
  if (acceptHeader?.includes('text/plain')) {
    const prometheusMetrics = formatPrometheusMetrics();

    const response = new NextResponse(prometheusMetrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });

    return applySecurityHeadersToNextResponse(response);
  }

  // Otherwise return JSON format
  const metrics = {
    system: getSystemMetrics(),
    counters: getAllCounters(),
    recentMetrics: getAllMetrics(),
    timestamp: Date.now(),
  };

  const response = NextResponse.json(metrics, { status: 200 });
  return applySecurityHeadersToNextResponse(response);
}
