/**
 * @fileoverview 性能数据API端点
 * @description 接收和返回性能监控数据
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-31
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server'
import { performanceDataStore } from '@/lib/performance-data-store'
import { performanceAlertManager } from '@/lib/performance-alerts'
import type { PerformanceMetric } from '@/lib/performance.config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { metrics, url, userId, sessionId } = body

    if (!metrics || !Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      )
    }

    const performanceMetrics: PerformanceMetric[] = metrics.map((m: any) => ({
      name: m.name,
      value: m.value,
      threshold: m.threshold,
      unit: m.unit,
      status: m.status || 'pass',
      timestamp: m.timestamp || Date.now(),
    }))

    const dataId = performanceDataStore.storePerformanceData(performanceMetrics, {
      url,
      userId,
      sessionId,
    })

    performanceMetrics.forEach(metric => {
      performanceAlertManager.checkMetric(metric)
    })

    return NextResponse.json({
      success: true,
      dataId,
      message: 'Performance data stored successfully',
    })
  } catch (error) {
    console.error('Error storing performance data:', error)
    return NextResponse.json(
      { error: 'Failed to store performance data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const url = searchParams.get('url')
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')
    const metricName = searchParams.get('metricName')
    const limit = searchParams.get('limit')
    const aggregate = searchParams.get('aggregate')
    const period = searchParams.get('period') as 'hour' | 'day' | 'week' | 'month' | undefined

    const query: any = {}
    if (startDate) query.startDate = parseInt(startDate)
    if (endDate) query.endDate = parseInt(endDate)
    if (url) query.url = url
    if (userId) query.userId = userId
    if (sessionId) query.sessionId = sessionId
    if (metricName) query.metricName = metricName
    if (limit) query.limit = parseInt(limit)

    if (aggregate && metricName && period) {
      const aggregation = performanceDataStore.aggregatePerformanceMetrics(
        metricName,
        period,
        query
      )

      return NextResponse.json({
        success: true,
        data: aggregation,
      })
    }

    const data = performanceDataStore.queryPerformanceData(query)

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    })
  } catch (error) {
    console.error('Error retrieving performance data:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve performance data' },
      { status: 500 }
    )
  }
}
