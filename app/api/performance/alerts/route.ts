/**
 * @fileoverview 性能告警API端点
 * @description 管理性能告警
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-31
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server'
import { performanceAlertManager } from '@/lib/performance-alerts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'critical' | 'warning' | 'info' | undefined
    const acknowledged = searchParams.get('acknowledged')
    const limit = searchParams.get('limit')

    const options: any = {}
    if (type) options.type = type
    if (acknowledged !== null) options.acknowledged = acknowledged === 'true'
    if (limit) options.limit = parseInt(limit)

    const alerts = performanceAlertManager.getAlerts(options)
    const stats = performanceAlertManager.getAlertStats()

    return NextResponse.json({
      success: true,
      alerts,
      stats,
    })
  } catch (error) {
    console.error('Error retrieving alerts:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, alertId, rule, channel } = body

    if (action === 'acknowledge' && alertId) {
      performanceAlertManager.acknowledgeAlert(alertId)
      return NextResponse.json({
        success: true,
        message: 'Alert acknowledged successfully',
      })
    }

    if (action === 'addRule' && rule) {
      performanceAlertManager.addRule(rule)
      return NextResponse.json({
        success: true,
        message: 'Alert rule added successfully',
      })
    }

    if (action === 'removeRule' && rule?.metric) {
      performanceAlertManager.removeRule(rule.metric)
      return NextResponse.json({
        success: true,
        message: 'Alert rule removed successfully',
      })
    }

    if (action === 'addChannel' && channel) {
      performanceAlertManager.addChannel(channel)
      return NextResponse.json({
        success: true,
        message: 'Notification channel added successfully',
      })
    }

    if (action === 'removeChannel' && channel?.type) {
      performanceAlertManager.removeChannel(channel.type)
      return NextResponse.json({
        success: true,
        message: 'Notification channel removed successfully',
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing alerts:', error)
    return NextResponse.json(
      { error: 'Failed to manage alerts' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'clear') {
      performanceAlertManager.clearAlerts()
      return NextResponse.json({
        success: true,
        message: 'All alerts cleared successfully',
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error clearing alerts:', error)
    return NextResponse.json(
      { error: 'Failed to clear alerts' },
      { status: 500 }
    )
  }
}
