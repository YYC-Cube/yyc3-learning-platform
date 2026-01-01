/**
 * @fileoverview 性能监控API端点
 * @description 接收并处理前端发送的性能指标数据
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventDispatcher, eventDispatcher } from '@/packages/core-engine/src/EventDispatcher';
import { logger } from '@/lib/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const metric: PerformanceMetric = await req.json();

    // 验证数据
    if (!metric.name || !metric.value || !metric.timestamp) {
      return NextResponse.json(
        { error: '缺少必需的性能指标字段' },
        { status: 400 }
      );
    }

    // 发布性能指标事件
    await eventDispatcher.publish('performance:metric:recorded', metric, {
      source: 'api-gateway',
      metadata: {
        correlationId: req.headers.get('x-correlation-id') || `perf_${Date.now()}`,
        timestamp: Date.now(),
      },
    });

    // 响应成功
    return NextResponse.json(
      { success: true, message: '性能指标已记录' },
      { status: 201 }
    );
  } catch (error) {
    logger.error('处理性能指标失败:', error);
    
    return NextResponse.json(
      { error: '处理性能指标失败' },
      { status: 500 }
    );
  }
}

// 健康检查
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'performance-monitoring',
    timestamp: Date.now(),
  });
}